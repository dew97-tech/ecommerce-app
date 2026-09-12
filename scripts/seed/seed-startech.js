const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const { PrismaClient } = require('@prisma/client');
const { filterImagesForProduct } = require('../catalog/images');

const prisma = new PrismaClient();

const BATCH_SIZE = 20;

const FORCE = process.argv.includes('--force');

const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const cleanPrice = (priceStr) => {
  if (!priceStr) return 0;

  const cleaned = priceStr.toString().replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
};

const categoryCache = new Map();

let processedCount = 0;
let skippedCount = 0;
let failedCount = 0;

async function getOrCreateCategory(name, parentName = null) {
  const cacheKey = `${parentName || 'ROOT'}:${name}`;
  if (categoryCache.has(cacheKey)) {
    return categoryCache.get(cacheKey);
  }

  let parentId = null;
  if (parentName) {
    const parent = await getOrCreateCategory(parentName);
    parentId = parent.id;
  }

  const slug = generateSlug(name) || `category-${Date.now()}`;

  let category = await prisma.category.findFirst({
    where: {
      name: name,
      parentId: parentId
    }
  });

  if (!category) {

    const existingSlug = await prisma.category.findUnique({ where: { slug } });
    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

    category = await prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        parentId,
        image: `https://placehold.co/100x100/png?text=${encodeURIComponent(name)}`
      }
    });
    console.log(`Created category: ${name} (Parent: ${parentName})`);
  }

  categoryCache.set(cacheKey, category);
  return category;
}

function buildCategoryNames(row) {
  const parentCategoryName = (row.parent_category || '').trim() || null;
  let categoryName = (row.category || '').trim();

  if (!categoryName) {
    categoryName = parentCategoryName || 'Uncategorized';
  }

  return {
    parentCategoryName: categoryName === parentCategoryName ? null : parentCategoryName,
    categoryName,
  };
}

function buildProductData(row, category) {
  const name = row.title;
  const slug = generateSlug(name);
  const productCode = row.product_code;
  const price = cleanPrice(row.price);

  const images = [];
  if (row.main_image) images.push(row.main_image);
  if (row.gallery) {
    const gallery = row.gallery.split(',').map(s => s.trim()).filter(Boolean);
    images.push(...gallery);
  }
  if (images.length === 0) {
    images.push(`https://placehold.co/600x600/png?text=${encodeURIComponent(name)}`);
  }

  const filteredImages = filterImagesForProduct(name, images);

  return {
    name,
    slug: `${slug}-${productCode}`,
    productCode,
    price,
    brand: row.brand || null,
    description: row.description || '',
    shortDescription: row.short_description || '',
    specifications: row.specification || '',
    images: JSON.stringify(filteredImages),
    categoryId: category.id,
    stock: 50,
    isTrending: false,
    availabilityStatus: 'IN_STOCK',
  };
}

async function processRow(row) {
  if (!row.title || !row.price) return;

  const productCode = row.product_code;

  if (!FORCE) {
    const exists = await prisma.product.findUnique({
      where: { productCode },
      select: { id: true },
    });

    if (exists) {
      skippedCount++;
      return;
    }
  }

  const { categoryName, parentCategoryName } = buildCategoryNames(row);
  const category = await getOrCreateCategory(categoryName, parentCategoryName);
  const data = buildProductData(row, category);

  await prisma.product.upsert({
    where: { productCode: data.productCode },
    update: {
      name: data.name,
      price: data.price,
      brand: data.brand,
      description: data.description,
      shortDescription: data.shortDescription,
      specifications: data.specifications,
      images: data.images,
      categoryId: data.categoryId,
      stock: data.stock,
      availabilityStatus: data.availabilityStatus,
    },
    create: data,
  });

  processedCount++;
  if (processedCount % 500 === 0) {
    console.log(`Imported ${processedCount} products (${failedCount} failed)...`);
  }
}

async function main() {
  const startedAt = Date.now();
  console.log('Starting StarTech data import...');
  console.log(
    FORCE
      ? 'Mode: FORCE - existing products will be overwritten from output.csv.'
      : 'Mode: bootstrap - existing products are skipped (use --force to overwrite).'
  );

  const csv = fs.readFileSync(
    path.join(__dirname, '..', '..', 'data', 'source', 'output.csv'),
    'utf8'
  );
  const parsed = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors && parsed.errors.length > 0) {
    console.warn(`CSV parse warnings/errors: ${parsed.errors.length}`);
    parsed.errors.slice(0, 5).forEach(e => console.warn(' -', e.code, e.message, e.row));
  }

  const rows = parsed.data.filter((row) => row.product_code);
  console.log(`Parsed ${rows.length} data rows.`);

  if (FORCE) {

    const uniqueCategories = new Map();
    for (const row of rows) {
      const { categoryName, parentCategoryName } = buildCategoryNames(row);
      uniqueCategories.set(`${parentCategoryName || 'ROOT'}:${categoryName}`, { categoryName, parentCategoryName });
    }
    for (const { categoryName, parentCategoryName } of uniqueCategories.values()) {
      await getOrCreateCategory(categoryName, parentCategoryName);
    }
    console.log(`Ensured ${categoryCache.size} categories.`);
  }

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(batch.map((row) => processRow(row)));

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        failedCount++;
        const row = batch[index];
        console.error(`Failed to process ${row.product_code}: ${result.reason?.message || result.reason}`);
      }
    });
  }

  const seconds = Math.round((Date.now() - startedAt) / 1000);
  console.log(
    `Import finished in ${seconds}s. Imported: ${processedCount}, skipped (already exist): ${skippedCount}, failed: ${failedCount}.`
  );

  if (failedCount > 0) {
    throw new Error(`${failedCount} rows failed to import.`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
