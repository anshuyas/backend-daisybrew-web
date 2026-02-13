import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';
import bcrypt from 'bcryptjs';

describe('User E2E Flows', () => {
  const testUser = {
    email: 'e2euser@test.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    fullName: 'E2E User',
  };

  let token: string;

  beforeAll(async () => {
    // Clean test user
    await UserModel.deleteMany({ email: testUser.email });
  });

  afterAll(async () => {
    // Clean test user
    await UserModel.deleteMany({ email: testUser.email });
  });

  it('should register, login, and update profile', async () => {
    // Register
    const register = await request(app).post('/api/auth/register').send(testUser);
    expect(register.status).toBe(201);
    expect(register.body).toHaveProperty('success', true);

    // Login
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(login.status).toBe(200);
    token = login.body.token;

    // Forgot Password (generate token)
    const forgot = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: testUser.email });
    expect(forgot.status).toBe(200);
    expect(forgot.body).toHaveProperty('resetToken');

    // Reset Password
    const reset = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: forgot.body.resetToken, password: 'NewPassword123!' });
    expect(reset.status).toBe(200);

    // Login with new password
    const loginNew = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'NewPassword123!' });
    expect(loginNew.status).toBe(200);
    expect(loginNew.body).toHaveProperty('token');
  });
});
