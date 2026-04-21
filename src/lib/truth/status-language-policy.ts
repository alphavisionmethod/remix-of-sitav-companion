// ═══════════════════════════════════════════════════════════════
// SITA OS — Status Language Policy
// Approved vocabulary for readiness statuses
// ═══════════════════════════════════════════════════════════════

import type { ReadinessVerdict } from "./readiness-claim-contract";

export interface StatusLanguageEntry {
  readonly verdict: ReadinessVerdict;
  readonly label: string;
  readonly description: string;
  readonly allowedInUserFacing: boolean;
  readonly allowedInAdminFacing: boolean;
  readonly colorHint: "green" | "yellow" | "orange" | "red" | "gray";
  readonly prohibitedSynonyms: readonly string[];
}

export const STATUS_LANGUAGE_POLICY: readonly StatusLanguageEntry[] = [
  {
    verdict: "READY",
    label: "Ready",
    description: "All readiness dimensions pass. No open high-severity contradictions. Advisory burden within acceptable range.",
    allowedInUserFacing: true,
    allowedInAdminFacing: true,
    colorHint: "green",
    prohibitedSynonyms: ["complete", "done", "shipped", "finished"],
  },
  {
    verdict: "CONDITIONALLY_READY",
    label: "Conditionally Ready",
    description: "Core gates pass but open caveats exist. May include advisory burden, accepted contradictions, or dimension-specific gaps.",
    allowedInUserFacing: false,
    allowedInAdminFacing: true,
    colorHint: "yellow",
    prohibitedSynonyms: ["ready", "green", "good to go"],
  },
  {
    verdict: "STRUCTURALLY_READY_ONLY",
    label: "Structurally Ready Only",
    description: "Files exist and compile. Routes registered. Tables created. But no behavioral proof (runtime receipts, E2E tests, nightly runs).",
    allowedInUserFacing: false,
    allowedInAdminFacing: true,
    colorHint: "yellow",
    prohibitedSynonyms: ["ready", "production-ready"],
  },
  {
    verdict: "BEHAVIORALLY_PARTIAL",
    label: "Behaviorally Partial",
    description: "Some runtime evidence exists but key behavioral proofs are missing (e.g., E2E boot, nightly failure).",
    allowedInUserFacing: false,
    allowedInAdminFacing: true,
    colorHint: "orange",
    prohibitedSynonyms: ["ready", "verified", "proven"],
  },
  {
    verdict: "DISTRIBUTION_BLOCKED",
    label: "Distribution Blocked",
    description: "Cannot be packaged, signed, or delivered to end users. Applies to mobile (archived) and desktop (notarization pending).",
    allowedInUserFacing: false,
    allowedInAdminFacing: true,
    colorHint: "red",
    prohibitedSynonyms: ["ready", "available", "downloadable"],
  },
  {
    verdict: "OPERATIONALLY_DEFERRED",
    label: "Operationally Deferred",
    description: "Runbooks, kill-switches, or support diagnostics are incomplete or unproven. System functions but operational readiness is not established.",
    allowedInUserFacing: false,
    allowedInAdminFacing: true,
    colorHint: "orange",
    prohibitedSynonyms: ["ready", "operational"],
  },
  {
    verdict: "TRUST_GAP_OPEN",
    label: "Trust Gap Open",
    description: "Security or trust gap exists. May include missing encryption, RLS gaps, or unresolved claim honesty issues.",
    allowedInUserFacing: false,
    allowedInAdminFacing: true,
    colorHint: "red",
    prohibitedSynonyms: ["secure", "trusted", "safe"],
  },
  {
    verdict: "DEFERRED",
    label: "Deferred",
    description: "Feature or subsystem is explicitly deferred. No readiness claim is being made.",
    allowedInUserFacing: false,
    allowedInAdminFacing: true,
    colorHint: "gray",
    prohibitedSynonyms: ["planned", "coming soon", "in progress"],
  },
] as const;

export function getLanguageForVerdict(verdict: ReadinessVerdict): StatusLanguageEntry | undefined {
  return STATUS_LANGUAGE_POLICY.find(e => e.verdict === verdict);
}

export function isProhibitedLanguage(text: string): { prohibited: boolean; matchedSynonym?: string; forVerdict?: ReadinessVerdict } {
  const lower = text.toLowerCase();
  for (const entry of STATUS_LANGUAGE_POLICY) {
    for (const syn of entry.prohibitedSynonyms) {
      if (lower.includes(syn)) {
        return { prohibited: true, matchedSynonym: syn, forVerdict: entry.verdict };
      }
    }
  }
  return { prohibited: false };
}