// ═══════════════════════════════════════════════════════════════
// SITA OS — Compliance, Legal, Regional & Multi-Account Engine
// Data export, account deletion, regional, multi-profile
// ═══════════════════════════════════════════════════════════════

// ─── Types ────────────────────────────────────────────────────

export type AccountType = "personal" | "work" | "guest" | "child" | "managed";

export interface UserAccount {
  id: string;
  userId: string;
  type: AccountType;
  displayName: string;
  email?: string;
  isActive: boolean;
  isPrimary: boolean;
  namespacePrefix: string;
  restrictions: AccountRestrictions;
  region: string;
  createdAt: string;
}

export interface AccountRestrictions {
  maxDevices: number;
  allowedNamespaces: string[];
  blockedNamespaces: string[];
  canShare: boolean;
  canExport: boolean;
  canDelete: boolean;
  parentalControlsEnabled: boolean;
  contentFilterLevel: "none" | "moderate" | "strict";
}

export interface DataExportRequest {
  id: string;
  userId: string;
  accountId: string;
  type: "full" | "partial" | "settings-only" | "files-only";
  status: "requested" | "preparing" | "ready" | "downloaded" | "expired" | "failed";
  format: "zip" | "json" | "tar.gz";
  requestedAt: string;
  readyAt?: string;
  expiresAt?: string;
  downloadUrl?: string;
  sizeBytes?: number;
  includedNamespaces: string[];
}

export interface AccountDeletionWorkflow {
  id: string;
  userId: string;
  accountId: string;
  type: "account-only" | "full-erasure" | "gdpr-request";
  status: "initiated" | "grace-period" | "deleting" | "completed" | "cancelled";
  initiatedAt: string;
  gracePeriodEndsAt: string;
  completedAt?: string;
  dataExportId?: string;
  confirmations: Array<{ step: string; confirmedAt: string }>;
  legalHoldActive: boolean;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: "data-sync" | "analytics" | "push-notifications" | "data-sharing" | "marketing" | "third-party";
  granted: boolean;
  grantedAt?: string;
  revokedAt?: string;
  version: string;
  ipAddress?: string;
}

export interface RegionalPolicy {
  regionCode: string;
  displayName: string;
  dataResidency: "local" | "regional" | "global";
  retentionMaxDays: number;
  rightToErasure: boolean;
  consentRequired: boolean;
  childAgeRestriction: number;
  encryptionMandatory: boolean;
  auditTrailRequired: boolean;
}

export interface WebClientCapability {
  feature: string;
  supported: boolean;
  limitations?: string;
}

export interface ComplianceAuditEntry {
  id: string;
  userId: string;
  action: string;
  category: "data-access" | "export" | "deletion" | "consent" | "policy-change" | "account-change";
  details: Record<string, unknown>;
  timestamp: string;
  ipAddress?: string;
}

// ─── Compliance Engine ────────────────────────────────────────

class ComplianceEngine {
  private accounts = new Map<string, UserAccount>();
  private exports = new Map<string, DataExportRequest>();
  private deletions = new Map<string, AccountDeletionWorkflow>();
  private consents = new Map<string, ConsentRecord[]>(); // userId -> consents
  private regions = new Map<string, RegionalPolicy>();
  private auditLog: ComplianceAuditEntry[] = [];
  private webCapabilities: WebClientCapability[];

  constructor() {
    this.initDefaultRegions();
    this.webCapabilities = this.initWebCapabilities();
  }

  // ─── Multi-Account ─────────────────────────────────

  createAccount(userId: string, type: AccountType, displayName: string, region = "US", opts: Partial<AccountRestrictions> = {}): UserAccount {
    const account: UserAccount = {
      id: `acct_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId, type, displayName, isActive: true,
      isPrimary: !Array.from(this.accounts.values()).some(a => a.userId === userId),
      namespacePrefix: `${type}.${userId.slice(0, 8)}`,
      region,
      restrictions: {
        maxDevices: type === "child" ? 2 : type === "guest" ? 1 : 10,
        allowedNamespaces: type === "guest" ? ["files.shared"] : ["*"],
        blockedNamespaces: type === "child" ? ["files.work", "admin"] : [],
        canShare: type !== "child",
        canExport: type !== "guest",
        canDelete: type !== "guest" && type !== "child",
        parentalControlsEnabled: type === "child",
        contentFilterLevel: type === "child" ? "strict" : "none",
        ...opts,
      },
      createdAt: new Date().toISOString(),
    };
    this.accounts.set(account.id, account);
    this.logAudit(userId, "Account created", "account-change", { accountId: account.id, type });
    return account;
  }

  getUserAccounts(userId: string): UserAccount[] {
    return Array.from(this.accounts.values()).filter(a => a.userId === userId);
  }

  switchAccount(accountId: string): UserAccount | null {
    return this.accounts.get(accountId) ?? null;
  }

  deactivateAccount(accountId: string): void {
    const account = this.accounts.get(accountId);
    if (account) {
      account.isActive = false;
      this.logAudit(account.userId, "Account deactivated", "account-change", { accountId });
    }
  }

  // ─── Data Export ───────────────────────────────────

  requestExport(userId: string, accountId: string, type: DataExportRequest["type"] = "full", namespaces?: string[]): DataExportRequest {
    const exp: DataExportRequest = {
      id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId, accountId, type,
      status: "requested",
      format: "zip",
      requestedAt: new Date().toISOString(),
      includedNamespaces: namespaces ?? ["*"],
    };
    this.exports.set(exp.id, exp);
    this.logAudit(userId, "Data export requested", "export", { exportId: exp.id, type });

    // Simulate preparation
    setTimeout(() => {
      exp.status = "ready";
      exp.readyAt = new Date().toISOString();
      exp.expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();
      exp.sizeBytes = Math.round(Math.random() * 1073741824);
      exp.downloadUrl = `#export-${exp.id}`;
    }, 2000);

    return exp;
  }

  getExports(userId: string): DataExportRequest[] {
    return Array.from(this.exports.values()).filter(e => e.userId === userId);
  }

  // ─── Account Deletion ─────────────────────────────

  initiateAccountDeletion(userId: string, accountId: string, type: AccountDeletionWorkflow["type"] = "account-only"): AccountDeletionWorkflow {
    const wf: AccountDeletionWorkflow = {
      id: `del_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId, accountId, type,
      status: "initiated",
      initiatedAt: new Date().toISOString(),
      gracePeriodEndsAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      confirmations: [],
      legalHoldActive: false,
    };
    this.deletions.set(wf.id, wf);
    this.logAudit(userId, "Account deletion initiated", "deletion", { workflowId: wf.id, type });
    return wf;
  }

  confirmDeletionStep(workflowId: string, step: string): void {
    const wf = this.deletions.get(workflowId);
    if (wf) {
      wf.confirmations.push({ step, confirmedAt: new Date().toISOString() });
    }
  }

  cancelDeletion(workflowId: string): boolean {
    const wf = this.deletions.get(workflowId);
    if (!wf || wf.status === "completed") return false;
    wf.status = "cancelled";
    return true;
  }

  getDeletionWorkflows(userId: string): AccountDeletionWorkflow[] {
    return Array.from(this.deletions.values()).filter(d => d.userId === userId);
  }

  // ─── Consent ───────────────────────────────────────

  recordConsent(userId: string, consentType: ConsentRecord["consentType"], granted: boolean, version = "1.0"): ConsentRecord {
    const record: ConsentRecord = {
      id: `con_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId, consentType, granted, version,
      ...(granted ? { grantedAt: new Date().toISOString() } : { revokedAt: new Date().toISOString() }),
    };
    const list = this.consents.get(userId) ?? [];
    list.push(record);
    this.consents.set(userId, list);
    this.logAudit(userId, `Consent ${granted ? "granted" : "revoked"}: ${consentType}`, "consent", { consentType, granted });
    return record;
  }

  getConsents(userId: string): ConsentRecord[] {
    return this.consents.get(userId) ?? [];
  }

  hasConsent(userId: string, consentType: ConsentRecord["consentType"]): boolean {
    const list = this.consents.get(userId) ?? [];
    const latest = list.filter(c => c.consentType === consentType).pop();
    return latest?.granted ?? false;
  }

  // ─── Regional Policies ─────────────────────────────

  getRegionalPolicy(regionCode: string): RegionalPolicy | null {
    return this.regions.get(regionCode) ?? null;
  }

  getAllRegions(): RegionalPolicy[] {
    return Array.from(this.regions.values());
  }

  // ─── Web Client Capabilities ──────────────────────

  getWebCapabilities(): WebClientCapability[] {
    return [...this.webCapabilities];
  }

  // ─── Audit Trail ──────────────────────────────────

  getAuditLog(userId?: string, limit = 50): ComplianceAuditEntry[] {
    let results = [...this.auditLog];
    if (userId) results = results.filter(e => e.userId === userId);
    return results.slice(-limit).reverse();
  }

  // ─── Stats ─────────────────────────────────────────

  getStats() {
    return {
      totalAccounts: this.accounts.size,
      activeAccounts: Array.from(this.accounts.values()).filter(a => a.isActive).length,
      pendingExports: Array.from(this.exports.values()).filter(e => e.status === "requested" || e.status === "preparing").length,
      activeDeletions: Array.from(this.deletions.values()).filter(d => d.status !== "completed" && d.status !== "cancelled").length,
      totalConsents: Array.from(this.consents.values()).reduce((s, l) => s + l.length, 0),
      auditEntries: this.auditLog.length,
      regions: this.regions.size,
    };
  }

  // ─── Internal ──────────────────────────────────────

  private logAudit(userId: string, action: string, category: ComplianceAuditEntry["category"], details: Record<string, unknown>): void {
    this.auditLog.push({
      id: `ca_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId, action, category, details,
      timestamp: new Date().toISOString(),
    });
    if (this.auditLog.length > 5000) this.auditLog = this.auditLog.slice(-4000);
  }

  private initDefaultRegions(): void {
    const regions: RegionalPolicy[] = [
      { regionCode: "US", displayName: "United States", dataResidency: "regional", retentionMaxDays: 730, rightToErasure: false, consentRequired: false, childAgeRestriction: 13, encryptionMandatory: false, auditTrailRequired: false },
      { regionCode: "EU", displayName: "European Union", dataResidency: "regional", retentionMaxDays: 365, rightToErasure: true, consentRequired: true, childAgeRestriction: 16, encryptionMandatory: true, auditTrailRequired: true },
      { regionCode: "UK", displayName: "United Kingdom", dataResidency: "regional", retentionMaxDays: 365, rightToErasure: true, consentRequired: true, childAgeRestriction: 13, encryptionMandatory: true, auditTrailRequired: true },
      { regionCode: "CA", displayName: "Canada", dataResidency: "local", retentionMaxDays: 730, rightToErasure: false, consentRequired: true, childAgeRestriction: 13, encryptionMandatory: false, auditTrailRequired: false },
      { regionCode: "AU", displayName: "Australia", dataResidency: "regional", retentionMaxDays: 365, rightToErasure: false, consentRequired: false, childAgeRestriction: 15, encryptionMandatory: false, auditTrailRequired: false },
      { regionCode: "JP", displayName: "Japan", dataResidency: "local", retentionMaxDays: 365, rightToErasure: true, consentRequired: true, childAgeRestriction: 15, encryptionMandatory: true, auditTrailRequired: true },
    ];
    regions.forEach(r => this.regions.set(r.regionCode, r));
  }

  private initWebCapabilities(): WebClientCapability[] {
    return [
      { feature: "Browse files", supported: true },
      { feature: "Edit lightweight documents", supported: true },
      { feature: "View settings", supported: true, limitations: "Read-only for some categories" },
      { feature: "Device list & management", supported: true },
      { feature: "Data export", supported: true },
      { feature: "Session handoff", supported: true, limitations: "Receive only, cannot initiate" },
      { feature: "Conflict resolution", supported: true },
      { feature: "E2EE decryption", supported: false, limitations: "Requires native client for key material" },
      { feature: "Nearby sync", supported: false, limitations: "Requires local network access" },
      { feature: "Background sync", supported: false, limitations: "Browser tab must be open" },
      { feature: "Push notifications", supported: true, limitations: "VAPID web push only" },
    ];
  }
}

export const complianceEngine = new ComplianceEngine();
