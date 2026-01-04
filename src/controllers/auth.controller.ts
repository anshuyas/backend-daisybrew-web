import { Request, Response } from 'express';
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
}
