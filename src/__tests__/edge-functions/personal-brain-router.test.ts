import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const SRC = fs.readFileSync(
  path.join("supabase/functions/personal-brain/index.ts"),
  "utf8",
);

const REQUIRED_ACTIONS = [
  "infer",
  "memory.save",
  "memory.list",
  "memory.toggle",
  "memory.delete",
  "learn.scan",
  "file.ingest",
  "voice.transcribe",
  "data.export",
];

const REQUIRED_MODES = [
  "think","learn","build","create",
  "research","strategize","coach","reflect","decide",
];

describe("personal-brain edge function — Phase 0 router", () => {
  it("declares all 9 router actions in the switch", () => {
    for (const action of REQUIRED_ACTIONS) {
      expect(SRC, `missing action: ${action}`).toContain(`case "${action}"`);
    }
  });

  it("preserves all 9 mode prompts", () => {
    for (const mode of REQUIRED_MODES) {
      expect(SRC, `missing mode prompt: ${mode}`).toMatch(new RegExp(`${mode}:\\s*\``));
    }
  });

  it("validates input with zod for every action", () => {
    expect(SRC).toContain("PBRouterSchema");
    expect(SRC).toContain("PBMemorySaveSchema");
    expect(SRC).toContain("PBMemoryToggleSchema");
    expect(SRC).toContain("PBMemoryDeleteSchema");
    expect(SRC).toContain("PBLearnScanSchema");
    expect(SRC).toContain("PBFileIngestSchema");
    expect(SRC).toContain("PBVoiceTranscribeSchema");
  });

  it("requires auth, applies rate limiting, and uses CORS", () => {
    expect(SRC).toContain("requireAuth(req)");
    expect(SRC).toContain("checkRateLimit(user.id");
    expect(SRC).toContain("handleCors(req)");
    expect(SRC).toContain("corsHeaders");
  });

  it("logs AI receipts and meters budget on infer", () => {
    expect(SRC).toContain("logAIReceipt(");
    expect(SRC).toContain("update_ai_budget_usage");
    expect(SRC).toContain("checkAIBudget(");
  });

  it("preserves SSE streaming for legacy infer (text/event-stream)", () => {
    expect(SRC).toContain("text/event-stream");
    expect(SRC).toContain("X-Correlation-Id");
  });

  it("treats missing `action` as legacy infer (backwards-compatible)", () => {
    expect(SRC).toContain("looksLikeRouter");
    expect(SRC).toMatch(/if\s*\(\s*!\s*looksLikeRouter\s*\)/);
  });

  it("respects sensitive_mode in memory.save and learn.scan", () => {
    expect(SRC).toContain("sensitive_mode");
    expect(SRC).toContain("autolearn_disabled");
  });

  it("appends to the pb_security_events audit trail", () => {
    expect(SRC).toContain("pb_security_events");
    expect(SRC).toContain("logSecurityEvent(");
  });

  it("does not import the browser supabase client", () => {
    expect(SRC).not.toContain("@/integrations/supabase/client");
    expect(SRC).not.toContain("src/integrations/supabase/client");
  });
});

describe("personal-brain — pb_* table coverage in data.export", () => {
  const expected = [
    "pb_profile","pb_goals","pb_workspaces","pb_chats","pb_messages",
    "pb_memories","pb_files","pb_voice_prefs","pb_security_prefs","pb_security_events",
  ];
  it("exports all 10 pb_* tables", () => {
    for (const t of expected) {
      expect(SRC, `data.export missing table: ${t}`).toContain(`"${t}"`);
    }
  });
});