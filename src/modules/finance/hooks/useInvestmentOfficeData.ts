// ═══════════════════════════════════════════════════════════════
// SITA OS — Investment Office Data Hook (Contract Masking Layer)
// Wraps mock data behind a hook so pages never import mocks directly.
// When live data is available, swap internals here — zero page changes.
// ═══════════════════════════════════════════════════════════════

import { useDataMode } from "@/contexts/DataModeContext";
import * as data from "@/domains/investment";

// ── Named re-exports for module-scope usage ──
export const INSTRUMENTS = data.INSTRUMENTS;
export const PORTFOLIO = data.PORTFOLIO;
export const WATCHLISTS = data.WATCHLISTS;
export const SAMPLE_THESES = data.SAMPLE_THESES;
export const INVESTMENT_ADVISORS = data.INVESTMENT_ADVISORS;
export const PLATFORM_CONNECTIONS = data.PLATFORM_CONNECTIONS;
export const SAMPLE_ORDERS = data.SAMPLE_ORDERS;
export const SAMPLE_SCENARIOS = data.SAMPLE_SCENARIOS;
export const SAMPLE_RESEARCH = data.SAMPLE_RESEARCH;
export const ADVISOR_SYNTHESIS = data.ADVISOR_SYNTHESIS;
export const getInstrument = data.getInstrument;

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
