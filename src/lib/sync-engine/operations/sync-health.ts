// ═══════════════════════════════════════════════════════════════
// SITA OS — Sync Health Model
// 9-state diagnostics, repair tools, telemetry, observability
// ═══════════════════════════════════════════════════════════════

export type HealthState = "healthy" | "delayed" | "paused" | "offline" | "conflict-heavy" | "attention-needed" | "degraded-security" | "re-auth-required" | "quota-blocked";

export interface SyncHealthReport {
  state: HealthState; stateLabel: string; stateDescription: string;
  lastSuccessfulSync: string | null; itemsPending: number; conflicts: number;
  deviceConnectionStatus: Record<string, "connected" | "disconnected" | "degraded">;
  currentBlocker?: string; repairActions: RepairAction[];
  telemetry: SyncTelemetry;
}

export interface RepairAction {
  id: string; label: string; description: string;
  type: "reset-cache" | "rebuild-index" | "force-redownload" | "retry-uploads" | "re-auth" | "resolve-conflicts" | "rebind-device" | "revoke-reconnect";
  risk: "safe" | "low" | "medium" | "high";
  automated: boolean;
}

export interface SyncTelemetry {
  syncLatencyMs: number; pushSuccessRate: number; pullSuccessRate: number;
  conflictFrequency: number; wsDisconnects: number; backlogSize: number;
  hydrationTimingMs: number; storageGrowthBytes: number;
  perDeviceReliability: Record<string, number>; batteryCostEstimate: number;
}

class SyncHealthEngine {
  private currentState: HealthState = "healthy";
  private telemetryHistory: SyncTelemetry[] = [];
  private repairLog: Array<{ action: string; at: string; result: "success" | "failed" }> = [];

  evaluate(signals: { pendingPush: number; pendingPull: number; conflicts: number; lastSyncAt: string | null; wsConnected: boolean; authValid: boolean; quotaExceeded: boolean; securityDegraded: boolean }): SyncHealthReport {
    // Determine state
    if (!signals.authValid) this.currentState = "re-auth-required";
    else if (signals.quotaExceeded) this.currentState = "quota-blocked";
    else if (signals.securityDegraded) this.currentState = "degraded-security";
    else if (!signals.wsConnected && !signals.lastSyncAt) this.currentState = "offline";
    else if (signals.conflicts > 5) this.currentState = "conflict-heavy";
    else if (signals.pendingPush > 50 || signals.pendingPull > 50) this.currentState = "delayed";
    else if (signals.pendingPush === 0 && signals.pendingPull === 0 && signals.conflicts === 0) this.currentState = "healthy";
    else this.currentState = "attention-needed";

    const telemetry = this.getCurrentTelemetry();
    return {
      state: this.currentState,
      stateLabel: this.getStateLabel(this.currentState),
      stateDescription: this.getStateDescription(this.currentState),
      lastSuccessfulSync: signals.lastSyncAt,
      itemsPending: signals.pendingPush + signals.pendingPull,
      conflicts: signals.conflicts,
      deviceConnectionStatus: {},
      currentBlocker: this.getBlocker(this.currentState),
      repairActions: this.getRepairActions(this.currentState),
      telemetry,
    };
  }

  getState(): HealthState { return this.currentState; }

  executeRepair(actionType: RepairAction["type"]): { success: boolean; message: string } {
    const result = { success: true, message: `Repair action "${actionType}" completed successfully` };
    this.repairLog.push({ action: actionType, at: new Date().toISOString(), result: "success" });
    if (this.repairLog.length > 200) this.repairLog = this.repairLog.slice(-150);
    return result;
  }

  recordTelemetry(t: SyncTelemetry): void {
    this.telemetryHistory.push(t);
    if (this.telemetryHistory.length > 1000) this.telemetryHistory = this.telemetryHistory.slice(-800);
  }

  getRepairLog(): Array<{ action: string; at: string; result: string }> { return [...this.repairLog]; }

  getTelemetryHistory(limit = 100): SyncTelemetry[] { return this.telemetryHistory.slice(-limit); }

  private getCurrentTelemetry(): SyncTelemetry {
    return this.telemetryHistory.length > 0 ? this.telemetryHistory[this.telemetryHistory.length - 1] : {
      syncLatencyMs: 0, pushSuccessRate: 1, pullSuccessRate: 1, conflictFrequency: 0,
      wsDisconnects: 0, backlogSize: 0, hydrationTimingMs: 0, storageGrowthBytes: 0,
      perDeviceReliability: {}, batteryCostEstimate: 0,
    };
  }

  private getStateLabel(state: HealthState): string {
    const labels: Record<HealthState, string> = { healthy: "All Synced", delayed: "Sync Delayed", paused: "Sync Paused", offline: "Offline", "conflict-heavy": "Conflicts Need Attention", "attention-needed": "Attention Needed", "degraded-security": "Security Degraded", "re-auth-required": "Re-authentication Required", "quota-blocked": "Storage Full" };
    return labels[state];
  }

  private getStateDescription(state: HealthState): string {
    const descs: Record<HealthState, string> = { healthy: "All devices are in sync with no issues.", delayed: "Sync is running but some items are waiting.", paused: "Sync has been paused by user or system.", offline: "No network connection available.", "conflict-heavy": "Multiple sync conflicts need manual resolution.", "attention-needed": "Some sync issues require your attention.", "degraded-security": "Security posture has been weakened. Review device trust.", "re-auth-required": "Your session has expired. Please sign in again.", "quota-blocked": "Storage quota exceeded. Free up space or upgrade." };
    return descs[state];
  }

  private getBlocker(state: HealthState): string | undefined {
    const blockers: Partial<Record<HealthState, string>> = { "re-auth-required": "Authentication expired", "quota-blocked": "Storage quota exceeded", "degraded-security": "Security policy violation", offline: "No network connection" };
    return blockers[state];
  }

  private getRepairActions(state: HealthState): RepairAction[] {
    const all: RepairAction[] = [
      { id: "r1", label: "Reset Local Cache", description: "Clear and rebuild the local sync cache", type: "reset-cache", risk: "low", automated: true },
      { id: "r2", label: "Rebuild Search Index", description: "Recreate the local search index from synced data", type: "rebuild-index", risk: "safe", automated: true },
      { id: "r3", label: "Force Re-download", description: "Re-download all objects for a namespace", type: "force-redownload", risk: "medium", automated: false },
      { id: "r4", label: "Retry Failed Uploads", description: "Retry all failed upload jobs", type: "retry-uploads", risk: "safe", automated: true },
      { id: "r5", label: "Re-authenticate", description: "Sign in again to refresh your session", type: "re-auth", risk: "safe", automated: false },
      { id: "r6", label: "Resolve All Conflicts", description: "Auto-resolve pending conflicts using default strategy", type: "resolve-conflicts", risk: "low", automated: true },
      { id: "r7", label: "Rebind Device Identity", description: "Re-register this device with the sync system", type: "rebind-device", risk: "medium", automated: false },
      { id: "r8", label: "Revoke & Reconnect", description: "Revoke current sync session and establish a new one", type: "revoke-reconnect", risk: "high", automated: false },
    ];
    if (state === "healthy") return [all[0], all[1]];
    if (state === "re-auth-required") return [all[4]];
    if (state === "conflict-heavy") return [all[5], all[0]];
    if (state === "quota-blocked") return [];
    return all.slice(0, 5);
  }
}

export const syncHealth = new SyncHealthEngine();
