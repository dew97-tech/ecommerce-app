const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ASSETS_DIR = path.join(process.cwd(), "assets");
const OUTPUT_DIR = path.join(process.cwd(), "public", "banners");

const VARIANTS = {
  desktop: [1920, 1280, 960],
  mobile: [1080, 720, 480],
};

const SOURCE_PATTERN = /^banner_(.+)_(desktop|mobile)\.jpe?g$/i;

async function main() {
  if (!fs.existsSync(ASSETS_DIR)) {
    throw new Error(`Assets folder not found: ${ASSETS_DIR}`);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const files = fs
    .readdirSync(ASSETS_DIR)
    .filter((file) => SOURCE_PATTERN.test(file));

  if (files.length === 0) {
    console.log("No banner source files found in assets/.");
    return;
  }

  for (const file of files) {
    const [, campaign, variant] = file.match(SOURCE_PATTERN);
    const widths = VARIANTS[variant.toLowerCase()];
    const source = path.join(ASSETS_DIR, file);

    for (const width of widths) {
      const outputName = `${campaign}-${variant}-${width}.webp`;
      await sharp(source)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(path.join(OUTPUT_DIR, outputName));
      console.log(`Wrote public/banners/${outputName}`);
    }

    const baseName = `${campaign}-${variant}.webp`;
    await sharp(source)
      .resize({ width: widths[0], withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(OUTPUT_DIR, baseName));
    console.log(`Wrote public/banners/${baseName}`);
  }

  console.log("Banner optimization complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
