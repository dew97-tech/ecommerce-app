const ANCHOR_PATTERN = /<a\b[^>]*>([\s\S]*?)<\/a>/gi;
const STRAY_ANCHOR_PATTERN = /<a(?=[^>]*href=)[^>]*>/gi;
const TARGET_ATTRIBUTE_PATTERN = /\s+target=("[^"]*"|'[^']*')/gi;
const EMPTY_HEADING_PATTERN = /<h[1-6][^>]*>\s*<\/h[1-6]>/gi;
const MERGED_SENTENCE_PATTERN = /([.!?])(?=[A-Z])/g;
const SENTENCE_SPLIT_PATTERN = /(?<=[.!?])\s+/;
const SOURCE_SENTENCE_PATTERN =
  /Star\s*Tech|In Bangladesh,? you can get original|best .{0,60}Shop in Bangladesh/i;
const SOURCE_NAME_PATTERN = /\bStar\s+Tech\b/gi;
const SOURCE_NAME_MERGED_PATTERN = /\bStar\s+Tech(?=[A-Z])/g;

function stripSourceSentences(text) {
  if (!text) return text;

  return text
    .replace(MERGED_SENTENCE_PATTERN, "$1 ")
    .split(SENTENCE_SPLIT_PATTERN)
    .filter((sentence) => !SOURCE_SENTENCE_PATTERN.test(sentence))
    .join(" ")
    .replace(SOURCE_NAME_MERGED_PATTERN, " ")
    .replace(SOURCE_NAME_PATTERN, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function stripDescriptionLinks(html) {
  if (!html || typeof html !== "string") return html;

  return html
    .replace(ANCHOR_PATTERN, "$1")
    .replace(STRAY_ANCHOR_PATTERN, "")
    .replace(TARGET_ATTRIBUTE_PATTERN, "");
}

const TAG_SPLIT_PATTERN = /(<[a-zA-Z/!][^>]*>)/g;

function cleanFinal(text) {
  return text
    .replace(SOURCE_NAME_MERGED_PATTERN, " ")
    .replace(SOURCE_NAME_PATTERN, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function stripSourceMentions(value) {
  if (!value || typeof value !== "string") return value;

  if (value.includes("<")) {
    const cleaned = value
      .split(TAG_SPLIT_PATTERN)
      .map((part) =>
        part.startsWith("<") && part.endsWith(">")
          ? part
          : stripSourceSentences(part)
      )
      .join("");

    return cleanFinal(cleaned).replace(EMPTY_HEADING_PATTERN, "");
  }

  return cleanFinal(stripSourceSentences(value));
}
