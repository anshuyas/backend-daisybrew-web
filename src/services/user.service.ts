import { CreateUserDto, LoginUserDto } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/index";

let userRepository = new UserRepository();

export class UserService {
    async registerUser(data: CreateUserDto) {
        // Business logic, check duplicate username/email, hash
        const checkEmail = await userRepository.getUserByEmail(data.email);
        if (checkEmail) {
            throw new HttpError(403, "Email already in use");
        }
        const checkUsername = await userRepository.getUserByUsername(data.username);
        if (checkUsername) {
            throw new HttpError(403, "Username already in use");
        }
        // hash/encrypt password, to not store plain text password - security risk
        const hashedPassword = await bcryptjs.hash(data.password, 10); // 10 - complexity
        data.password = hashedPassword; // update the password with hashed one
        const newUser = await userRepository.createUser(data);

        return newUser;
    }
    async loginUser(data: LoginUserDto) {
        const existingUser = await userRepository.getUserByUsername(data.username);
        if (!existingUser) {
            throw new HttpError(404, "User not found");
        }
        const isPasswordValid = await bcryptjs.compare(data.password, existingUser.password);// compare plain text with hashed
        if (!isPasswordValid) {
            throw new HttpError(401, "Invalid credentials");
        }
        // generate JWT
        const payload = { 
            id: existingUser._id,
            username: existingUser.username,
            email: existingUser.email,
            role: existingUser.role
        }; // what to include in token
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' }); // 30 days expiry
        return { token, existingUser }
    }
}