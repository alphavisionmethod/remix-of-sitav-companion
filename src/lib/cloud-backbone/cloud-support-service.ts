// ═══════════════════════════════════════════════════════════════
// SITA OS — Cloud Support Service
// Support sessions, diagnostic bundles, safe views — real DB with demo fallback
// ═══════════════════════════════════════════════════════════════

import { fromTable } from "@/lib/supabase-helpers";

export interface SupportSession {
  id: string;
  support_user_id: string;
  target_user_id: string;
  reason: string;
  status: string;
  actions_taken: Array<{ action: string; timestamp: string }>;
  redacted_fields: string[];
  started_at: string;
  ended_at: string | null;
}

export interface DiagnosticBundle {
  user_id: string;
  storage_usage: { used_bytes: number; quota_bytes: number; file_count: number };
  device_count: number;
  sync_status: string;
  recent_errors: number;
  last_sync: string | null;
  active_conflicts: number;
  pending_uploads: number;
}

class CloudSupportService {
  private static instance: CloudSupportService;
  static getInstance() {
    if (!this.instance) this.instance = new CloudSupportService();
    return this.instance;
  }

  async getSessions(limit = 20): Promise<SupportSession[]> {
    try {
      const { data } = await fromTable("cloud_support_sessions").select("*").order("created_at", { ascending: false }).limit(limit);
      if (data?.length) return data;
    } catch {}
    return this.getDemoSessions();
  }

  async getDiagnosticBundle(userId: string): Promise<DiagnosticBundle> {
    try {
      const [usage, devices, conflicts] = await Promise.all([
        fromTable("cloud_storage_usage").select("*").eq("user_id", userId).maybeSingle(),
        fromTable("cloud_devices").select("id", { count: "exact", head: true }).eq("user_id", userId),
        fromTable("cloud_conflicts").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("state", "open"),
      ]);
      return {
        user_id: userId,
        storage_usage: usage?.data || { used_bytes: 0, quota_bytes: 5368709120, file_count: 0 },
        device_count: devices?.count || 0,
        sync_status: "healthy",
        recent_errors: 0,
        last_sync: new Date().toISOString(),
        active_conflicts: conflicts?.count || 0,
        pending_uploads: 0,
      };
    } catch {}
    return {
      user_id: userId, storage_usage: { used_bytes: 0, quota_bytes: 5368709120, file_count: 0 },
      device_count: 0, sync_status: "unknown", recent_errors: 0, last_sync: null, active_conflicts: 0, pending_uploads: 0,
    };
  }

  getDemoSessions(): SupportSession[] {
    return [
      { id: "ss1", support_user_id: "admin1", target_user_id: "user1", reason: "Sync stuck for 24h", status: "active", actions_taken: [{ action: "Viewed sync trace", timestamp: new Date().toISOString() }], redacted_fields: ["email", "ip_address"], started_at: new Date(Date.now() - 1800000).toISOString(), ended_at: null },
      { id: "ss2", support_user_id: "admin1", target_user_id: "user2", reason: "Storage quota mismatch", status: "resolved", actions_taken: [{ action: "Ran quota reconciliation", timestamp: new Date(Date.now() - 86400000).toISOString() }], redacted_fields: [], started_at: new Date(Date.now() - 172800000).toISOString(), ended_at: new Date(Date.now() - 86400000).toISOString() },
    ];
  }
}

export const cloudSupportService = CloudSupportService.getInstance();
