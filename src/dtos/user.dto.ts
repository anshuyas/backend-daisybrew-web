import { z } from 'zod';

export const registerUserDto = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['user', 'admin']).optional()
});

export const loginUserDto = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});
