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

// Update a course
exports.update = async (req, res) => {
  const { id } = req.params;
  const {
    title, description, duration_hours, start_date, end_date,
    pass_mark, max_learners, delivery_mode, course_fee
  } = req.body;

  // For MANAGER, verify course belongs to their centre
  if (req.user.role === 'MANAGER') {
    const courseCheck = await pool.query('SELECT centre_id FROM courses WHERE course_id = $1', [id]);
    const manager = await pool.query('SELECT centre_id FROM users WHERE user_id = $1', [req.user.id]);
    if (!manager.rows[0]?.centre_id || !courseCheck.rows[0] || courseCheck.rows[0].centre_id !== manager.rows[0].centre_id) {
      return res.status(403).json({ message: 'Not authorised' });
    }
  }

  const toInt = (val) => (val === '' || val === undefined || val === null ? null : parseInt(val, 10));
  const toFloat = (val) => (val === '' ? null : parseFloat(val));

  try {
    const { rows: [course] } = await pool.query(
      `UPDATE courses SET title=$1, description=$2, duration_hours=$3, start_date=$4, end_date=$5,
       pass_mark=$6, max_learners=$7, delivery_mode=$8, course_fee=$9, updated_at=NOW()
       WHERE course_id=$10 RETURNING *`,
      [
        title, description,
        toInt(duration_hours),
        start_date || null,
        end_date || null,
        pass_mark || 50,
        toInt(max_learners),
        delivery_mode,
        toFloat(course_fee) || 0,
        id
      ]
    );
    await logAction({ userId: req.user.id, userEmail: req.user.email, action: 'UPDATE', entityType: 'courses', entityId: id, description: 'Course updated', actionResult: 'SUCCESS' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a course
exports.remove = async (req, res) => {
  const { id } = req.params;
  // Ownership check for MANAGER
  if (req.user.role === 'MANAGER') {
    const courseCheck = await pool.query('SELECT centre_id FROM courses WHERE course_id = $1', [id]);
    const manager = await pool.query('SELECT centre_id FROM users WHERE user_id = $1', [req.user.id]);
    if (!manager.rows[0]?.centre_id || !courseCheck.rows[0] || courseCheck.rows[0].centre_id !== manager.rows[0].centre_id) {
      return res.status(403).json({ message: 'Not authorised' });
    }
  }
  try {
    await pool.query('DELETE FROM courses WHERE course_id = $1', [id]);
    await logAction({ userId: req.user.id, userEmail: req.user.email, action: 'DELETE', entityType: 'courses', entityId: id, description: 'Course deleted', actionResult: 'SUCCESS' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.assignFacilitator = async (req, res) => {
  const { id } = req.params; // course_id
  const { facilitator_id } = req.body;

  // Manager: verify ownership
  if (req.user.role === 'MANAGER') {
    const manager = await pool.query('SELECT centre_id FROM users WHERE user_id = $1', [req.user.id]);
    const course = await pool.query('SELECT centre_id FROM courses WHERE course_id = $1', [id]);
    if (!manager.rows[0]?.centre_id || !course.rows[0] || course.rows[0].centre_id !== manager.rows[0].centre_id) {
      return res.status(403).json({ message: 'Not authorised' });
    }
    // Verify facilitator belongs to same school
    const facilitator = await pool.query(
      'SELECT centre_id FROM users WHERE user_id = $1 AND role = \'FACILITATOR\'',
      [facilitator_id]
    );
    if (!facilitator.rows[0] || facilitator.rows[0].centre_id !== manager.rows[0].centre_id) {
      return res.status(400).json({ message: 'Facilitator not in your school' });
    }
  }

  try {
    // Upsert as primary facilitator
    await pool.query(
      `INSERT INTO facilitator_assignments (user_id, course_id, is_primary)
       VALUES ($1, $2, true)
       ON CONFLICT (user_id, course_id) DO UPDATE SET is_primary = true`,
      [facilitator_id, id]
    );
    res.json({ message: 'Facilitator assigned' });
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

  // Helper to safely parse integers, returning null for empty/invalid
  const toInt = (val) => {
    if (val === '' || val === undefined || val === null) return null;
    const num = parseInt(val, 10);
    return isNaN(num) ? null : num;
  };

  try {
    // If the user is a MANAGER, force centre_id to their own school
    let finalCentreId = centre_id;
    if (req.user.role === 'MANAGER') {
      const manager = await pool.query(
        'SELECT centre_id FROM users WHERE user_id = $1',
        [req.user.id]
      );
      if (!manager.rows[0]?.centre_id) {
        return res.status(403).json({ message: 'No school linked to your account' });
      }
      finalCentreId = manager.rows[0].centre_id;
    }

    const { rows: [course] } = await pool.query(
      `INSERT INTO courses (course_code, title, description, duration_hours, start_date, end_date,
        pass_mark, max_learners, centre_id, province_id, seta_name, seta_accreditation_number,
        unit_standard_codes, nqf_level, credits, qualification_title, delivery_mode, course_fee, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       RETURNING *`,
      [
        course_code,
        title,
        description,
        toInt(duration_hours),
        start_date || null,
        end_date || null,
        pass_mark || 50,
        toInt(max_learners),
        finalCentreId,
        province_id || null,
        seta_name,
        seta_accreditation_number,
        unit_standard_codes || null,
        toInt(nqf_level),
        toInt(credits),
        qualification_title,
        delivery_mode,
        parseFloat(course_fee) || 0,
        req.user.id
      ]
    );

    await logAction({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'CREATE',
      entityType: 'courses',
      entityId: course.course_id,
      description: 'Course created',
      actionResult: 'SUCCESS'
    });

    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};