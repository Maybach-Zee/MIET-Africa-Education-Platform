const pool = require('../config/db');
const { logAction } = require('../utils/auditLogger');

// Get learners for a centre (principal can view their own school's learners)
exports.getByCentre = async (req, res) => {
  try {
    let centre_id = req.query.centre_id;

    // If facilitator, force their own centre_id and ignore query param
    if (req.user.role === 'FACILITATOR') {
      const userResult = await pool.query('SELECT centre_id FROM users WHERE user_id = $1', [req.user.id]);
      if (!userResult.rows[0]?.centre_id) {
        return res.json([]);  // not linked to any school
      }
      centre_id = userResult.rows[0].centre_id;
    }

    if (!centre_id) {
      return res.status(400).json({ message: 'centre_id required' });
    }

    const { rows } = await pool.query(
      'SELECT * FROM learners WHERE centre_id = $1 ORDER BY last_name, first_name',
      [centre_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create learner
exports.create = async (req, res) => {
  const { first_name, last_name, id_number, date_of_birth, gender, contact_number, address, centre_id } = req.body;
  // For MANAGER, force centre_id to their own centre
  try {
    if (req.user.role === 'MANAGER') {
      const manager = await pool.query('SELECT centre_id FROM users WHERE user_id = $1', [req.user.id]);
      const userCentre = manager.rows[0]?.centre_id;
      if (!userCentre || userCentre !== centre_id) {
        return res.status(403).json({ message: 'Unauthorised' });
      }
    }
    // Simple insert (no email for now)
    const { rows: [learner] } = await pool.query(
      `INSERT INTO learners (first_name, last_name, id_number, date_of_birth, gender, contact_number, address, centre_id, popia_consent, popia_consent_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8, true, NOW()) RETURNING *`,
      [first_name, last_name, id_number, date_of_birth, gender, contact_number, address, centre_id]
    );
    res.status(201).json(learner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, id_number, date_of_birth, gender, contact_number, address } = req.body;

  // Ownership: if MANAGER, ensure learner belongs to their centre
  if (req.user.role === 'MANAGER') {
    const learnerCheck = await pool.query('SELECT centre_id FROM learners WHERE learner_id = $1', [id]);
    const manager = await pool.query('SELECT centre_id FROM users WHERE user_id = $1', [req.user.id]);
    if (!manager.rows[0]?.centre_id || !learnerCheck.rows[0] || learnerCheck.rows[0].centre_id !== manager.rows[0].centre_id) {
      return res.status(403).json({ message: 'Not authorised' });
    }
  }

  try {
    const { rows: [learner] } = await pool.query(
      `UPDATE learners SET first_name=$1, last_name=$2, id_number=$3, date_of_birth=$4, gender=$5,
       contact_number=$6, address=$7, updated_at=NOW()
       WHERE learner_id=$8 RETURNING *`,
      [first_name, last_name, id_number, date_of_birth, gender, contact_number, address, id]
    );
    res.json(learner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  const { id } = req.params;
  if (req.user.role === 'MANAGER') {
    const learnerCheck = await pool.query('SELECT centre_id FROM learners WHERE learner_id = $1', [id]);
    const manager = await pool.query('SELECT centre_id FROM users WHERE user_id = $1', [req.user.id]);
    if (!manager.rows[0]?.centre_id || !learnerCheck.rows[0] || learnerCheck.rows[0].centre_id !== manager.rows[0].centre_id) {
      return res.status(403).json({ message: 'Not authorised' });
    }
  }
  try {
    await pool.query('DELETE FROM learners WHERE learner_id = $1', [id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};