// ═══════════════════════════════════════════════════════════════
// Nova SDK — Notification Service
// Priority queue, grouping, DND, history, actions
// ═══════════════════════════════════════════════════════════════

import type { SystemService, ServiceStatus } from "./service-manager";
import { NovaEvents } from "../input/events";

export type NotificationUrgencyLevel = "critical" | "high" | "normal" | "low";
export type NotificationStyle = "banner" | "alert";

export interface SystemNotification {
  id: string;
  appId: string;
  title: string;
  body: string;
  urgency: NotificationUrgencyLevel;
  style: NotificationStyle;
  category?: string;
  icon?: string;
  actions?: NotificationAction[];
  groupKey?: string;
  read: boolean;
  dismissed: boolean;
  createdAt: number;
  expiresAt?: number;
  sound?: string;
}

export interface NotificationAction {
  id: string;
  label: string;
  handler?: () => void;
}

export interface NotificationGroup {
  key: string;
  appId: string;
  category?: string;
  notifications: SystemNotification[];
  count: number;
  latestAt: number;
}

export interface DNDConfig {
  enabled: boolean;
  allowCritical: boolean;
  schedule?: { startHour: number; endHour: number };
}

const MAX_VISIBLE = 3;
const BANNER_DISMISS_MS = 5000;
const MAX_HISTORY = 500;

class NotificationServiceClass implements SystemService {
  id = "NotificationService";
  status: ServiceStatus = "stopped";

  private queue: SystemNotification[] = [];
  private history: SystemNotification[] = [];
  private visible: SystemNotification[] = [];
  private groups = new Map<string, NotificationGroup>();
  private dnd: DNDConfig = { enabled: false, allowCritical: true };
  private dismissTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private notifCounter = 0;
  private totalSent = 0;
  private totalDismissed = 0;

  boot(): void {
    this.status = "running";
  }

  shutdown(): void {
    for (const timer of this.dismissTimers.values()) clearTimeout(timer);
    this.dismissTimers.clear();
    this.status = "stopped";
  }

  // ── Send Notification ──

  send(opts: Omit<SystemNotification, "id" | "read" | "dismissed" | "createdAt">): SystemNotification {
    const notif: SystemNotification = {
      ...opts,
      id: `notif_${++this.notifCounter}`,
      read: false,
      dismissed: false,
      createdAt: Date.now(),
    };

    this.totalSent++;
    this.history.unshift(notif);
    if (this.history.length > MAX_HISTORY) this.history.pop();

    // Group
    if (notif.groupKey) {
      const gk = `${notif.appId}:${notif.groupKey}`;
      const group = this.groups.get(gk) || {
        key: gk, appId: notif.appId, category: notif.category,
        notifications: [], count: 0, latestAt: 0,
      };
      group.notifications.push(notif);
      group.count++;
      group.latestAt = notif.createdAt;
      this.groups.set(gk, group);
    }

    // DND check
    if (this.isDNDActive() && notif.urgency !== "critical") {
      return notif;
    }

    // Show if under limit
    if (this.visible.length < MAX_VISIBLE) {
      this.visible.push(notif);
      NovaEvents.emit("app:state-change", { event: "notification:show", notification: notif });

      // Auto-dismiss banners
      if (notif.style === "banner") {
        const timer = setTimeout(() => this.dismiss(notif.id), BANNER_DISMISS_MS);
        this.dismissTimers.set(notif.id, timer);
      }
    } else {
      this.queue.push(notif);
      // Sort queue by urgency
      const urgencyOrder: Record<NotificationUrgencyLevel, number> = { critical: 0, high: 1, normal: 2, low: 3 };
      this.queue.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
    }

    return notif;
  }

  // ── Dismiss ──

  dismiss(id: string): void {
    const idx = this.visible.findIndex(n => n.id === id);
    if (idx >= 0) {
      this.visible[idx].dismissed = true;
      this.visible.splice(idx, 1);
      this.totalDismissed++;

      const timer = this.dismissTimers.get(id);
      if (timer) { clearTimeout(timer); this.dismissTimers.delete(id); }

      NovaEvents.emit("app:state-change", { event: "notification:dismiss", notificationId: id });

      // Show next from queue
      if (this.queue.length > 0 && this.visible.length < MAX_VISIBLE) {
        const next = this.queue.shift()!;
        this.visible.push(next);
        NovaEvents.emit("app:state-change", { event: "notification:show", notification: next });
      }
    }
  }

  dismissAll(): void {
    const ids = this.visible.map(n => n.id);
    for (const id of ids) this.dismiss(id);
  }

  // ── Read/Unread ──

  markRead(id: string): void {
    const notif = this.history.find(n => n.id === id);
    if (notif) notif.read = true;
  }

  markAllRead(): void {
    for (const n of this.history) n.read = true;
  }

  // ── History ──

  getHistory(opts?: { appId?: string; unreadOnly?: boolean; limit?: number }): SystemNotification[] {
    let result = this.history;
    if (opts?.appId) result = result.filter(n => n.appId === opts.appId);
    if (opts?.unreadOnly) result = result.filter(n => !n.read);
    if (opts?.limit) result = result.slice(0, opts.limit);
    return result;
  }

  getUnreadCount(appId?: string): number {
    const filtered = appId ? this.history.filter(n => n.appId === appId) : this.history;
    return filtered.filter(n => !n.read).length;
  }

  clearHistory(appId?: string): void {
    if (appId) {
      this.history = this.history.filter(n => n.appId !== appId);
    } else {
      this.history = [];
    }
  }

  // ── Groups ──

  getGroups(): NotificationGroup[] {
    return [...this.groups.values()].sort((a, b) => b.latestAt - a.latestAt);
  }

  // ── DND ──

  setDND(config: Partial<DNDConfig>): void {
    Object.assign(this.dnd, config);
    NovaEvents.emit("app:state-change", { event: "dnd:changed", dnd: this.dnd });
  }

  getDND(): DNDConfig { return { ...this.dnd }; }

  isDNDActive(): boolean {
    if (!this.dnd.enabled) return false;
    if (!this.dnd.schedule) return true;
    const hour = new Date().getHours();
    const { startHour, endHour } = this.dnd.schedule;
    return startHour < endHour
      ? hour >= startHour && hour < endHour
      : hour >= startHour || hour < endHour;
  }

  // ── Visible ──

  getVisible(): SystemNotification[] { return [...this.visible]; }

  // ── Stats ──

  getStats() {
    return {
      totalSent: this.totalSent,
      totalDismissed: this.totalDismissed,
      visibleCount: this.visible.length,
      queueDepth: this.queue.length,
      historySize: this.history.length,
      groupCount: this.groups.size,
      unreadCount: this.getUnreadCount(),
      dndActive: this.isDNDActive(),
    };
  }

  getDiagnostics() {
    return {
      ...this.getStats(),
      dnd: this.dnd,
      visible: this.visible.map(n => ({ id: n.id, app: n.appId, title: n.title, urgency: n.urgency })),
    };
  }

  reset(): void {
    this.shutdown();
    this.queue = [];
    this.history = [];
    this.visible = [];
    this.groups.clear();
    this.notifCounter = 0;
    this.totalSent = 0;
    this.totalDismissed = 0;
    this.dnd = { enabled: false, allowCritical: true };
  }
}

export const NotificationService = new NotificationServiceClass();
