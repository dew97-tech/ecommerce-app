const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();

const BATCH_SIZE = 200;

const normalizeKey = (key) => String(key).replace(/\s+/g, ' ').trim().slice(0, 60);
const normalizeValue = (value) => String(value).replace(/\s+/g, ' ').trim().slice(0, 120);

function extractAttributes(specData) {
  if (!specData || typeof specData !== 'object' || Array.isArray(specData)) {
    return {};
  }

  const flat = {};

  const visit = (obj, depth) => {
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if (depth < 2) visit(value, depth + 1);
        continue;
      }

      if (value === null || typeof value === 'object') continue;

      const cleanKey = normalizeKey(key);
      const cleanValue = normalizeValue(value);

      if (cleanKey && cleanValue && !flat[cleanKey]) {
        flat[cleanKey] = cleanValue;
      }
    }
  };

  visit(specData, 0);
  return flat;
}

function inferAvailability(stock) {
  if (stock > 0) return 'IN_STOCK';
  return 'OUT_OF_STOCK';
}

async function main() {
  const { parseProductData } = await import('../../lib/product-parser.js');

  console.log('Starting migration of specifications to attributes...');

  const totalProducts = await prisma.product.count();
  console.log(`Total products in DB: ${totalProducts}`);

  let cursor = null;
  let scanned = 0;
  let updatedCount = 0;
  let skipped = 0;

  for (;;) {
    const products = await prisma.product.findMany({
      where: {
        attributes: { equals: Prisma.DbNull },
        ...(cursor ? { id: { gt: cursor } } : {}),
      },
      select: { id: true, specifications: true, stock: true },
      orderBy: { id: 'asc' },
      take: BATCH_SIZE,
    });

    if (products.length === 0) break;

    cursor = products[products.length - 1].id;
    scanned += products.length;

    for (const product of products) {
      try {
        const parsed = parseProductData(product.specifications);
        const attributes = extractAttributes(parsed);

        if (Object.keys(attributes).length === 0) {
          skipped++;
          continue;
        }

        await prisma.product.update({
          where: { id: product.id },
          data: {
            attributes,
            availabilityStatus: inferAvailability(product.stock),
          },
        });

        updatedCount++;
      } catch (error) {
        console.error(`Failed to update product ${product.id}:`, error.message);
      }
    }

    console.log(`Scanned ${scanned} products, migrated ${updatedCount}...`);
  }

  console.log(`Migration completed. Updated ${updatedCount}, skipped ${skipped} (no parseable specs).`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
