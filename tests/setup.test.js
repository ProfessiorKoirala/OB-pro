const request = require('supertest');
const app = require('../src/index');

describe('API Health Checks', () => {
  it('should return API information', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);
    
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('features');
    expect(response.body.name).toBe('Advanced Accounting System API');
  });
  
  it('should return health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('timestamp');
  });
  
  it('should return 404 for unknown endpoints', async () => {
    const response = await request(app)
      .get('/api/unknown-endpoint')
      .expect(404);
    
    expect(response.body).toHaveProperty('error', 'Endpoint not found');
  });
});

describe('Authentication', () => {
  it('should require authentication for protected routes', async () => {
    const response = await request(app)
      .get('/api/accounts')
      .expect(401);
    
    expect(response.body).toHaveProperty('error');
  });
  
  it('should reject invalid tokens', async () => {
    const response = await request(app)
      .get('/api/accounts')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
    
    expect(response.body).toHaveProperty('error');
  });
});
