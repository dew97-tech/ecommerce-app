const {
  USER_AGENT,
  REQUEST_DELAY_MS,
  MAX_RETRIES,
  REQUEST_TIMEOUT_MS,
} = require("./config");
const { sleep } = require("./util");

async function fetchPage(url, options = {}) {
  const { retries = MAX_RETRIES, timeout = REQUEST_TIMEOUT_MS } = options;
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/html,application/xhtml+xml",
        },
        signal: controller.signal,
        redirect: "follow",
      });
      clearTimeout(timer);

      if (response.status === 404 || response.status === 410) {
        return { status: response.status, html: null };
      }

      if (
        response.status === 429 ||
        response.status === 403 ||
        response.status >= 500
      ) {
        lastError = new Error(`HTTP ${response.status}`);
        const wait = Math.min(30000, 1500 * 2 ** attempt);
        await sleep(wait);
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return { status: response.status, html: await response.text() };
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      if (attempt < retries) await sleep(1500 * (attempt + 1));
    }
  }

  throw lastError ?? new Error("Request failed");
}

async function runPool(items, worker, options = {}) {
  const {
    concurrency = 2,
    delayMs = REQUEST_DELAY_MS,
    onProgress,
    shouldStop,
  } = options;

  let cursor = 0;
  let active = 0;
  let completed = 0;

  return new Promise((resolve) => {
    const startNext = () => {
      if (shouldStop?.()) {
        if (active === 0) resolve();
        return;
      }

      if (cursor >= items.length) {
        if (active === 0) resolve();
        return;
      }

      const item = items[cursor];
      cursor += 1;
      active += 1;

      (async () => {
        try {
          await worker(item);
        } catch (error) {
          console.error("Worker error:", error.message);
        } finally {
          active -= 1;
          completed += 1;
          if (onProgress) onProgress(completed, items.length, item);
          await sleep(delayMs);
          startNext();
        }
      })();
    };

    for (let index = 0; index < concurrency; index += 1) {
      startNext();
    }
  });
}

module.exports = { fetchPage, runPool };
