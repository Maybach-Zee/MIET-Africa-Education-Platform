const pool = require('../config/db');
const { logAction } = require('../utils/auditLogger');

exports.getAll = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT r.*, u.full_name AS uploaded_by_name FROM resources r LEFT JOIN users u ON r.uploaded_by = u.user_id WHERE r.is_approved = true ORDER BY r.created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllAdmin = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT r.*, u.full_name AS uploaded_by_name FROM resources r LEFT JOIN users u ON r.uploaded_by = u.user_id ORDER BY r.created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  const { title, description, type, grade_start, grade_end, subject, language } = req.body;
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : null; // if using local

  try {
    const { rows: [resource] } = await pool.query(
      `INSERT INTO resources (title, description, type, grade_start, grade_end, subject, language, file_url, uploaded_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [title, description, type, grade_start, grade_end, subject, language, fileUrl, req.user.id]
    );
    await logAction({ userId: req.user.id, userEmail: req.user.email, action: 'CREATE', entityType: 'resources', entityId: resource.resource_id, description: 'Resource created', actionResult: 'SUCCESS' });
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approve = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows: [resource] } = await pool.query(
      'UPDATE resources SET is_approved = true, approved_by = $1, approval_date = NOW() WHERE resource_id = $2 RETURNING *',
      [req.user.id, id]
    );
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    await logAction({ userId: req.user.id, userEmail: req.user.email, action: 'APPROVE', entityType: 'resources', entityId: id, description: 'Resource approved', actionResult: 'SUCCESS' });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM resources WHERE resource_id = $1', [id]);
    await logAction({ userId: req.user.id, userEmail: req.user.email, action: 'DELETE', entityType: 'resources', entityId: id, description: 'Resource deleted', actionResult: 'SUCCESS' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};