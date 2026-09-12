const fs = require("fs");
const path = require("path");
const readline = require("readline");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function nowStamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function atomicWriteJson(file, value) {
  ensureDir(path.dirname(file));
  const temp = `${file}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(value, null, 2));
  fs.renameSync(temp, file);
}

function readJsonSafe(file, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function appendJsonl(file, value) {
  ensureDir(path.dirname(file));
  fs.appendFileSync(file, `${JSON.stringify(value)}\n`);
}

async function* readJsonl(file) {
  if (!fs.existsSync(file)) return;

  const stream = fs.createReadStream(file, { encoding: "utf8" });
  const reader = readline.createInterface({ input: stream, crlfDelay: Infinity });

  for await (const line of reader) {
    if (!line.trim()) continue;
    try {
      yield JSON.parse(line);
    } catch {

    }
  }
}

async function loadDoneSet(files) {
  const done = new Set();

  for (const file of files) {
    for await (const entry of readJsonl(file)) {
      if (entry.url) done.add(entry.url);
    }
  }

  return done;
}

function listRuns(dataDir) {
  const runsDir = path.join(dataDir, "runs");
  if (!fs.existsSync(runsDir)) return [];

  return fs
    .readdirSync(runsDir)
    .filter((name) => fs.statSync(path.join(runsDir, name)).isDirectory())
    .sort()
    .reverse();
}

function parseArgs(argv = process.argv.slice(2)) {
  const args = {};

  for (const raw of argv) {
    if (!raw.startsWith("--")) continue;
    const [key, value] = raw.slice(2).split("=");
    if (value === undefined) args[key] = true;
    else if (/^\d+$/.test(value)) args[key] = Number(value);
    else args[key] = value;
  }

  return args;
}

module.exports = {
  appendJsonl,
  atomicWriteJson,
  ensureDir,
  listRuns,
  loadDoneSet,
  nowStamp,
  parseArgs,
  readJsonSafe,
  readJsonl,
  sleep,
};
