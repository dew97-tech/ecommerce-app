const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to parse HTML/Text specifications into a key-value object
function parseSpecifications(specHtml) {
  if (!specHtml) return {};

  const attributes = {};
  
  // Simple parsing strategy: 
  // 1. Remove HTML tags
  // 2. Split by newlines or common delimiters
  // 3. Try to find "Key: Value" patterns
  
  // Remove HTML tags but keep newlines
  let text = specHtml.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]+>/g, '');
  
  // Decode HTML entities (basic ones)
  text = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  lines.forEach(line => {
    // Look for patterns like "Processor: Intel Core i5" or "RAM: 8GB"
    // We'll split by the first colon found
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      
      if (key && value && key.length < 50 && value.length < 100) {
        // Normalize keys slightly (e.g., "Processor Type" -> "Processor")
        attributes[key] = value;
      }
    }
  });

  return attributes;
}

function inferAvailability(stock) {
  if (stock > 0) return 'IN_STOCK';
  return 'OUT_OF_STOCK';
}

async function main() {
  console.log('Starting migration of specifications to attributes...');

  const totalProducts = await prisma.product.count();
  console.log(`Total products in DB: ${totalProducts}`);

  const products = await prisma.product.findMany({
    where: {
      attributes: {
        equals: Prisma.DbNull
      }
    }
  });

  console.log(`Found ${products.length} products to migrate.`);

  let updatedCount = 0;

  for (const product of products) {
    try {
      const attributes = parseSpecifications(product.specifications);
      const availabilityStatus = inferAvailability(product.stock);

      // Also try to extract some common fields if they are missing in attributes but present in description
      // This is a basic heuristic
      
      await prisma.product.update({
        where: { id: product.id },
        data: {
          attributes,
          availabilityStatus
        }
      });

      updatedCount++;
      if (updatedCount % 50 === 0) {
        console.log(`Migrated ${updatedCount} products...`);
      }
    } catch (error) {
      console.error(`Failed to update product ${product.id}:`, error.message);
    }
  }

  console.log(`Migration completed. Updated ${updatedCount} products.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
