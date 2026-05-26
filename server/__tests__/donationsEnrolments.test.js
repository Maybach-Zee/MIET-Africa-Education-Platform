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

describe('Donation Routes', () => {
  it('GET /api/donations — returns 401 without token', async () => {
    const res = await request(app).get('/api/donations');
    expect([401, 403]).toContain(res.statusCode);
  });

  it('POST /api/donations — returns 401 without token', async () => {
    const res = await request(app).post('/api/donations').send({ amount: 500 });
    expect([401, 403]).toContain(res.statusCode);
  });
});

describe('Enrolment Routes', () => {
  it('GET /api/enrolments — returns 401 without token', async () => {
    const res = await request(app).get('/api/enrolments');
    expect([401, 403]).toContain(res.statusCode);
  });

  it('POST /api/enrolments — returns 401 without token', async () => {
    const res = await request(app).post('/api/enrolments').send({ learnerId: 1 });
    expect([401, 403]).toContain(res.statusCode);
  });
});