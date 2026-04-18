// ═══════════════════════════════════════════════════════════════
// SITA OS — Sync Quotas & Storage Management
// Per-user, per-namespace quotas, cleanup, billing hooks
// ═══════════════════════════════════════════════════════════════

// ─── Types ────────────────────────────────────────────────────

export interface StorageQuota {
  userId: string;
  planKey: string;
  totalBytes: number;
  usedBytes: number;
  namespaceUsage: Record<string, number>;
  pinnedBytes: number;
  cacheBytes: number;
  maxFileSize: number;
  warningThreshold: number; // 0-1
  criticalThreshold: number;
}

export interface NamespaceQuota {
  namespace: string;
  maxBytes: number;
  usedBytes: number;
  objectCount: number;
  maxObjects?: number;
  enforced: boolean;
}

export interface QuotaWarning {
  id: string;
  userId: string;
  type: "approaching-limit" | "at-limit" | "over-limit" | "large-file-blocked" | "namespace-full" | "cache-full";
  message: string;
  percentage: number;
  namespace?: string;
  createdAt: string;
  dismissed: boolean;
}

export interface CleanupRecommendation {
  id: string;
  type: "delete-cache" | "remove-duplicates" | "archive-old" | "compress-media" | "offload-large" | "purge-tombstones";
  description: string;
  savingsBytes: number;
  affectedObjects: number;
  risk: "safe" | "low" | "medium";
  automated: boolean;
}

export interface StoragePlan {
  planKey: string;
  displayName: string;
  totalBytes: number;
  maxFileSize: number;
  maxDevices: number;
  features: string[];
  priceCents: number;
}

// ─── Sync Quotas Engine ──────────────────────────────────────

class SyncQuotasEngine {
  private quotas = new Map<string, StorageQuota>();
  private namespaceQuotas = new Map<string, NamespaceQuota>();
  private warnings: QuotaWarning[] = [];
  private plans: StoragePlan[] = [
    { planKey: "free", displayName: "Free", totalBytes: 5368709120, maxFileSize: 104857600, maxDevices: 2, features: ["basic-sync", "settings"], priceCents: 0 },
    { planKey: "pro", displayName: "Pro", totalBytes: 107374182400, maxFileSize: 5368709120, maxDevices: 10, features: ["full-sync", "e2ee", "version-history", "nearby"], priceCents: 999 },
    { planKey: "business", displayName: "Business", totalBytes: 1099511627776, maxFileSize: 53687091200, maxDevices: 50, features: ["full-sync", "e2ee", "compliance", "admin", "governance"], priceCents: 2999 },
  ];

  // ─── Quota Management ──────────────────────────────

  initUserQuota(userId: string, planKey = "free"): StorageQuota {
    const plan = this.plans.find(p => p.planKey === planKey) ?? this.plans[0];
    const quota: StorageQuota = {
      userId, planKey,
      totalBytes: plan.totalBytes,
      usedBytes: 0,
      namespaceUsage: {},
      pinnedBytes: 0,
      cacheBytes: 0,
      maxFileSize: plan.maxFileSize,
      warningThreshold: 0.8,
      criticalThreshold: 0.95,
    };
    this.quotas.set(userId, quota);
    return quota;
  }

  getQuota(userId: string): StorageQuota | null {
    return this.quotas.get(userId) ?? null;
  }

  updateUsage(userId: string, namespace: string, deltaBytes: number): boolean {
    const quota = this.quotas.get(userId);
    if (!quota) return false;

    const newUsed = quota.usedBytes + deltaBytes;
    if (deltaBytes > 0 && newUsed > quota.totalBytes) {
      this.addWarning(userId, "over-limit", `Storage limit exceeded`, newUsed / quota.totalBytes, namespace);
      return false;
    }

    quota.usedBytes = Math.max(0, newUsed);
    quota.namespaceUsage[namespace] = Math.max(0, (quota.namespaceUsage[namespace] ?? 0) + deltaBytes);

    // Check thresholds
    const pct = quota.usedBytes / quota.totalBytes;
    if (pct >= quota.criticalThreshold) {
      this.addWarning(userId, "at-limit", `Storage critically full (${Math.round(pct * 100)}%)`, pct, namespace);
    } else if (pct >= quota.warningThreshold) {
      this.addWarning(userId, "approaching-limit", `Storage ${Math.round(pct * 100)}% full`, pct, namespace);
    }

    // Check namespace quota
    const nsQuota = this.namespaceQuotas.get(`${userId}:${namespace}`);
    if (nsQuota && nsQuota.enforced) {
      nsQuota.usedBytes += deltaBytes;
      if (nsQuota.usedBytes > nsQuota.maxBytes) {
        this.addWarning(userId, "namespace-full", `${namespace} storage full`, nsQuota.usedBytes / nsQuota.maxBytes, namespace);
        return false;
      }
    }

    return true;
  }

  checkFileSize(userId: string, sizeBytes: number): { allowed: boolean; reason?: string } {
    const quota = this.quotas.get(userId);
    if (!quota) return { allowed: false, reason: "No quota initialized" };
    if (sizeBytes > quota.maxFileSize) {
      return { allowed: false, reason: `File exceeds max size (${this.formatBytes(quota.maxFileSize)})` };
    }
    if (quota.usedBytes + sizeBytes > quota.totalBytes) {
      return { allowed: false, reason: "Not enough storage space" };
    }
    return { allowed: true };
  }

  // ─── Namespace Quotas ──────────────────────────────

  setNamespaceQuota(userId: string, namespace: string, maxBytes: number, enforced = true): NamespaceQuota {
    const nsq: NamespaceQuota = {
      namespace, maxBytes,
      usedBytes: this.quotas.get(userId)?.namespaceUsage[namespace] ?? 0,
      objectCount: 0,
      enforced,
    };
    this.namespaceQuotas.set(`${userId}:${namespace}`, nsq);
    return nsq;
  }

  getNamespaceQuotas(userId: string): NamespaceQuota[] {
    const results: NamespaceQuota[] = [];
    for (const [key, nsq] of this.namespaceQuotas) {
      if (key.startsWith(`${userId}:`)) results.push(nsq);
    }
    return results;
  }

  // ─── Warnings ──────────────────────────────────────

  getWarnings(userId: string, includeDismissed = false): QuotaWarning[] {
    return this.warnings.filter(w => w.userId === userId && (includeDismissed || !w.dismissed));
  }

  dismissWarning(warningId: string): void {
    const w = this.warnings.find(w => w.id === warningId);
    if (w) w.dismissed = true;
  }

  // ─── Cleanup Recommendations ──────────────────────

  getCleanupRecommendations(userId: string): CleanupRecommendation[] {
    const quota = this.quotas.get(userId);
    if (!quota) return [];
    const recs: CleanupRecommendation[] = [];

    if (quota.cacheBytes > 104857600) {
      recs.push({
        id: "cleanup-cache", type: "delete-cache",
        description: `Clear ${this.formatBytes(quota.cacheBytes)} of sync cache`,
        savingsBytes: quota.cacheBytes, affectedObjects: 0, risk: "safe", automated: true,
      });
    }

    const usedPct = quota.usedBytes / quota.totalBytes;
    if (usedPct > 0.7) {
      recs.push({
        id: "archive-old", type: "archive-old",
        description: "Archive files not accessed in 90+ days",
        savingsBytes: Math.round(quota.usedBytes * 0.15), affectedObjects: 0, risk: "low", automated: false,
      });
      recs.push({
        id: "purge-tombstones", type: "purge-tombstones",
        description: "Permanently remove expired deleted files",
        savingsBytes: Math.round(quota.usedBytes * 0.05), affectedObjects: 0, risk: "safe", automated: true,
      });
    }

    return recs;
  }

  executeCleanup(userId: string, recommendationId: string): { success: boolean; freedBytes: number } {
    const recs = this.getCleanupRecommendations(userId);
    const rec = recs.find(r => r.id === recommendationId);
    if (!rec || !rec.automated) return { success: false, freedBytes: 0 };

    const quota = this.quotas.get(userId);
    if (quota) {
      quota.usedBytes = Math.max(0, quota.usedBytes - rec.savingsBytes);
      if (rec.type === "delete-cache") quota.cacheBytes = 0;
    }
    return { success: true, freedBytes: rec.savingsBytes };
  }

  // ─── Plans ─────────────────────────────────────────

  getPlans(): StoragePlan[] {
    return [...this.plans];
  }

  upgradePlan(userId: string, planKey: string): boolean {
    const plan = this.plans.find(p => p.planKey === planKey);
    const quota = this.quotas.get(userId);
    if (!plan || !quota) return false;
    quota.planKey = planKey;
    quota.totalBytes = plan.totalBytes;
    quota.maxFileSize = plan.maxFileSize;
    return true;
  }

  // ─── Display ───────────────────────────────────────

  getUsageSummary(userId: string): { usedFormatted: string; totalFormatted: string; percentage: number; status: "healthy" | "warning" | "critical" } {
    const quota = this.quotas.get(userId);
    if (!quota) return { usedFormatted: "0 B", totalFormatted: "0 B", percentage: 0, status: "healthy" };
    const pct = quota.usedBytes / quota.totalBytes;
    return {
      usedFormatted: this.formatBytes(quota.usedBytes),
      totalFormatted: this.formatBytes(quota.totalBytes),
      percentage: Math.round(pct * 100),
      status: pct >= 0.95 ? "critical" : pct >= 0.8 ? "warning" : "healthy",
    };
  }

  formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
    if (bytes < 1099511627776) return `${(bytes / 1073741824).toFixed(1)} GB`;
    return `${(bytes / 1099511627776).toFixed(1)} TB`;
  }

  // ─── Internal ──────────────────────────────────────

  private addWarning(userId: string, type: QuotaWarning["type"], message: string, percentage: number, namespace?: string): void {
    // Avoid duplicate warnings
    const recent = this.warnings.find(w => w.userId === userId && w.type === type && !w.dismissed &&
      Date.now() - new Date(w.createdAt).getTime() < 3600000);
    if (recent) return;

    this.warnings.push({
      id: `qw_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId, type, message, percentage, namespace,
      createdAt: new Date().toISOString(),
      dismissed: false,
    });
    if (this.warnings.length > 500) this.warnings = this.warnings.slice(-400);
  }
}

export const syncQuotas = new SyncQuotasEngine();
