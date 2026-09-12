const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const POSTS = [
  {
    slug: "how-to-choose-pc-components",
    title: "How to Choose the Right PC Components",
    imageUrl: "/banners/components-desktop.webp",
    content: `Building a PC is easier when you start with compatibility.

## Start with the CPU and motherboard
Pick a processor first, then a motherboard with the **same socket** and the memory generation you want (DDR4 or DDR5).

## Match your memory
Desktop RAM comes as DDR4 or DDR5. The motherboard decides which one you need — they are not interchangeable.

## Size the power supply
Add up the processor and graphics card power draw, then add headroom. A unit that runs at 50–70% of its rated wattage is quiet and efficient.

## Plan storage and cooling
An NVMe SSD for the system drive and a hard drive for bulk storage is a great balance. Make sure your case fits your graphics card and CPU cooler.

Use our PC Builder to check socket, memory and power compatibility while you shop.`,
  },
  {
    slug: "laptop-buying-guide-bangladesh",
    title: "Laptop Buying Guide for Bangladesh",
    imageUrl: "/banners/laptop-desktop.webp",
    content: `Choosing a laptop comes down to what you do every day.

## Students and office work
Prioritise battery life, a comfortable keyboard and at least 8–16GB of RAM with an SSD.

## Creators
Look for a colour-accurate display, 16GB+ of RAM and a dedicated GPU if you edit video or 3D.

## Gaming
Check the GPU first, then the cooling design and display refresh rate. A 144Hz panel makes a big difference.

## Warranty matters
Always buy with official warranty and keep the invoice. Our team can help you compare models for your budget.`,
  },
  {
    slug: "build-a-gaming-setup",
    title: "Build a Gaming Setup Step by Step",
    imageUrl: "/banners/peripherals-desktop.webp",
    content: `A great setup is more than a PC.

## Step 1: The core
Choose a processor and graphics card for your target resolution, then match the motherboard, memory and power supply.

## Step 2: Comfort
A mechanical keyboard, a lightweight mouse and a headset you can wear for hours matter more than RGB.

## Step 3: Power protection
An IPS or online UPS protects your build from load-shedding and voltage spikes.

## Step 4: Upgrade path
Leave room for more RAM, an extra SSD and a larger graphics card later.

Start with our PC Builder and add peripherals when you are ready.`,
  },
];

async function main() {
  const author = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  if (!author) {
    throw new Error("No admin user found. Run promote-admin first.");
  }

  for (const post of POSTS) {
    const existing = await prisma.blog.findUnique({
      where: { slug: post.slug },
      select: { id: true },
    });

    if (existing) {
      await prisma.blog.update({
        where: { id: existing.id },
        data: { title: post.title, content: post.content, imageUrl: post.imageUrl },
      });
      console.log(`Updated blog: ${post.title}`);
    } else {
      await prisma.blog.create({
        data: {
          title: post.title,
          slug: post.slug,
          content: post.content,
          imageUrl: post.imageUrl,
          authorId: author.id,
        },
      });
      console.log(`Created blog: ${post.title}`);
    }
  }

  const total = await prisma.blog.count();
  console.log(`Content seed complete. Total blogs: ${total}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
