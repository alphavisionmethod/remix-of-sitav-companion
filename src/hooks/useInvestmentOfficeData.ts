// ═══════════════════════════════════════════════════════════════
// SITA OS — Investment Office Data Hook (Contract Masking Layer)
// Wraps mock data behind a hook so pages never import mocks directly.
// When live data is available, swap internals here — zero page changes.
// ═══════════════════════════════════════════════════════════════

import { useDataMode } from "@/contexts/DataModeContext";
import * as mockData from "@/lib/investment-office/mock-data";

export function useInvestmentOfficeData() {
  const { isDemoMode } = useDataMode();

  return {
    isDemoMode,
    instruments: isDemoMode ? mockData.INSTRUMENTS : mockData.INSTRUMENTS,
    portfolio: isDemoMode ? mockData.PORTFOLIO : mockData.PORTFOLIO,
    watchlists: isDemoMode ? mockData.WATCHLISTS : mockData.WATCHLISTS,
    theses: isDemoMode ? mockData.SAMPLE_THESES : mockData.SAMPLE_THESES,
    advisors: isDemoMode ? mockData.INVESTMENT_ADVISORS : mockData.INVESTMENT_ADVISORS,
    connections: isDemoMode ? mockData.PLATFORM_CONNECTIONS : mockData.PLATFORM_CONNECTIONS,
    orders: isDemoMode ? mockData.SAMPLE_ORDERS : mockData.SAMPLE_ORDERS,
    scenarios: isDemoMode ? mockData.SAMPLE_SCENARIOS : mockData.SAMPLE_SCENARIOS,
    research: isDemoMode ? mockData.SAMPLE_RESEARCH : mockData.SAMPLE_RESEARCH,
    synthesis: isDemoMode ? mockData.ADVISOR_SYNTHESIS : mockData.ADVISOR_SYNTHESIS,
    getInstrument: mockData.getInstrument,
  };
}
