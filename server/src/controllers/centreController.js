const pool = require('../config/db');
const { logAction } = require('../utils/auditLogger');

// ========================================
// GET ALL CENTRES
// ========================================

exports.getAll = async (req, res) => {
  try {
    const {
      province_id,
      status,
      min_learners
    } = req.query;

    let query = `
      SELECT 
        c.*,
        p.province_name,
        u.full_name AS manager_name
      FROM centres c
      LEFT JOIN provinces p 
        ON c.province_id = p.province_id
      LEFT JOIN users u 
        ON c.centre_manager_id = u.user_id
      WHERE 1=1
    `;

    const params = [];

    // Province filter
    if (province_id) {
      params.push(province_id);

      query += `
        AND c.province_id = $${params.length}
      `;
    }

    // Status filter
    if (status) {
      params.push(status.toUpperCase());

      query += `
        AND c.registration_status = $${params.length}
      `;
    }

    // Learner filter
    if (min_learners) {
      params.push(
        parseInt(min_learners, 10)
      );

      query += `
        AND c.enrolled_learners >= $${params.length}
      `;
    }

    query += `
      ORDER BY c.centre_name
    `;

    const { rows } = await pool.query(
      query,
      params
    );

    res.json(rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message
    });
  }
};

// ========================================
// REGISTER SCHOOL
// ========================================

exports.register = async (req, res) => {
  const {
    centre_name,
    province_id,
    address,
    city,
    postal_code,
    phone_number,
    email,
    gps_latitude,
    gps_longitude,
    enrolled_learners
  } = req.body;

  try {
    // ================================
    // CHECK IF MANAGER ALREADY HAS SCHOOL
    // ================================

    const existingCentre = await pool.query(
      `
      SELECT centre_id
      FROM centres
      WHERE centre_manager_id = $1
      `,
      [req.user.id]
    );

    if (existingCentre.rows.length > 0) {
      return res.status(400).json({
        message:
          'You already registered a school'
      });
    }

    // ================================
    // CHECK DUPLICATE SCHOOL NAME
    // ================================

    const duplicateSchool = await pool.query(
      `
      SELECT centre_id
      FROM centres
      WHERE LOWER(centre_name) = LOWER($1)
      `,
      [centre_name]
    );

    if (duplicateSchool.rows.length > 0) {
      return res.status(400).json({
        message:
          'A school with this name already exists'
      });
    }

    // ================================
    // CHECK DUPLICATE EMAIL
    // ================================

    const duplicateEmail = await pool.query(
      `
      SELECT centre_id
      FROM centres
      WHERE LOWER(email) = LOWER($1)
      `,
      [email]
    );

    if (duplicateEmail.rows.length > 0) {
      return res.status(400).json({
        message:
          'A school with this email already exists'
      });
    }

    // ================================
    // GENERATE SCHOOL CODE
    // ================================

    const code =
      'CTR-' +
      Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

    // ================================
    // INSERT SCHOOL
    // ================================

    const { rows } = await pool.query(
      `
      INSERT INTO centres (
        centre_code,
        centre_name,
        province_id,
        centre_manager_id,
        address,
        city,
        postal_code,
        phone_number,
        email,
        gps_latitude,
        gps_longitude,
        enrolled_learners,
        registration_status,
        is_active
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,
        'PENDING',
        false
      )
      RETURNING *
      `,
      [
        code,
        centre_name,
        province_id,
        req.user.id,
        address,
        city,
        postal_code,
        phone_number,
        email,
        parseFloat(gps_latitude),
        parseFloat(gps_longitude),
        parseInt(
          enrolled_learners || 0,
          10
        )
      ]
    );

    const centre = rows[0];

    // ================================
    // AUDIT LOG
    // ================================

    await logAction({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'CREATE',
      entityType: 'centres',
      entityId: centre.centre_id,
      description: `School registration submitted by ${req.user.email}`,
      actionResult: 'SUCCESS'
    });

    res.status(201).json(centre);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message
    });
  }
};

// ========================================
// APPROVE SCHOOL
// ========================================

exports.approve = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      `
      UPDATE centres
      SET
        registration_status = 'APPROVED',
        is_active = true
      WHERE centre_id = $1
      `,
      [id]
    );

    await logAction({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'APPROVE',
      entityType: 'centres',
      entityId: id,
      description: 'School approved',
      actionResult: 'SUCCESS'
    });

    res.json({
      message: 'School approved'
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message
    });
  }
};

// ========================================
// REJECT SCHOOL
// ========================================

exports.reject = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  try {
    await pool.query(
      `
      UPDATE centres
      SET
        registration_status = 'REJECTED',
        rejection_comment = $1,
        is_active = false
      WHERE centre_id = $2
      `,
      [comment || '', id]
    );

    await logAction({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'REJECT',
      entityType: 'centres',
      entityId: id,
      description: `School rejected with comment: ${comment}`,
      actionResult: 'SUCCESS'
    });

    res.json({
      message: 'School rejected'
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message
    });
  }
};

// ========================================
// GET MY CENTRE
// ========================================

exports.getMyCentre = async (
  req,
  res
) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT
        c.*,
        p.province_name
      FROM centres c
      LEFT JOIN provinces p
        ON c.province_id = p.province_id
      WHERE c.centre_manager_id = $1
      `,
      [req.user.id]
    );

    const centre = rows[0];

    if (!centre) {
      return res.status(404).json({
        message:
          'No school found for your account'
      });
    }

    res.json(centre);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message
    });
  }
};

// centreController.js - add
exports.assignManager = async (req, res) => {
  const { id } = req.params;
  const { manager_id } = req.body;
  try {
    // Set centre_manager_id on centre
    await pool.query('UPDATE centres SET centre_manager_id = $1 WHERE centre_id = $2', [manager_id, id]);
    // Update the manager user's centre_id if not already set (optional)
    await pool.query('UPDATE users SET centre_id = $1 WHERE user_id = $2', [id, manager_id]);
    res.json({ message: 'Manager assigned' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateMyCentre = async (req, res) => {
  const { centre_name, address, city, postal_code, phone_number, email } = req.body;
  // MANAGER can only update their own centre
  const manager = await pool.query('SELECT centre_id FROM users WHERE user_id = $1', [req.user.id]);
  if (!manager.rows[0]?.centre_id) return res.status(403).json({ message: 'No school linked' });
  const centreId = manager.rows[0].centre_id;

  try {
    const { rows: [centre] } = await pool.query(
      `UPDATE centres SET centre_name=$1, address=$2, city=$3, postal_code=$4, phone_number=$5, email=$6, updated_at=NOW()
       WHERE centre_id=$7 RETURNING *`,
      [centre_name, address, city, postal_code, phone_number, email, centreId]
    );
    res.json(centre);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};