const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with categories and products...\n')

  // First, create categories
  console.log('Creating categories...')
  const categories = [
    { name: 'Smartphone', slug: 'smartphone', icon: '📱' },
    { name: 'GPU', slug: 'gpu', icon: '🎮' },
    { name: 'Monitor', slug: 'monitor', icon: '🖥️' },
    { name: 'Keyboard', slug: 'keyboard', icon: '⌨️' },
    { name: 'CPU', slug: 'cpu', icon: '🔧' },
    { name: 'RAM', slug: 'ram', icon: '💾' },
    { name: 'SSD', slug: 'ssd', icon: '💿' },
  ]

  const categoryMap = {}
  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat
    })
    categoryMap[cat.name] = category.id
    console.log(`  ✓ ${cat.name}`)
  }

  console.log('\nCreating products with markdown descriptions and variants...')

  // Delete existing products with these slugs to avoid conflicts
  const slugsToDelete = [
    'iphone-15-pro-max',
    'asus-rog-phone-8-pro',
    'nvidia-rtx-4090',
    'samsung-odyssey-g9',
    'logitech-mx-master-3s'
  ]
  
  await prisma.product.deleteMany({
    where: { slug: { in: slugsToDelete } }
  })

  // Sample products with markdown descriptions and variants
  const products = [
    {
      name: "iPhone 15 Pro Max",
      slug: "iphone-15-pro-max",
      description: `# iPhone 15 Pro Max

## Key Features
- **A17 Pro Chip** - The most powerful smartphone chip ever
- **ProMotion Display** - 120Hz adaptive refresh rate
- **Titanium Design** - Aerospace-grade titanium frame
- **Action Button** - Customizable quick actions

## Camera System
- 48MP Main Camera with 2x Telephoto
- 12MP Ultra Wide
- 12MP 3x Telephoto
- LiDAR Scanner for Night mode portraits

## Specifications
| Feature | Details |
|---------|---------|
| Display | 6.7" Super Retina XDR |
| Chip | A17 Pro |
| Storage | 256GB / 512GB / 1TB |
| Battery | Up to 29 hours video playback |

> **Note**: Includes USB-C charging and supports MagSafe wireless charging.`,
      price: 135000,
      stock: 50,
      categoryId: categoryMap['Smartphone'],
      isTrending: true,
      images: JSON.stringify([
        'https://image.pollinations.ai/prompt/iPhone%2015%20Pro%20Max%20Titanium%20Blue?width=800&height=800&nologo=true',
        'https://image.pollinations.ai/prompt/iPhone%2015%20Pro%20Max%20Camera%20System?width=800&height=800&nologo=true'
      ]),
      variants: [
        { color: 'Natural Titanium', capacity: '256GB', stock: 15, price: 0 },
        { color: 'Natural Titanium', capacity: '512GB', stock: 12, price: 20000 },
        { color: 'Natural Titanium', capacity: '1TB', stock: 8, price: 40000 },
        { color: 'Blue Titanium', capacity: '256GB', stock: 10, price: 0 },
        { color: 'Blue Titanium', capacity: '512GB', stock: 8, price: 20000 },
        { color: 'Black Titanium', capacity: '256GB', stock: 12, price: 0 },
      ]
    },
    {
      name: "ASUS ROG Phone 8 Pro",
      slug: "asus-rog-phone-8-pro",
      description: `# ASUS ROG Phone 8 Pro

## Gaming Powerhouse
The ultimate gaming smartphone with **Snapdragon 8 Gen 3** and advanced cooling.

### Performance
- **Snapdragon 8 Gen 3** processor
- **24GB LPDDR5X RAM** for seamless multitasking
- **GameCool 8** thermal system
- **165Hz AMOLED** display

### Gaming Features
- AirTrigger 8 ultrasonic buttons
- X Mode for performance boost
- Aura RGB lighting
- Dual front-facing speakers

### Battery & Charging
- 5500mAh battery
- 65W HyperCharge
- Bypass charging for gaming

> **Perfect for**: Mobile gamers, content creators, power users`,
      price: 95000,
      stock: 30,
      categoryId: categoryMap['Smartphone'],
      isTrending: true,
      images: JSON.stringify([
        'https://image.pollinations.ai/prompt/ASUS%20ROG%20Phone%208%20Pro%20Gaming?width=800&height=800&nologo=true'
      ]),
      variants: [
        { color: 'Phantom Black', capacity: '256GB', stock: 10, price: 0 },
        { color: 'Phantom Black', capacity: '512GB', stock: 8, price: 15000 },
        { color: 'Storm White', capacity: '256GB', stock: 7, price: 0 },
        { color: 'Storm White', capacity: '512GB', stock: 5, price: 15000 },
      ]
    },
    {
      name: "NVIDIA RTX 4090",
      slug: "nvidia-rtx-4090",
      description: `# NVIDIA GeForce RTX 4090

## The Ultimate GPU
Experience **unparalleled performance** with the world's most powerful graphics card.

### Specifications
- **CUDA Cores**: 16,384
- **Memory**: 24GB GDDR6X
- **Memory Bus**: 384-bit
- **Boost Clock**: 2.52 GHz
- **TDP**: 450W

### Technologies
- **DLSS 3** with Frame Generation
- **Ray Tracing Cores** (3rd Gen)
- **Tensor Cores** (4th Gen)
- **AV1 Encoding**

### Performance
- 4K Gaming at **144+ FPS**
- 8K Gaming capable
- AI-accelerated workflows
- Professional content creation

\`\`\`
Recommended PSU: 850W+
PCIe 5.0 x16
3x 8-pin power connectors
\`\`\`

> **Warning**: Requires adequate PSU and cooling`,
      price: 200000,
      stock: 15,
      categoryId: categoryMap['GPU'],
      isTrending: true,
      images: JSON.stringify([
        'https://image.pollinations.ai/prompt/NVIDIA%20RTX%204090%20Graphics%20Card?width=800&height=800&nologo=true'
      ]),
      variants: [
        { color: 'Founders Edition', size: 'Standard', stock: 5, price: 0 },
        { color: 'ASUS ROG Strix', size: 'Standard', stock: 4, price: 20000 },
        { color: 'MSI Gaming X Trio', size: 'Standard', stock: 3, price: 15000 },
        { color: 'Gigabyte Gaming OC', size: 'Standard', stock: 3, price: 10000 },
      ]
    },
    {
      name: "Samsung Odyssey G9",
      slug: "samsung-odyssey-g9",
      description: `# Samsung Odyssey G9

## Ultra-Wide Gaming Monitor
**49-inch** curved gaming monitor with **Quantum Mini-LED** technology.

### Display
- **Size**: 49" (32:9 aspect ratio)
- **Resolution**: 5120 x 1440 (Dual QHD)
- **Refresh Rate**: 240Hz
- **Response Time**: 1ms (GTG)
- **Curvature**: 1000R

### Features
- Quantum Mini-LED with **2048 dimming zones**
- **HDR 2000** certification
- **AMD FreeSync Premium Pro**
- **G-Sync Compatible**

### Connectivity
- DisplayPort 1.4 x2
- HDMI 2.1 x1
- USB Hub

> **Immersive Experience**: Perfect for sim racing and productivity`,
      price: 120000,
      stock: 10,
      categoryId: categoryMap['Monitor'],
      isTrending: false,
      images: JSON.stringify([
        'https://image.pollinations.ai/prompt/Samsung%20Odyssey%20G9%20Curved%20Monitor?width=800&height=800&nologo=true'
      ]),
      variants: []
    },
    {
      name: "Logitech MX Master 3S",
      slug: "logitech-mx-master-3s",
      description: `# Logitech MX Master 3S

## Premium Wireless Mouse
The **ultimate productivity mouse** with silent clicks and 8K DPI sensor.

### Features
- **8000 DPI** Darkfield sensor
- **Silent clicks** (90% quieter)
- **MagSpeed** electromagnetic scrolling
- **Multi-device** (up to 3 devices)
- **USB-C rechargeable**

### Ergonomics
- Sculpted design for comfort
- Thumb rest with side buttons
- Gesture button

### Compatibility
- Windows, macOS, Linux
- Logi Options+ software
- Flow technology for multi-computer control

**Battery Life**: Up to 70 days on full charge`,
      price: 12000,
      stock: 40,
      categoryId: categoryMap['Keyboard'],
      isTrending: false,
      images: JSON.stringify([
        'https://image.pollinations.ai/prompt/Logitech%20MX%20Master%203S%20Mouse?width=800&height=800&nologo=true'
      ]),
      variants: [
        { color: 'Graphite', size: 'Standard', stock: 20, price: 0 },
        { color: 'Pale Grey', size: 'Standard', stock: 15, price: 0 },
        { color: 'Black', size: 'Standard', stock: 5, price: 0 },
      ]
    }
  ]

  // Create products with variants
  for (const productData of products) {
    const { variants, ...productInfo } = productData
    
    const product = await prisma.product.create({
      data: {
        ...productInfo,
        variants: {
          create: variants
        }
      }
    })
    
    console.log(`  ✓ ${product.name} (${variants.length} variants)`)
  }

  console.log('\n✅ Seeding completed successfully!')
  console.log(`   - ${categories.length} categories created`)
  console.log(`   - ${products.length} products created with markdown descriptions`)
}

main()
  .catch((e) => {
    console.error('\n❌ Error:', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
