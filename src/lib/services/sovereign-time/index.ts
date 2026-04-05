// ═══════════════════════════════════════════════════════════════
// SITA OS — Sovereign Time Service
// Timezone-aware scheduling, business hours, SLA calculations
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export interface BusinessHours {
  day: DayOfWeek;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  isWorkDay: boolean;
}

export interface TimeZoneProfile {
  userId: string;
  primaryTimezone: string;
  businessHours: BusinessHours[];
  holidays: string[];
  preferredSchedulingWindow: { startHour: number; endHour: number };
}

export interface SLADeadline {
  id: string;
  entityId: string;
  description: string;
  deadlineUtc: string;
  businessHoursOnly: boolean;
  remainingMs: number;
  isBreached: boolean;
  warningThresholdMs: number;
  isWarning: boolean;
}

export interface ScheduleSlot {
  startUtc: string;
  endUtc: string;
  durationMinutes: number;
  isBusinessHours: boolean;
  conflictsWith: string[];
}

const DEFAULT_BUSINESS_HOURS: BusinessHours[] = [
  { day: "monday", startHour: 9, startMinute: 0, endHour: 17, endMinute: 0, isWorkDay: true },
  { day: "tuesday", startHour: 9, startMinute: 0, endHour: 17, endMinute: 0, isWorkDay: true },
  { day: "wednesday", startHour: 9, startMinute: 0, endHour: 17, endMinute: 0, isWorkDay: true },
  { day: "thursday", startHour: 9, startMinute: 0, endHour: 17, endMinute: 0, isWorkDay: true },
  { day: "friday", startHour: 9, startMinute: 0, endHour: 17, endMinute: 0, isWorkDay: true },
  { day: "saturday", startHour: 0, startMinute: 0, endHour: 0, endMinute: 0, isWorkDay: false },
  { day: "sunday", startHour: 0, startMinute: 0, endHour: 0, endMinute: 0, isWorkDay: false },
];

const DAY_INDEX: Record<DayOfWeek, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
};

export class SovereignTimeService {
  private profiles = new Map<string, TimeZoneProfile>();
  private deadlines = new Map<string, SLADeadline>();

  setProfile(profile: TimeZoneProfile): void {
    this.profiles.set(profile.userId, profile);
  }

  getProfile(userId: string): TimeZoneProfile {
    return this.profiles.get(userId) ?? {
      userId,
      primaryTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      businessHours: DEFAULT_BUSINESS_HOURS,
      holidays: [],
      preferredSchedulingWindow: { startHour: 9, endHour: 17 },
    };
  }

  isBusinessHour(userId: string, date: Date = new Date()): boolean {
    const profile = this.getProfile(userId);
    const dayNames: DayOfWeek[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dayName = dayNames[date.getDay()];
    const hours = profile.businessHours.find(h => h.day === dayName);
    if (!hours || !hours.isWorkDay) return false;

    const currentMinutes = date.getHours() * 60 + date.getMinutes();
    const startMinutes = hours.startHour * 60 + hours.startMinute;
    const endMinutes = hours.endHour * 60 + hours.endMinute;
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }

  isHoliday(userId: string, date: Date = new Date()): boolean {
    const profile = this.getProfile(userId);
    const dateStr = date.toISOString().split("T")[0];
    return profile.holidays.includes(dateStr);
  }

  registerDeadline(deadline: Omit<SLADeadline, "remainingMs" | "isBreached" | "isWarning">): SLADeadline {
    const now = Date.now();
    const deadlineMs = new Date(deadline.deadlineUtc).getTime();
    const remainingMs = Math.max(0, deadlineMs - now);

    const sla: SLADeadline = {
      ...deadline,
      remainingMs,
      isBreached: remainingMs <= 0,
      isWarning: remainingMs > 0 && remainingMs <= deadline.warningThresholdMs,
    };
    this.deadlines.set(sla.id, sla);
    return sla;
  }

  evaluateDeadlines(): SLADeadline[] {
    const now = Date.now();
    for (const sla of this.deadlines.values()) {
      const deadlineMs = new Date(sla.deadlineUtc).getTime();
      sla.remainingMs = Math.max(0, deadlineMs - now);
      sla.isBreached = sla.remainingMs <= 0;
      sla.isWarning = sla.remainingMs > 0 && sla.remainingMs <= sla.warningThresholdMs;
    }
    return Array.from(this.deadlines.values());
  }

  getBreachedDeadlines(): SLADeadline[] {
    return this.evaluateDeadlines().filter(d => d.isBreached);
  }

  getWarningDeadlines(): SLADeadline[] {
    return this.evaluateDeadlines().filter(d => d.isWarning && !d.isBreached);
  }

  findNextAvailableSlot(userId: string, durationMinutes: number, afterDate: Date = new Date()): ScheduleSlot {
    const profile = this.getProfile(userId);
    const candidate = new Date(afterDate);
    candidate.setMinutes(candidate.getMinutes() + 15 - (candidate.getMinutes() % 15));

    for (let attempt = 0; attempt < 96; attempt++) {
      if (this.isBusinessHour(userId, candidate) && !this.isHoliday(userId, candidate)) {
        const endDate = new Date(candidate.getTime() + durationMinutes * 60_000);
        return {
          startUtc: candidate.toISOString(),
          endUtc: endDate.toISOString(),
          durationMinutes,
          isBusinessHours: true,
          conflictsWith: [],
        };
      }
      candidate.setMinutes(candidate.getMinutes() + 15);
    }

    const fallback = new Date(afterDate.getTime() + 24 * 60 * 60_000);
    fallback.setHours(profile.preferredSchedulingWindow.startHour, 0, 0, 0);
    return {
      startUtc: fallback.toISOString(),
      endUtc: new Date(fallback.getTime() + durationMinutes * 60_000).toISOString(),
      durationMinutes,
      isBusinessHours: true,
      conflictsWith: [],
    };
  }

  calculateBusinessHoursDuration(startUtc: string, endUtc: string, userId: string): number {
    const start = new Date(startUtc).getTime();
    const end = new Date(endUtc).getTime();
    let businessMs = 0;
    const stepMs = 15 * 60_000;

    for (let t = start; t < end; t += stepMs) {
      const d = new Date(t);
      if (this.isBusinessHour(userId, d) && !this.isHoliday(userId, d)) {
        businessMs += Math.min(stepMs, end - t);
      }
    }
    return Math.round(businessMs / 60_000);
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("sovereign-time", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      profiles: Array.from(this.profiles.entries()),
      deadlines: Array.from(this.deadlines.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.profiles) this.profiles = new Map(state.profiles as any);
    if (state.deadlines) this.deadlines = new Map(state.deadlines as any);
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("sovereign-time");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export function createSovereignTime(): SovereignTimeService {
  return new SovereignTimeService();
}
