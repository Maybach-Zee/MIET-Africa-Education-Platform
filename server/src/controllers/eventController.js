const pool = require('../config/db');
const { logAction } = require('../utils/auditLogger');

// Get all events (admin/manager)
exports.getAll = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT s.*, c.title AS course_title
       FROM sessions s
       JOIN courses c ON s.course_id = c.course_id
       WHERE s.is_cancelled = false
       ORDER BY s.session_date DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get events for the principal's school
exports.getPrincipalEvents = async (req, res) => {
  try {
    const manager = await pool.query(
      'SELECT centre_id FROM users WHERE user_id = $1',
      [req.user.id]
    );
    if (!manager.rows[0]?.centre_id) return res.json([]);

    const centreId = manager.rows[0].centre_id;
    const { rows } = await pool.query(
      `SELECT s.*, c.title AS course_title
       FROM sessions s
       JOIN courses c ON s.course_id = c.course_id
       WHERE c.centre_id = $1 AND s.is_cancelled = false
       ORDER BY s.session_date DESC`,
      [centreId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create event (admin can create any; manager only for own school)
exports.create = async (req, res) => {
  const {
    course_id, session_date, session_start_time, session_end_time,
    topic, description, venue, facilitator_id
  } = req.body;

  try {
    // If MANAGER, verify the course belongs to their school
    if (req.user.role === 'MANAGER') {
      const centreCheck = await pool.query(
        'SELECT centre_id FROM courses WHERE course_id = $1',
        [course_id]
      );
      const managerCentre = await pool.query(
        'SELECT centre_id FROM users WHERE user_id = $1',
        [req.user.id]
      );
      const schoolId = managerCentre.rows[0]?.centre_id;
      if (!schoolId || !centreCheck.rows[0] || centreCheck.rows[0].centre_id !== schoolId) {
        return res.status(403).json({ message: 'Course not associated with your school' });
      }
      // Ensure facilitator belongs to the same school
      if (facilitator_id) {
        const facilitatorCheck = await pool.query(
          'SELECT centre_id FROM users WHERE user_id = $1 AND role = \'FACILITATOR\'',
          [facilitator_id]
        );
        if (!facilitatorCheck.rows[0] || facilitatorCheck.rows[0].centre_id !== schoolId) {
          return res.status(403).json({ message: 'Facilitator not from your school' });
        }
      }
    }

    const { rows: [session] } = await pool.query(
      `INSERT INTO sessions (course_id, session_date, session_start_time, session_end_time, topic, description, venue, facilitator_id, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [course_id, session_date, session_start_time, session_end_time, topic, description, venue, facilitator_id, req.user.id]
    );
    await logAction({
      userId: req.user.id, userEmail: req.user.email, action: 'CREATE',
      entityType: 'sessions', entityId: session.session_id,
      description: 'Event created', actionResult: 'SUCCESS'
    });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel an event
exports.cancel = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE sessions SET is_cancelled = true WHERE session_id = $1', [id]);
    await logAction({
      userId: req.user.id, userEmail: req.user.email, action: 'UPDATE',
      entityType: 'sessions', entityId: id,
      description: 'Event cancelled', actionResult: 'SUCCESS'
    });
    res.json({ message: 'Cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get events available for the facilitator (same centre as the facilitator)
exports.getFacilitatorEvents = async (req, res) => {
  try {
    const user = await pool.query('SELECT centre_id FROM users WHERE user_id = $1', [req.user.id]);
    if (!user.rows[0]?.centre_id) return res.json([]);
    const centreId = user.rows[0].centre_id;

    const { rows } = await pool.query(
      `SELECT s.*, c.title AS course_title
       FROM sessions s
       JOIN courses c ON s.course_id = c.course_id
       WHERE c.centre_id = $1 AND s.is_cancelled = false
       ORDER BY s.session_date DESC`,
      [centreId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register for an event
exports.registerForEvent = async (req, res) => {
  const { session_id } = req.body;
  try {
    // Check that the facilitator belongs to the same centre as the session's course
    const user = await pool.query('SELECT centre_id FROM users WHERE user_id = $1', [req.user.id]);
    const course = await pool.query(
      'SELECT c.centre_id FROM courses c JOIN sessions s ON s.course_id = c.course_id WHERE s.session_id = $1',
      [session_id]
    );
    if (!user.rows[0]?.centre_id || !course.rows[0] || user.rows[0].centre_id !== course.rows[0].centre_id) {
      return res.status(403).json({ message: 'Event not available for your school' });
    }

    // Insert registration (ignore if already registered)
    await pool.query(
      `INSERT INTO event_registrations (session_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [session_id, req.user.id]
    );
    res.json({ message: 'Registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel registration
exports.cancelRegistration = async (req, res) => {
  const { session_id } = req.body;
  try {
    await pool.query(
      'DELETE FROM event_registrations WHERE session_id = $1 AND user_id = $2',
      [session_id, req.user.id]
    );
    res.json({ message: 'Registration cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get my registrations (facilitator)
exports.getMyRegistrations = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT er.registration_id, er.session_id, er.registered_at,
              s.session_date, s.topic, c.title AS course_title
       FROM event_registrations er
       JOIN sessions s ON er.session_id = s.session_id
       JOIN courses c ON s.course_id = c.course_id
       WHERE er.user_id = $1
       ORDER BY s.session_date DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Placeholder: send reminders for events happening in 48 hours (admin can trigger)
exports.sendReminders = async (req, res) => {
  try {
    const { rows: events } = await pool.query(
      `SELECT s.session_id, s.topic, s.session_date, c.title AS course_title
       FROM sessions s
       JOIN courses c ON s.course_id = c.course_id
       WHERE s.session_date = CURRENT_DATE + INTERVAL '2 days'
         AND s.is_cancelled = false`
    );
    // In a real system, you'd fetch registered users and send push/email.
    // For now, just log or return the events.
    res.json({ message: `Found ${events.length} events to remind`, events });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.registerForEvent = async (req, res) => {
  const { session_id } = req.body;
  try {
    await pool.query(
      `INSERT INTO event_registrations (session_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [session_id, req.user.id]
    );
    res.json({ message: 'Registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelRegistration = async (req, res) => {
  const { session_id } = req.body;
  try {
    await pool.query(
      'DELETE FROM event_registrations WHERE session_id = $1 AND user_id = $2',
      [session_id, req.user.id]
    );
    res.json({ message: 'Registration cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyRegistrations = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT er.registration_id, er.session_id, er.registered_at,
              s.session_date, s.topic, c.title AS course_title
       FROM event_registrations er
       JOIN sessions s ON er.session_id = s.session_id
       JOIN courses c ON s.course_id = c.course_id
       WHERE er.user_id = $1
       ORDER BY s.session_date DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRegistrations = async (req, res) => {
  const { id } = req.params;
  try {
    const manager = await pool.query('SELECT centre_id FROM users WHERE user_id = $1', [req.user.id]);
    if (!manager.rows[0]?.centre_id) return res.status(403).json({ message: 'No school' });
    const centreId = manager.rows[0].centre_id;

    // Verify event belongs to manager's school
    const eventCheck = await pool.query(
      `SELECT 1 FROM sessions s
       JOIN courses c ON s.course_id = c.course_id
       WHERE s.session_id = $1 AND c.centre_id = $2`,
      [id, centreId]
    );
    if (eventCheck.rows.length === 0) return res.status(404).json({ message: 'Event not found' });

    const { rows } = await pool.query(
      `SELECT u.user_id, u.full_name, u.email, er.registered_at
       FROM event_registrations er
       JOIN users u ON er.user_id = u.user_id
       WHERE er.session_id = $1
       ORDER BY u.full_name`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};