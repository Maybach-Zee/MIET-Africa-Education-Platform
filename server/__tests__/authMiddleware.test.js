const jwt = require('jsonwebtoken');

// ─── Mock the DB pool BEFORE requiring the middleware ───────────────────────
// Your auth middleware calls pool.query() after JWT verification.
// We mock it so tests never need a real Supabase connection.
jest.mock('../src/config/db', () => ({
  query: jest.fn().mockResolvedValue({ rows: [] }),
  connect: jest.fn().mockResolvedValue({
    query: jest.fn().mockResolvedValue({ rows: [] }),
    release: jest.fn(),
  }),
}));

// ─── Also mock checkActiveCentre / any middleware DB side-effects ────────────
// Auth middleware checks if the user's centre is active — mock that too
jest.mock('../src/middleware/auth', () => {
  const actual = jest.requireActual('../src/middleware/auth');
  return actual;
}, { virtual: false });

const authModule = require('../src/middleware/auth');

// Handle both export patterns: module.exports = fn  OR  module.exports = { protect }
const authMiddleware =
  typeof authModule === 'function'
    ? authModule
    : authModule.protect      ||
      authModule.authenticate  ||
      authModule.verifyToken   ||
      authModule.auth          ||
      Object.values(authModule).find(v => typeof v === 'function');

// ─── Mock response factory ────────────────────────────────────────────────────
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

const SECRET = process.env.JWT_SECRET || 'test-secret';

describe('Auth Middleware', () => {
  beforeEach(() => jest.clearAllMocks());

  it('is a callable function', () => {
    expect(typeof authMiddleware).toBe('function');
  });

  it('calls next() with a valid token', async () => {
    const token = jwt.sign(
      // Use a real UUID format since your DB column is uuid type
      { id: '00000000-0000-0000-0000-000000000001', role: 'facilitator' },
      SECRET
    );
    const req  = { headers: { authorization: `Bearer ${token}` } };
    const next = jest.fn();

    await authMiddleware(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 401 with no token', async () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 or 403 with an invalid token', async () => {
    const req = { headers: { authorization: 'Bearer badtoken' } };
    const res = mockRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);
    // Your middleware uses 403 for bad tokens — both are acceptable
    expect([401, 403]).toContain(res.status.mock.calls[0][0]);
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches user to req when token is valid', async () => {
    const token = jwt.sign(
      { id: '00000000-0000-0000-0000-000000000042', role: 'admin' },
      SECRET
    );
    const req  = { headers: { authorization: `Bearer ${token}` } };
    const next = jest.fn();

    await authMiddleware(req, mockRes(), next);
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe('00000000-0000-0000-0000-000000000042');
  });
});