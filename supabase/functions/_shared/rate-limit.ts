// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Rate Limiter
// In-memory sliding window rate limiter for edge functions
// ═══════════════════════════════════════════════════════════════

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  const cutoff = now - windowMs;
  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter(t => t > cutoff);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check rate limit for a given key.
 * @param key - Unique identifier (e.g., user ID, IP)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds (default: 60s)
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 60,
  windowMs: number = 60_000
): RateLimitResult {
  const now = Date.now();
  cleanup(windowMs);

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  const cutoff = now - windowMs;
  entry.timestamps = entry.timestamps.filter(t => t > cutoff);

  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      resetAt: oldestInWindow + windowMs,
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
    resetAt: now + windowMs,
  };
}

/**
 * Create a rate-limited response with proper headers.
 */
export function rateLimitResponse(result: RateLimitResult, corsHeaders: Record<string, string>): Response {
  return new Response(
    JSON.stringify({ error: "Rate limit exceeded. Try again later." }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
        "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
      },
    }
  );
}
