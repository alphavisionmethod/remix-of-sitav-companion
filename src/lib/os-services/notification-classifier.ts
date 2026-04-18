// ═══════════════════════════════════════════════════════════════
// SITA OS — Notification Classifier
// Priority taxonomy and channel classification system
// ═══════════════════════════════════════════════════════════════

export type NotificationPriority = 'critical' | 'urgent' | 'time_sensitive' | 'normal' | 'passive' | 'silent';
export type NotificationChannel = 'security' | 'communication' | 'system' | 'update' | 'battery' | 'app' | 'network' | 'driver';

export interface NotificationSpec {
  id: string;
  title: string;
  body: string;
  priority: NotificationPriority;
  channel: NotificationChannel;
  source: string;
  timestamp: number;
  expiresAt?: number;
  actionable: boolean;
  actions?: { label: string; action: string }[];
  dismissed: boolean;
  suppressible: boolean;
  cooldownMs?: number;
  groupKey?: string;
}

export interface ChannelConfig {
  channel: NotificationChannel;
  enabled: boolean;
  maxPriority: NotificationPriority;
  soundEnabled: boolean;
  bannerEnabled: boolean;
  lockscreenVisible: boolean;
  quietHoursRespected: boolean;
}

export interface FocusSchedule {
  name: string;
  active: boolean;
  allowedChannels: NotificationChannel[];
  allowedPriorities: NotificationPriority[];
  startTime?: string; // HH:mm
  endTime?: string;
}

const PRIORITY_ORDER: Record<NotificationPriority, number> = {
  critical: 0, urgent: 1, time_sensitive: 2, normal: 3, passive: 4, silent: 5,
};

let _nid = 0;

class NotificationClassifier {
  private notifications: NotificationSpec[] = [];
  private channels = new Map<NotificationChannel, ChannelConfig>();
  private cooldowns = new Map<string, number>(); // source -> lastSent
  private focusSchedules: FocusSchedule[] = [];
  private maxNotifications = 200;

  constructor() {
    // Default channel configs
    const defaults: ChannelConfig[] = [
      { channel: 'security', enabled: true, maxPriority: 'critical', soundEnabled: true, bannerEnabled: true, lockscreenVisible: true, quietHoursRespected: false },
      { channel: 'communication', enabled: true, maxPriority: 'normal', soundEnabled: true, bannerEnabled: true, lockscreenVisible: true, quietHoursRespected: true },
      { channel: 'system', enabled: true, maxPriority: 'normal', soundEnabled: false, bannerEnabled: true, lockscreenVisible: false, quietHoursRespected: true },
      { channel: 'update', enabled: true, maxPriority: 'passive', soundEnabled: false, bannerEnabled: true, lockscreenVisible: false, quietHoursRespected: true },
      { channel: 'battery', enabled: true, maxPriority: 'urgent', soundEnabled: true, bannerEnabled: true, lockscreenVisible: true, quietHoursRespected: false },
      { channel: 'app', enabled: true, maxPriority: 'normal', soundEnabled: true, bannerEnabled: true, lockscreenVisible: true, quietHoursRespected: true },
      { channel: 'network', enabled: true, maxPriority: 'normal', soundEnabled: false, bannerEnabled: true, lockscreenVisible: false, quietHoursRespected: true },
      { channel: 'driver', enabled: true, maxPriority: 'passive', soundEnabled: false, bannerEnabled: false, lockscreenVisible: false, quietHoursRespected: true },
    ];
    defaults.forEach(c => this.channels.set(c.channel, c));

    // Default focus schedule
    this.focusSchedules.push({
      name: 'Calm Mode', active: false,
      allowedChannels: ['security', 'battery'],
      allowedPriorities: ['critical', 'urgent'],
    });
  }

  /** Classify and enqueue a notification */
  classify(spec: Omit<NotificationSpec, 'id' | 'timestamp' | 'dismissed'>): NotificationSpec | null {
    const channelConfig = this.channels.get(spec.channel);
    if (!channelConfig?.enabled) return null;

    // Cooldown check
    if (spec.cooldownMs && spec.source) {
      const lastSent = this.cooldowns.get(spec.source) ?? 0;
      if (Date.now() - lastSent < spec.cooldownMs) return null;
    }

    // Focus schedule filtering
    const activeSchedule = this.focusSchedules.find(s => s.active);
    if (activeSchedule) {
      if (!activeSchedule.allowedChannels.includes(spec.channel)) return null;
      if (!activeSchedule.allowedPriorities.includes(spec.priority)) return null;
    }

    const notification: NotificationSpec = {
      ...spec, id: `notif_${++_nid}`, timestamp: Date.now(), dismissed: false,
    };

    this.notifications.push(notification);
    if (this.notifications.length > this.maxNotifications) this.notifications.shift();
    if (spec.source) this.cooldowns.set(spec.source, Date.now());

    return notification;
  }

  dismiss(id: string): void {
    const n = this.notifications.find(n => n.id === id);
    if (n) n.dismissed = true;
  }

  dismissAll(channel?: NotificationChannel): void {
    this.notifications.forEach(n => {
      if (!channel || n.channel === channel) n.dismissed = true;
    });
  }

  getActive(channel?: NotificationChannel): NotificationSpec[] {
    return this.notifications
      .filter(n => !n.dismissed && (!n.expiresAt || n.expiresAt > Date.now()) && (!channel || n.channel === channel))
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  }

  setFocusSchedule(name: string, active: boolean): void {
    const schedule = this.focusSchedules.find(s => s.name === name);
    if (schedule) schedule.active = active;
  }

  getChannelConfig(channel: NotificationChannel): ChannelConfig | undefined {
    return this.channels.get(channel);
  }

  updateChannel(channel: NotificationChannel, updates: Partial<ChannelConfig>): void {
    const existing = this.channels.get(channel);
    if (existing) this.channels.set(channel, { ...existing, ...updates });
  }

  stats() {
    const active = this.getActive();
    const byPriority: Partial<Record<NotificationPriority, number>> = {};
    const byChannel: Partial<Record<NotificationChannel, number>> = {};
    active.forEach(n => {
      byPriority[n.priority] = (byPriority[n.priority] ?? 0) + 1;
      byChannel[n.channel] = (byChannel[n.channel] ?? 0) + 1;
    });
    return { total: this.notifications.length, active: active.length, byPriority, byChannel };
  }
}

export const notificationClassifier = new NotificationClassifier();
