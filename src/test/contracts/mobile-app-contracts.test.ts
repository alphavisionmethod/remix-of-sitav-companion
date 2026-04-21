// ═══════════════════════════════════════════════════════════════
// SITA Mobile App — Frontend↔Edge Function Contract Tests
// Verifies that payloads from mobile pages match edge function schemas.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import {
  ChatAdvisorRequestSchema,
  BoardroomSessionRequestSchema,
  CloudSyncPushSchema,
  AlertIngestRequestSchema,
  ConnectorOAuthInitiateSchema,
} from "./edge-function-schemas";

describe("Mobile App → Edge Function Contract Alignment", () => {

  // ── Mobile AI Chat (chat-advisor / advisor-conversation) ──
  describe("mobile-ai-chat → chat-advisor", () => {
    it("accepts mobile chat payload", () => {
      const payload = {
        messages: [{ role: "user" as const, content: "Quick summary of my week" }],
        advisor: "general",
        context: { source: "mobile-chat" },
      };
      expect(ChatAdvisorRequestSchema.safeParse(payload).success).toBe(true);
    });

    it("accepts minimal mobile payload (defaults applied)", () => {
      const payload = {
        messages: [{ role: "user" as const, content: "Hi" }],
      };
      const result = ChatAdvisorRequestSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.advisor).toBe("general");
    });
  });

  // ── Mobile Boardroom ──────────────────────────────────────
  describe("mobile-boardroom → boardroom-session", () => {
    it("accepts mobile assemble payload", () => {
      const payload = { action: "assemble" as const, payload: { mobile: true } };
      expect(BoardroomSessionRequestSchema.safeParse(payload).success).toBe(true);
    });

    it("accepts mobile vote payload", () => {
      const payload = {
        action: "vote" as const,
        session_id: "sess-m-1",
        item_id: "item-m-1",
        payload: { vote: "approve" },
      };
      expect(BoardroomSessionRequestSchema.safeParse(payload).success).toBe(true);
    });
  });

  // ── Mobile Sync ───────────────────────────────────────────
  describe("mobile-sync → cloud-sync-api", () => {
    it("accepts valid push payload", () => {
      const payload = {
        namespace: "settings",
        type: "preferences",
        payload: { theme: "dark" },
        device_id: "iphone-14-abc",
        content_hash: "abc123",
      };
      expect(CloudSyncPushSchema.safeParse(payload).success).toBe(true);
    });

    it("rejects push without namespace", () => {
      const payload = { type: "preferences", payload: {} };
      expect(CloudSyncPushSchema.safeParse(payload).success).toBe(false);
    });

    it("rejects push without type", () => {
      const payload = { namespace: "settings", payload: {} };
      expect(CloudSyncPushSchema.safeParse(payload).success).toBe(false);
    });
  });

  // ── Mobile Alerts (read-only — verifies response schema) ──
  describe("mobile-alerts → alert-ingest (write contract)", () => {
    it("validates alert shape for mobile notification generation", () => {
      const payload = {
        source: "mobile-push",
        severity: "medium" as const,
        subsystem: "notifications",
        title: "New approval pending",
        metadata: { approval_id: "apr-123", mobile: true },
      };
      expect(AlertIngestRequestSchema.safeParse(payload).success).toBe(true);
    });
  });

  // ── Mobile Connector (connect flow) ───────────────────────
  describe("mobile-connectors → connector-oauth", () => {
    it("accepts mobile initiate connector payload", () => {
      const payload = {
        action: "initiate" as const,
        connector_id: "google",
        redirect_uri: "https://app.sita.os/mobile/callback",
      };
      expect(ConnectorOAuthInitiateSchema.safeParse(payload).success).toBe(true);
    });

    it("rejects initiate without connector_id", () => {
      const payload = { action: "initiate" as const, connector_id: "" };
      expect(ConnectorOAuthInitiateSchema.safeParse(payload).success).toBe(false);
    });
  });
});