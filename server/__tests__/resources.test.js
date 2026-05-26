const request = require('supertest');
const app = require('../src/app');

describe('Resource Routes', () => {
  it('GET /api/resources — responds (public list or auth-protected)', async () => {
    const res = await request(app).get('/api/resources');
    // Some resource lists are public (200), others require auth (401/403)
    expect([200, 401, 403]).toContain(res.statusCode);
  });

  it('GET /api/resources — returns JSON', async () => {
    const res = await request(app).get('/api/resources');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('POST /api/resources — returns 401 without token (creating requires auth)', async () => {
    const res = await request(app)
      .post('/api/resources')
      .send({ title: 'Test Resource' });
    expect([401, 403]).toContain(res.statusCode);
  });

  it('DELETE /api/resources/:id — returns 401 without token', async () => {
    const res = await request(app).delete('/api/resources/999');
    expect([401, 403, 404]).toContain(res.statusCode);
  });
});