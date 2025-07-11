const request = require('supertest');
const app = require('../index'); // Adjust if your app export is different

describe('GET /users', () => {
  it('should return all users', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
}); 