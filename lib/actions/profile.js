'use server'

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export async function updateProfile(prevState, formData) {
  const session = await auth()
  
  if (!session?.user) {
    return { message: "Unauthorized" }
  }

  const parse = profileSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    address: formData.get('address'),
  })

  if (!parse.success) {
    return { errors: parse.error.flatten().fieldErrors }
  }

  const { name, phone, address } = parse.data

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone,
        address,
      },
    })
    
    revalidatePath('/profile')
    return { message: "Profile updated successfully!" }
  } catch (error) {
    return { message: "Failed to update profile." }
  }
}
