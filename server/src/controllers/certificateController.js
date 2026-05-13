const pool = require('../config/db');
const { logAction } = require('../utils/auditLogger');

exports.getAll = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT cert.*, l.first_name || ' ' || l.last_name AS learner_name, c.title AS course_title
       FROM certificates cert
       JOIN learners l ON cert.learner_id = l.learner_id
       JOIN courses c ON cert.course_id = c.course_id
       ORDER BY cert.created_at DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.approve = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      'UPDATE certificates SET status = $1, approved_by = $2, approval_date = NOW() WHERE certificate_id = $3',
      ['APPROVED', req.user.id, id]
    );
    await logAction({ userId: req.user.id, userEmail: req.user.email, action: 'APPROVE', entityType: 'certificates', entityId: id, description: 'Certificate approved', actionResult: 'SUCCESS' });
    res.json({ message: 'Approved' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.issue = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      'UPDATE certificates SET status = $1, issue_date = CURRENT_DATE WHERE certificate_id = $2',
      ['ISSUED', id]
    );
    await logAction({ userId: req.user.id, userEmail: req.user.email, action: 'UPDATE', entityType: 'certificates', entityId: id, description: 'Certificate issued', actionResult: 'SUCCESS' });
    res.json({ message: 'Issued' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};