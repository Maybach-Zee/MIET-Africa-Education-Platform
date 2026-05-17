const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { logAction } = require('../utils/auditLogger');

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.user_id, email: user.email, role: user.role, full_name: user.full_name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.user_id, email: user.email, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE }
  );
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const user = result.rows[0];
    if (!user.is_active) {
      return res.status(403).json({ message: 'Account deactivated' });
    }

    // Check if locked
    if (user.account_locked_until && new Date() < new Date(user.account_locked_until)) {
      return res.status(403).json({ message: `Account locked until ${user.account_locked_until}` });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      await pool.query('UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE user_id = $1', [user.user_id]);
      // Lock after 5 attempts for 30 minutes
      await pool.query(
        `UPDATE users SET account_locked_until = NOW() + INTERVAL '30 minutes' WHERE user_id = $1 AND failed_login_attempts >= 5`,
        [user.user_id]
      );
      await logAction({
        userId: user.user_id, userEmail: email, action: 'LOGIN', entityType: 'users', entityId: user.user_id,
        description: 'Failed login attempt', ipAddress: req.ip, actionResult: 'FAILURE'
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Success
    await pool.query('UPDATE users SET failed_login_attempts = 0, last_login = NOW() WHERE user_id = $1', [user.user_id]);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token? In production, you'd save it in DB. Here we just return it.

    await logAction({
      userId: user.user_id, userEmail: email, action: 'LOGIN', entityType: 'users', entityId: user.user_id,
      description: 'Successful login', ipAddress: req.ip, actionResult: 'SUCCESS'
    });

    let school = null;
    
if (user.role === 'MANAGER' || user.role === 'FACILITATOR') {
  const centreResult = await pool.query(
    `SELECT registration_status, is_active
     FROM centres
     WHERE centre_id = (SELECT centre_id FROM users WHERE user_id = $1)`,
    [user.user_id]
  );
  if (centreResult.rows[0]) {
    school = centreResult.rows[0];
  }
}

res.json({
  accessToken, refreshToken,
  user: {
    id: user.user_id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    must_change_password: user.must_change_password,
    school
  },
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Manager + School Registration
exports.register = async (req, res) => {
  const { full_name, email, password, centre_name, province_id, city, gps_latitude, gps_longitude, enrolled_learners } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Create the user (MANAGER role)
    const hashedPassword = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      `INSERT INTO users (full_name, email, password_hash, role, must_change_password)
       VALUES ($1,$2,$3,'MANAGER', false)
       RETURNING user_id`,
      [full_name, email, hashedPassword]
    );
    const userId = userResult.rows[0].user_id;

    // 2. Create the centre (school) – code auto-generated
    const centreCode = 'CTR-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const centreResult = await client.query(
      `INSERT INTO centres (centre_code, centre_name, province_id, city, gps_latitude, gps_longitude, enrolled_learners, centre_manager_id, registration_status, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'PENDING', false)
       RETURNING centre_id`,
      [centreCode, centre_name, province_id, city, gps_latitude, gps_longitude, enrolled_learners || 0, userId]
    );
    const centreId = centreResult.rows[0].centre_id;

    // 3. Link the user to the centre
    await client.query('UPDATE users SET centre_id = $1 WHERE user_id = $2', [centreId, userId]);

    await client.query('COMMIT');

    // Log
    await logAction({
      userId, userEmail: email, action: 'CREATE', entityType: 'users',
      entityId: userId, description: `Manager registered with school ${centre_name}`, actionResult: 'SUCCESS'
    });

    res.status(201).json({
      message: 'Registration submitted. Your school is pending approval.',
      user: { id: userId, full_name, email, role: 'MANAGER' },
      centre: { id: centreId, name: centre_name, status: 'PENDING' }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.constraint === 'users_email_key') {
      return res.status(409).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    // In a real app, check if token is still valid in DB
    const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [decoded.id]);
    if (result.rows.length === 0) return res.status(403).json({ message: 'Invalid token' });

    const user = result.rows[0];
    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const result = await pool.query('SELECT user_id, full_name, email, role, phone_number, profile_photo_url FROM users WHERE user_id = $1', [req.user.id]);
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const result = await pool.query('SELECT password_hash FROM users WHERE user_id = $1', [req.user.id]);
    const match = await bcrypt.compare(oldPassword, result.rows[0].password_hash);
    if (!match) return res.status(400).json({ message: 'Current password is incorrect' });
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1, must_change_password = false WHERE user_id = $2', [hash, req.user.id]);
    await logAction({ userId: req.user.id, userEmail: req.user.email, action: 'UPDATE', entityType: 'users', entityId: req.user.id, description: 'Password changed', actionResult: 'SUCCESS' });
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
};