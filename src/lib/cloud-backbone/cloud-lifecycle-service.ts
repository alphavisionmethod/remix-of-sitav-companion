// ═══════════════════════════════════════════════════════════════
// SITA OS — Cloud Lifecycle Service
// Tiering, retention, account closure — real DB with demo fallback
// ═══════════════════════════════════════════════════════════════

import { fromTable } from "@/lib/supabase-helpers";

export interface LifecycleRule {
  id: string;
  user_id: string;
  rule_name: string;
  source_tier: string;
  target_tier: string;
  condition_type: string;
  condition_value: number;
  applies_to: string;
  enabled: boolean;
  last_run_at: string | null;
}

export interface ArchiveJob {
  id: string;
  user_id: string;
  object_id: string;
  object_type: string;
  direction: string;
  source_tier: string;
  target_tier: string;
  status: string;
  created_at: string;
}

export interface StorageTier {
  id: string;
  tier_key: string;
  display_name: string;
  cost_per_gb_cents: number;
  retrieval_latency_ms: number;
  status: string;
}

export interface AccountClosureRequest {
  id: string;
  user_id: string;
  reason: string;
  stage: string;
  export_completed: boolean;
  cancellation_deadline: string | null;
  created_at: string;
}

export interface ReconciliationRun {
  id: string;
  run_type: string;
  status: string;
  orphaned_blobs: number;
  missing_blobs: number;
  size_mismatches: number;
  quota_drifts: number;
  repairs_applied: number;
  affected_users: number;
  started_at: string | null;
  completed_at: string | null;
}

class CloudLifecycleService {
  private static instance: CloudLifecycleService;
  static getInstance() {
    if (!this.instance) this.instance = new CloudLifecycleService();
    return this.instance;
  }

  async getTiers(): Promise<StorageTier[]> {
    try {
      const { data } = await fromTable("cloud_storage_tiers").select("*").order("tier_order");
      if (data?.length) return data;
    } catch {}
    return this.getDemoTiers();
  }

  async getLifecycleRules(): Promise<LifecycleRule[]> {
    try {
      const { data } = await fromTable("cloud_lifecycle_rules").select("*").order("created_at", { ascending: false });
      if (data?.length) return data;
    } catch {}
    return [];
  }

  async getArchiveJobs(limit = 20): Promise<ArchiveJob[]> {
    try {
      const { data } = await fromTable("cloud_archive_jobs").select("*").order("created_at", { ascending: false }).limit(limit);
      if (data?.length) return data;
    } catch {}
    return [];
  }

  async getReconciliationRuns(limit = 10): Promise<ReconciliationRun[]> {
    try {
      const { data } = await fromTable("cloud_reconciliation_runs").select("*").order("created_at", { ascending: false }).limit(limit);
      if (data?.length) return data;
    } catch {}
    return this.getDemoReconciliations();
  }

  async getAccountClosures(): Promise<AccountClosureRequest[]> {
    try {
      const { data } = await fromTable("cloud_account_closure_requests").select("*").order("created_at", { ascending: false });
      if (data?.length) return data;
    } catch {}
    return [];
  }

  getDemoTiers(): StorageTier[] {
    return [
      { id: "t1", tier_key: "hot", display_name: "Hot (Active)", cost_per_gb_cents: 2.3, retrieval_latency_ms: 5, status: "active" },
      { id: "t2", tier_key: "warm", display_name: "Warm (Infrequent)", cost_per_gb_cents: 1.2, retrieval_latency_ms: 100, status: "active" },
      { id: "t3", tier_key: "cold", display_name: "Cold (Archive)", cost_per_gb_cents: 0.4, retrieval_latency_ms: 3600000, status: "active" },
      { id: "t4", tier_key: "glacier", display_name: "Glacier (Deep Archive)", cost_per_gb_cents: 0.1, retrieval_latency_ms: 43200000, status: "active" },
    ];
  }

  getDemoReconciliations(): ReconciliationRun[] {
    return [
      { id: "r1", run_type: "full", status: "completed", orphaned_blobs: 3, missing_blobs: 0, size_mismatches: 1, quota_drifts: 2, repairs_applied: 6, affected_users: 4, started_at: new Date(Date.now() - 3600000).toISOString(), completed_at: new Date(Date.now() - 3540000).toISOString() },
      { id: "r2", run_type: "quick", status: "completed", orphaned_blobs: 0, missing_blobs: 0, size_mismatches: 0, quota_drifts: 0, repairs_applied: 0, affected_users: 0, started_at: new Date(Date.now() - 86400000).toISOString(), completed_at: new Date(Date.now() - 86340000).toISOString() },
    ];
  }

  getTierColor(tier: string): string {
    const map: Record<string, string> = { hot: "text-red-400", warm: "text-amber-400", cold: "text-blue-400", glacier: "text-cyan-400" };
    return map[tier] || "text-muted-foreground";
  }
}

export const cloudLifecycleService = CloudLifecycleService.getInstance();
