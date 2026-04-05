// ═══════════════════════════════════════════════════════════════
// SITA OS — Booking & Scheduling Service
// Calendar-aware booking, appointment scheduling, conflict resolution
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export type BookingStatus = "proposed" | "confirmed" | "cancelled" | "rescheduled" | "completed" | "no-show";

export type ConflictResolution = "reject" | "suggest-alternative" | "double-book" | "waitlist";

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  conflictsWith?: string[];
}

export interface Booking {
  id: string;
  title: string;
  description?: string;
  participantIds: string[];
  location?: string;
  virtualMeetingUrl?: string;
  start: string;
  end: string;
  timezone: string;
  status: BookingStatus;
  recurrence?: RecurrenceRule;
  reminders: Reminder[];
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
  metadata: Record<string, unknown>;
}

export interface RecurrenceRule {
  frequency: "daily" | "weekly" | "biweekly" | "monthly";
  interval: number;
  endDate?: string;
  count?: number;
  daysOfWeek?: number[];
}

export interface Reminder {
  type: "email" | "push" | "sms";
  minutesBefore: number;
  sent: boolean;
}

export interface AvailabilityWindow {
  userId: string;
  dayOfWeek: number;
  start: string;
  end: string;
  timezone: string;
}

export class BookingSchedulingService {
  private bookings: Map<string, Booking> = new Map();
  private availability: Map<string, AvailabilityWindow[]> = new Map();

  createBooking(booking: Omit<Booking, "id" | "createdAt" | "updatedAt" | "status">): { booking: Booking; conflicts: string[] } {
    const conflicts = this.findConflicts(booking.participantIds, booking.start, booking.end);

    const full: Booking = {
      ...booking,
      id: crypto.randomUUID(),
      status: conflicts.length > 0 ? "proposed" : "confirmed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.bookings.set(full.id, full);
    return { booking: full, conflicts };
  }

  confirmBooking(id: string): Booking | null {
    const b = this.bookings.get(id);
    if (!b) return null;
    b.status = "confirmed";
    b.updatedAt = new Date().toISOString();
    return b;
  }

  cancelBooking(id: string, reason?: string): Booking | null {
    const b = this.bookings.get(id);
    if (!b) return null;
    b.status = "cancelled";
    b.cancelledAt = new Date().toISOString();
    b.cancellationReason = reason;
    b.updatedAt = new Date().toISOString();
    return b;
  }

  reschedule(id: string, newStart: string, newEnd: string): { booking: Booking | null; conflicts: string[] } {
    const b = this.bookings.get(id);
    if (!b) return { booking: null, conflicts: [] };

    const conflicts = this.findConflicts(b.participantIds, newStart, newEnd, id);
    b.start = newStart;
    b.end = newEnd;
    b.status = "rescheduled";
    b.updatedAt = new Date().toISOString();

    return { booking: b, conflicts };
  }

  findAvailableSlots(participantIds: string[], date: string, durationMinutes: number): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const dayStart = new Date(date);
    dayStart.setHours(8, 0, 0, 0);

    for (let hour = 8; hour <= 18; hour++) {
      for (const minute of [0, 30]) {
        const start = new Date(dayStart);
        start.setHours(hour, minute);
        const end = new Date(start.getTime() + durationMinutes * 60000);

        if (end.getHours() > 18) continue;

        const conflicts = this.findConflicts(participantIds, start.toISOString(), end.toISOString());
        slots.push({
          start: start.toISOString(),
          end: end.toISOString(),
          available: conflicts.length === 0,
          conflictsWith: conflicts.length > 0 ? conflicts : undefined,
        });
      }
    }

    return slots;
  }

  setAvailability(userId: string, windows: AvailabilityWindow[]): void {
    this.availability.set(userId, windows);
  }

  getBookingsForUser(userId: string, options?: { from?: string; to?: string }): Booking[] {
    return Array.from(this.bookings.values())
      .filter(b => b.participantIds.includes(userId) && b.status !== "cancelled")
      .filter(b => !options?.from || b.start >= options.from)
      .filter(b => !options?.to || b.end <= options.to)
      .sort((a, b) => a.start.localeCompare(b.start));
  }

  getUpcoming(userId: string, limit: number = 10): Booking[] {
    const now = new Date().toISOString();
    return this.getBookingsForUser(userId, { from: now }).slice(0, limit);
  }

  private findConflicts(participantIds: string[], start: string, end: string, excludeId?: string): string[] {
    const conflicts: string[] = [];
    this.bookings.forEach(b => {
      if (b.id === excludeId || b.status === "cancelled") return;
      if (b.participantIds.some(p => participantIds.includes(p))) {
        if (start < b.end && end > b.start) {
          conflicts.push(b.id);
        }
      }
    });
    return conflicts;
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("booking-scheduling", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      bookings: Array.from(this.bookings.entries()),
      availability: Array.from(this.availability.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.bookings) this.bookings = new Map(state.bookings as any);
    if (state.availability) this.availability = new Map(state.availability as any);
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("booking-scheduling");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export function createBookingScheduling(): BookingSchedulingService {
  return new BookingSchedulingService();
}
