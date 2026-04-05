export { SECURITY_TRUST_AGENTS } from "@/lib/internal-agents/agents/security-trust";

/**
 * Security & Trust Council — Contract-Level Extension
 */
export interface ThreatSignal {
  id: string;
  type: "brute-force" | "credential-stuffing" | "privilege-escalation" | "data-exfiltration"
    | "anomalous-access" | "policy-tampering" | "injection-attempt" | "session-hijacking";
  severity: "critical" | "high" | "medium" | "low";
  source: string;
  targetResource: string;
  indicators: string[];
  detectedAt: string;
  autoBlocked: boolean;
  falsePositiveScore: number;
  correlatedIncidentId?: string;
}

export interface TrustPostureAssessment {
  tenantId: string;
  assessedAt: string;
  overallScore: number;
  dimensions: {
    authenticationStrength: number;
    authorizationCoverage: number;
    dataEncryption: number;
    auditCompleteness: number;
    secretManagement: number;
    rlsPolicyCoverage: number;
    apiSecurity: number;
    incidentResponseReadiness: number;
  };
  weaknesses: Array<{ area: string; severity: string; recommendation: string }>;
  complianceGaps: string[];
}

export interface PermissionHygieneReport {
  tenantId: string;
  evaluatedAt: string;
  totalGrants: number;
  activeGrants: number;
  overPermissioned: Array<{ userId: string; excessPermissions: string[]; recommendation: string }>;
  unusedPermissions: Array<{ permission: string; lastUsed: string; grantCount: number }>;
  score: number;
}

export interface SecurityHardeningTask {
  id: string;
  category: "authentication" | "authorization" | "encryption" | "monitoring" | "network" | "configuration";
  title: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "identified" | "planned" | "implementing" | "completed" | "deferred";
  effort: "minutes" | "hours" | "days" | "weeks";
  impact: "high" | "medium" | "low";
  verificationMethod: string;
}
