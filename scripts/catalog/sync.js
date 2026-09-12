const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { PrismaClient } = require("@prisma/client");
const { DATA_DIR, REPORTS_DIR } = require("./config");
const { normalizeImageList } = require("./images");
const {
  atomicWriteJson,
  ensureDir,
  listRuns,
  nowStamp,
  parseArgs,
  readJsonl,
  readJsonSafe,
} = require("./util");

const prisma = new PrismaClient();

const BATCH_SIZE = 250;

const BRAND_ALIASES = {
  "1stplayer": "1STPLAYER",
  a4tech: "A4Tech",
  adata: "ADATA",
  "g.skill": "G.Skill",
  gigabyte: "Gigabyte",
  hp: "HP",
  intel: "Intel",
  lg: "LG",
  logitech: "Logitech",
  msi: "MSI",
  nvidia: "NVIDIA",
  pny: "PNY",
  "tp-link": "TP-Link",
  tplink: "TP-Link",
  "cooler master": "Cooler Master",
  coolermaster: "Cooler Master",
  deepcool: "DeepCool",
  inno3d: "INNO3D",
  zotac: "ZOTAC",
  hikvision: "Hikvision",
  asrock: "ASRock",
  "hewlett packard": "HP",
  hewlettpackard: "HP",
};

const BRAND_ACRONYMS = new Set([
  "ACER",
  "AMD",
  "AOC",
  "ASUS",
  "AITC",
  "APPLE",
  "CORSAIR",
  "DELL",
  "DJI",
  "EPSON",
  "GIGABYTE",
  "HP",
  "HTC",
  "IBM",
  "JBL",
  "LG",
  "MSI",
  "NVIDIA",
  "OCPC",
  "PNY",
  "RAZER",
  "SJCAM",
  "TEAM",
  "TP-LINK",
  "TVS",
  "UGREEN",
  "ZOTAC",
]);

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 180);
}

function normalizeBrand(value) {
  const raw = String(value ?? "").replace(/\s+/g, " ").trim();
  if (!raw) return null;

  const alias = BRAND_ALIASES[raw.toLowerCase()];
  if (alias) return alias;

  return raw
    .split(" ")
    .map((word) => {
      const upper = word.toUpperCase();
      if (BRAND_ACRONYMS.has(upper)) return upper;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function mapAvailability(sourceStatus) {
  const value = String(sourceStatus ?? "").toLowerCase();

  if (value.includes("discontinued")) return "DISCONTINUED";
  if (value.includes("pre")) return "PRE_ORDER";
  if (value.includes("up")) return "UP_COMING";
  if (value.includes("out")) return "OUT_OF_STOCK";
  if (value.includes("stock") || value.includes("in stock")) return "IN_STOCK";

  return "IN_STOCK";
}

function resolveRunDir(runArg) {
  if (runArg) {
    const dir = path.join(DATA_DIR, "runs", runArg);
    if (!fs.existsSync(dir)) throw new Error(`Run not found: ${runArg}`);
    return { runId: runArg, runDir: dir };
  }

  const runs = listRuns(DATA_DIR);
  if (runs.length === 0) throw new Error("No crawl runs found. Run catalog:crawl first.");

  return { runId: runs[0], runDir: path.join(DATA_DIR, "runs", runs[0]) };
}

function createCategoryResolver(categories, apply) {
  const byParentAndName = new Map();
  const pendingPaths = new Set();
  const created = [];
  const slugTaken = new Set(categories.map((category) => category.slug));

  for (const category of categories) {
    byParentAndName.set(
      `${category.parentId ?? "root"}|${category.name.toLowerCase()}`,
      category
    );
  }

  function uniqueSlug(name) {
    const base = slugify(name) || "category";
    let slug = base;
    let suffix = 2;
    while (slugTaken.has(slug)) {
      slug = `${base}-${suffix}`;
      suffix += 1;
    }
    slugTaken.add(slug);
    return slug;
  }

  async function resolve(names) {
    if (!names || names.length === 0) return null;

    let parentId = null;
    let allResolved = true;

    for (const rawName of names) {
      const name = String(rawName).replace(/\s+/g, " ").trim();
      if (!name) continue;

      const key = `${parentId ?? "root"}|${name.toLowerCase()}`;
      let category = byParentAndName.get(key);

      if (!category && apply) {
        category = await prisma.category.create({
          data: { name, slug: uniqueSlug(name), parentId },
        });
        created.push({ id: category.id, name, parentId });
        byParentAndName.set(key, category);
      }

      if (!category) {
        pendingPaths.add(names.join(" > "));
        allResolved = false;
        return null;
      }

      parentId = category.id;
    }

    return allResolved ? parentId : null;
  }

  return { resolve, created, pendingPaths };
}

function toMoney(value) {
  return Number.isFinite(value) ? Number(value).toFixed(2) : "";
}

async function main() {
  const args = parseArgs();
  const apply = Boolean(args.apply);
  const archiveMissing = Boolean(args["archive-missing"]);
  const limit = args.limit || 0;
  const { runId, runDir } = resolveRunDir(args.run);
  const productsFile = path.join(runDir, "products.jsonl");
  const syncStateFile = path.join(runDir, "sync-state.json");

  if (!fs.existsSync(productsFile)) {
    throw new Error(`No products.jsonl found in ${runDir}. Run the crawl first.`);
  }

  const specsModule = await import(
    pathToFileURL(path.join(process.cwd(), "lib", "catalog", "specs.js")).href
  );
  const { flattenSpecifications } = specsModule;

  const descriptionModule = await import(
    pathToFileURL(path.join(process.cwd(), "lib", "catalog", "description.js"))
      .href
  );
  const { stripDescriptionLinks, stripSourceMentions } = descriptionModule;

  function cleanSpecValues(value) {
    if (typeof value === "string") return stripSourceMentions(value);
    if (Array.isArray(value)) return value.map((entry) => cleanSpecValues(entry));
    if (value && typeof value === "object") {
      const output = {};
      for (const [key, entry] of Object.entries(value)) {
        output[stripSourceMentions(key)] = cleanSpecValues(entry);
      }
      return output;
    }
    return value;
  }

  const reportStamp = nowStamp();
  const reportDir = path.join(REPORTS_DIR, `${runId}-${reportStamp}`);
  ensureDir(reportDir);

  const [dbProducts, categories] = await Promise.all([
    prisma.product.findMany({
      select: {
        id: true,
        productCode: true,
        slug: true,
        name: true,
        price: true,
        discountedPrice: true,
        brand: true,
        categoryId: true,
        images: true,
        specifications: true,
        shortDescription: true,
        description: true,
        availabilityStatus: true,
        isActive: true,
        sourceUrl: true,
      },
    }),
    prisma.category.findMany({
      select: { id: true, name: true, slug: true, parentId: true },
    }),
  ]);

  const productsByCode = new Map();
  for (const product of dbProducts) {
    if (product.productCode) productsByCode.set(String(product.productCode), product);
  }

  const existingSlugs = new Set(dbProducts.map((product) => product.slug));
  const { resolve: resolveCategory, created: createdCategories, pendingPaths } =
    createCategoryResolver(categories, apply);

  const sourceSkus = new Set();
  const stats = {
    runId,
    mode: apply ? "apply" : "dry-run",
    startedAt: new Date().toISOString(),
    processed: 0,
    matched: 0,
    unchanged: 0,
    updated: 0,
    created: 0,
    skippedNoPrice: 0,
    archivedMissing: 0,
    reactivated: 0,
    brandFixed: 0,
    categoryMoved: 0,
    imagesUpdated: 0,
    specsUpdated: 0,
    priceUp: 0,
    priceDown: 0,
    statusChanged: 0,
  };

  const priceChanges = [];
  const newProducts = [];
  const removedProducts = [];
  const categoryCreates = [];

  let resumeFrom = 0;
  if (args.resume) {
    const state = readJsonSafe(syncStateFile, null);
    if (state && state.runId === runId && state.mode === (apply ? "apply" : "dry-run")) {
      resumeFrom = state.processed || 0;
    }
  }

  let operations = [];
  let historyRows = [];
  let processedLines = 0;

  const flush = async () => {
    if (operations.length === 0) return;

    if (apply) {
      await prisma.$transaction(operations);
      if (historyRows.length > 0) {
        await prisma.priceHistory.createMany({ data: historyRows });
      }
    }

    operations = [];
    historyRows = [];
    processedLines = stats.processed;

    if (apply) {
      atomicWriteJson(syncStateFile, {
        runId,
        mode: "apply",
        processed: processedLines,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  for await (const source of readJsonl(productsFile)) {
    if (stats.processed < resumeFrom) {

      if (source.sku) sourceSkus.add(source.sku);
      stats.processed += 1;
      continue;
    }

    sourceSkus.add(source.sku);
    const existing = productsByCode.get(source.sku);
    const availability = mapAvailability(source.availability);
    const normalizedBrand = normalizeBrand(source.brand);
    const now = new Date();

    const selling =
      Number.isFinite(source.price) && source.price > 0 ? source.price : null;
    const original =
      selling && Number.isFinite(source.oldPrice) && source.oldPrice > selling
        ? source.oldPrice
        : null;

    const isActive =
      availability !== "DISCONTINUED" &&
      (selling !== null || (existing?.price ?? 0) > 0);

    const imagesJson =
      Array.isArray(source.images) && source.images.length > 0
        ? JSON.stringify(normalizeImageList(source.images))
        : null;

    const specsJson =
      source.specifications && Object.keys(source.specifications).length > 0
        ? JSON.stringify(cleanSpecValues(source.specifications))
        : null;
    const attributes = specsJson ? flattenSpecifications(source.specifications) : null;

    if (existing) {
      stats.matched += 1;

      const effectivePrice = selling ?? existing.price;
      const price = original ?? effectivePrice;

      const discountedPrice =
        selling === null
          ? existing.discountedPrice
          : original
            ? effectivePrice
            : null;

      const priceChanged =
        price !== existing.price ||
        (discountedPrice ?? null) !== (existing.discountedPrice ?? null);

      const stock =
        availability === "IN_STOCK"
          ? Math.max(existing.stock > 0 ? existing.stock : 0, 50)
          : 0;

      const categoryId = await resolveCategory(source.breadcrumb);
      const categoryMoved = Boolean(categoryId && categoryId !== existing.categoryId);

      const brand = normalizedBrand || existing.brand;
      const brandFixed = Boolean(
        normalizedBrand &&
          existing.brand &&
          existing.brand !== normalizedBrand &&
          existing.brand.length > 0
      );

      const data = {
        name: source.name || existing.name,
        brand,
        price,
        discountedPrice,
        stock,
        availabilityStatus: availability,
        isActive,
        sourceUrl: source.url,
        sourceStatus: source.availability || existing.availabilityStatus,
        lastSyncedAt: now,
        discontinuedAt: isActive ? null : existing.isActive ? now : undefined,
      };

      if (imagesJson && imagesJson !== existing.images) {
        data.images = imagesJson;
        stats.imagesUpdated += 1;
      }

      if (specsJson && specsJson !== existing.specifications) {
        data.specifications = specsJson;
        data.attributes = attributes;
        stats.specsUpdated += 1;
      }

      if (source.shortDescription && source.shortDescription !== existing.shortDescription) {
        data.shortDescription = source.shortDescription;
      }

      if (source.description) {
        const description = stripSourceMentions(
          stripDescriptionLinks(source.description)
        );
        if (description !== existing.description) {
          data.description = description;
        }
      }

      if (categoryId) data.categoryId = categoryId;

      const statusChanged = existing.availabilityStatus !== availability;
      const reactivated = !existing.isActive && isActive;

      if (priceChanged || statusChanged || brandFixed || categoryMoved || reactivated || imagesJson || specsJson) {
        stats.updated += 1;
        if (priceChanged) {
          if (discountedPrice !== null && discountedPrice < existing.price) stats.priceDown += 1;
          else if (price > existing.price) stats.priceUp += 1;
          priceChanges.push({
            sku: source.sku,
            name: source.name,
            oldPrice: existing.price,
            newPrice: price,
            oldDiscountedPrice: existing.discountedPrice,
            newDiscountedPrice: discountedPrice,
            oldStatus: existing.availabilityStatus,
            newStatus: availability,
          });
          historyRows.push({
            productId: existing.id,
            oldPrice: existing.price,
            newPrice: price,
            oldDiscountedPrice: existing.discountedPrice,
            newDiscountedPrice: discountedPrice,
            sourceStatus: source.availability,
          });
        }
        if (statusChanged) stats.statusChanged += 1;
        if (brandFixed) stats.brandFixed += 1;
        if (categoryMoved) stats.categoryMoved += 1;
        if (reactivated) stats.reactivated += 1;
      } else {
        stats.unchanged += 1;
      }

      operations.push(prisma.product.update({ where: { id: existing.id }, data }));
    } else if (selling) {

      const baseSlug = slugify(source.name) || `product-${source.sku}`;
      let slug = `${baseSlug}-${source.sku}`;
      if (existingSlugs.has(slug)) slug = `${baseSlug}-${source.sku}-${Date.now()}`;
      existingSlugs.add(slug);

      const categoryId = await resolveCategory(source.breadcrumb);

      operations.push(
        prisma.product.create({
          data: {
            name: source.name,
            slug,
            productCode: source.sku,
            brand: normalizedBrand,
            description:
              stripSourceMentions(stripDescriptionLinks(source.description)) ||
              source.name,
            shortDescription: source.shortDescription || null,
            specifications: specsJson,
            price: original ?? selling,
            discountedPrice: original ? selling : null,
            stock: availability === "IN_STOCK" ? 50 : 0,
            images: imagesJson || JSON.stringify([]),
            attributes,
            availabilityStatus: availability,
            isActive,
            sourceUrl: source.url,
            sourceStatus: source.availability || null,
            lastSyncedAt: now,
            categoryId: categoryId || undefined,
          },
        })
      );
      stats.created += 1;
      newProducts.push({
        sku: source.sku,
        name: source.name,
        price: original ?? selling,
        brand: normalizedBrand || "",
        category: (source.breadcrumb || []).join(" > "),
      });
    } else {
      stats.skippedNoPrice += 1;
    }

    stats.processed += 1;
    if (limit && stats.processed >= limit) break;
    if (operations.length >= BATCH_SIZE) await flush();
  }

  await flush();

  if (archiveMissing && (!limit || stats.processed < limit)) {

    for (const product of dbProducts) {
      if (!product.productCode || sourceSkus.has(String(product.productCode))) continue;
      if (!product.isActive) continue;

      stats.archivedMissing += 1;
      operations.push(
        prisma.product.update({
          where: { id: product.id },
          data: {
            isActive: false,
            stock: 0,
            sourceStatus: "MISSING",
            discontinuedAt: new Date(),
          },
        })
      );
      removedProducts.push({
        sku: product.productCode,
        name: product.name,
        sourceUrl: product.sourceUrl || "",
      });

      if (operations.length >= BATCH_SIZE) await flush();
    }
    await flush();
  }

  for (const category of createdCategories) {
    categoryCreates.push(category);
  }

  stats.finishedAt = new Date().toISOString();
  stats.archiveMissingApplied = archiveMissing;

  const summary = {
    ...stats,
    pendingCategoryPaths: [...pendingPaths],
  };
  atomicWriteJson(path.join(reportDir, "summary.json"), summary);

  const priceCsv = [
    "sku,name,oldPrice,newPrice,oldDiscountedPrice,newDiscountedPrice,oldStatus,newStatus",
    ...priceChanges.map((change) =>
      [
        change.sku,
        `"${String(change.name).replace(/"/g, '""')}"`,
        toMoney(change.oldPrice),
        toMoney(change.newPrice),
        toMoney(change.oldDiscountedPrice),
        toMoney(change.newDiscountedPrice),
        change.oldStatus,
        change.newStatus,
      ].join(",")
    ),
  ].join("\n");
  fs.writeFileSync(path.join(reportDir, "price-changes.csv"), priceCsv);

  const newCsv = [
    "sku,name,price,brand,category",
    ...newProducts.map((product) =>
      [
        product.sku,
        `"${String(product.name).replace(/"/g, '""')}"`,
        toMoney(product.price),
        `"${product.brand}"`,
        `"${product.category}"`,
      ].join(",")
    ),
  ].join("\n");
  fs.writeFileSync(path.join(reportDir, "new-products.csv"), newCsv);

  const removedCsv = [
    "sku,name,sourceUrl",
    ...removedProducts.map((product) =>
      [product.sku, `"${String(product.name).replace(/"/g, '""')}"`, product.sourceUrl].join(",")
    ),
  ].join("\n");
  fs.writeFileSync(path.join(reportDir, "removed.csv"), removedCsv);

  console.log("");
  console.log(`Mode:            ${stats.mode}`);
  console.log(`Source products: ${stats.processed} (matched ${stats.matched})`);
  console.log(`Created:         ${stats.created}`);
  console.log(`Updated:         ${stats.updated} (unchanged ${stats.unchanged})`);
  console.log(`Price up/down:   ${stats.priceUp} / ${stats.priceDown}`);
  console.log(`Status changed:  ${stats.statusChanged}`);
  console.log(`Brand fixed:     ${stats.brandFixed}`);
  console.log(`Category moved:  ${stats.categoryMoved}`);
  console.log(`Images updated:  ${stats.imagesUpdated}`);
  console.log(`Specs updated:   ${stats.specsUpdated}`);
  console.log(`Archived missing:${stats.archivedMissing}${archiveMissing ? "" : " (skipped: pass --archive-missing on a full run)"}`);
  console.log(`Reactivated:     ${stats.reactivated}`);
  console.log(`Skipped (no price): ${stats.skippedNoPrice}`);
  console.log(`Categories created: ${categoryCreates.length}`);
  console.log(`Report: ${reportDir}`);

  if (!apply) {
    console.log("");
    console.log("DRY RUN - no database changes were written. Re-run with --apply to apply.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
