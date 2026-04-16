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
  type PolicyDomain,
  type EnforcementMode,
  type PolicyScope,
  type UnifiedPolicyEntry,
} from "./unified-policy-matrix";
