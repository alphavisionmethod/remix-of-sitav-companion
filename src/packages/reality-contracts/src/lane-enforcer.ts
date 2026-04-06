// ═══════════════════════════════════════════════════════════════
// SITA OS — Reality Lane Enforcer
// Runtime enforcement for simulation/shadow/live lane separation
// Prevents lane conflation, enforces side-effect policies
// ═══════════════════════════════════════════════════════════════

import type {
  RealityLane,
  FinalityLevel,
  IrreversibilityClass,
  SensitivityClassification,
  RetentionClass,
  RealityContractMeta,
} from "./primitives";
import type { RealitySwitch } from "./reality-switch";

// ── Lane policy definitions ──────────────────────────────────

export interface LanePolicy {
  lane: RealityLane;
  externalWritesAllowed: boolean;
  persistenceAllowed: boolean;
  notificationsAllowed: boolean;
  billingAllowed: boolean;
  approvalExecutionAllowed: boolean;
  maxFinalityLevel: FinalityLevel;
  allowedIrreversibilityClasses: IrreversibilityClass[];
}

const LANE_POLICIES: Record<RealityLane, LanePolicy> = {
  simulation: {
    lane: "simulation",
    externalWritesAllowed: false,
    persistenceAllowed: false,
    notificationsAllowed: false,
    billingAllowed: false,
    approvalExecutionAllowed: false,
    maxFinalityLevel: "tentative",
    allowedIrreversibilityClasses: ["freely-reversible"],
  },
  shadow: {
    lane: "shadow",
    externalWritesAllowed: false,
    persistenceAllowed: true,
    notificationsAllowed: false,
    billingAllowed: false,
    approvalExecutionAllowed: false,
    maxFinalityLevel: "provisional",
    allowedIrreversibilityClasses: ["freely-reversible", "reversible-with-cost"],
  },
  live: {
    lane: "live",
    externalWritesAllowed: true,
    persistenceAllowed: true,
    notificationsAllowed: true,
    billingAllowed: true,
    approvalExecutionAllowed: true,
    maxFinalityLevel: "irreversible",
    allowedIrreversibilityClasses: [
      "freely-reversible",
      "reversible-with-cost",
      "conditionally-reversible",
      "irreversible",
      "permanently-irreversible",
    ],
  },
};

// ── Enforcement result ───────────────────────────────────────

export interface LaneEnforcementResult {
  allowed: boolean;
  lane: RealityLane;
  violations: LaneViolation[];
  warnings: string[];
}

export interface LaneViolation {
  code: string;
  message: string;
  severity: "block" | "warn";
}

// ── Validate RealitySwitch ───────────────────────────────────

const VALID_LANES: RealityLane[] = ["simulation", "shadow", "live"];

export function validateRealitySwitch(input: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["RealitySwitch must be a non-null object"] };
  }
  const sw = input as Record<string, unknown>;

  if (typeof sw.id !== "string" || !sw.id) errors.push("id required");
  if (!VALID_LANES.includes(sw.lane as RealityLane)) {
    errors.push(`lane must be one of: ${VALID_LANES.join(", ")}`);
  }
  if (typeof sw.tenantId !== "string" || !sw.tenantId) errors.push("tenantId required");
  if (typeof sw.actorId !== "string" || !sw.actorId) errors.push("actorId required");
  if (typeof sw.correlationId !== "string" || !sw.correlationId) errors.push("correlationId required");
  if (typeof sw.activatedAt !== "string") errors.push("activatedAt required");

  // Lane-specific ID checks
  if (sw.lane === "simulation" && !sw.simulationId) {
    errors.push("simulationId required when lane is simulation");
  }
  if (sw.lane === "shadow" && !sw.shadowId) {
    errors.push("shadowId required when lane is shadow");
  }
  if (sw.lane === "live" && !sw.liveExecutionId) {
    errors.push("liveExecutionId required when lane is live");
  }

  return { valid: errors.length === 0, errors };
}

// ── Side-effect enforcement ──────────────────────────────────

export type SideEffectKind =
  | "external_write"
  | "persistence"
  | "notification"
  | "billing"
  | "approval_execution";

export function enforceLaneSideEffect(
  lane: RealityLane,
  effect: SideEffectKind,
): LaneEnforcementResult {
  const policy = LANE_POLICIES[lane];
  if (!policy) {
    return {
      allowed: false,
      lane,
      violations: [{ code: "INVALID_LANE", message: `Unknown lane: ${lane}`, severity: "block" }],
      warnings: [],
    };
  }

  const violations: LaneViolation[] = [];
  const warnings: string[] = [];

  const checks: Record<SideEffectKind, boolean> = {
    external_write: policy.externalWritesAllowed,
    persistence: policy.persistenceAllowed,
    notification: policy.notificationsAllowed,
    billing: policy.billingAllowed,
    approval_execution: policy.approvalExecutionAllowed,
  };

  if (!checks[effect]) {
    violations.push({
      code: "LANE_SIDE_EFFECT_BLOCKED",
      message: `Side effect "${effect}" is not allowed in lane "${lane}"`,
      severity: "block",
    });
  }

  return {
    allowed: violations.length === 0,
    lane,
    violations,
    warnings,
  };
}

// ── Finality enforcement ─────────────────────────────────────

const FINALITY_ORDER: FinalityLevel[] = [
  "tentative",
  "provisional",
  "committed",
  "finalized",
  "irreversible",
];

export function enforceFinalityLevel(
  lane: RealityLane,
  requestedFinality: FinalityLevel,
): LaneEnforcementResult {
  const policy = LANE_POLICIES[lane];
  const violations: LaneViolation[] = [];
  const maxIdx = FINALITY_ORDER.indexOf(policy.maxFinalityLevel);
  const reqIdx = FINALITY_ORDER.indexOf(requestedFinality);

  if (reqIdx > maxIdx) {
    violations.push({
      code: "FINALITY_EXCEEDS_LANE",
      message: `Finality "${requestedFinality}" exceeds max "${policy.maxFinalityLevel}" for lane "${lane}"`,
      severity: "block",
    });
  }

  return { allowed: violations.length === 0, lane, violations, warnings: [] };
}

// ── Irreversibility enforcement ──────────────────────────────

export function enforceIrreversibility(
  lane: RealityLane,
  irrevClass: IrreversibilityClass,
): LaneEnforcementResult {
  const policy = LANE_POLICIES[lane];
  const violations: LaneViolation[] = [];

  if (!policy.allowedIrreversibilityClasses.includes(irrevClass)) {
    violations.push({
      code: "IRREVERSIBILITY_NOT_ALLOWED",
      message: `Irreversibility class "${irrevClass}" blocked in lane "${lane}"`,
      severity: "block",
    });
  }

  return { allowed: violations.length === 0, lane, violations, warnings: [] };
}

// ── Full context enforcement ─────────────────────────────────

export interface ActionContext {
  lane: RealityLane;
  sideEffects: SideEffectKind[];
  requestedFinality: FinalityLevel;
  irreversibilityClass: IrreversibilityClass;
}

export function enforceFullContext(ctx: ActionContext): LaneEnforcementResult {
  const allViolations: LaneViolation[] = [];
  const allWarnings: string[] = [];

  // Check each side effect
  for (const effect of ctx.sideEffects) {
    const r = enforceLaneSideEffect(ctx.lane, effect);
    allViolations.push(...r.violations);
    allWarnings.push(...r.warnings);
  }

  // Check finality
  const fr = enforceFinalityLevel(ctx.lane, ctx.requestedFinality);
  allViolations.push(...fr.violations);

  // Check irreversibility
  const ir = enforceIrreversibility(ctx.lane, ctx.irreversibilityClass);
  allViolations.push(...ir.violations);

  return {
    allowed: allViolations.length === 0,
    lane: ctx.lane,
    violations: allViolations,
    warnings: allWarnings,
  };
}

// ── Lane guard (throws on violation — use at boundaries) ─────

export function guardLane(ctx: ActionContext): void {
  const result = enforceFullContext(ctx);
  if (!result.allowed) {
    const msgs = result.violations.map((v) => `[${v.code}] ${v.message}`).join("; ");
    throw new Error(`Reality lane violation in "${ctx.lane}": ${msgs}`);
  }
}

// ── Get policy for a lane ────────────────────────────────────

export function getLanePolicy(lane: RealityLane): LanePolicy {
  return LANE_POLICIES[lane];
}
