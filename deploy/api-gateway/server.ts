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

// ── Config ───────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT || "3000", 10);
const BRAIN_CORE_URL = process.env.BRAIN_CORE_URL || "http://sita-brain-core:3001";
const SUPABASE_URL = process.env.SUPABASE_URL || "http://sita-supabase-kong:8000";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
const SITE_URL = process.env.SITE_URL || "http://localhost:8080";
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || "500", 10);
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10);

const startedAt = Date.now();

// ── Rate Limiter (in-memory) ────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
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
  c: { req: { raw: Request }; json: (data: unknown, status?: number) => Response },
  brainPath: string
) {
  try {
    const url = `${BRAIN_CORE_URL}${brainPath}`;
    const method = c.req.raw.method;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const init: RequestInit = { method, headers };
    if (method !== "GET" && method !== "HEAD") {
      init.body = await c.req.raw.text();
    }

    const response = await fetch(url, init);
    const data = await response.json();
    return c.json(data, response.status as 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Brain core unreachable";
    return c.json(
      { error: "Brain Core Error", message, brainPath },
      502
    );
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
  console.error("[API Gateway Error]", err.message);
  return c.json(
    {
      error: "Internal Server Error",
      message: process.env.NODE_ENV === "production" ? "An unexpected error occurred" : err.message,
      service: "sita-api-gateway",
    },
    500
  );
});

// ── Start ───────────────────────────────────────────────────

console.log(`[SITA API Gateway] Starting on port ${PORT}...`);
serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`[SITA API Gateway] Listening on http://0.0.0.0:${info.port}`);
  console.log(`[SITA API Gateway] Brain Core URL: ${BRAIN_CORE_URL}`);
  console.log(`[SITA API Gateway] Supabase URL: ${SUPABASE_URL}`);
  console.log(`[SITA API Gateway] Rate Limit: ${RATE_LIMIT_MAX} req/${RATE_LIMIT_WINDOW_MS}ms`);
});
