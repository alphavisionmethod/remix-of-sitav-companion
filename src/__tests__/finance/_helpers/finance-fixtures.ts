// ═══════════════════════════════════════════════════════════════
// Finance OS — Test Fixtures
// Deterministic factories for Finance entities used by service &
// page tests. Time-deterministic via fixed `now`. Mirrors the
// business/concierge fixture shape so cross-module tests read
// consistently. Pure data — no mocks, no IO.
// ═══════════════════════════════════════════════════════════════

import type {
  FinancialAccount,
  ObligationRecord,
  ReserveModel,
  TransactionRecord,
} from "@/packages/finance-contracts";
import type {
  CashAllocatorInput,
  PeaceScoreInput,
} from "@/domains/finance";

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

export function makeAccount(
  overrides: Partial<FinancialAccount> = {},
): FinancialAccount {
  return {
    id: "acct-1",
    name: "Operating Checking",
    type: "checking",
    institution: "Test Bank",
    balanceCents: 500_000,
    availableCents: 500_000,
    currency: "USD",
    lastSyncedAt: daysAgo(0),
    connectorId: "conn-1",
    isActive: true,
    ...overrides,
  };
}

export function makeObligation(
  overrides: Partial<ObligationRecord> = {},
): ObligationRecord {
  return {
    id: "obl-1",
    name: "Rent",
    payee: "Landlord LLC",
    amountCents: 200_000,
    frequency: "monthly",
    nextDueDate: daysAhead(5),
    category: "Housing",
    autoPay: false,
    status: "upcoming",
    ...overrides,
  };
}

export function makeReserve(
  overrides: Partial<ReserveModel> = {},
): ReserveModel {
  return {
    id: "res-1",
    name: "Emergency Fund",
    targetCents: 1_000_000,
    currentCents: 500_000,
    percentFunded: 50,
    priority: 1,
    category: "emergency",
    autoAllocate: true,
    monthlyContributionCents: 50_000,
    ...overrides,
  };
}

export function makeTransaction(
  overrides: Partial<TransactionRecord> = {},
): TransactionRecord {
  return {
    id: "tx-1",
    accountId: "acct-1",
    amountCents: -1_500,
    description: "Trader Joe's Market",
    category: "Uncategorized",
    date: daysAgo(2),
    type: "debit",
    isRecurring: false,
    tags: [],
    categorizedBy: "rule",
    ...overrides,
  };
}

export function makeCashAllocatorInput(
  overrides: Partial<CashAllocatorInput> = {},
): CashAllocatorInput {
  return {
    availableCashCents: 1_000_000,
    billsDueCents: 200_000,
    taxOwedCents: 100_000,
    taxReservedCents: 50_000,
    emergencyTargetCents: 1_000_000,
    emergencyCurrentCents: 500_000,
    debtBalanceCents: 0,
    debtMinimumCents: 0,
    sinkingFundTargetCents: 0,
    sinkingFundCurrentCents: 0,
    payrollNeededCents: 0,
    payrollReservedCents: 0,
    ...overrides,
  };
}

export function makePeaceScoreInput(
  overrides: Partial<PeaceScoreInput> = {},
): PeaceScoreInput {
  return {
    reserveFundedPct: 80,
    billsCoveredPct: 100,
    debtToIncomeRatio: 0.15,
    taxReservedPct: 90,
    incomeStabilityScore: 80,
    obligationPressurePct: 30,
    discretionaryRoomPct: 25,
    householdCoordinationScore: 75,
    ...overrides,
  };
}