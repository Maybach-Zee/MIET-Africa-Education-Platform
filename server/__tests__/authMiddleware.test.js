const jwt = require('jsonwebtoken');

// ─── Mock pg BEFORE anything else loads ──────────────────────────────────────
// db.js does `new Pool()` at import time — so we must mock pg itself,
// not just db.js, otherwise a real connection attempt happens immediately.
const mockQuery = jest.fn((sql) => {
  if (sql.includes('SELECT centre_id'))
    return Promise.resolve({ rows: [] });           // user has no centre → skip deactivation check
  if (sql.includes('SELECT is_active'))
    return Promise.resolve({ rows: [{ is_active: true }] }); // centre is active
  return Promise.resolve({ rows: [] });             // SET LOCAL app.user_id / app.user_role
});

jest.mock('pg', () => {
  const mPool = {
    query: mockQuery,
    on: jest.fn(),   // pool.on('error', ...) in db.js
  };
  return { Pool: jest.fn(() => mPool) };
});

// ─── Now safe to load middleware ─────────────────────────────────────────────
const { verifyToken, authorize } = require('../src/middleware/auth');

const SECRET = process.env.JWT_SECRET || 'test-secret';

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

// ─── verifyToken tests ────────────────────────────────────────────────────────
describe('Auth Middleware — verifyToken', () => {
  beforeEach(() => mockQuery.mockClear());

  it('is exported as a function', () => {
    expect(typeof verifyToken).toBe('function');
  });

  it('calls next() with a valid token', async () => {
    const token = jwt.sign(
      { id: '00000000-0000-0000-0000-000000000001', role: 'FACILITATOR', email: 'test@miet.org' },
      SECRET
    );
    const req  = { headers: { authorization: `Bearer ${token}` } };
    const next = jest.fn();

    await verifyToken(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it('attaches decoded user to req when token is valid', async () => {
    const token = jwt.sign(
      { id: '00000000-0000-0000-0000-000000000042', role: 'ADMIN', email: 'admin@miet.org' },
      SECRET
    );
    const req  = { headers: { authorization: `Bearer ${token}` } };
    const next = jest.fn();

    await verifyToken(req, mockRes(), next);
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe('00000000-0000-0000-0000-000000000042');
    expect(req.user.role).toBe('ADMIN');
  });

  it('skips centre DB check for ADMIN users', async () => {
    const token = jwt.sign(
      { id: '00000000-0000-0000-0000-000000000001', role: 'ADMIN', email: 'admin@miet.org' },
      SECRET
    );
    const req  = { headers: { authorization: `Bearer ${token}` } };
    const next = jest.fn();

    await verifyToken(req, mockRes(), next);

    const centreCheckCalled = mockQuery.mock.calls.some(([sql]) =>
      sql.includes('SELECT centre_id')
    );
    expect(centreCheckCalled).toBe(false);
    expect(next).toHaveBeenCalled();
  });

  it('returns 401 when no token provided', async () => {
    const req = { headers: {} };
    const res = mockRes();

    await verifyToken(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 when Authorization header has wrong format', async () => {
    const req = { headers: { authorization: 'Basic abc123' } };
    const res = mockRes();

    await verifyToken(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 403 when token is invalid', async () => {
    const req  = { headers: { authorization: 'Bearer not.a.valid.token' } };
    const res  = mockRes();
    const next = jest.fn();

    await verifyToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when user belongs to a deactivated school', async () => {
    mockQuery.mockImplementation((sql) => {
      if (sql.includes('SELECT centre_id'))
        return Promise.resolve({ rows: [{ centre_id: 'ccc00000-0000-0000-0000-000000000001' }] });
      if (sql.includes('SELECT is_active'))
        return Promise.resolve({ rows: [{ is_active: false }] }); // ← deactivated
      return Promise.resolve({ rows: [] });
    });

    const token = jwt.sign(
      { id: '00000000-0000-0000-0000-000000000099', role: 'FACILITATOR', email: 'blocked@miet.org' },
      SECRET
    );
    const req  = { headers: { authorization: `Bearer ${token}` } };
    const res  = mockRes();
    const next = jest.fn();

    await verifyToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

// ─── authorize tests ──────────────────────────────────────────────────────────
describe('Auth Middleware — authorize', () => {
  it('calls next() when user has the required role', () => {
    const req  = { user: { id: '1', role: 'ADMIN' } };
    const next = jest.fn();

    authorize('ADMIN')(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 403 when user has wrong role', () => {
    const req = { user: { id: '1', role: 'FACILITATOR' } };
    const res = mockRes();

    authorize('ADMIN')(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 403 when req.user is missing', () => {
    const res = mockRes();

    authorize('ADMIN')({ headers: {} }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('allows multiple roles', () => {
    const req  = { user: { id: '1', role: 'PRINCIPAL' } };
    const next = jest.fn();

    authorize('ADMIN', 'PRINCIPAL', 'FACILITATOR')(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });
});