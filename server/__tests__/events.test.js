const request = require('supertest');
const app = require('../src/app'); // ✅ app.js, not server.js

describe('Event Routes', () => {
  it('GET /api/events — returns 401 without token', async () => {
    const res = await request(app).get('/api/events');
    expect([401, 403]).toContain(res.statusCode);
  });

  it('GET /api/events — returns JSON', async () => {
    const res = await request(app).get('/api/events');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('POST /api/events — returns 401 without token', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({ title: 'Teacher Training', date: '2025-06-01' });
    expect([401, 403]).toContain(res.statusCode);
  });
});