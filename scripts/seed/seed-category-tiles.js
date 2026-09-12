const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const {
  buildCategoryEntries,
  isSkippable,
} = require("../media/category-tile-convention");

const APPLY = process.argv.includes("--apply");
const LIST = process.argv.includes("--list");
const TILES_DIR = path.join(process.cwd(), "public", "categories");
const REPORTS_DIR = path.join(process.cwd(), "reports");

const prisma = new PrismaClient();

function readAvailableTiles() {
  if (!fs.existsSync(TILES_DIR)) return new Set();

  return new Set(
    fs
      .readdirSync(TILES_DIR)
      .filter((file) => file.endsWith(".webp"))
      .map((file) => file.replace(/\.webp$/, ""))
  );
}

async function main() {
  const availableFiles = readAvailableTiles();

  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      parentId: true,
      image: true,
      parent: { select: { name: true } },
      _count: { select: { products: true } },
    },
  });

  const entries = buildCategoryEntries(categories);

  const duplicateKeys = new Map();
  for (const entry of entries) {
    duplicateKeys.set(entry.key, (duplicateKeys.get(entry.key) ?? 0) + 1);
  }
  const collisions = [...duplicateKeys].filter(([, count]) => count > 1);
  if (collisions.length > 0) {
    console.log(
      `WARNING: duplicate asset keys: ${collisions
        .map(([key, count]) => `${key} (${count})`)
        .join(", ")}`
    );
  }

  let applied = 0;
  let alreadyApplied = 0;

  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const category = categories[index];
    const image = `/categories/${entry.key}.webp`;

    if (category.image === image) {
      alreadyApplied += 1;
      continue;
    }

    if (!availableFiles.has(entry.key)) continue;

    if (APPLY) {
      await prisma.category.update({
        where: { id: category.id },
        data: { image },
      });
    }

    applied += 1;
  }

  console.log(APPLY ? "Applying category tiles...\n" : "Dry run (use --apply to write)\n");
  console.log(
    `${APPLY ? "Applied" : "Ready to apply"}: ${applied} | already set: ${alreadyApplied} | tile files: ${availableFiles.size}`
  );

  const placeholderCount = await prisma.category.count({
    where: { image: { contains: "placehold.co" } },
  });

  if (APPLY && placeholderCount > 0) {
    await prisma.category.updateMany({
      where: { image: { contains: "placehold.co" } },
      data: { image: null },
    });
  }

  console.log(
    `${APPLY ? "Cleared" : "Would clear"} ${placeholderCount} placeholder image URL(s).`
  );

  const pending = entries
    .filter((entry) => !entry.hasTile && !availableFiles.has(entry.key))
    .filter((entry) => !isSkippable(entry.name))
    .sort((a, b) => b.products - a.products);

  const skippedBrands = entries.filter(
    (entry) => !entry.hasTile && !availableFiles.has(entry.key) && isSkippable(entry.name)
  );

  console.log(
    `\nCategories without tile: ${pending.length} (+${skippedBrands.length} brand categories skipped)`
  );

  if (LIST) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
    const header = "filename,category,parent,products";
    const rows = pending.map(
      (entry) =>
        `category_${entry.key}.jpg,${entry.name},${entry.parent === "ROOT" ? "" : entry.parent},${entry.products}`
    );
    const csv = [header, ...rows].join("\n");
    const reportPath = path.join(REPORTS_DIR, "category-tiles-pending.csv");
    fs.writeFileSync(reportPath, `${csv}\n`);
    console.log(`Pending list written to ${reportPath}`);
    console.log(
      `Top 10: ${pending
        .slice(0, 10)
        .map((entry) => `${entry.name}(${entry.products})`)
        .join(", ")}`
    );
  }

  const parkedFiles = [...availableFiles].filter(
    (key) => !entries.some((entry) => entry.key === key)
  );
  if (parkedFiles.length > 0) {
    console.log(`Parked asset files with no category: ${parkedFiles.join(", ")}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
