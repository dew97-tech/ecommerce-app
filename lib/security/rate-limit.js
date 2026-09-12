const buckets = new Map();
const MAX_BUCKETS = 5000;

function pruneExpired(now) {
  if (buckets.size < MAX_BUCKETS) return;

  for (const [key, entry] of buckets) {
    if (now >= entry.resetAt) buckets.delete(key);
  }
}

export function checkRateLimit(key, { limit, windowMs }) {
  const now = Date.now();
  pruneExpired(now);

  const entry = buckets.get(key);

  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count };
}
