const pool = require('../config/db');
const { logAction } = require('../utils/auditLogger');

// Get all courses (admin/manager)
exports.getAll = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT co.*, p.province_name, c.centre_name
       FROM courses co
       LEFT JOIN provinces p ON co.province_id = p.province_id
       LEFT JOIN centres c ON co.centre_id = c.centre_id
       ORDER BY co.title`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get courses belonging to the principal's school
exports.getMyCourses = async (req, res) => {
  try {
    const manager = await pool.query(
      'SELECT centre_id FROM users WHERE user_id = $1',
      [req.user.id]
    );
    if (!manager.rows[0]?.centre_id) return res.json([]);

    const { rows } = await pool.query(
      'SELECT * FROM courses WHERE centre_id = $1 AND is_active = true ORDER BY title',
      [manager.rows[0].centre_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a course (admin/manager)
exports.create = async (req, res) => {
  const {
    course_code, title, description, duration_hours, start_date, end_date,
    pass_mark, max_learners, centre_id, province_id, seta_name,
    seta_accreditation_number, unit_standard_codes, nqf_level, credits,
    qualification_title, delivery_mode, course_fee
  } = req.body;

  try {
    const { rows: [course] } = await pool.query(
      `INSERT INTO courses (course_code, title, description, duration_hours, start_date, end_date,
        pass_mark, max_learners, centre_id, province_id, seta_name, seta_accreditation_number,
        unit_standard_codes, nqf_level, credits, qualification_title, delivery_mode, course_fee, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       RETURNING *`,
      [
        course_code, title, description, duration_hours, start_date, end_date,
        pass_mark, max_learners, centre_id, province_id, seta_name,
        seta_accreditation_number, unit_standard_codes, nqf_level, credits,
        qualification_title, delivery_mode, course_fee, req.user.id
      ]
    );
    await logAction({
      userId: req.user.id, userEmail: req.user.email, action: 'CREATE',
      entityType: 'courses', entityId: course.course_id,
      description: 'Course created', actionResult: 'SUCCESS'
    });
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update, delete, etc. can be added later; for now these are sufficient.