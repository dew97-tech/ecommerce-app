import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "code",
  "pre",
  "blockquote",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "hr",
  "a",
  "img",
  "figure",
  "figcaption",
  "span",
];

const ALIGN_STYLE = /^(left|right|center|justify)$/;

export function sanitizeContentHtml(html) {
  return sanitizeHtml(String(html ?? ""), {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height"],
      p: ["style"],
      h1: ["style"],
      h2: ["style"],
      h3: ["style"],
      h4: ["style"],
      h5: ["style"],
      h6: ["style"],
      span: ["style"],
      code: ["class"],
      pre: ["class"],
    },
    allowedStyles: {
      "*": {
        "text-align": [ALIGN_STYLE],
      },
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, rel: "noopener noreferrer" },
      }),
    },
  });
}

export function hasTextContent(html) {
  const text = sanitizeHtml(String(html ?? ""), {
    allowedTags: [],
    allowedAttributes: {},
  });
  return text.trim().length > 0;
}

export function stripHtmlContent(html) {
  return sanitizeHtml(String(html ?? ""), {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/\s+/g, " ")
    .trim();
}

export function isHtmlContent(content) {
  return /^\s*<(p|h[1-6]|ul|ol|blockquote|pre|div|figure|img)\b/i.test(
    String(content ?? "")
  );
}
