const pool = require('../config/db');
const { logAction } = require('../utils/auditLogger');

exports.getAll = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT s.*, c.title AS course_title
       FROM sessions s
       JOIN courses c ON s.course_id = c.course_id
       WHERE s.is_cancelled = false
       ORDER BY s.session_date DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  const { course_id, session_date, session_start_time, session_end_time, topic, description, venue, facilitator_id } = req.body;
  try {
    const { rows: [session] } = await pool.query(
      `INSERT INTO sessions (course_id, session_date, session_start_time, session_end_time, topic, description, venue, facilitator_id, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [course_id, session_date, session_start_time, session_end_time, topic, description, venue, facilitator_id, req.user.id]
    );
    await logAction({ userId: req.user.id, userEmail: req.user.email, action: 'CREATE', entityType: 'sessions', entityId: session.session_id, description: 'Event created', actionResult: 'SUCCESS' });
    res.status(201).json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.cancel = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE sessions SET is_cancelled = true WHERE session_id = $1', [id]);
    await logAction({ userId: req.user.id, userEmail: req.user.email, action: 'UPDATE', entityType: 'sessions', entityId: id, description: 'Session cancelled', actionResult: 'SUCCESS' });
    res.json({ message: 'Cancelled' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};