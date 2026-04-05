export { ARCHITECTURE_GOVERNANCE_AGENTS } from "@/lib/internal-agents/agents/architecture-governance";

/**
 * Architecture Governance Council — Contract-Level Extension
 */
export interface ArchitectureGovernancePolicy {
  maxPackageCouplingDepth: number;
  enforceBarrelExports: boolean;
  prohibitCircularImports: boolean;
  requiredContractCoverage: number;
  maxFileSizeLines: number;
  enforceNamingConventions: boolean;
  allowedImportPaths: string[];
  blockedImportPaths: string[];
}

export interface ArchitectureDriftReport {
  agentId: string;
  evaluatedAt: string;
  violations: ArchitectureViolation[];
  score: number;
  trend: "improving" | "stable" | "degrading";
  recommendations: string[];
}

export interface ArchitectureViolation {
  id: string;
  rule: string;
  file: string;
  severity: "error" | "warning" | "info";
  description: string;
  autoFixable: boolean;
  suggestedFix?: string;
}
