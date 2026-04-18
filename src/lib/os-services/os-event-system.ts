// ═══════════════════════════════════════════════════════════════
// SITA OS — Typed OS Event System
// Strongly-typed pub/sub with deduplication, replay, correlation
// ═══════════════════════════════════════════════════════════════

export type OSEventCategory =
  | 'network' | 'security' | 'power' | 'storage'
  | 'driver' | 'app' | 'session' | 'update'
  | 'audio' | 'display' | 'system' | 'policy';

export interface OSEvent {
  id: string;
  topic: string;
  category: OSEventCategory;
  payload: Record<string, unknown>;
  source: string;
  correlationId?: string;
  timestamp: number;
  deduplicationKey?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export type OSEventHandler = (event: OSEvent) => void;

interface Subscription {
  id: string;
  topic: string;
  handler: OSEventHandler;
  filter?: (event: OSEvent) => boolean;
}

let _eid = 0;
function nextEventId(): string { return `ose_${Date.now()}_${++_eid}`; }

class OSEventSystem {
  private subscriptions: Subscription[] = [];
  private recentEvents: OSEvent[] = [];
  private dedupWindow = new Set<string>();
  private maxHistory = 500;

  /** Emit a typed OS event */
  emit(topic: string, category: OSEventCategory, payload: Record<string, unknown>, opts?: Partial<OSEvent>): OSEvent {
    const event: OSEvent = {
      id: nextEventId(), topic, category, payload,
      source: opts?.source ?? 'system', timestamp: Date.now(),
      severity: opts?.severity ?? 'info',
      correlationId: opts?.correlationId,
      deduplicationKey: opts?.deduplicationKey,
    };

    // Deduplication
    if (event.deduplicationKey) {
      if (this.dedupWindow.has(event.deduplicationKey)) return event;
      this.dedupWindow.add(event.deduplicationKey);
      setTimeout(() => this.dedupWindow.delete(event.deduplicationKey!), 3000);
    }

    // Store
    this.recentEvents.push(event);
    if (this.recentEvents.length > this.maxHistory) this.recentEvents.shift();

    // Dispatch
    this.subscriptions.forEach(sub => {
      if (sub.topic === topic || sub.topic === '*' || sub.topic === `${category}.*`) {
        if (!sub.filter || sub.filter(event)) {
          try { sub.handler(event); } catch {}
        }
      }
    });

    return event;
  }

  /** Subscribe to events */
  on(topic: string, handler: OSEventHandler, filter?: (event: OSEvent) => boolean): () => void {
    const sub: Subscription = { id: nextEventId(), topic, handler, filter };
    this.subscriptions.push(sub);
    return () => { this.subscriptions = this.subscriptions.filter(s => s.id !== sub.id); };
  }

  /** Replay recent events for a topic */
  replay(topic: string, limit = 50): OSEvent[] {
    return this.recentEvents.filter(e => e.topic === topic || topic === '*').slice(-limit);
  }

  /** Get recent events by category */
  byCategory(category: OSEventCategory, limit = 50): OSEvent[] {
    return this.recentEvents.filter(e => e.category === category).slice(-limit);
  }

  /** Get events by correlation ID */
  byCorrelation(correlationId: string): OSEvent[] {
    return this.recentEvents.filter(e => e.correlationId === correlationId);
  }

  /** Stats */
  stats() {
    const byCat: Partial<Record<OSEventCategory, number>> = {};
    this.recentEvents.forEach(e => { byCat[e.category] = (byCat[e.category] ?? 0) + 1; });
    return { totalEvents: this.recentEvents.length, subscriptions: this.subscriptions.length, byCategory: byCat };
  }
}

export const osEvents = new OSEventSystem();

// ── Pre-defined Event Topics ────────────────────────────────
export const OS_TOPICS = {
  // Network
  WIFI_CONNECTED: 'network.wifi.connected',
  WIFI_DISCONNECTED: 'network.wifi.disconnected',
  PORTAL_DETECTED: 'network.portal.detected',
  VPN_CONNECTED: 'network.vpn.connected',
  BLUETOOTH_PAIRED: 'network.bluetooth.paired',

  // Security
  THREAT_DETECTED: 'security.threat.detected',
  THREAT_QUARANTINED: 'security.threat.quarantined',
  AUTH_SUCCESS: 'security.auth.success',
  AUTH_FAILURE: 'security.auth.failure',
  POLICY_VIOLATION: 'security.policy.violation',

  // Power
  BATTERY_LOW: 'power.battery.low',
  BATTERY_CRITICAL: 'power.battery.critical',
  PROFILE_CHANGED: 'power.profile.changed',
  SUSPEND_STARTED: 'power.suspend.started',
  RESUME_COMPLETED: 'power.resume.completed',

  // System
  UPDATE_AVAILABLE: 'system.update.available',
  UPDATE_INSTALLING: 'system.update.installing',
  UPDATE_COMPLETE: 'system.update.complete',
  BOOT_COMPLETE: 'system.boot.complete',
  SERVICE_CRASHED: 'system.service.crashed',
  SERVICE_RECOVERED: 'system.service.recovered',

  // Apps
  APP_INSTALLED: 'app.installed',
  APP_LAUNCHED: 'app.launched',
  APP_CRASHED: 'app.crashed',
  APP_QUARANTINED: 'app.quarantined',
  PERMISSION_GRANTED: 'app.permission.granted',
  PERMISSION_REVOKED: 'app.permission.revoked',

  // Session
  SESSION_LOCKED: 'session.locked',
  SESSION_UNLOCKED: 'session.unlocked',
  USER_SWITCHED: 'session.user.switched',

  // Driver
  DEVICE_ADDED: 'driver.device.added',
  DEVICE_REMOVED: 'driver.device.removed',
  DRIVER_LOADED: 'driver.loaded',
  DRIVER_FAILED: 'driver.failed',
} as const;
