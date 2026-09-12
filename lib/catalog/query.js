import { buildSearchWhere } from "@/lib/search-query";

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 48;
export const PAGE_SIZE_OPTIONS = [12, 24, 48];
export const MAX_PAGE = 100;

const MAX_SEARCH_LENGTH = 100;
const MAX_FILTER_VALUES = 50;
const MAX_FILTER_VALUE_LENGTH = 100;
const ATTRIBUTE_KEY_PATTERN = /^[A-Za-z0-9 _-]{1,64}$/;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
];

export const AVAILABILITY_OPTIONS = [
  { value: "IN_STOCK", label: "In Stock" },
  { value: "OUT_OF_STOCK", label: "Out of Stock" },
  { value: "PRE_ORDER", label: "Pre Order" },
  { value: "UP_COMING", label: "Up Coming" },
];

export const DEFAULT_AVAILABILITY = ["IN_STOCK"];

export function firstParam(value) {
  return Array.isArray(value) ? value[0] : value;
}

function splitList(value) {
  const raw = firstParam(value);
  if (!raw) return [];
  return String(raw)
    .split(",")
    .map((entry) => entry.trim().slice(0, MAX_FILTER_VALUE_LENGTH))
    .filter(Boolean)
    .slice(0, MAX_FILTER_VALUES);
}

export function parseListingParams(searchParams = {}) {
  const page = Math.min(
    MAX_PAGE,
    Math.max(1, Number(firstParam(searchParams.page)) || 1)
  );
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number(firstParam(searchParams.limit)) || DEFAULT_PAGE_SIZE)
  );

  const requestedSort = firstParam(searchParams.sort);
  const sort = SORT_OPTIONS.some((option) => option.value === requestedSort)
    ? requestedSort
    : "newest";

  const minPriceRaw = Number(firstParam(searchParams.min_price));
  const maxPriceRaw = Number(firstParam(searchParams.max_price));
  let minPrice = Number.isFinite(minPriceRaw) ? minPriceRaw : undefined;
  let maxPrice = Number.isFinite(maxPriceRaw) ? maxPriceRaw : undefined;

  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }
  const selectedAvailability = splitList(searchParams.availability);

  const attributes = {};
  for (const key of Object.keys(searchParams)) {
    if (!key.startsWith("attr_")) continue;
    const attributeKey = key.slice(5);
    if (!ATTRIBUTE_KEY_PATTERN.test(attributeKey)) continue;
    const values = splitList(searchParams[key]);
    if (values.length > 0) {
      attributes[attributeKey] = values;
    }
  }

  const search = (firstParam(searchParams.search) || "")
    .trim()
    .slice(0, MAX_SEARCH_LENGTH);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    sort,
    search,
    categoryId: firstParam(searchParams.category) || null,
    brands: splitList(searchParams.brands),
    availability:
      selectedAvailability.length > 0 ? selectedAvailability : DEFAULT_AVAILABILITY,
    minPrice,
    maxPrice,
    attributes,
  };
}

export function buildProductWhere({
  categoryId,
  categoryIds,
  search,
  brands,
  availability,
  minPrice,
  maxPrice,
  attributes,
  includeInactive = false,
}) {
  const and = [];

  if (!includeInactive) {
    and.push({ isActive: true });
  }

  if (categoryIds?.length) {
    and.push({ categoryId: { in: categoryIds } });
  } else if (categoryId && categoryId !== "all") {
    and.push({ categoryId });
  }

  if (search) {
    const searchWhere = buildSearchWhere(search);
    if (searchWhere) and.push(searchWhere);
  }

  if (brands?.length) {
    and.push({ brand: { in: brands } });
  }

  if (availability?.length) {
    and.push({ availabilityStatus: { in: availability } });
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const range = {};
    if (minPrice !== undefined) range.gte = minPrice;
    if (maxPrice !== undefined) range.lte = maxPrice;

    and.push({
      OR: [
        { discountedPrice: null, price: range },
        { discountedPrice: range },
      ],
    });
  }

  for (const [key, values] of Object.entries(attributes ?? {})) {
    if (!values?.length) continue;

    and.push({
      OR: values.map((value) => ({
        attributes: {
          path: `$."${key}"`,
          string_contains: value,
        },
      })),
    });
  }

  return and.length > 0 ? { AND: and } : {};
}

export function buildOrderBy(sort) {
  switch (sort) {
    case "price_asc":
      return [{ price: "asc" }, { id: "asc" }];
    case "price_desc":
      return [{ price: "desc" }, { id: "asc" }];
    case "name_asc":
      return [{ name: "asc" }];
    default:
      return [{ createdAt: "desc" }];
  }
}
