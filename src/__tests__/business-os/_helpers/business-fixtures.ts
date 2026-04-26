// ═══════════════════════════════════════════════════════════════
// Business OS — Test Fixtures
// Deterministic factories for entities used by service & page tests.
// All values are time-deterministic via the optional `now` argument.
// ═══════════════════════════════════════════════════════════════

import type { Lead, RevenueLeakRecord } from "@/domains/business";
import type { Opportunity } from "@/lib/services/business-os/opportunity-engine.service";
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
    status: "qualified",
    score: 0,
    lastContact: daysAgo(2),
    ...overrides,
  };
}

export function makeOpportunity(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: "opp-1",
    title: "Acme renewal",
    accountId: "acct-1",
    accountName: "Acme",
    stage: "proposal",
    valueCents: 250_000_00,
    probability: 0.6,
    expectedCloseDate: daysAhead(20),
    assignedTo: "owner-1",
    createdAt: daysAgo(15),
    ...overrides,
  };
}

export function makeRevenueLeak(overrides: Partial<RevenueLeakRecord> = {}): RevenueLeakRecord {
  return {
    id: "leak-1",
    category: "uncollected-invoice",
    entityId: "inv-1",
    entityType: "invoice",
    leakAmountCents: 100_000_00,
    detectedAt: daysAgo(3),
    confidence: 80,
    description: "Invoice 30+ days past due",
    suggestedRecoveryAction: "Send polite reminder",
    status: "detected",
    ...overrides,
  };
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