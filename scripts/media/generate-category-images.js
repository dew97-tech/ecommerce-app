const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const {
  SUBJECT_OVERRIDES,
  buildCategoryEntries,
  buildPrompt,
  isSkippable,
} = require("./category-tile-convention");

const ASSETS_DIR = path.join(process.cwd(), "assets");
const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

function getArg(name, fallback) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((value) => value.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : fallback;
}

const LIST_ONLY = process.argv.includes("--list");
const LIST_LIMIT = Number(getArg("list-limit", 10)) || 10;
const GENERATE_LIMIT = Number(getArg("limit", 0)) || 0;
const DELAY_MS = Number(getArg("delay", 5000)) || 5000;

const prisma = new PrismaClient();

async function getPendingTiles() {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      parentId: true,
      image: true,
      parent: { select: { name: true } },
      _count: { select: { products: true } },
    },
  });

  return buildCategoryEntries(categories)
    .filter((entry) => {
      if (entry.hasTile) return false;
      if (isSkippable(entry.name)) return false;
      return !fs.existsSync(path.join(ASSETS_DIR, `category_${entry.key}.jpg`));
    })
    .sort((a, b) => b.products - a.products)
    .map((entry) => ({
      ...entry,
      filename: `category_${entry.key}.jpg`,
      subject: SUBJECT_OVERRIDES[entry.key] ?? entry.name,
    }));
}

async function generateWithGemini(prompt, destPath) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${API_KEY}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: "1:1",
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const base64Image = data.predictions?.[0]?.bytesBase64Encoded;
  if (!base64Image) {
    throw new Error("No image data in API response");
  }

  fs.mkdirSync(ASSETS_DIR, { recursive: true });
  fs.writeFileSync(destPath, Buffer.from(base64Image, "base64"));
}

async function main() {
  const missing = await getPendingTiles();

  console.log(`Categories without a tile asset: ${missing.length}`);

  if (missing.length === 0) {
    console.log("All category tiles exist in assets/!");
    return;
  }

  if (LIST_ONLY || !API_KEY) {
    if (!API_KEY) {
      console.log("No GEMINI_API_KEY provided in environment.");
    }
    console.log(`Next ${Math.min(LIST_LIMIT, missing.length)} prompt(s):\n`);
    missing.slice(0, LIST_LIMIT).forEach((item, index) => {
      console.log(`[${index + 1}] File: assets/${item.filename}`);
      console.log(`    Category: ${item.parent} > ${item.name} (${item.products} products)`);
      console.log(`    Prompt: ${buildPrompt(item.subject)}\n`);
    });
    if (!API_KEY) {
      console.log(
        "To auto-generate via API: set GEMINI_API_KEY in .env and run `npm run tiles:generate`."
      );
    }
    return;
  }

  const queue = GENERATE_LIMIT > 0 ? missing.slice(0, GENERATE_LIMIT) : missing;
  console.log(
    `Generating ${queue.length} tile(s) with GEMINI_API_KEY (delay ${DELAY_MS}ms)...`
  );

  let generated = 0;
  let failed = 0;

  for (let index = 0; index < queue.length; index += 1) {
    const item = queue[index];
    const destPath = path.join(ASSETS_DIR, item.filename);
    let lastError = null;

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        console.log(
          `[${index + 1}/${queue.length}] ${item.filename} (${item.subject})...`
        );
        await generateWithGemini(buildPrompt(item.subject), destPath);
        generated += 1;
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
        const backoff = attempt * 3000;
        console.error(`  Attempt ${attempt} failed: ${error.message}`);
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, backoff));
        }
      }
    }

    if (lastError) {
      failed += 1;
      console.error(`  Giving up on ${item.filename} (continuing with the rest).`);
    }

    await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
  }

  console.log(`\nGenerated: ${generated} | failed: ${failed}`);
  console.log("Next: npm run tiles:optimize && npm run tiles:seed -- --apply");
}

main()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
