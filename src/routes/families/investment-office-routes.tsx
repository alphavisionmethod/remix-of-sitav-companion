// @route-family: investment-office
// @kind: module
// @surface: user-product
// @profiles: user
// @canonical-page-owner: src/pages/investment-office/**
// @owns: topology-only
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
const EventMarketsWorkspace = lazy(() => import("@/pages/investment-office/EventMarketsWorkspace"));
const WatchlistsSignals = lazy(() => import("@/pages/investment-office/WatchlistsSignals"));
const InvestmentReceipts = lazy(() => import("@/pages/investment-office/InvestmentReceipts"));
const BeginnerMode = lazy(() => import("@/pages/investment-office/BeginnerMode"));
const AdvancedMode = lazy(() => import("@/pages/investment-office/AdvancedMode"));
const CapitalTwin = lazy(() => import("@/pages/investment-office/CapitalTwin"));
const DecisionTheater = lazy(() => import("@/pages/investment-office/DecisionTheater"));
const TimeMachineReview = lazy(() => import("@/pages/investment-office/TimeMachineReview"));
const CatalystWarRoom = lazy(() => import("@/pages/investment-office/CatalystWarRoom"));
const OpportunityMap = lazy(() => import("@/pages/investment-office/OpportunityMap"));
const InvestmentConstitution = lazy(() => import("@/pages/investment-office/InvestmentConstitution"));
const BehavioralFirewall = lazy(() => import("@/pages/investment-office/BehavioralFirewall"));
const MarketMemoryFeed = lazy(() => import("@/pages/investment-office/MarketMemoryFeed"));
const IntelligenceDossier = lazy(() => import("@/pages/investment-office/IntelligenceDossier"));
const EventProbabilityLab = lazy(() => import("@/pages/investment-office/EventProbabilityLab"));
const StrategyDNA = lazy(() => import("@/pages/investment-office/StrategyDNA"));
const PostTradeLoop = lazy(() => import("@/pages/investment-office/PostTradeLoop"));
const CrossAssetStoryEngine = lazy(() => import("@/pages/investment-office/CrossAssetStoryEngine"));
const ConvictionEngine = lazy(() => import("@/pages/investment-office/ConvictionEngine"));
const PositionSizingCoach = lazy(() => import("@/pages/investment-office/PositionSizingCoach"));
const OperatingModes = lazy(() => import("@/pages/investment-office/OperatingModes"));
const DecisionReadiness = lazy(() => import("@/pages/investment-office/DecisionReadiness"));
const CapitalPurpose = lazy(() => import("@/pages/investment-office/CapitalPurpose"));
const WhatWouldBreak = lazy(() => import("@/pages/investment-office/WhatWouldBreak"));
const DisagreementEngine = lazy(() => import("@/pages/investment-office/DisagreementEngine"));
const FamilyOffice = lazy(() => import("@/pages/investment-office/FamilyOffice"));
const KnowledgeGraph = lazy(() => import("@/pages/investment-office/KnowledgeGraph"));

export function getInvestmentOfficeRoutes() {
  return (
    <>
      <Route path="/investments" element={<InvestmentGate />} />
      <Route path="/investments/boardroom" element={<InvestmentBoardroom />} />
      <Route path="/investments/markets" element={<MarketExplorer />} />
      <Route path="/investments/instrument/:instrumentId" element={<InstrumentDetail />} />
      <Route path="/investments/portfolio" element={<PortfolioOffice />} />
      <Route path="/investments/strategy" element={<StrategyStudio />} />
      <Route path="/investments/execute" element={<ExecutionDesk />} />
      <Route path="/investments/research" element={<ResearchLibrary />} />
      <Route path="/investments/journal" element={<ThesisJournal />} />
      <Route path="/investments/risk" element={<RiskOffice />} />
      <Route path="/investments/advisors" element={<InvestmentAdvisorBoard />} />
      <Route path="/investments/platforms" element={<PlatformConnections />} />
      <Route path="/investments/events" element={<EventMarketsWorkspace />} />
      <Route path="/investments/watchlists" element={<WatchlistsSignals />} />
      <Route path="/investments/receipts" element={<InvestmentReceipts />} />
      <Route path="/investments/beginner" element={<BeginnerMode />} />
      <Route path="/investments/advanced" element={<AdvancedMode />} />
      <Route path="/investments/capital-twin" element={<CapitalTwin />} />
      <Route path="/investments/decision-theater" element={<DecisionTheater />} />
      <Route path="/investments/trading-floor" element={<TradingFloor />} />
      <Route path="/investments/war-room" element={<InvestmentWarRoom />} />
      <Route path="/investments/time-machine" element={<TimeMachineReview />} />
      <Route path="/investments/catalysts" element={<CatalystWarRoom />} />
      <Route path="/investments/opportunity-map" element={<OpportunityMap />} />
      <Route path="/investments/constitution" element={<InvestmentConstitution />} />
      <Route path="/investments/behavioral" element={<BehavioralFirewall />} />
      <Route path="/investments/memory" element={<MarketMemoryFeed />} />
      <Route path="/investments/dossier" element={<IntelligenceDossier />} />
      <Route path="/investments/probability-lab" element={<EventProbabilityLab />} />
      <Route path="/investments/strategy-dna" element={<StrategyDNA />} />
      <Route path="/investments/post-trade" element={<PostTradeLoop />} />
      <Route path="/investments/cross-asset" element={<CrossAssetStoryEngine />} />
      <Route path="/investments/conviction" element={<ConvictionEngine />} />
      <Route path="/investments/sizing" element={<PositionSizingCoach />} />
      <Route path="/investments/modes" element={<OperatingModes />} />
      <Route path="/investments/readiness" element={<DecisionReadiness />} />
      <Route path="/investments/capital-purpose" element={<CapitalPurpose />} />
      <Route path="/investments/what-would-break" element={<WhatWouldBreak />} />
      <Route path="/investments/disagreements" element={<DisagreementEngine />} />
      <Route path="/investments/family-office" element={<FamilyOffice />} />
      <Route path="/investments/knowledge-graph" element={<KnowledgeGraph />} />
      <Route path="/money/investments" element={<InvestmentGate />} />
    </>
  );
}