const request = require('supertest');
const app = require('../src/app');

describe('Server Health', () => {
  it('GET / or any mounted route — server is responding', async () => {
    // /api/auth exists and is mounted, so hitting an invalid sub-route gives 404 not a crash
    const res = await request(app).get('/api/auth/nonexistent');
    expect(res.statusCode).toBeLessThan(500); // server is up if it's not a 5xx
  });

  it('GET /nonexistent — responds 404', async () => {
    const res = await request(app).get('/api/totally-unknown-route-xyz');
    expect(res.statusCode).toBe(404);
  });

  it('server responds with JSON on known routes', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.headers['content-type']).toMatch(/json/);
  });
});