import z from 'zod';

export const UserSchema = z.object({
    username: z.string().min(3),
    email: z.email(),
    password: z.string().min(6),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    role: z.enum(['admin', 'user']).default('user'),
});
export type UserType = z.infer<typeof UserSchema>;