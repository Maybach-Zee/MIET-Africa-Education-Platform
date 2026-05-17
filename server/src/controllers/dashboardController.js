const pool = require('../config/db');

exports.getAdminStats = async (req, res) => {
  try {
    const { rows: [stats] } = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM centres WHERE is_active = true) AS total_schools,
        (SELECT COUNT(*) FROM users WHERE role = 'FACILITATOR' AND is_active = true) AS total_teachers,
        (SELECT COUNT(*) FROM learners WHERE status = 'ACTIVE') AS total_learners,
        (SELECT COUNT(*) FROM resources WHERE is_approved = true AND is_active = true) AS total_resources
    `);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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

exports.getSchoolSummary = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.centre_id, c.centre_name, c.province_id, p.province_name,
              COUNT(DISTINCT l.learner_id) AS total_learners,
              COUNT(DISTINCT co.course_id) FILTER (WHERE co.is_active = true) AS active_courses,
              COUNT(DISTINCT u.user_id) FILTER (WHERE u.role = 'FACILITATOR' AND u.is_active = true) AS total_teachers
       FROM centres c
       LEFT JOIN provinces p ON c.province_id = p.province_id
       LEFT JOIN learners l ON l.centre_id = c.centre_id
       LEFT JOIN courses co ON co.centre_id = c.centre_id
       LEFT JOIN users u ON u.centre_id = c.centre_id AND u.role = 'FACILITATOR' AND u.is_active = true
       WHERE c.is_active = true
       GROUP BY c.centre_id, c.centre_name, c.province_id, p.province_name
       ORDER BY c.centre_name`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};