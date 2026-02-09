import { Request, Response } from 'express';
import crypto from 'crypto';
import { UserService } from '../services/user.service';
import { registerUserDto, loginUserDto } from '../dtos/user.dto';

const userService = new UserService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const data = registerUserDto.parse(req.body);
      const user = await userService.createUser(data); // Fixed here
      res.status(201).json(user); // Already includes message
    } catch (err: any) {
      res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const data = loginUserDto.parse(req.body);
      const result = await userService.loginUser(data); // Fixed here
      res.status(200).json(result); // Already includes token & user
    } catch (err: any) {
      res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');

      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      await userService.setResetPasswordToken(email, resetToken);

      res.status(200).json({
        message: 'Password reset link has been sent to your email',
      });
    } catch (err: any) {
      res.status(err.statusCode || 400).json({ error: err.message });
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
      message: 'Password has been reset successfully',
    });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({ error: err.message });
  }
}
}
