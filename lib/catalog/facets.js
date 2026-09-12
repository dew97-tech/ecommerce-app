import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { CACHE_TAGS, CACHE_TTL, staggeredTtl } from "@/lib/cache/config";
import {
  GLOBAL_FILTER_GROUPS,
  GROUPS,
  compareFacetValues,
  getCategoryFilterGroupDefs,
  normalizeFacetValue,
} from "./filter-config";
import { AVAILABILITY_OPTIONS } from "./query";

const ATTRIBUTE_SAMPLE_SIZE = 500;
const MIN_COVERAGE_RATIO = 0.05;
const FALLBACK_COVERAGE_RATIO = 0.2;
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 40;
const MAX_AUTO_GROUPS = 4;
const MAX_BRAND_OPTIONS = 80;

function buildAttributeCounts(sample) {
  const countsByKey = new Map();
  const coverageByKey = new Map();

  for (const product of sample) {
    const attributes = product.attributes;
    if (!attributes || typeof attributes !== "object") continue;

    for (const [key, rawValue] of Object.entries(attributes)) {
      const value = normalizeFacetValue(rawValue);
      if (!value) continue;

      if (!countsByKey.has(key)) countsByKey.set(key, new Map());
      coverageByKey.set(key, (coverageByKey.get(key) ?? 0) + 1);

      const values = countsByKey.get(key);
      const normalized = value.toLowerCase();
      const existing = values.get(normalized);

      if (existing) {
        existing.count += 1;
      } else {
        values.set(normalized, { value, count: 1 });
      }
    }
  }

  return { countsByKey, coverageByKey };
}

function toAttributeOptions(values) {
  return [...values.values()]
    .sort((a, b) => compareFacetValues(a.value, b.value))
    .slice(0, MAX_OPTIONS);
}

function buildAttributeGroups(sample, configuredGroups) {
  const { countsByKey, coverageByKey } = buildAttributeCounts(sample);
  const sampleSize = sample.length;
  const minCoverage = Math.max(2, Math.ceil(sampleSize * MIN_COVERAGE_RATIO));
  const fallbackCoverage = Math.max(
    2,
    Math.ceil(sampleSize * FALLBACK_COVERAGE_RATIO)
  );

  const isUsable = (key, requiredCoverage) => {
    const values = countsByKey.get(key);
    const coverage = coverageByKey.get(key) ?? 0;
    return (
      values &&
      coverage >= requiredCoverage &&
      values.size >= MIN_OPTIONS &&
      values.size <= MAX_OPTIONS
    );
  };

  const groups = [];
  const usedKeys = new Set();
  const usedIds = new Set();

  const addGroup = (definition, requiredCoverage) => {
    if (!definition || usedIds.has(definition.id)) return;

    const matchedKey = definition.keys.find(
      (key) => !usedKeys.has(key) && isUsable(key, requiredCoverage)
    );
    if (!matchedKey) return;

    groups.push({
      id: definition.id,
      label: definition.label,
      attributeKey: matchedKey,
      options: toAttributeOptions(countsByKey.get(matchedKey)),
    });
    usedKeys.add(matchedKey);
    usedIds.add(definition.id);
  };

  for (const definition of configuredGroups) {
    addGroup(definition, minCoverage);
  }

  for (const id of GLOBAL_FILTER_GROUPS) {
    const definition = GROUPS[id];
    if (!definition) continue;
    addGroup({ id, ...definition }, fallbackCoverage);
  }

  if (groups.length < MAX_AUTO_GROUPS) {
    for (const [id, definition] of Object.entries(GROUPS)) {
      if (groups.length >= MAX_AUTO_GROUPS) break;
      addGroup({ id, ...definition }, fallbackCoverage);
    }
  }

  return groups;
}

const loadListingFacets = unstable_cache(
  async ({ contextWhere, availability: availabilityFilter, categoryName, rootName }) => {
  const configuredGroups = getCategoryFilterGroupDefs({
    name: categoryName,
    rootName,
  });

  const effectiveWhere = availabilityFilter?.length
    ? { AND: [contextWhere, { availabilityStatus: { in: availabilityFilter } }] }
    : contextWhere;

  const [brandRows, availabilityRows, priceAggregate, attributeSample] =
    await Promise.all([
      db.product.groupBy({
        by: ["brand"],
        where: effectiveWhere,
        _count: { _all: true },
      }),
      db.product.groupBy({
        by: ["availabilityStatus"],
        where: contextWhere,
        _count: { _all: true },
      }),
      db.product.aggregate({
        where: effectiveWhere,
        _min: { price: true },
        _max: { price: true },
      }),
      db.product.findMany({
        where: effectiveWhere,
        select: { attributes: true },
        take: ATTRIBUTE_SAMPLE_SIZE,
      }),
    ]);

  const brands = brandRows
    .filter((row) => row.brand)
    .map((row) => ({ value: row.brand, count: row._count._all }))
    .sort((a, b) => b.count - a.count || compareFacetValues(a.value, b.value))
    .slice(0, MAX_BRAND_OPTIONS);

  const availability = AVAILABILITY_OPTIONS.map((option) => {
    const row = availabilityRows.find(
      (entry) => entry.availabilityStatus === option.value
    );
    return { ...option, count: row?._count._all ?? 0 };
  }).filter((option) => option.count > 0);

  return {
    brands,
    availability,
    price: {
      min: priceAggregate._min.price ?? 0,
      max: priceAggregate._max.price ?? 0,
    },
    attributes: buildAttributeGroups(attributeSample, configuredGroups),
  };
  },
  ["listing-facets"],
  {
    tags: [CACHE_TAGS.products],
    revalidate: staggeredTtl(CACHE_TTL.facets),
  }
);

export async function getListingFacets(params) {
  return loadListingFacets(params);
}
