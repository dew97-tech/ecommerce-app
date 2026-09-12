const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { parseArgs } = require("../catalog/util");

const prisma = new PrismaClient();

function readCredentials() {
  const args = parseArgs();
  return {
    email: args.email || process.env.ADMIN_EMAIL,
    password: args.password || process.env.ADMIN_PASSWORD,
    name: args.name || process.env.ADMIN_NAME || "Admin",
  };
}

async function main() {
  const { email, password, name } = readCredentials();

  if (!email || !password) {
    console.error("Missing credentials.");
    console.error("Usage: npm run admin:reset-password -- --email=you@example.com --password=\"new-password\"");
    console.error("Or set ADMIN_EMAIL and ADMIN_PASSWORD in .env.");
    process.exit(1);
  }

  if (String(password).length < 8) {
    console.error("Password must be at least 8 characters long.");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(String(password), 10);
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, role: "ADMIN" },
    });
    console.log(`Password reset for ${email} (admin role ensured).`);
  } else {
    await prisma.user.create({
      data: { email, name, password: hashedPassword, role: "ADMIN" },
    });
    console.log(`Created admin user ${email}.`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
