// ═══════════════════════════════════════════════════════════════
// SITA OS — Sync Notifications
// Integration with notifyd for sync-related user notifications
// ═══════════════════════════════════════════════════════════════

import type { SyncUXState } from "./sync-state-machine";

/** Notification category */
export type SyncNotificationCategory =
  | "sync-status" | "conflict" | "device" | "storage"
  | "security" | "recommendation" | "handoff" | "error";

/** A sync notification */
export interface SyncNotification {
  id: string;
  category: SyncNotificationCategory;
  title: string;
  body: string;
  priority: "low" | "normal" | "high" | "urgent";
  icon: string;
  timestamp: string;
  read: boolean;
  dismissed: boolean;
  actionLabel?: string;
  actionRoute?: string;
  autoExpireMs?: number;
}

class SyncNotificationService {
  private notifications: SyncNotification[] = [];
  private listeners: Array<(notification: SyncNotification) => void> = [];
  private suppressedCategories = new Set<SyncNotificationCategory>();

  /** Emit a sync notification */
  notify(params: Omit<SyncNotification, "id" | "timestamp" | "read" | "dismissed">): SyncNotification {
    if (this.suppressedCategories.has(params.category)) {
      return { ...params, id: "", timestamp: "", read: true, dismissed: true };
    }

    const notification: SyncNotification = {
      ...params,
      id: `snotif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      read: false,
      dismissed: false,
    };

    this.notifications.push(notification);
    if (this.notifications.length > 200) this.notifications = this.notifications.slice(-100);

    for (const listener of this.listeners) listener(notification);

    // Auto-expire
    if (notification.autoExpireMs) {
      setTimeout(() => { notification.dismissed = true; }, notification.autoExpireMs);
    }

    return notification;
  }

  // ─── Pre-built notification templates ───────

  notifySyncStateChange(state: SyncUXState): void {
    const messages: Partial<Record<SyncUXState, { title: string; body: string; priority: SyncNotification["priority"] }>> = {
      "offline": { title: "You're offline", body: "Changes will sync when you reconnect.", priority: "normal" },
      "conflict": { title: "Sync conflict detected", body: "Some files were changed on multiple devices. Review needed.", priority: "high" },
      "error": { title: "Sync error", body: "There was a problem syncing. We'll retry automatically.", priority: "high" },
      "waiting-for-wifi": { title: "Waiting for Wi-Fi", body: "Large files will sync when on Wi-Fi.", priority: "low" },
      "waiting-for-charge": { title: "Sync paused", body: "Battery low. Sync will resume when charging.", priority: "low" },
    };

    const msg = messages[state];
    if (msg) {
      this.notify({ category: "sync-status", title: msg.title, body: msg.body, priority: msg.priority, icon: "RefreshCw" });
    }
  }

  notifyConflict(objectName: string, deviceA: string, deviceB: string): void {
    this.notify({
      category: "conflict",
      title: `Conflict: ${objectName}`,
      body: `Changed on both ${deviceA} and ${deviceB}. Tap to resolve.`,
      priority: "high",
      icon: "AlertTriangle",
      actionLabel: "Resolve",
      actionRoute: "/settings/cloud/conflicts",
    });
  }

  notifyDeviceActivity(deviceName: string, action: string): void {
    this.notify({
      category: "device",
      title: `Device: ${deviceName}`,
      body: action,
      priority: "normal",
      icon: "Smartphone",
      autoExpireMs: 30000,
    });
  }

  notifyStorageFull(): void {
    this.notify({
      category: "storage",
      title: "Storage full",
      body: "Some files are cloud-only. Free up space or upgrade your plan.",
      priority: "high",
      icon: "HardDrive",
      actionLabel: "Manage",
      actionRoute: "/settings/cloud/storage",
    });
  }

  notifyPublicWifi(): void {
    this.notify({
      category: "security",
      title: "Public Wi-Fi detected",
      body: "Sync paused until secure connection is available. Consider using a VPN.",
      priority: "high",
      icon: "Shield",
    });
  }

  notifyHandoffAvailable(appName: string, fromDevice: string): void {
    this.notify({
      category: "handoff",
      title: `Continue on this device`,
      body: `${appName} is open on ${fromDevice}. Resume here?`,
      priority: "normal",
      icon: "ArrowRight",
      actionLabel: "Continue",
      autoExpireMs: 60000,
    });
  }

  notifyRestoreReady(deviceName: string): void {
    this.notify({
      category: "recommendation",
      title: "Workspace ready",
      body: `Your workspace from ${deviceName} is ready to restore.`,
      priority: "normal",
      icon: "Layout",
      actionLabel: "Restore",
    });
  }

  // ─── Management ─────────────────────────────

  markRead(notificationId: string): void {
    const n = this.notifications.find(n => n.id === notificationId);
    if (n) n.read = true;
  }

  dismiss(notificationId: string): void {
    const n = this.notifications.find(n => n.id === notificationId);
    if (n) n.dismissed = true;
  }

  dismissAll(): void {
    for (const n of this.notifications) n.dismissed = true;
  }

  getUnread(): SyncNotification[] {
    return this.notifications.filter(n => !n.read && !n.dismissed);
  }

  getAll(): SyncNotification[] {
    return this.notifications.filter(n => !n.dismissed);
  }

  getByCategory(category: SyncNotificationCategory): SyncNotification[] {
    return this.notifications.filter(n => n.category === category && !n.dismissed);
  }

  suppressCategory(category: SyncNotificationCategory): void {
    this.suppressedCategories.add(category);
  }

  unsuppressCategory(category: SyncNotificationCategory): void {
    this.suppressedCategories.delete(category);
  }

  onNotification(handler: (notification: SyncNotification) => void): () => void {
    this.listeners.push(handler);
    return () => { this.listeners = this.listeners.filter(l => l !== handler); };
  }
}

/** Singleton sync notification service */
export const syncNotifications = new SyncNotificationService();
