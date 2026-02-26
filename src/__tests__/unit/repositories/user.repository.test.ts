import { UserRepository } from '../../../repositories/user.repository';
import { UserModel } from '../../../models/user.model';
import bcrypt from 'bcryptjs';

describe('UserRepository Unit Tests', () => {
  const userRepo = new UserRepository();

  const testUser = {
    email: 'repo@test.com',
    password: 'Password123!',
    role: 'user' as "user",
  };

  beforeAll(async () => {
    await UserModel.deleteMany({ email: testUser.email });
  });

  afterAll(async () => {
    await UserModel.deleteMany({ email: testUser.email });
  });

  describe('createUser()', () => {
    it('should create a new user', async () => {
      const hashedPassword = await bcrypt.hash(testUser.password, 10);

      const user = await userRepo.createUser({
        email: testUser.email,
        password: hashedPassword,
        role: testUser.role,
        fullName: 'Repository Test User',
      });

      expect(user).toBeDefined();
      expect(user.email).toBe(testUser.email);
    });

    it('should persist correct email in DB', async () => {
      const user = await UserModel.findOne({ email: testUser.email });
      expect(user).not.toBeNull();
      expect(user?.email).toBe(testUser.email);
    });
  });

  describe('findUserByEmail()', () => {
    it('should return user including password field', async () => {
      const user = await userRepo.findUserByEmail(testUser.email);

      expect(user).not.toBeNull();
      expect(user).toHaveProperty('password');
    });

    it('should return null if user does not exist', async () => {
      const user = await userRepo.findUserByEmail('notfound@test.com');
      expect(user).toBeNull();
    });
  });

  describe('findByResetPasswordToken()', () => {
    let resetToken = 'resettoken123';

    beforeAll(async () => {
      await UserModel.updateOne(
        { email: testUser.email },
        {
          resetPasswordToken: resetToken,
          resetPasswordExpires: new Date(Date.now() + 100000), // not expired
        }
      );
    });

    it('should return user if token is valid and not expired', async () => {
      const user = await userRepo.findByResetPasswordToken(resetToken);
      expect(user).not.toBeNull();
      expect(user?.resetPasswordToken).toBe(resetToken);
    });

    it('should return null if token is expired', async () => {
      await UserModel.updateOne(
        { email: testUser.email },
        { resetPasswordExpires: new Date(Date.now() - 1000) } // expired
      );

      const user = await userRepo.findByResetPasswordToken(resetToken);
      expect(user).toBeNull();
    });

    it('should return null if token is invalid', async () => {
      const user = await userRepo.findByResetPasswordToken('invalidtoken');
      expect(user).toBeNull();
    });
  });
});