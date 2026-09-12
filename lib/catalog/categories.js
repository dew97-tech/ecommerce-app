import { cache } from "react";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { CACHE_TAGS, CACHE_TTL, staggeredTtl } from "@/lib/cache/config";

const loadCategoryRows = unstable_cache(
  async () => db.category.findMany({ select: { id: true, parentId: true } }),
  ["category-rows"],
  {
    tags: [CACHE_TAGS.categories],
    revalidate: staggeredTtl(CACHE_TTL.categories),
  }
);

const loadSubtreeCountRows = unstable_cache(
  async () =>
    db.product.groupBy({
      by: ["categoryId"],
      where: { isActive: true, availabilityStatus: "IN_STOCK" },
      _count: { _all: true },
    }),
  ["category-subtree-count-rows"],
  {
    tags: [CACHE_TAGS.categories, CACHE_TAGS.products],
    revalidate: staggeredTtl(CACHE_TTL.categories),
  }
);

export const getCategoryTreeData = async () => {
  const categories = await loadCategoryRows();

  const childrenByParent = new Map();
  for (const category of categories) {
    const siblings = childrenByParent.get(category.parentId) ?? [];
    siblings.push(category.id);
    childrenByParent.set(category.parentId, siblings);
  }

  return { categories, childrenByParent };
};

export const getCategoryTree = cache(getCategoryTreeData);

export function collectSubtreeIds(rootId, childrenByParent) {
  const ids = [];
  const seen = new Set();
  const stack = [rootId];

  while (stack.length > 0) {
    const id = stack.pop();
    if (seen.has(id)) continue;
    seen.add(id);
    ids.push(id);

    const children = childrenByParent.get(id);
    if (children?.length) stack.push(...children);
  }

  return ids;
}

export const getCategorySubtreeIds = cache(async (id) => {
  const { childrenByParent } = await getCategoryTree();
  return collectSubtreeIds(id, childrenByParent);
});

export const getCategorySubtreeCounts = cache(async () => {
  const { categories, childrenByParent } = await getCategoryTree();

  const rows = await loadSubtreeCountRows();

  const directCounts = new Map();
  for (const row of rows) {
    if (row.categoryId) directCounts.set(row.categoryId, row._count._all);
  }

  const subtreeCounts = new Map();
  const sumSubtree = (id) => {
    if (subtreeCounts.has(id)) return subtreeCounts.get(id);

    let total = directCounts.get(id) ?? 0;
    for (const childId of childrenByParent.get(id) ?? []) {
      total += sumSubtree(childId);
    }

    subtreeCounts.set(id, total);
    return total;
  };

  for (const category of categories) {
    sumSubtree(category.id);
  }

  return subtreeCounts;
});
