// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Scheduling: Domain Types & Mappers
// Reuses canonical Booking / NoShowRisk contracts from the
// canonical Business OS domain barrel (@/domains/business).
// No duplicate appointment type.
// ═══════════════════════════════════════════════════════════════

import type { Booking, BookingStatus } from "@/domains/business";

export type { Booking, BookingStatus };

/** UI-level confirmation status (richer than persistence-level BookingStatus). */
export type ConfirmationStatus =
  | "confirmed"
  | "pending"
  | "unconfirmed"
  | "cancelled"
  | "no-show";

export type NoShowRiskLevel = "low" | "medium" | "high";

/**
 * View-model consumed by AppointmentsScheduling page.
 * Derived from a `bookings` row + its `metadata` jsonb.
 */
export interface ScheduledAppointmentVM {
  id: string;
  customer: string;
  customerId?: string;
  /** Phase 6 lineage — stable links back to CRM/Opportunity. */
  crmContactId?: string;
  crmCompanyId?: string;
  opportunityId?: string;
  service: string;
  /** Human-readable bucket: "Today" | "Tomorrow" | weekday name | absolute date */
  date: string;
  /** ISO timestamp — source of truth for sorting/filtering */
  startsAt: string;
  /** Display time, e.g. "2:00 PM" */
  time: string;
  /** Display duration, e.g. "60 min" */
  duration: string;
  durationMinutes: number;
  location: string;
  status: ConfirmationStatus;
  staff: string;
  noShowRisk: NoShowRiskLevel;
  notes?: string;
  lastContact?: string;
  isFollowUp?: boolean;
  /** Free-form metadata bag preserved for advanced consumers */
  metadata?: Record<string, unknown>;
}

// ── Status mapping ─────────────────────────────────────────────

/**
 * Map persistence-level `bookings.status` into the richer UI status.
 * - `scheduled` + recent confirmation → `confirmed`
 * - `scheduled` without confirmation → `pending` (≤24h to start) or `unconfirmed` (>24h to start)
 */
export function mapBookingStatusToConfirmation(
  raw: string | null | undefined,
  meta: Record<string, unknown> | undefined,
  startsAt: string
): ConfirmationStatus {
  const s = (raw ?? "scheduled").toLowerCase();
  if (s === "no-show" || s === "noshow") return "no-show";
  if (s === "cancelled" || s === "canceled") return "cancelled";
  if (s === "completed" || s === "confirmed") return "confirmed";

  // s === "scheduled" or unknown → derive from confirmation metadata
  const confirmedAt = meta?.confirmedAt as string | undefined;
  if (confirmedAt) return "confirmed";

  const lastReminderAt = meta?.lastReminderAt as string | undefined;
  const hoursToStart =
    (new Date(startsAt).getTime() - Date.now()) / (1000 * 60 * 60);
  if (lastReminderAt && hoursToStart <= 24) return "pending";
  return "unconfirmed";
}

// ── No-show risk (deterministic, pure) ─────────────────────────

/**
 * Compute a no-show risk level from booking metadata.
 * Inputs (all optional, all read from `bookings.metadata`):
 *   priorReschedules: number
 *   priorNoShows:     number
 *   lastReminderAt:   ISO string
 *   confirmedAt:      ISO string
 */
export function computeNoShowRisk(input: {
  startsAt: string;
  metadata?: Record<string, unknown>;
  status: ConfirmationStatus;
}): NoShowRiskLevel {
  if (input.status === "confirmed" || input.status === "completed" as ConfirmationStatus) return "low";
  if (input.status === "no-show") return "high";

  const meta = input.metadata ?? {};
  const priorReschedules = Number(meta.priorReschedules ?? 0);
  const priorNoShows = Number(meta.priorNoShows ?? 0);
  const confirmedAt = meta.confirmedAt as string | undefined;
  const lastReminderAt = meta.lastReminderAt as string | undefined;

  let score = 0;
  if (priorNoShows >= 2) score += 3;
  else if (priorNoShows === 1) score += 2;

  if (priorReschedules >= 2) score += 2;
  else if (priorReschedules === 1) score += 1;

  const hoursToStart =
    (new Date(input.startsAt).getTime() - Date.now()) / (1000 * 60 * 60);

  if (!confirmedAt && hoursToStart <= 24 && hoursToStart >= 0) {
    if (!lastReminderAt) score += 2;
    else {
      const hoursSinceReminder =
        (Date.now() - new Date(lastReminderAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceReminder > 24) score += 1;
    }
  }

  if (score >= 3) return "high";
  if (score >= 1) return "medium";
  return "low";
}

// ── Date bucket helpers ────────────────────────────────────────

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Human-friendly date bucket for UI grouping. */
export function formatDateBucket(iso: string, now: Date = new Date()): string {
  const target = startOfDay(new Date(iso));
  const today = startOfDay(now);
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 1 && diffDays <= 6) {
    return target.toLocaleDateString(undefined, { weekday: "short" });
  }
  if (diffDays < -1 && diffDays >= -6) {
    return `${Math.abs(diffDays)} days ago`;
  }
  return target.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(min: number): string {
  return `${min} min`;
}

// ── Row → VM mapper ────────────────────────────────────────────

/**
 * Phase 6: scheduling now reads/writes the canonical `appointments`
 * table (lineage-equipped) instead of `bookings`. The legacy
 * `BookingRow` type is preserved as an alias so existing imports
 * compile, but the service maps from `AppointmentRow` going forward.
 */
export interface AppointmentRow {
  id: string;
  user_id: string;
  title: string;
  provider: string | null;
  appointment_date: string | null;
  status: string | null;
  prep_items: string[] | null;
  docs_needed: string[] | null;
  transport_time: string | null;
  category: string | null;
  owner: string | null;
  location: string | null;
  who: string | null;
  notes: string | null;
  customer_id: string | null;
  crm_contact_id: string | null;
  crm_company_id: string | null;
  opportunity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** @deprecated Use AppointmentRow. Retained for legacy import paths. */
export type BookingRow = AppointmentRow;

/**
 * Map an `appointments` row + an optional `metadata` bag (read from
 * `notes` / linked entities) to the page view-model. Keeps the
 * existing UI contract intact so the page does not have to change.
 */
export function appointmentRowToVM(
  row: AppointmentRow,
  metaOverride: Record<string, unknown> | null = null,
  now: Date = new Date(),
): ScheduledAppointmentVM {
  const meta: Record<string, unknown> = metaOverride ?? row.metadata ?? {};
  const startsAt = row.appointment_date ?? new Date().toISOString();
  const durationMinutes = Number(meta.durationMinutes ?? 30);

  const status = mapBookingStatusToConfirmation(row.status, meta, startsAt);
  const noShowRisk = computeNoShowRisk({ startsAt, metadata: meta, status });

  const lastReminderAt = meta.lastReminderAt as string | undefined;
  const confirmedAt = meta.confirmedAt as string | undefined;
  let lastContact: string | undefined;
  if (confirmedAt) {
    lastContact = `Confirmed ${formatDateBucket(confirmedAt, now)}`;
  } else if (lastReminderAt) {
    lastContact = `Reminded ${formatDateBucket(lastReminderAt, now)}`;
  }

  const customerLabel: string =
    (typeof meta.customerName === "string" && meta.customerName) ||
    row.who ||
    (row.customer_id ? row.customer_id.slice(0, 8) : "Unknown customer");

  return {
    id: row.id,
    customer: customerLabel,
    customerId: row.customer_id ?? undefined,
    crmContactId: row.crm_contact_id ?? undefined,
    crmCompanyId: row.crm_company_id ?? undefined,
    opportunityId: row.opportunity_id ?? undefined,
    service: row.title,
    date: formatDateBucket(startsAt, now),
    startsAt,
    time: formatTime(startsAt),
    duration: formatDuration(durationMinutes),
    durationMinutes,
    location: row.location ?? "—",
    status,
    staff: (meta.staff as string | undefined) ?? row.owner ?? "You",
    noShowRisk,
    notes: row.notes ?? (meta.notes as string | undefined) ?? undefined,
    lastContact,
    isFollowUp: Boolean(meta.isFollowUp),
    metadata: meta,
  };
}

/** @deprecated Use appointmentRowToVM. Retained for legacy callers. */
export const bookingRowToVM = appointmentRowToVM;