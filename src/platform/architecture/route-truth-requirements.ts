// ═══════════════════════════════════════════════════════════════
// SITA OS — Route → Truth Primitive Requirements
// Declares which truth/evidence primitives are required for
// trust-sensitive routes (boardroom, money, AI, approvals).
// ═══════════════════════════════════════════════════════════════

import type { TruthPrimitive } from "./route-intent-taxonomy";

export interface RouteTruthEntry {
  readonly prefix: string;
  readonly family: string;
  readonly requiredPrimitives: readonly TruthPrimitive[];
  readonly rationale: string;
}

export const ROUTE_TRUTH_MAP: readonly RouteTruthEntry[] = [
  { prefix: "/money", family: "Money", requiredPrimitives: ["STATUS", "PROVENANCE", "EVIDENCE", "AI_DISCLOSURE", "RECEIPT"], rationale: "Financial data requires full provenance and evidence chain" },
  { prefix: "/boardroom", family: "Boardroom", requiredPrimitives: ["STATUS", "PROVENANCE", "EVIDENCE", "AI_DISCLOSURE", "RECEIPT", "PROOF_BUNDLE"], rationale: "AI-driven advisory requires maximum truth coverage" },
  { prefix: "/concierge", family: "Concierge", requiredPrimitives: ["AI_DISCLOSURE", "RECEIPT"], rationale: "AI agent interactions require disclosure and receipts" },
  { prefix: "/advisors", family: "Advisors", requiredPrimitives: ["AI_DISCLOSURE", "RECEIPT"], rationale: "AI advisor system requires disclosure and receipts" },
  { prefix: "/investment-office", family: "Investment", requiredPrimitives: ["STATUS", "PROVENANCE", "EVIDENCE", "AI_DISCLOSURE"], rationale: "Investment data involves financial trust" },
  { prefix: "/revenue-office", family: "Revenue", requiredPrimitives: ["STATUS", "EVIDENCE", "RECEIPT"], rationale: "Revenue and invoicing requires evidence trail" },
  { prefix: "/connectors", family: "Connectors", requiredPrimitives: ["STATUS", "PROVENANCE"], rationale: "External integrations require provenance tracking" },
  { prefix: "/governance", family: "Governance", requiredPrimitives: ["STATUS", "EVIDENCE"], rationale: "Governance decisions require evidence" },
  { prefix: "/admin", family: "Admin", requiredPrimitives: ["STATUS", "EVIDENCE", "RECEIPT"], rationale: "Admin actions require audit receipts" },
  { prefix: "/owner", family: "Owner", requiredPrimitives: ["STATUS", "EVIDENCE", "RECEIPT", "PROOF_BUNDLE"], rationale: "Owner-level actions require full proof" },
  { prefix: "/files", family: "Files", requiredPrimitives: ["STATUS", "PROVENANCE"], rationale: "File provenance tracking" },
  { prefix: "/policies", family: "Policies", requiredPrimitives: ["STATUS"], rationale: "Policy status tracking" },
  { prefix: "/business", family: "Business", requiredPrimitives: ["STATUS"], rationale: "Business data status tracking" },
];

export function getRouteTruthRequirements(prefix: string): RouteTruthEntry | undefined {
  let best: RouteTruthEntry | undefined;
  for (const entry of ROUTE_TRUTH_MAP) {
    if (prefix === entry.prefix || prefix.startsWith(entry.prefix + "/")) {
      if (!best || entry.prefix.length > best.prefix.length) best = entry;
    }
  }
  return best;
}

export function isRouteTruthSensitive(prefix: string): boolean {
  return getRouteTruthRequirements(prefix) !== undefined;
}