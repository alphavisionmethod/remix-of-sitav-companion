// ═══════════════════════════════════════════════════════════════
// SITA OS — notifyd: Security Notification Daemon
// Routes security events (elevation, failed logins, threats)
// into the unified notification system as system-level alerts
// ═══════════════════════════════════════════════════════════════

import { getAuditDaemon } from "./auditd";

export type SecurityEventType =
  | "elevation-approved"
  | "elevation-denied"
  | "login-failed"
  | "login-success"
  | "account-locked"
  | "session-locked"
  | "session-unlocked"
  | "session-terminated"
  | "threat-detected"
  | "policy-violation"
  | "device-untrusted"
  | "credential-changed";

export interface SecurityNotification {
  id: string;
  type: SecurityEventType;
  title: string;
  body: string;
  urgency: "low" | "medium" | "high" | "critical";
  timestamp: number;
  read: boolean;
  dismissed: boolean;
  metadata?: Record<string, unknown>;
}

const EVENT_CONFIG: Record<SecurityEventType, { title: string; urgency: SecurityNotification["urgency"]; icon: string }> = {
  "elevation-approved":  { title: "Elevation Approved",          urgency: "medium", icon: "ShieldCheck" },
  "elevation-denied":    { title: "Elevation Denied",            urgency: "high",   icon: "ShieldAlert" },
  "login-failed":        { title: "Failed Login Attempt",        urgency: "high",   icon: "AlertTriangle" },
  "login-success":       { title: "Successful Login",            urgency: "low",    icon: "CheckCircle" },
  "account-locked":      { title: "Account Locked Out",          urgency: "critical", icon: "Lock" },
  "session-locked":      { title: "Session Locked",              urgency: "low",    icon: "Lock" },
  "session-unlocked":    { title: "Session Unlocked",            urgency: "low",    icon: "Unlock" },
  "session-terminated":  { title: "Session Terminated",          urgency: "medium", icon: "LogOut" },
  "threat-detected":     { title: "Threat Detected",             urgency: "critical", icon: "Bug" },
  "policy-violation":    { title: "Policy Violation",            urgency: "high",   icon: "AlertTriangle" },
  "device-untrusted":    { title: "Untrusted Device Access",     urgency: "high",   icon: "Smartphone" },
  "credential-changed":  { title: "Credential Changed",          urgency: "medium", icon: "Key" },
};

// ── Daemon ────────────────────────────────────────────────────

export class NotifyDaemon {
  private notifications: SecurityNotification[] = [];
  private listeners: Array<(n: SecurityNotification) => void> = [];
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
  }

  emit(type: SecurityEventType, body: string, metadata?: Record<string, unknown>): SecurityNotification {
    const config = EVENT_CONFIG[type];
    const notification: SecurityNotification = {
      id: crypto.randomUUID(),
      type,
      title: config.title,
      body,
      urgency: config.urgency,
      timestamp: Date.now(),
      read: false,
      dismissed: false,
      metadata: { ...metadata, icon: config.icon },
    };

    this.notifications.unshift(notification);
    // Cap at 200
    if (this.notifications.length > 200) {
      this.notifications = this.notifications.slice(0, 200);
    }

    // Notify listeners
    for (const listener of this.listeners) {
      try { listener(notification); } catch {}
    }

    // Also record in audit log
    try {
      const auditd = getAuditDaemon();
      auditd.record({
        actorUserId: (metadata?.userId as string) || "system",
        actorSessionId: (metadata?.sessionId as string) || "notifyd",
        actorService: "notifyd",
        action: `security.${type}`,
        decision: type.includes("denied") || type.includes("failed") ? "denied" : "allowed",
        severity: config.urgency === "critical" ? "critical" : config.urgency === "high" ? "high" : "info",
        reason: body,
      });
    } catch {}

    return notification;
  }

  getAll(): SecurityNotification[] {
    return [...this.notifications];
  }

  getUnread(): SecurityNotification[] {
    return this.notifications.filter(n => !n.read && !n.dismissed);
  }

  getByType(type: SecurityEventType): SecurityNotification[] {
    return this.notifications.filter(n => n.type === type);
  }

  markRead(id: string): void {
    const n = this.notifications.find(x => x.id === id);
    if (n) n.read = true;
  }

  dismiss(id: string): void {
    const n = this.notifications.find(x => x.id === id);
    if (n) n.dismissed = true;
  }

  markAllRead(): void {
    this.notifications.forEach(n => { n.read = true; });
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read && !n.dismissed).length;
  }

  getCriticalCount(): number {
    return this.notifications.filter(n => !n.read && !n.dismissed && n.urgency === "critical").length;
  }

  subscribe(listener: (n: SecurityNotification) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Seed demo notifications for first-use experience
  seedDemoEvents(): void {
    if (this.notifications.length > 0) return;
    const now = Date.now();
    this.emit("login-success", "Admin session started on this device", { userId: "admin", timestamp: now - 3600000 });
    this.emit("elevation-approved", "Elevated access granted for Security Center", { userId: "admin", action: "open-security-center" });
    this.emit("login-failed", "Failed password attempt from unknown session", { userId: "admin", attempts: 2 });
    this.emit("session-locked", "Session auto-locked after 15 minutes idle", { userId: "admin" });
    this.emit("credential-changed", "Password updated successfully", { userId: "admin" });
    this.emit("threat-detected", "Suspicious API call intercepted from unknown-endpoint.xyz", { source: "unknown-endpoint.xyz" });
  }
}

// ── Singleton ────────────────────────────────────────────────

let instance: NotifyDaemon | null = null;

export function getNotifyDaemon(): NotifyDaemon {
  if (!instance) {
    instance = new NotifyDaemon();
  }
  return instance;
}
