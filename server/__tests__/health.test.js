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

describe('Server Health', () => {
  it('server is responding — known route returns non-5xx', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBeLessThan(500);
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