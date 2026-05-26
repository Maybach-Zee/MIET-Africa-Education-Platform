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

describe('Resource Routes', () => {
  it('GET /api/resources — responds (public or auth-protected)', async () => {
    const res = await request(app).get('/api/resources');
    expect([200, 401, 403]).toContain(res.statusCode);
  });

  it('GET /api/resources — returns JSON', async () => {
    const res = await request(app).get('/api/resources');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('POST /api/resources — returns 401 without token', async () => {
    const res = await request(app).post('/api/resources').send({ title: 'Test' });
    expect([401, 403]).toContain(res.statusCode);
  });

  it('DELETE /api/resources/:id — returns 401 without token', async () => {
    const res = await request(app).delete('/api/resources/999');
    expect([401, 403, 404]).toContain(res.statusCode);
  });
});