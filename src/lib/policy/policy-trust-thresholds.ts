// ═══════════════════════════════════════════════════════════════
// SITA OS — Policy Trust Thresholds (Phase 3)
//
// Maps device trust levels (0-4) and risk classes (R0-R5) to the
// minimum trust score required to execute. Bound to device-trust
// registry and the unified policy matrix.
// ═══════════════════════════════════════════════════════════════

import type { PolicyDomainKey } from "./policy-domain-map";
import type { RiskClass } from "./policy-proof-requirements";

export type TrustLevel = 0 | 1 | 2 | 3 | 4;

export interface TrustLevelDefinition {
  level: TrustLevel;
  label: string;
  description: string;
  /** Capabilities that become available at this level. */
  capabilities: readonly string[];
}

export const TRUST_LEVELS: readonly TrustLevelDefinition[] = [
  { level: 0, label: "Untrusted",      description: "New / unverified device. Public surfaces only.",          capabilities: ["public-views"] },
  { level: 1, label: "Recognized",     description: "Recognized device, basic auth verified.",                 capabilities: ["public-views", "user-views", "low-risk-mutations"] },
  { level: 2, label: "Trusted",        description: "Trusted device with successful re-auth history.",         capabilities: ["public-views", "user-views", "low-risk-mutations", "moderate-mutations"] },
  { level: 3, label: "Highly Trusted", description: "Highly trusted device with biometric binding.",           capabilities: ["public-views", "user-views", "low-risk-mutations", "moderate-mutations", "high-risk-mutations"] },
  { level: 4, label: "Hardware Bound", description: "Hardware-attested device (Secure Enclave / TPM).",        capabilities: ["public-views", "user-views", "low-risk-mutations", "moderate-mutations", "high-risk-mutations", "destructive-actions"] },
] as const;

export interface TrustThreshold {
  domain: PolicyDomainKey;
  riskClass: RiskClass;
  minTrustLevel: TrustLevel;
  /** Whether biometric step-up satisfies (overrides) trust shortfall by +1. */
  biometricStepUpAllowed: boolean;
}

export const TRUST_THRESHOLDS: readonly TrustThreshold[] = [
  // Money
  { domain: "money", riskClass: "R0", minTrustLevel: 1, biometricStepUpAllowed: true },
  { domain: "money", riskClass: "R3", minTrustLevel: 2, biometricStepUpAllowed: true },
  { domain: "money", riskClass: "R4", minTrustLevel: 3, biometricStepUpAllowed: true },
  { domain: "money", riskClass: "R5", minTrustLevel: 4, biometricStepUpAllowed: false },

  // Boardroom
  { domain: "boardroom", riskClass: "R3", minTrustLevel: 2, biometricStepUpAllowed: true },
  { domain: "boardroom", riskClass: "R4", minTrustLevel: 3, biometricStepUpAllowed: true },

  // System
  { domain: "system", riskClass: "R3", minTrustLevel: 3, biometricStepUpAllowed: false },
  { domain: "system", riskClass: "R4", minTrustLevel: 3, biometricStepUpAllowed: true  },
  { domain: "system", riskClass: "R5", minTrustLevel: 4, biometricStepUpAllowed: false },

  // Admin
  { domain: "admin", riskClass: "R3", minTrustLevel: 2, biometricStepUpAllowed: true },
  { domain: "admin", riskClass: "R4", minTrustLevel: 3, biometricStepUpAllowed: true },

  // Integrations
  { domain: "integrations", riskClass: "R2", minTrustLevel: 1, biometricStepUpAllowed: true },
  { domain: "integrations", riskClass: "R3", minTrustLevel: 2, biometricStepUpAllowed: true },
  { domain: "integrations", riskClass: "R4", minTrustLevel: 3, biometricStepUpAllowed: true },

  // Identity
  { domain: "identity", riskClass: "R3", minTrustLevel: 2, biometricStepUpAllowed: true },
  { domain: "identity", riskClass: "R4", minTrustLevel: 3, biometricStepUpAllowed: false },

  // Business / Concierge / Files / Trust
  { domain: "business",  riskClass: "R1", minTrustLevel: 1, biometricStepUpAllowed: true },
  { domain: "business",  riskClass: "R2", minTrustLevel: 1, biometricStepUpAllowed: true },
  { domain: "business",  riskClass: "R3", minTrustLevel: 2, biometricStepUpAllowed: true },
  { domain: "concierge", riskClass: "R0", minTrustLevel: 0, biometricStepUpAllowed: true },
  { domain: "concierge", riskClass: "R1", minTrustLevel: 1, biometricStepUpAllowed: true },
  { domain: "files",     riskClass: "R2", minTrustLevel: 1, biometricStepUpAllowed: true },
  { domain: "files",     riskClass: "R3", minTrustLevel: 2, biometricStepUpAllowed: true },
  { domain: "trust",     riskClass: "R3", minTrustLevel: 2, biometricStepUpAllowed: false },
  { domain: "trust",     riskClass: "R4", minTrustLevel: 3, biometricStepUpAllowed: false },
] as const;

export function getTrustThreshold(
  domain: PolicyDomainKey,
  riskClass: RiskClass,
): TrustThreshold | undefined {
  return TRUST_THRESHOLDS.find((t) => t.domain === domain && t.riskClass === riskClass);
}

/**
 * Resolve whether a device with the given trust level (and optional
 * recent biometric step-up) satisfies the threshold.
 */
export function meetsTrustThreshold(
  domain: PolicyDomainKey,
  riskClass: RiskClass,
  deviceTrust: TrustLevel,
  biometricStepUpRecent: boolean,
): boolean {
  const thr = getTrustThreshold(domain, riskClass);
  if (!thr) return false;
  if (deviceTrust >= thr.minTrustLevel) return true;
  if (thr.biometricStepUpAllowed && biometricStepUpRecent && (deviceTrust as number) + 1 >= thr.minTrustLevel) {
    return true;
  }
  return false;
}
