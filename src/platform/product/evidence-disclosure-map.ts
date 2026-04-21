// ═══════════════════════════════════════════════════════════════
// SITA OS — Evidence / Disclosure Map
// Evidence and provenance disclosure requirements per domain.
// ═══════════════════════════════════════════════════════════════

import type { TaskDomain } from "./task-action-model";
import type { ExplanationKind } from "./trust-explanation-layer";

export interface EvidenceDisclosureRequirement {
  readonly domain: TaskDomain;
  readonly capability: string;
  readonly requiredDisclosures: readonly ExplanationKind[];
  readonly mandatory: boolean;
  readonly userDismissable: boolean;
  readonly regulatoryRef?: string;
}

export const EVIDENCE_DISCLOSURE_REGISTRY: readonly EvidenceDisclosureRequirement[] = [
  { domain: "ai",       capability: "advisor-recommendation",   requiredDisclosures: ["ai-disclosure", "recommendation", "evidence"],     mandatory: true,  userDismissable: false },
  { domain: "ai",       capability: "auto-execution",           requiredDisclosures: ["ai-disclosure", "permission", "evidence"],          mandatory: true,  userDismissable: false },
  { domain: "finance",  capability: "tax-calculation",          requiredDisclosures: ["calculation", "data-source", "trust-copy"],         mandatory: true,  userDismissable: false, regulatoryRef: "tax-compliance" },
  { domain: "finance",  capability: "payment-processing",       requiredDisclosures: ["provenance", "permission"],                         mandatory: true,  userDismissable: false },
  { domain: "trust",    capability: "compliance-report",        requiredDisclosures: ["provenance", "evidence", "data-source"],             mandatory: true,  userDismissable: false },
  { domain: "business", capability: "client-data-display",      requiredDisclosures: ["data-source"],                                      mandatory: false, userDismissable: true },
  { domain: "files",    capability: "ai-document-analysis",     requiredDisclosures: ["ai-disclosure", "evidence"],                         mandatory: true,  userDismissable: false },
  { domain: "admin",    capability: "user-action-audit",        requiredDisclosures: ["provenance", "evidence"],                            mandatory: true,  userDismissable: false },
] as const;