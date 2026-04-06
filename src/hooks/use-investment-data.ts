// ═══════════════════════════════════════════════════════════════
// SITA OS — Investment Data Hook (Mode-Aware)
// Returns real Supabase data in live mode, demo data in demo mode
// ═══════════════════════════════════════════════════════════════

import { useDataMode } from "@/contexts/DataModeContext";
import * as mockData from "@/lib/investment-office/mock-data";

/**
 * Mode-aware investment data hook.
 * In demo mode: returns mock data as-is.
 * In live mode: returns empty arrays (real queries would go here).
 * Pages should show DemoModeBadge when isDemoMode is true.
 */
export function useInvestmentData() {
  const { isDemoMode } = useDataMode();

  return {
    isDemoMode,
    instruments: isDemoMode ? mockData.INSTRUMENTS : [],
    portfolio: isDemoMode ? mockData.PORTFOLIO : null,
    watchlists: isDemoMode ? mockData.WATCHLISTS : [],
    theses: isDemoMode ? mockData.SAMPLE_THESES : [],
    advisors: isDemoMode ? mockData.INVESTMENT_ADVISORS : [],
    connections: isDemoMode ? mockData.PLATFORM_CONNECTIONS : [],
    orders: isDemoMode ? mockData.SAMPLE_ORDERS : [],
    scenarios: isDemoMode ? mockData.SAMPLE_SCENARIOS : [],
    getInstrument: (id: string) => isDemoMode ? mockData.getInstrument(id) : undefined,
  };
}
