// ═══════════════════════════════════════════════════════════════
// SITA OS — Investment Office Data Hook
// Masks mock data behind a clean contract interface.
// Replace internals with real DB queries when backend is ready.
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import {
  INSTRUMENTS, getInstrument, PORTFOLIO, WATCHLISTS,
  INVESTMENT_ADVISORS, ADVISOR_SYNTHESIS, PLATFORM_CONNECTIONS,
  SAMPLE_THESES, SAMPLE_SCENARIOS, SAMPLE_RESEARCH, SAMPLE_ORDERS,
  __DEMO_SOURCE__, __DATA_CLASSIFICATION__,
} from "@/lib/investment-office/mock-data";
import type {
  Instrument, Portfolio, Watchlist, InvestmentAdvisor,
  InvestmentThesis, PlatformConnection, ResearchNote, Scenario,
  TradeOrder, AdvisorSynthesis,
} from "@/lib/investment-office/types";

export interface InvestmentOfficeData {
  instruments: Instrument[];
  getInstrument: (id: string) => Instrument | undefined;
  portfolio: Portfolio;
  watchlists: Watchlist[];
  advisors: InvestmentAdvisor[];
  advisorSynthesis: AdvisorSynthesis;
  platformConnections: PlatformConnection[];
  theses: InvestmentThesis[];
  scenarios: Scenario[];
  research: ResearchNote[];
  orders: TradeOrder[];
  isDemoData: boolean;
  dataClassification: string;
}

export function useInvestmentOfficeData(): InvestmentOfficeData {
  return useMemo(() => ({
    instruments: INSTRUMENTS,
    getInstrument,
    portfolio: PORTFOLIO,
    watchlists: WATCHLISTS,
    advisors: INVESTMENT_ADVISORS,
    advisorSynthesis: ADVISOR_SYNTHESIS,
    platformConnections: PLATFORM_CONNECTIONS,
    theses: SAMPLE_THESES,
    scenarios: SAMPLE_SCENARIOS,
    research: SAMPLE_RESEARCH,
    orders: SAMPLE_ORDERS,
    isDemoData: __DEMO_SOURCE__,
    dataClassification: __DATA_CLASSIFICATION__,
  }), []);
}
