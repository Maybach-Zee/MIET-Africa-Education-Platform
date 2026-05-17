const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { logAction } = require('../utils/auditLogger');

exports.getAll = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.user_id, u.full_name, u.email, u.role, u.is_active, u.phone_number, u.last_login, u.created_at,
              c.centre_name
       FROM users u
       LEFT JOIN centres c ON u.centre_id = c.centre_id
       ORDER BY u.full_name`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  const { full_name, email, password, role } = req.body;
  if (!password) return res.status(400).json({ message: 'Password required' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows: [user] } = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role, created_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING user_id, full_name, email, role`,
      [full_name, email, hash, role, req.user.id]
    );
    await logAction({ userId: req.user.id, userEmail: req.user.email, action: 'CREATE', entityType: 'users', entityId: user.user_id, description: 'User created', actionResult: 'SUCCESS' });
    res.status(201).json(user);
  } catch (err) {
    if (err.constraint === 'users_email_key') return res.status(409).json({ message: 'Email already exists' });
    res.status(500).json({ message: err.message });
  }
};

// Add a facilitator under the manager's centre
exports.addFacilitator = async (req, res) => {
  // Only MANAGER can call this, and we'll get their centre_id from the user record
  const { full_name, email, password } = req.body;
  try {
    // Get the manager's centre_id
    const managerResult = await pool.query('SELECT centre_id FROM users WHERE user_id = $1', [req.user.id]);
    if (managerResult.rows.length === 0 || !managerResult.rows[0].centre_id) {
      return res.status(400).json({ message: 'You are not linked to a school' });
    }
    const centreId = managerResult.rows[0].centre_id;

    const hash = await bcrypt.hash(password, 10);
    const { rows: [user] } = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role, centre_id, must_change_password)
       VALUES ($1,$2,$3,'FACILITATOR',$4, false)
       RETURNING user_id, full_name, email, role`,
      [full_name, email, hash, centreId]
    );

    await logAction({
      userId: req.user.id, userEmail: req.user.email, action: 'CREATE',
      entityType: 'users', entityId: user.user_id, description: 'Facilitator added', actionResult: 'SUCCESS'
    });
    res.status(201).json(user);
  } catch (err) {
    if (err.constraint === 'users_email_key') return res.status(409).json({ message: 'Email already exists' });
    res.status(500).json({ message: err.message });
  }
};

// List teachers in the manager's school
exports.getTeachers = async (req, res) => {
  try {
    const manager = await pool.query('SELECT centre_id FROM users WHERE user_id = $1', [req.user.id]);
    if (!manager.rows[0]?.centre_id) return res.json([]);
    const centreId = manager.rows[0].centre_id;

    const { rows } = await pool.query(
      `SELECT user_id, full_name, email, is_active, last_login,
              false AS training_completed   -- placeholder
       FROM users
       WHERE role = 'FACILITATOR' AND centre_id = $1
       ORDER BY full_name`,
      [centreId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a teacher's details (full_name, email)
exports.updateTeacher = async (req, res) => {
  const { id } = req.params; // user_id of the teacher
  const { full_name, email } = req.body;

  // Verify the manager owns this teacher
  const manager = await pool.query('SELECT centre_id FROM users WHERE user_id = $1', [req.user.id]);
  const teacher = await pool.query(
    'SELECT centre_id FROM users WHERE user_id = $1 AND role = \'FACILITATOR\'',
    [id]
  );

  if (!manager.rows[0]?.centre_id || !teacher.rows[0] || teacher.rows[0].centre_id !== manager.rows[0].centre_id) {
    return res.status(403).json({ message: 'Not authorised' });
  }

  try {
    await pool.query(
      'UPDATE users SET full_name = $1, email = $2, updated_at = NOW() WHERE user_id = $3',
      [full_name, email, id]
    );
    res.json({ message: 'Teacher updated' });
  } catch (err) {
    if (err.constraint === 'users_email_key') return res.status(409).json({ message: 'Email already exists' });
    res.status(500).json({ message: err.message });
  }
};

// Toggle teacher active status
exports.toggleTeacherActive = async (req, res) => {
  const { id } = req.params;
  const manager = await pool.query('SELECT centre_id FROM users WHERE user_id = $1', [req.user.id]);
  const teacher = await pool.query(
    'SELECT centre_id, is_active FROM users WHERE user_id = $1 AND role = \'FACILITATOR\'',
    [id]
  );

  if (!manager.rows[0]?.centre_id || !teacher.rows[0] || teacher.rows[0].centre_id !== manager.rows[0].centre_id) {
    return res.status(403).json({ message: 'Not authorised' });
  }

  const newStatus = !teacher.rows[0].is_active;
  await pool.query('UPDATE users SET is_active = $1 WHERE user_id = $2', [newStatus, id]);
  res.json({ is_active: newStatus });
};

// userController.js
exports.getUnassignedManagers = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT user_id, full_name, email FROM users
       WHERE role = 'MANAGER' AND (centre_id IS NULL OR centre_id NOT IN (SELECT centre_id FROM centres WHERE centre_manager_id = user_id))
       ORDER BY full_name`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { full_name, role, is_active } = req.body;
  try {
    await pool.query(
      'UPDATE users SET full_name=$1, role=$2, is_active=$3 WHERE user_id=$4',
      [full_name, role, is_active, id]
    );
    await logAction({ userId: req.user.id, userEmail: req.user.email, action: 'UPDATE', entityType: 'users', entityId: id, description: 'User updated', actionResult: 'SUCCESS' });
    res.json({ message: 'Updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE user_id = $1', [id]);
    await logAction({ userId: req.user.id, userEmail: req.user.email, action: 'DELETE', entityType: 'users', entityId: id, description: 'User deleted', actionResult: 'SUCCESS' });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};