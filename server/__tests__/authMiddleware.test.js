const jwt = require('jsonwebtoken');

// ─── Mock pg BEFORE anything loads ───────────────────────────────────────────
// jest.mock is hoisted to the top by Babel/Jest, so we use a module-scoped
// variable assigned inside the factory to avoid the hoisting trap.
let mockQuery;

jest.mock('pg', () => {
  // mockQuery handles ALL query shapes the middleware sends:
  //   1. 'SELECT centre_id FROM users WHERE user_id = $1'
  //   2. 'SELECT is_active FROM centres WHERE centre_id = $1'
  //   3. Template literal: `SET LOCAL app.user_id = '...'; SET LOCAL ...`
  mockQuery = jest.fn().mockImplementation(() =>
    Promise.resolve({ rows: [] })
  );

  const mPool = { query: mockQuery, on: jest.fn() };
  return { Pool: jest.fn(() => mPool) };
});

const { verifyToken, authorize } = require('../src/middleware/auth');

const SECRET = process.env.JWT_SECRET || 'test-secret';

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

// ─── verifyToken ──────────────────────────────────────────────────────────────
describe('Auth Middleware — verifyToken', () => {
  beforeEach(() => {
    // Reset to default (always resolves) before each test
    mockQuery.mockImplementation(() => Promise.resolve({ rows: [] }));
  });

  it('is exported as a function', () => {
    expect(typeof verifyToken).toBe('function');
  });

  it('calls next() with a valid FACILITATOR token', async () => {
    const token = jwt.sign(
      { id: '00000000-0000-0000-0000-000000000001', role: 'FACILITATOR', email: 'test@miet.org' },
      SECRET
    );
    const next = jest.fn();
    await verifyToken({ headers: { authorization: `Bearer ${token}` } }, mockRes(), next);
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

  it('calls next() with a valid ADMIN token', async () => {
    const token = jwt.sign(
      { id: '00000000-0000-0000-0000-000000000001', role: 'ADMIN', email: 'admin@miet.org' },
      SECRET
    );
    const next = jest.fn();
    await verifyToken({ headers: { authorization: `Bearer ${token}` } }, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it('ADMIN users are allowed through successfully', async () => {
    const token = jwt.sign(
      { id: '00000000-0000-0000-0000-000000000001', role: 'ADMIN', email: 'admin@miet.org' },
      SECRET
    );
    const next = jest.fn();

    await verifyToken({ headers: { authorization: `Bearer ${token}` } }, mockRes(), next);

    // What matters: ADMIN gets through — next() is called
    expect(next).toHaveBeenCalled();
  });

  it('returns 401 when no token provided', async () => {
    const res = mockRes();
    await verifyToken({ headers: {} }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 when Authorization header has wrong format', async () => {
    const res = mockRes();
    await verifyToken({ headers: { authorization: 'Basic abc123' } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 403 when token is invalid', async () => {
    const res  = mockRes();
    const next = jest.fn();
    await verifyToken({ headers: { authorization: 'Bearer not.a.valid.token' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when user belongs to a deactivated school', async () => {
    // Override: user has a centre, and that centre is deactivated
    mockQuery.mockImplementation((sql) => {
      if (typeof sql === 'string' && sql.includes('SELECT centre_id'))
        return Promise.resolve({ rows: [{ centre_id: 'ccc00000-0000-0000-0000-000000000001' }] });
      if (typeof sql === 'string' && sql.includes('SELECT is_active'))
        return Promise.resolve({ rows: [{ is_active: false }] });
      return Promise.resolve({ rows: [] });
    });

    const token = jwt.sign(
      { id: '00000000-0000-0000-0000-000000000099', role: 'FACILITATOR', email: 'blocked@miet.org' },
      SECRET
    );
    const res  = mockRes();
    const next = jest.fn();

    await verifyToken({ headers: { authorization: `Bearer ${token}` } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

// ─── authorize ────────────────────────────────────────────────────────────────
describe('Auth Middleware — authorize', () => {
  it('calls next() when user has the required role', () => {
    const next = jest.fn();
    authorize('ADMIN')({ user: { id: '1', role: 'ADMIN' } }, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 403 when user has wrong role', () => {
    const res = mockRes();
    authorize('ADMIN')({ user: { id: '1', role: 'FACILITATOR' } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 403 when req.user is missing', () => {
    const res = mockRes();
    authorize('ADMIN')({ headers: {} }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('allows multiple roles', () => {
    const next = jest.fn();
    authorize('ADMIN', 'PRINCIPAL', 'FACILITATOR')(
      { user: { id: '1', role: 'PRINCIPAL' } }, mockRes(), next
    );
    expect(next).toHaveBeenCalled();
  });
});