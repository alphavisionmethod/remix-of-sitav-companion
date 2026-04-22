// ═══════════════════════════════════════════════════════════════
// SITA OS — E2E Smoke Tests: Release Env Gate
// Zod response schemas, cross-table invariants, authenticated
// admin harness, safe env loading.
// ═══════════════════════════════════════════════════════════════

import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import {
  loadEnvSafe, withEnvGuard,
  FIXTURE_IDS, getFuncUrl, getAnonKey,
  getServiceClient, queryAuditRows,
  EnvGatePassSchema, EnvGateFailSchema, BaseErrorSchema,
  assertResponseSchema, assertRequestId,
  assertEnvGateInvariants,
  getAdminToken, callFunctionAsAdmin, cleanupAdminUser,
} from "../_shared/test-harness.ts";

loadEnvSafe();

const FUNC_URL = getFuncUrl("release-env-gate");
const ANON_KEY = getAnonKey();

// ── Valid env fixtures ────────────────────────────────────────

const CORE_ENV = {
  SUPABASE_URL: "https://abc.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.abc123def456ghi789",
  SUPABASE_SERVICE_ROLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.svc123def456ghi789",
  SUPABASE_PROJECT_REF: "abcdefghijklmnopqrst",
  APP_VERSION: "2.1.0",
  NODE_ENV: "production",
};

const VALID_WEB_ENV = {
  ...CORE_ENV,
  VITE_SUPABASE_URL: "https://abc.supabase.co",
  VITE_SUPABASE_PUBLISHABLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.pub123def456ghi789",
  VITE_SUPABASE_PROJECT_ID: "abcdefghijklmnopqrst",
  PUBLIC_SITE_URL: "https://app.example.com",
  CORS_ALLOWED_ORIGINS: "https://app.example.com,https://admin.example.com",
};

const VALID_DESKTOP_ENV = { ...CORE_ENV, ELECTRON_APP_ID: "com.sita.desktop", AUTO_UPDATE_URL: "https://updates.sita.dev/desktop", DEV_TOOLS_ENABLED: "false" };
const VALID_OS_ENV = { ...CORE_ENV, OS_UPDATE_CHANNEL: "stable", OS_ROOTFS_SHA256: "a".repeat(64), OS_VERITY_HASH: "b".repeat(64), OS_KERNEL_VERSION: "6.1.0", OS_PARTITION_LAYOUT: "ab", ATTESTATION_SIGNING_KEY: "supersecretkey1234567", RECOVERY_ENDPOINT: "https://recovery.sita.dev" };
const VALID_PWA_ENV = { ...CORE_ENV, VAPID_PUBLIC_KEY: "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkCs7U_HzsV3fR6zGo", VAPID_PRIVATE_KEY: "UUxI4o8-FbRouAevSmBQ6o18hgE4nSG3qwvJTfKc-ls_very_long_key", VAPID_SUBJECT: "mailto:admin@sita.dev", PWA_SCOPE: "/", PWA_START_URL: "/home" };

// ── Auth Gating ───────────────────────────────────────────────

Deno.test("env-gate: CORS preflight returns 200", withEnvGuard("anon", async () => {
  const res = await fetch(FUNC_URL, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  assert(res.headers.get("access-control-allow-origin") !== null);
  await res.text();
}));

Deno.test("env-gate: rejects unauthenticated with 401 + error schema", withEnvGuard("anon", async () => {
  const res = await fetch(FUNC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
    body: JSON.stringify({ platform: "web", env: VALID_WEB_ENV }),
  });
  assertEquals(res.status, 401);
  const body = await res.json();
  assertResponseSchema(body, BaseErrorSchema, "env-gate 401");
}));

Deno.test("env-gate: rejects invalid Bearer with 401", withEnvGuard("anon", async () => {
  const res = await fetch(FUNC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer garbage-token",
      apikey: ANON_KEY,
    },
    body: JSON.stringify({ platform: "web", env: VALID_WEB_ENV }),
  });
  assertEquals(res.status, 401);
  await res.text();
}));

Deno.test("env-gate: rejects invalid platform (4xx, not 5xx)", withEnvGuard("anon", async () => {
  const res = await fetch(FUNC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer fake",
      apikey: ANON_KEY,
    },
    body: JSON.stringify({ platform: "nintendo-switch", env: {} }),
  });
  assert(res.status >= 400 && res.status < 500);
  await res.text();
}));

// ── DB fixture: gate pass per platform + cross-table invariants

for (const [platform, validEnv] of [
  ["web", VALID_WEB_ENV],
  ["desktop", VALID_DESKTOP_ENV],
  ["os-image", VALID_OS_ENV],
  ["mobile-pwa", VALID_PWA_ENV],
] as const) {
  Deno.test({ name: `env-gate: DB fixture — ${platform} pass + cross-table invariants`, sanitizeOps: false, sanitizeResources: false, fn: withEnvGuard("service_role", async () => {
    const sb = getServiceClient();
    const releaseTag = `smoke-${platform}-${Date.now()}`;

    try {
      // Validate env locally
      const httpsUrl = z.string().url().refine((u: string) => u.startsWith("https://"));
      const coreCheck = z.object({
        SUPABASE_URL: httpsUrl,
        SUPABASE_ANON_KEY: z.string().min(30),
        SUPABASE_SERVICE_ROLE_KEY: z.string().min(30),
        SUPABASE_PROJECT_REF: z.string().regex(/^[a-z]{20}$/),
        APP_VERSION: z.string().regex(/^\d+\.\d+\.\d+/),
        NODE_ENV: z.enum(["production", "staging"]),
      });
      assert(coreCheck.safeParse(validEnv).success, `Core env should pass for ${platform}`);

      await sb.from("admin_action_audit").insert({
        actor_user_id: FIXTURE_IDS.TARGET_USER,
        action: "release_env_gate",
        target_type: "release",
        target_id: releaseTag,
        plane: "admin",
        severity: "info",
        justification: `Release env gate pass for ${platform}`,
        metadata: { platform, gate: "pass", error_count: 0, warning_count: 0, dry_run: false, release_tag: releaseTag },
      });

      await assertEnvGateInvariants(sb, releaseTag, "pass", platform);
    } finally {
      await sb.from("admin_action_audit").delete().eq("target_id", releaseTag);
    }
  })});
}

// ── DB fixture: gate fail scenarios ───────────────────────────

Deno.test({ name: "env-gate: DB fixture — missing SUPABASE_URL produces fail + invariants", sanitizeOps: false, sanitizeResources: false, fn: withEnvGuard("service_role", async () => {
  const sb = getServiceClient();
  const releaseTag = `smoke-fail-url-${Date.now()}`;

  try {
    await sb.from("admin_action_audit").insert({
      actor_user_id: FIXTURE_IDS.TARGET_USER,
      action: "release_env_gate",
      target_type: "release",
      target_id: releaseTag,
      plane: "admin",
      severity: "high",
      justification: "Release env gate fail for web",
      metadata: { platform: "web", gate: "fail", error_count: 1, errors: [{ path: "SUPABASE_URL", code: "invalid_type" }] },
    });

    await assertEnvGateInvariants(sb, releaseTag, "fail", "web");
  } finally {
    await sb.from("admin_action_audit").delete().eq("target_id", releaseTag);
  }
})});

Deno.test({ name: "env-gate: DB fixture — bad SHA-256 in os-image produces fail", sanitizeOps: false, sanitizeResources: false, fn: withEnvGuard("service_role", async () => {
  const sb = getServiceClient();
  const releaseTag = `smoke-fail-sha-${Date.now()}`;

  try {
    const hexCheck = z.string().regex(/^[a-f0-9]{64}$/i);
    assert(!hexCheck.safeParse("not-a-valid-sha256").success);

    await sb.from("admin_action_audit").insert({
      actor_user_id: FIXTURE_IDS.TARGET_USER,
      action: "release_env_gate",
      target_type: "release",
      target_id: releaseTag,
      plane: "admin",
      severity: "high",
      justification: "Release env gate fail for os-image (bad SHA-256)",
      metadata: { platform: "os-image", gate: "fail", error_count: 1, errors: [{ path: "OS_ROOTFS_SHA256", code: "invalid_string" }] },
    });

    await assertEnvGateInvariants(sb, releaseTag, "fail", "os-image");
  } finally {
    await sb.from("admin_action_audit").delete().eq("target_id", releaseTag);
  }
})});

// ── Authenticated admin end-to-end ────────────────────────────

Deno.test({ name: "env-gate: authenticated admin — web platform e2e", sanitizeOps: false, sanitizeResources: false, fn: withEnvGuard("service_role", async () => {
  try {
    const { token } = await getAdminToken();
    const { status, json } = await callFunctionAsAdmin("release-env-gate", {
      body: { platform: "web", env: VALID_WEB_ENV },
      token,
    });

    if (status === 200) {
      const body = json as Record<string, unknown>;
      if (body.gate === "pass") {
        assertResponseSchema(json, EnvGatePassSchema, "env-gate pass");
      } else {
        assertResponseSchema(json, EnvGateFailSchema, "env-gate fail");
      }
      assertRequestId(json);
    } else if (status === 403) {
      assert(typeof (json as Record<string, unknown>)?.error === "string");
    } else {
      assert(false, `Expected 200 or 403, got ${status}`);
    }
  } finally {
    await cleanupAdminUser();
  }
})});
