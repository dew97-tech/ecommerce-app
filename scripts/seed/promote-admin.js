const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME || 'Admin'

  if (!email || !password) {
    console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD environment variables.')
    console.error('Usage: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD="<strong-password>" node promote-admin.js')
    process.exit(1)
  }

  if (password.length < 8) {
    console.error('ADMIN_PASSWORD must be at least 8 characters long.')
    process.exit(1)
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },

    update: { role: 'ADMIN' },
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
