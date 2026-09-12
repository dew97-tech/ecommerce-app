const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ASSETS_DIR = path.join(process.cwd(), "assets");
const OUTPUT_DIR = path.join(process.cwd(), "public", "categories");

const SOURCE_PATTERN = /^category_([a-z0-9-]+)\.jpe?g$/i;
const TILE_SIZE = 600;

async function main() {
  if (!fs.existsSync(ASSETS_DIR)) {
    throw new Error(`Assets folder not found: ${ASSETS_DIR}`);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const files = fs
    .readdirSync(ASSETS_DIR)
    .filter((file) => SOURCE_PATTERN.test(file));

  if (files.length === 0) {
    console.log("No category tile source files found in assets/.");
    return;
  }

  for (const file of files) {
    const [, key] = file.match(SOURCE_PATTERN);
    const source = path.join(ASSETS_DIR, file);
    const outputName = `${key}.webp`;

    await sharp(source)
      .resize(TILE_SIZE, TILE_SIZE, { fit: "cover", position: "centre" })
      .webp({ quality: 80 })
      .toFile(path.join(OUTPUT_DIR, outputName));

    console.log(`Wrote public/categories/${outputName}`);
  }

  console.log("Category tile optimization complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
