const pool = require('../config/db');
const { logAction } = require('../utils/auditLogger');

// Public: only approved AND active resources
exports.getAll = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, u.full_name AS uploaded_by_name
       FROM resources r
       LEFT JOIN users u ON r.uploaded_by = u.user_id
       WHERE r.is_approved = true AND r.is_active = true
       ORDER BY r.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: all resources (including pending/archived)
exports.getAllAdmin = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, u.full_name AS uploaded_by_name
       FROM resources r
       LEFT JOIN users u ON r.uploaded_by = u.user_id
       ORDER BY r.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new resource
exports.create = async (req, res) => {
  const { title, description, type, grade_start, grade_end, subject, language, tags } = req.body;
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

  // Ensure tags is a JSON array
  let tagsArray = [];
  if (tags) {
    if (Array.isArray(tags)) {
      tagsArray = tags;
    } else if (typeof tags === 'string') {
      tagsArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
    }
  }

  try {
    const { rows: [resource] } = await pool.query(
      `INSERT INTO resources (title, description, type, grade_start, grade_end, subject, language, tags, file_url, uploaded_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10) RETURNING *`,
      [
        title,
        description,
        type,
        grade_start ? parseInt(grade_start, 10) : null,
        grade_end ? parseInt(grade_end, 10) : null,
        subject,
        language,
        JSON.stringify(tagsArray),
        fileUrl,
        req.user.id
      ]
    );
    await logAction({
      userId: req.user.id, userEmail: req.user.email, action: 'CREATE',
      entityType: 'resources', entityId: resource.resource_id,
      description: 'Resource created', actionResult: 'SUCCESS'
    });
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update an existing resource
exports.update = async (req, res) => {
  const { id } = req.params;
  const { title, description, type, grade_start, grade_end, subject, language, tags } = req.body;
  let fileUrl = null;
  if (req.file) fileUrl = `/uploads/${req.file.filename}`;

  try {
    const { rows: [current] } = await pool.query('SELECT * FROM resources WHERE resource_id = $1', [id]);
    if (!current) return res.status(404).json({ message: 'Resource not found' });

    // Merge new values with existing ones (form may not send all fields)
    const newTitle = title !== undefined ? title : current.title;
    const newDescription = description !== undefined ? description : current.description;
    const newType = type !== undefined ? type : current.type;
    const newGradeStart = grade_start !== undefined ? (grade_start ? parseInt(grade_start, 10) : null) : current.grade_start;
    const newGradeEnd = grade_end !== undefined ? (grade_end ? parseInt(grade_end, 10) : null) : current.grade_end;
    const newSubject = subject !== undefined ? subject : current.subject;
    const newLanguage = language !== undefined ? language : current.language;
    const newFileUrl = fileUrl || current.file_url;

    let newTags = current.tags;
    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        newTags = tags;
      } else if (typeof tags === 'string') {
        newTags = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
      }
    }

    const { rows: [resource] } = await pool.query(
      `UPDATE resources SET title=$1, description=$2, type=$3, grade_start=$4, grade_end=$5,
       subject=$6, language=$7, tags=$8::jsonb, file_url=$9, updated_at=NOW()
       WHERE resource_id=$10 RETURNING *`,
      [newTitle, newDescription, newType, newGradeStart, newGradeEnd, newSubject, newLanguage, JSON.stringify(newTags), newFileUrl, id]
    );
    await logAction({
      userId: req.user.id, userEmail: req.user.email, action: 'UPDATE',
      entityType: 'resources', entityId: id, description: 'Resource updated', actionResult: 'SUCCESS'
    });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve a resource
exports.approve = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows: [resource] } = await pool.query(
      `UPDATE resources SET is_approved = true, approved_by = $1, approval_date = NOW()
       WHERE resource_id = $2 RETURNING *`,
      [req.user.id, id]
    );
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    await logAction({
      userId: req.user.id, userEmail: req.user.email, action: 'APPROVE',
      entityType: 'resources', entityId: id, description: 'Resource approved', actionResult: 'SUCCESS'
    });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Archive a resource (set is_active = false)
exports.archive = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE resources SET is_active = false, updated_at = NOW() WHERE resource_id = $1', [id]);
    await logAction({
      userId: req.user.id, userEmail: req.user.email, action: 'UPDATE',
      entityType: 'resources', entityId: id, description: 'Resource archived', actionResult: 'SUCCESS'
    });
    res.json({ message: 'Archived' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Permanent delete
exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM resources WHERE resource_id = $1', [id]);
    await logAction({
      userId: req.user.id, userEmail: req.user.email, action: 'DELETE',
      entityType: 'resources', entityId: id, description: 'Resource deleted', actionResult: 'SUCCESS'
    });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};