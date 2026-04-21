// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Evidence Grade Policy
// Maps AI surfaces to evidence grade requirements.
// Extends PROOF_REQUIREMENTS from policy-proof-requirements.ts.
// ═══════════════════════════════════════════════════════════════

import type { EvidenceGrade } from "./ai-capability-registry";

export type AISurfaceType = "advisory" | "operational" | "action-capable";
export type UnverifiableBehavior = "refuse" | "caveat" | "degrade";

export interface AISurfaceEvidencePolicy {
  surfaceId: string;
  surfaceType: AISurfaceType;
  requiredEvidenceGrade: EvidenceGrade;
  disclosureRequired: boolean;
  provenanceVisible: boolean;
  unverifiableBehavior: UnverifiableBehavior;
  description: string;
}

export const AI_SURFACE_EVIDENCE_POLICIES: readonly AISurfaceEvidencePolicy[] = [
  {
    surfaceId: "advisor-chat",
    surfaceType: "advisory",
    requiredEvidenceGrade: "C",
    disclosureRequired: true,
    provenanceVisible: true,
    unverifiableBehavior: "caveat",
    description: "Advisor chat responses shown to users",
  },
  {
    surfaceId: "boardroom-items",
    surfaceType: "operational",
    requiredEvidenceGrade: "B",
    disclosureRequired: true,
    provenanceVisible: true,
    unverifiableBehavior: "caveat",
    description: "Boardroom recommendation items with evidence",
  },
  {
    surfaceId: "boardroom-decisions",
    surfaceType: "action-capable",
    requiredEvidenceGrade: "A",
    disclosureRequired: true,
    provenanceVisible: true,
    unverifiableBehavior: "refuse",
    description: "Boardroom decisions that trigger actions",
  },
  {
    surfaceId: "admin-ai-pages",
    surfaceType: "operational",
    requiredEvidenceGrade: "B",
    disclosureRequired: true,
    provenanceVisible: true,
    unverifiableBehavior: "caveat",
    description: "Admin AI runtime monitoring and control surfaces",
  },
  {
    surfaceId: "simulation-engine",
    surfaceType: "operational",
    requiredEvidenceGrade: "B",
    disclosureRequired: true,
    provenanceVisible: true,
    unverifiableBehavior: "degrade",
    description: "Monte Carlo and scenario simulation outputs",
  },
  {
    surfaceId: "ai-action-cards",
    surfaceType: "action-capable",
    requiredEvidenceGrade: "A",
    disclosureRequired: true,
    provenanceVisible: true,
    unverifiableBehavior: "refuse",
    description: "AI-generated action cards with execute capability",
  },
] as const;

export function getSurfacePolicy(surfaceId: string): AISurfaceEvidencePolicy | undefined {
  return AI_SURFACE_EVIDENCE_POLICIES.find((s) => s.surfaceId === surfaceId);
}

export function getSurfacesByType(surfaceType: AISurfaceType): AISurfaceEvidencePolicy[] {
  return AI_SURFACE_EVIDENCE_POLICIES.filter((s) => s.surfaceType === surfaceType);
}

export function isEvidenceGradeSufficient(actual: EvidenceGrade, required: EvidenceGrade): boolean {
  const order: EvidenceGrade[] = ["A", "B", "C", "D", "F"];
  return order.indexOf(actual) <= order.indexOf(required);
}