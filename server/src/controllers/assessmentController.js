const pool = require('../config/db');
const { logAction } = require('../utils/auditLogger');

exports.getAll = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, l.first_name || ' ' || l.last_name AS learner_name
       FROM assessments a
       JOIN enrolments e ON a.enrolment_id = e.enrolment_id
       JOIN learners l ON e.learner_id = l.learner_id
       ORDER BY a.assessment_date DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  const { enrolment_id, module_title, assessment_type, score, max_score, assessor_id, unit_standard_code } = req.body;
  try {
    // result is auto-calculated by trigger, so we just insert score/max
    const { rows: [assessment] } = await pool.query(
      `INSERT INTO assessments (enrolment_id, module_title, assessment_type, score, max_score, assessor_id, unit_standard_code, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [enrolment_id, module_title, assessment_type, score, max_score, assessor_id, unit_standard_code, req.user.id]
    );
    await logAction({ userId: req.user.id, userEmail: req.user.email, action: 'CREATE', entityType: 'assessments', entityId: assessment.assessment_id, description: 'Assessment recorded', actionResult: 'SUCCESS' });
    res.status(201).json(assessment);
  } catch (err) { res.status(500).json({ message: err.message }); }
};