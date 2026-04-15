// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Backend-for-Frontend (BFF)
// Aggregates services into shaped payloads for admin/support UI
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface SystemOverview {
  users: { total: number; activeToday: number };
  devices: { total: number; trusted: number; untrusted: number; pendingTrust: number };
  storage: { totalUsedBytes: number; blobCount: number };
  sync: { activeJobs: number; failedJobs: number; queueDepth: number; conflictBacklog: number };
  support: { openCases: number; escalatedCases: number };
  workers: { activeJobs: number; failedJobs: number; stuckJobs: number };
}

export interface User360View {
  profile: { id: string; displayName: string; email: string; avatarUrl: string | null; createdAt: string };
  storage: { usedBytes: number; quotaBytes: number; fileCount: number };
  devices: Array<{ id: string; deviceName: string; platform: string; trustState: string; lastSeen: string | null }>;
  syncHealth: { status: string; pendingChanges: number; conflicts: number; lastCheckpoint: string | null };
  recentAudit: Array<{ action: string; createdAt: string; severity: string }>;
  supportCases: Array<{ id: string; title: string; status: string; createdAt: string }>;
  notifications: { unread: number };
}

export interface DeviceFleetSummary {
  totalDevices: number;
  byPlatform: Record<string, number>;
  byTrustState: Record<string, number>;
  recentlyRevoked: number;
  outdatedClients: number;
}

class AdminBFF {
  async getSystemOverview(): Promise<SystemOverview> {
    const [users, devices, storage, sync, support, workers] = await Promise.all([
      this.getUserMetrics(),
      this.getDeviceMetrics(),
      this.getStorageMetrics(),
      this.getSyncMetrics(),
      this.getSupportMetrics(),
      this.getWorkerMetrics(),
    ]);
    return { users, devices, storage, sync, support, workers };
  }

  async getUser360(userId: string): Promise<User360View> {
    const [profile, storage, devices, syncHealth, recentAudit, supportCases, notifications] =
      await Promise.all([
        this.getUserProfile(userId),
        this.getUserStorage(userId),
        this.getUserDevices(userId),
        this.getUserSyncHealth(userId),
        this.getUserRecentAudit(userId),
        this.getUserSupportCases(userId),
        this.getUserNotificationCount(userId),
      ]);
    return { profile, storage, devices, syncHealth, recentAudit, supportCases, notifications };
  }

  async getDeviceFleetSummary(): Promise<DeviceFleetSummary> {
    const { data: devices } = await supabase.from("cloud_devices").select("platform, trust_state");
    const devList = (devices ?? []) as Array<{ platform: string; trust_state: string }>;

    const byPlatform: Record<string, number> = {};
    const byTrustState: Record<string, number> = {};
    devList.forEach((d) => {
      byPlatform[d.platform] = (byPlatform[d.platform] ?? 0) + 1;
      byTrustState[d.trust_state] = (byTrustState[d.trust_state] ?? 0) + 1;
    });

    return {
      totalDevices: devList.length,
      byPlatform,
      byTrustState,
      recentlyRevoked: byTrustState["revoked"] ?? 0,
      outdatedClients: 0,
    };
  }

  // ── Private aggregators ──────────────────────────────────

  private async getUserMetrics() {
    const { count: total } = await supabase.from("profiles").select("id", { count: "exact", head: true });
    return { total: total ?? 0, activeToday: 0 };
  }

  private async getDeviceMetrics() {
    const { data } = await supabase.from("cloud_devices").select("trust_state");
    const devs = (data ?? []) as Array<{ trust_state: string }>;
    return {
      total: devs.length,
      trusted: devs.filter((d) => d.trust_state === "trusted").length,
      untrusted: devs.filter((d) => d.trust_state === "untrusted").length,
      pendingTrust: devs.filter((d) => d.trust_state === "pending").length,
    };
  }

  private async getStorageMetrics() {
    const { count: blobCount } = await supabase.from("cloud_blobs").select("id", { count: "exact", head: true });
    return { totalUsedBytes: 0, blobCount: blobCount ?? 0 };
  }

  private async getSyncMetrics() {
    const { count: active } = await supabase.from("cloud_sync_jobs").select("id", { count: "exact", head: true }).eq("status", "running");
    const { count: failed } = await supabase.from("cloud_sync_jobs").select("id", { count: "exact", head: true }).eq("status", "failed");
    const { count: conflicts } = await supabase.from("cloud_conflicts").select("id", { count: "exact", head: true }).eq("state", "unresolved");
    return { activeJobs: active ?? 0, failedJobs: failed ?? 0, queueDepth: 0, conflictBacklog: conflicts ?? 0 };
  }

  private async getSupportMetrics() {
    const { count: open } = await supabase.from("support_cases").select("id", { count: "exact", head: true }).in("status", ["open", "investigating"]);
    const { count: escalated } = await supabase.from("support_cases").select("id", { count: "exact", head: true }).eq("status", "escalated");
    return { openCases: open ?? 0, escalatedCases: escalated ?? 0 };
  }

  private async getWorkerMetrics() {
    const { count: active } = await supabase.from("cloud_worker_jobs").select("id", { count: "exact", head: true }).eq("status", "running");
    const { count: failed } = await supabase.from("cloud_worker_jobs").select("id", { count: "exact", head: true }).eq("status", "failed");
    const { count: stuck } = await supabase.from("cloud_worker_jobs").select("id", { count: "exact", head: true }).eq("status", "stuck");
    return { activeJobs: active ?? 0, failedJobs: failed ?? 0, stuckJobs: stuck ?? 0 };
  }

  private async getUserProfile(userId: string) {
    const { data } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
    return {
      id: userId,
      displayName: (data as Record<string, string> | null)?.display_name ?? "Unknown",
      email: "",
      avatarUrl: (data as Record<string, string | null> | null)?.avatar_url ?? null,
      createdAt: (data as Record<string, string> | null)?.created_at ?? "",
    };
  }

  private async getUserStorage(userId: string) {
    const { data } = await supabase.from("cloud_storage_usage").select("*").eq("user_id", userId).maybeSingle();
    return {
      usedBytes: (data as Record<string, number> | null)?.used_bytes ?? 0,
      quotaBytes: (data as Record<string, number> | null)?.quota_bytes ?? 5368709120,
      fileCount: (data as Record<string, number> | null)?.file_count ?? 0,
    };
  }

  private async getUserDevices(userId: string) {
    const { data } = await supabase.from("cloud_devices").select("id, device_name, platform, trust_state, last_seen_at").eq("user_id", userId);
    return ((data ?? []) as Array<Record<string, string | null>>).map((d) => ({
      id: d.id!,
      deviceName: d.device_name ?? "Unknown",
      platform: d.platform ?? "unknown",
      trustState: d.trust_state ?? "unknown",
      lastSeen: d.last_seen_at,
    }));
  }

  private async getUserSyncHealth(userId: string) {
    const { count: pending } = await supabase.from("cloud_sync_changes").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "pending");
    const { count: conflicts } = await supabase.from("cloud_conflicts").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("state", "unresolved");
    return { status: "active", pendingChanges: pending ?? 0, conflicts: conflicts ?? 0, lastCheckpoint: null };
  }

  private async getUserRecentAudit(userId: string) {
    const { data } = await supabase.from("cloud_audit_events").select("action, created_at, severity").eq("actor_user_id", userId).order("created_at", { ascending: false }).limit(10);
    return ((data ?? []) as Array<Record<string, string>>).map((e) => ({
      action: e.action,
      createdAt: e.created_at,
      severity: e.severity ?? "info",
    }));
  }

  private async getUserSupportCases(userId: string) {
    const { data } = await supabase.from("support_cases").select("id, title, status, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(5);
    return ((data ?? []) as Array<Record<string, string>>).map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      createdAt: c.created_at,
    }));
  }

  private async getUserNotificationCount(userId: string) {
    const { count } = await supabase.from("platform_notifications").select("id", { count: "exact", head: true }).eq("target_user_id", userId).eq("read", false);
    return { unread: count ?? 0 };
  }
}

export const adminBFF = new AdminBFF();
