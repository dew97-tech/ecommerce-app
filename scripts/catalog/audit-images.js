const { PrismaClient } = require("@prisma/client");
const { fetchPage } = require("./http");
const { parseProductPage } = require("./parse");
const { analyzeImagePollution, normalizeImageUrl } = require("./images");
const { parseArgs } = require("./util");

const prisma = new PrismaClient();

function shortUrl(url) {
  return String(url)
    .replace("https://www.startech.com.bd/image/cache/", "")
    .replace(/^catalog\//, "");
}

async function probe(products, count) {
  const sample = products.slice(0, count);

  for (const product of sample) {
    console.log(`\n${product.name}`);

    if (!product.sourceUrl) {
      console.log("  no source URL - cannot probe");
      continue;
    }

    try {
      const { status, html } = await fetchPage(product.sourceUrl);
      if (!html) {
        console.log(`  fetch returned no HTML (status ${status})`);
        continue;
      }

      const parsed = parseProductPage(html, product.sourceUrl);
      const live = parsed?.images ?? [];
      const liveSet = new Set(live.map(normalizeImageUrl));
      const notInLive = product.images.filter(
        (url) => !liveSet.has(normalizeImageUrl(url))
      );

      console.log(
        `  stored (${product.images.length}): ${product.images
          .map(shortUrl)
          .join(" | ")}`
      );
      console.log(
        `  live   (${live.length}): ${live.map(shortUrl).join(" | ")}`
      );
      console.log(
        `  stored images not in live gallery: ${notInLive.length}${
          notInLive.length
            ? ` -> ${notInLive.map(shortUrl).join(" | ")}`
            : ""
        }`
      );

      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.log(`  probe failed: ${error.message}`);
    }
  }
}

async function main() {
  const args = parseArgs();
  const probeCount = Number(args.probe) || 0;

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

  const report = analyzeImagePollution(products);
  const activeSuspects = report.suspects.filter((product) => product.isActive);

  console.log("Image pollution audit");
  console.log("---------------------");
  console.log(`Products:                    ${report.total}`);
  console.log(`Products with 2+ images:     ${report.multi}`);
  console.log(`Folder-mismatch suspects:    ${report.folderSuspect}`);
  console.log(`Foreign-primary suspects:    ${report.primarySuspect}`);
  console.log(`Suspects (repair set):       ${report.suspects.length}`);
  console.log(`  active suspects:           ${activeSuspects.length}`);
  console.log(`Foreign image entries:       ${report.foreignImages}`);
  console.log(
    `Single-image products:       ${report.parsed.filter((p) => p.images.length === 1).length}`
  );

  if (probeCount > 0) {
    console.log(`\nProbing ${Math.min(probeCount, activeSuspects.length)} suspect page(s)...`);
    await probe(activeSuspects, probeCount);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
