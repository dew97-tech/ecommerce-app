const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { parseArgs } = require("../catalog/util");

const prisma = new PrismaClient();

async function main() {
  const args = parseArgs();
  const apply = Boolean(args.apply);
  const now = new Date();

  const due = await prisma.blog.findMany({
    where: { status: "DRAFT", scheduledAt: { lte: now } },
    select: { id: true, title: true, slug: true, scheduledAt: true },
  });

  if (due.length === 0) {
    console.log("No scheduled posts are due.");
    await prisma.$disconnect();
    return;
  }

  console.log(`Due scheduled posts: ${due.length}`);
  for (const blog of due) {
    console.log(`  ${blog.scheduledAt?.toISOString() ?? ""}  ${blog.slug}  ${blog.title}`);
  }

  if (!apply) {
    console.log("\nDry run — pass --apply to publish these posts.");
    await prisma.$disconnect();
    return;
  }

  await prisma.blog.updateMany({
    where: { id: { in: due.map((blog) => blog.id) } },
    data: { status: "PUBLISHED", publishedAt: now, scheduledAt: null },
  });

  console.log(`Published ${due.length} post(s).`);
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
