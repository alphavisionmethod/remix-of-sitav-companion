// ═══════════════════════════════════════════════════════════════
// SITA OS — Multi-Plane Notification Router
// Routes notifications to correct audience: user, admin, support
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export type NotificationAudience = "user" | "admin" | "support";
export type NotificationSeverity = "info" | "warning" | "error" | "critical";

export interface PlatformNotification {
  id: string;
  audience: NotificationAudience;
  targetUserId: string | null;
  title: string;
  body: string;
  category: string;
  severity: NotificationSeverity;
  sourceService: string;
  sourceEventType: string;
  correlationId: string | null;
  read: boolean;
  dismissed: boolean;
  actionUrl: string | null;
  createdAt: string;
}

// Event type → audience mapping
const AUDIENCE_ROUTING: Record<string, NotificationAudience> = {
  "sync.paused": "user",
  "sync.resumed": "user",
  "sync.failed": "user",
  "device.revoked": "user",
  "device.enrolled": "user",
  "quota.warning": "user",
  "quota.exceeded": "user",
  "repair.complete": "user",
  "security.alert": "user",
  "account.suspended": "user",
  "case.created": "user",
  "case.resolved": "user",
  "queue.backlog_high": "admin",
  "storage.integrity_issue": "admin",
  "security.suspicious_global": "admin",
  "rollout.failure": "admin",
  "conflict.high_rate": "admin",
  "worker.failure": "admin",
  "sync.global_degraded": "admin",
  "maintenance.started": "admin",
  "maintenance.ended": "admin",
  "case.assigned": "support",
  "case.escalated": "support",
  "diagnostic.ready": "support",
  "repair.job_complete": "support",
};

class NotificationRouter {
  routeAudience(eventType: string): NotificationAudience {
    return AUDIENCE_ROUTING[eventType] ?? "admin";
  }

  async routeNotification(
    eventType: string,
    title: string,
    body: string,
    options: {
      targetUserId?: string;
      severity?: NotificationSeverity;
      sourceService?: string;
      correlationId?: string;
      actionUrl?: string;
      metadata?: Record<string, unknown>;
    } = {}
  ): Promise<PlatformNotification> {
    const audience = this.routeAudience(eventType);
    const category = eventType.split(".")[0] ?? "system";

    const { data, error } = await supabase
      .from("platform_notifications")
      .insert({
        audience,
        target_user_id: options.targetUserId ?? null,
        title,
        body,
        category,
        severity: options.severity ?? "info",
        source_service: options.sourceService ?? "",
        source_event_type: eventType,
        correlation_id: options.correlationId ?? null,
        action_url: options.actionUrl ?? null,
        metadata: options.metadata ?? {},
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapNotification(data as Record<string, unknown>);
  }

  async getUserNotifications(userId: string, limit = 20): Promise<PlatformNotification[]> {
    const { data } = await supabase
      .from("platform_notifications")
      .select("*")
      .eq("audience", "user")
      .eq("target_user_id", userId)
      .eq("dismissed", false)
      .order("created_at", { ascending: false })
      .limit(limit);

    return ((data ?? []) as Array<Record<string, unknown>>).map(this.mapNotification);
  }

  async getAdminAlerts(limit = 50): Promise<PlatformNotification[]> {
    const { data } = await supabase
      .from("platform_notifications")
      .select("*")
      .eq("audience", "admin")
      .eq("dismissed", false)
      .order("created_at", { ascending: false })
      .limit(limit);

    return ((data ?? []) as Array<Record<string, unknown>>).map(this.mapNotification);
  }

  async getSupportNotifications(limit = 50): Promise<PlatformNotification[]> {
    const { data } = await supabase
      .from("platform_notifications")
      .select("*")
      .eq("audience", "support")
      .eq("dismissed", false)
      .order("created_at", { ascending: false })
      .limit(limit);

    return ((data ?? []) as Array<Record<string, unknown>>).map(this.mapNotification);
  }

  async markAsRead(notificationId: string): Promise<void> {
    await supabase
      .from("platform_notifications")
      .update({ read: true })
      .eq("id", notificationId);
  }

  async dismiss(notificationId: string): Promise<void> {
    await supabase
      .from("platform_notifications")
      .update({ dismissed: true })
      .eq("id", notificationId);
  }

  getRoutingTable(): Record<string, NotificationAudience> {
    return { ...AUDIENCE_ROUTING };
  }

  private mapNotification(row: Record<string, unknown>): PlatformNotification {
    return {
      id: row.id as string,
      audience: row.audience as NotificationAudience,
      targetUserId: row.target_user_id as string | null,
      title: row.title as string,
      body: (row.body as string) ?? "",
      category: (row.category as string) ?? "system",
      severity: (row.severity as NotificationSeverity) ?? "info",
      sourceService: (row.source_service as string) ?? "",
      sourceEventType: (row.source_event_type as string) ?? "",
      correlationId: row.correlation_id as string | null,
      read: (row.read as boolean) ?? false,
      dismissed: (row.dismissed as boolean) ?? false,
      actionUrl: row.action_url as string | null,
      createdAt: row.created_at as string,
    };
  }
}

export const notificationRouter = new NotificationRouter();
