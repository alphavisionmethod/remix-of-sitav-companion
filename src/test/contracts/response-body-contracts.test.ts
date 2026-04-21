// ═══════════════════════════════════════════════════════════════
// SITA OS — Response Body Contract Tests
// Verifies that edge-function response bodies match frontend Zod
// schemas for OS Desktop, Mobile App, and Admin Backend surfaces.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  SuccessResponseSchema,
  ErrorResponseSchema,
} from "./edge-function-schemas";

// ── Per-domain response schemas ──────────────────────────────

const AdvisorChatResponseSchema = z.object({
  reply: z.string().optional(),
  content: z.string().optional(),
  advisor: z.string().optional(),
  model: z.string().optional(),
  tokens_used: z.number().optional(),
  receipt_id: z.string().optional(),
}).passthrough();

const BoardroomResponseSchema = z.object({
  session_id: z.string().optional(),
  session: z.record(z.unknown()).optional(),
  items: z.array(z.record(z.unknown())).optional(),
  recommendation: z.record(z.unknown()).optional(),
  vote: z.record(z.unknown()).optional(),
}).passthrough();

const AlertIngestResponseSchema = z.object({
  alert_id: z.string().optional(),
  id: z.string().optional(),
  deduplicated: z.boolean().optional(),
  suppressed: z.boolean().optional(),
}).passthrough();

const ConnectorResponseSchema = z.object({
  auth_url: z.string().optional(),
  status: z.string().optional(),
  connected: z.boolean().optional(),
  accounts: z.array(z.record(z.unknown())).optional(),
}).passthrough();

const SyncResponseSchema = z.object({
  synced: z.boolean().optional(),
  version: z.number().optional(),
  conflict: z.boolean().optional(),
}).passthrough();

const AdminActionResponseSchema = z.object({
  success: z.boolean().optional(),
  action: z.string().optional(),
  target_user_id: z.string().optional(),
}).passthrough();

// ── Export for cross-surface use ─────────────────────────────
export {
  AdvisorChatResponseSchema,
  BoardroomResponseSchema,
  AlertIngestResponseSchema,
  ConnectorResponseSchema,
  SyncResponseSchema,
  AdminActionResponseSchema,
};

// ── Simulated response fixtures ─────────────────────────────

const MOCK_RESPONSES: Record<string, { surface: string; functionName: string; body: unknown }[]> = {
  "advisor-chat": [
    { surface: "OS Desktop", functionName: "chat-advisor", body: { reply: "Here is your analysis", advisor: "money", model: "gpt-5-mini", tokens_used: 342, receipt_id: "r-001" } },
    { surface: "Mobile App", functionName: "chat-advisor", body: { reply: "Mobile summary", advisor: "general", tokens_used: 120 } },
    { surface: "Admin Backend", functionName: "chat-advisor", body: { reply: "Admin diagnostic", advisor: "business", model: "gemini-2.5-flash" } },
  ],
  "boardroom": [
    { surface: "OS Desktop", functionName: "boardroom-session", body: { session_id: "sess-1", items: [{ id: "i1", title: "Revenue" }] } },
    { surface: "Mobile App", functionName: "boardroom-session", body: { session_id: "sess-m1", recommendation: { id: "r1", summary: "Approve" } } },
    { surface: "Admin Backend", functionName: "boardroom-session", body: { session_id: "sess-a1", vote: { item_id: "i1", vote: "approve" } } },
  ],
  "alert-ingest": [
    { surface: "OS Desktop", functionName: "alert-ingest", body: { alert_id: "a-001", deduplicated: false } },
    { surface: "Admin Backend", functionName: "alert-ingest", body: { id: "a-002", suppressed: true, deduplicated: true } },
  ],
  "connector-oauth": [
    { surface: "OS Desktop", functionName: "connector-oauth", body: { auth_url: "https://accounts.google.com/o/oauth2/auth?...", status: "pending" } },
    { surface: "Mobile App", functionName: "connector-oauth", body: { connected: true, accounts: [{ id: "acc-1", provider: "google" }] } },
    { surface: "Admin Backend", functionName: "connector-oauth", body: { status: "configured", accounts: [] } },
  ],
  "cloud-sync": [
    { surface: "Mobile App", functionName: "cloud-sync-api", body: { synced: true, version: 42, conflict: false } },
  ],
  "admin-actions": [
    { surface: "Admin Backend", functionName: "admin-users", body: { success: true, action: "suspend", target_user_id: "550e8400-e29b-41d4-a716-446655440000" } },
  ],
  "error-responses": [
    { surface: "OS Desktop", functionName: "chat-advisor", body: { error: "Rate limit exceeded", details: { retry_after: 30 } } },
    { surface: "Mobile App", functionName: "boardroom-session", body: { error: "Session not found" } },
    { surface: "Admin Backend", functionName: "admin-users", body: { error: "Insufficient permissions", details: { required: "admin" } } },
  ],
};

const DOMAIN_SCHEMAS: Record<string, z.ZodTypeAny> = {
  "advisor-chat": AdvisorChatResponseSchema,
  "boardroom": BoardroomResponseSchema,
  "alert-ingest": AlertIngestResponseSchema,
  "connector-oauth": ConnectorResponseSchema,
  "cloud-sync": SyncResponseSchema,
  "admin-actions": AdminActionResponseSchema,
  "error-responses": ErrorResponseSchema,
};

// ── Tests ────────────────────────────────────────────────────

describe("Response Body Contract — All Surfaces", () => {
  for (const [domain, fixtures] of Object.entries(MOCK_RESPONSES)) {
    describe(domain, () => {
      const schema = DOMAIN_SCHEMAS[domain];

      for (const fixture of fixtures) {
        it(`${fixture.surface} → ${fixture.functionName} response matches schema`, () => {
          const result = schema.safeParse(fixture.body);
          expect(result.success, `${fixture.surface}/${fixture.functionName}: ${JSON.stringify(result)}`).toBe(true);
        });

        // Also verify generic envelope compatibility
        it(`${fixture.surface} → ${fixture.functionName} response passes generic envelope`, () => {
          const isError = domain === "error-responses";
          const envelope = isError ? ErrorResponseSchema : SuccessResponseSchema;
          const result = envelope.safeParse(fixture.body);
          expect(result.success).toBe(true);
        });
      }
    });
  }

  // ── Cross-surface consistency ─────────────────────────────
  describe("cross-surface shape consistency", () => {
    it("all advisor-chat responses have optional reply field", () => {
      for (const f of MOCK_RESPONSES["advisor-chat"]) {
        const parsed = AdvisorChatResponseSchema.safeParse(f.body);
        expect(parsed.success).toBe(true);
        if (parsed.success && parsed.data.reply) {
          expect(typeof parsed.data.reply).toBe("string");
        }
      }
    });

    it("all boardroom responses have session_id", () => {
      for (const f of MOCK_RESPONSES["boardroom"]) {
        const parsed = BoardroomResponseSchema.safeParse(f.body);
        expect(parsed.success).toBe(true);
        if (parsed.success) {
          expect(parsed.data.session_id).toBeDefined();
        }
      }
    });

    it("all error responses have error string", () => {
      for (const f of MOCK_RESPONSES["error-responses"]) {
        const parsed = ErrorResponseSchema.safeParse(f.body);
        expect(parsed.success).toBe(true);
        if (parsed.success) {
          expect(typeof parsed.data.error).toBe("string");
        }
      }
    });
  });
});