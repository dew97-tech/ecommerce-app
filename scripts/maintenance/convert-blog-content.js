const path = require("path");
const { pathToFileURL } = require("url");
const { PrismaClient } = require("@prisma/client");

const APPLY = process.argv.includes("--apply");

const prisma = new PrismaClient();

async function main() {
  const { marked } = await import("marked");
  const { sanitizeContentHtml, isHtmlContent } = await import(
    pathToFileURL(path.join(process.cwd(), "lib", "sanitize.js")).href
  );

  const blogs = await prisma.blog.findMany({
    select: { id: true, slug: true, content: true },
    orderBy: { createdAt: "asc" },
  });

  let converted = 0;
  let skipped = 0;

  for (const blog of blogs) {
    if (!blog.content || isHtmlContent(blog.content)) {
      skipped += 1;
      continue;
    }

    const html = sanitizeContentHtml(
      marked.parse(blog.content, { gfm: true, breaks: false })
    );

    if (!html.trim()) {
      skipped += 1;
      continue;
    }

    if (APPLY) {
      await prisma.blog.update({
        where: { id: blog.id },
        data: { content: html },
      });
    }

    converted += 1;
    console.log(`${APPLY ? "Converted" : "Would convert"}: ${blog.slug}`);
  }

  console.log(
    `\n${APPLY ? "Converted" : "Would convert"} ${converted} post(s), skipped ${skipped}.`
  );

  if (!APPLY) {
    console.log(
      "Dry run only. Take a backup (npm run db:backup) and re-run with --apply."
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
