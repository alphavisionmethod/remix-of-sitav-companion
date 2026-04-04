// ═══════════════════════════════════════════════════════════════
// SITA OS — API Gateway Server
// Lightweight Hono gateway: auth, brain-core proxy, Supabase proxy
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

const startedAt = Date.now();

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

// Council orchestration
app.post("/api/council", (c) => proxyToBrain(c, "/brain/council"));

// Model routing
app.post("/api/model/route", (c) => proxyToBrain(c, "/brain/model/route"));
app.get("/api/model/budget", (c) => proxyToBrain(c, "/brain/model/budget"));

// Advisor selection
app.post("/api/advisors", (c) => proxyToBrain(c, "/brain/advisors"));

// Simulation
app.post("/api/simulation", (c) => proxyToBrain(c, "/brain/simulation"));

// Approval
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
  console.log(`[SITA API Gateway] Edge Functions URL: ${EDGE_FUNCTIONS_URL}`);
});
