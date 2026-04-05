// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge Domain Contracts (Barrel)
// ═══════════════════════════════════════════════════════════════

// ── Reminder ─────────────────────────────────────────────────

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueAt: string;
  recurring: boolean;
  frequency?: "daily" | "weekly" | "monthly" | "custom";
  assignedTo?: string;
  status: "pending" | "triggered" | "snoozed" | "completed" | "dismissed";
  priority: "high" | "medium" | "low";
  domain?: string;
  linkedEntityId?: string;
}

export interface SharedReminder extends Reminder {
  sharedWith: string[]; // household member IDs
  createdBy: string;
  visibility: "household" | "individual";
}

// ── Household Task ───────────────────────────────────────────

export interface HouseholdTask {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  assignedTo?: string;
  dueDate?: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in-progress" | "completed" | "deferred";
  recurrence?: string;
  estimatedMinutes?: number;
  dependencies: string[];
  tags: string[];
}

export type TaskCategory =
  | "cleaning" | "maintenance" | "errands" | "groceries"
  | "cooking" | "laundry" | "yard" | "pets"
  | "school" | "medical" | "admin" | "other";

// ── Family Obligation ────────────────────────────────────────

export interface FamilyObligation {
  id: string;
  title: string;
  type: "school" | "medical" | "legal" | "financial" | "social" | "travel";
  memberIds: string[];
  dueDate: string;
  recurring: boolean;
  priority: "critical" | "high" | "medium" | "low";
  status: "upcoming" | "in-progress" | "completed" | "overdue";
  notes: string;
}

// ── Itinerary / Travel ───────────────────────────────────────

export interface ItineraryItem {
  id: string;
  tripId: string;
  type: "flight" | "hotel" | "car-rental" | "activity" | "restaurant" | "transfer" | "custom";
  title: string;
  startTime: string;
  endTime?: string;
  location?: string;
  confirmationNumber?: string;
  cost?: number;
  notes: string;
  status: "planned" | "booked" | "confirmed" | "completed" | "cancelled";
}

export interface TripSummary {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: string[];
  items: ItineraryItem[];
  totalBudgetCents: number;
  totalSpentCents: number;
  status: "planning" | "booked" | "in-progress" | "completed" | "cancelled";
}

export interface TripPrepChecklist {
  tripId: string;
  items: PrepChecklistItem[];
  completionPercent: number;
}

export interface PrepChecklistItem {
  id: string;
  task: string;
  category: "documents" | "packing" | "reservations" | "home-prep" | "pet-care" | "work" | "other";
  completed: boolean;
  dueDate?: string;
  assignedTo?: string;
}

// ── Service Provider ─────────────────────────────────────────

export interface ServiceProviderRecord {
  id: string;
  name: string;
  category: "plumber" | "electrician" | "cleaner" | "landscaper" | "vet" | "doctor" | "dentist" | "tutor" | "nanny" | "other";
  phone?: string;
  email?: string;
  rating: number; // 1-5
  lastUsed?: string;
  notes: string;
  isFavorite: boolean;
}

// ── Personal Admin ───────────────────────────────────────────

export interface PersonalAdminTracker {
  id: string;
  type: "license-renewal" | "insurance" | "subscription" | "warranty" | "membership" | "tax-deadline" | "other";
  title: string;
  expiresAt?: string;
  renewalDate?: string;
  cost?: number;
  notes: string;
  status: "active" | "expiring-soon" | "expired" | "renewed";
}

// ── Health-Safe Checklist ────────────────────────────────────

export interface HealthSafeChecklistItem {
  id: string;
  memberId: string;
  type: "medication" | "appointment" | "prescription" | "checkup" | "vaccination" | "other";
  title: string;
  dueDate?: string;
  provider?: string;
  completed: boolean;
  notes: string;
  privacyTier: "restricted"; // always restricted for health
}

// ── Booking Score ────────────────────────────────────────────

export interface BookingOption {
  id: string;
  type: "flight" | "hotel" | "car-rental" | "activity";
  provider: string;
  priceCents: number;
  convenienceScore: number; // 0-100
  preferenceMatch: number; // 0-100
  rating: number; // 0-100
  totalScore: number; // 0-100
  details: Record<string, unknown>;
}

// ── Sub-module re-exports ────────────────────────────────────
export * from "./household";
export * from "./calendar";
export * from "./school";
export * from "./grocery";
export * from "./travel";
export * from "./providers";
export * from "./events";

// ── Advanced contract re-exports ────────────────────────────
export * from "./appointment";
export * from "./availability-window";
export * from "./calendar-conflict";
export * from "./concierge-boardroom-packet";
export * from "./daily-pulse-item";
export * from "./errand-bundle";
export * from "./event-plan";
export * from "./family-boardroom-packet";
export * from "./family-load-balance";
export * from "./family-member-profile";
export * from "./gift-plan";
export * from "./household-maintenance-item";
export * from "./household-responsibility";
export * from "./inventory-item";
export * from "./itinerary";
export * from "./packing-plan";
export * from "./pantry-replenishment";
export * from "./prep-sequence";
export * from "./reservation";
export * from "./reservation-memory";
export * from "./route-grouping";
export * from "./schedule-item";
export * from "./school-activity";
export * from "./service-provider-memory";
export * from "./travel-disruption";
export * from "./trip-leg";
