import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';
import bcryptjs from 'bcryptjs';

describe('Auth Password Integration Tests', () => {
  const testUser = {
    email: 'reset@test.com',
    password: 'Password123!',
    role: 'user',
    fullName: 'Reset Test User',
  };

  let resetToken: string;

  beforeAll(async () => {
    await UserModel.deleteMany({ email: testUser.email });

    const hashedPassword = await bcryptjs.hash(testUser.password, 10);

    await UserModel.create({
      email: testUser.email,
      password: hashedPassword,
      role: testUser.role,
      fullName: 'Test Reset User',
    });
  });

  afterAll(async () => {
    await UserModel.deleteMany({ email: testUser.email });
  });

  //  Forgot password – valid email
  test('POST /api/auth/forgot-password → should generate reset token', async () => {
    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: testUser.email });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      'message',
      'Password reset link has been sent to your email'
    );
    expect(response.body).toHaveProperty('resetToken');

    resetToken = response.body.resetToken;
  });

  //  Forgot password – invalid email (should not reveal info)
  test('POST /api/auth/forgot-password → should not fail for non-existing email', async () => {
    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'notfound@test.com' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
  });

  //  Reset password – valid token
  test('POST /api/auth/reset-password → should reset password with valid token', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken,
        password: 'NewPassword123!',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      'message',
      'Password has been reset successfully'
    );
  });

  // Reset password – invalid token
  test('POST /api/auth/reset-password → should fail with invalid token', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: 'invalidtoken123',
        password: 'Password123!',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  // Reset password – missing token
  test('POST /api/auth/reset-password → should fail when token is missing', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        password: 'Password123!',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});
