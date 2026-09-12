const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { PrismaClient } = require("@prisma/client");
const { DATA_DIR } = require("./config");
const { normalizeImageList } = require("./images");
const { parseArgs } = require("./util");

const prisma = new PrismaClient();

const SAMPLE_LIMIT = 8;

function mapAvailability(sourceStatus) {
  const value = String(sourceStatus ?? "").toLowerCase();

  if (value.includes("discontinued")) return "DISCONTINUED";
  if (value.includes("pre")) return "PRE_ORDER";
  if (value.includes("up")) return "UP_COMING";
  if (value.includes("out")) return "OUT_OF_STOCK";
  if (value.includes("stock")) return "IN_STOCK";

  return "IN_STOCK";
}

async function loadCrawlProducts(file) {
  const products = new Map();
  const reader = readline.createInterface({
    input: fs.createReadStream(file, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });

  for await (const line of reader) {
    if (!line.trim()) continue;

    try {
      const source = JSON.parse(line);
      if (source.sku) products.set(String(source.sku), source);
    } catch {

    }
  }

  return products;
}

async function main() {
  const args = parseArgs();
  const runId = args.run || "full";
  const crawlFile = path.join(DATA_DIR, "runs", runId, "products.jsonl");

  if (!fs.existsSync(crawlFile)) {
    console.error(`Crawl file not found: ${crawlFile}`);
    process.exitCode = 1;
    return;
  }

  const crawl = await loadCrawlProducts(crawlFile);
  const db = await prisma.product.findMany({
    select: {
      productCode: true,
      price: true,
      discountedPrice: true,
      stock: true,
      availabilityStatus: true,
      isActive: true,
      images: true,
    },
  });
  const byCode = new Map(
    db.filter((row) => row.productCode).map((row) => [String(row.productCode), row])
  );

  const samples = {
    price: [],
    availability: [],
    stock: [],
    images: [],
  };

  let matched = 0;
  let noPrice = 0;
  let priceMismatch = 0;
  let availabilityMismatch = 0;
  let stockMismatch = 0;
  let imageMismatch = 0;
  let discontinuedActive = 0;
  let activeNoPrice = 0;

  for (const [sku, source] of crawl) {
    const row = byCode.get(sku);
    if (!row) continue;

    matched += 1;
    const selling =
      Number.isFinite(source.price) && source.price > 0 ? source.price : null;

    if (selling) {
      const original =
        Number.isFinite(source.oldPrice) && source.oldPrice > selling
          ? source.oldPrice
          : null;
      const expectedPrice = original ?? selling;
      const expectedDiscount = original ? selling : null;

      if (
        row.price !== expectedPrice ||
        (row.discountedPrice ?? null) !== expectedDiscount
      ) {
        priceMismatch += 1;
        if (samples.price.length < SAMPLE_LIMIT) {
          samples.price.push(
            `${sku} db=${row.price}/${row.discountedPrice} crawl=${expectedPrice}/${expectedDiscount}`
          );
        }
      }
    } else {
      noPrice += 1;
      if (row.isActive && (row.discountedPrice ?? row.price) <= 0) {
        activeNoPrice += 1;
      }
    }

    const availability = mapAvailability(source.availability);

    if (row.availabilityStatus !== availability) {
      availabilityMismatch += 1;
      if (samples.availability.length < SAMPLE_LIMIT) {
        samples.availability.push(
          `${sku} db=${row.availabilityStatus} crawl=${availability}`
        );
      }
    }

    const stockOk =
      availability === "IN_STOCK" ? row.stock > 0 : row.stock === 0;
    if (!stockOk) {
      stockMismatch += 1;
      if (samples.stock.length < SAMPLE_LIMIT) {
        samples.stock.push(`${sku} db=${row.stock} crawl=${availability}`);
      }
    }

    if (availability === "DISCONTINUED" && row.isActive) {
      discontinuedActive += 1;
    }

    if (Array.isArray(source.images) && source.images.length > 0) {
      const expectedImages = JSON.stringify(normalizeImageList(source.images));
      if (expectedImages !== row.images) {
        imageMismatch += 1;
        if (samples.images.length < SAMPLE_LIMIT) {
          samples.images.push(sku);
        }
      }
    }
  }

  const activeNotInCrawl = db.filter(
    (row) => row.isActive && row.productCode && !crawl.has(String(row.productCode))
  );

  console.log(`Sync consistency audit (run: ${runId})`);
  console.log("----------------------------------");
  console.log(`Crawl products:              ${crawl.size}`);
  console.log(`Matched in DB:               ${matched}`);
  console.log(`Crawl products missing in DB:${String(crawl.size - matched).padStart(4)} (expected: no-price products)`);
  console.log(`Price mismatches:            ${priceMismatch}`);
  console.log(`Availability mismatches:     ${availabilityMismatch}`);
  console.log(`Stock mismatches:            ${stockMismatch}`);
  console.log(`Image mismatches:            ${imageMismatch}`);
  console.log(`Crawl products without price:${String(noPrice).padStart(4)}`);
  console.log(`Active without usable price: ${activeNoPrice}`);
  console.log(`Discontinued but active:     ${discontinuedActive}`);
  console.log(`Active DB products not in crawl: ${activeNotInCrawl.length}`);

  for (const [label, list] of Object.entries(samples)) {
    for (const sample of list) {
      console.log(`  ${label}: ${sample}`);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
