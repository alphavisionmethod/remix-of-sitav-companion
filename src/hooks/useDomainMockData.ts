// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain Mock Data Hooks (Contract Masking Layer)
// One hook per domain, wrapping mock imports behind a stable API.
// ═══════════════════════════════════════════════════════════════

import { useDataMode } from "@/contexts/DataModeContext";
import { MOCK_RECOVERED_VALUES, MOCK_RAW_OPPORTUNITIES, MOCK_LEAKAGE_INPUT } from "@/lib/mock-data/revenue-autopilot";
import { generateCalendarDemoEvents } from "@/lib/mock-data/calendar";
import { MOCK_CAPITAL_BUCKETS, MOCK_POSITIONS, MOCK_THESES } from "@/lib/mock-data/investment";
import { buildMockSimResult } from "@/lib/mock-data";
import {
  MOCK_CONTACTS, MOCK_CALL_LOGS, MOCK_CALL_SCRIPTS,
  type CallingContact, type CallingCallLog, type CallingCallScript,
} from "@/lib/mock-data/revenue-calling";

// Re-export types that pages import as type-only
export type { CollectionsAccount } from "@/lib/mock-data/collections";
export type { OwnerApprovalItem, OwnerPricingItem } from "@/lib/mock-data/owner";
export type { MockDoc, MockSheet, MockDeck, MockSlide } from "@/lib/mock-data/workspace";
export type { CallingContact, CallingCallLog, CallingCallScript };

export function useRevenueAutopilotData() {
  const { isDemoMode } = useDataMode();
  return {
    isDemoMode,
    recoveredValues: MOCK_RECOVERED_VALUES,
    rawOpportunities: MOCK_RAW_OPPORTUNITIES,
    leakageInput: MOCK_LEAKAGE_INPUT,
  };
}

export function useCalendarDemoData() {
  return { generateCalendarDemoEvents };
}

export function useInvestmentPageData() {
  const { isDemoMode } = useDataMode();
  return {
    isDemoMode,
    capitalBuckets: MOCK_CAPITAL_BUCKETS,
    positions: MOCK_POSITIONS,
    theses: MOCK_THESES,
  };
}

export function useOwnerCenterData() {
  return { buildMockSimResult };
}

export function useRevenueCallingData() {
  const { isDemoMode } = useDataMode();
  return {
    isDemoMode,
    contacts: MOCK_CONTACTS as CallingContact[],
    callLogs: MOCK_CALL_LOGS as CallingCallLog[],
    callScripts: MOCK_CALL_SCRIPTS as CallingCallScript[],
  };
}
