const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = process.cwd();
const SVG_FILE = path.join(ROOT, "app", "icon.svg");

const PNG_TARGETS = [
  { file: path.join(ROOT, "app", "apple-icon.png"), size: 180 },
  { file: path.join(ROOT, "app", "icon.png"), size: 512 },
  { file: path.join(ROOT, "public", "icon-192.png"), size: 192 },
  { file: path.join(ROOT, "public", "icon-512.png"), size: 512 },
];

const FAVICON_SIZES = [16, 32, 48];

function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const entries = [];
  let offset = 6 + images.length * 16;

  for (const image of images) {
    const entry = Buffer.alloc(16);
    entry[0] = image.size >= 256 ? 0 : image.size;
    entry[1] = image.size >= 256 ? 0 : image.size;
    entry[2] = 0;
    entry[3] = 0;
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(image.buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += image.buffer.length;
    entries.push(entry);
  }

  return Buffer.concat([header, ...entries, ...images.map((image) => image.buffer)]);
}

async function main() {
  const svg = fs.readFileSync(SVG_FILE);

  for (const target of PNG_TARGETS) {
    const buffer = await sharp(svg, { density: 384 })
      .resize(target.size, target.size)
      .png()
      .toBuffer();
    fs.writeFileSync(target.file, buffer);
    console.log(`Wrote ${path.relative(ROOT, target.file)} (${target.size}x${target.size})`);
  }

  const faviconImages = [];
  for (const size of FAVICON_SIZES) {
    const buffer = await sharp(svg, { density: 384 })
      .resize(size, size)
      .png()
      .toBuffer();
    faviconImages.push({ size, buffer });
  }

  fs.writeFileSync(path.join(ROOT, "app", "favicon.ico"), buildIco(faviconImages));
  console.log("Wrote app/favicon.ico (16/32/48)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
