// ═══════════════════════════════════════════════════════════════
// SITA OS — Health/Ready Endpoint E2E Test Suite
// Calls every health/ready edge function through the gateway,
// verifies expected JSON schema, and fails the build if any
// endpoint returns stale or incorrect readiness signals.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, beforeAll } from "vitest";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

const HEALTH_ENDPOINTS = [
  {
    name: "health-live",
    path: "/functions/v1/health-live",
    expectedFields: ["status", "uptime_seconds", "timestamp"],
    expectedStatus: 200,
    requiresFreshTimestamp: true,
  },
  {
    name: "health-ready",
    path: "/functions/v1/health-ready",
    expectedFields: ["ready", "timestamp", "checks"],
    expectedStatus: [200, 503], // 503 is valid (not-ready)
    requiresFreshTimestamp: true,
  },
  {
    name: "health-beat",
    path: "/functions/v1/health-beat",
    method: "POST",
    body: { subsystem: "e2e-test", status: "healthy", source: "monitor" },
    expectedFields: ["ok"],
    expectedStatus: 200,
    requiresFreshTimestamp: false,
  },
  {
    name: "health-check",
    path: "/functions/v1/health-check",
    expectedFields: ["service", "status", "version", "timestamp", "subsystems"],
    expectedStatus: 200,
    requiresFreshTimestamp: true,
  },
] as const;

/** Max allowed age of a "timestamp" field before we flag staleness (60s). */
const MAX_STALE_MS = 60_000;

function isValidISOTimestamp(ts: unknown): ts is string {
  if (typeof ts !== "string") return false;
  const d = new Date(ts);
  return !isNaN(d.getTime());
}

function isFreshTimestamp(ts: string): boolean {
  const age = Date.now() - new Date(ts).getTime();
  return age >= 0 && age < MAX_STALE_MS;
}

describe("E2E: Health & Readiness Endpoints", () => {
  beforeAll(() => {
    if (!SUPABASE_URL || !ANON_KEY) {
      console.warn("⚠️  SUPABASE_URL or ANON_KEY not set — health E2E tests will be skipped.");
    }
  });

  for (const ep of HEALTH_ENDPOINTS) {
    const shouldRun = !!SUPABASE_URL && !!ANON_KEY;

    it.skipIf(!shouldRun)(`${ep.name}: returns valid JSON schema`, async () => {
      const url = `${SUPABASE_URL}${ep.path}`;
      const method = "method" in ep ? ep.method : "GET";
      const headers: Record<string, string> = {
        "apikey": ANON_KEY,
        "Content-Type": "application/json",
      };

      const init: RequestInit = { method, headers };
      if ("body" in ep && ep.body) {
        init.body = JSON.stringify(ep.body);
      }

      const response = await fetch(url, init);

      // Status check
      const expectedStatuses = Array.isArray(ep.expectedStatus)
        ? ep.expectedStatus
        : [ep.expectedStatus];
      expect(
        expectedStatuses.includes(response.status),
        `${ep.name}: expected status ${expectedStatuses.join("|")}, got ${response.status}`,
      ).toBe(true);

      // Parse JSON
      const body = await response.json();
      expect(body).toBeDefined();
      expect(typeof body).toBe("object");

      // Field presence
      for (const field of ep.expectedFields) {
        expect(
          body,
          `${ep.name}: missing required field "${field}"`,
        ).toHaveProperty(field);
      }

      // Timestamp freshness
      if (ep.requiresFreshTimestamp && "timestamp" in body) {
        expect(
          isValidISOTimestamp(body.timestamp),
          `${ep.name}: "timestamp" is not a valid ISO string: ${body.timestamp}`,
        ).toBe(true);
        expect(
          isFreshTimestamp(body.timestamp),
          `${ep.name}: timestamp is stale (>60s old): ${body.timestamp}`,
        ).toBe(true);
      }
    });
  }

  it.skipIf(!SUPABASE_URL || !ANON_KEY)("health-live: status is 'alive'", async () => {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/health-live`, {
      headers: { apikey: ANON_KEY },
    });
    const body = await res.json();
    expect(body.status).toBe("alive");
    expect(typeof body.uptime_seconds).toBe("number");
    expect(body.uptime_seconds).toBeGreaterThanOrEqual(0);
  });

  it.skipIf(!SUPABASE_URL || !ANON_KEY)("health-ready: checks object is well-formed", async () => {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/health-ready`, {
      headers: { apikey: ANON_KEY },
    });
    const body = await res.json();
    expect(typeof body.ready).toBe("boolean");
    expect(typeof body.checks).toBe("object");

    // Each check must have { ok: boolean }
    for (const [key, check] of Object.entries(body.checks)) {
      expect(check, `check "${key}" malformed`).toHaveProperty("ok");
      expect(typeof (check as any).ok).toBe("boolean");
    }
  });

  it.skipIf(!SUPABASE_URL || !ANON_KEY)("health-check: subsystems are well-formed", async () => {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/health-check`, {
      headers: { apikey: ANON_KEY },
    });
    const body = await res.json();
    expect(body.service).toBe("sita-os");
    expect(["healthy", "degraded", "down"]).toContain(body.status);
    expect(typeof body.subsystems).toBe("object");

    for (const [key, sub] of Object.entries(body.subsystems as Record<string, any>)) {
      expect(["healthy", "degraded", "down"]).toContain(sub.status);
      expect(typeof sub.latency_ms, `${key}: latency_ms should be number`).toBe("number");
    }
  });

  // ── Connector Health (auth-gated, skip if no token) ────────
  it.skipIf(!SUPABASE_URL || !ANON_KEY)("health-beat: rejects invalid method", async () => {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/health-beat`, {
      method: "GET",
      headers: { apikey: ANON_KEY },
    });
    expect(res.status).toBe(405);
  });

  it.skipIf(!SUPABASE_URL || !ANON_KEY)("health-beat: rejects invalid JSON", async () => {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/health-beat`, {
      method: "POST",
      headers: { apikey: ANON_KEY, "Content-Type": "application/json" },
      body: "not json",
    });
    expect(res.status).toBe(400);
  });

  it.skipIf(!SUPABASE_URL || !ANON_KEY)("health-check: version and release are strings", async () => {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/health-check`, {
      headers: { apikey: ANON_KEY },
    });
    const body = await res.json();
    expect(typeof body.version).toBe("string");
    expect(typeof body.release).toBe("string");
    expect(typeof body.uptime_seconds).toBe("number");
  });

  // Cross-endpoint consistency: live=alive implies ready should have some checks passing
  it.skipIf(!SUPABASE_URL || !ANON_KEY)("cross-check: live + ready consistency", async () => {
    const [liveRes, readyRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/functions/v1/health-live`, { headers: { apikey: ANON_KEY } }),
      fetch(`${SUPABASE_URL}/functions/v1/health-ready`, { headers: { apikey: ANON_KEY } }),
    ]);

    const live = await liveRes.json();
    const ready = await readyRes.json();

    // If liveness is alive, readiness checks should at least have entries
    if (live.status === "alive") {
      expect(Object.keys(ready.checks).length).toBeGreaterThan(0);
    }
  });

  // Cross-endpoint: health-check + health-ready agree on DB status
  it.skipIf(!SUPABASE_URL || !ANON_KEY)("cross-check: health-check DB status matches health-ready DB check", async () => {
    const [checkRes, readyRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/functions/v1/health-check`, { headers: { apikey: ANON_KEY } }),
      fetch(`${SUPABASE_URL}/functions/v1/health-ready`, { headers: { apikey: ANON_KEY } }),
    ]);
    const check = await checkRes.json();
    const ready = await readyRes.json();

    const dbHealthy = check.subsystems?.db?.status === "healthy";
    const dbReachable = ready.checks?.["db:reachable"]?.ok;

    // If health-check says DB is healthy, ready should agree
    if (dbHealthy) {
      expect(dbReachable).toBe(true);
    }
  });

  // Staleness guard: all timestamps within 60s of each other
  it.skipIf(!SUPABASE_URL || !ANON_KEY)("cross-check: timestamps are within 60s of each other", async () => {
    const [liveRes, readyRes, checkRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/functions/v1/health-live`, { headers: { apikey: ANON_KEY } }),
      fetch(`${SUPABASE_URL}/functions/v1/health-ready`, { headers: { apikey: ANON_KEY } }),
      fetch(`${SUPABASE_URL}/functions/v1/health-check`, { headers: { apikey: ANON_KEY } }),
    ]);

    const live = await liveRes.json();
    const ready = await readyRes.json();
    const check = await checkRes.json();

    const timestamps = [live.timestamp, ready.timestamp, check.timestamp]
      .filter(Boolean)
      .map((t: string) => new Date(t).getTime());

    if (timestamps.length >= 2) {
      const maxDrift = Math.max(...timestamps) - Math.min(...timestamps);
      expect(maxDrift, "Endpoint timestamps drifted >60s").toBeLessThan(60_000);
    }
  });
});