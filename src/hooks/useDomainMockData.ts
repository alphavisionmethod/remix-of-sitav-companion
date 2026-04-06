// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain Mock Data Hooks
// Masks mock data behind clean contract interfaces.
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { MOCK_COLLECTIONS_ACCOUNTS } from "@/lib/mock-data/collections";
import type { CollectionsAccount } from "@/lib/mock-data/collections";
import { MOCK_RECOVERED_VALUES, MOCK_RAW_OPPORTUNITIES, MOCK_LEAKAGE_INPUT } from "@/lib/mock-data/revenue-autopilot";
import { MOCK_CONTACTS, MOCK_CALL_LOGS, MOCK_CALL_SCRIPTS } from "@/lib/mock-data/revenue-calling";
import type { CallingContact, CallingCallLog, CallingCallScript } from "@/lib/mock-data/revenue-calling";
import { generateCalendarDemoEvents } from "@/lib/mock-data/calendar";
import type { MockCalendarEvent } from "@/lib/mock-data/calendar";
import { MOCK_CAPITAL_BUCKETS, MOCK_POSITIONS, MOCK_THESES } from "@/lib/mock-data/investment";
import { MOCK_DOCS, MOCK_SHEETS, MOCK_DECKS } from "@/lib/mock-data/workspace";
import type { MockDoc, MockSheet, MockDeck } from "@/lib/mock-data/workspace";
import { MOCK_OWNER_APPROVALS, MOCK_PRICING_ITEMS } from "@/lib/mock-data/owner";
import type { OwnerApprovalItem, OwnerPricingItem } from "@/lib/mock-data/owner";
import { buildMockSimResult } from "@/lib/mock-data";

export type { CollectionsAccount, CallingContact, CallingCallLog, CallingCallScript, MockCalendarEvent, MockDoc, MockSheet, MockDeck, OwnerApprovalItem, OwnerPricingItem };

export function useCollectionsData() {
  return useMemo(() => ({
    accounts: MOCK_COLLECTIONS_ACCOUNTS as CollectionsAccount[],
    isDemoData: true,
  }), []);
}

export function useRevenueAutopilotData() {
  return useMemo(() => ({
    recoveredValues: MOCK_RECOVERED_VALUES,
    rawOpportunities: MOCK_RAW_OPPORTUNITIES,
    leakageInput: MOCK_LEAKAGE_INPUT,
    isDemoData: true,
  }), []);
}

export function useRevenueCallingData() {
  return useMemo(() => ({
    contacts: MOCK_CONTACTS,
    callLogs: MOCK_CALL_LOGS,
    callScripts: MOCK_CALL_SCRIPTS,
    isDemoData: true,
  }), []);
}

export function useCalendarDemoData(year: number, month: number) {
  return useMemo(() => ({
    events: generateCalendarDemoEvents(year, month),
    isDemoData: true,
  }), [year, month]);
}

export function useInvestmentData() {
  return useMemo(() => ({
    capitalBuckets: MOCK_CAPITAL_BUCKETS,
    positions: MOCK_POSITIONS,
    theses: MOCK_THESES,
    isDemoData: true,
  }), []);
}

export function useWorkspaceData() {
  return useMemo(() => ({
    docs: MOCK_DOCS,
    sheets: MOCK_SHEETS,
    decks: MOCK_DECKS,
    isDemoData: true,
  }), []);
}

export function useOwnerData() {
  return useMemo(() => ({
    approvals: MOCK_OWNER_APPROVALS,
    pricingItems: MOCK_PRICING_ITEMS,
    isDemoData: true,
  }), []);
}

export function useMockSimulation() {
  return useMemo(() => ({
    buildSimResult: buildMockSimResult,
    isDemoData: true,
  }), []);
}
