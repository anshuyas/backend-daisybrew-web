import { z } from 'zod';

export const registerUserDto = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['user', 'admin']).optional()
});

export const loginUserDto = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export type CreateUserDTO = z.infer<typeof registerUserDto>;
export type LoginUserDTO = z.infer<typeof loginUserDto>;