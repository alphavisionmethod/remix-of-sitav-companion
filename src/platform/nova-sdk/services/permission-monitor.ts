// ═══════════════════════════════════════════════════════════════
// Nova SDK — Permission Monitor Service
// Real-time tracking of permission usage across all running apps
// ═══════════════════════════════════════════════════════════════

import type { SystemService, ServiceStatus } from "./service-manager";
import type { NovaPermissionId } from "../core/manifest";

export interface PermissionAccessEntry {
  id: string;
  appId: string;
  permission: string;
  channel: string;
  timestamp: number;
  granted: boolean;
}

export interface AppPermissionSnapshot {
  appId: string;
  permissions: string[];
  activePermissions: Set<string>; // permissions used in the last 30s
  totalAccesses: number;
  deniedCount: number;
  lastAccess: number | null;
}

class PermissionMonitorClass implements SystemService {
  id = "PermissionMonitor";
  status: ServiceStatus = "stopped";

  private activeGrants = new Map<string, Set<string>>(); // appId → Set<permissionId>
  private accessLog: PermissionAccessEntry[] = [];
  private recentActivity = new Map<string, Map<string, number>>(); // appId → permission → lastUsedAt
  private deniedCount = 0;
  private maxLogSize = 500;

  boot(): void {
    this.status = "running";
    console.log("[PermissionMonitor] Service started — tracking permission usage");
  }

  shutdown(): void {
    this.status = "stopped";
  }

  // ── App Registration ──

  registerApp(appId: string, permissions: string[]): void {
    this.activeGrants.set(appId, new Set(permissions));
    this.recentActivity.set(appId, new Map());
    console.log(`[PermissionMonitor] Registered "${appId}" with ${permissions.length} permissions: [${permissions.join(", ")}]`);
  }

  revokeApp(appId: string): void {
    this.activeGrants.delete(appId);
    this.recentActivity.delete(appId);
    console.log(`[PermissionMonitor] Revoked all permissions for "${appId}"`);
  }

  // ── Access Recording ──

  recordAccess(appId: string, permission: string, channel: string, granted: boolean): void {
    const entry: PermissionAccessEntry = {
      id: `pa-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      appId,
      permission,
      channel,
      timestamp: Date.now(),
      granted,
    };

    this.accessLog.push(entry);
    if (this.accessLog.length > this.maxLogSize) {
      this.accessLog = this.accessLog.slice(-this.maxLogSize);
    }

    if (!granted) this.deniedCount++;

    // Track recent activity
    const appActivity = this.recentActivity.get(appId);
    if (appActivity && granted) {
      appActivity.set(permission, Date.now());
    }
  }

  // ── Queries ──

  getActivePermissions(): Map<string, Set<string>> {
    return new Map(this.activeGrants);
  }

  getAppSnapshot(appId: string): AppPermissionSnapshot | null {
    const perms = this.activeGrants.get(appId);
    if (!perms) return null;

    const now = Date.now();
    const activity = this.recentActivity.get(appId) ?? new Map();
    const activePerms = new Set<string>();
    for (const [perm, lastUsed] of activity) {
      if (now - lastUsed < 30000) activePerms.add(perm);
    }

    const appLogs = this.accessLog.filter(e => e.appId === appId);
    return {
      appId,
      permissions: [...perms],
      activePermissions: activePerms,
      totalAccesses: appLogs.length,
      deniedCount: appLogs.filter(e => !e.granted).length,
      lastAccess: appLogs.length > 0 ? appLogs[appLogs.length - 1].timestamp : null,
    };
  }

  getAllSnapshots(): AppPermissionSnapshot[] {
    const snapshots: AppPermissionSnapshot[] = [];
    for (const appId of this.activeGrants.keys()) {
      const snap = this.getAppSnapshot(appId);
      if (snap) snapshots.push(snap);
    }
    return snapshots;
  }

  getAccessLog(limit = 50): PermissionAccessEntry[] {
    return this.accessLog.slice(-limit);
  }

  getRegisteredApps(): string[] {
    return [...this.activeGrants.keys()];
  }

  // ── SystemService Interface ──

  getStats() {
    return {
      registeredApps: this.activeGrants.size,
      totalGrants: [...this.activeGrants.values()].reduce((sum, s) => sum + s.size, 0),
      totalAccessLogs: this.accessLog.length,
      deniedCount: this.deniedCount,
    };
  }

  getDiagnostics() {
    const permStats: Record<string, { granted: number; denied: number }> = {};
    for (const entry of this.accessLog) {
      if (!permStats[entry.permission]) permStats[entry.permission] = { granted: 0, denied: 0 };
      if (entry.granted) permStats[entry.permission].granted++;
      else permStats[entry.permission].denied++;
    }

    return {
      ...this.getStats(),
      perPermissionStats: permStats,
      appSnapshots: this.getAllSnapshots().map(s => ({
        appId: s.appId,
        permissions: s.permissions,
        activePermissions: [...s.activePermissions],
        totalAccesses: s.totalAccesses,
        deniedCount: s.deniedCount,
      })),
    };
  }

  reset(): void {
    this.activeGrants.clear();
    this.accessLog = [];
    this.recentActivity.clear();
    this.deniedCount = 0;
    this.status = "stopped";
  }
}

export const PermissionMonitor = new PermissionMonitorClass();
