// ═══════════════════════════════════════════════════════════════
// SITA OS — User Backend-for-Frontend (BFF)
// Aggregates multiple backend services into shaped payloads for product UI
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface UserDashboard {
  account: { id: string; email: string; displayName: string; avatarUrl: string | null };
  storage: { usedBytes: number; quotaBytes: number; fileCount: number; usagePercent: number };
  devices: { total: number; trusted: number; pendingTrust: number; recentDevices: DeviceSummary[] };
  sync: { status: string; lastCheckpoint: string | null; pendingChanges: number; conflictCount: number };
  notifications: { unreadCount: number; recent: NotificationSummary[] };
  supportCases: { openCount: number; recentCase: CaseSummary | null };
}

export interface DeviceSummary {
  id: string;
  deviceName: string;
  platform: string;
  trustState: string;
  lastSeen: string | null;
}

export interface NotificationSummary {
  id: string;
  title: string;
  category: string;
  severity: string;
  createdAt: string;
  read: boolean;
}

export interface CaseSummary {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
}

class UserBFF {
  async getUserDashboard(userId: string): Promise<UserDashboard> {
    const [account, storage, devices, sync, notifications, support] = await Promise.all([
      this.getAccount(userId),
      this.getStorageSummary(userId),
      this.getDeviceHealth(userId),
      this.getSyncStatus(userId),
      this.getNotifications(userId),
      this.getSupportSummary(userId),
    ]);
    return { account, storage, devices, sync, notifications, supportCases: support };
  }

  async getAccount(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .eq("user_id", userId)
      .maybeSingle();

    const { data: authData } = await supabase.auth.getUser();

    return {
      id: userId,
      email: authData?.user?.email ?? "",
      displayName: data?.display_name ?? "User",
      avatarUrl: data?.avatar_url ?? null,
    };
  }

  async getStorageSummary(userId: string) {
    const { data: usage } = await supabase
      .from("cloud_storage_usage")
      .select("used_bytes, quota_bytes, file_count")
      .eq("user_id", userId)
      .maybeSingle();

    const usedBytes = (usage as Record<string, number> | null)?.used_bytes ?? 0;
    const quotaBytes = (usage as Record<string, number> | null)?.quota_bytes ?? 5368709120; // 5GB default
    const fileCount = (usage as Record<string, number> | null)?.file_count ?? 0;

    return {
      usedBytes,
      quotaBytes,
      fileCount,
      usagePercent: quotaBytes > 0 ? Math.round((usedBytes / quotaBytes) * 100) : 0,
    };
  }

  async getDeviceHealth(userId: string) {
    const { data: devices } = await supabase
      .from("cloud_devices")
      .select("id, device_name, platform, trust_state, last_seen_at")
      .eq("user_id", userId)
      .order("last_seen_at", { ascending: false })
      .limit(10);

    const devList = (devices ?? []) as Array<{
      id: string; device_name: string; platform: string;
      trust_state: string; last_seen_at: string | null;
    }>;

    return {
      total: devList.length,
      trusted: devList.filter((d) => d.trust_state === "trusted").length,
      pendingTrust: devList.filter((d) => d.trust_state === "pending").length,
      recentDevices: devList.slice(0, 5).map((d) => ({
        id: d.id,
        deviceName: d.device_name,
        platform: d.platform,
        trustState: d.trust_state,
        lastSeen: d.last_seen_at,
      })),
    };
  }

  async getSyncStatus(userId: string) {
    const { data: checkpoint } = await supabase
      .from("cloud_sync_checkpoints")
      .select("checkpoint_data, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { count: pendingChanges } = await supabase
      .from("cloud_sync_changes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "pending");

    const { count: conflictCount } = await supabase
      .from("cloud_conflicts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("state", "unresolved");

    return {
      status: checkpoint ? "active" : "idle",
      lastCheckpoint: (checkpoint as Record<string, string> | null)?.created_at ?? null,
      pendingChanges: pendingChanges ?? 0,
      conflictCount: conflictCount ?? 0,
    };
  }

  async getNotifications(userId: string) {
    const { data: notifs } = await supabase
      .from("platform_notifications")
      .select("id, title, category, severity, created_at, read")
      .eq("target_user_id", userId)
      .eq("audience", "user")
      .eq("dismissed", false)
      .order("created_at", { ascending: false })
      .limit(10);

    const list = (notifs ?? []) as Array<{
      id: string; title: string; category: string; severity: string;
      created_at: string; read: boolean;
    }>;

    return {
      unreadCount: list.filter((n) => !n.read).length,
      recent: list.map((n) => ({
        id: n.id,
        title: n.title,
        category: n.category,
        severity: n.severity,
        createdAt: n.created_at,
        read: n.read,
      })),
    };
  }

  async getSupportSummary(userId: string) {
    const { data: cases } = await supabase
      .from("support_cases")
      .select("id, title, status, priority, created_at")
      .eq("user_id", userId)
      .in("status", ["open", "investigating", "escalated"])
      .order("created_at", { ascending: false })
      .limit(1);

    const openCases = (cases ?? []) as CaseSummary[];

    return {
      openCount: openCases.length,
      recentCase: openCases.length > 0
        ? { ...openCases[0], createdAt: (openCases[0] as Record<string, string>).created_at }
        : null,
    };
  }
}

export const userBFF = new UserBFF();
