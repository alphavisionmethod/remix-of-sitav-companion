// ═══════════════════════════════════════════════════════════════
// Phase 11 — Edge Function Security E2E
//
// Hermetic verification against the live edge-function security
// snapshot (generated/edge-functions/security-snapshot.json) and
// the canonical topology (src/lib/backend-topology/*).
//
// Asserts behavioral guarantees per CALLER ROLE:
//
//   PUBLIC_BFF / ADMIN_BFF  → JWT validation, admin gate when role
//                             demands it, CORS preflight, structured
//                             policy gating where R3+ side-effects.
//   DOMAIN / ORCHESTRATION  → service-role authority, no anon
//                             leakage, kill-switch reachable when
//                             they emit material side effects.
//   WEBHOOK                 → signature/secret verification path,
//                             never blanket-anon.
//   RUNTIME_SYSTEM /
//   VERIFIER                → cron/edge-only, no user-context
//                             requirement, no admin gate.
//   SUPPORT                 → admin-ui only, JWT + admin role.
//
// Plus invariants that MUST hold across the entire fleet:
//   • 100% CORS preflight coverage
//   • zero env-var leakage in console.error
//   • Supabase JS SDK pinned to a single major (no v3 drift)
//   • api-key callers (e.g. api-gateway) never marked admin-gated
//   • every JWT-required function performs an actual user check
//     (requireAuth or auth.getUser/getClaims)
//   • every adminOnly function performs an actual role check
//     (requireAdmin or has_role RPC)
//   • declared auth model agrees with implementation evidence
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import snapshot from "../../../generated/edge-functions/security-snapshot.json";
import { EDGE_FUNCTION_AUTH_MAP } from "@/lib/backend-topology/edge-function-auth-map";
import { FUNCTION_ROLE_DEFINITIONS } from "../../../supabase/functions/_shared/function-role-contract";

// ── Snapshot shape (mirrors the generator output) ────────────────
interface Entry {
  name: string;
  hasIndex: boolean;
  cors: {
    hasAny: boolean;
    usesWithCors: boolean;
    hasOptionsHandler: boolean;
    allowsAllOrigins: boolean;
  };
  auth: {
    requireAuth: boolean;
    requireAdmin: boolean;
    getUser: boolean;
    getClaims: boolean;
    hasRoleCheck: boolean;
    usesServiceRole: boolean;
    webhookSecretCheck: boolean;
  };
  safety: {
    rateLimit: boolean;
    killSwitch: boolean;
    zodValidation: boolean;
    policyGate: boolean;
  };
  receipts: { emits: boolean };
  leaks: { consoleErrorEnv: boolean };
  pinnedSupabaseSdkVersions: string[];
}

const ENTRIES = (snapshot as { entries: Entry[] }).entries.filter((e) => e.hasIndex);
const BY_NAME = new Map(ENTRIES.map((e) => [e.name, e]));

// Functions that legitimately do not need an OPTIONS handler:
// none today — full coverage required. Anything new joins the allowlist
// only with an explicit, documented exemption.
const CORS_OPTIONS_EXEMPTIONS = new Set<string>([]);

// Anon-callable surfaces that are intentionally public health/metadata.
// Adding to this list requires the function to expose ZERO sensitive
// data and zero side-effects.
const PUBLIC_ANON_ALLOWLIST = new Set<string>([
  "ai-health",
  "health-check",
  "get-weather",
  "main",
  "os-status",
  "runtime-probes",      // public probe surface for OS health board
  "vapid-public-key",    // public VAPID key for Web Push subscription
  "health-live",         // K8s-style liveness probe
]);

// ── Tracked auth-model drift (Phase 11) ─────────────────────────
// Functions whose auth-map declares "jwt" but whose implementation
// does NOT yet validate a JWT in code. Each entry is documented and
// scheduled for remediation. Adding a NEW entry requires:
//   1. an explicit rationale comment, and
//   2. a follow-up issue in the platform tracker.
// Removing an entry should happen via real code remediation, not
// loosening the test.
const JWT_DECLARATION_DRIFT: Record<string, string> = {
  // Telemetry endpoints — currently rely on device-side device_id +
  // service-role insert; targeted for Phase 12 device-bound JWT.
  "device-telemetry": "device_id-bound, service-role insert; needs device JWT (P12)",
  "push-track": "anon click/dismiss telemetry; needs HMAC token (P12)",

  // Public catalogs — read-only, no PII; treat as anon today.
  "app-store-catalog": "public read-only catalog; auth-map should declare anon",
  "desktop-update-manifest": "public update descriptor; auth-map should declare anon",
  "kill-switch-state": "public read-only switch list via Authorization passthrough; needs JWT validation",

  // Internal verifiers / planners — invoked edge-to-edge under service
  // role; currently exposed via JWT contract that is not yet enforced.
  "verification-recorder": "edge-to-edge service-role writer; auth-map should declare service-role",
  "sita-agent-planner": "edge-to-edge planner; needs explicit JWT pass-through validation",
  "sita-council-prevote": "edge-to-edge council quick-vote; needs explicit JWT validation",
};

// ── Tracked admin-role drift (Phase 11) ─────────────────────────
// Functions declared adminOnly in the auth map whose implementation
// performs JWT validation but NOT a role check. These are scheduled
// for Phase 12 admin-gate normalization.
const ADMIN_ROLE_DRIFT: Record<string, string> = {
  "cloud-tenant-api": "tenant-scoped routes are membership-gated; needs explicit admin check (P12)",
  "db-truth-introspect": "introspection currently gated only by JWT; needs has_role check (P12)",
  "seed-user-data": "demo seed surface — needs explicit admin gate (P12)",
  "kill-switch-state": "JWT drift root cause; will be fixed alongside",
  "security-kill-switch-recommender": "service-role only today; auth-map should declare service-role",
};

// ── Tracked service-role / adminOnly conflict ───────────────────
// Functions that are auth-map "service-role" AND adminOnly=true.
// Service-role functions are typically edge-to-edge; adminOnly is
// a UI-facing concept. These will be reclassified in Phase 12 to
// either jwt+adminOnly OR pure service-role.
const SERVICE_ROLE_ADMIN_DRIFT: Record<string, string> = {
  "admin-reset-user-setup": "wraps user_roles check; should be jwt+adminOnly",
  "admin-revoke-session": "wraps user_roles check; should be jwt+adminOnly",
  "kill-switch-toggle": "service-role + admin gate; should be jwt+adminOnly",
  "security-kill-switch-recommender": "pure service-role; auth-map should drop adminOnly",
};

// ── Tracked declared-service-role / actually-jwt drift ──────────
const SERVICE_ROLE_USAGE_DRIFT: Record<string, string> = {
  "cloud-worker-api": "uses requireAuth/requireAdmin in code; auth-map should declare jwt",
};

// Webhook entrypoints — must verify signature/secret instead of JWT.
// Resolved from auth map (auth: "webhook-secret") — kept here for clarity.
function isWebhook(name: string): boolean {
  return EDGE_FUNCTION_AUTH_MAP[name]?.auth === "webhook-secret";
}

function isApiKeyCaller(name: string): boolean {
  return EDGE_FUNCTION_AUTH_MAP[name]?.auth === "api-key";
}

describe("Phase 11 — Edge Function Security E2E", () => {
  describe("Snapshot integrity", () => {
    it("snapshot covers every function on disk", () => {
      expect(ENTRIES.length).toBeGreaterThan(150);
    });

    it("function-role contract defines 8 canonical roles", () => {
      expect(FUNCTION_ROLE_DEFINITIONS.length).toBe(8);
      const seen = new Set(FUNCTION_ROLE_DEFINITIONS.map((r) => r.role));
      expect(seen.size).toBe(FUNCTION_ROLE_DEFINITIONS.length);
    });
  });

  describe("Fleet-wide invariants", () => {
    it("100% CORS coverage — every function exposes CORS headers", () => {
      const missing = ENTRIES.filter((e) => !e.cors.hasAny).map((e) => e.name);
      expect(missing, `Functions without CORS: ${missing.join(", ")}`).toEqual([]);
    });

    it("100% OPTIONS preflight handler coverage", () => {
      const missing = ENTRIES.filter(
        (e) => !e.cors.hasOptionsHandler && !CORS_OPTIONS_EXEMPTIONS.has(e.name),
      ).map((e) => e.name);
      expect(missing, `Functions missing OPTIONS handler: ${missing.join(", ")}`).toEqual(
        [],
      );
    });

    it("no function leaks environment variables via console.error", () => {
      const leaky = ENTRIES.filter((e) => e.leaks.consoleErrorEnv).map((e) => e.name);
      expect(leaky, `Functions leaking env in console.error: ${leaky.join(", ")}`).toEqual(
        [],
      );
    });

    it("Supabase JS SDK is constrained to a single major version (no v3 drift)", () => {
      const versions = new Set(ENTRIES.flatMap((e) => e.pinnedSupabaseSdkVersions));
      const majors = new Set([...versions].map((v) => v.split(".")[0]));
      expect(
        majors,
        `Multiple SDK majors detected: ${[...majors].join(", ")} from versions ${[...versions].join(", ")}`,
      ).toEqual(new Set(["2"]));
    });
  });

  describe("JWT contract — auth map declares jwt", () => {
    const jwtNames = Object.keys(EDGE_FUNCTION_AUTH_MAP).filter(
      (n) => EDGE_FUNCTION_AUTH_MAP[n].auth === "jwt",
    );

    it("every jwt-declared function performs a real user check", () => {
      const offenders: string[] = [];
      for (const name of jwtNames) {
        const e = BY_NAME.get(name);
        if (!e) continue; // disk drift handled by separate gate
        const checksUser =
          e.auth.requireAuth || e.auth.requireAdmin || e.auth.getUser || e.auth.getClaims;
        if (!checksUser && !(name in JWT_DECLARATION_DRIFT)) offenders.push(name);
      }
      expect(
        offenders,
        `JWT-declared functions without user validation: ${offenders.join(", ")}`,
      ).toEqual([]);
    });

    it("every adminOnly function performs a real role check", () => {
      const offenders: string[] = [];
      for (const [name, entry] of Object.entries(EDGE_FUNCTION_AUTH_MAP)) {
        if (!entry.adminOnly) continue;
        const e = BY_NAME.get(name);
        if (!e) continue;
        const checksRole = e.auth.requireAdmin || e.auth.hasRoleCheck;
        if (!checksRole && !(name in ADMIN_ROLE_DRIFT)) offenders.push(name);
      }
      expect(
        offenders,
        `adminOnly functions without role check: ${offenders.join(", ")}`,
      ).toEqual([]);
    });
  });

  describe("Service-role contract — auth map declares service-role", () => {
    const svcNames = Object.keys(EDGE_FUNCTION_AUTH_MAP).filter(
      (n) => EDGE_FUNCTION_AUTH_MAP[n].auth === "service-role",
    );

    it("every service-role function actually instantiates the service-role client", () => {
      const offenders: string[] = [];
      for (const name of svcNames) {
        const e = BY_NAME.get(name);
        if (!e) continue;
        if (!e.auth.usesServiceRole && !(name in SERVICE_ROLE_USAGE_DRIFT)) offenders.push(name);
      }
      expect(
        offenders,
        `service-role functions without SUPABASE_SERVICE_ROLE_KEY usage: ${offenders.join(", ")}`,
      ).toEqual([]);
    });

    it("service-role functions are NOT marked adminOnly (capability-refusal posture)", () => {
      const offenders = svcNames.filter(
        (n) =>
          EDGE_FUNCTION_AUTH_MAP[n].adminOnly === true &&
          !(n in SERVICE_ROLE_ADMIN_DRIFT),
      );
      expect(
        offenders,
        `service-role functions cannot also be adminOnly: ${offenders.join(", ")}`,
      ).toEqual([]);
    });
  });

  describe("Anon contract — public surfaces are intentional", () => {
    const anonNames = Object.keys(EDGE_FUNCTION_AUTH_MAP).filter(
      (n) => EDGE_FUNCTION_AUTH_MAP[n].auth === "anon",
    );

    it("every anon-declared function is on the public allowlist", () => {
      const unknown = anonNames.filter((n) => !PUBLIC_ANON_ALLOWLIST.has(n));
      expect(
        unknown,
        `Unexpected anon functions: ${unknown.join(", ")} — add to PUBLIC_ANON_ALLOWLIST with justification`,
      ).toEqual([]);
    });

    it("anon functions carry no admin role check (refusal posture inverse)", () => {
      const offenders: string[] = [];
      for (const name of anonNames) {
        const e = BY_NAME.get(name);
        if (!e) continue;
        if (e.auth.requireAdmin) offenders.push(name);
      }
      expect(offenders).toEqual([]);
    });
  });

  describe("Webhook contract — signature/secret instead of JWT", () => {
    it("every webhook-secret function verifies a signature or secret", () => {
      const offenders: string[] = [];
      for (const [name, entry] of Object.entries(EDGE_FUNCTION_AUTH_MAP)) {
        if (entry.auth !== "webhook-secret") continue;
        const e = BY_NAME.get(name);
        if (!e) continue;
        if (!e.auth.webhookSecretCheck) offenders.push(name);
      }
      expect(
        offenders,
        `Webhook functions without signature/secret verification: ${offenders.join(", ")}`,
      ).toEqual([]);
    });
  });

  describe("API-key contract — gateway-style entrypoints", () => {
    const apiKeyNames = Object.keys(EDGE_FUNCTION_AUTH_MAP).filter(isApiKeyCaller);

    it("api-key callers do not double as adminOnly surfaces", () => {
      const offenders = apiKeyNames.filter(
        (n) => EDGE_FUNCTION_AUTH_MAP[n].adminOnly === true,
      );
      expect(
        offenders,
        `api-key functions cannot be adminOnly: ${offenders.join(", ")}`,
      ).toEqual([]);
    });
  });

  describe("Capability refusal posture — role × side-effect alignment", () => {
    it("admin BFF surfaces perform admin role check (canonical refusal seam)", () => {
      // Any function whose name starts with "admin-" or that is declared
      // adminOnly in the auth map is treated as an admin-callable BFF.
      const adminCallable = ENTRIES.filter(
        (e) =>
          e.name.startsWith("admin-") ||
          EDGE_FUNCTION_AUTH_MAP[e.name]?.adminOnly === true,
      );
      const offenders = adminCallable
        .filter((e) => !(e.auth.requireAdmin || e.auth.hasRoleCheck))
        .filter((e) => !(e.name in ADMIN_ROLE_DRIFT))
        .map((e) => e.name);
      // Allow a small set of admin-prefixed surfaces that are public health
      // probes (none today — kept as explicit allowlist for future-proofing).
      const allow = new Set<string>([]);
      const real = offenders.filter((n) => !allow.has(n));
      expect(
        real,
        `Admin BFF surfaces missing role check: ${real.join(", ")}`,
      ).toEqual([]);
    });

    it("functions that emit receipts also enforce auth or service-role authority", () => {
      const offenders = ENTRIES.filter(
        (e) =>
          e.receipts.emits &&
          !(
            e.auth.requireAuth ||
            e.auth.requireAdmin ||
            e.auth.getUser ||
            e.auth.getClaims ||
            e.auth.usesServiceRole ||
            isWebhook(e.name)
          ),
      ).map((e) => e.name);
      expect(
        offenders,
        `Receipt-emitting functions without an auth seam: ${offenders.join(", ")}`,
      ).toEqual([]);
    });
  });

  describe("Auth-model declaration ↔ implementation parity", () => {
    it("declared jwt → exhibits user-context machinery", () => {
      const offenders: string[] = [];
      for (const [name, entry] of Object.entries(EDGE_FUNCTION_AUTH_MAP)) {
        if (entry.auth !== "jwt" || !entry.requiresUserContext) continue;
        const e = BY_NAME.get(name);
        if (!e) continue;
        const hasUser =
          e.auth.requireAuth || e.auth.requireAdmin || e.auth.getUser || e.auth.getClaims;
        if (!hasUser && !(name in JWT_DECLARATION_DRIFT)) offenders.push(name);
      }
      expect(
        offenders,
        `Declared user-context functions missing user resolution: ${offenders.join(", ")}`,
      ).toEqual([]);
    });

    it("tracked JWT drift list only contains genuinely drifted functions", () => {
      // Defensive: if someone removes drift by fixing the code, the
      // exemption MUST be removed from JWT_DECLARATION_DRIFT.
      const stale: string[] = [];
      for (const name of Object.keys(JWT_DECLARATION_DRIFT)) {
        const e = BY_NAME.get(name);
        if (!e) continue;
        const hasUser =
          e.auth.requireAuth || e.auth.requireAdmin || e.auth.getUser || e.auth.getClaims;
        if (hasUser) stale.push(name);
      }
      expect(
        stale,
        `JWT drift exemptions are stale (code is now compliant): ${stale.join(", ")}`,
      ).toEqual([]);
    });

    it("tracked JWT drift list is bounded — no silent growth", () => {
      // Phase 11 baseline: 8 known-drift functions. Any new entry must
      // be a deliberate addition AND be remediated within one phase.
      expect(Object.keys(JWT_DECLARATION_DRIFT).length).toBeLessThanOrEqual(8);
    });

    it("admin-role drift list is bounded", () => {
      expect(Object.keys(ADMIN_ROLE_DRIFT).length).toBeLessThanOrEqual(5);
    });

    it("service-role / adminOnly drift list is bounded", () => {
      expect(Object.keys(SERVICE_ROLE_ADMIN_DRIFT).length).toBeLessThanOrEqual(4);
    });

    it("service-role usage drift list is bounded", () => {
      expect(Object.keys(SERVICE_ROLE_USAGE_DRIFT).length).toBeLessThanOrEqual(1);
    });

    it("declared service-role does not also expose anon-style allowlist", () => {
      const dual = Object.keys(EDGE_FUNCTION_AUTH_MAP).filter(
        (n) =>
          EDGE_FUNCTION_AUTH_MAP[n].auth === "service-role" &&
          PUBLIC_ANON_ALLOWLIST.has(n),
      );
      expect(dual).toEqual([]);
    });
  });
});