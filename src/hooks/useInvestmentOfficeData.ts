// ═══════════════════════════════════════════════════════════════
// SITA OS — Investment Office Data Hook (Contract Masking Layer)
// Wraps mock data behind a hook so pages never import mocks directly.
// When live data is available, swap internals here — zero page changes.
// ═══════════════════════════════════════════════════════════════

import { useDataMode } from "@/contexts/DataModeContext";
import * as mockData from "@/lib/investment-office/mock-data";

// ── Named re-exports for module-scope usage ──
export const INSTRUMENTS = mockData.INSTRUMENTS;
export const PORTFOLIO = mockData.PORTFOLIO;
export const WATCHLISTS = mockData.WATCHLISTS;
export const SAMPLE_THESES = mockData.SAMPLE_THESES;
export const INVESTMENT_ADVISORS = mockData.INVESTMENT_ADVISORS;
export const PLATFORM_CONNECTIONS = mockData.PLATFORM_CONNECTIONS;
export const SAMPLE_ORDERS = mockData.SAMPLE_ORDERS;
export const SAMPLE_SCENARIOS = mockData.SAMPLE_SCENARIOS;
export const SAMPLE_RESEARCH = mockData.SAMPLE_RESEARCH;
export const ADVISOR_SYNTHESIS = mockData.ADVISOR_SYNTHESIS;
export const getInstrument = mockData.getInstrument;

export function useInvestmentOfficeData() {
  const { isDemoMode } = useDataMode();

  return {
    isDemoMode,
    instruments: INSTRUMENTS,
    portfolio: PORTFOLIO,
    watchlists: WATCHLISTS,
    theses: SAMPLE_THESES,
    advisors: INVESTMENT_ADVISORS,
    connections: PLATFORM_CONNECTIONS,
    orders: SAMPLE_ORDERS,
    scenarios: SAMPLE_SCENARIOS,
    research: SAMPLE_RESEARCH,
    synthesis: ADVISOR_SYNTHESIS,
    getInstrument,
  };
}
