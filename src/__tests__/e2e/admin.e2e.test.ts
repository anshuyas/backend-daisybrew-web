import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';
import bcrypt from 'bcryptjs';

describe('Admin E2E Flows', () => {
  const adminUser = {
    email: 'admin@example.com',
    password: '12345678',
    role: 'admin',
  };

  let adminToken: string;
  let newUserId: string;

  beforeAll(async () => {
    // Ensure admin exists
    const existingAdmin = await UserModel.findOne({ email: adminUser.email });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminUser.password, 10);
      await UserModel.create({ ...adminUser, password: hashedPassword });
    }

    // Login as admin
    const loginRes = await request(app).post('/api/auth/login').send(adminUser);
    adminToken = loginRes.body.token;
  });

  afterAll(async () => {
    // Cleanup created user
    if (newUserId) await UserModel.findByIdAndDelete(newUserId);
  });

  it('should create, update, fetch, and delete a user', async () => {
    //Create user
    const createRes = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'e2eadminuser@test.com', password: 'UserPass123!', role: 'user' });
    expect(createRes.status).toBe(201);
    newUserId = createRes.body.user._id;

    //Fetch all users
    const fetchAll = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(fetchAll.status).toBe(200);

    //Fetch single user
    const fetchOne = await request(app)
      .get(`/api/admin/users/${newUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(fetchOne.status).toBe(200);

    //Update user
    const update = await request(app)
      .put(`/api/admin/users/${newUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'admin' });
    expect(update.status).toBe(200);

    // Delete user
    const del = await request(app)
      .delete(`/api/admin/users/${newUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(del.status).toBe(200);
    // newUserId = undefined; // prevent cleanup error
  });
});
