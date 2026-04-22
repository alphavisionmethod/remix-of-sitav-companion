// ═══════════════════════════════════════════════════════════════
// SITA OS — API Gateway Server
// Lightweight Hono gateway: auth, brain-core proxy, Supabase proxy
// With rate limiting middleware
// ═══════════════════════════════════════════════════════════════

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

// ── Config ───────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT || "3000", 10);
const BRAIN_CORE_URL = process.env.BRAIN_CORE_URL || "http://sita-brain-core:3001";
const SUPABASE_URL = process.env.SUPABASE_URL || "http://sita-supabase-kong:8000";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
const SITE_URL = process.env.SITE_URL || "http://localhost:8080";
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || "500", 10);
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10);
const REQUEST_TIMEOUT_MS = parseInt(process.env.REQUEST_TIMEOUT_MS || "30000", 10);
const MAX_BODY_BYTES = parseInt(process.env.MAX_BODY_BYTES || "1048576", 10); // 1 MB

const startedAt = Date.now();
let serverRef: { close: () => void } | null = null;
let rateLimitCleanupInterval: ReturnType<typeof setInterval> | null = null;
let shuttingDown = false;

// ── In-memory metrics ───────────────────────────────────────

const metrics = { totalRequests: 0, totalErrors: 0, status2xx: 0, status4xx: 0, status5xx: 0 };

// ── Structured Logger ───────────────────────────────────────

function log(level: "info" | "warn" | "error", msg: string, extra?: Record<string, unknown>) {
  const entry = { ts: new Date().toISOString(), level, service: "sita-api-gateway", msg, ...extra };
  if (level === "error") console.error(JSON.stringify(entry));
  else if (level === "warn") console.warn(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
}

// ── Env Validation (fail-fast) ──────────────────────────────

function validateEnv() {
  const errors: string[] = [];
  if (!SUPABASE_ANON_KEY) errors.push("SUPABASE_ANON_KEY is required");
  if (SUPABASE_URL && !/^https?:\/\/.+/.test(SUPABASE_URL)) errors.push(`SUPABASE_URL invalid format: ${SUPABASE_URL}`);
  if (BRAIN_CORE_URL && !/^https?:\/\/.+/.test(BRAIN_CORE_URL)) errors.push(`BRAIN_CORE_URL invalid format: ${BRAIN_CORE_URL}`);
  if (isNaN(PORT) || PORT < 1 || PORT > 65535) errors.push(`PORT invalid: ${process.env.PORT}`);
  if (isNaN(RATE_LIMIT_MAX) || RATE_LIMIT_MAX < 1) errors.push(`RATE_LIMIT_MAX invalid: ${process.env.RATE_LIMIT_MAX}`);
  if (errors.length > 0) {
    for (const e of errors) log("error", e);
    log("error", "Env validation failed — exiting");
    process.exit(1);
  }
  log("info", "Env validation passed");
}

// ── Rate Limiter (in-memory) ────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
rateLimitCleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}, 300000);

function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

// ── App ──────────────────────────────────────────────────────

const app = new Hono();

// Global middleware
app.use("*", logger());

// Request-ID middleware — generate or accept X-Request-Id
app.use("*", async (c, next) => {
  const requestId = c.req.header("X-Request-Id") || randomUUID();
  c.set("requestId" as never, requestId as never);
  c.header("X-Request-Id", requestId);
  await next();
});

// Body size limiting middleware
app.use("*", async (c, next) => {
  if (c.req.method !== "GET" && c.req.method !== "HEAD" && c.req.method !== "OPTIONS") {
    const contentLength = c.req.header("Content-Length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
      return c.json({ error: "Payload Too Large", maxBytes: MAX_BODY_BYTES }, 413);
    }
  }
  await next();
});

// Metrics tracking middleware
app.use("*", async (c, next) => {
  metrics.totalRequests++;
  await next();
  const status = c.res.status;
  if (status >= 200 && status < 300) metrics.status2xx++;
  else if (status >= 400 && status < 500) metrics.status4xx++;
  else if (status >= 500) { metrics.status5xx++; metrics.totalErrors++; }
});

app.use(
  "*",
  cors({
    origin: [SITE_URL, "http://localhost:8080", "http://localhost:5173"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    credentials: true,
  })
);

// Rate limiting middleware
app.use("*", async (c, next) => {
  const path = c.req.path;
  // Skip rate limiting for health check
  if (path === "/health") return next();

  const ip = getClientIP(c.req.raw);
  const now = Date.now();

  // Use stricter limit for auth-related paths
  const isAuthPath = path.includes("/auth") || path.includes("/login");
  const maxRequests = isAuthPath ? 20 : RATE_LIMIT_MAX;
  const windowMs = isAuthPath ? 60000 : RATE_LIMIT_WINDOW_MS;

  const key = `${ip}:${isAuthPath ? "auth" : "general"}`;
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    c.header("X-RateLimit-Limit", String(maxRequests));
    c.header("X-RateLimit-Remaining", String(maxRequests - 1));
    return next();
  }

  entry.count++;
  const remaining = Math.max(0, maxRequests - entry.count);

  c.header("X-RateLimit-Limit", String(maxRequests));
  c.header("X-RateLimit-Remaining", String(remaining));
  c.header("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

  if (entry.count > maxRequests) {
    return c.json(
      {
        error: "Too Many Requests",
        message: `Rate limit exceeded. Try again in ${Math.ceil((entry.resetAt - now) / 1000)}s`,
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      },
      429
    );
  }

  return next();
});

// ── Health ───────────────────────────────────────────────────

app.get("/metrics", (c) => {
  return c.json({
    service: "sita-api-gateway",
    uptime: Math.floor((Date.now() - startedAt) / 1000),
    ...metrics,
    rateLimitStoreSize: rateLimitStore.size,
    timestamp: new Date().toISOString(),
  });
});

app.get("/ready", (c) => {
  if (shuttingDown) {
    return c.json({ ready: false, reason: "shutting_down" }, 503);
  }
  const checks = {
    supabase_configured: !!SUPABASE_ANON_KEY,
    brain_core_url_set: !!BRAIN_CORE_URL,
  };
  const allReady = Object.values(checks).every(Boolean);
  return c.json({
    ready: allReady,
    service: "sita-api-gateway",
    checks,
    uptime: Math.floor((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
  }, allReady ? 200 : 503);
});

app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    service: "sita-api-gateway",
    version: "1.0.0",
    uptime: Math.floor((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
  });
});

// ── Auth Middleware ──────────────────────────────────────────

type AuthUser = { id: string; email?: string; role?: string };

async function validateAuth(
  authHeader: string | undefined
): Promise<AuthUser | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;
    return { id: user.id, email: user.email, role: user.role };
  } catch {
    return null;
  }
}

// Auth-gated middleware for /api/* routes (excluding health)
app.use("/api/*", async (c, next) => {
  const user = await validateAuth(c.req.header("Authorization"));
  if (!user) {
    return c.json({ error: "Unauthorized", message: "Valid Supabase JWT required" }, 401);
  }
  c.set("user" as never, user as never);
  await next();
});

// ── Brain Core Proxy ────────────────────────────────────────

async function proxyToBrain(
  c: { req: { raw: Request; header: (name: string) => string | undefined }; json: (data: unknown, status?: number) => Response },
  brainPath: string
) {
  try {
    const url = `${BRAIN_CORE_URL}${brainPath}`;
    const method = c.req.raw.method;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Request-Id": c.req.header("X-Request-Id") || randomUUID(),
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const init: RequestInit = { method, headers, signal: controller.signal };
    if (method !== "GET" && method !== "HEAD") {
      init.body = await c.req.raw.text();
    }

    try {
      const response = await fetch(url, init);
      clearTimeout(timeout);
      const data = await response.json();
      return c.json(data, response.status as 200);
    } finally {
      clearTimeout(timeout);
    }
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return c.json({ error: "Gateway Timeout", message: "Brain core did not respond in time", brainPath, _requestId: c.req.header("X-Request-Id") }, 504);
    }
    const message = err instanceof Error ? err.message : "Brain core unreachable";
    return c.json({ error: "Brain Core Error", message, brainPath, _requestId: c.req.header("X-Request-Id") }, 502);
  }
}

// Intent orchestration
app.post("/api/intent", (c) => proxyToBrain(c, "/brain/intent"));
app.post("/api/council", (c) => proxyToBrain(c, "/brain/council"));
app.post("/api/model/route", (c) => proxyToBrain(c, "/brain/model/route"));
app.get("/api/model/budget", (c) => proxyToBrain(c, "/brain/model/budget"));
app.post("/api/advisors", (c) => proxyToBrain(c, "/brain/advisors"));
app.post("/api/simulation", (c) => proxyToBrain(c, "/brain/simulation"));
app.post("/api/approval", (c) => proxyToBrain(c, "/brain/approval"));

// ── Edge Functions Proxy ────────────────────────────────────

const EDGE_FUNCTIONS_URL = process.env.EDGE_FUNCTIONS_URL || "http://sita-supabase-functions:9000";

app.all("/api/functions/*", async (c) => {
  try {
    const fnPath = c.req.path.replace("/api/functions", "");
    const url = `${EDGE_FUNCTIONS_URL}${fnPath}`;
    const method = c.req.raw.method;

    const headers: Record<string, string> = {
      Authorization: c.req.header("Authorization") || `Bearer ${SUPABASE_ANON_KEY}`,
    };

    const contentType = c.req.header("Content-Type");
    if (contentType) headers["Content-Type"] = contentType;

    const init: RequestInit = { method, headers };
    if (method !== "GET" && method !== "HEAD") {
      init.body = await c.req.raw.text();
    }

    const response = await fetch(url, init);
    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Edge functions unreachable";
    return c.json({ error: "Edge Functions Proxy Error", message }, 502);
  }
});

// ── Supabase Proxy ──────────────────────────────────────────

app.all("/api/supabase/*", async (c) => {
  try {
    const supabasePath = c.req.path.replace("/api/supabase", "");
    const url = `${SUPABASE_URL}${supabasePath}`;
    const method = c.req.raw.method;

    const headers: Record<string, string> = {
      apikey: SUPABASE_ANON_KEY,
      Authorization: c.req.header("Authorization") || `Bearer ${SUPABASE_ANON_KEY}`,
    };

    const contentType = c.req.header("Content-Type");
    if (contentType) headers["Content-Type"] = contentType;

    const init: RequestInit = { method, headers };
    if (method !== "GET" && method !== "HEAD") {
      init.body = await c.req.raw.text();
    }

    const response = await fetch(url, init);
    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Supabase unreachable";
    return c.json({ error: "Supabase Proxy Error", message }, 502);
  }
});

// ── 404 Fallback ────────────────────────────────────────────

app.notFound((c) => {
  return c.json(
    { error: "Not Found", path: c.req.path, service: "sita-api-gateway" },
    404
  );
});

// ── Global Error Handler ────────────────────────────────────

app.onError((err, c) => {
  const requestId = c.req.header("X-Request-Id") || "unknown";
  log("error", "Unhandled request error", { error: err.message, path: c.req.path, method: c.req.method, requestId });
  return c.json(
    {
      error: "Internal Server Error",
      message: process.env.NODE_ENV === "production" ? "An unexpected error occurred" : err.message,
      service: "sita-api-gateway",
      _requestId: requestId,
    },
    500
  );
});

// ── Graceful Shutdown ───────────────────────────────────────

function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  log("info", `${signal} received — draining connections`, { signal });
  if (serverRef) { try { serverRef.close(); } catch { /* already closed */ } }
  if (rateLimitCleanupInterval) clearInterval(rateLimitCleanupInterval);
  setTimeout(() => { log("info", "Drain timeout reached — exiting"); process.exit(0); }, 10_000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => {
  log("error", "Unhandled rejection", { error: reason instanceof Error ? reason.message : String(reason) });
});
process.on("uncaughtException", (err) => {
  log("error", "Uncaught exception — shutting down", { error: err.message, stack: err.stack });
  shutdown("uncaughtException");
});

// ── Start ───────────────────────────────────────────────────

validateEnv();
log("info", "Starting API Gateway", { port: PORT });
serverRef = serve({ fetch: app.fetch, port: PORT }, (info) => {
  log("info", "Listening", {
    url: `http://0.0.0.0:${info.port}`,
    brainCoreUrl: BRAIN_CORE_URL,
    supabaseUrl: SUPABASE_URL,
    rateLimit: `${RATE_LIMIT_MAX} req/${RATE_LIMIT_WINDOW_MS}ms`,
  });
}) as unknown as { close: () => void };
