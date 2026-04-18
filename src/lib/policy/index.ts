// ═══════════════════════════════════════════════════════════════
// SITA OS — Policy Layer Barrel
// Canonical import: @/lib/policy
// ═══════════════════════════════════════════════════════════════

export {
  UNIFIED_POLICY_MATRIX,
  getPolicyById,
  getPoliciesByDomain,
  getCriticalPolicies,
  getHardBlockPolicies,
  getOverridablePolicies,
  getAuditRequiredPolicies,
  getPoliciesByScope,
  validatePolicyCompleteness,
  resolveUnifiedPolicy,
  denyAllQuery,
  type PolicyDomain,
  type EnforcementMode,
  type PolicyScope,
  type UnifiedPolicyEntry,
  type UnifiedPolicyQuery,
  type UnifiedPolicyDecision,
  type SensitivityClass,
  type TenantScope,
} from "./unified-policy-matrix";

// ── Phase 3 Meta-Architecture: 9-Dimension Policy Surfaces ──
export * from "./policy-actor-registry";
export * from "./policy-domain-map";
export * from "./policy-surface-map";
export * from "./policy-proof-requirements";
export * from "./policy-reversibility-map";
export * from "./policy-trust-thresholds";
export * from "./policy-approval-map";
