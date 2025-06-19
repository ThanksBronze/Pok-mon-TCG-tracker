/* eslint-env jest */
const request = require('supertest');
const app = require('../app');

describe('Base Express App', () => {
  it('GET / should return 200 OK', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });

  it('Unknown routes return 404', async () => {
    const res = await request(app).get('/no-such-route');
    expect(res.statusCode).toBe(404);
  });
});