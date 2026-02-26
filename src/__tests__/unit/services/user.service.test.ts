// Mock UserRepository
const mockUserRepository = {
  createUser: jest.fn(),
  findUserByEmail: jest.fn(),
  findByResetPasswordToken: jest.fn(),
};

// Override UserRepository in UserService with the mock
jest.mock('../../../repositories/user.repository', () => {
  return {
    UserRepository: jest.fn().mockImplementation(() => mockUserRepository),
  };
});

import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserService } from '../../../services/user.service';
import { HttpError } from '../../../errors/http-error';

// Mock user object
const mockUser = {
  _id: 'user123',
  email: 'test@example.com',
  password: 'hashed-Password123!',
  role: 'user',
  resetPasswordToken: undefined as string | undefined,
  resetPasswordExpires: undefined as Date | undefined,
  save: jest.fn().mockResolvedValue(undefined),
};

// Mock bcryptjs
jest.spyOn(bcryptjs, 'hash').mockImplementation(async (pwd) => `hashed-${pwd}`);
jest.spyOn(bcryptjs, 'compare').mockImplementation(async (pwd, hash) => hash === `hashed-${pwd}`);

// Mock JWT
jest.spyOn(jwt, 'sign').mockImplementation(() => 'mocked-jwt-token' as any);

// Mock crypto
jest.spyOn(crypto, 'createHash').mockReturnValue({
  update: jest.fn().mockReturnThis(),
  digest: jest.fn().mockReturnValue('hashedtoken'),
} as any);

describe('UserService Unit Tests', () => {
  let userService: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserService();
  });

  it('should create a new user', async () => {
    mockUserRepository.findUserByEmail.mockResolvedValue(null);
    mockUserRepository.createUser.mockResolvedValue(mockUser);

    const result = await userService.createUser({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      role: 'user',
    });

    expect(result.id).toBe(mockUser._id);
    expect(result.email).toBe(mockUser.email);
    expect(result.role).toBe(mockUser.role);
    expect(result.message).toBe('User registered successfully');
  });

  it('should throw error if email already exists', async () => {
    mockUserRepository.findUserByEmail.mockResolvedValue(mockUser);

    await expect(
      userService.createUser({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        role: 'user',
      })
    ).rejects.toThrow(HttpError);
  });

  it('should login a user with correct credentials', async () => {
    mockUserRepository.findUserByEmail.mockResolvedValue(mockUser);

    const result = await userService.loginUser({
      email: 'test@example.com',
      password: 'Password123!',
    });

    expect(result).toHaveProperty('token', 'mocked-jwt-token');
    expect(result.user).toHaveProperty('email', mockUser.email);
  });

  it('should throw error if user not found', async () => {
    mockUserRepository.findUserByEmail.mockResolvedValue(null);

    await expect(
      userService.loginUser({ email: 'notfound@test.com', password: 'Password123!' })
    ).rejects.toThrow(HttpError);
  });

  it('should throw error if password is invalid', async () => {
    mockUserRepository.findUserByEmail.mockResolvedValue(mockUser);
    (jest.spyOn(bcryptjs, 'compare') as jest.Mock).mockResolvedValue(false);

    await expect(
      userService.loginUser({ email: mockUser.email, password: 'wrongpassword' })
    ).rejects.toThrow('Invalid credentials');
  });

  it('should set reset password token if user exists', async () => {
    mockUserRepository.findUserByEmail.mockResolvedValue(mockUser);

    await userService.setResetPasswordToken('test@example.com', 'token123');

    expect(mockUser.resetPasswordToken).toBe('hashedtoken');
    expect(mockUser.resetPasswordExpires).toBeInstanceOf(Date);
    expect(mockUser.save).toHaveBeenCalled();
  });

  it('should do nothing if user does not exist in setResetPasswordToken', async () => {
    mockUserRepository.findUserByEmail.mockResolvedValue(null);

    await expect(
      userService.setResetPasswordToken('notfound@test.com', 'token123')
    ).resolves.toBeUndefined();
  });

  it('should reset password with valid token', async () => {
    mockUserRepository.findByResetPasswordToken.mockResolvedValue(mockUser);

    await userService.resetPassword('token123', 'NewPassword123!');

    expect(mockUser.password).toBe('hashed-NewPassword123!');
    expect(mockUser.resetPasswordToken).toBeUndefined();
    expect(mockUser.resetPasswordExpires).toBeUndefined();
    expect(mockUser.save).toHaveBeenCalled();
  });

  it('should throw error if token is invalid', async () => {
    mockUserRepository.findByResetPasswordToken.mockResolvedValue(null);

    await expect(userService.resetPassword('invalidtoken', 'Password123!')).rejects.toThrow(
      HttpError
    );
  });
});