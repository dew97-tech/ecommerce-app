const { spawnSync } = require("child_process");
const { parseArgs } = require("./util");

function run(script, extraArgs) {
  const result = spawnSync(
    process.execPath,
    ["--env-file=.env", script, ...extraArgs],
    { stdio: "inherit" }
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function main() {
  const args = parseArgs();

  const crawlArgs = [];
  if (args.run) crawlArgs.push(`--run=${args.run}`);
  if (args.fresh) crawlArgs.push("--fresh");
  if (args.products) crawlArgs.push(`--products=${args.products}`);
  if (args.limit) crawlArgs.push(`--limit=${args.limit}`);
  if (args.concurrency) crawlArgs.push(`--concurrency=${args.concurrency}`);
  if (args.delay) crawlArgs.push(`--delay=${args.delay}`);
  if (args["retry-errors"]) crawlArgs.push("--retry-errors");

  console.log("=== Catalog refresh: crawl ===");
  run("scripts/catalog/crawl.js", crawlArgs);

  const syncArgs = [];
  if (args.run) syncArgs.push(`--run=${args.run}`);
  if (args.apply) syncArgs.push("--apply");
  if (args.limit) syncArgs.push(`--limit=${args.limit}`);
  if (args.resume) syncArgs.push("--resume");
  if (args["archive-missing"]) syncArgs.push("--archive-missing");

  console.log("");
  console.log("=== Catalog refresh: sync ===");
  run("scripts/catalog/sync.js", syncArgs);
}

main();
