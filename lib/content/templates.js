import { MAX_BLOG_EXCERPT } from "./blog-config.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatTaka(value) {
  return `৳${Number(value || 0).toLocaleString("en-US")}`;
}

function signedPct(value) {
  if (value === null || value === undefined) return "n/a";
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value}%`;
}

export function currentIsoWeek(date = new Date()) {
  const target = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((target - yearStart) / 86400000 + 1) / 7);
  return { year: target.getUTCFullYear(), week };
}

export function priceWatchSlug(insight, date = new Date()) {
  const { year, week } = currentIsoWeek(date);
  return `${insight.slug}-price-watch-${year}-w${String(week).padStart(2, "0")}`;
}

function buildExcerpt(insight, windowDays) {
  const direction =
    insight.medianPct > 0 ? "rose" : insight.medianPct < 0 ? "fell" : "held steady";
  const text = `${insight.label} prices ${direction} by a median of ${Math.abs(
    insight.medianPct
  )}% over the last ${windowDays} days, based on ${insight.sample} tracked changes. See the biggest movers and lowest in-stock prices.`;
  return text.slice(0, MAX_BLOG_EXCERPT);
}

export function buildPriceWatchArticle(
  insight,
  { windowDays = 30, prose = null, generatedAt = new Date() } = {}
) {
  const { year, week } = currentIsoWeek(generatedAt);
  const title = `${insight.label} Price Watch — Week ${week}, ${year} (Bangladesh)`;
  const trendWord =
    insight.medianPct > 1
      ? "rising"
      : insight.medianPct < -1
        ? "falling"
        : "stable";

  const parts = [];

  if (prose?.intro) {
    parts.push(`<p>${escapeHtml(prose.intro)}</p>`);
  }

  parts.push(
    `<p><strong>${escapeHtml(insight.label)}</strong> prices were <strong>${trendWord}</strong> over the last ${windowDays} days. We tracked <strong>${insight.sample}</strong> price changes: ${insight.up} increases and ${insight.down} decreases, with a median change of <strong>${signedPct(
      insight.medianPct
    )}</strong> and an average change of ${signedPct(insight.avgPct)}.</p>`
  );

  parts.push("<h2>Key numbers</h2>");
  parts.push("<ul>");
  parts.push(
    `<li>Median change: <strong>${signedPct(insight.medianPct)}</strong></li>`
  );
  parts.push(`<li>Average change: ${signedPct(insight.avgPct)}</li>`);
  parts.push(`<li>Products that went up: ${insight.up}</li>`);
  parts.push(`<li>Products that went down: ${insight.down}</li>`);
  parts.push(`<li>In-stock options tracked: ${insight.inStockCount}</li>`);
  parts.push("</ul>");

  if (prose?.analysis) {
    parts.push(`<p>${escapeHtml(prose.analysis)}</p>`);
  }

  if (insight.topIncreases.length > 0) {
    parts.push("<h2>Biggest increases</h2>");
    parts.push("<ul>");
    for (const mover of insight.topIncreases) {
      parts.push(
        `<li><a href="/products/${mover.slug}">${escapeHtml(
          mover.name
        )}</a>: ${formatTaka(mover.oldPrice)} to <strong>${formatTaka(
          mover.newPrice
        )}</strong> (${signedPct(mover.pct)})</li>`
      );
    }
    parts.push("</ul>");
  }

  if (insight.topDecreases.length > 0) {
    parts.push("<h2>Biggest decreases</h2>");
    parts.push("<ul>");
    for (const mover of insight.topDecreases) {
      parts.push(
        `<li><a href="/products/${mover.slug}">${escapeHtml(
          mover.name
        )}</a>: ${formatTaka(mover.oldPrice)} to <strong>${formatTaka(
          mover.newPrice
        )}</strong> (${signedPct(mover.pct)})</li>`
      );
    }
    parts.push("</ul>");
  }

  if (insight.brands.length > 0) {
    parts.push("<h2>Brand snapshot</h2>");
    parts.push("<ul>");
    for (const brand of insight.brands) {
      parts.push(
        `<li>${escapeHtml(brand.brand)}: ${signedPct(brand.avgPct)} average across ${brand.count} tracked changes</li>`
      );
    }
    parts.push("</ul>");
  }

  if (insight.valuePicks.length > 0) {
    parts.push("<h2>Lowest in-stock prices right now</h2>");
    parts.push("<ul>");
    for (const pick of insight.valuePicks) {
      parts.push(
        `<li><a href="/products/${pick.slug}">${escapeHtml(
          pick.name
        )}</a> — ${formatTaka(pick.price)}</li>`
      );
    }
    parts.push("</ul>");
  }

  if (prose?.faqs?.length) {
    parts.push("<h2>Frequently asked questions</h2>");
    for (const faq of prose.faqs.slice(0, 5)) {
      parts.push(`<h3>${escapeHtml(faq.question)}</h3>`);
      parts.push(`<p>${escapeHtml(faq.answer)}</p>`);
    }
  }

  parts.push("<h2>What should you do?</h2>");
  const advice = [];
  if (insight.medianPct > 2) {
    advice.push(
      "If you are upgrading soon, consider buying sooner rather than waiting — the recent trend is upward."
    );
    advice.push(
      "Compare DDR4 and DDR5 options for your motherboard before paying a premium for the newest standard."
    );
  } else if (insight.medianPct < -2) {
    advice.push(
      "Prices are easing; if your upgrade is not urgent, waiting a couple of weeks could save money."
    );
    advice.push(
      "Watch the lowest in-stock picks above — value options move first when prices fall."
    );
  } else {
    advice.push(
      "Prices are relatively stable; buy based on need and warranty rather than timing."
    );
  }
  advice.push(
    "Always confirm the final price and stock on the product page before ordering."
  );
  parts.push("<ul>");
  for (const item of advice) {
    parts.push(`<li>${escapeHtml(item)}</li>`);
  }
  parts.push("</ul>");

  parts.push("<h2>How we calculate this</h2>");
  parts.push(
    `<p>Numbers are based on ${insight.sample} tracked price changes for ${escapeHtml(
      insight.label
    )} over the last ${windowDays} days. We use the latest recorded change per product, ignore single-step changes above 300% (usually price corrections), and report medians alongside averages so a few outliers do not distort the trend.</p>`
  );
  parts.push(
    "<p><em>Prices are collected from public listings and can change without notice. This article is a market snapshot, not a price guarantee.</em></p>"
  );

  return {
    title,
    slug: priceWatchSlug(insight, generatedAt),
    excerpt: buildExcerpt(insight, windowDays),
    content: parts.join("\n"),
    tags: [insight.slug, "price watch", "bangladesh"],
    category: "Price Watch",
    sourceData: {
      generatedAt: generatedAt.toISOString(),
      windowDays,
      category: insight,
    },
  };
}
