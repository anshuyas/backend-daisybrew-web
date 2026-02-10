import { Request, Response } from 'express';
import crypto from 'crypto';
import { UserService } from '../services/user.service';
import { registerUserDto, loginUserDto } from '../dtos/user.dto';
import { sendEmail } from '../config/email';
import { success } from 'zod';

const userService = new UserService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const data = registerUserDto.parse(req.body);
      const user = await userService.createUser(data); 
      res.status(201).json({
      success: true,
      data: user,
    });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({
      success: false,
      error: err.message,
    });
  }
  }

  async login(req: Request, res: Response) {
    try {
      const data = loginUserDto.parse(req.body);
      const result = await userService.loginUser(data); 
      res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({
      success: false,
      error: err.message,
    });
  }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');

      await userService.setResetPasswordToken(email, resetToken);

      const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

      await sendEmail(
        email,
        "Reset your password",
        `
          <p>You requested a password reset.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}" target="_blank">${resetLink}</a>
          <p>This link will expire in 15 minutes.</p>
        `
      );

      res.status(200).json({
        success: true,
        message: 'Password reset link has been sent to your email',
      });
    } catch (err: any) {
      res.status(err.statusCode || 400).json({ 
        success: false,
        error: err.message });
    }
  }

  async resetPassword(req: Request, res: Response) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        error: 'Token and new password are required',
      });
    }

    await userService.resetPassword(token, password);

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({ error: err.message });
  }
}
}
