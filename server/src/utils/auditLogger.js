const pool = require('../config/db');

const logAction = async ({ userId, userEmail, action, entityType, entityId, oldValues, newValues, description, ipAddress, userAgent, actionResult }) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, user_email, action, entity_type, entity_id, old_values, new_values, description, ip_address, user_agent, action_result)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [userId, userEmail, action, entityType, entityId, oldValues || null, newValues || null, description, ipAddress, userAgent, actionResult]
    );
  } catch (err) {
    console.error('Audit log error:', err);
  }
};

module.exports = { logAction };