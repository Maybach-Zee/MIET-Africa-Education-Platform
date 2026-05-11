const pool = require('../config/db');

exports.getSummary = async (req, res) => {
  try {
    const { rows: [summary] } = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM provinces WHERE is_active = true) AS total_provinces,
        (SELECT COUNT(*) FROM centres WHERE is_active = true) AS total_centres,
        (SELECT COUNT(*) FROM learners WHERE status = 'ACTIVE') AS active_learners,
        (SELECT COUNT(*) FROM courses WHERE is_active = true) AS active_courses,
        (SELECT COUNT(*) FROM enrolments WHERE completion_status = 'COMPLETED') AS completed_enrolments,
        (SELECT COUNT(*) FROM certificates WHERE status = 'ISSUED') AS certificates_issued
    `);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProvinceStats = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM v_province_analytics');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMonthlyRegistrations = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM v_monthly_registrations ORDER BY year DESC, month DESC LIMIT 12');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCourseStats = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM v_course_statistics');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};