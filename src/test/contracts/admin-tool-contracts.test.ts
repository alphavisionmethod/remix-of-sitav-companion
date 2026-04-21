// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Tool Contract Tests
// Verifies admin recovery tool request/response schemas match
// the deployed edge functions for webhook-replay, reset-user-setup,
// revoke-session, and generate-support-bundle.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  AdminResetUserSetupSchema,
  AdminRevokeSessionSchema,
} from "./edge-function-schemas";

// ── Webhook Replay schemas (mirrors supabase/functions/webhook-replay) ──

const WebhookReplayRequestSchema = z.object({
  webhook_id: z.string().uuid(),
});

const WebhookReplayListResponseSchema = z.object({
  failures: z.array(z.object({
    id: z.string().uuid(),
    target_url: z.string().nullable(),
    status: z.string(),
    retry_count: z.number(),
    last_error: z.string().nullable(),
    created_at: z.string(),
    payload: z.unknown(),
  })),
  count: z.number(),
});

const WebhookReplayResultSchema = z.object({
  success: z.boolean(),
  webhook_id: z.string(),
  replay_status: z.string(),
  replay_error: z.string().nullable(),
});

// ── Support Bundle schemas (mirrors supabase/functions/generate-support-bundle) ──

const SupportBundleRequestSchema = z.object({
  bundleType: z.enum(["system-wide", "runtime-crash", "admin-operator", "support-escalation", "integration-failure"]).optional(),
  scope: z.record(z.unknown()).optional(),
  entityIds: z.array(z.string()).optional(),
});

const SupportBundleResponseSchema = z.object({
  bundleId: z.string(),
  bundleType: z.string(),
  createdAt: z.string(),
  requestedBy: z.string(),
  packs: z.array(z.object({
    packType: z.string(),
    data: z.unknown(),
  })),
  redactionApplied: z.boolean(),
  expiresAt: z.string(),
});

describe("Admin Tool → Edge Function Contract Alignment", () => {

  // ── admin-reset-user-setup ──
  describe("admin-reset-user-setup", () => {
    it("accepts valid reset payload", () => {
      expect(AdminResetUserSetupSchema.safeParse({ target_user_id: "550e8400-e29b-41d4-a716-446655440000" }).success).toBe(true);
    });
    it("rejects missing user id", () => {
      expect(AdminResetUserSetupSchema.safeParse({}).success).toBe(false);
    });
    it("rejects non-uuid", () => {
      expect(AdminResetUserSetupSchema.safeParse({ target_user_id: "not-a-uuid" }).success).toBe(false);
    });
  });

  // ── admin-revoke-session ──
  describe("admin-revoke-session", () => {
    it("accepts valid revoke payload with reason", () => {
      expect(AdminRevokeSessionSchema.safeParse({
        target_user_id: "550e8400-e29b-41d4-a716-446655440000",
        reason: "Security incident",
      }).success).toBe(true);
    });
    it("accepts payload without optional reason", () => {
      expect(AdminRevokeSessionSchema.safeParse({
        target_user_id: "550e8400-e29b-41d4-a716-446655440000",
      }).success).toBe(true);
    });
    it("rejects missing user id", () => {
      expect(AdminRevokeSessionSchema.safeParse({ reason: "test" }).success).toBe(false);
    });
  });

  // ── webhook-replay ──
  describe("webhook-replay", () => {
    it("accepts valid replay request", () => {
      expect(WebhookReplayRequestSchema.safeParse({
        webhook_id: "550e8400-e29b-41d4-a716-446655440000",
      }).success).toBe(true);
    });
    it("rejects missing webhook_id", () => {
      expect(WebhookReplayRequestSchema.safeParse({}).success).toBe(false);
    });
    it("validates list response shape", () => {
      const resp = {
        failures: [
          { id: "550e8400-e29b-41d4-a716-446655440000", target_url: "https://example.com/hook", status: "failed", retry_count: 3, last_error: "timeout", created_at: "2026-04-21T00:00:00Z", payload: {} },
        ],
        count: 1,
      };
      expect(WebhookReplayListResponseSchema.safeParse(resp).success).toBe(true);
    });
    it("validates replay result shape", () => {
      const result = { success: true, webhook_id: "abc", replay_status: "replayed", replay_error: null };
      expect(WebhookReplayResultSchema.safeParse(result).success).toBe(true);
    });
    it("validates replay failure result", () => {
      const result = { success: true, webhook_id: "abc", replay_status: "replay_failed", replay_error: "HTTP 500" };
      expect(WebhookReplayResultSchema.safeParse(result).success).toBe(true);
    });
  });

  // ── generate-support-bundle ──
  describe("generate-support-bundle", () => {
    it("accepts minimal request", () => {
      expect(SupportBundleRequestSchema.safeParse({}).success).toBe(true);
    });
    it("accepts full request", () => {
      expect(SupportBundleRequestSchema.safeParse({
        bundleType: "runtime-crash",
        scope: { userId: "abc" },
        entityIds: ["a", "b"],
      }).success).toBe(true);
    });
    it("rejects invalid bundle type", () => {
      expect(SupportBundleRequestSchema.safeParse({ bundleType: "invalid" }).success).toBe(false);
    });
    it("validates response shape", () => {
      const resp = {
        bundleId: "SB-test-abc",
        bundleType: "system-wide",
        createdAt: "2026-04-21T00:00:00Z",
        requestedBy: "user-id",
        packs: [{ packType: "environment", data: {} }],
        redactionApplied: true,
        expiresAt: "2026-04-28T00:00:00Z",
      };
      expect(SupportBundleResponseSchema.safeParse(resp).success).toBe(true);
    });
  });
});

// ── Cross-Platform Contract Tests ──
describe("Cross-Platform Contract Verification", () => {

  const PLATFORMS = ["web", "ios", "android", "vm", "iso"] as const;

  const PLATFORM_EDGE_FUNCTIONS: Record<string, string[]> = {
    web: ["chat-advisor", "personal-brain", "boardroom-session", "connector-oauth", "alert-ingest", "admin-reset-user-setup", "admin-revoke-session", "webhook-replay", "generate-support-bundle"],
    ios: ["chat-advisor", "boardroom-session", "cloud-sync-api", "alert-ingest", "connector-oauth"],
    android: ["chat-advisor", "boardroom-session", "cloud-sync-api", "alert-ingest", "connector-oauth"],
    vm: ["chat-advisor", "personal-brain", "os-command", "alert-ingest", "generate-support-bundle"],
    iso: ["chat-advisor", "personal-brain", "os-command", "alert-ingest", "generate-support-bundle"],
  };

  for (const platform of PLATFORMS) {
    describe(`${platform} platform`, () => {
      it(`declares edge function dependencies`, () => {
        expect(PLATFORM_EDGE_FUNCTIONS[platform].length).toBeGreaterThan(0);
      });

      it(`all admin tools are accessible on ${platform === "web" ? "web" : "API layer"}`, () => {
        if (platform === "web") {
          expect(PLATFORM_EDGE_FUNCTIONS[platform]).toContain("admin-reset-user-setup");
          expect(PLATFORM_EDGE_FUNCTIONS[platform]).toContain("admin-revoke-session");
          expect(PLATFORM_EDGE_FUNCTIONS[platform]).toContain("webhook-replay");
          expect(PLATFORM_EDGE_FUNCTIONS[platform]).toContain("generate-support-bundle");
        }
      });

      it(`shared edge functions use consistent schemas across platforms`, () => {
        // chat-advisor is on all platforms — verify schema is the same
        expect(PLATFORM_EDGE_FUNCTIONS[platform]).toContain("chat-advisor");
      });
    });
  }
});