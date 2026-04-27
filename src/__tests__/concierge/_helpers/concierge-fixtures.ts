// ═══════════════════════════════════════════════════════════════
// Concierge OS — Test Fixtures
// Deterministic factories for Concierge entities used by
// service & page tests. Time-deterministic via fixed `now`.
// Mirrors the shape of business-fixtures.ts so tests across
// modules read consistently.
// ═══════════════════════════════════════════════════════════════

import type {
  HouseholdTask,
  TaskCategory,
  TripSummary,
  ServiceProviderRecord,
  PersonalAdminTracker,
} from "@/packages/concierge-contracts";
import type { HouseholdMember } from "@/packages/concierge-contracts/household";
import type { RecurringSupplyItem } from "@/packages/concierge-contracts/grocery";
import type { LocalCalendarEvent } from "@/domains/concierge";

const FIXED_NOW = new Date("2026-04-15T12:00:00Z").getTime();

export function fixedNow(): number {
  return FIXED_NOW;
}

export function daysAgo(days: number, now = FIXED_NOW): string {
  return new Date(now - days * 86400000).toISOString();
}

export function daysAhead(days: number, now = FIXED_NOW): string {
  return new Date(now + days * 86400000).toISOString();
}

export function makeHouseholdMember(
  overrides: Partial<HouseholdMember> = {},
): HouseholdMember {
  return {
    id: "m-1",
    firstName: "Ada",
    lastName: "Lovelace",
    role: "parent",
    isMinor: false,
    emergencyContacts: [],
    ...overrides,
  };
}

export function makeHouseholdTask(
  overrides: Partial<HouseholdTask> = {},
): HouseholdTask {
  return {
    id: "t-1",
    title: "Meal prep",
    category: "cooking" as TaskCategory,
    priority: "medium",
    status: "pending",
    dependencies: [],
    tags: [],
    estimatedMinutes: 30,
    ...overrides,
  };
}

export function makeCalendarEvent(
  overrides: Partial<LocalCalendarEvent> = {},
): LocalCalendarEvent {
  return {
    id: "e-1",
    title: "School pickup",
    start: daysAhead(1),
    end: new Date(new Date(daysAhead(1)).getTime() + 30 * 60000).toISOString(),
    calendar: "family",
    attendees: ["m-1"],
    ...overrides,
  };
}

export function makeRecurringSupply(
  overrides: Partial<RecurringSupplyItem> = {},
): RecurringSupplyItem {
  return {
    id: "rs-1",
    name: "Coffee beans",
    category: "pantry",
    frequencyDays: 14,
    lastPurchasedAt: daysAgo(10),
    nextExpectedAt: daysAhead(4),
    autoAdd: true,
    preferredStore: "Trader Joe's",
    avgPriceCents: 1599,
    quantity: 1,
    unit: "bag",
    ...overrides,
  };
}

export function makeTripSummary(
  overrides: Partial<TripSummary> = {},
): TripSummary {
  return {
    id: "tr-1",
    name: "Spring break",
    destination: "Lisbon",
    startDate: daysAhead(20),
    endDate: daysAhead(27),
    travelers: ["m-1"],
    items: [],
    totalBudgetCents: 500_000,
    totalSpentCents: 100_000,
    status: "planning",
    ...overrides,
  };
}

export function makeProvider(
  overrides: Partial<ServiceProviderRecord> = {},
): ServiceProviderRecord {
  return {
    id: "sp-1",
    name: "Bay Plumbing",
    category: "plumber",
    phone: "555-0100",
    rating: 4.5,
    notes: "",
    isFavorite: false,
    ...overrides,
  };
}

export function makeAdminTracker(
  overrides: Partial<PersonalAdminTracker> = {},
): PersonalAdminTracker {
  return {
    id: "pa-1",
    type: "license-renewal",
    title: "Driver's license",
    expiresAt: daysAhead(20),
    cost: 80,
    notes: "",
    status: "active",
    ...overrides,
  };
}