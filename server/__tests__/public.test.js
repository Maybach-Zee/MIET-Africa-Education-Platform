const request = require('supertest');
const app = require('../src/app'); // ✅ app.js, not server.js

describe('Public Routes', () => {
  it('GET /api/public/impact — returns 200 (no auth needed)', async () => {
    const res = await request(app).get('/api/public/impact');
    expect(res.statusCode).toBe(200);
  });

  it('GET /api/public/impact — returns JSON', async () => {
    const res = await request(app).get('/api/public/impact');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET /api/public/donations — returns 200 or 404 (no auth needed)', async () => {
    const res = await request(app).get('/api/public/donations');
    expect([200, 404]).toContain(res.statusCode);
  });
});