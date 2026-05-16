const pool = require('../config/db');

// Get courses assigned to the facilitator
exports.getMyCourses = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, fa.is_primary,
              (SELECT COUNT(*) FROM enrolments e WHERE e.course_id = c.course_id) AS learner_count
       FROM facilitator_assignments fa
       JOIN courses c ON fa.course_id = c.course_id
       WHERE fa.user_id = $1 AND c.is_active = true
       ORDER BY c.title`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get sessions for courses the facilitator is assigned to
exports.getMySessions = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT s.*, c.title AS course_title
       FROM sessions s
       JOIN courses c ON s.course_id = c.course_id
       JOIN facilitator_assignments fa ON fa.course_id = c.course_id
       WHERE fa.user_id = $1
       ORDER BY s.session_date DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get assessments the facilitator has marked (or all assessments for their courses)
exports.getMyAssessments = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*,
              e.learner_id,
              l.first_name || ' ' || l.last_name AS learner_name,
              c.title AS course_title
       FROM assessments a
       JOIN enrolments e ON a.enrolment_id = e.enrolment_id
       JOIN learners l ON e.learner_id = l.learner_id
       JOIN courses c ON e.course_id = c.course_id
       JOIN facilitator_assignments fa ON fa.course_id = c.course_id
       WHERE fa.user_id = $1
       ORDER BY a.assessment_date DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get attendance records the facilitator recorded (or all attendance for their sessions)
exports.getMyAttendance = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT att.*,
              s.topic AS session_topic,
              s.session_date,
              l.first_name || ' ' || l.last_name AS learner_name,
              c.title AS course_title
       FROM attendance att
       JOIN sessions s ON att.session_id = s.session_id
       JOIN enrolments e ON att.enrolment_id = e.enrolment_id
       JOIN learners l ON e.learner_id = l.learner_id
       JOIN courses c ON e.course_id = c.course_id
       JOIN facilitator_assignments fa ON fa.course_id = c.course_id
       WHERE fa.user_id = $1
       ORDER BY att.recorded_at DESC
       LIMIT 50`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get enrolled learners for a specific session's course
exports.getSessionLearners = async (req, res) => {
    const { sessionId } = req.params;
    try {
      // Verify the facilitator is assigned to this session's course
      const check = await pool.query(
        `SELECT 1 FROM facilitator_assignments fa
         JOIN sessions s ON s.course_id = fa.course_id
         WHERE fa.user_id = $1 AND s.session_id = $2`,
        [req.user.id, sessionId]
      );
      if (check.rows.length === 0) {
        return res.status(403).json({ message: 'Not authorised for this session' });
      }
  
      const { rows } = await pool.query(
        `SELECT e.enrolment_id, l.first_name, l.last_name, l.id_number,
                COALESCE(att.present, false) AS present,
                att.arrival_time, att.departure_time, att.notes
         FROM enrolments e
         JOIN learners l ON e.learner_id = l.learner_id
         JOIN sessions s ON s.course_id = e.course_id AND s.session_id = $1
         LEFT JOIN attendance att ON att.enrolment_id = e.enrolment_id AND att.session_id = s.session_id
         WHERE e.completion_status IN ('ENROLLED', 'IN_PROGRESS')
         ORDER BY l.last_name, l.first_name`,
        [sessionId]
      );
      res.json(rows);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  // Save or update attendance for a session
  exports.saveAttendance = async (req, res) => {
    const { sessionId } = req.params;
    const { records } = req.body;  // array of { enrolment_id, present, arrival_time, departure_time, notes }
  
    // Verify facilitator is assigned to this session's course
    const check = await pool.query(
      `SELECT 1 FROM facilitator_assignments fa
       JOIN sessions s ON s.course_id = fa.course_id
       WHERE fa.user_id = $1 AND s.session_id = $2`,
      [req.user.id, sessionId]
    );
    if (check.rows.length === 0) {
      return res.status(403).json({ message: 'Not authorised' });
    }
  
    try {
      for (const rec of records) {
        await pool.query(
          `INSERT INTO attendance (enrolment_id, session_id, present, arrival_time, departure_time, notes, recorded_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (enrolment_id, session_id)
           DO UPDATE SET present = EXCLUDED.present,
                         arrival_time = EXCLUDED.arrival_time,
                         departure_time = EXCLUDED.departure_time,
                         notes = EXCLUDED.notes,
                         recorded_by = EXCLUDED.recorded_by,
                         updated_at = CURRENT_TIMESTAMP`,
          [rec.enrolment_id, sessionId, rec.present, rec.arrival_time || null, rec.departure_time || null, rec.notes || null, req.user.id]
        );
      }
      res.json({ message: 'Attendance saved' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  // Get learners enrolled in a course (for assessments)
  exports.getCourseLearners = async (req, res) => {
    const { courseId } = req.params;
    try {
      // Check facilitator is assigned to this course
      const check = await pool.query(
        `SELECT 1 FROM facilitator_assignments WHERE user_id = $1 AND course_id = $2`,
        [req.user.id, courseId]
      );
      if (check.rows.length === 0) return res.status(403).json({ message: 'Not assigned to this course' });
  
      const { rows } = await pool.query(
        `SELECT e.enrolment_id, l.first_name, l.last_name, l.id_number
         FROM enrolments e
         JOIN learners l ON e.learner_id = l.learner_id
         WHERE e.course_id = $1 AND e.completion_status IN ('ENROLLED', 'IN_PROGRESS')
         ORDER BY l.last_name, l.first_name`,
        [courseId]
      );
      res.json(rows);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  // Record a new assessment
  exports.createAssessment = async (req, res) => {
    const { enrolment_id, module_title, assessment_type, score, max_score, unit_standard_code, assessment_date } = req.body;
  
    // Verify facilitator is assigned to this enrolment's course
    const check = await pool.query(
      `SELECT 1 FROM facilitator_assignments fa
       JOIN enrolments e ON e.course_id = fa.course_id
       WHERE fa.user_id = $1 AND e.enrolment_id = $2`,
      [req.user.id, enrolment_id]
    );
    if (check.rows.length === 0) return res.status(403).json({ message: 'Not authorised' });
  
    // Check for duplicate assessment type per enrolment and module
    const duplicate = await pool.query(
      `SELECT 1 FROM assessments
       WHERE enrolment_id = $1 AND module_title = $2 AND assessment_type = $3`,
      [enrolment_id, module_title, assessment_type]
    );
    if (duplicate.rows.length > 0) {
      return res.status(409).json({
        message: `Learner already has a ${assessment_type} assessment for module "${module_title}".`
      });
    }
  
    try {
      const { rows: [assessment] } = await pool.query(
        `INSERT INTO assessments (enrolment_id, module_title, assessment_type, score, max_score, unit_standard_code, assessment_date, assessor_id, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [enrolment_id, module_title, assessment_type, score, max_score, unit_standard_code, assessment_date || new Date(), req.user.id, req.user.id]
      );
      res.status(201).json(assessment);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  exports.getSchool = async (req, res) => {
    try {
      const user = await pool.query('SELECT centre_id FROM users WHERE user_id = $1', [req.user.id]);
      if (!user.rows[0]?.centre_id) return res.json(null);
      const { rows: [centre] } = await pool.query(
        'SELECT * FROM centres WHERE centre_id = $1',
        [user.rows[0].centre_id]
      );
      res.json(centre);
    } catch (err) { res.status(500).json({ message: err.message }); }
  };