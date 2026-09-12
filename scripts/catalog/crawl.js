const fs = require("fs");
const path = require("path");
const {
  SITEMAP_URL,
  BASE_URL,
  DATA_DIR,
  CONCURRENCY,
  REQUEST_DELAY_MS,
} = require("./config");
const { fetchPage, runPool } = require("./http");
const { parseProductPage, parseListingPage } = require("./parse");
const {
  appendJsonl,
  atomicWriteJson,
  ensureDir,
  loadDoneSet,
  nowStamp,
  parseArgs,
  readJsonSafe,
} = require("./util");

function log(message) {
  const time = new Date().toLocaleTimeString("en-GB");
  console.log(`[${time}] ${message}`);
}

async function fetchSitemapUrls() {
  const { html: xml } = await fetchPage(SITEMAP_URL);

  if (!xml) {
    throw new Error("Sitemap could not be fetched.");
  }

  const urls = [
    ...new Set(
      [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim())
    ),
  ];

  return urls.filter(
    (url) =>
      url.startsWith(BASE_URL) &&
      !/\.(jpg|jpeg|png|webp|svg|pdf|zip|css|js)$/i.test(url)
  );
}

async function main() {
  const args = parseArgs();
  const runId = args.run || `run-${nowStamp()}`;
  const runDir = path.join(DATA_DIR, "runs", runId);
  ensureDir(runDir);

  const manifestFile = path.join(runDir, "manifest.json");
  const productsFile = path.join(runDir, "products.jsonl");
  const listingsFile = path.join(runDir, "listings.jsonl");
  const categoriesFile = path.join(runDir, "categories.jsonl");
  const errorsFile = path.join(runDir, "errors.jsonl");
  const stateFile = path.join(runDir, "state.json");

  const concurrency = args.concurrency || CONCURRENCY;
  const delayMs = args.delay || REQUEST_DELAY_MS;
  const productLimit = args.products || 0;

  let manifest = readJsonSafe(manifestFile);

  if (!manifest || args.fresh) {
    log("Fetching sitemap...");
    const urls = await fetchSitemapUrls();
    manifest = { fetchedAt: new Date().toISOString(), urls };
    atomicWriteJson(manifestFile, manifest);
    log(`Manifest written: ${urls.length} URLs`);
  } else {
    log(`Resuming run "${runId}" with ${manifest.urls.length} manifest URLs`);
  }

  let state = readJsonSafe(stateFile, null);

  if (!state || args.fresh) {
    state = {
      runId,
      startedAt: new Date().toISOString(),
      processed: 0,
      products: 0,
      listings: 0,
      other: 0,
      notFound: 0,
      failed: 0,
    };
  }

  state.sessionProcessed = 0;

  const doneFiles = [productsFile, listingsFile, categoriesFile];
  if (!args["retry-errors"]) doneFiles.push(errorsFile);

  const done = await loadDoneSet(doneFiles);
  log(`Already completed URLs: ${done.size}`);

  const queue = args.limit
    ? manifest.urls.slice(0, args.limit)
    : manifest.urls;

  const startedAt = Date.now();
  let stopping = false;
  let lastFlush = 0;

  const flushState = () => {
    state.updatedAt = new Date().toISOString();
    state.totalUrls = manifest.urls.length;
    atomicWriteJson(stateFile, state);
  };

  process.on("SIGINT", () => {
    if (stopping) return;
    stopping = true;
    log("Stopping after current requests... state will be saved.");
  });

  await runPool(
    queue,
    async (url) => {
      if (done.has(url)) return;

      let result;
      try {
        result = await fetchPage(url);
      } catch (error) {
        state.failed += 1;
        appendJsonl(errorsFile, {
          url,
          reason: "fetch_failed",
          message: error.message,
        });
        return;
      }

      if (!result.html) {
        state.notFound += 1;
        appendJsonl(errorsFile, { url, reason: "not_found", status: result.status });
        return;
      }

      const product = parseProductPage(result.html, url);

      if (product) {
        appendJsonl(productsFile, product);
        state.products += 1;

        if (productLimit && state.products >= productLimit) {
          stopping = true;
        }
        return;
      }

      const listing = parseListingPage(result.html, url);
      if (listing.tiles.length > 0 || listing.total !== null) {
        appendJsonl(listingsFile, listing);
        appendJsonl(categoriesFile, {
          url,
          name: listing.categoryName,
          total: listing.total,
          scrapedAt: new Date().toISOString(),
        });
        state.listings += 1;
        return;
      }

      state.other += 1;
    },
    {
      concurrency,
      delayMs,
      shouldStop: () => stopping,
      onProgress: (completed) => {
        state.processed += 1;
        state.sessionProcessed += 1;

        if (completed % 25 === 0 || stopping) {
          const elapsed = (Date.now() - startedAt) / 1000;
          const rate = completed / Math.max(1, elapsed);
          const remaining = queue.length - completed;
          const etaMinutes = rate > 0 ? (remaining / rate / 60).toFixed(1) : "?";
          log(
            `processed ${completed}/${queue.length} | products ${state.products} | listings ${state.listings} | 404 ${state.notFound} | failed ${state.failed} | ${rate.toFixed(1)}/s | ETA ${etaMinutes}m`
          );
        }

        if (completed - lastFlush >= 25) {
          lastFlush = completed;
          flushState();
        }
      },
    }
  );

  flushState();

  log("---------------------------------------------");
  log(`Run: ${runId}`);
  log(`This session: ${state.sessionProcessed} URLs | total: ${state.processed} URLs`);
  log(`Products: ${state.products} | Listings: ${state.listings}`);
  log(`Not found: ${state.notFound} | Failed: ${state.failed} | Other: ${state.other}`);
  log(`Data: ${runDir}`);
  log(stopping ? "Stopped early. Re-run without --fresh to resume." : "Crawl complete.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
