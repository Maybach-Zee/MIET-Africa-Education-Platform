const pool = require('../config/db');
const { logAction } = require('../utils/auditLogger');

exports.getAll = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, p.province_name, u.full_name AS manager_name
       FROM centres c
       LEFT JOIN provinces p ON c.province_id = p.province_id
       LEFT JOIN users u ON c.centre_manager_id = u.user_id
       ORDER BY c.centre_name`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.register = async (req, res) => {
  const { centre_name, province_id, address, city, postal_code, phone_number, email } = req.body;
  const code = 'CTR-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  try {
    const { rows: [centre] } = await pool.query(
      `INSERT INTO centres (centre_code, centre_name, province_id, address, city, postal_code, phone_number, email)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [code, centre_name, province_id, address, city, postal_code, phone_number, email]
    );
    await logAction({ userId: req.user.id, userEmail: req.user.email, action: 'CREATE', entityType: 'centres', entityId: centre.centre_id, description: 'School registered', actionResult: 'SUCCESS' });
    res.status(201).json(centre);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approve = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE centres SET is_active = true WHERE centre_id = $1', [id]);
    await logAction({ userId: req.user.id, userEmail: req.user.email, action: 'APPROVE', entityType: 'centres', entityId: id, description: 'School approved', actionResult: 'SUCCESS' });
    res.json({ message: 'Approved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};