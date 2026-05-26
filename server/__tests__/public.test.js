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

describe('Public Routes', () => {
  it('GET /api/public/impact — returns 200 (no auth needed)', async () => {
    const res = await request(app).get('/api/public/impact');
    expect(res.statusCode).toBe(200);
  });

  it('GET /api/public/impact — returns JSON', async () => {
    const res = await request(app).get('/api/public/impact');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET /api/public/donations — returns 200 or 404', async () => {
    const res = await request(app).get('/api/public/donations');
    expect([200, 404]).toContain(res.statusCode);
  });
});