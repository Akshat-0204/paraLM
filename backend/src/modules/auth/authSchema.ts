import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ error: 'Name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be at most 50 characters')
      .trim(),
    email: z
      .string({ error: 'Email is required' })
      .email('Invalid email format')
      .toLowerCase()
      .trim(),
    password: z
      .string({ error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must be at most 100 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ error: 'Email is required' })
      .email('Invalid email format')
      .toLowerCase()
      .trim(),
    password: z
      .string({ error: 'Password is required' })
      .min(1, 'Password is required'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be at most 50 characters')
      .trim()
      .optional(),
    avatar: z
      .string()
      .url('Invalid avatar URL')
      .optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z
      .string({ error: 'Current password is required' })
      .min(1, 'Current password is required'),
    newPassword: z
      .string({ error: 'New password is required' })
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must be at most 100 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];