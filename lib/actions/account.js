'use server'

import { db } from '@/lib/db'
import { checkRateLimit } from '@/lib/security/rate-limit'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    terms: z.string().refine((value) => value === 'on', {
      message: 'You must accept the terms and privacy policy',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export async function register(prevState, formData) {
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    terms: formData.get('terms'),
  })

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: 'Please fix the errors below.',
    }
  }

  const { name, password } = parsed.data
  const email = parsed.data.email.toLowerCase()

  const limit = checkRateLimit(`register:${email}`, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  })

  if (!limit.allowed) {
    return {
      errors: {},
      message: 'Too many attempts. Please try again later.',
    }
  }

  try {
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return { success: true, email }
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    await db.user.create({
      data: { name, email, password: hashedPassword },
    })
  } catch (error) {
    console.error('Registration failed:', error)
    return {
      errors: {},
      message: 'Could not create your account. Please try again.',
    }
  }

  return { success: true, email }
}
