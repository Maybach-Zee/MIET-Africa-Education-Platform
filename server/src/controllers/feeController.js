const pool = require('../config/db');
const { logAction } = require('../utils/auditLogger');

exports.getAll = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT f.*, l.first_name || ' ' || l.last_name AS learner_name, c.title AS course_title
       FROM fees f
       JOIN learners l ON f.learner_id = l.learner_id
       JOIN courses c ON f.course_id = c.course_id
       ORDER BY f.created_at DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.recordPayment = async (req, res) => {
  const { id } = req.params;
  const { amount_paid, payment_method, payment_reference } = req.body;
  try {
    const { rows: [fee] } = await pool.query(
      `UPDATE fees SET amount_paid = $1, payment_method = $2, payment_reference = $3, payment_date = CURRENT_DATE, payment_status = 'PAID', updated_at = NOW()
       WHERE fee_id = $4 RETURNING *`,
      [amount_paid, payment_method, payment_reference, id]
    );
    if (!fee) return res.status(404).json({ message: 'Fee not found' });
    await logAction({ userId: req.user.id, userEmail: req.user.email, action: 'UPDATE', entityType: 'fees', entityId: id, description: 'Payment recorded', actionResult: 'SUCCESS' });
    res.json(fee);
  } catch (err) { res.status(500).json({ message: err.message }); }
};