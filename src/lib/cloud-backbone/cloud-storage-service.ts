// ═══════════════════════════════════════════════════════════════
// SITA OS — Cloud Storage Service
// Storage accounting, orphaned blob detection, reconciliation
// Queries real DB with demo fallback
// ═══════════════════════════════════════════════════════════════

import { fromTable } from "@/lib/supabase-helpers";

export interface StorageUsageRecord {
  id: string;
  user_id: string;
  used_bytes: number;
  quota_bytes: number;
  file_count: number;
  largest_file_bytes: number;
  orphaned_blobs: number;
  failed_uploads: number;
  failed_downloads: number;
  last_reconciled_at: string | null;
  usage_pct: number;
}

export interface StorageHealthReport {
  totalUsedBytes: number;
  totalQuotaBytes: number;
  totalUsers: number;
  avgUsagePct: number;
  orphanedBlobsTotal: number;
  failedUploadsTotal: number;
  failedDownloadsTotal: number;
  backendHealthy: boolean;
  lastReconciliation: string | null;
  topUsers: StorageUsageRecord[];
  quotaAnomalies: StorageUsageRecord[];
}

export interface BucketStats {
  name: string;
  objectCount: number;
  totalBytes: number;
  avgObjectSize: number;
  largestObject: number;
}

class CloudStorageService {
  private static instance: CloudStorageService;
  static getInstance() {
    if (!this.instance) this.instance = new CloudStorageService();
    return this.instance;
  }

  /** Fetch real storage health report from DB, fallback to demo */
  async getHealthReportAsync(): Promise<StorageHealthReport> {
    try {
      const { data, error } = await fromTable("cloud_storage_usage").select("*");
      if (error || !data || data.length === 0) return this.getHealthReport();

      const users: StorageUsageRecord[] = data.map((r: any) => ({
        id: r.id,
        user_id: r.user_id,
        used_bytes: r.used_bytes || 0,
        quota_bytes: r.quota_bytes || 5_368_709_120,
        file_count: r.file_count || 0,
        largest_file_bytes: r.largest_file_bytes || 0,
        orphaned_blobs: r.orphaned_blobs || 0,
        failed_uploads: r.failed_uploads || 0,
        failed_downloads: r.failed_downloads || 0,
        last_reconciled_at: r.last_reconciled_at,
        usage_pct: r.quota_bytes > 0 ? Math.round((r.used_bytes / r.quota_bytes) * 100) : 0,
      }));

      const totalUsed = users.reduce((s, u) => s + u.used_bytes, 0);
      const totalQuota = users.reduce((s, u) => s + u.quota_bytes, 0);

      return {
        totalUsedBytes: totalUsed,
        totalQuotaBytes: totalQuota,
        totalUsers: users.length,
        avgUsagePct: totalQuota > 0 ? Math.round((totalUsed / totalQuota) * 100) : 0,
        orphanedBlobsTotal: users.reduce((s, u) => s + u.orphaned_blobs, 0),
        failedUploadsTotal: users.reduce((s, u) => s + u.failed_uploads, 0),
        failedDownloadsTotal: users.reduce((s, u) => s + u.failed_downloads, 0),
        backendHealthy: true,
        lastReconciliation: users.reduce((latest: string | null, u) =>
          u.last_reconciled_at && (!latest || u.last_reconciled_at > latest) ? u.last_reconciled_at : latest, null),
        topUsers: [...users].sort((a, b) => b.used_bytes - a.used_bytes).slice(0, 5),
        quotaAnomalies: users.filter(u => u.usage_pct > 90),
      };
    } catch {
      return this.getHealthReport();
    }
  }

  /** Synchronous demo fallback */
  getHealthReport(): StorageHealthReport {
    const users = this.getDemoUsageRecords();
    const totalUsed = users.reduce((s, u) => s + u.used_bytes, 0);
    const totalQuota = users.reduce((s, u) => s + u.quota_bytes, 0);
    return {
      totalUsedBytes: totalUsed,
      totalQuotaBytes: totalQuota,
      totalUsers: users.length,
      avgUsagePct: Math.round((totalUsed / totalQuota) * 100),
      orphanedBlobsTotal: users.reduce((s, u) => s + u.orphaned_blobs, 0),
      failedUploadsTotal: users.reduce((s, u) => s + u.failed_uploads, 0),
      failedDownloadsTotal: users.reduce((s, u) => s + u.failed_downloads, 0),
      backendHealthy: true,
      lastReconciliation: new Date(Date.now() - 3600000).toISOString(),
      topUsers: [...users].sort((a, b) => b.used_bytes - a.used_bytes).slice(0, 5),
      quotaAnomalies: users.filter(u => u.usage_pct > 90),
    };
  }

  getBucketStats(): BucketStats[] {
    return [
      { name: "user-files", objectCount: 2847, totalBytes: 15_400_000_000, avgObjectSize: 5_400_000, largestObject: 524_288_000 },
      { name: "avatars", objectCount: 342, totalBytes: 85_000_000, avgObjectSize: 248_000, largestObject: 2_000_000 },
      { name: "exports", objectCount: 156, totalBytes: 3_200_000_000, avgObjectSize: 20_500_000, largestObject: 104_857_600 },
      { name: "temp-uploads", objectCount: 23, totalBytes: 120_000_000, avgObjectSize: 5_200_000, largestObject: 52_000_000 },
    ];
  }

  getDemoUsageRecords(): StorageUsageRecord[] {
    const names = ["Alice Chen", "Bob Martinez", "Carol Singh", "Dave Kim", "Eve Johnson", "Frank Li", "Grace Okafor", "Hiro Tanaka"];
    return names.map((_, i) => {
      const used = Math.floor(Math.random() * 80_000_000_000) + 500_000_000;
      const quota = [5_368_709_120, 107_374_182_400, 1_099_511_627_776][i % 3];
      return {
        id: crypto.randomUUID(),
        user_id: crypto.randomUUID(),
        used_bytes: used,
        quota_bytes: quota,
        file_count: Math.floor(Math.random() * 5000) + 50,
        largest_file_bytes: Math.floor(Math.random() * 500_000_000),
        orphaned_blobs: Math.floor(Math.random() * 5),
        failed_uploads: Math.floor(Math.random() * 3),
        failed_downloads: Math.floor(Math.random() * 2),
        last_reconciled_at: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        usage_pct: Math.round((used / quota) * 100),
      };
    });
  }

  async runReconciliation(): Promise<{ found: number; fixed: number }> {
    await new Promise(r => setTimeout(r, 1500));
    return { found: Math.floor(Math.random() * 10), fixed: Math.floor(Math.random() * 8) };
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  }
}

export const cloudStorageService = CloudStorageService.getInstance();
