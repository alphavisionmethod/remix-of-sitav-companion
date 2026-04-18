// ═══════════════════════════════════════════════════════════════
// SITA OS — timed: Time & Clock Subsystem Daemon
// ═══════════════════════════════════════════════════════════════

export interface TimeSyncStatus {
  synced: boolean;
  source: 'NTP' | 'RTC' | 'manual' | 'GPS';
  lastSyncAt: number;
  driftMs: number;
  server: string;
  stratum: number;
  roundTripMs: number;
}

export interface Alarm {
  id: string;
  label: string;
  triggerAt: number;
  recurring: boolean;
  intervalMs?: number;
  callback?: string;
  fired: boolean;
}

export interface TimezoneInfo {
  id: string;
  name: string;
  offsetMinutes: number;
  hasDST: boolean;
  currentlyDST: boolean;
}

const TIMEZONES: TimezoneInfo[] = [
  { id: 'America/New_York', name: 'Eastern Time', offsetMinutes: -300, hasDST: true, currentlyDST: true },
  { id: 'America/Chicago', name: 'Central Time', offsetMinutes: -360, hasDST: true, currentlyDST: true },
  { id: 'America/Denver', name: 'Mountain Time', offsetMinutes: -420, hasDST: true, currentlyDST: true },
  { id: 'America/Los_Angeles', name: 'Pacific Time', offsetMinutes: -480, hasDST: true, currentlyDST: true },
  { id: 'Europe/London', name: 'Greenwich Mean Time', offsetMinutes: 0, hasDST: true, currentlyDST: true },
  { id: 'Europe/Berlin', name: 'Central European Time', offsetMinutes: 60, hasDST: true, currentlyDST: true },
  { id: 'Asia/Tokyo', name: 'Japan Standard Time', offsetMinutes: 540, hasDST: false, currentlyDST: false },
  { id: 'Asia/Dubai', name: 'Gulf Standard Time', offsetMinutes: 240, hasDST: false, currentlyDST: false },
  { id: 'Australia/Sydney', name: 'Australian Eastern Time', offsetMinutes: 600, hasDST: true, currentlyDST: false },
  { id: 'Pacific/Auckland', name: 'New Zealand Standard Time', offsetMinutes: 720, hasDST: true, currentlyDST: false },
];

class TimeDaemon {
  private timezone: TimezoneInfo = TIMEZONES[0];
  private syncStatus: TimeSyncStatus = { synced: true, source: 'NTP', lastSyncAt: Date.now() - 120000, driftMs: 0.42, server: 'time.sita.os', stratum: 2, roundTripMs: 12 };
  private alarms: Alarm[] = [];
  private bootMonotonicMs = Date.now();
  private use24h = false;

  getTime(): number { return Date.now(); }
  getMonotonicMs(): number { return Date.now() - this.bootMonotonicMs; }
  getTimezone(): TimezoneInfo { return this.timezone; }
  getTimezones(): TimezoneInfo[] { return TIMEZONES; }
  getSyncStatus(): TimeSyncStatus { return this.syncStatus; }
  getUse24h(): boolean { return this.use24h; }
  setUse24h(v: boolean): void { this.use24h = v; }

  setTimezone(id: string): boolean {
    const tz = TIMEZONES.find(t => t.id === id);
    if (!tz) return false;
    this.timezone = tz;
    return true;
  }

  triggerSync(): TimeSyncStatus {
    this.syncStatus = { ...this.syncStatus, synced: true, lastSyncAt: Date.now(), driftMs: Math.random() * 2, roundTripMs: 8 + Math.random() * 20 };
    return this.syncStatus;
  }

  createAlarm(label: string, triggerAt: number, recurring = false, intervalMs?: number): Alarm {
    const alarm: Alarm = { id: `alarm-${Date.now().toString(36)}`, label, triggerAt, recurring, intervalMs, fired: false };
    this.alarms.push(alarm);
    return alarm;
  }

  getAlarms(): Alarm[] { return [...this.alarms]; }
  cancelAlarm(id: string): boolean { const i = this.alarms.findIndex(a => a.id === id); if (i >= 0) { this.alarms.splice(i, 1); return true; } return false; }
}

export const timed = new TimeDaemon();
