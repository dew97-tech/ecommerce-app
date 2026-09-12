const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-2.5-flash";
const REQUEST_TIMEOUT_MS = 60000;
const MAX_RETRIES = 2;

function getApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null;
}

function buildPrompt(insight, windowDays) {
  const data = {
    windowDays,
    category: insight.label,
    sample: insight.sample,
    medianPct: insight.medianPct,
    avgPct: insight.avgPct,
    up: insight.up,
    down: insight.down,
    inStockCount: insight.inStockCount,
    brands: insight.brands,
    topIncreases: insight.topIncreases.slice(0, 3),
    topDecreases: insight.topDecreases.slice(0, 3),
  };

  return `You are a market analyst writing for a Bangladeshi computer hardware store (RigNexus).
Write concise, factual commentary about ${insight.label} prices in Bangladesh based ONLY on the JSON data below.

Rules:
- Use only the numbers provided. Do not invent prices, products, dates, or specifications.
- Do not mention competitors or other stores.
- Do not give financial guarantees. Mention that prices can change.
- Audience: PC builders and upgraders in Bangladesh.
- Tone: helpful, neutral, practical.

Data:
${JSON.stringify(data, null, 2)}

Respond with JSON only, matching this shape:
{
  "intro": "2-3 sentences summarising the trend for the storefront",
  "analysis": "1-2 short paragraphs explaining what the numbers suggest for buyers",
  "faqs": [{ "question": "...", "answer": "..." }]
}
Provide 3 FAQs maximum.`;
}

async function callGemini(prompt, apiKey) {
  const model = process.env.GEMINI_TEXT_MODEL || DEFAULT_MODEL;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${API_BASE}/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: "application/json",
            maxOutputTokens: 1200,
          },
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Gemini ${response.status}: ${text.slice(0, 200)}`);
    }

    const payload = await response.json();
    const raw =
      payload?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text)
        .join("") ?? "";
    return JSON.parse(raw);
  } finally {
    clearTimeout(timer);
  }
}

export async function generateArticleProse(
  insight,
  { windowDays = 30 } = {}
) {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const prompt = buildPrompt(insight, windowDays);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const parsed = await callGemini(prompt, apiKey);
      if (!parsed) return null;

      return {
        intro:
          typeof parsed.intro === "string"
            ? parsed.intro.trim().slice(0, 600)
            : null,
        analysis:
          typeof parsed.analysis === "string"
            ? parsed.analysis.trim().slice(0, 1200)
            : null,
        faqs: Array.isArray(parsed.faqs)
          ? parsed.faqs
              .filter(
                (faq) =>
                  faq &&
                  typeof faq.question === "string" &&
                  typeof faq.answer === "string"
              )
              .map((faq) => ({
                question: faq.question.trim().slice(0, 160),
                answer: faq.answer.trim().slice(0, 400),
              }))
          : [],
        model: process.env.GEMINI_TEXT_MODEL || DEFAULT_MODEL,
      };
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        console.error("[gemini] prose generation failed:", error.message);
        return null;
      }
      await new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1)));
    }
  }

  return null;
}
