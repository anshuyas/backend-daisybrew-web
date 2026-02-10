import request from 'supertest';
import { UserModel } from '../../models/user.model';
import app from '../../app';

describe('Auth Integration Tests', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    fullName: 'Test User',
  };

  beforeAll(async () => {
    await UserModel.deleteMany({
      email: testUser.email
    });
  });

  afterAll(async () => {
    await UserModel.deleteMany({
      email: testUser.email
    });
  });

    describe('POST /api/auth/register', () => {
        test('should register a new user', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUser)
            
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('success', true);
        })

        test('should not register a new user with duplicate email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUser)
            
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('success', false);
        })

    });

    describe('POST /api/auth/login', () => {

        test('should login an existing user', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: testUser.email, password: testUser.password });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('token');
        });

        test('should not login with incorrect password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: testUser.email, password: 'WrongPassword!' });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('success', false);
        });
    });
});
