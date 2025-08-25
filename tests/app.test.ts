const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

describe('Express Server Integration Tests', () => {
  it('GET / should return server running status', async () => {
    const res = await axios.get(`${BASE_URL}/`);
    expect(res.status).toBe(200);
    expect(res.data).toBe('Server is running.');
  });
});
