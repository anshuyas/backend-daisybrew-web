import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';
import bcrypt from 'bcryptjs';

let adminToken: string;

describe('Admin Users Integration Tests', () => {

    beforeAll(async () => {

    // Create admin user if not exists
  const existingAdmin = await UserModel.findOne({ email: 'admin@example.com' });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('12345678', 10);
    await UserModel.create({
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      fullName: 'Admin Here',
    });
  }
  
    const response = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'admin@example.com',
            password: '12345678'
        });
    // console.log('ADMIN TOKEN:', adminToken);
      console.log("LOGIN RESPONSE:", response.body); 
    expect(response.status).toBe(200); 

    adminToken = response.body.token;
});

    //GET all users
    describe('GET /api/admin/users', () => {
        it('should fetch all users (admin only)', async () => {
            const response = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
        });
    });

    // GET single user by ID
describe('GET /api/admin/users/:id', () => {
  let userId: string;

  beforeAll(async () => {
    // Get a valid user ID
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    userId = res.body.users[0]._id || res.body.users[0].id;

    // Ensure non-admin user exists for 403 test
    const existingUser = await UserModel.findOne({ email: 'user@example.com' });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('userpass', 10);
      await UserModel.create({
        email: 'user@example.com',
        password: hashedPassword,
        role: 'user',
        fullName: 'User',
      });
    }
  });

  it('should fetch a single user by ID (admin only)', async () => {
    const res = await request(app)
      .get(`/api/admin/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email');
    expect(res.body).toHaveProperty('role');
  });

  it('should return 404 if user does not exist', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await request(app)
      .get(`/api/admin/users/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'User not found');
  });

  it('should return 401 if token is missing', async () => {
    const res = await request(app).get(`/api/admin/users/${userId}`);
    expect(res.status).toBe(401);
  });

  it('should return 403 if user is not admin', async () => {
    // Login as non-admin user
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'userpass' });

    const token = loginRes.body.token;

    const res = await request(app)
      .get(`/api/admin/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403); 
});
});

// POST CREATE user (admin)
describe('POST /api/admin/users', () => {
  const newUserData = {
    email: 'newuser@example.com',
    password: 'password123',
    role: 'user',
    fullName: 'New User',
  };

   beforeAll(async () => {
    // Ensure clean state: delete user if it exists
    await UserModel.deleteOne({ email: newUserData.email });
  });

  it('should create a new user (admin only)', async () => {
  const res = await request(app)
    .post('/api/admin/users')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(newUserData);

  expect(res.status).toBe(201);
  // updated to match controller
  expect(res.body.success).toBe(true);
  expect(res.body.data).toHaveProperty('email', newUserData.email);
  expect(res.body.data).toHaveProperty('fullName', newUserData.fullName);
  expect(res.body.data).toHaveProperty('role', newUserData.role);
});

  it('should fail if email already exists', async () => {
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newUserData); // sending same email again

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'User already exists');
  });

  afterAll(async () => {
    // Clean up after tests
    await UserModel.deleteOne({ email: newUserData.email });
  });
});

  // PUT UPDATE user (admin)
describe('PUT /api/admin/users/:id', () => {
  let userIdToUpdate: string;

  beforeAll(async () => {
    // Create a user to update
    const user = await UserModel.create({
      email: 'updateuser@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'user',
      fullName: 'Update User',
    });
    userIdToUpdate = user._id.toString();
  });

  it('should update user email and role (admin only)', async () => {
  const updateData = {
    email: 'updateduser@example.com',
    role: 'admin',
  };

  const res = await request(app)
    .put(`/api/admin/users/${userIdToUpdate}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send(updateData);

  expect(res.status).toBe(200);
  // updated to match controller
  expect(res.body.success).toBe(true);
  expect(res.body.data).toHaveProperty('email', updateData.email);
  expect(res.body.data).toHaveProperty('role', updateData.role);
});

  it('should fail when updating a non-existing user', async () => {
    const fakeId = '507f1f77bcf86cd799439012'; // random MongoDB ObjectId
    const res = await request(app)
      .put(`/api/admin/users/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'doesnotexist@example.com' });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'User not found');
  });

  it('should fail if token is missing', async () => {
    const res = await request(app)
      .put(`/api/admin/users/${userIdToUpdate}`)
      .send({ email: 'noauth@example.com' });

    expect(res.status).toBe(401);
  });

  it('should fail if user is not admin', async () => {
    // login as normal user
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'userpass' });

    const token = loginRes.body.token;

    const res = await request(app)
      .put(`/api/admin/users/${userIdToUpdate}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'nonadminupdate@example.com' });

    expect(res.status).toBe(403);
  });

  afterAll(async () => {
    // Clean up the updated user
    await UserModel.deleteOne({ _id: userIdToUpdate });
  });
});

// DELETE user (admin)
describe('DELETE /api/admin/users/:id', () => {
  let userIdToDelete: string;

  beforeAll(async () => {
    // Create a user to delete
    const user = await UserModel.create({
      email: 'deleteuser@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'user',
      fullName: 'Delete User',
    });
    userIdToDelete = user._id.toString();
  });

  it('should delete a user successfully (admin only)', async () => {
    const res = await request(app)
      .delete(`/api/admin/users/${userIdToDelete}`)
      .set('Authorization', `Bearer ${adminToken}`);

    console.log('DELETE USER RESPONSE:', res.body);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'User deleted successfully');

    // Verify user no longer exists
    const deletedUser = await UserModel.findById(userIdToDelete);
    expect(deletedUser).toBeNull();
  });

  it('should fail when deleting a non-existing user', async () => {
    const fakeId = '507f1f77bcf86cd799439012';
    const res = await request(app)
      .delete(`/api/admin/users/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'User not found');
  });

  it('should fail if token is missing', async () => {
    const res = await request(app).delete(`/api/admin/users/${userIdToDelete}`);
    expect(res.status).toBe(401);
  });

  it('should fail if user is not admin', async () => {
    // login as normal user
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'userpass' });

    const token = loginRes.body.token;

    const res = await request(app)
      .delete(`/api/admin/users/${userIdToDelete}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});

// AUTH & ROLE edge cases
describe('Admin Users Auth & Role Edge Cases', () => {
  let nonAdminToken: string;

  beforeAll(async () => {
    // Ensure a non-admin user exists
    const existingUser = await UserModel.findOne({ email: 'user@example.com' });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('userpass', 10);
      await UserModel.create({
        email: 'user@example.com',
        password: hashedPassword,
        role: 'user',
        fullName: 'User',
      });
    }

    // Login as non-admin user
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'userpass' });

    nonAdminToken = loginRes.body.token;
  });

  it('should return 403 when non-admin tries to access /api/admin/users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${nonAdminToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('message', 'Access denied. Admin only.');
  });

  it('should return 401 for expired or invalid token', async () => {
    const invalidToken = 'this.is.an.invalid.token';

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${invalidToken}`);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Not authorized, token failed');
  });

  it('should return 401 if token is missing', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Not authorized, no token');
  });
});

});
