// ═══════════════════════════════════════════════════════════════
// SITA OS — Proof Confidence Model
// Confidence scoring per subsystem based on proof category coverage.
// ═══════════════════════════════════════════════════════════════

import { PROOF_CATEGORIES, type HardProofCategory } from "./proof-category-model";
import { SYSTEM_PROOF_REGISTRY, type SubsystemId } from "./system-proof-registry";
import { getRequiredLanguage, type ReadinessLanguage } from "./proof-threshold-policy";

export interface SubsystemConfidence {
  readonly subsystem: SubsystemId;
  readonly confidenceScore: number;       // 0-100
  readonly readinessLanguage: ReadinessLanguage;
  readonly presentCategories: readonly HardProofCategory[];
  readonly partialCategories: readonly HardProofCategory[];
  readonly missingCategories: readonly HardProofCategory[];
}

export function computeSubsystemConfidence(subsystem: SubsystemId): SubsystemConfidence {
  const entries = SYSTEM_PROOF_REGISTRY.filter((e) => e.subsystem === subsystem);
  const present: HardProofCategory[] = [];
  const partial: HardProofCategory[] = [];
  const missing: HardProofCategory[] = [];

  for (const cat of PROOF_CATEGORIES) {
    const entry = entries.find((e) => e.category === cat.category);
    if (!entry || entry.status === "missing") missing.push(cat.category);
    else if (entry.status === "partial") partial.push(cat.category);
    else present.push(cat.category);
  }

  let score = 0;
  for (const cat of PROOF_CATEGORIES) {
    const entry = entries.find((e) => e.category === cat.category);
    if (entry?.status === "present") score += cat.confidenceWeight * 100;
    else if (entry?.status === "partial") score += cat.confidenceWeight * 50;
  }

  return {
    subsystem,
    confidenceScore: Math.round(score),
    readinessLanguage: getRequiredLanguage(present.length, partial.length, missing.length),
    presentCategories: present,
    partialCategories: partial,
    missingCategories: missing,
  };
}

export function computeAllSubsystemConfidence(): readonly SubsystemConfidence[] {
  const subsystems = [...new Set(SYSTEM_PROOF_REGISTRY.map((e) => e.subsystem))];
  return subsystems.map(computeSubsystemConfidence);
}

export function computeOverallConfidence(): { score: number; language: ReadinessLanguage } {
  const all = computeAllSubsystemConfidence();
  const avg = all.reduce((s, c) => s + c.confidenceScore, 0) / all.length;
  const totalMissing = all.reduce((s, c) => s + c.missingCategories.length, 0);
  const totalPartial = all.reduce((s, c) => s + c.partialCategories.length, 0);
  const totalPresent = all.reduce((s, c) => s + c.presentCategories.length, 0);
  return { score: Math.round(avg), language: getRequiredLanguage(totalPresent, totalPartial, totalMissing) };
}