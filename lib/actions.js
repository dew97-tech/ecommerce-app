'use server'

import { signIn } from '@/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export async function authenticate(prevState, formData) {
  try {
    await signIn('credentials', {
      ...Object.fromEntries(formData),
      redirectTo: '/',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.'
        default:
          return 'Something went wrong.'
      }
    }
    throw error
  }
}

export async function register(prevState, formData) {
  const schema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  })
  
  const parse = schema.safeParse(Object.fromEntries(formData))
  
  if (!parse.success) {
    return parse.error.flatten().fieldErrors
  }
  
  const { name, email, password } = parse.data
  
  try {
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) return "User already exists."

    const hashedPassword = await bcrypt.hash(password, 10)
    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })
  } catch (error) {
    return 'Failed to create user.'
  }
  
  redirect('/login')
}
