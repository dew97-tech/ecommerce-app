const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { PrismaClient } = require("@prisma/client");
const { DATA_DIR } = require("./config");
const { fetchPage, runPool } = require("./http");
const { parseProductPage } = require("./parse");
const { analyzeImagePollution } = require("./images");
const {
  atomicWriteJson,
  ensureDir,
  nowStamp,
  parseArgs,
  readJsonSafe,
} = require("./util");

const args = parseArgs();
const APPLY = Boolean(args.apply);
const LIMIT = Number(args.limit) || 0;
const CONCURRENCY = Number(args.concurrency) || 3;
const DELAY_MS = Number(args.delay) || 700;
const UPDATE_CRAWL = Boolean(args["update-crawl-data"]);
const RESTART = Boolean(args.restart);

const REPAIR_DIR = path.join(process.cwd(), "reports", "catalog-repair");
const STATE_FILE = path.join(REPAIR_DIR, "state.json");
const CRAWL_FILE = path.join(DATA_DIR, "runs", "full", "products.jsonl");

const prisma = new PrismaClient();

function formatEta(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0s";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.round(seconds % 60);
  if (hours > 0) return `${hours}h${minutes}m`;
  if (minutes > 0) return `${minutes}m${secs}s`;
  return `${secs}s`;
}

function escapeCsv(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(rows) {
  const header = "sku,name,status,old_images,new_images,source_url";
  const lines = rows.map((row) =>
    [row.sku, row.name, row.status, row.oldCount, row.newCount, row.sourceUrl]
      .map(escapeCsv)
      .join(",")
  );

  return `${[header, ...lines].join("\n")}\n`;
}

async function repairProduct(product, results, repairedBySku) {
  const base = {
    id: product.id,
    sku: product.productCode ?? "",
    name: product.name,
    sourceUrl: product.sourceUrl ?? "",
    oldCount: product.images.length,
    newCount: 0,
  };

  if (!product.sourceUrl) {
    results.push({ ...base, status: "no-url" });
    return;
  }

  try {
    const { status, html } = await fetchPage(product.sourceUrl);

    if (!html) {
      results.push({ ...base, status: `gone-${status}` });
      return;
    }

    const parsed = parseProductPage(html, product.sourceUrl);
    const live = parsed?.images ?? [];

    if (live.length === 0) {
      results.push({ ...base, status: "no-live-images" });
      return;
    }

    const changed = JSON.stringify(live) !== JSON.stringify(product.images);

    if (changed && APPLY) {
      await prisma.product.update({
        where: { id: product.id },
        data: { images: JSON.stringify(live) },
      });
    }

    results.push({
      ...base,
      newCount: live.length,
      status: changed ? (APPLY ? "repaired" : "would-repair") : "unchanged",
    });

    if (APPLY && changed && product.productCode) {
      repairedBySku.set(String(product.productCode), live);
    }
  } catch (error) {
    results.push({
      ...base,
      status: `error: ${String(error.message).slice(0, 80)}`,
    });
  }
}

async function updateCrawlData(repairedBySku) {
  if (!fs.existsSync(CRAWL_FILE)) {
    console.log(`Crawl file not found, skipping rewrite: ${CRAWL_FILE}`);
    return;
  }

  const backupFile = `${CRAWL_FILE}.bak`;
  if (!fs.existsSync(backupFile)) {
    fs.copyFileSync(CRAWL_FILE, backupFile);
    console.log(`Crawl backup written: ${backupFile}`);
  }

  const tempFile = `${CRAWL_FILE}.tmp`;
  const reader = readline.createInterface({
    input: fs.createReadStream(CRAWL_FILE, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });
  const writer = fs.createWriteStream(tempFile, { encoding: "utf8" });

  let rewritten = 0;
  let lines = 0;

  for await (const line of reader) {
    lines += 1;
    if (!line.trim()) continue;

    let output = line;
    try {
      const entry = JSON.parse(line);
      const images = repairedBySku.get(String(entry.sku));
      if (images) {
        entry.images = images;
        output = JSON.stringify(entry);
        rewritten += 1;
      }
    } catch {

    }

    writer.write(`${output}\n`);
  }

  await new Promise((resolve, reject) => {
    writer.on("error", reject);
    writer.end(resolve);
  });

  fs.renameSync(tempFile, CRAWL_FILE);
  console.log(
    `Crawl data updated: ${rewritten} of ${lines} product entries rewritten.`
  );
}

async function main() {
  if (UPDATE_CRAWL && !APPLY) {
    console.error("--update-crawl-data requires --apply.");
    process.exitCode = 1;
    return;
  }

  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      productCode: true,
      sourceUrl: true,
      isActive: true,
      images: true,
    },
  });

  const pollution = analyzeImagePollution(products);
  const activeSuspects = pollution.suspects.filter((product) => product.isActive);
  const archivedSuspects = pollution.suspects.length - activeSuspects.length;

  console.log("Product image repair");
  console.log("--------------------");
  console.log(`Total products:        ${pollution.total}`);
  console.log(`Suspects (repair set): ${pollution.suspects.length}`);
  console.log(`  active:              ${activeSuspects.length}`);
  console.log(`  archived (skipped):  ${archivedSuspects}`);
  console.log(`Foreign image entries: ${pollution.foreignImages}`);
  console.log(
    `Mode: ${APPLY ? "APPLY" : "dry run"} | concurrency ${CONCURRENCY} | delay ${DELAY_MS}ms`
  );

  const state =
    APPLY && !RESTART
      ? readJsonSafe(STATE_FILE, { processed: {} })
      : { processed: {} };
  const processed = state.processed ?? {};
  const done = new Set(
    Object.entries(processed)
      .filter(([, value]) => value.status === "repaired" || value.status === "unchanged")
      .map(([id]) => id)
  );

  let queue = activeSuspects.filter((product) => !done.has(product.id));
  if (LIMIT > 0) queue = queue.slice(0, LIMIT);

  console.log(
    `Already processed: ${done.size} | queue this run: ${queue.length}`
  );

  if (queue.length === 0) {
    console.log("Nothing to do.");
    return;
  }

  const results = [];
  const repairedBySku = new Map();
  const startedAt = Date.now();

  await runPool(
    queue,
    (product) => repairProduct(product, results, repairedBySku),
    {
      concurrency: CONCURRENCY,
      delayMs: DELAY_MS,
      onProgress: (completed, total) => {
        if (completed % 25 !== 0 && completed !== total) return;
        const elapsed = (Date.now() - startedAt) / 1000;
        const rate = completed / Math.max(elapsed, 1);
        const eta = rate > 0 ? (total - completed) / rate : 0;
        console.log(
          `processed ${completed}/${total} | ${rate.toFixed(2)}/s | ETA ${formatEta(eta)}`
        );
      },
    }
  );

  const changed = results.filter(
    (row) => row.status === "repaired" || row.status === "would-repair"
  );
  const unchanged = results.filter((row) => row.status === "unchanged");
  const failed = results.filter(
    (row) =>
      row.status === "no-url" ||
      row.status === "no-live-images" ||
      row.status.startsWith("gone-") ||
      row.status.startsWith("error")
  );

  console.log("\nSummary");
  console.log(`  ${APPLY ? "Repaired" : "Would repair"}: ${changed.length}`);
  console.log(`  Unchanged: ${unchanged.length}`);
  console.log(`  Failed/skipped: ${failed.length}`);

  for (const row of changed.slice(0, 5)) {
    console.log(
      `  e.g. ${row.sku} ${row.name.slice(0, 50)} | ${row.oldCount} -> ${row.newCount} images`
    );
  }

  for (const row of failed.slice(0, 5)) {
    console.log(`  skip ${row.sku} ${row.name.slice(0, 45)} | ${row.status}`);
  }

  if (!APPLY) {
    console.log(
      "\nDry run - no database or crawl files were modified. Re-run with --apply when ready."
    );
    return;
  }

  for (const row of results) {
    processed[row.id] = {
      status:
        row.status === "repaired"
          ? "repaired"
          : row.status === "unchanged"
            ? "unchanged"
            : "failed",
      sku: row.sku,
      at: new Date().toISOString(),
    };
  }

  atomicWriteJson(STATE_FILE, {
    updatedAt: new Date().toISOString(),
    processed,
  });

  ensureDir(REPAIR_DIR);
  const reportPath = path.join(REPAIR_DIR, `repair-${nowStamp()}.csv`);
  fs.writeFileSync(reportPath, toCsv(results));
  console.log(`Report: ${reportPath}`);

  if (UPDATE_CRAWL && repairedBySku.size > 0) {
    await updateCrawlData(repairedBySku);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
