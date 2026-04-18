// ═══════════════════════════════════════════════════════════════
// SITA OS — Multi-Tenant Sovereignty
// Rule 32: No cross-tenant leakage. Everything tenant-scoped.
// ═══════════════════════════════════════════════════════════════

export interface TenantBoundary {
  tenantId: string;
  displayName: string;
  type: "individual" | "household" | "organization";
  createdAt: string;
  sovereigntyFlags: {
    dataResidency: string;        // e.g., "eu", "us", "global"
    exportEnabled: boolean;
    deleteOnDemand: boolean;
    auditRetentionDays: number;
    encryptionRequired: boolean;
  };
}

export interface TenantScope {
  tenantId: string;
  // Every subsystem must be scoped
  policyBundleId: string;
  memoryNamespace: string;
  graphPartition: string;
  approvalQueueId: string;
  budgetPolicyId: string;
  observabilityNamespace: string;
  eventStreamId: string;
  proofLedgerId: string;
}

// ── Tenant Isolation Validator ──────────────────────────────

export function validateTenantIsolation(
  requestTenantId: string,
  resourceTenantId: string,
): { allowed: boolean; violation?: string } {
  if (requestTenantId !== resourceTenantId) {
    return {
      allowed: false,
      violation: `Cross-tenant access attempt: request=${requestTenantId}, resource=${resourceTenantId}`,
    };
  }
  return { allowed: true };
}

export function scopeQuery<T extends { tenantId: string }>(
  items: T[],
  tenantId: string,
): T[] {
  return items.filter(item => item.tenantId === tenantId);
}

// ── Tenant Support Safety ───────────────────────────────────

export interface TenantSafeView {
  viewId: string;
  tenantId: string;
  viewerRole: "operator" | "support" | "system";
  redactedFields: string[];
  accessLog: {
    viewerId: string;
    viewedAt: string;
    reason: string;
    approvalId?: string;
  };
}

export function createTenantSafeView(
  tenantId: string,
  viewerRole: TenantSafeView["viewerRole"],
  viewerId: string,
  reason: string,
): TenantSafeView {
  const redacted = viewerRole === "support"
    ? ["financialData", "personalIdentifiers", "memoryContent", "connectorCredentials"]
    : viewerRole === "operator"
    ? ["connectorCredentials"]
    : [];

  return {
    viewId: crypto.randomUUID(),
    tenantId,
    viewerRole,
    redactedFields: redacted,
    accessLog: {
      viewerId,
      viewedAt: new Date().toISOString(),
      reason,
    },
  };
}
