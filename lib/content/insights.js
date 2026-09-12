import { db } from "../db.js";

export const CORE_CATEGORIES = [
  { slug: "ram-desktop", name: "RAM (Desktop)", label: "Desktop RAM" },
  { slug: "ram-laptop", name: "RAM (Laptop)", label: "Laptop RAM" },
  { slug: "ssd", name: "SSD", label: "SSD" },
  { slug: "gpu", name: "Graphics Card", label: "Graphics Card" },
  { slug: "monitor", name: "Monitor", label: "Monitor" },
  { slug: "casing", name: "Casing", label: "Casing" },
  { slug: "psu", name: "Power Supply", label: "Power Supply" },
];

export const DEFAULT_WINDOW_DAYS = 30;
export const MIN_CATEGORY_SAMPLE = 3;

const MAX_REASONABLE_CHANGE = 3;
const MOVERS_LIMIT = 5;
const VALUE_PICKS_LIMIT = 5;
const BRAND_LIMIT = 5;

function median(values) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function round(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function toMover(row) {
  return {
    name: row.product.name,
    slug: row.product.slug,
    category: row.product.category.name,
    oldPrice: row.oldPrice,
    newPrice: row.newPrice,
    pct: round(row.change * 100),
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getPriceInsights({
  categories = CORE_CATEGORIES,
  windowDays = DEFAULT_WINDOW_DAYS,
} = {}) {
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  const history = await db.priceHistory.findMany({
    where: { createdAt: { gte: since } },
    select: {
      productId: true,
      oldPrice: true,
      newPrice: true,
      createdAt: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          brand: true,
          isActive: true,
          categoryId: true,
          category: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const latestByProduct = new Map();
  for (const row of history) {
    latestByProduct.set(row.productId, row);
  }

  const changes = [];
  for (const row of latestByProduct.values()) {
    const product = row.product;
    if (!product?.isActive || !product.category?.name) continue;
    if (!row.oldPrice || row.oldPrice <= 0) continue;
    if (!row.newPrice || row.newPrice <= 0) continue;

    const change = row.newPrice / row.oldPrice - 1;
    if (Math.abs(change) > MAX_REASONABLE_CHANGE) continue;

    changes.push({ ...row, product, change });
  }

  const categoryInsights = [];
  for (const definition of categories) {
    const rows = changes.filter(
      (row) => row.product.category.name === definition.name
    );
    if (rows.length < MIN_CATEGORY_SAMPLE) {
      categoryInsights.push({
        ...definition,
        sample: rows.length,
        insufficient: true,
      });
      continue;
    }

    const pctChanges = rows.map((row) => row.change * 100);
    const categoryIds = [
      ...new Set(rows.map((row) => row.product.categoryId).filter(Boolean)),
    ];

    const [liveProducts, inStockCount] = await Promise.all([
      db.product.findMany({
        where: { isActive: true, categoryId: { in: categoryIds } },
        orderBy: [{ discountedPrice: "asc" }, { price: "asc" }],
        take: VALUE_PICKS_LIMIT * 8,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          discountedPrice: true,
          availabilityStatus: true,
          stock: true,
        },
      }),
      db.product.count({
        where: {
          isActive: true,
          availabilityStatus: "IN_STOCK",
          categoryId: { in: categoryIds },
        },
      }),
    ]);

    const valuePicks = liveProducts
      .filter(
        (product) =>
          product.availabilityStatus === "IN_STOCK" && product.stock > 0
      )
      .sort(
        (a, b) => (a.discountedPrice ?? a.price) - (b.discountedPrice ?? b.price)
      )
      .slice(0, VALUE_PICKS_LIMIT)
      .map((product) => ({
        name: product.name,
        slug: product.slug,
        price: product.discountedPrice ?? product.price,
      }));

    const byBrand = new Map();
    for (const row of rows) {
      const brand = row.product.brand || "Other";
      const entry = byBrand.get(brand) ?? { brand, count: 0, total: 0 };
      entry.count += 1;
      entry.total += row.change * 100;
      byBrand.set(brand, entry);
    }

    const brands = [...byBrand.values()]
      .filter((entry) => entry.count >= 2)
      .map((entry) => ({
        brand: entry.brand,
        count: entry.count,
        avgPct: round(entry.total / entry.count),
      }))
      .sort((a, b) => b.avgPct - a.avgPct)
      .slice(0, BRAND_LIMIT);

    const sortedRows = [...rows].sort((a, b) => b.change - a.change);

    categoryInsights.push({
      ...definition,
      sample: rows.length,
      insufficient: false,
      medianPct: round(median(pctChanges)),
      avgPct: round(
        pctChanges.reduce((sum, value) => sum + value, 0) / pctChanges.length
      ),
      up: rows.filter((row) => row.change > 0).length,
      down: rows.filter((row) => row.change < 0).length,
      inStockCount,
      brands,
      valuePicks,
      topIncreases: sortedRows.slice(0, MOVERS_LIMIT).map(toMover),
      topDecreases: sortedRows
        .slice(-MOVERS_LIMIT)
        .reverse()
        .filter((row) => row.change < 0)
        .map(toMover),
    });
  }

  const sortedChanges = [...changes].sort((a, b) => b.change - a.change);

  return {
    generatedAt: new Date().toISOString(),
    windowDays,
    minSample: MIN_CATEGORY_SAMPLE,
    totalTrackedChanges: changes.length,
    excludedOutliers: latestByProduct.size - changes.length,
    categories: categoryInsights,
    movers: {
      increases: sortedChanges.slice(0, MOVERS_LIMIT).map(toMover),
      decreases: sortedChanges
        .slice(-MOVERS_LIMIT)
        .reverse()
        .filter((row) => row.change < 0)
        .map(toMover),
    },
  };
}
