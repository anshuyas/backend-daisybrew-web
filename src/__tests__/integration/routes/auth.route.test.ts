import request from 'supertest';
import { UserModel } from '../../../models/user.model';
import app from '../../../app';

describe('Auth Routes Integration Tests', () => {
  const testUser = {
    email: 'integration@test.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    fullName: 'Integration User',
  };

  let resetToken: string;

  beforeAll(async () => {
    // Clean up user before tests
    await UserModel.deleteMany({ email: testUser.email });
  });

  afterAll(async () => {
    // Clean up user after tests
    await UserModel.deleteMany({ email: testUser.email });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('success', true);
    });

    it('should not register a user with duplicate email', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');
    });

    it('should fail login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'WrongPassword!' });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should generate a reset token for valid email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('resetToken');
      resetToken = res.body.resetToken;
    });

    it('should not fail for non-existing email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'notfound@test.com' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: resetToken, password: 'NewPassword123!' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty(
        'message',
        'Password has been reset successfully'
      );
    });

    it('should fail reset with invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'invalidtoken', password: 'Password123!' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should fail reset if token is missing', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ password: 'Password123!' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});