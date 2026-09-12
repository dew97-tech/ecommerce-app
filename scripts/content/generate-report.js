const path = require("path");
const { pathToFileURL } = require("url");
const { PrismaClient } = require("@prisma/client");
const { parseArgs } = require("../catalog/util");

const prisma = new PrismaClient();
const ROOT = process.cwd();

async function loadModule(relativePath) {
  return import(pathToFileURL(path.join(ROOT, relativePath)).href);
}

function pickCategories(coreCategories, value) {
  if (!value) return coreCategories;
  const slugs = String(value)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return coreCategories.filter((category) => slugs.includes(category.slug));
}

async function main() {
  const args = parseArgs();
  const apply = Boolean(args.apply);
  const useGemini = Boolean(args.gemini);
  const windowDays = Number(args.period) || 30;

  const { CORE_CATEGORIES, getPriceInsights } = await loadModule(
    "lib/content/insights.js"
  );
  const { buildPriceWatchArticle } = await loadModule(
    "lib/content/templates.js"
  );
  const { generateArticleProse } = await loadModule("lib/content/gemini.js");

  const categories = pickCategories(CORE_CATEGORIES, args.categories);
  if (categories.length === 0) {
    console.error(
      `No matching categories. Available: ${CORE_CATEGORIES.map(
        (category) => category.slug
      ).join(", ")}`
    );
    process.exit(1);
  }

  console.log(
    `Collecting price insights (last ${windowDays} days) for: ${categories
      .map((category) => category.label)
      .join(", ")}${useGemini ? " + Gemini prose" : ""}`
  );

  const insights = await getPriceInsights({ categories, windowDays });
  console.log(
    `Tracked changes: ${insights.totalTrackedChanges} | excluded or unusable rows: ${insights.excludedOutliers}`
  );

  const author = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  if (apply && !author) {
    throw new Error("No admin user found to author generated posts.");
  }

  const results = [];

  for (const insight of insights.categories) {
    if (insight.insufficient) {
      console.log(`SKIP ${insight.label}: only ${insight.sample} usable change(s)`);
      results.push({ category: insight.label, status: "skipped" });
      continue;
    }

    const prose = useGemini
      ? await generateArticleProse(insight, { windowDays })
      : null;
    const article = buildPriceWatchArticle(insight, { windowDays, prose });

    console.log(
      `ARTICLE ${article.slug} | median ${insight.medianPct}% | ${insight.up} up / ${insight.down} down${
        prose ? " | gemini" : ""
      }`
    );

    if (!apply) {
      results.push({
        category: insight.label,
        status: "dry-run",
        slug: article.slug,
      });
      continue;
    }

    const existing = await prisma.blog.findUnique({
      where: { slug: article.slug },
      select: { id: true, status: true },
    });

    if (existing?.status === "PUBLISHED") {
      console.log(`SKIP ${article.slug}: already published`);
      results.push({
        category: insight.label,
        status: "published-skip",
        slug: article.slug,
      });
      continue;
    }

    const data = {
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      category: article.category,
      tags: article.tags,
      generatedBy: prose ? "price-report+gemini" : "price-report",
      sourceData: prose
        ? { ...article.sourceData, gemini: { model: prose.model } }
        : article.sourceData,
    };

    const blog = existing
      ? await prisma.blog.update({ where: { id: existing.id }, data })
      : await prisma.blog.create({
          data: {
            ...data,
            slug: article.slug,
            status: "DRAFT",
            authorId: author.id,
          },
        });

    console.log(`  -> ${existing ? "updated" : "created"} draft ${blog.id}`);
    results.push({
      category: insight.label,
      status: existing ? "updated" : "created",
      slug: article.slug,
      id: blog.id,
    });
  }

  console.log("\nSummary:");
  for (const result of results) {
    console.log(
      `  ${result.status.padEnd(14)} ${result.category}${
        result.slug ? ` (${result.slug})` : ""
      }`
    );
  }
  if (!apply) console.log("\nDry run — pass --apply to write drafts.");

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
