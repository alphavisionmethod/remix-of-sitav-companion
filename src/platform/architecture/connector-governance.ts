// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Governance
// Connectors are security boundaries, not simple integrations.
// ═══════════════════════════════════════════════════════════════

export type ConnectorStatus = "pending-certification" | "certified" | "active" | "degraded" | "suspended" | "deprecated" | "killed";

export interface ConnectorManifest {
  connectorId: string;
  name: string;
  provider: string;
  version: string;

  // Declared capabilities and permissions
  declaredCapabilities: string[];
  scopedPermissions: string[];
  actionClasses: Array<{
    action: string;
    riskClass: "informational" | "low" | "medium" | "high" | "irreversible";
    evidenceRequired: "claimed" | "observed" | "verified";
  }>;

  // Environment & isolation
  environmentRestrictions: ("development" | "staging" | "production")[];
  sandboxAvailable: boolean;
  testPath: string;

  // Rate limits & budget
  rateLimitPerMinute: number;
  rateLimitPerHour: number;
  budgetAware: boolean;
  costPerAction?: number;

  // Idempotency & retry
  idempotencyStrategy: "client-generated-key" | "server-dedup" | "none";
  retryStrategy: {
    maxRetries: number;
    backoffMs: number;
    retryableStatusCodes: number[];
  };

  // Health & deprecation
  healthCheckEndpoint?: string;
  healthCheckIntervalMs: number;
  deprecationDate?: string;
  deprecationReplacement?: string;

  // Kill switch
  killSwitchEnabled: boolean;

  // Ownership
  ownerId: string;            // team/person responsible
  certificationDate?: string;
  certifiedBy?: string;
  lastAuditDate?: string;

  // Metadata
  status: ConnectorStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectorPolicyOverlay {
  overlayId: string;
  connectorId: string;
  tenantId: string;
  additionalRules: Array<{
    condition: string;
    action: "allow" | "deny" | "require-approval" | "escalate";
  }>;
  maxDailyActions?: number;
  maxDailyCostCents?: number;
  allowedActionClasses: string[];
  blockedActionClasses: string[];
  createdAt: string;
}

export interface ConnectorHealthReport {
  connectorId: string;
  status: "healthy" | "degraded" | "unhealthy" | "unreachable";
  latencyMs: number;
  errorRate: number;         // 0-1
  lastSuccessAt?: string;
  lastFailureAt?: string;
  consecutiveFailures: number;
  checkedAt: string;
}

// ── Connector Lifecycle ─────────────────────────────────────

export function certifyConnector(manifest: ConnectorManifest, certifiedBy: string): ConnectorManifest {
  return {
    ...manifest,
    status: "certified",
    certificationDate: new Date().toISOString(),
    certifiedBy,
    updatedAt: new Date().toISOString(),
  };
}

export function killConnector(manifest: ConnectorManifest, reason: string): ConnectorManifest {
  return {
    ...manifest,
    status: "killed",
    updatedAt: new Date().toISOString(),
  };
}

export function validateConnectorAction(
  manifest: ConnectorManifest,
  actionName: string,
  overlay?: ConnectorPolicyOverlay,
): { allowed: boolean; reason: string } {
  if (manifest.status === "killed") return { allowed: false, reason: "Connector killed" };
  if (manifest.status === "suspended") return { allowed: false, reason: "Connector suspended" };
  if (manifest.status === "pending-certification") return { allowed: false, reason: "Connector not yet certified" };
  if (manifest.status === "deprecated") return { allowed: false, reason: `Connector deprecated. Use ${manifest.deprecationReplacement}` };

  const actionClass = manifest.actionClasses.find(a => a.action === actionName);
  if (!actionClass) return { allowed: false, reason: `Action ${actionName} not declared in connector manifest` };

  if (overlay) {
    if (overlay.blockedActionClasses.includes(actionName)) {
      return { allowed: false, reason: `Action ${actionName} blocked by tenant policy overlay` };
    }
  }

  return { allowed: true, reason: "Action permitted" };
}
