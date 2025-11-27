const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = 'seo.root@example.com'
  const password = 'seo.root@example.com'
  const name = 'Mr. David'

  console.log(`Promoting ${email} to ADMIN...`)

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: { 
        role: 'ADMIN',
        // Update password if you want to ensure it matches what the user said, 
        // but usually we might not want to reset it if they already exist. 
        // However, user explicitly gave password, so I will update it to ensure they can login.
        password: hashedPassword 
    },
    create: {
      email,
      name,
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log(`Success! User ${user.email} is now an ADMIN.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
