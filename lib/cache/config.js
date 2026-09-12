export const CACHE_TAGS = {
  products: "products",
  categories: "categories",
  nav: "nav",
  banners: "banners",
  blogs: "blogs",
  reviews: "reviews",
};

export const CACHE_TTL = {
  nav: 300,
  categories: 300,
  facets: 120,
  home: 60,
  product: 60,
  blog: 300,
};

export function staggeredTtl(base, spread = Math.round(base * 0.2)) {
  return base + Math.floor(Math.random() * spread);
}
