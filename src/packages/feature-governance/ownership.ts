// ═══════════════════════════════════════════════════════════════
// SITA OS — Owner Boundary Protocol
// Canonical ownership taxonomy, smallest-correct-owner validation,
// rejection rules, and boundary classification
// ═══════════════════════════════════════════════════════════════

// ── Owner Boundary Types (8 canonical) ──────────────────────

export const OWNER_BOUNDARY_TYPES = {
  "surface": { label: "Surface Code", description: "UI components, pages, layouts — thin presentation layer" },
  "domain-module": { label: "Domain Module", description: "Business/Finance/Concierge domain logic — exactly 3 allowed" },
  "shared-package": { label: "Shared Package", description: "Cross-domain contracts, types, utilities in src/packages" },
  "governance-organ": { label: "Governance/Trust Organ", description: "Policy engine, trust state, approval service, fraud sentinel" },
  "execution-organ": { label: "Execution Organ", description: "Executor service, workflow engine, canonical chain orchestrator" },
  "support-admin": { label: "Support/Admin Code", description: "Admin API, diagnostics, support tools, incident management" },
  "worker-workflow": { label: "Worker/Workflow", description: "Background jobs, Temporal workflows, event processors, edge functions" },
  "generated-truth": { label: "Generated Truth", description: "Auto-generated registries, manifests, indexes in generated/" },
} as const;

export type OwnerBoundaryType = keyof typeof OWNER_BOUNDARY_TYPES;

// ── Owner Preference (smallest-correct-owner order) ─────────

export const OWNER_PREFERENCES = [
  "extend-existing",
  "shared-package",
  "worker-workflow",
  "projection",
  "new-owner",
] as const;

export type OwnerPreference = typeof OWNER_PREFERENCES[number];

export const ownerPreferenceRank = (pref: OwnerPreference): number =>
  OWNER_PREFERENCES.indexOf(pref);

// ── Owner Rejection Rules (7 canonical) ─────────────────────

export const OWNER_REJECTION_RULES = {
  "duplicates-owner": { description: "Proposed owner duplicates an existing owner's responsibility" },
  "fat-surface": { description: "Would make a surface layer contain business logic or state management" },
  "second-brain": { description: "Would create a second orchestration brain alongside brain-core" },
  "fourth-domain": { description: "Would create a fourth domain module beyond business/finance/concierge" },
  "local-truth": { description: "Moves shared truth into a local folder instead of packages or generated" },
  "provider-in-domain": { description: "Puts provider/connector logic directly inside a domain module" },
  "unsupported-root": { description: "Creates an unsupported top-level directory or root-level module" },
} as const;

export type OwnerRejectionRule = keyof typeof OWNER_REJECTION_RULES;

// ── Owner Boundary Declaration ──────────────────────────────

export interface OwnerBoundaryDeclaration {
  readonly featureId: string;
  readonly primaryOwner: string;
  readonly boundaryType: OwnerBoundaryType;
  readonly justification: string;
  readonly whyNotElsewhere: string;
  readonly ownerPreference: OwnerPreference;
  readonly secondaryOwners: readonly string[];
  readonly touchesTrustBearing: boolean;
  readonly extendsExisting: boolean;
  readonly existingOwnerExtended?: string;
}

// ── Canonical Domain Modules ────────────────────────────────

const CANONICAL_DOMAINS = ["business", "finance", "concierge"] as const;
const CANONICAL_BRAIN = "brain-core";

// ── Boundary Classification from File Path ──────────────────

export function classifyOwnerBoundary(filePath: string): OwnerBoundaryType {
  const normalized = filePath.replace(/\\/g, "/");

  if (normalized.startsWith("generated/")) return "generated-truth";
  if (normalized.startsWith("src/pages/") || normalized.startsWith("src/components/")) return "surface";
  if (normalized.startsWith("src/packages/")) return "shared-package";
  if (normalized.startsWith("supabase/functions/") || normalized.startsWith("src/lib/services/")) return "worker-workflow";

  if (normalized.includes("core-services/policy-engine") ||
      normalized.includes("core-services/trust-state") ||
      normalized.includes("core-services/approval-service") ||
      normalized.includes("core-services/fraud-sentinel") ||
      normalized.includes("core-services/verification-engine")) {
    return "governance-organ";
  }

  if (normalized.includes("core-services/executor-service") ||
      normalized.includes("core-services/workflow-engine") ||
      normalized.includes("services/brain-core")) {
    return "execution-organ";
  }

  if (normalized.includes("admin") || normalized.includes("support-diagnostics")) {
    return "support-admin";
  }

  if (normalized.includes("domain-engines/business") ||
      normalized.includes("domain-engines/finance") ||
      normalized.includes("domain-engines/concierge") ||
      normalized.includes("domain-engines/revenue") ||
      normalized.includes("domain-engines/investment")) {
    return "domain-module";
  }

  // Default to shared-package for anything in src/lib
  if (normalized.startsWith("src/lib/")) return "shared-package";

  return "surface";
}

// ── Owner Boundary Validation ───────────────────────────────

export interface OwnerValidationContext {
  readonly existingOwners: readonly string[];
  readonly existingDomains: readonly string[];
  readonly brainOwner: string;
  readonly surfaceFiles: readonly string[];
}

const DEFAULT_CONTEXT: OwnerValidationContext = {
  existingOwners: [],
  existingDomains: [...CANONICAL_DOMAINS],
  brainOwner: CANONICAL_BRAIN,
  surfaceFiles: [],
};

export function validateOwnerBoundary(
  declaration: OwnerBoundaryDeclaration,
  context: OwnerValidationContext = DEFAULT_CONTEXT,
): { errors: string[]; rejections: OwnerRejectionRule[] } {
  const errors: string[] = [];
  const rejections: OwnerRejectionRule[] = [];

  // Required fields
  if (!declaration.featureId) errors.push("Missing featureId in owner declaration");
  if (!declaration.primaryOwner) errors.push("Missing primaryOwner");
  if (!declaration.boundaryType) errors.push("Missing boundaryType");
  if (!declaration.justification) errors.push("Missing justification — ownership must be justified before implementation");
  if (!declaration.whyNotElsewhere) errors.push("Missing whyNotElsewhere — must explain why other owners are wrong");
  if (!declaration.ownerPreference) errors.push("Missing ownerPreference");

  // Rejection rule: duplicates-owner
  if (context.existingOwners.includes(declaration.primaryOwner) && !declaration.extendsExisting) {
    errors.push(`Owner "${declaration.primaryOwner}" already exists — must extend existing or justify new`);
    rejections.push("duplicates-owner");
  }

  // Rejection rule: fat-surface
  if (declaration.boundaryType === "surface" && declaration.touchesTrustBearing) {
    errors.push("Surface code must not contain trust-bearing logic — move to domain module or governance organ");
    rejections.push("fat-surface");
  }

  // Rejection rule: second-brain
  if (declaration.boundaryType === "execution-organ" &&
      declaration.primaryOwner !== context.brainOwner &&
      !declaration.extendsExisting) {
    errors.push(`Cannot create a second brain — only "${context.brainOwner}" is the canonical orchestrator`);
    rejections.push("second-brain");
  }

  // Rejection rule: fourth-domain
  if (declaration.boundaryType === "domain-module") {
    const isDomainKnown = CANONICAL_DOMAINS.some(d => declaration.primaryOwner.includes(d));
    if (!isDomainKnown) {
      errors.push(`Cannot create a fourth domain module — only ${CANONICAL_DOMAINS.join(", ")} are allowed`);
      rejections.push("fourth-domain");
    }
  }

  // Rejection rule: local-truth
  if (declaration.boundaryType !== "shared-package" &&
      declaration.boundaryType !== "generated-truth" &&
      declaration.primaryOwner.includes("truth")) {
    errors.push("Truth/shared contracts must live in packages or generated — not in local folders");
    rejections.push("local-truth");
  }

  // Rejection rule: provider-in-domain
  if (declaration.boundaryType === "domain-module" &&
      declaration.primaryOwner.includes("connector")) {
    errors.push("Connector/provider logic must not live inside domain modules — use worker-workflow or shared-package");
    rejections.push("provider-in-domain");
  }

  // Rejection rule: unsupported-root
  const SUPPORTED_ROOTS = ["src", "supabase", "generated", "scripts", "docs", "security", "public"];
  const rootDir = declaration.primaryOwner.split("/")[0];
  if (rootDir && !SUPPORTED_ROOTS.some(r => declaration.primaryOwner.startsWith(r)) &&
      declaration.boundaryType !== "shared-package" && declaration.boundaryType !== "generated-truth") {
    // Only flag if primaryOwner looks like a path
    if (declaration.primaryOwner.includes("/")) {
      errors.push(`Unsupported root directory "${rootDir}" — use one of: ${SUPPORTED_ROOTS.join(", ")}`);
      rejections.push("unsupported-root");
    }
  }

  // Smallest-correct-owner preference validation
  if (declaration.ownerPreference === "new-owner" && !declaration.justification.includes("uniquely")) {
    errors.push("Creating a new owner requires explicit unique justification — include 'uniquely' in justification");
  }

  return { errors, rejections };
}

// ── Helpers ─────────────────────────────────────────────────

export function isSmallestCorrectOwner(pref: OwnerPreference): boolean {
  return ownerPreferenceRank(pref) <= ownerPreferenceRank("worker-workflow");
}

export function getOwnerBoundaryLabel(type: OwnerBoundaryType): string {
  return OWNER_BOUNDARY_TYPES[type].label;
}

export function getAllRejectionRules(): readonly OwnerRejectionRule[] {
  return Object.keys(OWNER_REJECTION_RULES) as OwnerRejectionRule[];
}
