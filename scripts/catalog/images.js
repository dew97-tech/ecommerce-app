const CATALOG_IMAGE_PATTERN = /image\/cache\/catalog\//i;
const THUMBNAIL_PATTERN = /-74x74\./i;
const SIZE_SUFFIX_PATTERN = /-\d+x\d+(\.(?:webp|jpg|jpeg|png))/i;

const IMAGE_ATTRIBUTES = [
  "data-src",
  "data-original",
  "data-lazy",
  "data-lazy-src",
  "data-echo",
  "src",
  "data-srcset",
  "srcset",
];

function absoluteUrl(value) {
  if (!value) return null;
  if (value.startsWith("http")) return value;
  return `https://www.startech.com.bd${value.startsWith("/") ? "" : "/"}${value}`;
}

function upgradeImageSize(url) {
  return String(url).replace(SIZE_SUFFIX_PATTERN, "-800x800$1");
}

function isCatalogImage(url) {
  return CATALOG_IMAGE_PATTERN.test(String(url));
}

function isThumbnail(url) {
  return THUMBNAIL_PATTERN.test(String(url));
}

function parseSrcset(value) {
  if (!value) return [];

  return String(value)
    .split(",")
    .map((part) => part.trim().split(/\s+/)[0])
    .filter(Boolean);
}

function extractElementImage($, element, options = {}) {
  const { allowThumbnails = false } = options;
  const candidates = [];

  for (const attribute of IMAGE_ATTRIBUTES) {
    const value = $(element).attr(attribute);
    if (!value) continue;

    if (attribute.endsWith("srcset")) {
      candidates.push(...parseSrcset(value));
    } else {
      candidates.push(value);
    }
  }

  for (const candidate of candidates) {
    const url = absoluteUrl(candidate);
    if (!url || !isCatalogImage(url)) continue;
    if (!allowThumbnails && isThumbnail(url)) continue;
    return upgradeImageSize(url);
  }

  return null;
}

function createImageCollector() {
  const images = [];
  const seen = new Set();

  return {
    images,
    push(value) {
      if (!value) return;
      const url = upgradeImageSize(absoluteUrl(value));
      if (!url || seen.has(url)) return;
      seen.add(url);
      images.push(url);
    },
  };
}

function collectGalleryImages($, ogImage, productName = "") {
  const collector = createImageCollector();
  collector.push(ogImage);

  const selectors = [
    ".product-images img",
    "#product-images img",
    ".product-image-container img",
  ];

  for (const selector of selectors) {
    const nodes = $(selector);
    if (!nodes.length) continue;

    nodes.each((_, element) => {
      collector.push(extractElementImage($, element, { allowThumbnails: true }));
    });

    if (collector.images.length > 1) {
      return collector.images;
    }
  }

  const primary = collector.images[0];
  if (primary) {
    const directory = primary.slice(0, primary.lastIndexOf("/"));

    $("img").each((_, element) => {
      const url = extractElementImage($, element, { allowThumbnails: true });
      if (!url) return;
      if (url.slice(0, url.lastIndexOf("/")) !== directory) return;
      if (productName && !sharesProductToken(productName, url)) return;
      collector.push(url);
    });
  }

  return collector.images;
}

function slugTokens(value) {
  return String(value || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 4);
}

function sharesProductToken(productName, url) {
  const tokens = slugTokens(productName);
  if (tokens.length === 0) return true;

  const parts = new Set(
    String(url)
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length >= 3)
  );

  return tokens.some((token) => parts.has(token));
}

function filterImagesForProduct(productName, images, { keepFirst = true } = {}) {
  if (!Array.isArray(images) || images.length <= 1) return images;

  const kept = images.filter((url, index) => {
    if (index === 0 && keepFirst) return true;
    return sharesProductToken(productName, url);
  });

  return kept.length > 0 ? kept : images.slice(0, 1);
}

function normalizeImageList(images) {
  if (!Array.isArray(images)) return [];

  const collector = createImageCollector();
  for (const image of images) {
    collector.push(image);
  }

  return collector.images;
}

function normalizeImageUrl(url) {
  return String(url)
    .split("?")[0]
    .replace(/-\d+x\d+(\.(?:webp|jpe?g|png))$/i, "$1");
}

function folderOfImage(url) {
  const clean = String(url).split("?")[0];
  return clean.slice(0, clean.lastIndexOf("/"));
}

function analyzeImagePollution(products) {
  const parsed = products.map((product) => {
    let images = [];
    try {
      const value = JSON.parse(product.images);
      if (Array.isArray(value)) images = value;
    } catch {

    }

    return {
      id: product.id,
      name: product.name,
      productCode: product.productCode,
      sourceUrl: product.sourceUrl,
      isActive: product.isActive !== false,
      images,
    };
  });

  const primaryOwners = new Map();
  for (const product of parsed) {
    if (!product.images[0]) continue;
    const key = normalizeImageUrl(product.images[0]);
    if (!primaryOwners.has(key)) primaryOwners.set(key, new Set());
    primaryOwners.get(key).add(product.id);
  }

  let multi = 0;
  let folderSuspect = 0;
  let primarySuspect = 0;
  let foreignImages = 0;
  const suspects = [];

  for (const product of parsed) {
    if (product.images.length < 2) continue;
    multi += 1;

    const primaryFolder = folderOfImage(product.images[0]);
    let isFolderSuspect = false;
    let isPrimarySuspect = false;

    for (const url of product.images.slice(1)) {
      if (folderOfImage(url) !== primaryFolder) isFolderSuspect = true;

      const owners = primaryOwners.get(normalizeImageUrl(url));
      if (owners && !owners.has(product.id)) {
        isPrimarySuspect = true;
        foreignImages += 1;
      }
    }

    if (isFolderSuspect) folderSuspect += 1;
    if (isPrimarySuspect) primarySuspect += 1;
    if (isFolderSuspect || isPrimarySuspect) suspects.push(product);
  }

  return {
    total: parsed.length,
    multi,
    folderSuspect,
    primarySuspect,
    foreignImages,
    suspects,
    parsed,
  };
}

module.exports = {
  absoluteUrl,
  analyzeImagePollution,
  collectGalleryImages,
  extractElementImage,
  filterImagesForProduct,
  folderOfImage,
  isCatalogImage,
  normalizeImageList,
  normalizeImageUrl,
  sharesProductToken,
  slugTokens,
  upgradeImageSize,
};
