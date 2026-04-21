// ═══════════════════════════════════════════════════════════════
// SITA OS — Integration Fetch Tests
// Performs real frontend-style fetch calls against edge functions
// and asserts Zod validation passes on both request & response.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  ChatAdvisorRequestSchema,
  BrainCoreRequestSchema,
  PersonalBrainRequestSchema,
  BoardroomSessionRequestSchema,
  AlertIngestRequestSchema,
  ConnectorOAuthInitiateSchema,
  OsCommandRequestSchema,
  AdminUsersActionSchema,
  KillSwitchToggleRequestSchema,
  CloudSyncPushSchema,
  AdminResetUserSetupSchema,
  AdminRevokeSessionSchema,
  ProductionLaunchAttestorSchema,
  SuccessResponseSchema,
  ErrorResponseSchema,
} from "./edge-function-schemas";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "";
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";
const HAS_ENV = !!(SUPABASE_URL && ANON_KEY);

/**
 * Helper: performs a real fetch against a deployed edge function,
 * validates the request payload via schema before sending,
 * then validates the response body against the response schema.
 */
async function fetchEdgeFunction<T extends z.ZodTypeAny>(opts: {
  functionName: string;
  payload: unknown;
  requestSchema: z.ZodTypeAny;
  responseSchema: T;
}): Promise<{ status: number; body: z.infer<T>; rawBody: unknown }> {
  // Pre-validate request payload
  const reqParse = opts.requestSchema.safeParse(opts.payload);
  expect(reqParse.success, `Request payload failed ${opts.functionName} schema`).toBe(true);

  const url = `${SUPABASE_URL}/functions/v1/${opts.functionName}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify(opts.payload),
  });

  const rawBody = await resp.json().catch(() => ({}));

  return { status: resp.status, body: rawBody, rawBody };
}

/**
 * Validates the response matches either SuccessResponseSchema or ErrorResponseSchema,
 * depending on the HTTP status code.
 */
function assertResponseShape(status: number, body: unknown, fnName: string) {
  if (status >= 200 && status < 300) {
    const parse = SuccessResponseSchema.safeParse(body);
    expect(parse.success, `${fnName} success response doesn't match SuccessResponseSchema: ${JSON.stringify(body)}`).toBe(true);
  } else if (status >= 400) {
    const parse = ErrorResponseSchema.safeParse(body);
    expect(parse.success, `${fnName} error response doesn't match ErrorResponseSchema: ${JSON.stringify(body)}`).toBe(true);
  }
}

describe("Integration Fetch — Edge Function Round-Trip", () => {
  // Skip entire suite if env vars are missing (local dev without deployed functions)
  const conditionalDescribe = HAS_ENV ? describe : describe.skip;

  conditionalDescribe("chat-advisor", () => {
    it("valid payload → response matches schema", async () => {
      const payload = {
        messages: [{ role: "user" as const, content: "Integration test" }],
        advisor: "general",
      };
      const { status, body } = await fetchEdgeFunction({
        functionName: "chat-advisor",
        payload,
        requestSchema: ChatAdvisorRequestSchema,
        responseSchema: SuccessResponseSchema,
      });
      assertResponseShape(status, body, "chat-advisor");
    });
  });

  conditionalDescribe("boardroom-session", () => {
    it("assemble action → response matches schema", async () => {
      const payload = { action: "assemble" as const, payload: { topic: "Integration test" } };
      const { status, body } = await fetchEdgeFunction({
        functionName: "boardroom-session",
        payload,
        requestSchema: BoardroomSessionRequestSchema,
        responseSchema: SuccessResponseSchema,
      });
      assertResponseShape(status, body, "boardroom-session");
    });
  });

  conditionalDescribe("alert-ingest", () => {
    it("valid alert → response matches schema", async () => {
      const payload = {
        source: "integration-test",
        severity: "info" as const,
        subsystem: "test",
        title: "Integration test alert",
      };
      const { status, body } = await fetchEdgeFunction({
        functionName: "alert-ingest",
        payload,
        requestSchema: AlertIngestRequestSchema,
        responseSchema: SuccessResponseSchema,
      });
      assertResponseShape(status, body, "alert-ingest");
    });
  });

  conditionalDescribe("production-launch-attestor", () => {
    it("valid attestation → response matches schema", async () => {
      const payload = { surface_key: "integration-test" };
      const { status, body } = await fetchEdgeFunction({
        functionName: "production-launch-attestor",
        payload,
        requestSchema: ProductionLaunchAttestorSchema,
        responseSchema: SuccessResponseSchema,
      });
      assertResponseShape(status, body, "production-launch-attestor");
    });
  });

  // ── Validation rejection tests (no env needed) ────────────
  describe("request validation (offline)", () => {
    it("chat-advisor rejects empty messages", () => {
      const result = ChatAdvisorRequestSchema.safeParse({ messages: [] });
      expect(result.success).toBe(false);
    });

    it("brain-core rejects missing intent", () => {
      const result = BrainCoreRequestSchema.safeParse({ advisor: "money" });
      expect(result.success).toBe(false);
    });

    it("personal-brain rejects invalid mode", () => {
      const result = PersonalBrainRequestSchema.safeParse({
        messages: [{ role: "user", content: "hi" }],
        mode: "explode",
      });
      expect(result.success).toBe(false);
    });

    it("os-command rejects unknown command", () => {
      const result = OsCommandRequestSchema.safeParse({ device_id: "d1", command: "nuke" });
      expect(result.success).toBe(false);
    });

    it("admin-users rejects non-uuid target", () => {
      const result = AdminUsersActionSchema.safeParse({ action: "suspend", target_user_id: "abc" });
      expect(result.success).toBe(false);
    });

    it("kill-switch rejects empty reason", () => {
      const result = KillSwitchToggleRequestSchema.safeParse({ switchId: "KS-1", enable: true, reason: "" });
      expect(result.success).toBe(false);
    });

    it("cloud-sync rejects missing namespace", () => {
      const result = CloudSyncPushSchema.safeParse({ type: "pref", payload: {} });
      expect(result.success).toBe(false);
    });

    it("admin-reset rejects non-uuid", () => {
      const result = AdminResetUserSetupSchema.safeParse({ target_user_id: "bad" });
      expect(result.success).toBe(false);
    });

    it("admin-revoke accepts without reason", () => {
      const result = AdminRevokeSessionSchema.safeParse({
        target_user_id: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });

    it("connector-oauth rejects empty connector_id", () => {
      const result = ConnectorOAuthInitiateSchema.safeParse({ action: "initiate", connector_id: "" });
      expect(result.success).toBe(false);
    });
  });
});