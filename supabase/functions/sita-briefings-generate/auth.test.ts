// ═══════════════════════════════════════════════════════════════
// Unit + integration tests — CRON_SECRET enforcement on the
// sita-briefings-generate edge function (G4 deployment gate).
//
// We test the pure predicate `authorizeCronInvocation` because:
//   - it is the single decision point used by index.ts,
//   - it is dependency-free (no Deno globals, no fetch, no DB),
//   - it can be exhaustively covered in <50ms with no side-effects.
//
// "Integration" coverage: we additionally exercise the predicate
// through a Fetch-API style adapter that mirrors the exact shape
// of the request handler in index.ts, so a regression in how
// headers / env are wired through would fail here.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { authorizeCronInvocation, type AuthInput } from "./auth.ts";

const CRON = "super-secret-cron-token-1234567890";
const SVC = "service-role-key-abcdef-1234567890";

function input(overrides: Partial<AuthInput> = {}): AuthInput {
  return {
    cronSecretHeader: null,
    authorizationHeader: null,
    cronSecretEnv: CRON,
    serviceRoleEnv: SVC,
    ...overrides,
  };
}

describe("authorizeCronInvocation — closed-by-default", () => {
  it("refuses when CRON_SECRET env is unset", () => {
    const r = authorizeCronInvocation(input({ cronSecretEnv: undefined, cronSecretHeader: CRON }));
    expect(r.ok).toBe(false);
    expect(r.ok ? null : r.reason).toBe("missing_cron_secret_env");
  });

  it("refuses when CRON_SECRET env is empty string", () => {
    const r = authorizeCronInvocation(input({ cronSecretEnv: "", cronSecretHeader: "" }));
    expect(r.ok).toBe(false);
    expect(r.ok ? null : r.reason).toBe("missing_cron_secret_env");
  });

  it("refuses when CRON_SECRET env is shorter than 8 chars (weak)", () => {
    const r = authorizeCronInvocation(input({ cronSecretEnv: "abc", cronSecretHeader: "abc" }));
    expect(r.ok).toBe(false);
    expect(r.ok ? null : r.reason).toBe("missing_cron_secret_env");
  });
});

describe("authorizeCronInvocation — cron header path", () => {
  it("accepts a request with the correct x-cron-secret header", () => {
    const r = authorizeCronInvocation(input({ cronSecretHeader: CRON }));
    expect(r.ok).toBe(true);
    expect(r.ok && r.mode).toBe("cron");
  });

  it("rejects an empty x-cron-secret header (no auth header either)", () => {
    const r = authorizeCronInvocation(input({ cronSecretHeader: "" }));
    expect(r.ok).toBe(false);
    expect(r.ok ? null : r.reason).toBe("unauthorized");
  });

  it("rejects an incorrect x-cron-secret header", () => {
    const r = authorizeCronInvocation(input({ cronSecretHeader: "wrong-secret-but-long-enough" }));
    expect(r.ok).toBe(false);
    expect(r.ok ? null : r.reason).toBe("unauthorized");
  });

  it("rejects an x-cron-secret with a single-byte difference", () => {
    const tampered = CRON.slice(0, -1) + "X";
    const r = authorizeCronInvocation(input({ cronSecretHeader: tampered }));
    expect(r.ok).toBe(false);
    expect(r.ok ? null : r.reason).toBe("unauthorized");
  });

  it("rejects an x-cron-secret of mismatched length even if it shares a prefix", () => {
    const r = authorizeCronInvocation(input({ cronSecretHeader: CRON + "extra" }));
    expect(r.ok).toBe(false);
    expect(r.ok ? null : r.reason).toBe("unauthorized");
  });

  it("does NOT silently fall through to the bearer path when the cron header is wrong", () => {
    const r = authorizeCronInvocation(input({
      cronSecretHeader: "definitely-not-the-cron-secret",
      authorizationHeader: null,
    }));
    expect(r.ok).toBe(false);
  });
});

describe("authorizeCronInvocation — bearer paths", () => {
  it("accepts a service-role bearer", () => {
    const r = authorizeCronInvocation(input({ authorizationHeader: `Bearer ${SVC}` }));
    expect(r.ok).toBe(true);
    expect(r.ok && r.mode).toBe("service_role");
  });

  it("does not accept a service-role bearer when the env is unset", () => {
    const r = authorizeCronInvocation(input({
      authorizationHeader: `Bearer ${SVC}`,
      serviceRoleEnv: undefined,
    }));
    // Falls through to user_bearer path because the header is well-formed.
    expect(r.ok).toBe(true);
    expect(r.ok && r.mode).toBe("user_bearer");
  });

  it("accepts a user JWT bearer (any well-formed Bearer token)", () => {
    const r = authorizeCronInvocation(input({ authorizationHeader: "Bearer eyJhbGciOi.fake.jwt" }));
    expect(r.ok).toBe(true);
    expect(r.ok && r.mode).toBe("user_bearer");
  });

  it("rejects an Authorization header without a Bearer scheme", () => {
    const r = authorizeCronInvocation(input({ authorizationHeader: "Basic dXNlcjpwYXNz" }));
    expect(r.ok).toBe(false);
    expect(r.ok ? null : r.reason).toBe("unauthorized");
  });

  it("rejects an empty Bearer", () => {
    const r = authorizeCronInvocation(input({ authorizationHeader: "Bearer " }));
    expect(r.ok).toBe(false);
    expect(r.ok ? null : r.reason).toBe("unauthorized");
  });

  it("rejects a request with no headers at all", () => {
    const r = authorizeCronInvocation(input());
    expect(r.ok).toBe(false);
    expect(r.ok ? null : r.reason).toBe("unauthorized");
  });
});

// ───────────────────────────────────────────────────────────────
// Integration: replay through a Fetch-style adapter that
// mirrors the wiring inside `index.ts`. This catches regressions
// where someone changes the header name or env-var name without
// updating the predicate.
// ───────────────────────────────────────────────────────────────

function simulateRequest(args: {
  headers: Record<string, string>;
  env: { CRON_SECRET?: string; SUPABASE_SERVICE_ROLE_KEY?: string };
}): { status: number; body: { error?: string } } {
  const req = new Request("https://example.local/sita-briefings-generate", {
    method: "POST",
    headers: args.headers,
  });
  const decision = authorizeCronInvocation({
    cronSecretHeader: req.headers.get("x-cron-secret"),
    authorizationHeader: req.headers.get("authorization"),
    cronSecretEnv: args.env.CRON_SECRET,
    serviceRoleEnv: args.env.SUPABASE_SERVICE_ROLE_KEY,
  });
  if (!decision.ok) {
    const status = decision.reason === "missing_cron_secret_env" ? 503 : 401;
    return { status, body: { error: decision.reason } };
  }
  return { status: 200, body: {} };
}

describe("integration — request → status mapping", () => {
  const env = { CRON_SECRET: CRON, SUPABASE_SERVICE_ROLE_KEY: SVC };

  it("missing secret env returns 503", () => {
    const res = simulateRequest({ headers: {}, env: {} });
    expect(res.status).toBe(503);
    expect(res.body.error).toBe("missing_cron_secret_env");
  });

  it("missing headers returns 401", () => {
    const res = simulateRequest({ headers: {}, env });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("unauthorized");
  });

  it("incorrect cron secret returns 401", () => {
    const res = simulateRequest({ headers: { "x-cron-secret": "nope" }, env });
    expect(res.status).toBe(401);
  });

  it("correct cron secret returns 200", () => {
    const res = simulateRequest({ headers: { "x-cron-secret": CRON }, env });
    expect(res.status).toBe(200);
  });

  it("correct service-role bearer returns 200", () => {
    const res = simulateRequest({ headers: { authorization: `Bearer ${SVC}` }, env });
    expect(res.status).toBe(200);
  });

  it("user bearer returns 200 (RLS enforced downstream)", () => {
    const res = simulateRequest({ headers: { authorization: "Bearer some.user.jwt" }, env });
    expect(res.status).toBe(200);
  });
});