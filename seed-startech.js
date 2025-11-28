const fs = require('fs');
const Papa = require('papaparse');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper to generate slug
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-');  // Replace multiple - with single -
};

// Helper to clean price
const cleanPrice = (priceStr) => {
  if (!priceStr) return 0;
  // Remove commas and currency symbols, keep digits and decimal
  const cleaned = priceStr.toString().replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
};

// Cache for categories to reduce DB calls
const categoryCache = new Map();

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

  const slug = generateSlug(name);
  
  // Try to find existing
  let category = await prisma.category.findFirst({
    where: { 
      name: name,
      parentId: parentId
    }
  });

  if (!category) {
    // Check if slug exists (to avoid collision)
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

async function processRow(row) {
  if (!row.title || !row.price) return;

  try {
    // 1. Handle Category
    const categoryName = row.category || 'Uncategorized';
    const parentCategoryName = row.parent_category || null;
    
    const category = await getOrCreateCategory(categoryName, parentCategoryName);

    // 2. Prepare Product Data
    const name = row.title;
    const slug = generateSlug(name);
    const productCode = row.product_code || `CODE-${Date.now()}`;
    const price = cleanPrice(row.price);
    
    // Images
    const images = [];
    if (row.main_image) images.push(row.main_image);
    if (row.gallery) {
      const gallery = row.gallery.split(',').map(s => s.trim()).filter(Boolean);
      images.push(...gallery);
    }
    // Fallback image if none
    if (images.length === 0) {
        images.push(`https://placehold.co/600x600/png?text=${encodeURIComponent(name)}`);
    }

    // Upsert Product
    // We use productCode as unique identifier if available, otherwise slug
    await prisma.product.upsert({
      where: { productCode: productCode },
      update: {
        name,
        price,
        brand: row.brand,
        description: row.description || '',
        shortDescription: row.short_description || '',
        specifications: row.specification || '',
        images: JSON.stringify(images),
        categoryId: category.id,
        stock: 50, // Default stock
      },
      create: {
        name,
        slug: `${slug}-${productCode}`, // Ensure unique slug
        productCode,
        price,
        brand: row.brand,
        description: row.description || '',
        shortDescription: row.short_description || '',
        specifications: row.specification || '',
        images: JSON.stringify(images),
        categoryId: category.id,
        stock: 50,
        isTrending: false,
      }
    });
    
    // console.log(`Processed product: ${name}`);

  } catch (error) {
    console.error(`Failed to process row: ${row.title}`, error.message);
  }
}

async function main() {
  console.log("Starting StarTech data import...");
  
  const fileStream = fs.createReadStream('output.csv', 'utf8');
  
  return new Promise((resolve, reject) => {
    Papa.parse(fileStream, {
      header: true,
      skipEmptyLines: true,
      step: async (results, parser) => {
        parser.pause();
        await processRow(results.data);
        parser.resume();
      },
      complete: () => {
        console.log("Import completed successfully.");
        resolve();
      },
      error: (err) => {
        console.error("CSV parsing error:", err);
        reject(err);
      }
    });
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
