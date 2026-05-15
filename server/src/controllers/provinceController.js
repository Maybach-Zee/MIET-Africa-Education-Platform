const pool = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM provinces WHERE is_active = true ORDER BY province_name'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};