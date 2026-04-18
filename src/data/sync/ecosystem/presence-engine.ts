// ═══════════════════════════════════════════════════════════════
// SITA OS — Presence & Continuity Engine
// Live device presence, handoff, activity graph
// ═══════════════════════════════════════════════════════════════

// ─── Types ────────────────────────────────────────────────────

export type DevicePresenceStatus = "online" | "active" | "idle" | "away" | "offline" | "do-not-disturb";

export interface DevicePresence {
  deviceId: string;
  deviceName: string;
  platform: string;
  status: DevicePresenceStatus;
  lastSeenAt: string;
  currentApp?: string;
  currentDocument?: string;
  batteryLevel?: number;
  isCharging?: boolean;
  networkType?: "wifi" | "cellular" | "ethernet" | "offline";
  capabilities: DeviceCapabilitySet;
  ipLocal?: string;
}

export interface DeviceCapabilitySet {
  canReceiveHandoff: boolean;
  canSendHandoff: boolean;
  hasCamera: boolean;
  hasMicrophone: boolean;
  hasKeyboard: boolean;
  hasTouch: boolean;
  screenSize: "small" | "medium" | "large" | "xlarge";
  storageAvailable: "low" | "normal" | "high";
}

export interface HandoffSuggestion {
  id: string;
  type: "continue-app" | "continue-document" | "continue-session" | "transfer-task";
  sourceDeviceId: string;
  targetDeviceId: string;
  title: string;
  description: string;
  appId?: string;
  documentId?: string;
  sessionData?: unknown;
  confidence: number;
  createdAt: string;
  expiresAt: string;
}

export interface ContinuitySession {
  id: string;
  userId: string;
  sourceDeviceId: string;
  targetDeviceId: string;
  appId: string;
  documentId?: string;
  state: unknown;
  status: "available" | "transferring" | "completed" | "expired" | "declined";
  createdAt: string;
  transferredAt?: string;
}

export interface ActivityGraphEntry {
  deviceId: string;
  deviceName: string;
  appId: string;
  appName?: string;
  documentId?: string;
  documentName?: string;
  startedAt: string;
  endedAt?: string;
  durationMs: number;
}

// ─── Presence Engine ──────────────────────────────────────────

class PresenceEngine {
  private presenceMap = new Map<string, DevicePresence>();
  private handoffSuggestions: HandoffSuggestion[] = [];
  private continuitySessions = new Map<string, ContinuitySession>();
  private activityGraph: ActivityGraphEntry[] = [];
  private heartbeatTimers = new Map<string, ReturnType<typeof setTimeout>>();

  // ─── Presence Management ───────────────────────────

  updatePresence(presence: DevicePresence): void {
    const existing = this.presenceMap.get(presence.deviceId);
    this.presenceMap.set(presence.deviceId, {
      ...presence,
      lastSeenAt: new Date().toISOString(),
    });

    // If app changed, record activity
    if (existing?.currentApp !== presence.currentApp && existing?.currentApp) {
      this.recordActivity(presence.deviceId, presence.deviceName, existing.currentApp, undefined, existing.currentDocument);
    }

    // Auto-generate handoff suggestions
    if (presence.status === "online" || presence.status === "active") {
      this.generateHandoffSuggestions(presence);
    }

    // Reset heartbeat timeout
    this.resetHeartbeat(presence.deviceId);
  }

  removePresence(deviceId: string): void {
    this.presenceMap.delete(deviceId);
    const timer = this.heartbeatTimers.get(deviceId);
    if (timer) clearTimeout(timer);
    this.heartbeatTimers.delete(deviceId);
  }

  getPresence(deviceId: string): DevicePresence | null {
    return this.presenceMap.get(deviceId) ?? null;
  }

  getAllPresence(): DevicePresence[] {
    return Array.from(this.presenceMap.values());
  }

  getOnlineDevices(): DevicePresence[] {
    return this.getAllPresence().filter(p =>
      p.status !== "offline" && this.isRecent(p.lastSeenAt, 300000)
    );
  }

  getDeviceStatusLabel(deviceId: string): string {
    const p = this.presenceMap.get(deviceId);
    if (!p) return "Unknown";
    if (!this.isRecent(p.lastSeenAt, 300000)) return "Offline";
    const labels: Record<DevicePresenceStatus, string> = {
      online: "Online",
      active: "Active now",
      idle: "Idle",
      away: "Away",
      offline: "Offline",
      "do-not-disturb": "Do Not Disturb",
    };
    return labels[p.status];
  }

  getRecentlyActive(minutes = 30): DevicePresence[] {
    return this.getAllPresence()
      .filter(p => this.isRecent(p.lastSeenAt, minutes * 60000))
      .sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));
  }

  // ─── Handoff ───────────────────────────────────────

  createHandoff(source: string, target: string, appId: string, title: string, documentId?: string, sessionData?: unknown): HandoffSuggestion {
    const suggestion: HandoffSuggestion = {
      id: `ho_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: documentId ? "continue-document" : "continue-app",
      sourceDeviceId: source,
      targetDeviceId: target,
      title,
      description: `Continue on ${this.presenceMap.get(target)?.deviceName ?? target}`,
      appId,
      documentId,
      sessionData,
      confidence: 0.85,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 600000).toISOString(), // 10 min
    };
    this.handoffSuggestions.push(suggestion);
    return suggestion;
  }

  getHandoffSuggestions(deviceId: string): HandoffSuggestion[] {
    const now = Date.now();
    return this.handoffSuggestions.filter(s =>
      s.targetDeviceId === deviceId && new Date(s.expiresAt).getTime() > now
    );
  }

  acceptHandoff(suggestionId: string): ContinuitySession | null {
    const suggestion = this.handoffSuggestions.find(s => s.id === suggestionId);
    if (!suggestion) return null;

    const session: ContinuitySession = {
      id: `cs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId: "",
      sourceDeviceId: suggestion.sourceDeviceId,
      targetDeviceId: suggestion.targetDeviceId,
      appId: suggestion.appId ?? "",
      documentId: suggestion.documentId,
      state: suggestion.sessionData,
      status: "transferring",
      createdAt: new Date().toISOString(),
    };
    this.continuitySessions.set(session.id, session);
    // Remove the suggestion
    this.handoffSuggestions = this.handoffSuggestions.filter(s => s.id !== suggestionId);
    return session;
  }

  completeHandoff(sessionId: string): void {
    const session = this.continuitySessions.get(sessionId);
    if (session) {
      session.status = "completed";
      session.transferredAt = new Date().toISOString();
    }
  }

  // ─── Activity Graph ────────────────────────────────

  recordActivity(deviceId: string, deviceName: string, appId: string, appName?: string, documentId?: string, documentName?: string): void {
    // Close previous activity on this device
    const last = this.activityGraph.filter(a => a.deviceId === deviceId && !a.endedAt).pop();
    if (last) {
      last.endedAt = new Date().toISOString();
      last.durationMs = new Date(last.endedAt).getTime() - new Date(last.startedAt).getTime();
    }

    this.activityGraph.push({
      deviceId, deviceName, appId, appName, documentId, documentName,
      startedAt: new Date().toISOString(),
      durationMs: 0,
    });

    if (this.activityGraph.length > 2000) {
      this.activityGraph = this.activityGraph.slice(-1500);
    }
  }

  getActivityGraph(deviceId?: string, hours = 24): ActivityGraphEntry[] {
    const cutoff = new Date(Date.now() - hours * 3600000).toISOString();
    let results = this.activityGraph.filter(a => a.startedAt > cutoff);
    if (deviceId) results = results.filter(a => a.deviceId === deviceId);
    return results;
  }

  // ─── Smart Suggestions ─────────────────────────────

  getContinuitySuggestions(currentDeviceId: string): Array<{ title: string; description: string; deviceName: string; deviceId: string; appId: string }> {
    const suggestions: Array<{ title: string; description: string; deviceName: string; deviceId: string; appId: string }> = [];
    const online = this.getOnlineDevices().filter(d => d.deviceId !== currentDeviceId);

    for (const device of online) {
      if (device.currentApp) {
        suggestions.push({
          title: `Continue ${device.currentApp}`,
          description: device.currentDocument
            ? `"${device.currentDocument}" open on ${device.deviceName}`
            : `Recently active on ${device.deviceName}`,
          deviceName: device.deviceName,
          deviceId: device.deviceId,
          appId: device.currentApp,
        });
      }
    }

    return suggestions;
  }

  // ─── Stats ─────────────────────────────────────────

  getStats() {
    const online = this.getOnlineDevices();
    return {
      totalDevices: this.presenceMap.size,
      onlineDevices: online.length,
      activeDevices: online.filter(d => d.status === "active").length,
      pendingHandoffs: this.handoffSuggestions.filter(s => new Date(s.expiresAt).getTime() > Date.now()).length,
      activeSessions: Array.from(this.continuitySessions.values()).filter(s => s.status === "transferring").length,
      activityEntries: this.activityGraph.length,
    };
  }

  // ─── Internal ──────────────────────────────────────

  private generateHandoffSuggestions(device: DevicePresence): void {
    // Auto-cleanup expired
    this.handoffSuggestions = this.handoffSuggestions.filter(s => new Date(s.expiresAt).getTime() > Date.now());

    if (!device.currentApp) return;
    const otherOnline = this.getOnlineDevices().filter(d =>
      d.deviceId !== device.deviceId && d.capabilities.canReceiveHandoff
    );

    for (const target of otherOnline) {
      const existing = this.handoffSuggestions.find(s =>
        s.sourceDeviceId === device.deviceId && s.targetDeviceId === target.deviceId && s.appId === device.currentApp
      );
      if (!existing) {
        this.createHandoff(device.deviceId, target.deviceId, device.currentApp,
          `Continue ${device.currentApp}`, device.currentDocument);
      }
    }
  }

  private resetHeartbeat(deviceId: string): void {
    const existing = this.heartbeatTimers.get(deviceId);
    if (existing) clearTimeout(existing);
    this.heartbeatTimers.set(deviceId, setTimeout(() => {
      const p = this.presenceMap.get(deviceId);
      if (p) p.status = "away";
    }, 120000)); // 2 min
  }

  private isRecent(isoDate: string, withinMs: number): boolean {
    return Date.now() - new Date(isoDate).getTime() < withinMs;
  }
}

export const presenceEngine = new PresenceEngine();
