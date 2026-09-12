const cheerio = require("cheerio");
const { absoluteUrl, collectGalleryImages } = require("./images");

function cleanText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePrice(value) {
  const match = cleanText(value).replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

const NOISE_FEATURES = new Set([
  "view more info",
  "view more",
  "view details",
  "read more",
  "learn more",
  "view full specification",
  "view full specifications",
]);

function isNoiseFeature(feature) {
  const normalized = String(feature).toLowerCase().replace(/[.:\s]+$/, "").trim();
  return NOISE_FEATURES.has(normalized);
}

function parseProductPage(html, url) {
  const $ = cheerio.load(html);
  const meta = (property) =>
    cleanText($(`meta[property="${property}"]`).attr("content")) || null;

  const sku = meta("product:retailer_item_id");
  if (!sku) return null;

  const name =
    cleanText($("h1").first().text()) || meta("og:title") || null;

  const availability = meta("product:availability");
  const priceAmount = meta("product:price:amount");
  const currency = meta("product:price:currency");

  const priceText = cleanText(
    $(".product-info-data.product-price, .product-price").first().text()
  );
  const oldPriceText = cleanText(
    $(".product-old-price, .product-info-data.product-old-price").first().text()
  );

  const price =
    priceAmount !== null && priceAmount !== undefined && priceAmount !== ""
      ? Number(priceAmount)
      : /to be announced/i.test(priceText)
        ? null
        : parsePrice(priceText);
  const oldPrice = parsePrice(oldPriceText);

  let brand = null;
  $("tr").each((_, row) => {
    if (brand) return;
    const cells = $(row).find("td");
    if (cells.length < 2) return;
    const label = cleanText($(cells[0]).text()).toLowerCase();
    if (label === "brand") {
      brand = cleanText($(cells[1]).text()) || null;
    }
  });

  const rawCrumbs = [];
  $(".breadcrumb li, [itemprop='itemListElement']").each((_, element) => {
    const link = $(element).find("a").first();
    const href = link.attr("href") || "";
    const crumbName =
      cleanText($(element).find("[itemprop='name']").first().text()) ||
      cleanText(link.text());
    if (!crumbName || crumbName.toLowerCase() === "home") return;
    rawCrumbs.push({ name: crumbName, href });
  });

  const normalizeName = (value) =>
    cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
  const normalizedProduct = normalizeName(name);
  const normalizedBrand = normalizeName(brand);

  const breadcrumb = [];
  for (const crumb of rawCrumbs) {
    const crumbKey = normalizeName(crumb.name);
    if (crumb.href === url || crumbKey === normalizedProduct) break;
    if (normalizedBrand && crumbKey === normalizedBrand) break;
    if (breadcrumb[breadcrumb.length - 1] !== crumb.name) {
      breadcrumb.push(crumb.name);
    }
  }

  const ogImage = meta("og:image");
  const images = collectGalleryImages($, ogImage, name).slice(0, 10);

  const specifications = {};
  let group = null;
  const specTable = $("table.data-table, .specification-tab table").first();

  if (specTable.length) {
    specTable.find("tr").each((_, row) => {
      const cells = $(row).find("td");
      if (cells.length === 1) {
        const heading = cleanText($(cells[0]).text());
        if (heading) group = heading.replace(/specifications?$/i, "").trim() || heading;
        return;
      }

      if (cells.length < 2) return;
      const key = cleanText($(cells[0]).text());
      const value = cleanText(
        cells
          .slice(1)
          .map((__, cell) => $(cell).text())
          .get()
          .join(" ")
      );
      if (!key || !value) return;

      if (group) {
        specifications[group] = specifications[group] || {};
        if (!specifications[group][key]) specifications[group][key] = value;
      } else if (!specifications[key]) {
        specifications[key] = value;
      }
    });
  }

  const keyFeatures = [];
  $(".short-description li").each((_, element) => {
    const feature = cleanText($(element).text());
    if (feature && !isNoiseFeature(feature)) keyFeatures.push(feature);
  });

  const shortDescription = keyFeatures.length > 0
    ? keyFeatures.slice(0, 10).join(", ").slice(0, 500)
    : cleanText($(".short-description, .product-short-description").first().text()).slice(0, 500) || null;

  const descriptionRoot = $(
    "#tab-description, .product-description, #description"
  ).first();
  descriptionRoot.find("a").each((_, anchor) => {
    $(anchor).replaceWith($(anchor).contents());
  });
  const descriptionHtml = descriptionRoot.html() || null;

  return {
    sku: String(sku),
    url,
    name,
    brand,
    availability: availability || null,
    price: Number.isFinite(price) ? price : null,
    oldPrice: Number.isFinite(oldPrice) ? oldPrice : null,
    currency: currency || "BDT",
    images: images.slice(0, 10),
    breadcrumb,
    specifications,
    shortDescription,
    description: descriptionHtml,
    scrapedAt: new Date().toISOString(),
  };
}

function parseListingPage(html, url) {
  const $ = cheerio.load(html);
  const tiles = [];

  $(".p-item").each((_, element) => {
    const link = $(element).find(".p-item-name a").first();
    const href = link.attr("href");
    if (!href) return;

    const tileText = cleanText($(element).text());
    const priceText = cleanText(
      $(element).find(".p-item-price, .product-price").first().text()
    );
    const oldPriceText = cleanText(
      $(element).find(".p-item-old-price, .price-old").first().text()
    );

    tiles.push({
      url: absoluteUrl(href),
      name: cleanText(link.text()),
      price: parsePrice(priceText),
      oldPrice: parsePrice(oldPriceText),
      status: /out of stock/i.test(tileText) ? "Out Of Stock" : "In Stock",
    });
  });

  const totalMatch = cleanText($("body").text()).match(
    /Showing \d+ to \d+ of ([\d,]+)/i
  );

  return {
    url,
    categoryName: cleanText($("h1").first().text()) || null,
    tiles,
    total: totalMatch ? Number(totalMatch[1].replace(/,/g, "")) : null,
    hasNext: /rel="next"|page=\d+/i.test(html),
  };
}

module.exports = {
  cleanText,
  isNoiseFeature,
  parseListingPage,
  parsePrice,
  parseProductPage,
};
