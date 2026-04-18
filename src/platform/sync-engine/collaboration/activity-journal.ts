// ═══════════════════════════════════════════════════════════════
// SITA OS — Global Activity Journal
// Cross-device sync history, audit, undo answers
// ═══════════════════════════════════════════════════════════════

// ─── Types ────────────────────────────────────────────────────

export type JournalCategory =
  | "sync" | "share" | "delete" | "restore" | "conflict" | "device"
  | "security" | "settings" | "enrollment" | "recovery" | "quota"
  | "workspace" | "migration" | "media" | "app-state";

export type JournalSeverity = "info" | "warning" | "critical" | "success";

export interface JournalEntry {
  id: string;
  category: JournalCategory;
  severity: JournalSeverity;
  title: string;
  description: string;
  deviceId: string;
  deviceName?: string;
  userId: string;
  objectId?: string;
  namespace?: string;
  timestamp: string;
  undoable: boolean;
  undoAction?: string;
  relatedEntries?: string[];
  metadata: Record<string, unknown>;
}

export interface JournalQuery {
  categories?: JournalCategory[];
  severity?: JournalSeverity[];
  deviceId?: string;
  userId?: string;
  namespace?: string;
  from?: string;
  to?: string;
  limit?: number;
  searchText?: string;
  undoableOnly?: boolean;
}

export interface JournalStats {
  totalEntries: number;
  todayEntries: number;
  bySeverity: Record<JournalSeverity, number>;
  byCategory: Record<string, number>;
  byDevice: Record<string, number>;
  recentDevices: string[];
  undoableCount: number;
}

export interface DeviceActivitySummary {
  deviceId: string;
  deviceName: string;
  lastActivityAt: string;
  todayActions: number;
  weekActions: number;
  topCategories: string[];
}

// ─── Activity Journal ─────────────────────────────────────────

class ActivityJournal {
  private entries: JournalEntry[] = [];
  private maxEntries = 10000;

  // ─── Logging ────────────────────────────────────────

  log(entry: Omit<JournalEntry, "id" | "timestamp">): JournalEntry {
    const full: JournalEntry = {
      ...entry,
      id: `je_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
    };
    this.entries.push(full);
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-Math.floor(this.maxEntries * 0.8));
    }
    return full;
  }

  logSync(deviceId: string, userId: string, objectCount: number, direction: "push" | "pull", deviceName?: string): JournalEntry {
    return this.log({
      category: "sync",
      severity: "info",
      title: `${direction === "push" ? "Pushed" : "Pulled"} ${objectCount} objects`,
      description: `Sync ${direction} completed on ${deviceName ?? deviceId}`,
      deviceId, userId, deviceName,
      undoable: false,
      metadata: { objectCount, direction },
    });
  }

  logShare(deviceId: string, userId: string, objectId: string, targetUserId: string, permission: string): JournalEntry {
    return this.log({
      category: "share",
      severity: "info",
      title: `Shared with user`,
      description: `Object shared with ${permission} access`,
      deviceId, userId, objectId,
      undoable: true,
      undoAction: "unshare",
      metadata: { targetUserId, permission },
    });
  }

  logDelete(deviceId: string, userId: string, objectId: string, namespace: string, recoverable: boolean): JournalEntry {
    return this.log({
      category: "delete",
      severity: recoverable ? "warning" : "critical",
      title: recoverable ? "Moved to trash" : "Permanently deleted",
      description: `Object in ${namespace} ${recoverable ? "moved to trash" : "permanently deleted"}`,
      deviceId, userId, objectId, namespace,
      undoable: recoverable,
      undoAction: "restore",
      metadata: { recoverable },
    });
  }

  logRestore(deviceId: string, userId: string, objectId: string, fromVersion?: number): JournalEntry {
    return this.log({
      category: "restore",
      severity: "success",
      title: fromVersion ? `Restored to v${fromVersion}` : "Restored from trash",
      description: `Object restored successfully`,
      deviceId, userId, objectId,
      undoable: false,
      metadata: { fromVersion },
    });
  }

  logConflict(deviceId: string, userId: string, objectId: string, resolution: string): JournalEntry {
    return this.log({
      category: "conflict",
      severity: "warning",
      title: "Conflict resolved",
      description: `Conflict resolved via ${resolution}`,
      deviceId, userId, objectId,
      undoable: false,
      metadata: { resolution },
    });
  }

  logDevice(deviceId: string, userId: string, action: string, deviceName?: string): JournalEntry {
    return this.log({
      category: "device",
      severity: action === "revoked" ? "critical" : "info",
      title: `Device ${action}`,
      description: `${deviceName ?? deviceId} ${action}`,
      deviceId, userId, deviceName,
      undoable: false,
      metadata: { action },
    });
  }

  logSecurity(deviceId: string, userId: string, action: string, details?: Record<string, unknown>): JournalEntry {
    return this.log({
      category: "security",
      severity: "warning",
      title: action,
      description: `Security event: ${action}`,
      deviceId, userId,
      undoable: false,
      metadata: details ?? {},
    });
  }

  logSettingsChange(deviceId: string, userId: string, settingKey: string, oldValue?: unknown, newValue?: unknown): JournalEntry {
    return this.log({
      category: "settings",
      severity: "info",
      title: `Setting changed: ${settingKey}`,
      description: `${settingKey} updated`,
      deviceId, userId,
      undoable: true,
      undoAction: "revert-setting",
      metadata: { settingKey, oldValue, newValue },
    });
  }

  // ─── Querying ───────────────────────────────────────

  query(q: JournalQuery): JournalEntry[] {
    let results = [...this.entries];
    if (q.categories?.length) results = results.filter(e => q.categories!.includes(e.category));
    if (q.severity?.length) results = results.filter(e => q.severity!.includes(e.severity));
    if (q.deviceId) results = results.filter(e => e.deviceId === q.deviceId);
    if (q.userId) results = results.filter(e => e.userId === q.userId);
    if (q.namespace) results = results.filter(e => e.namespace === q.namespace);
    if (q.from) results = results.filter(e => e.timestamp >= q.from!);
    if (q.to) results = results.filter(e => e.timestamp <= q.to!);
    if (q.undoableOnly) results = results.filter(e => e.undoable);
    if (q.searchText) {
      const s = q.searchText.toLowerCase();
      results = results.filter(e => e.title.toLowerCase().includes(s) || e.description.toLowerCase().includes(s));
    }
    return results.reverse().slice(0, q.limit ?? 50);
  }

  getRecent(limit = 20): JournalEntry[] {
    return this.entries.slice(-limit).reverse();
  }

  getForObject(objectId: string, limit = 20): JournalEntry[] {
    return this.entries.filter(e => e.objectId === objectId).slice(-limit).reverse();
  }

  // ─── Stats ──────────────────────────────────────────

  getStats(): JournalStats {
    const today = new Date().toISOString().split("T")[0];
    const bySeverity: Record<JournalSeverity, number> = { info: 0, warning: 0, critical: 0, success: 0 };
    const byCategory: Record<string, number> = {};
    const byDevice: Record<string, number> = {};
    let undoableCount = 0;
    let todayEntries = 0;

    for (const e of this.entries) {
      bySeverity[e.severity]++;
      byCategory[e.category] = (byCategory[e.category] ?? 0) + 1;
      byDevice[e.deviceId] = (byDevice[e.deviceId] ?? 0) + 1;
      if (e.undoable) undoableCount++;
      if (e.timestamp.startsWith(today)) todayEntries++;
    }

    const deviceEntries = Object.entries(byDevice).sort((a, b) => b[1] - a[1]);
    return {
      totalEntries: this.entries.length,
      todayEntries,
      bySeverity,
      byCategory,
      byDevice,
      recentDevices: deviceEntries.slice(0, 5).map(([id]) => id),
      undoableCount,
    };
  }

  getDeviceActivity(): DeviceActivitySummary[] {
    const now = Date.now();
    const todayCutoff = now - 86400000;
    const weekCutoff = now - 7 * 86400000;
    const deviceMap = new Map<string, { name: string; lastAt: string; today: number; week: number; cats: Record<string, number> }>();

    for (const e of this.entries) {
      const d = deviceMap.get(e.deviceId) ?? { name: e.deviceName ?? e.deviceId, lastAt: e.timestamp, today: 0, week: 0, cats: {} };
      if (e.timestamp > d.lastAt) d.lastAt = e.timestamp;
      const ts = new Date(e.timestamp).getTime();
      if (ts > todayCutoff) d.today++;
      if (ts > weekCutoff) d.week++;
      d.cats[e.category] = (d.cats[e.category] ?? 0) + 1;
      deviceMap.set(e.deviceId, d);
    }

    return Array.from(deviceMap.entries()).map(([deviceId, d]) => ({
      deviceId,
      deviceName: d.name,
      lastActivityAt: d.lastAt,
      todayActions: d.today,
      weekActions: d.week,
      topCategories: Object.entries(d.cats).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c),
    }));
  }
}

export const activityJournal = new ActivityJournal();
