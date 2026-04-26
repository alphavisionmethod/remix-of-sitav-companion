// ═══════════════════════════════════════════════════════════════
// Business OS — Test Fixtures
// Deterministic factories for entities used by service & page tests.
// All values are time-deterministic via the optional `now` argument.
// ═══════════════════════════════════════════════════════════════

import type { Lead } from "@/domains/business";
import type { Opportunity } from "@/lib/services/business-os/opportunity-engine.service";
import type { RevenueLeakRecord } from "@/domains/business";
import type { NoShowEvent } from "@/lib/services/business-os/no-show-recovery.service";

const FIXED_NOW = new Date("2026-01-15T12:00:00Z").getTime();

export function fixedNow(): number {
  return FIXED_NOW;
}

export function daysAgo(days: number, now = FIXED_NOW): string {
  return new Date(now - days * 86400000).toISOString();
}

export function daysAhead(days: number, now = FIXED_NOW): string {
  return new Date(now + days * 86400000).toISOString();
}

export function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: "lead-1",
    name: "Acme Corp Lead",
    email: "lead@acme.test",
    company: "Acme",
    source: "website",
    status: "qualified",
    score: 0,
    lastContact: daysAgo(2),
    capturedAt: daysAgo(5),
    ...overrides,
  } as Lead;
}

export function makeOpportunity(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: "opp-1",
    name: "Acme renewal",
    accountId: "acct-1",
    stage: "proposal",
    valueCents: 250_000_00,
    probability: 0.6,
    expectedCloseDate: daysAhead(20),
    ownerId: "owner-1",
    createdAt: daysAgo(15),
    ...overrides,
  } as Opportunity;
}

export function makeRevenueLeak(overrides: Partial<RevenueLeakRecord> = {}): RevenueLeakRecord {
  return {
    id: "leak-1",
    accountId: "acct-1",
    leakType: "missed-renewal",
    leakAmountCents: 100_000_00,
    detectedAt: daysAgo(3),
    status: "detected",
    rootCause: "no follow-up after trial",
    ...overrides,
  } as RevenueLeakRecord;
}

export function makeNoShowEvent(overrides: Partial<NoShowEvent> = {}): NoShowEvent {
  return {
    id: "ns-1",
    type: "demo",
    accountId: "acct-1",
    contactName: "Jane Doe",
    scheduledAt: daysAgo(1),
    valueCents: 100_000,
    ...overrides,
  };
}