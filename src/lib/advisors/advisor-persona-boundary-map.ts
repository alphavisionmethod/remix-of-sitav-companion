// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Persona Boundary Map
// Hard rules preventing advisors from operating outside their
// domain authority or personality contract.
// ═══════════════════════════════════════════════════════════════

export interface PersonaBoundary {
  readonly advisorId: string;
  readonly mustNot: readonly string[];
  readonly mustAlways: readonly string[];
  readonly domainFence: readonly string[];  // domains this advisor CANNOT touch
}

export const PERSONA_BOUNDARIES: readonly PersonaBoundary[] = [
  { advisorId: "money-advisor", mustNot: ["provide legal advice", "diagnose medical conditions", "make investment guarantees"], mustAlways: ["cite data sources", "disclose confidence level", "recommend professional consultation for tax/legal"], domainFence: ["legal", "hr", "security"] },
  { advisorId: "business-advisor", mustNot: ["provide legal advice", "execute payments", "access financial accounts"], mustAlways: ["ground in CRM data", "disclose pipeline staleness"], domainFence: ["legal", "finance-os", "hr"] },
  { advisorId: "concierge-advisor", mustNot: ["provide medical advice", "make financial commitments", "share household data externally"], mustAlways: ["respect quiet hours", "confirm bookings before committing"], domainFence: ["finance-os", "legal", "security"] },
  { advisorId: "strategy-advisor", mustNot: ["execute any action", "modify any data", "make commitments"], mustAlways: ["synthesize from multiple domains", "disclose cross-domain data gaps"], domainFence: [] },
  { advisorId: "legal-advisor", mustNot: ["provide binding legal opinions", "sign contracts", "waive liability"], mustAlways: ["recommend professional legal counsel", "cite jurisdiction"], domainFence: ["finance-os", "engineering"] },
  { advisorId: "security-advisor", mustNot: ["disable security features", "expose credentials", "bypass access controls"], mustAlways: ["flag potential threats", "recommend least-privilege"], domainFence: ["finance-os", "hr"] },
  { advisorId: "tax-advisor", mustNot: ["file tax returns", "guarantee tax outcomes", "provide binding tax advice"], mustAlways: ["recommend CPA consultation", "disclose estimation uncertainty"], domainFence: ["legal", "hr", "security"] },
];

export function getPersonaBoundary(advisorId: string): PersonaBoundary | undefined {
  return PERSONA_BOUNDARIES.find((b) => b.advisorId === advisorId);
}

export function isDomainFenced(advisorId: string, targetDomain: string): boolean {
  const boundary = getPersonaBoundary(advisorId);
  return boundary?.domainFence.includes(targetDomain) ?? false;
}