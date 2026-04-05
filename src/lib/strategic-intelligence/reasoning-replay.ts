// ═══════════════════════════════════════════════════════════════
// SITA OS — Reasoning Insurance Replay
// Stores meta-reasoning for high-value task inspection.
// ═══════════════════════════════════════════════════════════════

export interface ReasoningReplay {
  replayId: string;
  taskId: string;
  taskClass: string;
  domain: string;
  createdAt: string;

  // What was considered
  consideredPaths: ConsideredPath[];
  skippedPaths: SkippedPath[];

  // Escalation
  escalationEvents: EscalationEvent[];

  // Reuse
  reusedAssets: ReusedAssetRef[];

  // Final route
  finalRoute: FinalRouteDecision;

  // Confidence
  confidenceCheckpoints: ConfidenceCheckpoint[];

  // Insurance
  insuranceActions: string[];

  // Quality floor
  qualityFloorResult: { passes: boolean; violations: string[] };

  // Cost
  totalCostCents: number;
  totalLatencyMs: number;
}

export interface ConsideredPath {
  pathLabel: string;
  estimatedCost: number;
  estimatedConfidence: number;
  reason: string;
  chosen: boolean;
}

export interface SkippedPath {
  pathLabel: string;
  reason: string;
}

export interface EscalationEvent {
  from: string;
  to: string;
  trigger: string;
  justified: boolean;
}

export interface ReusedAssetRef {
  assetId: string;
  assetType: string;
  reuseMode: "direct" | "adapted" | "reference";
  savingsCents: number;
}

export interface FinalRouteDecision {
  modelTier: string;
  reasoningMode: string;
  reason: string;
  costCents: number;
  confidence: number;
}

export interface ConfidenceCheckpoint {
  phase: string;
  confidence: number;
  timestamp: string;
}

// ── Builder ────────────────────────────────────────────────

export function createReasoningReplay(
  taskId: string,
  taskClass: string,
  domain: string,
): ReasoningReplay {
  return {
    replayId: `rr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    taskId, taskClass, domain,
    createdAt: new Date().toISOString(),
    consideredPaths: [],
    skippedPaths: [],
    escalationEvents: [],
    reusedAssets: [],
    finalRoute: { modelTier: "", reasoningMode: "", reason: "", costCents: 0, confidence: 0 },
    confidenceCheckpoints: [],
    insuranceActions: [],
    qualityFloorResult: { passes: true, violations: [] },
    totalCostCents: 0,
    totalLatencyMs: 0,
  };
}

export function addConsideredPath(replay: ReasoningReplay, path: ConsideredPath): void {
  replay.consideredPaths.push(path);
}

export function addSkippedPath(replay: ReasoningReplay, path: SkippedPath): void {
  replay.skippedPaths.push(path);
}

export function addEscalation(replay: ReasoningReplay, event: EscalationEvent): void {
  replay.escalationEvents.push(event);
}

export function addReusedAsset(replay: ReasoningReplay, ref: ReusedAssetRef): void {
  replay.reusedAssets.push(ref);
}

export function setFinalRoute(replay: ReasoningReplay, route: FinalRouteDecision): void {
  replay.finalRoute = route;
  replay.totalCostCents = route.costCents;
}

export function addConfidenceCheckpoint(replay: ReasoningReplay, phase: string, confidence: number): void {
  replay.confidenceCheckpoints.push({ phase, confidence, timestamp: new Date().toISOString() });
}

export function finalizeReplay(replay: ReasoningReplay, totalLatencyMs: number): ReasoningReplay {
  replay.totalLatencyMs = totalLatencyMs;
  return replay;
}
