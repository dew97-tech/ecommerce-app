"use server";

import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/config";
import { collectSubtreeIds, getCategoryTreeData } from "@/lib/catalog/categories";
import { db } from "@/lib/db";
import { getListingFacets } from "@/lib/catalog/facets";
import { getListingResults } from "@/lib/catalog/listing";
import {
  buildOrderBy,
  buildProductWhere,
  parseListingParams,
} from "@/lib/catalog/query";
import { getFirstImage, parseImages } from "@/lib/images";
import { getSellingPrice } from "@/lib/price";
import {
  checkCompatibility,
  estimateWattage,
  getProductSpecs,
  getSpecChips,
} from "@/lib/pc-builder/compatibility";
import { getSlotDefinition } from "@/lib/pc-builder/slots";

const EMPTY_FACETS = {
  brands: [],
  availability: [],
  price: { min: 0, max: 0 },
  attributes: [],
};

const PRODUCT_SELECT = {
  id: true,
  name: true,
  slug: true,
  brand: true,
  price: true,
  discountedPrice: true,
  stock: true,
  availabilityStatus: true,
  images: true,
};

const loadBuilderCategoryRows = unstable_cache(
  async (names) =>
    db.category.findMany({
      where: { name: { in: names } },
      select: { id: true, name: true },
    }),
  ["builder-category-rows"],
  {
    tags: [CACHE_TAGS.categories],
    revalidate: 3600,
  }
);

async function resolveCategoryIds(slot) {
  const [rows, { childrenByParent }] = await Promise.all([
    loadBuilderCategoryRows(slot.categories),
    getCategoryTreeData(),
  ]);

  const ids = new Set();
  for (const row of rows) {
    if (slot.subtree === false) {
      ids.add(row.id);
      continue;
    }

    for (const id of collectSubtreeIds(row.id, childrenByParent)) {
      ids.add(id);
    }
  }

  return [...ids];
}

function toCard(slotKey, product) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    price: product.price,
    discountedPrice: product.discountedPrice,
    stock: product.stock,
    availabilityStatus: product.availabilityStatus,
    image: getFirstImage(product.images),
    imageList: parseImages(product.images),
    chips: getSpecChips(slotKey, product),
  };
}

export async function getSlotOptions(slotKey, searchParams = {}) {
  const slot = getSlotDefinition(slotKey);
  if (!slot) {
    return { error: "Unknown component slot." };
  }

  try {
    const categoryIds = await resolveCategoryIds(slot);
    if (categoryIds.length === 0) {
      return {
        products: [],
        totalCount: 0,
        totalPages: 0,
        facets: EMPTY_FACETS,
      };
    }

    const listing = parseListingParams(searchParams);
    const where = buildProductWhere({ ...listing, categoryIds });
    const contextWhere = buildProductWhere({
      categoryIds,
      search: listing.search,
    });

    const [{ products, totalCount }, facets] = await Promise.all([
      getListingResults({
        where,
        orderBy: buildOrderBy(listing.sort),
        skip: listing.skip,
        take: listing.limit,
        select: PRODUCT_SELECT,
      }),
      getListingFacets({
        contextWhere,
        availability: listing.availability,
        categoryName: slot.categories[0],
        rootName: slot.categories[0],
      }),
    ]);

    return {
      products: products.map((product) => toCard(slot.key, product)),
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / listing.limit)),
      facets,
    };
  } catch (error) {
    console.error("Failed to load slot options:", error);
    return { error: "Failed to load products. Please try again." };
  }
}

export async function getBuildState(selections = {}) {
  const entries = Object.entries(selections).filter(
    ([, productId]) => typeof productId === "string" && productId
  );

  if (entries.length === 0) {
    return {
      items: [],
      subtotal: 0,
      wattage: estimateWattage({}),
      psuWattage: null,
      issues: [],
      hasBlockers: false,
    };
  }

  try {
    const products = await db.product.findMany({
      where: {
        id: { in: entries.map(([, productId]) => productId) },
        isActive: true,
      },
      select: { ...PRODUCT_SELECT, attributes: true },
    });

    const productsById = new Map(products.map((product) => [product.id, product]));
    const selectedProducts = {};

    const items = entries.map(([slotKey, productId]) => {
      const product = productsById.get(productId);

      if (!product) {
        return { slotKey, product: null, missing: true };
      }

      selectedProducts[slotKey] = product;

      return {
        slotKey,
        product: {
          ...toCard(slotKey, product),
        },
      };
    });

    const issues = checkCompatibility(selectedProducts);
    const subtotal = Object.values(selectedProducts).reduce(
      (sum, product) => sum + getSellingPrice(product),
      0
    );
    const wattage = estimateWattage(selectedProducts);
    const psuSpecs = selectedProducts.psu
      ? getProductSpecs(selectedProducts.psu)
      : null;

    return {
      items,
      subtotal,
      wattage,
      psuWattage: psuSpecs?.wattage ?? null,
      issues,
      hasBlockers: issues.some((issue) => issue.level === "blocker"),
    };
  } catch (error) {
    console.error("Failed to load build state:", error);
    return { error: "Failed to load your build. Please try again." };
  }
}
