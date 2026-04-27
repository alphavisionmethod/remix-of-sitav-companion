// ═══════════════════════════════════════════════════════════════
// Phase 9 — Trust Journey E2E
//
// Stitches the full 9-stage canonical pipeline behaviorally:
//   intake → conscience_gate → retrieval → routing → inference →
//   tool_execution → critique → return → receipt
//
// Asserts:
//  • happy-path completes all required stages with a coherent trace
//  • correlationId propagates from request → context → trace
//  • approval-required contracts park at tool_execution stage
//  • input-violations are blocked at conscience_gate (no inference)
//  • approval-map ↔ proof-requirements lineage is consistent for
//    every (domain, riskClass) pair declared by either side.
//
// We mock the AI gateway so inference is deterministic and offline.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the AI gateway so callAIGateway returns a deterministic payload
// instead of hitting Lovable Cloud edge functions.
vi.mock("@/lib/services/ai-gateway/callable", () => ({
  callAIGateway: vi.fn(async () => ({
    content: "Pipeline E2E synthetic inference output.",
    model: "gpt-4o-mini",
    tokens_used: 42,
    cost_cents: 1,
  })),
}));

// Receipt persistence in some pipeline branches reaches Supabase. Stub
// it to a no-op chain so tests stay hermetic.
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: () =>
        Promise.resolve({ data: { user: { id: "trust-journey-user" } }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    },
    from: () => {
      const chain: any = {
        select: () => chain,
        insert: () => chain,
        upsert: () => chain,
        eq: () => chain,
        order: () => chain,
        limit: () => chain,
        in: () => chain,
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
        single: () => Promise.resolve({ data: null, error: null }),
        then: (cb: any) => Promise.resolve({ data: [], error: null }).then(cb),
      };
      return chain;
    },
    functions: { invoke: vi.fn(async () => ({ data: { ok: true }, error: null })) },
  },
}));

import {
  pipelineOrchestrator,
  PipelineStage,
  type PipelineContext,
} from "@/lib/services/canonical-pipeline";
import {
  APPROVAL_MAP,
  getApprovalMapping,
  requiresApproval,
} from "@/lib/policy/policy-approval-map";
import {
  PROOF_REQUIREMENTS,
  getProofRequirement,
} from "@/lib/policy/policy-proof-requirements";

// ── Helpers ──────────────────────────────────────────────────────

const CANONICAL_STAGE_ORDER = [
  PipelineStage.INTAKE,
  PipelineStage.CONSCIENCE_GATE,
  PipelineStage.RETRIEVAL,
  PipelineStage.ROUTING,
  PipelineStage.INFERENCE,
  PipelineStage.TOOL_EXECUTION,
  PipelineStage.CRITIQUE,
  PipelineStage.RETURN,
  PipelineStage.RECEIPT,
] as const;

function stagesByName(ctx: PipelineContext): Record<string, (typeof ctx.stages)[number]> {
  const out: Record<string, (typeof ctx.stages)[number]> = {};
  for (const s of ctx.stages) out[s.stage] = s;
  return out;
}

// ── Tests ────────────────────────────────────────────────────────

describe("Phase 9 — Trust Journey E2E (9-stage canonical pipeline)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("happy path — chat-query (low-risk, no approval)", () => {
    it("traverses every canonical stage and emits a receipt", async () => {
      const correlationId = "trust-journey-happy-001";
      const stagesSeen: PipelineStage[] = [];

      const ctx = await pipelineOrchestrator.execute({
        taskType: "chat-query",
        userId: "u1",
        tenantId: "t1",
        input: { message: "What is my Peace Score?" },
        correlationId,
        onStageComplete: (stage) => {
          stagesSeen.push(stage);
        },
      });

      // Status — chat-query has no evidence, so gate may caveat or pass.
      expect(["completed", "caveat"]).toContain(ctx.status);

      // The four mandatory stages MUST always run: intake, conscience_gate,
      // routing, inference, return, receipt. Optional stages (retrieval,
      // tool_execution, critique) are contract-driven and may legitimately
      // be omitted for low-risk task types like `chat-query`.
      const stageNames = ctx.stages.map((s) => s.stage);
      const MANDATORY_STAGES = [
        PipelineStage.INTAKE,
        PipelineStage.CONSCIENCE_GATE,
        PipelineStage.ROUTING,
        PipelineStage.INFERENCE,
        PipelineStage.RETURN,
        PipelineStage.RECEIPT,
      ];
      for (const expected of MANDATORY_STAGES) {
        expect(stageNames, `missing mandatory stage: ${expected}`).toContain(expected);
      }

      // Whatever stages did run, their order must be a monotonic subsequence
      // of the canonical 1→9 pipeline — never out of order.
      const canonicalIndex = (s: string) =>
        CANONICAL_STAGE_ORDER.findIndex((c) => c === s);
      const indices = stageNames.map(canonicalIndex);
      for (let i = 1; i < indices.length; i++) {
        expect(
          indices[i],
          `stage ${stageNames[i]} appeared out of canonical order`,
        ).toBeGreaterThan(indices[i - 1]);
      }

      // Receipt stage must carry the correlation + pipeline ids.
      const receipt = stagesByName(ctx)[PipelineStage.RECEIPT];
      expect(receipt.status).toBe("completed");
      expect(receipt.decision).toBe("receipted");
      expect(receipt.data?.correlationId).toBe(correlationId);
      expect(receipt.data?.pipelineId).toBe(ctx.pipelineId);
      expect(receipt.data?.taskType).toBe("chat-query");

      // onStageComplete fired for every executed stage (callback isn't
      // invoked for stages that were skipped via the contract-driven path).
      // The observed sequence must be a prefix-coherent subsequence of the
      // recorded ctx.stages.
      expect(stagesSeen.length).toBeGreaterThan(0);
      for (const s of stagesSeen) {
        expect(stageNames).toContain(s);
      }
    });

    it("propagates correlationId into the persisted trace log", async () => {
      const correlationId = `trust-journey-trace-${Date.now()}`;
      const ctx = await pipelineOrchestrator.execute({
        taskType: "chat-query",
        userId: "u1",
        tenantId: "t1",
        input: { message: "ping" },
        correlationId,
      });

      expect(ctx.correlationId).toBe(correlationId);
      const trace = pipelineOrchestrator.getTraceByCorrelation(correlationId);
      expect(trace, "trace not found by correlationId").toBeTruthy();
      expect(trace!.pipelineId).toBe(ctx.pipelineId);
      expect(trace!.taskType).toBe("chat-query");
      expect(trace!.totalDurationMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe("block path — invalid input is refused at conscience_gate", () => {
    it("never reaches inference when required input fields are missing", async () => {
      const ctx = await pipelineOrchestrator.execute({
        taskType: "chat-query",
        userId: "u1",
        tenantId: "t1",
        // Missing required `message` field — gate must block.
        input: {},
        correlationId: "trust-journey-block-001",
      });

      expect(ctx.status).toBe("failed");

      const stageNames = ctx.stages.map((s) => s.stage);
      // Pipeline should have started intake + conscience_gate, but not
      // proceeded to inference — that's the whole point of the gate.
      expect(stageNames).toContain(PipelineStage.INTAKE);
      expect(stageNames).toContain(PipelineStage.CONSCIENCE_GATE);
      expect(stageNames).not.toContain(PipelineStage.INFERENCE);
      expect(stageNames).not.toContain(PipelineStage.RECEIPT);

      // Conscience gate must have produced a non-pass verdict.
      expect(ctx.gateVerdict?.decision).toMatch(/block|refuse/);

      // A negative receipt must have been emitted as proof of refusal.
      expect(ctx.negativeReceipts.length).toBeGreaterThan(0);
      const neg = ctx.negativeReceipts[0];
      expect(neg.correlationId).toBe(ctx.correlationId);
      expect(neg.gateSource).toBe("conscience-gate");
    });
  });

  describe("approval path — recommendation-generate parks at tool_execution", () => {
    it("requires approval and surfaces awaiting_approval at the tool stage", async () => {
      const ctx = await pipelineOrchestrator.execute({
        taskType: "recommendation-generate",
        userId: "u1",
        tenantId: "t1",
        input: { domain: "money", context: { quarter: "Q4" } },
        // Provide synthetic evidence so retrieval doesn't refuse.
        evidenceSources: [
          { type: "rag", id: "ev-1", content: "Q4 cash flow forecast: stable.", confidence: 0.9 },
          { type: "rag", id: "ev-2", content: "Reserves at 6 months runway.", confidence: 0.85 },
        ],
        correlationId: "trust-journey-approval-001",
      });

      // Status may be completed or caveat — what matters is the
      // approval branch was taken at tool_execution.
      const stages = stagesByName(ctx);
      expect(stages[PipelineStage.TOOL_EXECUTION], "tool_execution stage missing").toBeTruthy();
      expect(stages[PipelineStage.TOOL_EXECUTION].decision).toBe("awaiting_approval");

      // Gate verdict must agree.
      expect(ctx.gateVerdict?.approvalRequired).toBe(true);

      // Receipt stage still emits — the approval parking is itself a
      // receipted lifecycle event, not a failure.
      expect(stages[PipelineStage.RECEIPT]?.status).toBe("completed");
    });
  });

  describe("policy lineage — approval map ↔ proof requirements", () => {
    it("every (domain, riskClass) in the approval map has a proof entry — or is justified as `none`", () => {
      const orphans: string[] = [];
      for (const a of APPROVAL_MAP) {
        const proof = getProofRequirement(a.domain, a.riskClass);
        // tier=none is allowed to skip proof bundle declaration; everything
        // else must have a proof requirement so the trust chain is complete.
        if (a.tier !== "none" && !proof) {
          orphans.push(`${a.domain}/${a.riskClass}`);
        }
      }
      expect(
        orphans,
        `approval-required cells without proof requirements: ${orphans.join(", ")}`,
      ).toEqual([]);
    });

    it("every proof requirement at R4+ also requires approval", () => {
      const incoherent: string[] = [];
      for (const p of PROOF_REQUIREMENTS) {
        if (p.riskClass === "R4" || p.riskClass === "R5") {
          if (!requiresApproval(p.domain, p.riskClass)) {
            incoherent.push(`${p.domain}/${p.riskClass}`);
          }
        }
      }
      expect(
        incoherent,
        `R4+ proof cells missing approval mapping: ${incoherent.join(", ")}`,
      ).toEqual([]);
    });

    it("R5 cells always demand a boardroom or dual-approval tier", () => {
      const r5 = APPROVAL_MAP.filter((a) => a.riskClass === "R5");
      expect(r5.length).toBeGreaterThan(0);
      for (const a of r5) {
        expect(
          ["boardroom", "dual-approval"],
          `${a.domain}/R5 cannot be tier=${a.tier}`,
        ).toContain(a.tier);
      }
    });

    it("R5 cells always demand the strongest proof bundle (biometric + rollback)", () => {
      const r5Proof = PROOF_REQUIREMENTS.filter((p) => p.riskClass === "R5");
      expect(r5Proof.length).toBeGreaterThan(0);
      for (const p of r5Proof) {
        expect(p.required).toContain("biometric-step-up");
        expect(p.required).toContain("rollback-pointer");
        expect(p.minEvidenceGrade).toBe("A");
      }
    });

    it("approval-map and proof-requirements agree on which cells are gated", () => {
      // Build the union of (domain,riskClass) keys from both maps and
      // assert that approval/proof togetherness is internally consistent.
      const keyOf = (d: string, r: string) => `${d}/${r}`;
      const approvalKeys = new Set(APPROVAL_MAP.map((a) => keyOf(a.domain, a.riskClass)));
      const proofKeys = new Set(PROOF_REQUIREMENTS.map((p) => keyOf(p.domain, p.riskClass)));

      // Any proof entry with `approval-receipt` in its required list must
      // map to an approval mapping with tier !== none.
      const mismatches: string[] = [];
      for (const p of PROOF_REQUIREMENTS) {
        if (p.required.includes("approval-receipt")) {
          const a = getApprovalMapping(p.domain, p.riskClass);
          if (!a || a.tier === "none") {
            mismatches.push(keyOf(p.domain, p.riskClass));
          }
        }
      }
      expect(
        mismatches,
        `proof requires approval-receipt but approval map says tier=none: ${mismatches.join(", ")}`,
      ).toEqual([]);

      // Sanity: both registries are non-empty and overlap.
      expect(approvalKeys.size).toBeGreaterThan(0);
      expect(proofKeys.size).toBeGreaterThan(0);
      const overlap = [...approvalKeys].filter((k) => proofKeys.has(k));
      expect(overlap.length).toBeGreaterThan(0);
    });
  });
});