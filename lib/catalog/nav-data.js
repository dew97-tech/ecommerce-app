import { cache } from "react";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { CACHE_TAGS, CACHE_TTL, staggeredTtl } from "@/lib/cache/config";
import {
  collectSubtreeIds,
  getCategorySubtreeCounts,
  getCategoryTree,
} from "@/lib/catalog/categories";
import { getFirstImage } from "@/lib/images";

const MENU_PRODUCTS_PER_CATEGORY = 4;

const PRODUCT_SELECT = {
  id: true,
  name: true,
  slug: true,
  price: true,
  discountedPrice: true,
  images: true,
  brand: true,
};

const loadNavData = unstable_cache(
  async () => {
    const [roots, subtreeCounts, { childrenByParent }] = await Promise.all([
      db.category.findMany({
        where: { parentId: null },
        orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          isFeatured: true,
          children: {
            orderBy: { name: "asc" },
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      getCategorySubtreeCounts(),
      getCategoryTree(),
    ]);

    const popularByRoot = await Promise.all(
      roots.map((root) => {
        const subtreeIds = collectSubtreeIds(root.id, childrenByParent);
        return db.product.findMany({
          where: {
            isActive: true,
            availabilityStatus: "IN_STOCK",
            categoryId: { in: subtreeIds },
          },
          orderBy: [{ isTrending: "desc" }, { createdAt: "desc" }],
          take: MENU_PRODUCTS_PER_CATEGORY,
          select: PRODUCT_SELECT,
        });
      })
    );

    return roots.map((root, index) => ({
      id: root.id,
      name: root.name,
      slug: root.slug,
      icon: root.icon,
      isFeatured: root.isFeatured,
      productCount: subtreeCounts.get(root.id) ?? 0,
      children: root.children.map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        productCount: subtreeCounts.get(child.id) ?? 0,
      })),
      products: popularByRoot[index].map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        discountedPrice: product.discountedPrice,
        brand: product.brand,
        image: getFirstImage(product.images),
      })),
    }));
  },
  ["nav-data"],
  {
    tags: [CACHE_TAGS.nav, CACHE_TAGS.categories, CACHE_TAGS.products],
    revalidate: staggeredTtl(CACHE_TTL.nav),
  }
);

export const getNavData = cache(loadNavData);
