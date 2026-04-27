// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge CAI Data Context
// Passes CAI relationship + obligation data to concierge sub-pages
// ═══════════════════════════════════════════════════════════════

import { createContext, useContext } from "react";

export interface ConciergeCAIData {
  relationships: any[] | undefined;
  obligations: any[] | undefined;
}

const ConciergeDataContext = createContext<ConciergeCAIData>({
  relationships: undefined,
  obligations: undefined,
});

export const ConciergeDataProvider = ConciergeDataContext.Provider;
export const useConciergeCAIData = () => useContext(ConciergeDataContext);
