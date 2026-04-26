// @route-family: investment-office-extended
// @kind: module
// @surface: user-product
// @profiles: user
// @canonical-page-owner: src/pages/investment-office/**
// @owns: topology-only
//
// Phase 5 — Investment Routing Consolidation
// /investment (singular) is canonical. This file emits ONLY the
// extended Investment Office pages that are not already declared
// in investment-routes.tsx. Together the two route families form
// the single canonical /investment/* namespace.
//
// Legacy /investments/* paths are served by USER_REDIRECTS in
// src/routes/redirects/user-redirect-map.ts (Phase 5 expansion).
import { Route } from "react-router-dom";
import { lazy } from "react";

const EventMarketsWorkspace = lazy(() => import("@/pages/investment-office/EventMarketsWorkspace"));
const BeginnerMode = lazy(() => import("@/pages/investment-office/BeginnerMode"));
const AdvancedMode = lazy(() => import("@/pages/investment-office/AdvancedMode"));
const CapitalTwin = lazy(() => import("@/pages/investment-office/CapitalTwin"));
const DecisionTheater = lazy(() => import("@/pages/investment-office/DecisionTheater"));
const TimeMachineReview = lazy(() => import("@/pages/investment-office/TimeMachineReview"));
const CatalystWarRoom = lazy(() => import("@/pages/investment-office/CatalystWarRoom"));
const OpportunityMap = lazy(() => import("@/pages/investment-office/OpportunityMap"));
const InvestmentConstitution = lazy(() => import("@/pages/investment-office/InvestmentConstitution"));
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
const KnowledgeGraph = lazy(() => import("@/pages/investment-office/KnowledgeGraph"));

export function getInvestmentOfficeRoutes() {
  return (
    <>
      <Route path="/investment/events" element={<EventMarketsWorkspace />} />
      <Route path="/investment/beginner" element={<BeginnerMode />} />
      <Route path="/investment/advanced" element={<AdvancedMode />} />
      <Route path="/investment/capital-twin" element={<CapitalTwin />} />
      <Route path="/investment/decision-theater" element={<DecisionTheater />} />
      <Route path="/investment/time-machine" element={<TimeMachineReview />} />
      <Route path="/investment/catalysts" element={<CatalystWarRoom />} />
      <Route path="/investment/opportunity-map" element={<OpportunityMap />} />
      <Route path="/investment/constitution" element={<InvestmentConstitution />} />
      <Route path="/investment/memory" element={<MarketMemoryFeed />} />
      <Route path="/investment/dossier" element={<IntelligenceDossier />} />
      <Route path="/investment/probability-lab" element={<EventProbabilityLab />} />
      <Route path="/investment/strategy-dna" element={<StrategyDNA />} />
      <Route path="/investment/post-trade" element={<PostTradeLoop />} />
      <Route path="/investment/cross-asset" element={<CrossAssetStoryEngine />} />
      <Route path="/investment/conviction" element={<ConvictionEngine />} />
      <Route path="/investment/sizing" element={<PositionSizingCoach />} />
      <Route path="/investment/modes" element={<OperatingModes />} />
      <Route path="/investment/readiness" element={<DecisionReadiness />} />
      <Route path="/investment/capital-purpose" element={<CapitalPurpose />} />
      <Route path="/investment/what-would-break" element={<WhatWouldBreak />} />
      <Route path="/investment/disagreements" element={<DisagreementEngine />} />
      <Route path="/investment/knowledge-graph" element={<KnowledgeGraph />} />
    </>
  );
}