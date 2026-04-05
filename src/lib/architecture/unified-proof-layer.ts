// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified Proof Layer
// One proof system: audit-ledger, proof-orchestrator, receipts,
// refusal-receipts, evidence-bundles, immutable-events,
// replayable-projections
// ═══════════════════════════════════════════════════════════════

export type ProofType =
  | "execution-receipt"
  | "refusal-receipt"
  | "approval-proof"
  | "evidence-bundle"
  | "immutable-event"
  | "audit-entry"
  | "replay-snapshot";

export type EvidenceGrade = "verified" | "attested" | "observed" | "inferred" | "claimed";

export interface ProofRecord {
  proofId: string;
  type: ProofType;
  tenantId: string;
  actorId: string;
  targetId?: string;
  targetType?: string;
  evidenceGrade: EvidenceGrade;
  contentHash: string;
  payload: Record<string, unknown>;
  sourceChain: string[];       // ordered list of proof IDs forming the chain
  immutable: boolean;
  replayable: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface EvidenceBundle {
  bundleId: string;
  missionId?: string;
  changePlanId?: string;
  proofIds: string[];
  summary: string;
  confidenceScore: number;
  format: "json" | "markdown" | "pr-ready" | "compliance";
  createdAt: string;
}

export interface ReplayableProjection {
  projectionId: string;
  entityType: string;
  entityId: string;
  eventSequence: string[];    // ordered immutable-event IDs
  currentState: Record<string, unknown>;
  lastRebuiltAt: string;
  staleness: "fresh" | "stale" | "rebuilding";
}

// ── Proof Layer API ─────────────────────────────────────────

export function createProofRecord(
  type: ProofType,
  grade: EvidenceGrade,
  payload: Record<string, unknown>,
  opts: { tenantId: string; actorId: string; targetId?: string; targetType?: string }
): ProofRecord {
  return {
    proofId: crypto.randomUUID(),
    type,
    tenantId: opts.tenantId,
    actorId: opts.actorId,
    targetId: opts.targetId,
    targetType: opts.targetType,
    evidenceGrade: grade,
    contentHash: simpleHash(JSON.stringify(payload)),
    payload,
    sourceChain: [],
    immutable: true,
    replayable: type === "immutable-event" || type === "replay-snapshot",
    createdAt: new Date().toISOString(),
  };
}

export function chainProofs(parent: ProofRecord, child: ProofRecord): ProofRecord {
  return { ...child, sourceChain: [...parent.sourceChain, parent.proofId] };
}

function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
