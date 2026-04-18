// ═══════════════════════════════════════════════════════════════
// SITA OS — OS Unification Layer
// Rule 25: One common operating substrate for all surfaces/modules.
// Domain modules consume platform contracts, never reinvent.
// Rule 26: Surfaces may not own business logic.
// ═══════════════════════════════════════════════════════════════

export interface PlatformContract {
  contractId: string;
  name: string;
  category: PlatformContractCategory;
  version: number;
  description: string;
  consumedBy: string[];          // module/surface IDs
  providedBy: string;            // canonical service ID
}

export type PlatformContractCategory =
  | "identity"
  | "memory"
  | "policy"
  | "workflow"
  | "proof"
  | "execution"
  | "eventing"
  | "routing"
  | "advisor-invocation"
  | "observability"
  | "cost-governance"
  | "permissions"
  | "surface-contract";

// ── Surface Contract ────────────────────────────────────────

export type SurfaceType = "web" | "mobile" | "admin" | "device" | "xr" | "api";

export interface SurfaceContract {
  surfaceId: string;
  type: SurfaceType;
  // What surfaces CAN do
  allowedOperations: (
    | "render"
    | "collect-input"
    | "request-approval"
    | "display-state"
    | "emit-user-intent"
  )[];
  // What surfaces CANNOT do (enforced)
  prohibitedOperations: (
    | "policy-logic"
    | "authority-logic"
    | "workflow-rules"
    | "business-decisioning"
    | "direct-connector-call"
    | "memory-write-without-provenance"
  )[];
  // Platform contracts this surface consumes
  consumesPlatformContracts: PlatformContractCategory[];
}

// ── Default Surface Contracts ───────────────────────────────

export const WEB_SURFACE_CONTRACT: SurfaceContract = {
  surfaceId: "web-surface",
  type: "web",
  allowedOperations: ["render", "collect-input", "request-approval", "display-state", "emit-user-intent"],
  prohibitedOperations: ["policy-logic", "authority-logic", "workflow-rules", "business-decisioning", "direct-connector-call", "memory-write-without-provenance"],
  consumesPlatformContracts: ["identity", "memory", "policy", "workflow", "proof", "execution", "eventing", "routing", "advisor-invocation", "observability", "cost-governance", "permissions"],
};

export const MOBILE_SURFACE_CONTRACT: SurfaceContract = {
  surfaceId: "mobile-surface",
  type: "mobile",
  allowedOperations: ["render", "collect-input", "request-approval", "display-state", "emit-user-intent"],
  prohibitedOperations: ["policy-logic", "authority-logic", "workflow-rules", "business-decisioning", "direct-connector-call", "memory-write-without-provenance"],
  consumesPlatformContracts: ["identity", "permissions", "proof", "observability"],
};

export const ADMIN_SURFACE_CONTRACT: SurfaceContract = {
  surfaceId: "admin-surface",
  type: "admin",
  allowedOperations: ["render", "collect-input", "request-approval", "display-state", "emit-user-intent"],
  prohibitedOperations: ["policy-logic", "authority-logic", "workflow-rules", "business-decisioning", "direct-connector-call", "memory-write-without-provenance"],
  consumesPlatformContracts: ["identity", "memory", "policy", "workflow", "proof", "execution", "eventing", "routing", "advisor-invocation", "observability", "cost-governance", "permissions"],
};

// ── Domain Module Contract ──────────────────────────────────

export interface DomainModuleContract {
  moduleId: "finance-os" | "business-os" | "concierge-os";
  // What domains CAN do
  allowedOperations: ("reason" | "evaluate" | "explain" | "propose")[];
  // What domains CANNOT do (enforced)
  prohibitedOperations: (
    | "execute"
    | "call-api"
    | "call-other-domain"
    | "share-database"
    | "write-receipt"
    | "invoke-connector"
  )[];
  consumesPlatformContracts: PlatformContractCategory[];
}

export const DOMAIN_MODULE_CONTRACT: DomainModuleContract = {
  moduleId: "finance-os",
  allowedOperations: ["reason", "evaluate", "explain", "propose"],
  prohibitedOperations: ["execute", "call-api", "call-other-domain", "share-database", "write-receipt", "invoke-connector"],
  consumesPlatformContracts: ["identity", "memory", "policy", "proof", "observability", "permissions"],
};

// ── Unification Validation ──────────────────────────────────

export function validateSurfaceCompliance(
  surface: SurfaceContract,
  operation: string,
): { compliant: boolean; violation?: string } {
  if ((surface.prohibitedOperations as string[]).includes(operation)) {
    return { compliant: false, violation: `Surface ${surface.surfaceId} cannot perform: ${operation}` };
  }
  return { compliant: true };
}

export function validateDomainCompliance(
  module: DomainModuleContract,
  operation: string,
): { compliant: boolean; violation?: string } {
  if ((module.prohibitedOperations as string[]).includes(operation)) {
    return { compliant: false, violation: `Domain ${module.moduleId} cannot perform: ${operation}` };
  }
  return { compliant: true };
}
