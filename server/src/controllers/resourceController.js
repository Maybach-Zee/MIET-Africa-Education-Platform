const pool = require('../config/db');
const { logAction } = require('../utils/auditLogger');

// Public: only approved & active resources
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

// Summary per school (admin)
exports.getSummary = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.centre_id, c.centre_name,
              COUNT(r.resource_id) AS total_resources,
              COUNT(CASE WHEN r.is_approved = true AND r.is_active = true THEN 1 END) AS approved_resources
       FROM centres c
       LEFT JOIN users u ON u.centre_id = c.centre_id AND u.role = 'MANAGER'
       LEFT JOIN resources r ON r.uploaded_by = u.user_id
       GROUP BY c.centre_id, c.centre_name
       ORDER BY c.centre_name`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Resources belonging to the principal's school
// resources belonging to the principal's school
exports.getMyResources = async (req, res) => {
  try {
    // 1. Get the principal's centre_id
    const manager = await pool.query(
      'SELECT centre_id FROM users WHERE user_id = $1',
      [req.user.id]
    );
    if (!manager.rows[0]?.centre_id) return res.json([]);

    const centreId = manager.rows[0].centre_id;

    // 2. Fetch resources where the uploader belongs to this centre
    //    (no need for r.centre_id column)
    const { rows } = await pool.query(
      `SELECT r.*, u.full_name AS uploaded_by_name
       FROM resources r
       JOIN users u ON r.uploaded_by = u.user_id
       WHERE u.centre_id = $1
         AND r.is_active = true
       ORDER BY r.created_at DESC`,
      [centreId]
    );

    res.json(rows);
  } catch (err) {
    console.error('getMyResources error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Create a new resource (auto‑links centre for MANAGER)
exports.create = async (req, res) => {
  const { title, description, type, grade_start, grade_end, subject, language } = req.body;
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const { rows: [resource] } = await pool.query(
      `INSERT INTO resources (title, description, type, grade_start, grade_end, subject, language, file_url, uploaded_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        title,
        description,
        type,
        grade_start ? parseInt(grade_start, 10) : null,
        grade_end ? parseInt(grade_end, 10) : null,
        subject,
        language,
        fileUrl,
        req.user.id
      ]
    );

    // audit logging (unchanged, but wrap in its own try/catch as earlier)
    try {
      await logAction({
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'CREATE',
        entityType: 'resources',
        entityId: resource.resource_id,
        description: 'Resource created',
        actionResult: 'SUCCESS'
      });
    } catch (auditErr) {
      console.error('Audit log failed:', auditErr);
    }

    res.status(201).json(resource);
  } catch (err) {
    console.error('Create resource error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getFacilitatorResources = async (req, res) => {
  try {
    // Get facilitator's school
    const user = await pool.query('SELECT centre_id FROM users WHERE user_id = $1', [req.user.id]);
    if (!user.rows[0]?.centre_id) return res.json([]);
    const centreId = user.rows[0].centre_id;

    // Fetch approved & active resources for that school (via uploader)
    const { rows } = await pool.query(
      `SELECT r.*, u.full_name AS uploaded_by_name
       FROM resources r
       JOIN users u ON r.uploaded_by = u.user_id
       WHERE u.centre_id = $1
         AND r.is_active = true
         AND r.is_approved = true
       ORDER BY r.created_at DESC`,
      [centreId]
    );
    res.json(rows);
  } catch (err) {
    console.error('getFacilitatorResources error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Update an existing resource
exports.update = async (req, res) => {
  const { id } = req.params;
  const { title, description, type, grade_start, grade_end, subject, language } = req.body;
  let fileUrl = null;
  if (req.file) fileUrl = `/uploads/${req.file.filename}`;

  try {
    const { rows: [current] } = await pool.query('SELECT * FROM resources WHERE resource_id = $1', [id]);
    if (!current) return res.status(404).json({ message: 'Resource not found' });

    const newTitle = title !== undefined ? title : current.title;
    const newDescription = description !== undefined ? description : current.description;
    const newType = type !== undefined ? type : current.type;
    const newGradeStart = grade_start !== undefined ? (grade_start ? parseInt(grade_start, 10) : null) : current.grade_start;
    const newGradeEnd = grade_end !== undefined ? (grade_end ? parseInt(grade_end, 10) : null) : current.grade_end;
    const newSubject = subject !== undefined ? subject : current.subject;
    const newLanguage = language !== undefined ? language : current.language;
    const newFileUrl = fileUrl || current.file_url;

    const { rows: [resource] } = await pool.query(
      `UPDATE resources SET title=$1, description=$2, type=$3, grade_start=$4, grade_end=$5,
       subject=$6, language=$7, file_url=$8, updated_at=NOW()
       WHERE resource_id=$9 RETURNING *`,
      [newTitle, newDescription, newType, newGradeStart, newGradeEnd, newSubject, newLanguage, newFileUrl, id]
    );

    await logAction({
      userId: req.user.id, userEmail: req.user.email, action: 'UPDATE',
      entityType: 'resources', entityId: id, description: 'Resource updated', actionResult: 'SUCCESS'
    });
    res.json(resource);
  } catch (err) {
    console.error('Update resource error:', err);
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

// Archive (soft delete)
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