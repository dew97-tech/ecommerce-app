const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const categories = [
  "CPU", "GPU", "Monitor", "Speaker", "Keyboard", 
  "Cooler", "RAM", "PSU", "HDD", "SSD", "Smartphone"
]

const productTemplates = {
  "CPU": [
    { name: "Intel Core i9-14900K", price: 60000, desc: "24 cores, 32 threads, up to 6.0 GHz" },
    { name: "AMD Ryzen 9 7950X", price: 58000, desc: "16 cores, 32 threads, up to 5.7 GHz" },
    { name: "Intel Core i7-14700K", price: 45000, desc: "20 cores, 28 threads" },
    { name: "AMD Ryzen 7 7800X3D", price: 42000, desc: "Best for gaming, 3D V-Cache" },
    { name: "Intel Core i5-14600K", price: 32000, desc: "14 cores, 20 threads, great value" },
    { name: "AMD Ryzen 5 7600X", price: 25000, desc: "6 cores, 12 threads, budget king" },
    { name: "Intel Core i9-13900K", price: 55000, desc: "Previous gen flagship" },
    { name: "AMD Ryzen 9 7900X", price: 48000, desc: "12 cores, 24 threads" },
    { name: "Intel Core i5-13400F", price: 22000, desc: "Budget friendly gaming CPU" },
    { name: "AMD Ryzen 5 5600", price: 15000, desc: "Best entry level CPU" }
  ],
  "GPU": [
    { name: "NVIDIA RTX 4090", price: 200000, desc: "24GB GDDR6X, The ultimate GPU" },
    { name: "NVIDIA RTX 4080 Super", price: 120000, desc: "16GB GDDR6X, High end gaming" },
    { name: "AMD Radeon RX 7900 XTX", price: 110000, desc: "24GB GDDR6, AMD Flagship" },
    { name: "NVIDIA RTX 4070 Ti Super", price: 95000, desc: "16GB GDDR6X, 1440p King" },
    { name: "AMD Radeon RX 7800 XT", price: 60000, desc: "16GB GDDR6, Best value" },
    { name: "NVIDIA RTX 4060 Ti", price: 45000, desc: "8GB GDDR6, 1080p Ultra" },
    { name: "NVIDIA RTX 3060", price: 35000, desc: "12GB GDDR6, Budget favorite" },
    { name: "AMD Radeon RX 6600", price: 25000, desc: "8GB GDDR6, Entry level" },
    { name: "Intel Arc A770", price: 38000, desc: "16GB GDDR6, The new contender" },
    { name: "NVIDIA RTX 4090 ROG Strix", price: 220000, desc: "Overclocked beast" }
  ],
  "Monitor": [
    { name: "LG UltraGear 27GR95QE", price: 90000, desc: "27 inch OLED 240Hz" },
    { name: "Samsung Odyssey G9", price: 120000, desc: "49 inch Super Ultrawide" },
    { name: "Dell Alienware AW3423DWF", price: 100000, desc: "34 inch QD-OLED Ultrawide" },
    { name: "ASUS ROG Swift PG27AQDM", price: 95000, desc: "27 inch OLED 240Hz" },
    { name: "Gigabyte M27Q", price: 35000, desc: "27 inch IPS 170Hz KVM" },
    { name: "MSI Optix MAG274QRF-QD", price: 40000, desc: "27 inch IPS Quantum Dot" },
    { name: "BenQ Zowie XL2566K", price: 65000, desc: "24.5 inch TN 360Hz Esports" },
    { name: "AOC 24G2", price: 20000, desc: "24 inch IPS 144Hz Budget" },
    { name: "ViewSonic XG2431", price: 28000, desc: "24 inch IPS 240Hz Blur Busters" },
    { name: "LG 27GP850", price: 42000, desc: "27 inch Nano IPS 180Hz" }
  ],
  "Speaker": [
    { name: "Logitech Z906", price: 35000, desc: "5.1 Surround Sound System" },
    { name: "Edifier S1000MKII", price: 25000, desc: "Audiophile Bookshelf Speakers" },
    { name: "Creative Pebble V3", price: 4000, desc: "Minimalist USB Speakers" },
    { name: "Razer Leviathan V2", price: 22000, desc: "Gaming Soundbar with Sub" },
    { name: "Audioengine A2+", price: 28000, desc: "Premium Desktop Speakers" },
    { name: "Logitech G560", price: 18000, desc: "RGB Gaming Speakers" },
    { name: "Edifier R1280T", price: 10000, desc: "Best Budget Bookshelf" },
    { name: "Bose Companion 2", price: 12000, desc: "Clear Stereo Sound" },
    { name: "Harman Kardon SoundSticks 4", price: 30000, desc: "Iconic Design" },
    { name: "Klipsch ProMedia 2.1", price: 20000, desc: "THX Certified" }
  ],
  "Keyboard": [
    { name: "Keychron Q1 Pro", price: 18000, desc: "Custom Mechanical Wireless" },
    { name: "Logitech G915 TKL", price: 20000, desc: "Low Profile Wireless RGB" },
    { name: "Razer Huntsman V3 Pro", price: 22000, desc: "Analog Optical Switches" },
    { name: "SteelSeries Apex Pro TKL", price: 19000, desc: "Adjustable Actuation" },
    { name: "Wooting 60HE", price: 25000, desc: "Rapid Trigger Analog" },
    { name: "Corsair K70 MAX", price: 21000, desc: "Magnetic Mechanical" },
    { name: "Royal Kludge RK61", price: 4500, desc: "Budget 60% Wireless" },
    { name: "NuPhy Air75 V2", price: 14000, desc: "Low Profile Custom" },
    { name: "Akko 3068B Plus", price: 8000, desc: "Compact 65% Hot-swappable" },
    { name: "Glorious GMMK Pro", price: 16000, desc: "Barebones Custom Kit" }
  ],
  "Cooler": [
    { name: "NZXT Kraken Elite 360", price: 28000, desc: "360mm AIO with LCD" },
    { name: "Corsair iCUE H150i Elite", price: 25000, desc: "360mm AIO RGB" },
    { name: "Lian Li Galahad II Trinity", price: 18000, desc: "Performance AIO" },
    { name: "Noctua NH-D15", price: 10000, desc: "King of Air Coolers" },
    { name: "Deepcool AK620", price: 6000, desc: "Best Value Dual Tower" },
    { name: "Arctic Liquid Freezer III 360", price: 14000, desc: "Best Performance AIO" },
    { name: "Be Quiet! Dark Rock Pro 5", price: 9000, desc: "Silent Air Cooler" },
    { name: "Thermalright Peerless Assassin", price: 4500, desc: "Budget King" },
    { name: "Cooler Master Hyper 212", price: 3500, desc: "Classic Air Cooler" },
    { name: "Asus ROG Ryujin III", price: 35000, desc: "Premium AIO with Fan" }
  ],
  "RAM": [
    { name: "G.Skill Trident Z5 RGB 32GB", price: 15000, desc: "DDR5 6000MHz CL30" },
    { name: "Corsair Dominator Titanium 32GB", price: 20000, desc: "DDR5 Premium RGB" },
    { name: "Teamgroup T-Force Delta 32GB", price: 12000, desc: "DDR5 RGB White" },
    { name: "Kingston Fury Beast 16GB", price: 6000, desc: "DDR5 5200MHz" },
    { name: "Crucial Pro 32GB", price: 10000, desc: "DDR5 No-RGB Low Profile" },
    { name: "G.Skill Ripjaws S5 32GB", price: 11000, desc: "DDR5 Low Profile" },
    { name: "Corsair Vengeance RGB 32GB", price: 14000, desc: "DDR5 Reliable" },
    { name: "ADATA XPG Lancer 32GB", price: 13000, desc: "DDR5 RGB" },
    { name: "Teamgroup Elite 8GB", price: 3000, desc: "DDR5 Basic" },
    { name: "G.Skill Trident Z Neo 32GB", price: 12000, desc: "DDR4 3600MHz CL16" }
  ],
  "PSU": [
    { name: "Corsair RM850x", price: 14000, desc: "850W 80+ Gold Modular" },
    { name: "Seasonic Vertex GX-1000", price: 22000, desc: "1000W ATX 3.0 Gold" },
    { name: "MSI MPG A850G", price: 13000, desc: "850W ATX 3.0 Gold" },
    { name: "Asus ROG Thor 1000W P2", price: 35000, desc: "Platinum with OLED" },
    { name: "Be Quiet! Dark Power 13", price: 25000, desc: "Titanium Efficiency" },
    { name: "Thermaltake GF3 850W", price: 12000, desc: "ATX 3.0 Gold" },
    { name: "Cooler Master MWE 750W", price: 8000, desc: "Bronze Budget" },
    { name: "Corsair SF750", price: 16000, desc: "Best SFX PSU" },
    { name: "Lian Li SP750", price: 12000, desc: "White SFX PSU" },
    { name: "Antec NeoECO 650W", price: 6000, desc: "Budget Gold" }
  ],
  "HDD": [
    { name: "Seagate Barracuda 2TB", price: 6000, desc: "7200RPM Standard" },
    { name: "WD Blue 4TB", price: 9000, desc: "5400RPM Storage" },
    { name: "Seagate IronWolf 8TB", price: 22000, desc: "NAS Drive" },
    { name: "WD Black 6TB", price: 18000, desc: "Performance HDD" },
    { name: "Toshiba X300 4TB", price: 11000, desc: "Performance HDD" },
    { name: "Seagate SkyHawk 4TB", price: 10000, desc: "Surveillance HDD" },
    { name: "WD Red Plus 8TB", price: 24000, desc: "NAS Drive" },
    { name: "Seagate Exos 16TB", price: 35000, desc: "Enterprise HDD" },
    { name: "WD Gold 18TB", price: 45000, desc: "Enterprise HDD" },
    { name: "Seagate Barracuda 1TB", price: 4500, desc: "Basic Storage" }
  ],
  "SSD": [
    { name: "Samsung 990 Pro 1TB", price: 12000, desc: "Fastest Gen4 NVMe" },
    { name: "WD Black SN850X 2TB", price: 18000, desc: "Top Tier Gaming NVMe" },
    { name: "Crucial T700 1TB", price: 22000, desc: "Gen5 NVMe Blazing Fast" },
    { name: "Samsung 980 Pro 1TB", price: 10000, desc: "Reliable Gen4" },
    { name: "Kingston KC3000 1TB", price: 9000, desc: "Great Value High End" },
    { name: "Teamgroup MP44L 1TB", price: 7000, desc: "Budget Gen4" },
    { name: "Crucial P3 Plus 1TB", price: 6500, desc: "Entry Gen4" },
    { name: "Samsung 870 Evo 1TB", price: 9000, desc: "Best SATA SSD" },
    { name: "Lexar NM790 2TB", price: 14000, desc: "DRAM-less High Performance" },
    { name: "Sabrent Rocket 4 Plus 4TB", price: 45000, desc: "Massive Gen4 Storage" }
  ],
  "Smartphone": [
    { name: "iPhone 15 Pro Max", price: 180000, desc: "Titanium, A17 Pro" },
    { name: "Samsung Galaxy S24 Ultra", price: 160000, desc: "AI Phone, S-Pen" },
    { name: "Google Pixel 8 Pro", price: 110000, desc: "Best Camera AI" },
    { name: "OnePlus 12", price: 90000, desc: "Flagship Killer" },
    { name: "Xiaomi 14 Ultra", price: 120000, desc: "Leica Optics" },
    { name: "Nothing Phone (2)", price: 60000, desc: "Unique Design" },
    { name: "Samsung Galaxy Z Fold 5", price: 190000, desc: "Foldable Productivity" },
    { name: "Asus ROG Phone 8 Pro", price: 130000, desc: "Ultimate Gaming Phone" },
    { name: "iPhone 13", price: 70000, desc: "Great Value iPhone" },
    { name: "Samsung Galaxy A55", price: 45000, desc: "Premium Mid-range" }
  ]
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log("Start seeding...")

  for (const catName of categories) {
    const slug = catName.toLowerCase().replace(/ /g, '-')
    
    console.log(`Creating category: ${catName}`)
    
    // Category Icon: Use a reliable placeholder
    const categoryImage = `https://placehold.co/100x100/png?text=${encodeURIComponent(catName)}`

    const category = await prisma.category.upsert({
      where: { slug },
      update: {
        image: categoryImage,
      },
      create: {
        name: catName,
        slug,
        image: categoryImage,
      },
    })

    const products = productTemplates[catName] || []
    
    for (const prod of products) {
      const prodSlug = prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      
      let imageUrl;
      if (prod.name.includes("Galaxy A55")) {
         // Keep Pollination AI for Galaxy A55 as requested
         imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prod.name + ' product photography white background')}`;
      } else {
         // Use reliable placeholder for others
         imageUrl = `https://placehold.co/600x600/png?text=${encodeURIComponent(prod.name)}`;
      }

      await prisma.product.upsert({
        where: { slug: prodSlug },
        update: {
          images: JSON.stringify([imageUrl]),
          stock: Math.floor(Math.random() * 50) + 10,
        },
        create: {
          name: prod.name,
          slug: prodSlug,
          description: prod.desc,
          price: prod.price,
          stock: Math.floor(Math.random() * 50) + 10,
          images: JSON.stringify([imageUrl]),
          categoryId: category.id,
          isTrending: Math.random() > 0.8, // 20% chance to be trending
        },
      })
      
      // Small delay to be safe
      await delay(50); 
    }
  }

  console.log("Seeding finished.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
