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
    const res = await request(app).post('/api/events').send({ title: 'Training' });
    expect([401, 403]).toContain(res.statusCode);
  });
});