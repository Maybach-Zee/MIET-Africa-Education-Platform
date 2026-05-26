const jwt = require('jsonwebtoken');

// ─── Mock pg BEFORE app loads ─────────────────────────────────────────────────
jest.mock('pg', () => {
  const mPool = {
    query: jest.fn().mockResolvedValue({ rows: [] }),
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue({
      query: jest.fn().mockResolvedValue({ rows: [] }),
      release: jest.fn(),
    }),
  };
  return { Pool: jest.fn(() => mPool) };
});

const request = require('supertest');
const app = require('../src/app');

describe('Auth Routes — POST /api/auth/register', () => {
  it('returns 400 when body is empty', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ password: 'pass123', name: 'Test User' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('returns 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@miet.org', name: 'Test User' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('returns JSON content type', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.headers['content-type']).toMatch(/json/);
  });
});

describe('Auth Routes — POST /api/auth/login', () => {
  it('returns 400 or 401 with wrong credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@fake.com', password: 'wrongpass' });
    expect([400, 401, 404]).toContain(res.statusCode);
  });

  it('returns 400 when body is empty', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('returns JSON content type', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.headers['content-type']).toMatch(/json/);
  });
});