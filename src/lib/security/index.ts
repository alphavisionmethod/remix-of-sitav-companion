// ═══════════════════════════════════════════════════════════════
// SITA OS — Security Layer Barrel
// Canonical import: @/lib/security
// ═══════════════════════════════════════════════════════════════

export {
  TRUST_ZONE_REGISTRY,
  ZONE_TRANSITION_RULES,
  getZone,
  getZonesByMinTrust,
  getTransitionRule,
  canTransition,
  getHighSecurityZones,
  getAuditRequiredZones,
  compareTrustLevels,
  type TrustZoneId,
  type TrustLevel,
  type ZoneTransitionVerdict,
  type TrustZoneEntry,
  type ZoneTransitionRule,
} from "./runtime-trust-chain";
