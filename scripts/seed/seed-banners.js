const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const CAMPAIGNS = [
  {
    key: "components",
    title: "Build Your Dream PC",
    buttonText: "Shop Components",
    categoryName: "Component",
  },
  {
    key: "laptop",
    title: "Laptops for Work, Study & Play",
    buttonText: "Shop Laptops",
    categoryName: "Laptop",
  },
  {
    key: "casing",
    title: "Premium Cases & Cooling",
    buttonText: "Shop Casing",
    categoryName: "Casing",
  },
  {
    key: "peripherals",
    title: "Gear Up Your Setup",
    buttonText: "Shop Accessories",
    categoryName: "Accessories",
  },
];

async function main() {
  for (const campaign of CAMPAIGNS) {
    const category = await prisma.category.findFirst({
      where: { name: campaign.categoryName },
      select: { id: true, name: true },
    });

    if (!category) {
      console.warn(`Skipping ${campaign.key}: category "${campaign.categoryName}" not found.`);
      continue;
    }

    const data = {
      title: campaign.title,
      buttonText: campaign.buttonText,
      link: `/categories/${category.id}`,
      image: `/banners/${campaign.key}-desktop.webp`,
      imageMobile: `/banners/${campaign.key}-mobile.webp`,
      isActive: true,
    };

    const existing = await prisma.banner.findFirst({
      where: { title: campaign.title },
      select: { id: true },
    });

    if (existing) {
      await prisma.banner.update({ where: { id: existing.id }, data });
      console.log(`Updated banner: ${campaign.title}`);
    } else {
      await prisma.banner.create({ data });
      console.log(`Created banner: ${campaign.title}`);
    }
  }

  const total = await prisma.banner.count();
  console.log(`Banner seed complete. Total banners: ${total}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
