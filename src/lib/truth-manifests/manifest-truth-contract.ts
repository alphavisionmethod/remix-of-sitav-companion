// ═══════════════════════════════════════════════════════════════
// SITA OS — Manifest Truth Contract
// Defines what constitutes authoritative vs informational truth
// ═══════════════════════════════════════════════════════════════

import type { ManifestAuthority, ManifestClass } from "./manifest-types";

export interface TruthContractRule {
  id: string;
  rule: string;
  applies_to: ManifestClass[];
  enforcement: "ci-block" | "ci-warn" | "audit-only";
}

export const MANIFEST_TRUTH_CONTRACT: readonly TruthContractRule[] = [
  {
    id: "TC-001",
    rule: "Authoritative manifests MUST have a validator script that runs in CI",
    applies_to: ["structural", "contract", "runtime"],
    enforcement: "ci-block",
  },
  {
    id: "TC-002",
    rule: "Authoritative manifests MUST declare at least one source input",
    applies_to: ["structural", "contract", "runtime"],
    enforcement: "ci-block",
  },
  {
    id: "TC-003",
    rule: "Compliance manifests MUST declare an owner domain",
    applies_to: ["compliance"],
    enforcement: "ci-warn",
  },
  {
    id: "TC-004",
    rule: "Informational manifests SHOULD declare consumers but are not CI-gated",
    applies_to: ["informational"],
    enforcement: "audit-only",
  },
  {
    id: "TC-005",
    rule: "Runtime manifests MUST declare runtime consequence of drift",
    applies_to: ["runtime"],
    enforcement: "ci-block",
  },
  {
    id: "TC-006",
    rule: "Contract manifests MUST declare release consequence of drift",
    applies_to: ["contract"],
    enforcement: "ci-block",
  },
  {
    id: "TC-007",
    rule: "No manifest may exist without a classification (class + authority)",
    applies_to: ["structural", "contract", "runtime", "compliance", "informational"],
    enforcement: "ci-block",
  },
  {
    id: "TC-008",
    rule: "Derived manifests must reference the authoritative source they are derived from",
    applies_to: ["structural", "contract", "runtime", "compliance", "informational"],
    enforcement: "ci-warn",
  },
] as const;

/** Determine authority level based on manifest class */
export function inferAuthority(cls: ManifestClass): ManifestAuthority {
  switch (cls) {
    case "structural":
    case "contract":
      return "authoritative";
    case "runtime":
    case "compliance":
      return "derived";
    case "informational":
      return "informational";
  }
}

/** Check if a manifest entry violates any truth contract rules */
export function checkTruthContractViolations(entry: {
  class: ManifestClass;
  authority: ManifestAuthority;
  validator: string | null;
  sourceInputs: string[];
  owner: string;
  runtimeConsequence: string;
  releaseConsequence: string;
  consumers: string[];
}): string[] {
  const violations: string[] = [];

  for (const rule of MANIFEST_TRUTH_CONTRACT) {
    if (!rule.applies_to.includes(entry.class)) continue;

    switch (rule.id) {
      case "TC-001":
        if (entry.authority === "authoritative" && !entry.validator)
          violations.push(`${rule.id}: ${rule.rule}`);
        break;
      case "TC-002":
        if (entry.authority === "authoritative" && entry.sourceInputs.length === 0)
          violations.push(`${rule.id}: ${rule.rule}`);
        break;
      case "TC-003":
        if (!entry.owner) violations.push(`${rule.id}: ${rule.rule}`);
        break;
      case "TC-005":
        if (!entry.runtimeConsequence) violations.push(`${rule.id}: ${rule.rule}`);
        break;
      case "TC-006":
        if (!entry.releaseConsequence) violations.push(`${rule.id}: ${rule.rule}`);
        break;
      case "TC-007":
        if (!entry.class || !entry.authority) violations.push(`${rule.id}: ${rule.rule}`);
        break;
    }
  }

  return violations;
}
