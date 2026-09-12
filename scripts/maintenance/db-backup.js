const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function parseDatabaseUrl(value) {
  const url = new URL(value);
  return {
    host: url.hostname,
    port: url.port || "3306",
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
  };
}

function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("DATABASE_URL is not set. Run with: node --env-file=.env scripts/db-backup.js");
    process.exit(1);
  }

  const { host, port, user, password, database } = parseDatabaseUrl(databaseUrl);
  const outputDir = path.join(process.cwd(), "backups");
  fs.mkdirSync(outputDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputFile = path.join(outputDir, `${database}-${stamp}.sql`);

  console.log(`Backing up "${database}" to ${outputFile} ...`);

  const result = spawnSync(
    "mysqldump",
    [
      "-h",
      host,
      "-P",
      port,
      "-u",
      user,
      "--single-transaction",
      "--no-tablespaces",
      "--routines",
      "--triggers",
      "--result-file",
      outputFile,
      database,
    ],
    { env: { ...process.env, MYSQL_PWD: password }, stdio: "inherit" }
  );

  if (result.error) {
    console.error("mysqldump was not found. Make sure the MySQL bin folder is in PATH.");
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error("mysqldump failed.");
    process.exit(result.status ?? 1);
  }

  const size = fs.statSync(outputFile).size;
  console.log(`Backup complete: ${(size / 1024 / 1024).toFixed(1)} MB`);
}

main();
