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
  SubscriptionRecord,
  Receivable,
  DebtAccount,
} from "@/packages/finance-contracts";
import type {
  CashAllocatorInput,
  PeaceScoreInput,
  StressRadarInput,
  IncomeQualityInput,
} from "@/domains/finance";
import type { SinkingFund } from "@/packages/finance-contracts/reserves";
import type { ScenarioInput } from "@/packages/finance-contracts/scenario";

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

export function makeSubscription(
  overrides: Partial<SubscriptionRecord> = {},
): SubscriptionRecord {
  return {
    id: "sub-1",
    name: "Streaming Plus",
    provider: "StreamCo",
    amountCents: 1499,
    frequency: "monthly",
    category: "entertainment",
    detectedAt: daysAgo(30),
    lastChargeDate: daysAgo(2),
    isWaste: false,
    savingsIfCancelled: 0,
    status: "active",
    ...overrides,
  };
}

export function makeReceivable(
  overrides: Partial<Receivable> = {},
): Receivable {
  return {
    id: "ar-1",
    fromEntity: "Acme Corp",
    amountCents: 250_000,
    dueDate: daysAhead(15),
    status: "expected",
    agingDays: 10,
    ...overrides,
  };
}

export function makeDebtAccount(
  overrides: Partial<DebtAccount> = {},
): DebtAccount {
  return {
    id: "debt-1",
    name: "Visa Card",
    type: "credit-card",
    balanceCents: 500_000,
    limitCents: 1_000_000,
    interestRate: 22.99,
    minimumPaymentCents: 25_000,
    dueDate: daysAhead(20),
    utilizationPercent: 50,
    monthlyInterestCents: 9_580,
    payoffMonths: 24,
    isAutoPay: true,
    institution: "Test Bank",
    ...overrides,
  };
}

export function makeSinkingFund(
  overrides: Partial<SinkingFund> = {},
): SinkingFund {
  return {
    id: "sf-1",
    name: "Property Tax",
    targetCents: 600_000,
    currentCents: 100_000,
    targetDate: daysAhead(180),
    monthlyContributionCents: 100_000,
    purpose: "Annual property tax escrow",
    category: "property-tax",
    onTrack: true,
    projectedShortfallCents: 0,
    createdAt: daysAgo(30),
    ...overrides,
  };
}

export function makeStressRadarInput(
  overrides: Partial<StressRadarInput> = {},
): StressRadarInput {
  return {
    cashBalanceCents: 500_000,
    monthlyIncomeCents: 800_000,
    monthlyBurnCents: 600_000,
    upcomingBills: [],
    reserveFundedPct: 60,
    reserveTargetCents: 1_000_000,
    totalDebtCents: 0,
    monthlyDebtPaymentCents: 0,
    creditUtilizationPct: 0,
    subscriptionMonthlyCents: 5_000,
    subscriptionCountActive: 4,
    taxReservedPct: 80,
    taxOwedEstimateCents: 200_000,
    founderDrawMonthlyCents: 0,
    founderDrawStable: true,
    floatReliancePct: 0,
    ...overrides,
  };
}

export function makeIncomeQualityInput(
  overrides: Partial<IncomeQualityInput> = {},
): IncomeQualityInput {
  return {
    recurringIncomePct: 70,
    topClientConcentrationPct: 35,
    seasonalVariationPct: 15,
    avgPaymentDelayDays: 7,
    oneTimeIncomePct: 20,
    householdDependencyOnUnstablePct: 25,
    ...overrides,
  };
}

export function makeScenarioInput(
  overrides: Partial<ScenarioInput> = {},
): ScenarioInput {
  return {
    id: "sc-1",
    name: "Cancel a subscription",
    type: "cut-subscription",
    parameters: { monthlySavingsCents: 5_000 },
    description: "Test scenario",
    ...overrides,
  };
}