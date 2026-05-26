const request = require('supertest');
const app = require('../src/app'); // ✅ app.js, not server.js

describe('Donation Routes', () => {
  it('GET /api/donations — returns 401 without token', async () => {
    const res = await request(app).get('/api/donations');
    expect([401, 403]).toContain(res.statusCode);
  });

  it('POST /api/donations — returns 401 without token', async () => {
    const res = await request(app)
      .post('/api/donations')
      .send({ amount: 500, donor: 'Test Donor' });
    expect([401, 403]).toContain(res.statusCode);
  });
});

describe('Enrolment Routes', () => {
  it('GET /api/enrolments — returns 401 without token', async () => {
    const res = await request(app).get('/api/enrolments');
    expect([401, 403]).toContain(res.statusCode);
  });

  it('POST /api/enrolments — returns 401 without token', async () => {
    const res = await request(app)
      .post('/api/enrolments')
      .send({ learnerId: 1, courseId: 1 });
    expect([401, 403]).toContain(res.statusCode);
  });
});