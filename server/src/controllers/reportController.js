const pool = require('../config/db');

exports.getDonorImpact = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM v_donor_impact_metrics ORDER BY year DESC, month DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getLearnerSummary = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM v_learner_summary');
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAttendanceReport = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM v_attendance_report');
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getFeeCollection = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM v_fee_collection_summary');
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};