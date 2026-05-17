const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }

    // Block users from inactive schools (except admins)
if (decoded.role !== 'ADMIN') {
  try {
    const { rows: [user] } = await pool.query(
      'SELECT centre_id FROM users WHERE user_id = $1',
      [decoded.id]
    );
    if (user?.centre_id) {
      const { rows: [centre] } = await pool.query(
        'SELECT is_active FROM centres WHERE centre_id = $1',
        [user.centre_id]
      );
      if (centre && !centre.is_active) {
        return res.status(403).json({
          message: 'Your school has been deactivated. Please contact the administrator.',
        });
      }
    }
  } catch (err) {
    console.error('checkActiveCentre error:', err);
  }
}

    // Set PostgreSQL session variables for RLS
    await pool.query(
      `SET LOCAL app.user_id = '${decoded.id}';
       SET LOCAL app.user_role = '${decoded.role}';`
    );

    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role))
      return res.status(403).json({ message: 'Insufficient permissions' });
    next();
  };
};

module.exports = { verifyToken, authorize };