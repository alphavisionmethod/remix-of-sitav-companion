// ═══════════════════════════════════════════════════════════════
// SITA OS — Push Notification & Wake Strategy
// APNs/FCM hooks, wake-for-sync, silent push, power-aware
// ═══════════════════════════════════════════════════════════════

// ─── Types ────────────────────────────────────────────────────

export type PushProvider = "apns" | "fcm" | "vapid" | "fallback-poll";

export type WakeReason =
  | "new-sync-data"
  | "conflict-needs-resolution"
  | "share-invite"
  | "device-revoked"
  | "security-alert"
  | "quota-warning"
  | "handoff-available"
  | "scheduled-sync";

export interface PushRegistration {
  deviceId: string;
  provider: PushProvider;
  token: string;
  registeredAt: string;
  lastPushedAt?: string;
  failCount: number;
  active: boolean;
  capabilities: {
    silentPush: boolean;
    richNotification: boolean;
    backgroundRefresh: boolean;
    criticalAlerts: boolean;
  };
}

export interface WakeRequest {
  id: string;
  targetDeviceId: string;
  reason: WakeReason;
  priority: "critical" | "high" | "normal" | "low";
  payload: Record<string, unknown>;
  createdAt: string;
  deliveredAt?: string;
  status: "pending" | "sent" | "delivered" | "failed" | "throttled" | "suppressed";
  provider?: PushProvider;
  retryCount: number;
}

export interface ThrottleConfig {
  maxPushesPerHour: number;
  maxPushesPerDay: number;
  silentPushLimit: number;
  minIntervalMs: number;
  respectBatterySaver: boolean;
  respectDoNotDisturb: boolean;
  criticalBypassThrottle: boolean;
}

export interface FallbackPollConfig {
  intervalMs: number;
  maxIntervalMs: number;
  backoffMultiplier: number;
  adaptToActivity: boolean;
}

export interface PushStats {
  totalRegistrations: number;
  activeRegistrations: number;
  totalPushesSent: number;
  totalPushesDelivered: number;
  totalPushesFailed: number;
  totalThrottled: number;
  pushesLastHour: number;
  pushesToday: number;
  byProvider: Record<string, number>;
}

// ─── Push/Wake Engine ─────────────────────────────────────────

class PushWakeEngine {
  private registrations = new Map<string, PushRegistration>();
  private wakeRequests: WakeRequest[] = [];
  private throttleConfig: ThrottleConfig = {
    maxPushesPerHour: 30,
    maxPushesPerDay: 200,
    silentPushLimit: 6, // iOS limit
    minIntervalMs: 5000,
    respectBatterySaver: true,
    respectDoNotDisturb: true,
    criticalBypassThrottle: true,
  };
  private pollConfig: FallbackPollConfig = {
    intervalMs: 30000,
    maxIntervalMs: 300000,
    backoffMultiplier: 1.5,
    adaptToActivity: true,
  };
  private pushCounters = new Map<string, { hourly: number; daily: number; lastPushAt: number; silentCount: number }>();

  // ─── Registration ──────────────────────────────────

  registerDevice(deviceId: string, provider: PushProvider, token: string, capabilities?: Partial<PushRegistration["capabilities"]>): PushRegistration {
    const reg: PushRegistration = {
      deviceId,
      provider,
      token,
      registeredAt: new Date().toISOString(),
      failCount: 0,
      active: true,
      capabilities: {
        silentPush: capabilities?.silentPush ?? true,
        richNotification: capabilities?.richNotification ?? true,
        backgroundRefresh: capabilities?.backgroundRefresh ?? true,
        criticalAlerts: capabilities?.criticalAlerts ?? false,
      },
    };
    this.registrations.set(deviceId, reg);
    return reg;
  }

  unregisterDevice(deviceId: string): void {
    this.registrations.delete(deviceId);
    this.pushCounters.delete(deviceId);
  }

  getRegistration(deviceId: string): PushRegistration | null {
    return this.registrations.get(deviceId) ?? null;
  }

  // ─── Wake Requests ─────────────────────────────────

  requestWake(targetDeviceId: string, reason: WakeReason, payload: Record<string, unknown> = {}, priority: WakeRequest["priority"] = "normal"): WakeRequest {
    const request: WakeRequest = {
      id: `wr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      targetDeviceId,
      reason,
      priority,
      payload,
      createdAt: new Date().toISOString(),
      status: "pending",
      retryCount: 0,
    };

    // Check throttle
    if (!this.canPush(targetDeviceId, priority)) {
      request.status = "throttled";
      this.wakeRequests.push(request);
      return request;
    }

    // Check registration
    const reg = this.registrations.get(targetDeviceId);
    if (!reg || !reg.active) {
      request.status = "failed";
      this.wakeRequests.push(request);
      return request;
    }

    // Send
    request.provider = reg.provider;
    request.status = this.simulatePush(reg, reason, payload) ? "sent" : "failed";
    if (request.status === "sent") {
      this.recordPush(targetDeviceId);
      reg.lastPushedAt = new Date().toISOString();
    } else {
      reg.failCount++;
      if (reg.failCount >= 5) reg.active = false;
    }

    this.wakeRequests.push(request);
    if (this.wakeRequests.length > 5000) this.wakeRequests = this.wakeRequests.slice(-4000);
    return request;
  }

  // ─── Batch Wake ────────────────────────────────────

  wakeAllDevices(userId: string, reason: WakeReason, excludeDeviceId?: string): WakeRequest[] {
    const results: WakeRequest[] = [];
    for (const [deviceId, reg] of this.registrations) {
      if (reg.active && deviceId !== excludeDeviceId) {
        results.push(this.requestWake(deviceId, reason));
      }
    }
    return results;
  }

  // ─── Fallback Polling ──────────────────────────────

  getPollInterval(deviceId: string, isActive: boolean): number {
    if (isActive && this.pollConfig.adaptToActivity) {
      return this.pollConfig.intervalMs;
    }
    // Backoff for inactive devices
    const reg = this.registrations.get(deviceId);
    if (reg?.active && reg.capabilities.backgroundRefresh) {
      return this.pollConfig.intervalMs;
    }
    return Math.min(this.pollConfig.intervalMs * this.pollConfig.backoffMultiplier, this.pollConfig.maxIntervalMs);
  }

  shouldUsePoll(deviceId: string): boolean {
    const reg = this.registrations.get(deviceId);
    return !reg || !reg.active || reg.provider === "fallback-poll";
  }

  // ─── Configuration ─────────────────────────────────

  setThrottleConfig(config: Partial<ThrottleConfig>): void {
    this.throttleConfig = { ...this.throttleConfig, ...config };
  }

  getThrottleConfig(): ThrottleConfig {
    return { ...this.throttleConfig };
  }

  setPollConfig(config: Partial<FallbackPollConfig>): void {
    this.pollConfig = { ...this.pollConfig, ...config };
  }

  // ─── Stats ─────────────────────────────────────────

  getStats(): PushStats {
    const byProvider: Record<string, number> = {};
    let totalSent = 0, totalDelivered = 0, totalFailed = 0, totalThrottled = 0;
    const hourAgo = Date.now() - 3600000;
    const dayStart = new Date().toISOString().split("T")[0];
    let lastHour = 0, today = 0;

    for (const req of this.wakeRequests) {
      if (req.provider) byProvider[req.provider] = (byProvider[req.provider] ?? 0) + 1;
      if (req.status === "sent" || req.status === "delivered") totalSent++;
      if (req.status === "delivered") totalDelivered++;
      if (req.status === "failed") totalFailed++;
      if (req.status === "throttled") totalThrottled++;
      if (new Date(req.createdAt).getTime() > hourAgo) lastHour++;
      if (req.createdAt.startsWith(dayStart)) today++;
    }

    return {
      totalRegistrations: this.registrations.size,
      activeRegistrations: Array.from(this.registrations.values()).filter(r => r.active).length,
      totalPushesSent: totalSent,
      totalPushesDelivered: totalDelivered,
      totalPushesFailed: totalFailed,
      totalThrottled,
      pushesLastHour: lastHour,
      pushesToday: today,
      byProvider,
    };
  }

  getRecentWakeRequests(limit = 20): WakeRequest[] {
    return this.wakeRequests.slice(-limit).reverse();
  }

  // ─── Internal ──────────────────────────────────────

  private canPush(deviceId: string, priority: string): boolean {
    if (priority === "critical" && this.throttleConfig.criticalBypassThrottle) return true;

    const counter = this.pushCounters.get(deviceId);
    if (!counter) return true;

    if (counter.hourly >= this.throttleConfig.maxPushesPerHour) return false;
    if (counter.daily >= this.throttleConfig.maxPushesPerDay) return false;
    if (Date.now() - counter.lastPushAt < this.throttleConfig.minIntervalMs) return false;
    return true;
  }

  private recordPush(deviceId: string): void {
    const counter = this.pushCounters.get(deviceId) ?? { hourly: 0, daily: 0, lastPushAt: 0, silentCount: 0 };
    counter.hourly++;
    counter.daily++;
    counter.lastPushAt = Date.now();
    this.pushCounters.set(deviceId, counter);
  }

  private simulatePush(reg: PushRegistration, reason: WakeReason, _payload: Record<string, unknown>): boolean {
    // In production: call APNs/FCM/VAPID APIs
    // Here: simulate success based on provider availability
    if (reg.provider === "apns" || reg.provider === "fcm" || reg.provider === "vapid") {
      return Math.random() > 0.05; // 95% success rate simulation
    }
    return false;
  }
}

export const pushWakeEngine = new PushWakeEngine();
