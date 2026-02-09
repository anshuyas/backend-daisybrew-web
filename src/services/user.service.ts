import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";

const userRepository = new UserRepository();

export class UserService {
  async createUser(data: CreateUserDTO) {
    const existingUser = await userRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw new HttpError(403, "Email already in use");
    }

    const hashedPassword = await bcryptjs.hash(data.password, 10);

    const newUser = await userRepository.createUser({
      email: data.email,
      password: hashedPassword,
      role: data.role,
    });

    return {
      id: newUser._id,
      email: newUser.email,
      role: newUser.role,
      message: "User registered successfully",
    };
  }

  async loginUser(data: LoginUserDTO) {
    const user = await userRepository.findUserByEmail(data.email);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const isValidPassword = await bcryptjs.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new HttpError(401, "Invalid credentials");
    }

    const payload = { id: user._id, email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });

    return {
      token,
      user: { id: user._id, email: user.email, role: user.role },
    };
  }

  async setResetPasswordToken(email: string, token: string) {
  const user = await userRepository.findUserByEmail(email);

  if (!user) {
    return;
  }

  user.resetPasswordToken = token;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await user.save();
}
}
