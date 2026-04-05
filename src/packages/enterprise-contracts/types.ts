// ═══════════════════════════════════════════════════════════════
// SITA OS — Enterprise Control Plane Contracts
// Comprehensive enterprise governance, tenant isolation, RBAC,
// compliance gates, and operational security types.
// ═══════════════════════════════════════════════════════════════

// ── Tenant Firewall ──────────────────────────────────────────

export interface TenantFirewallRule {
  id: string;
  user_id: string;
  action: "allow" | "deny" | "audit";
  resource: string;
  source_scope: string;
  conditions: Record<string, unknown>;
  priority: number;
  active: boolean;
  created_at: string;
  expires_at?: string;
  justification?: string;
  approved_by?: string;
}

export interface FirewallEvaluationResult {
  ruleId: string;
  action: "allow" | "deny" | "audit";
  matched: boolean;
  evaluatedAt: string;
  requestContext: {
    actor: string;
    resource: string;
    operation: string;
    sourceIp?: string;
    domain: string;
  };
  auditTrailId?: string;
}

// ── Enterprise Audit ─────────────────────────────────────────

export interface EnterpriseAuditReview {
  id: string;
  user_id: string;
  period: string;
  reviewed_at: string;
  reviewer: string;
  tables_audited: string[];
  total_events: number;
  anomalies_detected: number;
  anomaly_details: Array<{ table: string; event: string; severity: string; notes: string }>;
  compliance_status: "compliant" | "review-needed" | "non-compliant";
  recommendations: string[];
  signed_hash?: string;
  attestation?: {
    attester: string;
    attestedAt: string;
    statement: string;
  };
}

// ── RBAC & Permissions ───────────────────────────────────────

export interface RolePermissionGrant {
  id: string;
  user_id: string;
  role: string;
  permissions: string[];
  scope: "global" | "domain" | "resource";
  scope_value?: string;
  granted_by: string;
  granted_at: string;
  expires_at?: string;
  revoked_at?: string;
  active: boolean;
  justification?: string;
  approval_id?: string;
}

export interface PermissionEvaluation {
  grantId: string;
  permission: string;
  resource: string;
  allowed: boolean;
  reason: string;
  policyChain: string[];
  evaluatedAt: string;
}

export interface RoleHierarchy {
  role: string;
  inheritsFrom: string[];
  permissions: string[];
  restrictions: string[];
  maxSessionDuration: number;
  requiresMFA: boolean;
  auditLevel: "standard" | "enhanced" | "forensic";
}

// ── Compliance Gates ─────────────────────────────────────────

export type ComplianceGateType =
  | "data-residency" | "encryption-at-rest" | "encryption-in-transit"
  | "access-logging" | "key-rotation" | "backup-verification"
  | "rls-enforcement" | "secret-management" | "api-rate-limiting";

export interface ComplianceGate {
  id: string;
  type: ComplianceGateType;
  status: "passing" | "failing" | "degraded" | "not-evaluated";
  lastEvaluated: string;
  frequency: "continuous" | "hourly" | "daily" | "weekly";
  evidence: string[];
  remediationSteps?: string[];
  owner: string;
  slaMinutes: number;
}

export interface CompliancePosture {
  tenantId: string;
  evaluatedAt: string;
  overallStatus: "compliant" | "at-risk" | "non-compliant";
  gates: ComplianceGate[];
  score: number;
  openRemediations: number;
  nextReviewDate: string;
}

// ── Control Plane Events ─────────────────────────────────────

export type ControlPlaneEventType =
  | "firewall.rule-created" | "firewall.rule-updated" | "firewall.rule-triggered"
  | "audit.review-completed" | "audit.anomaly-detected"
  | "role.granted" | "role.revoked" | "role.expired"
  | "tenant.config-changed" | "tenant.limits-updated"
  | "compliance.gate-failed" | "compliance.gate-restored"
  | "security.mfa-enforced" | "security.session-revoked"
  | "data.export-requested" | "data.deletion-requested";

export interface ControlPlaneEvent {
  id: string;
  user_id: string;
  type: ControlPlaneEventType;
  timestamp: string;
  actor: string;
  target_type: string;
  target_id: string;
  details: Record<string, unknown>;
  severity: "info" | "warning" | "critical";
  correlationId?: string;
  acknowledged?: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

// ── Tenant Configuration ─────────────────────────────────────

export interface TenantLimits {
  tenantId: string;
  maxUsers: number;
  maxAdvisors: number;
  maxStorageGB: number;
  maxAIRequestsPerDay: number;
  maxWorkflowsActive: number;
  apiRateLimit: number;
  retentionDays: number;
  features: string[];
  tier: "starter" | "professional" | "enterprise" | "sovereign";
  updatedAt: string;
}

export interface TenantSecurityPolicy {
  tenantId: string;
  mfaRequired: boolean;
  mfaMethods: ("totp" | "sms" | "webauthn" | "email")[];
  sessionMaxAge: number;
  ipAllowlist?: string[];
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    maxAge: number;
    historyCount: number;
  };
  dataClassificationRequired: boolean;
  encryptionKeyRotationDays: number;
  auditLogRetentionDays: number;
}

// ── Operational Security ─────────────────────────────────────

export interface SecurityIncident {
  id: string;
  tenantId: string;
  type: "unauthorized-access" | "data-breach" | "policy-violation" | "anomaly" | "system-compromise";
  severity: "critical" | "high" | "medium" | "low";
  status: "detected" | "investigating" | "contained" | "resolved" | "post-mortem";
  detectedAt: string;
  detectedBy: "system" | "user" | "audit" | "external";
  affectedResources: string[];
  timeline: Array<{ timestamp: string; action: string; actor: string; notes: string }>;
  rootCause?: string;
  remediationActions: string[];
  lessonsLearned?: string[];
  reportId?: string;
}

export interface SecretRotationRecord {
  id: string;
  tenantId: string;
  secretName: string;
  rotatedAt: string;
  rotatedBy: "system" | "manual";
  previousVersion: number;
  newVersion: number;
  expiresAt: string;
  verified: boolean;
  affectedServices: string[];
}
