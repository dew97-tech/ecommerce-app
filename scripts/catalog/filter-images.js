const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { analyzeImagePollution, normalizeImageUrl } = require("./images");
const { ensureDir, nowStamp, parseArgs } = require("./util");

const args = parseArgs();
const APPLY = Boolean(args.apply);
const LIMIT = Number(args.limit) || 0;

const REPAIR_DIR = path.join(process.cwd(), "reports", "catalog-repair");

const BRAND_GROUPS = {
  amd: ["amd", "ryzen", "radeon", "athlon", "threadripper"],
  intel: ["intel", "pentium", "celeron", "xeon"],
  nvidia: ["nvidia", "geforce", "rtx", "gtx"],
};

const prisma = new PrismaClient();

function pathTokens(value) {
  return new Set(
    String(value)
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean)
  );
}

function groupsOf(text) {
  const tokens = pathTokens(text);
  const groups = new Set();
  for (const [group, words] of Object.entries(BRAND_GROUPS)) {
    if (words.some((word) => tokens.has(word))) groups.add(group);
  }
  return groups;
}

function escapeCsv(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(rows) {
  const header = "sku,name,old_images,new_images,reason,source_url";
  const lines = rows.map((row) =>
    [row.sku, row.name, row.oldCount, row.newCount, row.reason, row.sourceUrl]
      .map(escapeCsv)
      .join(",")
  );
  return `${[header, ...lines].join("\n")}\n`;
}

async function main() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      brand: true,
      productCode: true,
      sourceUrl: true,
      isActive: true,
      images: true,
    },
  });

  const report = analyzeImagePollution(products);
  const productsById = new Map(products.map((product) => [product.id, product]));

  const primaryOwners = new Map();
  for (const parsed of report.parsed) {
    if (!parsed.images[0]) continue;
    const key = normalizeImageUrl(parsed.images[0]);
    if (!primaryOwners.has(key)) primaryOwners.set(key, new Set());
    primaryOwners.get(key).add(parsed.id);
  }

  function isForeignPrimary(product, url) {
    const owners = primaryOwners.get(normalizeImageUrl(url));
    if (!owners) return false;
    if (owners.has(product.id)) return false;

    return [...owners].some((ownerId) => {
      const owner = productsById.get(ownerId);
      return owner && owner.name.toLowerCase() !== product.name.toLowerCase();
    });
  }

  function hasBrandConflict(product, url) {
    const ownGroups = groupsOf(`${product.name} ${product.brand || ""}`);
    if (ownGroups.size === 0) return false;

    const imageGroups = groupsOf(decodeURIComponent(url));
    for (const group of imageGroups) {
      if (!ownGroups.has(group)) return true;
    }
    return false;
  }

  const queue = LIMIT > 0 ? report.suspects.slice(0, LIMIT) : report.suspects;
  const results = [];
  let updated = 0;

  for (const suspect of queue) {
    const product = productsById.get(suspect.id);
    if (!product) continue;

    const images = suspect.images;
    const reasons = new Set();

    const filtered = images.filter((url, index) => {
      if (index === 0) return true;
      if (isForeignPrimary(product, url)) {
        reasons.add("foreign-primary");
        return false;
      }
      if (hasBrandConflict(product, url)) {
        reasons.add("brand-conflict");
        return false;
      }
      return true;
    });

    if (filtered.length === 0) filtered.push(images[0]);

    const changed =
      filtered.length !== images.length ||
      filtered.some((url, index) => url !== images[index]);

    if (!changed) continue;

    results.push({
      id: product.id,
      sku: product.productCode || "",
      name: product.name,
      sourceUrl: product.sourceUrl || "",
      oldCount: images.length,
      newCount: filtered.length,
      reason: [...reasons].join("+") || "rule",
    });

    if (APPLY) {
      await prisma.product.update({
        where: { id: product.id },
        data: { images: JSON.stringify(filtered) },
      });
    }

    updated += 1;
  }

  console.log("Product image filter (rules)");
  console.log("----------------------------");
  console.log(`Active suspects: ${report.suspects.length} | queue: ${queue.length}`);
  console.log(`Mode: ${APPLY ? "APPLY" : "dry run"}`);
  console.log(`\n${APPLY ? "Filtered" : "Would filter"}: ${updated}`);

  for (const row of results.slice(0, 8)) {
    console.log(
      `  ${row.sku} ${row.name.slice(0, 45)} | ${row.oldCount} -> ${row.newCount} (${row.reason})`
    );
  }

  if (!APPLY) {
    console.log("\nDry run - no database changes. Re-run with --apply when ready.");
    return;
  }

  ensureDir(REPAIR_DIR);
  const reportPath = path.join(REPAIR_DIR, `filter-${nowStamp()}.csv`);
  fs.writeFileSync(reportPath, toCsv(results));
  console.log(`Report: ${reportPath}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
