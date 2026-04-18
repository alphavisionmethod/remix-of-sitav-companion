// ═══════════════════════════════════════════════════════════════
// SITA OS — Abuse Prevention Engine
// Rate limits, throttling, mass-change detection, ransomware guard
// ═══════════════════════════════════════════════════════════════

export type ThreatLevel = "none" | "low" | "medium" | "high" | "critical";
export type AbuseAction = "allow" | "throttle" | "pause" | "block" | "checkpoint-and-notify";

export interface RateLimit { key: string; maxActions: number; windowMs: number; currentCount: number; windowStart: number; }
export interface AbuseAlert { id: string; deviceId: string; userId: string; threatLevel: ThreatLevel; type: string; description: string; action: AbuseAction; timestamp: string; resolved: boolean; metadata: Record<string, unknown>; }
export interface MassChangeDetection { windowMs: number; deleteThreshold: number; encryptThreshold: number; modifyThreshold: number; currentDeletes: number; currentEncrypts: number; currentModifies: number; windowStart: number; }

class AbusePreventionEngine {
  private rateLimits = new Map<string, RateLimit>();
  private alerts: AbuseAlert[] = [];
  private massChangeWindows = new Map<string, MassChangeDetection>();
  private blockedDevices = new Set<string>();
  private pausedPropagation = new Set<string>();

  // ─── Rate Limiting ─────────────────────────────────

  checkRate(deviceId: string, action: string, limit = 100, windowMs = 60000): AbuseAction {
    const key = `${deviceId}:${action}`;
    let rl = this.rateLimits.get(key);
    if (!rl || Date.now() - rl.windowStart > rl.windowMs) {
      rl = { key, maxActions: limit, windowMs, currentCount: 0, windowStart: Date.now() };
      this.rateLimits.set(key, rl);
    }
    rl.currentCount++;
    if (rl.currentCount > limit * 2) { this.createAlert(deviceId, "", "critical", "rate-limit-extreme", `Extreme rate: ${rl.currentCount}/${limit} ${action}/min`, "block"); return "block"; }
    if (rl.currentCount > limit) { this.createAlert(deviceId, "", "medium", "rate-limit", `Rate exceeded: ${rl.currentCount}/${limit} ${action}/min`, "throttle"); return "throttle"; }
    return "allow";
  }

  // ─── Mass Change / Ransomware Detection ────────────

  recordChange(deviceId: string, userId: string, changeType: "delete" | "encrypt" | "modify"): AbuseAction {
    let window = this.massChangeWindows.get(deviceId);
    if (!window || Date.now() - window.windowStart > window.windowMs) {
      window = { windowMs: 300000, deleteThreshold: 100, encryptThreshold: 50, modifyThreshold: 500, currentDeletes: 0, currentEncrypts: 0, currentModifies: 0, windowStart: Date.now() };
      this.massChangeWindows.set(deviceId, window);
    }
    if (changeType === "delete") window.currentDeletes++;
    else if (changeType === "encrypt") window.currentEncrypts++;
    else window.currentModifies++;

    // Ransomware-like detection
    if (window.currentEncrypts > window.encryptThreshold || window.currentDeletes > window.deleteThreshold) {
      this.pausedPropagation.add(deviceId);
      this.createAlert(deviceId, userId, "critical", "mass-change-detected",
        `Suspicious mass ${changeType}: ${changeType === "delete" ? window.currentDeletes : window.currentEncrypts} in ${window.windowMs / 1000}s. Propagation paused.`,
        "checkpoint-and-notify", { deletes: window.currentDeletes, encrypts: window.currentEncrypts });
      return "checkpoint-and-notify";
    }
    if (window.currentModifies > window.modifyThreshold) {
      this.createAlert(deviceId, userId, "high", "bulk-modify", `Bulk modification: ${window.currentModifies} changes in ${window.windowMs / 1000}s`, "throttle");
      return "throttle";
    }
    return "allow";
  }

  // ─── Device Blocking ──────────────────────────────

  blockDevice(deviceId: string, reason: string, userId = ""): void {
    this.blockedDevices.add(deviceId);
    this.createAlert(deviceId, userId, "critical", "device-blocked", `Device blocked: ${reason}`, "block");
  }

  unblockDevice(deviceId: string): void { this.blockedDevices.delete(deviceId); }
  isDeviceBlocked(deviceId: string): boolean { return this.blockedDevices.has(deviceId); }
  isPropagationPaused(deviceId: string): boolean { return this.pausedPropagation.has(deviceId); }
  resumePropagation(deviceId: string): void { this.pausedPropagation.delete(deviceId); }

  // ─── Token / Suspicious Activity ──────────────────

  detectSuspiciousLogin(deviceId: string, userId: string, signals: { newLocation?: boolean; unusualTime?: boolean; rapidDeviceSwitch?: boolean }): ThreatLevel {
    let score = 0;
    if (signals.newLocation) score += 30;
    if (signals.unusualTime) score += 20;
    if (signals.rapidDeviceSwitch) score += 40;
    const level: ThreatLevel = score >= 60 ? "high" : score >= 30 ? "medium" : score > 0 ? "low" : "none";
    if (level !== "none") this.createAlert(deviceId, userId, level, "suspicious-login", `Suspicious login detected (score: ${score})`, level === "high" ? "block" : "allow", signals);
    return level;
  }

  // ─── Alerts ────────────────────────────────────────

  getAlerts(resolved?: boolean, limit = 50): AbuseAlert[] {
    let results = [...this.alerts];
    if (resolved !== undefined) results = results.filter(a => a.resolved === resolved);
    return results.slice(-limit).reverse();
  }

  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) alert.resolved = true;
  }

  getStats() {
    return {
      totalAlerts: this.alerts.length,
      unresolvedAlerts: this.alerts.filter(a => !a.resolved).length,
      blockedDevices: this.blockedDevices.size,
      pausedPropagation: this.pausedPropagation.size,
      activeLimits: this.rateLimits.size,
      bySeverity: { critical: this.alerts.filter(a => a.threatLevel === "critical").length, high: this.alerts.filter(a => a.threatLevel === "high").length, medium: this.alerts.filter(a => a.threatLevel === "medium").length, low: this.alerts.filter(a => a.threatLevel === "low").length },
    };
  }

  private createAlert(deviceId: string, userId: string, threatLevel: ThreatLevel, type: string, description: string, action: AbuseAction, metadata: Record<string, unknown> = {}): void {
    this.alerts.push({ id: `aa_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, deviceId, userId, threatLevel, type, description, action, timestamp: new Date().toISOString(), resolved: false, metadata });
    if (this.alerts.length > 3000) this.alerts = this.alerts.slice(-2500);
  }
}

export const abusePrevention = new AbusePreventionEngine();
