// ═══════════════════════════════════════════════════════════════
// SITA OS — Notifications Service
// Backend notification routing, delivery tracking, preferences
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export type NotificationType = "info" | "success" | "warning" | "error" | "action-required" | "reminder";

export type NotificationChannel = "in-app" | "push" | "email" | "sms";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string;
  actionLabel?: string;
  channel: NotificationChannel;
  read: boolean;
  dismissed: boolean;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
  groupId?: string;
  priority: number;
  metadata: Record<string, unknown>;
}

export interface NotificationGroup {
  id: string;
  label: string;
  count: number;
  latestAt: string;
  notifications: Notification[];
}

export class NotificationsService {
  private notifications: Map<string, Notification> = new Map();

  create(notification: Omit<Notification, "id" | "createdAt" | "read" | "dismissed">): Notification {
    const full: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      read: false,
      dismissed: false,
    };
    this.notifications.set(full.id, full);
    return full;
  }

  markRead(id: string): boolean {
    const n = this.notifications.get(id);
    if (!n) return false;
    n.read = true;
    n.readAt = new Date().toISOString();
    return true;
  }

  markAllRead(userId: string): number {
    let count = 0;
    this.notifications.forEach(n => {
      if (n.userId === userId && !n.read) {
        n.read = true;
        n.readAt = new Date().toISOString();
        count++;
      }
    });
    return count;
  }

  dismiss(id: string): boolean {
    const n = this.notifications.get(id);
    if (!n) return false;
    n.dismissed = true;
    return true;
  }

  getUnread(userId: string): Notification[] {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId && !n.read && !n.dismissed)
      .sort((a, b) => b.priority - a.priority || b.createdAt.localeCompare(a.createdAt));
  }

  getAll(userId: string, options?: { limit?: number; includeRead?: boolean; includeDismissed?: boolean }): Notification[] {
    let results = Array.from(this.notifications.values()).filter(n => n.userId === userId);
    if (!options?.includeRead) results = results.filter(n => !n.read);
    if (!options?.includeDismissed) results = results.filter(n => !n.dismissed);
    results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return options?.limit ? results.slice(0, options.limit) : results;
  }

  getGrouped(userId: string): NotificationGroup[] {
    const unread = this.getUnread(userId);
    const groups: Map<string, NotificationGroup> = new Map();

    unread.forEach(n => {
      const groupId = n.groupId ?? n.type;
      if (!groups.has(groupId)) {
        groups.set(groupId, { id: groupId, label: groupId, count: 0, latestAt: n.createdAt, notifications: [] });
      }
      const g = groups.get(groupId)!;
      g.count++;
      g.notifications.push(n);
      if (n.createdAt > g.latestAt) g.latestAt = n.createdAt;
    });

    return Array.from(groups.values()).sort((a, b) => b.latestAt.localeCompare(a.latestAt));
  }

  getUnreadCount(userId: string): number {
    return Array.from(this.notifications.values()).filter(n => n.userId === userId && !n.read && !n.dismissed).length;
  }

  purgeExpired(): number {
    const now = new Date().toISOString();
    let count = 0;
    this.notifications.forEach((n, id) => {
      if (n.expiresAt && n.expiresAt < now) {
        this.notifications.delete(id);
        count++;
      }
    });
    return count;
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("notifications", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      notifications: Array.from(this.notifications.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.notifications) this.notifications = new Map(state.notifications as Iterable<[string, never]>) as typeof this.notifications;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("notifications");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export function createNotifications(): NotificationsService {
  return new NotificationsService();
}

