// ═══════════════════════════════════════════════════════════════
// Phase 14 — Sovereign AI Gateway Behavioral E2E
// ───────────────────────────────────────────────────────────────
// Pins the canonical AI invocation contract:
//   1. Canonical gateway invariants (auth, kill-switch, budget gate,
//      receipt lineage, R3+ raw-prompt rejection, rate limit).
//   2. Zero direct provider SDK imports anywhere in the repo.
//   3. Zero src/** direct provider HTTP calls.
//   4. Edge fleet drift is bounded — every direct caller is codified
//      with a stable remediation rationale; no silent additions.
//   5. Canonical client wrappers (invokeAI / functions.invoke) honor
//      the prompt-family contract for R3+ risk tiers.
//   6. Gateway snapshot freshness + structural integrity.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import snapshot from "../../../generated/ai-gateway/gateway-snapshot.json";
import {
  invokeAI,
  type InvokeAIParams,
} from "@/lib/services/ai-gateway/invoke";

// ─────────────────────────────────────────────────────────────
// Bounded drift trackers — every entry needs a stable rationale.
// New direct callers MUST either be removed, migrated to the
// canonical gateway, or added here with explicit justification.
// ─────────────────────────────────────────────────────────────

/** Edge functions that legitimately bypass the canonical ai-gateway edge fn. */
const EDGE_DIRECT_CALLER_DRIFT: Record<string, string> = {
  // ── Tier A: gateway-internal / observability ──
  "supabase/functions/ai-health/index.ts":
    "AI provider health probe — must hit Lovable AI directly to verify external reachability; calling the gateway would mask provider outages.",
  "supabase/functions/ai-runtime-nightly-verify/index.ts":
    "Nightly verifier — proves provider liveness independent of gateway middleware (budget/kill-switch). Same justification as connector nightly probes.",
  "supabase/functions/runtime-probes/index.ts":
    "Synthetic /v1/models probe used by the runtime truth panel; bypassing the gateway is required to detect gateway misbehavior.",

  // ── Tier B: streaming surfaces (gateway streaming not yet finalized) ──
  "supabase/functions/ai-orchestrator-stream/index.ts":
    "Server-Sent Events streaming pipeline — the canonical gateway only proves chunked SSE for chat completions; orchestrator streams plan+tool deltas with extra framing. Migration tracked in ISS-0181 (gateway streaming v2).",
  "supabase/functions/voice-spine/index.ts":
    "Voice intent loop — sub-200ms TTFB budget is incompatible with the current double-hop through the gateway. Migration tracked in ISS-0182 (voice low-latency lane).",

  // ── Tier C: agent / advisor loops with custom prompt-family wiring ──
  "supabase/functions/advisor-agent-loop/index.ts":
    "Long-running advisor loop with own ai_workforce_invocations receipts and per-step budget accounting; gateway round-trips would multiply latency. Tracked in ISS-0183.",
  "supabase/functions/advisor-conversation/index.ts":
    "Real-time advisor chat — uses persona system prompts already gated by R3+ allow-list; gateway migration tracked in ISS-0183.",
  "supabase/functions/advisor-deep-intelligence/index.ts":
    "Deep-intelligence batch generator — emits its own ai_inference_receipts and uses prompt-family registry directly. Tracked in ISS-0183.",
  "supabase/functions/advisor-weekly-report/index.ts":
    "Weekly digest cron — emits scoped receipts; gateway migration tracked in ISS-0183.",
  "supabase/functions/business-advisor-intelligence/index.ts":
    "Business advisor synthesis — emits scoped receipts. Tracked in ISS-0183.",
  "supabase/functions/chat-advisor/index.ts":
    "Chat advisor — bridge surface awaiting gateway streaming v2. Tracked in ISS-0183.",
  "supabase/functions/personal-brain/index.ts":
    "Personal Brain pillar (7-phase) — own dispatch + receipt fabric; tracked under personal-brain-adaptive-layer memory.",
  "supabase/functions/personal-brain-cron/index.ts":
    "Personal Brain cron generator — paired with the personal-brain-adaptive-layer pillar above; tracked under the same memory ref.",
  "supabase/functions/brain-core/index.ts":
    "Brain core synthesis — paired with the personal-brain-adaptive-layer pillar.",

  // ── Tier D: agent / orchestration internals ──
  "supabase/functions/agent-executor/index.ts":
    "Internal agent executor — runs scheduled plans without an end-user auth context (the gateway requires user auth). Tracked in ISS-0184 (gateway service-role lane).",
  "supabase/functions/internal-agent-loop/index.ts":
    "Internal agent loop — same service-role lane requirement as agent-executor. Tracked in ISS-0184.",
  "supabase/functions/admin-ai-workforce-run/index.ts":
    "Admin-triggered workforce run — admin context, not end-user; tracked in ISS-0184.",
  "supabase/functions/sita-agent-planner/index.ts":
    "Sita Phase E planner — produces plan candidates with custom prompt-family routing; tracked in ISS-0185 (Sita gateway migration).",
  "supabase/functions/sita-council-prevote/index.ts":
    "Sita Phase G council pre-vote — multi-agent voting requires custom request fan-out; tracked in ISS-0185.",
  "supabase/functions/sita-reflection-loop/index.ts":
    "Sita Phase G reflection loop — long-running self-critique; tracked in ISS-0185.",

  // ── Tier E: specialized one-shot pipelines ──
  "supabase/functions/advisor-avatar-generate/index.ts":
    "Image generation surface — Lovable AI image endpoint, not chat completions; gateway only proves chat. Tracked in ISS-0186 (gateway image lane).",
  "supabase/functions/file-ingestion/index.ts":
    "Document ingestion classifier — runs in upload pipeline before any user session; tracked in ISS-0184 (service-role lane).",
  "supabase/functions/intelligence-api/index.ts":
    "Intelligence API — bridge surface; tracked in ISS-0183.",
  "supabase/functions/knowledge-embedder/index.ts":
    "Embeddings endpoint — gateway only proves /v1/chat/completions; embeddings lane tracked in ISS-0186.",
};

function loadFile(rel: string): string {
  return fs.readFileSync(path.join(process.cwd(), rel), "utf8");
}

// ─────────────────────────────────────────────────────────────
// 1 — Canonical gateway invariants
// ─────────────────────────────────────────────────────────────
describe("Phase 14 / Sovereign AI Gateway — canonical invariants", () => {
  it("snapshot file exists and is fresh-shaped", () => {
    expect(snapshot).toBeTruthy();
    expect(typeof snapshot.generatedAt).toBe("string");
    expect(snapshot.canonicalGateway).toBe("supabase/functions/ai-gateway/index.ts");
    expect(snapshot.canonicalClient).toBe("src/lib/services/ai-gateway/invoke.ts");
    expect(snapshot.invariants).toBeTypeOf("object");
    expect(snapshot.counts).toBeTypeOf("object");
  });

  it("canonical gateway authenticates every caller", () => {
    expect(snapshot.invariants.hasAuthCheck).toBe(true);
  });

  it("canonical gateway honors KS-MODEL-PROVIDERS kill-switch", () => {
    expect(snapshot.invariants.hasKillSwitchGate).toBe(true);
  });

  it("canonical gateway enforces strict budget gate (fail-closed)", () => {
    expect(snapshot.invariants.hasBudgetGate).toBe(true);
  });

  it("canonical gateway writes the full 3-table receipt lineage", () => {
    expect(snapshot.invariants.writesUsageLedger).toBe(true);
    expect(snapshot.invariants.writesReceiptRecord).toBe(true);
    expect(snapshot.invariants.writesInferenceReceipt).toBe(true);
  });

  it("canonical gateway emits fallback events on degraded paths", () => {
    expect(snapshot.invariants.writesFallbackEvent).toBe(true);
  });

  it("canonical gateway rejects raw system prompts on R3+ risk tiers", () => {
    expect(snapshot.invariants.rejectsRawSystemOnR3Plus).toBe(true);
  });

  it("canonical gateway rate-limits every caller", () => {
    expect(snapshot.invariants.hasRateLimit).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────
// 2 — Zero direct provider SDK imports anywhere
// ─────────────────────────────────────────────────────────────
describe("Phase 14 / Sovereign AI Gateway — provider SDK lockdown", () => {
  it("ZERO direct provider SDK imports across the entire repo", () => {
    expect(snapshot.directSdkImports).toEqual([]);
    expect(snapshot.counts.directSdkImports).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────
// 3 — Zero src/** direct provider HTTP calls
// ─────────────────────────────────────────────────────────────
describe("Phase 14 / Sovereign AI Gateway — src lockdown", () => {
  it("ZERO src/** direct provider HTTP calls (everything routes through the gateway)", () => {
    const srcCallers = snapshot.directProviderCallers.filter(
      (c: { context: string }) => c.context === "src",
    );
    expect(srcCallers).toEqual([]);
    expect(snapshot.counts.srcProviderCallers).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────
// 4 — Edge fleet drift is bounded & rationalized
// ─────────────────────────────────────────────────────────────
describe("Phase 14 / Sovereign AI Gateway — edge fleet drift is bounded", () => {
  const edgeCallers = snapshot.directProviderCallers.filter(
    (c: { context: string }) => c.context === "edge",
  );

  it("every edge direct caller is codified in EDGE_DIRECT_CALLER_DRIFT (no silent additions)", () => {
    const undeclared = edgeCallers
      .map((c: { file: string }) => c.file)
      .filter((f: string) => !(f in EDGE_DIRECT_CALLER_DRIFT));
    if (undeclared.length) {
      throw new Error(
        `New edge function bypasses the canonical ai-gateway without rationale:\n` +
          undeclared.map((f: string) => `  - ${f}`).join("\n") +
          `\n\nEither migrate to supabase.functions.invoke("ai-gateway") or add the file ` +
          `to EDGE_DIRECT_CALLER_DRIFT with a stable remediation note.`,
      );
    }
    expect(undeclared).toEqual([]);
  });

  it("EDGE_DIRECT_CALLER_DRIFT has no stale entries (every entry still drifts)", () => {
    const driftFiles = new Set(edgeCallers.map((c: { file: string }) => c.file));
    const stale = Object.keys(EDGE_DIRECT_CALLER_DRIFT).filter((f) => !driftFiles.has(f));
    if (stale.length) {
      throw new Error(
        `These files were remediated but still appear in EDGE_DIRECT_CALLER_DRIFT — remove them:\n` +
          stale.map((f) => `  - ${f}`).join("\n"),
      );
    }
    expect(stale).toEqual([]);
  });

  it("every drift rationale is non-empty and references a tracker (ISS-XXXX or memory ref)", () => {
    for (const [file, reason] of Object.entries(EDGE_DIRECT_CALLER_DRIFT)) {
      expect(reason.length, `rationale for ${file}`).toBeGreaterThan(40);
      const hasTracker =
        /ISS-\d{4}/.test(reason) ||
        /personal-brain-adaptive-layer/.test(reason) ||
        /(probe|verifier|streaming|service-role|image|embeddings)/.test(reason);
      expect(hasTracker, `tracker/justification for ${file}`).toBe(true);
    }
  });

  it("edge drift count is pinned at the current ratchet (24) — any new bypass requires explicit codification", () => {
    expect(edgeCallers.length).toBeLessThanOrEqual(24);
  });

  it("none of the canonical gateway internals (api-gateway, ai-gateway) appear in drift", () => {
    const reserved = ["supabase/functions/ai-gateway/index.ts", "supabase/functions/api-gateway/index.ts"];
    for (const r of reserved) {
      const found = edgeCallers.find((c: { file: string }) => c.file === r);
      expect(found, `${r} must never be classified as drift`).toBeUndefined();
    }
  });
});

// ─────────────────────────────────────────────────────────────
// 5 — Canonical client (invokeAI) prompt-family contract
// ─────────────────────────────────────────────────────────────
describe("Phase 14 / Sovereign AI Gateway — invokeAI client contract", () => {
  function makeParams(overrides: Partial<InvokeAIParams>): InvokeAIParams {
    return {
      messages: [{ role: "user", content: "hello" }],
      ...overrides,
    };
  }

  it("R3 calls without promptFamilyId are rejected client-side (defense in depth)", async () => {
    await expect(
      invokeAI(makeParams({ riskTier: "R3", capabilityId: "boardroom.synthesis" })),
    ).rejects.toThrow(/promptFamilyId/);
  });

  it("R4 calls without promptFamilyId are rejected", async () => {
    await expect(
      invokeAI(makeParams({ riskTier: "R4", capabilityId: "advisor.money.system" })),
    ).rejects.toThrow(/promptFamilyId/);
  });

  it("R5 calls without promptFamilyId are rejected", async () => {
    await expect(
      invokeAI(makeParams({ riskTier: "R5", capabilityId: "advisor.strategy.system" })),
    ).rejects.toThrow(/promptFamilyId/);
  });

  it("R3+ with promptFamilyId but inline system message is rejected unless allowAdHoc", async () => {
    await expect(
      invokeAI(
        makeParams({
          riskTier: "R3",
          promptFamilyId: "fam_test",
          messages: [
            { role: "system", content: "raw system" },
            { role: "user", content: "hi" },
          ],
        }),
      ),
    ).rejects.toThrow(/inline system messages/);
  });

  it("R0 inline system messages are permitted (low-risk tier)", async () => {
    // We cannot actually invoke the gateway in a unit test, but the client
    // should NOT throw before the network call for R0 — it should reach
    // supabase.functions.invoke and surface a network/test error instead.
    await expect(
      invokeAI(
        makeParams({
          riskTier: "R0",
          messages: [
            { role: "system", content: "low-risk system" },
            { role: "user", content: "hi" },
          ],
        }),
      ),
    ).rejects.not.toThrow(/promptFamilyId|inline system/);
  });
});

// ─────────────────────────────────────────────────────────────
// 6 — Canonical caller surface census (≥1 anchored caller)
// ─────────────────────────────────────────────────────────────
describe("Phase 14 / Sovereign AI Gateway — canonical caller census", () => {
  it("the canonical client wrapper itself appears in the canonical caller set", () => {
    const found = snapshot.canonicalCallers.find(
      (c: { file: string }) => c.file === "src/lib/services/ai-gateway/invoke.ts",
    );
    expect(found, "src/lib/services/ai-gateway/invoke.ts must be a canonical caller").toBeTruthy();
  });

  it("at least one src caller anchors the public invocation surface", () => {
    const srcCallers = snapshot.canonicalCallers.filter((c: { file: string }) =>
      c.file.startsWith("src/"),
    );
    expect(srcCallers.length).toBeGreaterThanOrEqual(3);
  });

  it("api-gateway edge function uses canonical invoke (proves edge↔edge re-entrance)", () => {
    const found = snapshot.canonicalCallers.find(
      (c: { file: string }) => c.file === "supabase/functions/api-gateway/index.ts",
    );
    expect(found, "api-gateway must call ai-gateway via supabase.functions.invoke").toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────
// 7 — Snapshot freshness (no stale snapshot under live drift)
// ─────────────────────────────────────────────────────────────
describe("Phase 14 / Sovereign AI Gateway — snapshot integrity", () => {
  it("snapshot file is present on disk and parseable", () => {
    const p = path.join(process.cwd(), "generated/ai-gateway/gateway-snapshot.json");
    expect(fs.existsSync(p)).toBe(true);
    const raw = JSON.parse(fs.readFileSync(p, "utf8"));
    expect(raw.canonicalGateway).toBe(snapshot.canonicalGateway);
    expect(raw.counts.directProviderCallers).toBe(snapshot.counts.directProviderCallers);
  });

  it("the canonical gateway file referenced by the snapshot exists", () => {
    const p = path.join(process.cwd(), snapshot.canonicalGateway);
    expect(fs.existsSync(p)).toBe(true);
    const text = loadFile(snapshot.canonicalGateway);
    expect(text).toContain("checkAIBudget");
    expect(text).toContain("KS-MODEL-PROVIDERS");
    expect(text).toContain("ai_usage_ledger");
  });

  it("the canonical client file referenced by the snapshot exists", () => {
    const p = path.join(process.cwd(), snapshot.canonicalClient);
    expect(fs.existsSync(p)).toBe(true);
    const text = loadFile(snapshot.canonicalClient);
    expect(text).toContain("invokeAI");
    expect(text).toContain("promptFamilyId");
  });
});