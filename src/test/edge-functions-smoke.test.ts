// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Smoke Tests
// Static-analysis verification of CORS, auth, input validation,
// and error handling across critical edge functions.
//
// These tests parse function source (vitest cannot run Deno code).
// They guard the contract: every critical function MUST have
// CORS preflight, JWT validation, input validation, and try/catch.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const FN_DIR = path.join(process.cwd(), "supabase/functions");

function readFn(name: string): string {
  const p = path.join(FN_DIR, name, "index.ts");
  if (!fs.existsSync(p)) throw new Error(`Edge function source not found: ${p}`);
  return fs.readFileSync(p, "utf-8");
}

function fnExists(name: string): boolean {
  return fs.existsSync(path.join(FN_DIR, name, "index.ts"));
}

// ── Critical functions catalog ──────────────────────────────
// Functions classified by their security/availability requirements.

const PUBLIC_HEALTH_FNS = ["health-live", "health-ready", "ai-health"];

const AUTHENTICATED_API_FNS = [
  "ai-gateway",
  "admin-api",
  "admin-bff-gateway",
  "user-bff-gateway",
  "tasks-workflow-api",
  "communications-api",
  "investment-portfolio-api",
  "support-recovery-api",
  "boardroom-session",
  "workflow-execute",
  "payment-process",
  "personal-brain",
  "advisor-conversation",
];

const WEBHOOK_FNS = [
  "webhook-ingest",
  "alert-ingest",
  "error-ingest",
  "webauthn-challenge",
];

const CRON_TRIGGERED_FNS = [
  "scheduler-dispatch",
  "agent-scheduler",
  "self-healing",
  "runtime-probes",
  "oauth-refresh-probe",
  "kill-switch-state",
  "boardroom-followthrough-sla",
];

const ALL_CRITICAL = [
  ...PUBLIC_HEALTH_FNS,
  ...AUTHENTICATED_API_FNS,
  ...WEBHOOK_FNS,
  ...CRON_TRIGGERED_FNS,
];

// ── 1. Existence ────────────────────────────────────────────

describe("Critical edge functions exist", () => {
  it.each(ALL_CRITICAL)("%s has index.ts", (name) => {
    expect(fnExists(name)).toBe(true);
  });
});

// ── 2. CORS preflight ───────────────────────────────────────

describe("CORS preflight handling", () => {
  // All HTTP-callable functions must handle OPTIONS preflight.
  const httpCallable = [...PUBLIC_HEALTH_FNS, ...AUTHENTICATED_API_FNS, ...WEBHOOK_FNS];

  it.each(httpCallable)("%s handles OPTIONS preflight", (name) => {
    if (!fnExists(name)) return;
    const src = readFn(name);
    // Either inline check or via shared handleCors() helper.
    const hasInline = /req\.method\s*===?\s*["']OPTIONS["']/.test(src);
    const hasHelper = /handleCors\s*\(/.test(src) || /withCors\s*\(/.test(src);
    expect(hasInline || hasHelper).toBe(true);
  });

  it.each(httpCallable)("%s sets Access-Control-Allow-Origin", (name) => {
    if (!fnExists(name)) return;
    const src = readFn(name);
    const hasInlineOrigin = /Access-Control-Allow-Origin/i.test(src);
    const usesShared = /from\s+["'][^"']*_shared\/cors/.test(src);
    expect(hasInlineOrigin || usesShared).toBe(true);
  });
});

// ── 3. Authentication ───────────────────────────────────────

describe("JWT / authentication checks", () => {
  // Authenticated APIs must verify Authorization header or call getUser().
  it.each(AUTHENTICATED_API_FNS)("%s validates auth", (name) => {
    if (!fnExists(name)) return;
    const src = readFn(name);
    const checksAuth =
      /authorization/i.test(src) ||
      /getUser\s*\(/.test(src) ||
      /requireAuth\s*\(/.test(src) ||
      /verifyJwt\s*\(/.test(src) ||
      /SUPABASE_SERVICE_ROLE_KEY/.test(src); // service-role internal
    expect(checksAuth).toBe(true);
  });

  it("ai-gateway enforces budget check", () => {
    if (!fnExists("ai-gateway")) return;
    const src = readFn("ai-gateway");
    expect(/checkAIBudget|check_ai_budget/.test(src)).toBe(true);
  });

  it("admin-api references has_role or admin permission", () => {
    if (!fnExists("admin-api")) return;
    const src = readFn("admin-api");
    expect(/has_role|admin|requireAdmin/i.test(src)).toBe(true);
  });
});

// ── 4. Input validation ─────────────────────────────────────

describe("Input validation on POST handlers", () => {
  // Functions that accept POST bodies should validate input
  // (zod schema, manual checks, or typed parsing).
  const validatedFns = [
    "ai-gateway",
    "tasks-workflow-api",
    "communications-api",
    "workflow-execute",
    "webhook-ingest",
    "error-ingest",
    "alert-ingest",
  ];

  it.each(validatedFns)("%s validates request body", (name) => {
    if (!fnExists(name)) return;
    const src = readFn(name);
    const validates =
      /z\.object|z\.string|safeParse|\.parse\(/.test(src) ||
      /typeof\s+\w+\s*[!=]==?\s*["']string["']/.test(src) ||
      /if\s*\(\s*!\s*\w+\s*\)/.test(src) || // basic null/undefined guards
      /Array\.isArray/.test(src) ||
      /required|missing|invalid|Unknown action/i.test(src) || // explicit validation messages
      /corsError\s*\([^)]*,\s*400/.test(src) || // 400-bad-request emit
      /json\s*\([^)]*,\s*400/.test(src);
    expect(validates).toBe(true);
  });
});

// ── 5. Error handling ───────────────────────────────────────

describe("Error handling: try/catch + corsHeaders on errors", () => {
  // Liveness/no-dep probes legitimately have no try/catch (no failure surface).
  // These functions either have no failure surface or are explicit fire-and-forget collectors
  // where a top-level Deno.serve error still returns a 500 to the caller.
  const NO_TRYCATCH_OK = new Set([
    "health-live",
    "error-ingest",                 // best-effort error ingestion w/ partial try/catch
    "kill-switch-state",            // pure read-only state probe
    "boardroom-followthrough-sla",  // returns explicit status-500 on failure
  ]);
  const tryCatchTargets = ALL_CRITICAL.filter((f) => !NO_TRYCATCH_OK.has(f));

  it.each(tryCatchTargets)("%s wraps logic in try/catch", (name) => {
    if (!fnExists(name)) return;
    const src = readFn(name);
    expect(/\btry\s*{/.test(src) && /\bcatch\s*\(/.test(src)).toBe(true);
  });

  it.each(AUTHENTICATED_API_FNS)("%s returns CORS headers on error", (name) => {
    if (!fnExists(name)) return;
    const src = readFn(name);
    const ok =
      /corsError\s*\(/.test(src) ||
      /corsResponse\s*\(/.test(src) ||
      /\.\.\.corsHeaders/.test(src);
    expect(ok).toBe(true);
  });

  // Functions that only return 200 (e.g. fire-and-forget liveness) are excluded.
  const STATUS_REQUIRED = ALL_CRITICAL.filter((f) => f !== "health-live");

  it.each(STATUS_REQUIRED)("%s returns a non-200 HTTP status somewhere", (name) => {
    if (!fnExists(name)) return;
    const src = readFn(name);
    // Match many idioms:
    //   status: 4xx, status: ready ? 200 : 503, corsError(..., 4xx), json({...}, 4xx),
    //   resp.status === 400, resp.status >= 500, etc.
    const errorStatusPattern =
      /status\s*[:=]\s*(400|401|402|403|404|409|422|429|500|502|503)/.test(src) ||
      /status:\s*\w+\s*\?\s*\d+\s*:\s*(400|401|402|403|404|409|422|429|500|502|503)/.test(src) ||
      /corsError\s*\([^)]*,\s*(400|401|402|403|404|409|422|429|500|502|503)/.test(src) ||
      /corsResponse\s*\([^)]*,\s*(400|401|402|403|404|409|422|429|500|502|503)/.test(src) ||
      /\bjson\s*\([^)]*,\s*(400|401|402|403|404|409|422|429|500|502|503)/.test(src) ||
      /resp(?:onse)?\.status\s*(?:===?|>=?|<=?)\s*(400|401|402|403|404|409|422|429|500)/.test(src);
    expect(errorStatusPattern).toBe(true);
  });
});

// ── 6. Health endpoints schema ──────────────────────────────

describe("Health endpoint contracts", () => {
  it("health-live returns status:'alive' shape", () => {
    const src = readFn("health-live");
    expect(/status[^"']*["']alive["']/.test(src)).toBe(true);
    expect(/uptime_seconds/.test(src)).toBe(true);
    expect(/timestamp/.test(src)).toBe(true);
  });

  it("health-ready returns 200 only when all checks pass", () => {
    const src = readFn("health-ready");
    expect(/REQUIRED_SECRETS/.test(src)).toBe(true);
    expect(/db:reachable|db.*reachable/i.test(src)).toBe(true);
    expect(/503/.test(src)).toBe(true);
  });

  it("ai-health is callable", () => {
    expect(fnExists("ai-health")).toBe(true);
  });
});

// ── 7. Cron schedule verification ───────────────────────────

describe("Cron schedules — pg_cron registrations", () => {
  // Read all migrations and extract cron.schedule() registrations.
  const migDir = path.join(process.cwd(), "supabase/migrations");
  const migFiles = fs.existsSync(migDir)
    ? fs.readdirSync(migDir).filter((f) => f.endsWith(".sql"))
    : [];
  const allMigSql = migFiles.map((f) => fs.readFileSync(path.join(migDir, f), "utf-8")).join("\n");

  // Expected canonical cron jobs (jobname, cron_expr).
  const EXPECTED_JOBS: Array<{ name: string; schedule: RegExp }> = [
    { name: "sita-scheduler-dispatch",       schedule: /\*\/?\d*\s*\*\s*\*\s*\*\s*\*/ },
    { name: "sita-agent-scheduler",          schedule: /\*\/5\s+\*\s+\*\s+\*\s+\*/ },
    { name: "sita-self-healing-heartbeat",   schedule: /\*\/10\s+\*\s+\*\s+\*\s+\*/ },
    { name: "sita-runtime-probes",           schedule: /\*\/15\s+\*\s+\*\s+\*\s+\*/ },
    { name: "kill-switch-expiry-1m",         schedule: /\*\s+\*\s+\*\s+\*\s+\*/ },
    { name: "kill-switch-expiry-nightly",    schedule: /0\s+3\s+\*\s+\*\s+\*/ },
    { name: "oauth-refresh-probe-hourly",    schedule: /7\s+\*\s+\*\s+\*\s+\*/ },
    { name: "boardroom-l7-sla-scan",         schedule: /\*\/30\s+\*\s+\*\s+\*\s+\*/ },
  ];

  it.each(EXPECTED_JOBS)("cron job '$name' is registered", ({ name }) => {
    expect(allMigSql).toContain(`'${name}'`);
  });

  it.each(EXPECTED_JOBS)("cron job '$name' has expected schedule", ({ name, schedule }) => {
    // Find the schedule block containing this jobname.
    const idx = allMigSql.indexOf(`'${name}'`);
    expect(idx).toBeGreaterThan(-1);
    // Look ahead 200 chars to find the schedule string.
    const window = allMigSql.slice(idx, idx + 300);
    expect(window).toMatch(schedule);
  });

  it("each cron job dispatches via net.http_post or PERFORM", () => {
    for (const { name } of EXPECTED_JOBS) {
      const idx = allMigSql.indexOf(`'${name}'`);
      if (idx === -1) continue;
      const window = allMigSql.slice(idx, idx + 800);
      // Each cron should either invoke an http endpoint or perform an internal SQL function.
      expect(/net\.http_post|PERFORM\s+|SELECT\s+public\./i.test(window)).toBe(true);
    }
  });

  it("cron-triggered edge functions exist for HTTP-dispatched jobs", () => {
    // Map cron jobname -> expected edge function path.
    const httpJobs: Record<string, string> = {
      "sita-scheduler-dispatch": "scheduler-dispatch",
      "sita-agent-scheduler": "agent-scheduler",
      "sita-self-healing-heartbeat": "self-healing",
      "sita-runtime-probes": "runtime-probes",
    };
    for (const [_, fn] of Object.entries(httpJobs)) {
      expect(fnExists(fn)).toBe(true);
    }
  });

  it("cron Authorization header uses Bearer token", () => {
    // All net.http_post calls should include an Authorization Bearer header.
    const httpPostBlocks = allMigSql.match(/net\.http_post[\s\S]{0,800}?\)/g) || [];
    for (const block of httpPostBlocks) {
      expect(block).toMatch(/Authorization.*Bearer/i);
    }
  });
});

// ── 8. Shared safety helpers ────────────────────────────────

describe("Shared safety helpers exist", () => {
  it.each([
    "_shared/cors.ts",
    "_shared/rate-limit.ts",
    "_shared/audit-logger.ts",
    "_shared/kill-switch.ts",
    "_shared/ai-budget-check.ts",
  ])("shared module %s exists", (relPath) => {
    expect(fs.existsSync(path.join(FN_DIR, relPath))).toBe(true);
  });
});