import { z } from 'zod';

export const signUpSchema = z.object({
  name: z.string().min(4, {
    message: 'name minimal 4 karakter',
  }),

  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Invalid email format'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
    .regex(/[a-z]/, 'Password must include at least one lowercase letter')
    .regex(/[0-9]/, 'Password must include at least one number')
    .regex(/[@$!%*?&]/, 'Password must include at least one special character'),
});

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Invalid email format'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
    .regex(/[a-z]/, 'Password must include at least one lowercase letter')
    .regex(/[0-9]/, 'Password must include at least one number')
    .regex(/[@$!%*?&]/, 'Password must include at least one special character'),
});
