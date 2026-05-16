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
    const manager = await pool.query('SELECT centre_id FROM users WHERE user_id = $1', [req.user.id]);
    if (!manager.rows[0]?.centre_id) return res.json([]);
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