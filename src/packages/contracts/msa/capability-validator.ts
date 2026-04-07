// ═══════════════════════════════════════════════════════════════
// SITA OS — MSA Capability Runtime Validator
// Consumes MSA contract types at runtime to enforce correctness
// ═══════════════════════════════════════════════════════════════

import type {
  CapabilityInvocation,
  CapabilityResult,
  CapabilityDefinition,
  ActionType,
  RiskTier,
  PortabilityClass,
} from "./capability-contract";

// ── Validation result ────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ── Allowed values (mirrors contract types at runtime) ───────

const VALID_ACTION_TYPES: ActionType[] = ["command", "query", "workflow", "event"];
const VALID_RISK_TIERS: RiskTier[] = ["low", "medium", "high", "critical"];
const VALID_PORTABILITY_CLASSES: PortabilityClass[] = ["portable", "web_preferred", "surface_specific"];
const VALID_MODES = ["live", "demo", "simulation"] as const;
const VALID_BINDING_STATUSES = ["production", "beta", "planned", "unsupported"] as const;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CAPABILITY_KEY_RE = /^[a-z][a-z0-9_.]{2,127}$/;

// ── Invocation Validator ─────────────────────────────────────

export function validateCapabilityInvocation(
  input: unknown,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Input must be a non-null object"], warnings };
  }

  const inv = input as Record<string, unknown>;

  // capabilityKey
  if (typeof inv.capabilityKey !== "string" || !inv.capabilityKey) {
    errors.push("capabilityKey is required and must be a non-empty string");
  } else if (!CAPABILITY_KEY_RE.test(inv.capabilityKey)) {
    errors.push(
      `capabilityKey "${inv.capabilityKey}" must match pattern: lowercase, dots/underscores, 3-128 chars`,
    );
  }

  // params
  if (inv.params !== undefined && (typeof inv.params !== "object" || inv.params === null || Array.isArray(inv.params))) {
    errors.push("params must be a plain object if provided");
  }

  // surface
  if (typeof inv.surface !== "string" || !inv.surface) {
    errors.push("surface is required and must be a non-empty string");
  }

  // userId
  if (typeof inv.userId !== "string" || !inv.userId) {
    errors.push("userId is required");
  } else if (!UUID_RE.test(inv.userId)) {
    warnings.push("userId should be a valid UUID");
  }

  // mode
  if (!inv.mode || !VALID_MODES.includes(inv.mode as never)) {
    errors.push(`mode must be one of: ${VALID_MODES.join(", ")}`);
  }

  // correlationId (optional)
  if (inv.correlationId !== undefined && typeof inv.correlationId !== "string") {
    errors.push("correlationId must be a string if provided");
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ── Result Validator ─────────────────────────────────────────

export function validateCapabilityResult(input: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Result must be a non-null object"], warnings };
  }

  const res = input as Record<string, unknown>;

  if (typeof res.success !== "boolean") {
    errors.push("success must be a boolean");
  }

  if (res.success === false && !res.error) {
    warnings.push("Failed result should include an error message");
  }

  if (res.receipt !== undefined) {
    if (typeof res.receipt !== "object" || res.receipt === null) {
      errors.push("receipt must be an object if provided");
    } else {
      const r = res.receipt as Record<string, unknown>;
      if (typeof r.id !== "string") errors.push("receipt.id must be a string");
      if (typeof r.hash !== "string") errors.push("receipt.hash must be a string");
      if (typeof r.type !== "string") errors.push("receipt.type must be a string");
    }
  }

  if (res.latencyMs !== undefined && (typeof res.latencyMs !== "number" || res.latencyMs < 0)) {
    errors.push("latencyMs must be a non-negative number");
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ── Definition Validator ─────────────────────────────────────

export function validateCapabilityDefinition(input: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Definition must be a non-null object"], warnings };
  }

  const def = input as Record<string, unknown>;

  if (typeof def.id !== "string" || !def.id) errors.push("id is required");
  if (typeof def.capabilityKey !== "string" || !def.capabilityKey) {
    errors.push("capabilityKey is required");
  } else if (!CAPABILITY_KEY_RE.test(def.capabilityKey)) {
    errors.push(`capabilityKey "${def.capabilityKey}" fails pattern validation`);
  }

  if (typeof def.displayName !== "string" || !def.displayName) errors.push("displayName is required");
  if (typeof def.domain !== "string" || !def.domain) errors.push("domain is required");

  if (!VALID_ACTION_TYPES.includes(def.actionType as ActionType)) {
    errors.push(`actionType must be one of: ${VALID_ACTION_TYPES.join(", ")}`);
  }
  if (!VALID_RISK_TIERS.includes(def.riskTier as RiskTier)) {
    errors.push(`riskTier must be one of: ${VALID_RISK_TIERS.join(", ")}`);
  }
  if (!VALID_PORTABILITY_CLASSES.includes(def.portabilityClass as PortabilityClass)) {
    errors.push(`portabilityClass must be one of: ${VALID_PORTABILITY_CLASSES.join(", ")}`);
  }

  if (typeof def.requiresApproval !== "boolean") errors.push("requiresApproval must be boolean");
  if (typeof def.aiEligible !== "boolean") errors.push("aiEligible must be boolean");

  // Cross-field: critical risk should require approval
  if (def.riskTier === "critical" && def.requiresApproval === false) {
    warnings.push("Critical-risk capabilities should typically require approval");
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ── Validated invocation wrapper (used by capability-registry) ──

export function assertValidInvocation(input: unknown): CapabilityInvocation {
  const result = validateCapabilityInvocation(input);
  if (!result.valid) {
    throw new Error(`Invalid CapabilityInvocation: ${result.errors.join("; ")}`);
  }
  return input as CapabilityInvocation;
}

export function assertValidResult(input: unknown): CapabilityResult {
  const result = validateCapabilityResult(input);
  if (!result.valid) {
    throw new Error(`Invalid CapabilityResult: ${result.errors.join("; ")}`);
  }
  return input as CapabilityResult;
}
