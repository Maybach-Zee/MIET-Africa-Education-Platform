const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { logAction } = require('../utils/auditLogger');

exports.getAll = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT user_id, full_name, email, role, is_active, phone_number, last_login, created_at FROM users ORDER BY full_name'
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
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