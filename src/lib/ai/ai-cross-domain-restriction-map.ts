// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Cross-Domain Restriction Map
// Extends PERSONA_BOUNDARIES.domainFence into full proof.
// ═══════════════════════════════════════════════════════════════

export type CrossDomainActionType = "read" | "write" | "execute" | "recommend";

export interface CrossDomainRestriction {
  advisorId: string;
  allowedDomains: readonly string[];
  blockedDomains: readonly string[];
  crossDomainReadAllowed: boolean;
  crossDomainWriteBlocked: boolean;
  approvalForCrossDomain: string;
  escalationRule: string;
  evidenceRequired: boolean;
}

export const CROSS_DOMAIN_RESTRICTIONS: readonly CrossDomainRestriction[] = [
  { advisorId: "money-advisor", allowedDomains: ["finance-os"], blockedDomains: ["legal", "hr", "security"], crossDomainReadAllowed: true, crossDomainWriteBlocked: true, approvalForCrossDomain: "owner", escalationRule: "ESC-006", evidenceRequired: true },
  { advisorId: "business-advisor", allowedDomains: ["business-os"], blockedDomains: ["legal", "finance-os", "hr"], crossDomainReadAllowed: true, crossDomainWriteBlocked: true, approvalForCrossDomain: "owner", escalationRule: "ESC-006", evidenceRequired: true },
  { advisorId: "concierge-advisor", allowedDomains: ["concierge-os"], blockedDomains: ["finance-os", "legal", "security"], crossDomainReadAllowed: true, crossDomainWriteBlocked: true, approvalForCrossDomain: "owner", escalationRule: "ESC-006", evidenceRequired: true },
  { advisorId: "strategy-advisor", allowedDomains: ["cross-domain"], blockedDomains: [], crossDomainReadAllowed: true, crossDomainWriteBlocked: true, approvalForCrossDomain: "owner → admin", escalationRule: "ESC-006", evidenceRequired: true },
  { advisorId: "security-advisor", allowedDomains: ["security-os", "cross-domain"], blockedDomains: ["finance-os", "hr"], crossDomainReadAllowed: true, crossDomainWriteBlocked: true, approvalForCrossDomain: "dual-admin", escalationRule: "ESC-005", evidenceRequired: true },
  { advisorId: "legal-advisor", allowedDomains: ["legal-domain"], blockedDomains: ["finance-os", "engineering"], crossDomainReadAllowed: true, crossDomainWriteBlocked: true, approvalForCrossDomain: "owner → admin", escalationRule: "ESC-006", evidenceRequired: true },
  { advisorId: "tax-advisor", allowedDomains: ["finance-os"], blockedDomains: ["legal", "hr", "security"], crossDomainReadAllowed: true, crossDomainWriteBlocked: true, approvalForCrossDomain: "owner → admin", escalationRule: "ESC-006", evidenceRequired: true },
];

export function isCrossDomainAllowed(advisorId: string, targetDomain: string, actionType: CrossDomainActionType): { allowed: boolean; reason: string } {
  const restriction = CROSS_DOMAIN_RESTRICTIONS.find((r) => r.advisorId === advisorId);
  if (!restriction) return { allowed: false, reason: `Unknown advisor: ${advisorId}` };

  if (restriction.allowedDomains.includes(targetDomain)) {
    return { allowed: true, reason: `${targetDomain} is within allowed domains` };
  }
  if (restriction.blockedDomains.includes(targetDomain)) {
    return { allowed: false, reason: `${targetDomain} is explicitly blocked for ${advisorId}` };
  }
  if (actionType === "read" && restriction.crossDomainReadAllowed) {
    return { allowed: true, reason: `Cross-domain read allowed for ${advisorId}` };
  }
  if ((actionType === "write" || actionType === "execute") && restriction.crossDomainWriteBlocked) {
    return { allowed: false, reason: `Cross-domain ${actionType} blocked for ${advisorId}; requires ${restriction.approvalForCrossDomain} approval` };
  }
  return { allowed: false, reason: `Default deny for ${advisorId} → ${targetDomain} (${actionType})` };
}

export function getCrossDomainRestriction(advisorId: string): CrossDomainRestriction | undefined {
  return CROSS_DOMAIN_RESTRICTIONS.find((r) => r.advisorId === advisorId);
}