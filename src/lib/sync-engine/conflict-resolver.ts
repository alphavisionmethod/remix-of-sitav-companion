// ═══════════════════════════════════════════════════════════════
// SITA OS — Conflict Resolution Engine
// 5-strategy conflict resolver for distributed sync
// ═══════════════════════════════════════════════════════════════

import type { SyncObject } from "./sync-object-model";
import { compareVersionVectors } from "./sync-object-model";
import type { ConflictStrategy } from "./sync-namespaces";
import { namespaceRegistry } from "./sync-namespaces";

/** A detected conflict between two versions of a sync object */
export interface SyncConflict {
  id: string;
  objectId: string;
  userId: string;
  namespace: string;
  localVersion: SyncObject;
  remoteVersion: SyncObject;
  baseVersion?: SyncObject;
  detectedAt: string;
  strategy: ConflictStrategy;
  status: "pending" | "auto-resolved" | "manual-required" | "resolved" | "escalated";
  resolution?: ConflictResolution;
  explanation: string;
}

/** The result of conflict resolution */
export interface ConflictResolution {
  winner: "local" | "remote" | "merged" | "manual";
  resolvedObject: SyncObject;
  resolvedAt: string;
  resolvedBy: "system" | "user" | "app";
  strategyUsed: ConflictStrategy;
  mergeDetails?: string;
}

/** App-defined merge handler */
export type AppMergeHandler = (
  local: SyncObject,
  remote: SyncObject,
  base?: SyncObject
) => SyncObject | null;

// ─── Conflict Resolution Engine ───────────────────────────────

class ConflictResolver {
  private appMergeHandlers = new Map<string, AppMergeHandler>();
  private conflicts: SyncConflict[] = [];
  private listeners: Array<(conflict: SyncConflict) => void> = [];

  /** Detect if two versions conflict */
  detectConflict(local: SyncObject, remote: SyncObject): boolean {
    const cmp = compareVersionVectors(local.versionVector, remote.versionVector);
    return cmp === 0; // concurrent = conflict
  }

  /** Resolve a conflict between local and remote versions */
  resolve(
    local: SyncObject,
    remote: SyncObject,
    base?: SyncObject,
    strategyOverride?: ConflictStrategy
  ): ConflictResolution {
    const ns = namespaceRegistry.get(local.namespace);
    const strategy = strategyOverride ?? ns?.conflictStrategy ?? "manual";

    switch (strategy) {
      case "last-write-wins":
        return this.resolveLastWriteWins(local, remote);
      case "merge-by-key":
        return this.resolveMergeByKey(local, remote, base);
      case "text-merge":
        return this.resolveTextMerge(local, remote, base);
      case "app-defined":
        return this.resolveAppDefined(local, remote, base);
      case "manual":
      default:
        return this.resolveManual(local, remote);
    }
  }

  /** Register a conflict for tracking */
  registerConflict(
    local: SyncObject,
    remote: SyncObject,
    base?: SyncObject
  ): SyncConflict {
    const ns = namespaceRegistry.get(local.namespace);
    const strategy = ns?.conflictStrategy ?? "manual";

    const conflict: SyncConflict = {
      id: `conflict_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      objectId: local.id,
      userId: local.userId,
      namespace: local.namespace,
      localVersion: local,
      remoteVersion: remote,
      baseVersion: base,
      detectedAt: new Date().toISOString(),
      strategy,
      status: "pending",
      explanation: this.generateExplanation(local, remote, strategy),
    };

    // Try auto-resolution
    if (strategy !== "manual") {
      try {
        const resolution = this.resolve(local, remote, base);
        conflict.resolution = resolution;
        conflict.status = "auto-resolved";
      } catch {
        conflict.status = "manual-required";
      }
    } else {
      conflict.status = "manual-required";
    }

    this.conflicts.push(conflict);
    this.emit(conflict);
    return conflict;
  }

  /** Manually resolve a pending conflict */
  manualResolve(
    conflictId: string,
    winner: "local" | "remote",
    resolvedBy: string = "user"
  ): ConflictResolution | null {
    const conflict = this.conflicts.find((c) => c.id === conflictId);
    if (!conflict) return null;

    const winnerObj = winner === "local" ? conflict.localVersion : conflict.remoteVersion;
    const resolution: ConflictResolution = {
      winner,
      resolvedObject: {
        ...winnerObj,
        version: Math.max(conflict.localVersion.version, conflict.remoteVersion.version) + 1,
        updatedAt: new Date().toISOString(),
        state: "active",
        conflictParentVersion: winnerObj.version,
      },
      resolvedAt: new Date().toISOString(),
      resolvedBy: resolvedBy === "user" ? "user" : "system",
      strategyUsed: "manual",
      mergeDetails: `User chose ${winner} version`,
    };

    conflict.resolution = resolution;
    conflict.status = "resolved";
    return resolution;
  }

  /** Register an app-defined merge handler */
  registerAppMergeHandler(appId: string, handler: AppMergeHandler): void {
    this.appMergeHandlers.set(appId, handler);
  }

  /** Get all conflicts */
  getConflicts(): SyncConflict[] {
    return [...this.conflicts];
  }

  /** Get pending conflicts */
  getPendingConflicts(): SyncConflict[] {
    return this.conflicts.filter((c) => c.status === "pending" || c.status === "manual-required");
  }

  /** Clear resolved conflicts older than retention period */
  purgeResolved(olderThanMs: number = 7 * 24 * 60 * 60 * 1000): number {
    const cutoff = Date.now() - olderThanMs;
    const before = this.conflicts.length;
    this.conflicts = this.conflicts.filter(
      (c) => c.status !== "resolved" && c.status !== "auto-resolved" ||
        new Date(c.detectedAt).getTime() > cutoff
    );
    return before - this.conflicts.length;
  }

  /** Subscribe to new conflicts */
  onConflict(fn: (conflict: SyncConflict) => void): () => void {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter((l) => l !== fn); };
  }

  // ─── Strategy Implementations ─────────────────

  private resolveLastWriteWins(local: SyncObject, remote: SyncObject): ConflictResolution {
    const localTime = new Date(local.updatedAt).getTime();
    const remoteTime = new Date(remote.updatedAt).getTime();
    const winner = localTime >= remoteTime ? "local" : "remote";
    const winnerObj = winner === "local" ? local : remote;

    return {
      winner,
      resolvedObject: {
        ...winnerObj,
        version: Math.max(local.version, remote.version) + 1,
        state: "active",
        conflictParentVersion: winnerObj.version,
      },
      resolvedAt: new Date().toISOString(),
      resolvedBy: "system",
      strategyUsed: "last-write-wins",
      mergeDetails: `${winner} version wins (timestamp: ${winnerObj.updatedAt})`,
    };
  }

  private resolveMergeByKey(
    local: SyncObject,
    remote: SyncObject,
    base?: SyncObject
  ): ConflictResolution {
    const localPayload = (local.payload ?? {}) as Record<string, unknown>;
    const remotePayload = (remote.payload ?? {}) as Record<string, unknown>;
    const basePayload = (base?.payload ?? {}) as Record<string, unknown>;

    // Three-way merge: for each key, if only one side changed from base, take that change
    const merged: Record<string, unknown> = { ...basePayload };
    const allKeys = new Set([...Object.keys(localPayload), ...Object.keys(remotePayload), ...Object.keys(basePayload)]);

    for (const key of allKeys) {
      const baseVal = JSON.stringify(basePayload[key]);
      const localVal = JSON.stringify(localPayload[key]);
      const remoteVal = JSON.stringify(remotePayload[key]);

      if (localVal === remoteVal) {
        // Both agree
        merged[key] = localPayload[key];
      } else if (localVal !== baseVal && remoteVal === baseVal) {
        // Only local changed
        merged[key] = localPayload[key];
      } else if (remoteVal !== baseVal && localVal === baseVal) {
        // Only remote changed
        merged[key] = remotePayload[key];
      } else {
        // Both changed differently — last-write-wins for this key
        const lt = new Date(local.updatedAt).getTime();
        const rt = new Date(remote.updatedAt).getTime();
        merged[key] = lt >= rt ? localPayload[key] : remotePayload[key];
      }
    }

    return {
      winner: "merged",
      resolvedObject: {
        ...local,
        payload: merged as any,
        version: Math.max(local.version, remote.version) + 1,
        updatedAt: new Date().toISOString(),
        state: "active",
        conflictParentVersion: local.version,
      },
      resolvedAt: new Date().toISOString(),
      resolvedBy: "system",
      strategyUsed: "merge-by-key",
      mergeDetails: `Merged ${allKeys.size} keys using three-way merge`,
    };
  }

  private resolveTextMerge(
    local: SyncObject,
    remote: SyncObject,
    base?: SyncObject
  ): ConflictResolution {
    const localText = String(local.payload ?? "");
    const remoteText = String(remote.payload ?? "");
    const baseText = String(base?.payload ?? "");

    // Simple line-based three-way merge
    const baseLines = baseText.split("\n");
    const localLines = localText.split("\n");
    const remoteLines = remoteText.split("\n");

    const mergedLines: string[] = [];
    const maxLen = Math.max(baseLines.length, localLines.length, remoteLines.length);
    let hasConflictMarkers = false;

    for (let i = 0; i < maxLen; i++) {
      const b = baseLines[i] ?? "";
      const l = localLines[i] ?? "";
      const r = remoteLines[i] ?? "";

      if (l === r) {
        mergedLines.push(l);
      } else if (l !== b && r === b) {
        mergedLines.push(l);
      } else if (r !== b && l === b) {
        mergedLines.push(r);
      } else {
        // True conflict on this line
        mergedLines.push(`<<<<<<< LOCAL`);
        mergedLines.push(l);
        mergedLines.push(`=======`);
        mergedLines.push(r);
        mergedLines.push(`>>>>>>> REMOTE`);
        hasConflictMarkers = true;
      }
    }

    if (hasConflictMarkers) {
      // Cannot auto-resolve, escalate to manual
      return {
        winner: "merged",
        resolvedObject: {
          ...local,
          payload: mergedLines.join("\n") as any,
          version: Math.max(local.version, remote.version) + 1,
          updatedAt: new Date().toISOString(),
          state: "conflict",
          conflictParentVersion: local.version,
        },
        resolvedAt: new Date().toISOString(),
        resolvedBy: "system",
        strategyUsed: "text-merge",
        mergeDetails: "Text merge produced conflict markers — manual review needed",
      };
    }

    return {
      winner: "merged",
      resolvedObject: {
        ...local,
        payload: mergedLines.join("\n") as any,
        version: Math.max(local.version, remote.version) + 1,
        updatedAt: new Date().toISOString(),
        state: "active",
        conflictParentVersion: local.version,
      },
      resolvedAt: new Date().toISOString(),
      resolvedBy: "system",
      strategyUsed: "text-merge",
      mergeDetails: `Clean text merge of ${maxLen} lines`,
    };
  }

  private resolveAppDefined(
    local: SyncObject,
    remote: SyncObject,
    base?: SyncObject
  ): ConflictResolution {
    const ns = namespaceRegistry.get(local.namespace);
    const appId = ns?.appId;
    if (appId) {
      const handler = this.appMergeHandlers.get(appId);
      if (handler) {
        const merged = handler(local, remote, base);
        if (merged) {
          return {
            winner: "merged",
            resolvedObject: {
              ...merged,
              version: Math.max(local.version, remote.version) + 1,
              state: "active",
            },
            resolvedAt: new Date().toISOString(),
            resolvedBy: "app",
            strategyUsed: "app-defined",
            mergeDetails: `App ${appId} performed custom merge`,
          };
        }
      }
    }
    // Fallback to manual
    return this.resolveManual(local, remote);
  }

  private resolveManual(local: SyncObject, remote: SyncObject): ConflictResolution {
    return {
      winner: "manual",
      resolvedObject: local, // Placeholder — user must choose
      resolvedAt: "",
      resolvedBy: "user",
      strategyUsed: "manual",
      mergeDetails: "Requires manual resolution by user",
    };
  }

  private generateExplanation(local: SyncObject, remote: SyncObject, strategy: ConflictStrategy): string {
    const localDevice = local.originDeviceId.slice(0, 8);
    const remoteDevice = remote.originDeviceId.slice(0, 8);
    return `This ${local.type} was modified on two devices simultaneously. ` +
      `Device ${localDevice} has version ${local.version}, device ${remoteDevice} has version ${remote.version}. ` +
      `Resolution strategy: ${strategy}.`;
  }

  private emit(conflict: SyncConflict) {
    for (const fn of this.listeners) fn(conflict);
  }
}

/** Singleton conflict resolver */
export const conflictResolver = new ConflictResolver();
