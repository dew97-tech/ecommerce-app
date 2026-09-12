import { parseImages } from "@/lib/images";
import { siteConfig } from "@/lib/site-config";

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

const AVAILABILITY_MAP = {
  IN_STOCK: "https://schema.org/InStock",
  OUT_OF_STOCK: "https://schema.org/OutOfStock",
  PRE_ORDER: "https://schema.org/PreOrder",
  UP_COMING: "https://schema.org/PreOrder",
  DISCONTINUED: "https://schema.org/Discontinued",
};

function stripHtml(value) {
  return String(value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function toIsoDate(value) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function organizationSchema() {
  const baseUrl = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: baseUrl,
    logo: `${baseUrl}/icon-512.png`,
    email: siteConfig.supportEmail,
    telephone: siteConfig.supportPhone,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dhaka",
      addressCountry: "BD",
    },
  };
}

export function websiteSchema() {
  const baseUrl = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function productSchema(product) {
  const baseUrl = getBaseUrl();
  const images = parseImages(product.images).map((image) =>
    image.startsWith("http") ? image : `${baseUrl}${image}`
  );
  const price = product.discountedPrice ?? product.price;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: images.slice(0, 5),
    description: stripHtml(
      product.shortDescription || product.description || ""
    ).slice(0, 300),
    sku: product.productCode || product.id,
    brand: product.brand
      ? { "@type": "Brand", name: product.brand }
      : undefined,
    category: product.category?.name,
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/products/${product.slug}`,
      priceCurrency: "BDT",
      price: Number(price).toFixed(2),
      availability:
        AVAILABILITY_MAP[product.availabilityStatus] ??
        AVAILABILITY_MAP.IN_STOCK,
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: siteConfig.name },
    },
  };
}

export function breadcrumbSchema(items = []) {
  const baseUrl = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path.startsWith("http") ? item.path : `${baseUrl}${item.path}`,
    })),
  };
}

export function itemListSchema({ name, items = [] }) {
  const baseUrl = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
      name: item.name,
    })),
  };
}

export function faqSchema(items = []) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function articleSchema(blog) {
  const baseUrl = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    description: stripHtml(blog.content).slice(0, 200),
    image: blog.imageUrl
      ? [blog.imageUrl.startsWith("http") ? blog.imageUrl : `${baseUrl}${blog.imageUrl}`]
      : undefined,
    datePublished: toIsoDate(blog.publishedAt ?? blog.createdAt),
    dateModified: toIsoDate(blog.updatedAt),
    author: {
      "@type": "Person",
      name: blog.author?.name || siteConfig.name,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: { "@type": "ImageObject", url: `${baseUrl}/icon-512.png` },
    },
    mainEntityOfPage: `${baseUrl}/blogs/${blog.slug}`,
  };
}
