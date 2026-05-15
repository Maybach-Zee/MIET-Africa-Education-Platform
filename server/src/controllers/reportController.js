const pool = require('../config/db');

// Admin: monthly aggregated report
exports.getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.query;  // month: 1-12
    if (!year || !month) return res.status(400).json({ message: 'Year and month required' });

    const { rows: [report] } = await pool.query(
      `SELECT
        COUNT(DISTINCT a.assessment_id) AS children_assessed,
        ROUND(AVG(a.percentage), 2) AS avg_assessment_score,
        COUNT(DISTINCT CASE WHEN a.result = 'PASS' THEN a.enrolment_id END) AS passed_count,
        COUNT(DISTINCT e.enrolment_id) AS total_enrolments,
        COALESCE(SUM(EXTRACT(EPOCH FROM (s.session_end_time - s.session_start_time))/3600 * att.present::int), 0) AS training_hours,
        COUNT(DISTINCT r.resource_id) FILTER (WHERE r.is_approved = true AND r.is_active = true) AS approved_resources
      FROM enrolments e
      LEFT JOIN assessments a ON e.enrolment_id = a.enrolment_id
      LEFT JOIN sessions s ON e.course_id = s.course_id
      LEFT JOIN attendance att ON e.enrolment_id = att.enrolment_id AND s.session_id = att.session_id
      LEFT JOIN resources r ON r.uploaded_by IN (SELECT user_id FROM users WHERE centre_id IN (SELECT centre_id FROM courses WHERE course_id = e.course_id))
      WHERE EXTRACT(YEAR FROM e.enrol_date) = $1
        AND EXTRACT(MONTH FROM e.enrol_date) = $2`,
      [year, month]
    );
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: quarterly aggregated report (simple: same as monthly but for 3-month range)
exports.getQuarterlyReport = async (req, res) => {
  try {
    const { year, quarter } = req.query; // quarter: 1-4
    if (!year || !quarter) return res.status(400).json({ message: 'Year and quarter required' });
    const startMonth = (quarter - 1) * 3 + 1;
    const endMonth = startMonth + 2;

    const { rows: [report] } = await pool.query(
      `SELECT
        COUNT(DISTINCT a.assessment_id) AS children_assessed,
        ROUND(AVG(a.percentage), 2) AS avg_assessment_score,
        COUNT(DISTINCT CASE WHEN a.result = 'PASS' THEN a.enrolment_id END) AS passed_count,
        COUNT(DISTINCT e.enrolment_id) AS total_enrolments,
        COALESCE(SUM(EXTRACT(EPOCH FROM (s.session_end_time - s.session_start_time))/3600 * att.present::int), 0) AS training_hours,
        COUNT(DISTINCT r.resource_id) FILTER (WHERE r.is_approved = true AND r.is_active = true) AS approved_resources
      FROM enrolments e
      LEFT JOIN assessments a ON e.enrolment_id = a.enrolment_id
      LEFT JOIN sessions s ON e.course_id = s.course_id
      LEFT JOIN attendance att ON e.enrolment_id = att.enrolment_id AND s.session_id = att.session_id
      LEFT JOIN resources r ON r.uploaded_by IN (SELECT user_id FROM users WHERE centre_id IN (SELECT centre_id FROM courses WHERE course_id = e.course_id))
      WHERE EXTRACT(YEAR FROM e.enrol_date) = $1
        AND EXTRACT(MONTH FROM e.enrol_date) BETWEEN $2 AND $3`,
      [year, startMonth, endMonth]
    );
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Principal: report for own school (monthly)
exports.getSchoolReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) return res.status(400).json({ message: 'Year and month required' });

    // Get principal's centre
    const manager = await pool.query('SELECT centre_id FROM users WHERE user_id = $1', [req.user.id]);
    if (!manager.rows[0]?.centre_id) return res.status(404).json({ message: 'No school linked' });
    const centreId = manager.rows[0].centre_id;

    const { rows: [report] } = await pool.query(
      `SELECT
        COUNT(DISTINCT a.assessment_id) AS children_assessed,
        ROUND(AVG(a.percentage), 2) AS avg_assessment_score,
        COUNT(DISTINCT CASE WHEN a.result = 'PASS' THEN a.enrolment_id END) AS passed_count,
        COUNT(DISTINCT e.enrolment_id) AS total_enrolments,
        COALESCE(SUM(EXTRACT(EPOCH FROM (s.session_end_time - s.session_start_time))/3600 * att.present::int), 0) AS training_hours,
        COUNT(DISTINCT r.resource_id) FILTER (WHERE r.is_approved = true AND r.is_active = true) AS approved_resources
      FROM enrolments e
      JOIN courses co ON e.course_id = co.course_id
      LEFT JOIN assessments a ON e.enrolment_id = a.enrolment_id
      LEFT JOIN sessions s ON e.course_id = s.course_id
      LEFT JOIN attendance att ON e.enrolment_id = att.enrolment_id AND s.session_id = att.session_id
      LEFT JOIN resources r ON r.centre_id = $3
      WHERE co.centre_id = $3
        AND EXTRACT(YEAR FROM e.enrol_date) = $1
        AND EXTRACT(MONTH FROM e.enrol_date) = $2`,
      [year, month, centreId]
    );
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Principal: quarterly report for own school
exports.getSchoolQuarterlyReport = async (req, res) => {
  try {
    const { year, quarter } = req.query;
    if (!year || !quarter) return res.status(400).json({ message: 'Year and quarter required' });
    const startMonth = (quarter - 1) * 3 + 1;
    const endMonth = startMonth + 2;

    const manager = await pool.query('SELECT centre_id FROM users WHERE user_id = $1', [req.user.id]);
    if (!manager.rows[0]?.centre_id) return res.status(404).json({ message: 'No school linked' });
    const centreId = manager.rows[0].centre_id;

    const { rows: [report] } = await pool.query(
      `SELECT
        COUNT(DISTINCT a.assessment_id) AS children_assessed,
        ROUND(AVG(a.percentage), 2) AS avg_assessment_score,
        COUNT(DISTINCT CASE WHEN a.result = 'PASS' THEN a.enrolment_id END) AS passed_count,
        COUNT(DISTINCT e.enrolment_id) AS total_enrolments,
        COALESCE(SUM(EXTRACT(EPOCH FROM (s.session_end_time - s.session_start_time))/3600 * att.present::int), 0) AS training_hours,
        COUNT(DISTINCT r.resource_id) FILTER (WHERE r.is_approved = true AND r.is_active = true) AS approved_resources
      FROM enrolments e
      JOIN courses co ON e.course_id = co.course_id
      LEFT JOIN assessments a ON e.enrolment_id = a.enrolment_id
      LEFT JOIN sessions s ON e.course_id = s.course_id
      LEFT JOIN attendance att ON e.enrolment_id = att.enrolment_id AND s.session_id = att.session_id
      LEFT JOIN resources r ON r.centre_id = $3
      WHERE co.centre_id = $3
        AND EXTRACT(YEAR FROM e.enrol_date) = $1
        AND EXTRACT(MONTH FROM e.enrol_date) BETWEEN $2 AND $3`,
      [year, startMonth, endMonth, centreId]
    );
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};