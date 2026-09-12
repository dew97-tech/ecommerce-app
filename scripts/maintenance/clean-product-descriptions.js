const path = require("path");
const { pathToFileURL } = require("url");
const { PrismaClient } = require("@prisma/client");
const { parseArgs } = require("../catalog/util");

const BATCH_SIZE = 100;

const NOISE_FEATURES = new Set([
  "view more info",
  "view more",
  "view details",
  "read more",
  "learn more",
  "view full specification",
  "view full specifications",
]);

function cleanShortDescription(raw) {
  if (!raw) return raw;

  const kept = String(raw)
    .split(",")
    .map((part) => part.trim())
    .filter((part) => {
      if (!part) return false;
      const normalized = part.toLowerCase().replace(/[.:\s]+$/, "").trim();
      return !NOISE_FEATURES.has(normalized);
    });

  return kept.join(", ");
}

function cleanDeep(value, stripSourceMentions) {
  if (typeof value === "string") return stripSourceMentions(value);
  if (Array.isArray(value)) return value.map((item) => cleanDeep(item, stripSourceMentions));

  if (value && typeof value === "object") {
    const output = {};
    for (const [key, entry] of Object.entries(value)) {
      const baseKey = stripSourceMentions(key) || "description";
      let cleanKey = baseKey;
      let suffix = 2;
      while (cleanKey in output) {
        cleanKey = `${baseKey} ${suffix}`;
        suffix += 1;
      }
      output[cleanKey] = cleanDeep(entry, stripSourceMentions);
    }
    return output;
  }

  return value;
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function cleanDescription(raw, { stripDescriptionLinks, stripSourceMentions, parseProductData }) {
  if (!raw) return raw;

  const parsed = parseProductData(raw);
  if (isPlainObject(parsed)) {
    return JSON.stringify(cleanDeep(parsed, stripSourceMentions));
  }

  return stripSourceMentions(stripDescriptionLinks(String(raw)));
}

function cleanSpecifications(raw, { stripSourceMentions, parseProductData }) {
  if (!raw) return raw;

  const parsed = parseProductData(raw);
  if (isPlainObject(parsed)) {
    return JSON.stringify(cleanDeep(parsed, stripSourceMentions));
  }

  return stripSourceMentions(String(raw));
}

async function main() {
  const args = parseArgs();
  const dryRun = Boolean(args["dry-run"]);
  const limit = Number(args.limit) || 0;

  const descriptionModule = await import(
    pathToFileURL(path.join(process.cwd(), "lib", "catalog", "description.js")).href
  );
  const parserModule = await import(
    pathToFileURL(path.join(process.cwd(), "lib", "product-parser.js")).href
  );

  const helpers = {
    ...descriptionModule,
    parseProductData: parserModule.parseProductData,
  };

  const prisma = new PrismaClient();
  let cursor = null;
  let scanned = 0;
  let cleaned = 0;

  console.log(
    `Cleaning product descriptions and specifications${dryRun ? " (dry run)" : ""}${
      limit ? ` (limit ${limit})` : ""
    }...`
  );

  for (;;) {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { description: { contains: "<a " } },
          { description: { contains: "<ahref" } },
          { description: { contains: "Star Tech" } },
          { description: { contains: "startech" } },
          { description: { contains: "In Bangladesh" } },
          { specifications: { contains: "Star Tech" } },
          { shortDescription: { contains: "View More Info" } },
        ],
        ...(cursor ? { id: { gt: cursor } } : {}),
      },
      select: { id: true, description: true, specifications: true, shortDescription: true },
      orderBy: { id: "asc" },
      take: BATCH_SIZE,
    });

    if (products.length === 0) break;

    for (const product of products) {
      cursor = product.id;
      scanned += 1;

      const data = {};
      const description = cleanDescription(product.description, helpers);
      const specifications = cleanSpecifications(product.specifications, helpers);
      const shortDescription = cleanShortDescription(product.shortDescription);

      if (description !== product.description) data.description = description;
      if (specifications !== product.specifications) data.specifications = specifications;
      if (shortDescription !== product.shortDescription) {
        data.shortDescription = shortDescription || null;
      }

      if (Object.keys(data).length > 0) {
        cleaned += 1;
        if (!dryRun) {
          await prisma.product.update({ where: { id: product.id }, data });
        }
      }

      if (limit && scanned >= limit) break;
    }

    console.log(
      `Scanned ${scanned}, ${dryRun ? "would clean" : "cleaned"} ${cleaned}`
    );

    if (limit && scanned >= limit) break;
  }

  console.log(
    `Done. Scanned ${scanned}, ${dryRun ? "would clean" : "cleaned"} ${cleaned}.`
  );
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
