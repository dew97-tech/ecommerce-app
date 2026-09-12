const path = require("path");

const ROOT = process.cwd();

module.exports = {
  BASE_URL: "https://www.startech.com.bd",
  SITEMAP_URL: "https://www.startech.com.bd/sitemap.xml",
  USER_AGENT:
    "RigNexusCatalogBot/1.0 (+catalog sync for rignexus.com; contact: support@rignexus.com)",
  DATA_DIR: path.join(ROOT, "data", "catalog"),
  REPORTS_DIR: path.join(ROOT, "reports", "catalog-sync"),
  REQUEST_DELAY_MS: 1100,
  CONCURRENCY: 2,
  MAX_RETRIES: 3,
  REQUEST_TIMEOUT_MS: 25000,
};
