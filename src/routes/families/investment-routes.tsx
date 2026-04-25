// ═══════════════════════════════════════════════════════════════
// SITA OS — Investment Office Canonical Routes (Phase 24.C)
// Lifted from experimental-routes.tsx; canonical /investment/* paths
// (legacy /investments/* still served by experimental-routes for
// backwards compatibility while UI migrates).
// ═══════════════════════════════════════════════════════════════

import { Route } from "react-router-dom";
import { lazy } from "react";

const InvestmentBoardroom = lazy(() => import("@/pages/investment-office/InvestmentBoardroom"));
const MarketExplorer = lazy(() => import("@/pages/investment-office/MarketExplorer"));
const InstrumentDetail = lazy(() => import("@/pages/investment-office/InstrumentDetail"));
const PortfolioOffice = lazy(() => import("@/pages/investment-office/PortfolioOffice"));
const StrategyStudio = lazy(() => import("@/pages/investment-office/StrategyStudio"));
const ExecutionDesk = lazy(() => import("@/pages/investment-office/ExecutionDesk"));
const ResearchLibrary = lazy(() => import("@/pages/investment-office/ResearchLibrary"));
const ThesisJournal = lazy(() => import("@/pages/investment-office/ThesisJournal"));
const RiskOffice = lazy(() => import("@/pages/investment-office/RiskOffice"));
const InvestmentAdvisorBoard = lazy(() => import("@/pages/investment-office/AdvisorBoard"));
const PlatformConnections = lazy(() => import("@/pages/investment-office/PlatformConnections"));
const InvestmentGate = lazy(() => import("@/pages/investment-office/InvestmentGate"));
const TradingFloor = lazy(() => import("@/pages/investment-office/TradingFloor"));
const InvestmentWarRoom = lazy(() => import("@/pages/investment-office/WarRoom"));
const WatchlistsSignals = lazy(() => import("@/pages/investment-office/WatchlistsSignals"));
const InvestmentReceipts = lazy(() => import("@/pages/investment-office/InvestmentReceipts"));
const BehavioralFirewall = lazy(() => import("@/pages/investment-office/BehavioralFirewall"));
const FamilyOffice = lazy(() => import("@/pages/investment-office/FamilyOffice"));

export function getInvestmentRoutes() {
  return (
    <>
      <Route path="/investment" element={<InvestmentGate />} />
      <Route path="/investment/boardroom" element={<InvestmentBoardroom />} />
      <Route path="/investment/markets" element={<MarketExplorer />} />
      <Route path="/investment/instrument/:instrumentId" element={<InstrumentDetail />} />
      <Route path="/investment/portfolio" element={<PortfolioOffice />} />
      <Route path="/investment/strategy" element={<StrategyStudio />} />
      <Route path="/investment/execute" element={<ExecutionDesk />} />
      <Route path="/investment/research" element={<ResearchLibrary />} />
      <Route path="/investment/journal" element={<ThesisJournal />} />
      <Route path="/investment/risk" element={<RiskOffice />} />
      <Route path="/investment/advisors" element={<InvestmentAdvisorBoard />} />
      <Route path="/investment/platforms" element={<PlatformConnections />} />
      <Route path="/investment/trading-floor" element={<TradingFloor />} />
      <Route path="/investment/war-room" element={<InvestmentWarRoom />} />
      <Route path="/investment/watchlists" element={<WatchlistsSignals />} />
      <Route path="/investment/receipts" element={<InvestmentReceipts />} />
      <Route path="/investment/behavioral" element={<BehavioralFirewall />} />
      <Route path="/investment/family-office" element={<FamilyOffice />} />
    </>
  );
}
