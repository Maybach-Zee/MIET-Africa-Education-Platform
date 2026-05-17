const pool = require('../config/db');
const { logAction } = require('../utils/auditLogger');

exports.getAll = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT e.*, l.first_name || ' ' || l.last_name AS learner_name, c.title AS course_title
       FROM enrolments e
       JOIN learners l ON e.learner_id = l.learner_id
       JOIN courses c ON e.course_id = c.course_id
       ORDER BY e.enrol_date DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  const { learner_id, course_id, enrol_date } = req.body;
  try {
    // Optional: manual check before insert to give a friendlier error
    const existing = await pool.query(
      'SELECT 1 FROM enrolments WHERE learner_id = $1 AND course_id = $2',
      [learner_id, course_id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Learner is already enrolled in this course.' });
    }

    const { rows: [enrolment] } = await pool.query(
      `INSERT INTO enrolments (learner_id, course_id, enrol_date, created_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [learner_id, course_id, enrol_date || new Date(), req.user.id]
    );

    await logAction({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'CREATE',
      entityType: 'enrolments',
      entityId: enrolment.enrolment_id,
      description: 'Enrolment created',
      actionResult: 'SUCCESS'
    });
    res.status(201).json(enrolment);
  } catch (err) {
    // If the unique constraint fires despite the check (race condition), catch it
    if (err.constraint === 'uq_learner_course') {
      return res.status(409).json({ message: 'Learner is already enrolled in this course.' });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { completion_status } = req.body;
  const validStatuses = ['ENROLLED', 'IN_PROGRESS', 'COMPLETED', 'WITHDRAWN', 'FAILED'];
  if (!validStatuses.includes(completion_status)) return res.status(400).json({ message: 'Invalid status' });
  try {
    await pool.query('UPDATE enrolments SET completion_status=$1, updated_at=NOW() WHERE enrolment_id=$2', [completion_status, id]);
    await logAction({ userId: req.user.id, userEmail: req.user.email, action: 'UPDATE', entityType: 'enrolments', entityId: id, description: `Status changed to ${completion_status}`, actionResult: 'SUCCESS' });
    res.json({ message: 'Updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getForSchool = async (req, res) => {
  try {
    // Only manager can call this – check their centre
    const manager = await pool.query(
      'SELECT centre_id FROM users WHERE user_id = $1 AND role = \'MANAGER\'',
      [req.user.id]
    );
    if (!manager.rows[0]?.centre_id) {
      return res.json([]);
    }
    const centreId = manager.rows[0].centre_id;

    const { rows } = await pool.query(
      `SELECT e.enrolment_id, e.enrol_date, e.completion_status,
              l.learner_id, l.first_name || ' ' || l.last_name AS learner_name,
              c.course_id, c.title AS course_title
       FROM enrolments e
       JOIN learners l ON e.learner_id = l.learner_id
       JOIN courses c ON e.course_id = c.course_id
       WHERE l.centre_id = $1
       ORDER BY e.enrol_date DESC`,
      [centreId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.publicImpact = async (req, res) => {
  try {
    const { rows: [stats] } = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM learners WHERE status = 'ACTIVE') AS total_learners,
        (SELECT COUNT(*) FROM certificates WHERE status = 'ISSUED') AS total_certificates,
        (SELECT COUNT(*) FROM centres WHERE is_active = true) AS total_schools,
        (SELECT COUNT(*) FROM users WHERE role = 'FACILITATOR' AND is_active = true) AS total_teachers
    `);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.publicDonate = async (req, res) => {
  const { donor_name, donor_email, amount, purpose, centre_id } = req.body;
  const receipt_number = 'RCP-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  try {
    const { rows: [donation] } = await pool.query(
      `INSERT INTO donations (donor_name, donor_email, amount, purpose, centre_id, payment_method, receipt_number, payment_status)
       VALUES ($1,$2,$3,$4,$5,'CARD',$6,'PENDING') RETURNING *`,
      [donor_name, donor_email, amount, purpose, centre_id || null, receipt_number]
    );
    res.status(201).json({ message: 'Donation recorded', receipt_number });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// For admin: update donation status
exports.processDonation = async (req, res) => {
  const { id } = req.params;
  const { payment_status, notes } = req.body;
  try {
    await pool.query(
      'UPDATE donations SET payment_status=$1, notes=$2 WHERE donation_id=$3',
      [payment_status, notes, id]
    );
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};