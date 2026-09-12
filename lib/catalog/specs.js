const MAX_KEY_LENGTH = 60;
const MAX_VALUE_LENGTH = 120;

function normalizeKey(key) {
  return String(key).replace(/\s+/g, " ").trim().slice(0, MAX_KEY_LENGTH);
}

function normalizeValue(value) {
  return String(value).replace(/\s+/g, " ").trim().slice(0, MAX_VALUE_LENGTH);
}

export function flattenSpecifications(specData) {
  if (!specData || typeof specData !== "object" || Array.isArray(specData)) {
    return {};
  }

  const flat = {};

  const visit = (obj, depth) => {
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        if (depth < 2) visit(value, depth + 1);
        continue;
      }

      if (value === null || typeof value === "object") continue;

      const cleanKey = normalizeKey(key);
      const cleanValue = normalizeValue(value);

      if (cleanKey && cleanValue && !flat[cleanKey]) {
        flat[cleanKey] = cleanValue;
      }
    }
  };

  visit(specData, 0);
  return flat;
}
