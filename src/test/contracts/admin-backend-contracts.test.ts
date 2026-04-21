// ═══════════════════════════════════════════════════════════════
// SITA Admin Backend — Frontend↔Edge Function Contract Tests
// Verifies that payloads from admin pages match edge function schemas.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import {
  AdminUsersActionSchema,
  KillSwitchToggleRequestSchema,
  AdminResetUserSetupSchema,
  AdminRevokeSessionSchema,
  ConnectorBatchRequestSchema,
  ConnectorOAuthCheckConfigSchema,
  ConnectorOAuthReconnectSchema,
  BrainCoreRequestSchema,
  ProductionLaunchAttestorSchema,
  AlertIngestRequestSchema,
} from "./edge-function-schemas";

describe("Admin Backend → Edge Function Contract Alignment", () => {

  // ── admin-users ───────────────────────────────────────────
  describe("UserManagement → admin-users", () => {
    it("accepts suspend action", () => {
      const payload = {
        action: "suspend" as const,
        target_user_id: "550e8400-e29b-41d4-a716-446655440000",
      };
      expect(AdminUsersActionSchema.safeParse(payload).success).toBe(true);
    });

    it("accepts assign_role with role field", () => {
      const payload = {
        action: "assign_role" as const,
        target_user_id: "550e8400-e29b-41d4-a716-446655440000",
        role: "admin",
      };
      expect(AdminUsersActionSchema.safeParse(payload).success).toBe(true);
    });

    it("rejects invalid action", () => {
      const payload = { action: "delete", target_user_id: "550e8400-e29b-41d4-a716-446655440000" };
      expect(AdminUsersActionSchema.safeParse(payload).success).toBe(false);
    });

    it("rejects non-uuid target_user_id", () => {
      const payload = { action: "suspend" as const, target_user_id: "user123" };
      expect(AdminUsersActionSchema.safeParse(payload).success).toBe(false);
    });
  });

  // ── kill-switch-toggle ────────────────────────────────────
  describe("KillSwitchCenter → kill-switch-toggle", () => {
    it("accepts valid toggle payload", () => {
      const payload = {
        switchId: "KS-AI-GATEWAY",
        enable: false,
        reason: "Investigating elevated error rates",
      };
      expect(KillSwitchToggleRequestSchema.safeParse(payload).success).toBe(true);
    });

    it("accepts toggle with expiration", () => {
      const payload = {
        switchId: "KS-CHAOS",
        enable: true,
        reason: "Enabling for game day drill",
        expiresInMinutes: 60,
        severity: "high",
      };
      expect(KillSwitchToggleRequestSchema.safeParse(payload).success).toBe(true);
    });

    it("rejects missing reason", () => {
      const payload = { switchId: "KS-AI-GATEWAY", enable: false };
      expect(KillSwitchToggleRequestSchema.safeParse(payload).success).toBe(false);
    });

    it("rejects missing switchId", () => {
      const payload = { switchId: "", enable: true, reason: "test" };
      expect(KillSwitchToggleRequestSchema.safeParse(payload).success).toBe(false);
    });
  });

  // ── admin-reset-user-setup ────────────────────────────────
  describe("AdminOps → admin-reset-user-setup", () => {
    it("accepts valid reset payload", () => {
      const payload = { target_user_id: "550e8400-e29b-41d4-a716-446655440000" };
      expect(AdminResetUserSetupSchema.safeParse(payload).success).toBe(true);
    });

    it("rejects non-uuid", () => {
      const payload = { target_user_id: "abc" };
      expect(AdminResetUserSetupSchema.safeParse(payload).success).toBe(false);
    });
  });

  // ── admin-revoke-session ──────────────────────────────────
  describe("AdminOps → admin-revoke-session", () => {
    it("accepts revoke with reason", () => {
      const payload = {
        target_user_id: "550e8400-e29b-41d4-a716-446655440000",
        reason: "Security incident — forced logout",
      };
      expect(AdminRevokeSessionSchema.safeParse(payload).success).toBe(true);
    });

    it("accepts revoke without reason", () => {
      const payload = { target_user_id: "550e8400-e29b-41d4-a716-446655440000" };
      expect(AdminRevokeSessionSchema.safeParse(payload).success).toBe(true);
    });
  });

  // ── connector-batch (admin sync-all) ──────────────────────
  describe("ConnectorGovernance → connector-batch", () => {
    it("accepts admin sync-all payload", () => {
      const payload = {
        action: "submit" as const,
        operations: [
          { type: "sync", connector_type: "google" },
          { type: "sync", connector_type: "stripe" },
        ],
      };
      expect(ConnectorBatchRequestSchema.safeParse(payload).success).toBe(true);
    });
  });

  // ── connector-oauth (admin check_config / reconnect) ─────
  describe("ConnectorReality → connector-oauth", () => {
    it("accepts check_config payload", () => {
      const payload = { action: "check_config" as const };
      expect(ConnectorOAuthCheckConfigSchema.safeParse(payload).success).toBe(true);
    });

    it("accepts reconnect payload", () => {
      const payload = {
        action: "reconnect" as const,
        account_id: "550e8400-e29b-41d4-a716-446655440000",
      };
      expect(ConnectorOAuthReconnectSchema.safeParse(payload).success).toBe(true);
    });
  });

  // ── brain-core (admin AI recommendations) ─────────────────
  describe("AITBoards → brain-core", () => {
    it("accepts generate_recommendations payload", () => {
      const payload = {
        intent: "generate_recommendations",
        advisor: "general" as const,
        context: { scope: "all_domains", include_low_scoring: true },
      };
      expect(BrainCoreRequestSchema.safeParse(payload).success).toBe(true);
    });

    it("accepts analyze_truth_gaps payload", () => {
      const payload = {
        intent: "analyze_truth_gaps",
        advisor: "business" as const,
        context: { low_scoring_indices: [], overall_score: 85 },
      };
      expect(BrainCoreRequestSchema.safeParse(payload).success).toBe(true);
    });

    it("rejects intent exceeding max length", () => {
      const payload = {
        intent: "a".repeat(256),
        advisor: "general" as const,
      };
      expect(BrainCoreRequestSchema.safeParse(payload).success).toBe(false);
    });
  });

  // ── production-launch-attestor ────────────────────────────
  describe("ProductionLaunchAttestation → production-launch-attestor", () => {
    it("accepts valid attestation payload", () => {
      const payload = {
        surface_key: "web",
        posture: "green" as const,
        justification: "All gates passing",
      };
      expect(ProductionLaunchAttestorSchema.safeParse(payload).success).toBe(true);
    });

    it("rejects invalid posture", () => {
      const payload = { surface_key: "web", posture: "purple" };
      expect(ProductionLaunchAttestorSchema.safeParse(payload).success).toBe(false);
    });
  });

  // ── alert-ingest (admin manual alert) ─────────────────────
  describe("AlertsDashboard → alert-ingest", () => {
    it("accepts admin-generated alert", () => {
      const payload = {
        source: "admin-manual",
        severity: "critical" as const,
        subsystem: "billing",
        title: "Payment processor degraded",
        description: "Stripe returning 503 for 15min",
        runbook_id: "RB-005",
      };
      expect(AlertIngestRequestSchema.safeParse(payload).success).toBe(true);
    });
  });
});