const FALLBACK_IMAGE = "/placeholder.png";

export function parseImages(images) {
  if (!images) return [];
  if (Array.isArray(images)) return images.filter(Boolean);

  try {
    const parsed = JSON.parse(images);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
    if (typeof parsed === "string") return [parsed];
  } catch {

  }

  return String(images)
    .replace(/[[\]"]/g, "")
    .split(",")
    .map((image) => image.trim())
    .filter(Boolean);
}

export function getFirstImage(images, fallback = FALLBACK_IMAGE) {
  const [first] = parseImages(images);
  if (!first) return fallback;
  if (first.startsWith("http") || first.startsWith("/")) return first;
  return `/${first}`;
}
