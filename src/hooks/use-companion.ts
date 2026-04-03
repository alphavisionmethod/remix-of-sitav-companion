// ═══════════════════════════════════════════════════════════════
// SITA OS — useCompanion Hook
// Manages companion state, context detection, suggestions,
// proposal queue, inline booking, life intelligence, and manifests
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  CompanionEngine,
  createCompanionEngine,
  type CompanionContext,
  type CompanionSuggestion,
  type HealthPulse,
} from "@/lib/core-services/companion-engine";
import {
  FeatureProposalEngine,
  createFeatureProposalEngine,
  type FeatureProposal,
} from "@/lib/core-services/feature-proposal-engine";
import type { LifeContext, DayBriefing, ObligationItem } from "@/lib/core-services/life-intelligence-engine";
import type { ManifestSnapshot } from "@/lib/core-services/manifest-generator";
import type { FleetStatus } from "@/lib/core-services/agent-orchestrator";
import type { HealthReport } from "@/lib/core-services/error-patrol";
import type { SyncStatus } from "@/lib/core-services/cloud-sync-manager";
import type { SystemLearnings } from "@/lib/core-services/self-learning-engine";
import type { NLPCompanion, NLPResult, PredictiveSuggestion } from "@/lib/core-services/nlp-companion";

export interface UseCompanionReturn {
  context: CompanionContext;
  suggestions: CompanionSuggestion[];
  healthPulse: HealthPulse;
  proposals: FeatureProposal[];
  pendingProposalCount: number;
  lifeContext: LifeContext;
  dailyBriefing: DayBriefing;
  obligations: ObligationItem[];
  manifestSnapshot: ManifestSnapshot;
  fleetStatus: FleetStatus;
  errorPatrolReport: HealthReport;
  syncStatus: SyncStatus;
  learningInsights: SystemLearnings;
  dismissSuggestion: (id: string) => void;
  refreshSuggestions: () => void;
  generateProposals: () => void;
  simulateProposal: (id: string) => Promise<void>;
  approveProposal: (id: string) => Promise<void>;
  rejectProposal: (id: string) => void;
  executeProposal: (id: string) => Promise<void>;
  companionEngine: CompanionEngine;
  proposalEngine: FeatureProposalEngine;
  nlpCompanion: NLPCompanion;
  processNLP: (input: string) => NLPResult;
  nlpSuggestions: PredictiveSuggestion[];
}

export function useCompanion(): UseCompanionReturn {
  const location = useLocation();

  const [companionEngine] = useState(() => createCompanionEngine());
  const [proposalEngine] = useState(() => createFeatureProposalEngine());

  const [context, setContext] = useState<CompanionContext>(() =>
    companionEngine.detectContext(location.pathname)
  );
  const [suggestions, setSuggestions] = useState<CompanionSuggestion[]>([]);
  const [proposals, setProposals] = useState<FeatureProposal[]>([]);
  const [healthPulse, setHealthPulse] = useState<HealthPulse>(() =>
    companionEngine.getHealthPulse()
  );

  // Life intelligence state
  const lifeEngine = companionEngine.getLifeIntelligence();
  const manifestGen = companionEngine.getManifestGenerator();
  const orchestrator = companionEngine.getOrchestrator();
  const errorPatrolSvc = companionEngine.getErrorPatrol();
  const cloudSyncSvc = companionEngine.getCloudSync();
  const selfLearningSvc = companionEngine.getSelfLearning();
  const nlpCompanion = companionEngine.getNLPCompanion();

  const [lifeContext, setLifeContext] = useState<LifeContext>(() => lifeEngine.buildContext());
  const [dailyBriefing, setDailyBriefing] = useState<DayBriefing>(() => lifeEngine.summarizeDay());
  const [manifestSnapshot, setManifestSnapshot] = useState<ManifestSnapshot>(() => manifestGen.getManifestSnapshot());
  const [fleetStatus, setFleetStatus] = useState<FleetStatus>(() => orchestrator.getFleetStatus());
  const [errorPatrolReport, setErrorPatrolReport] = useState<HealthReport>(() => errorPatrolSvc.getHealthReport());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => cloudSyncSvc.getSyncStatus());
  const [learningInsights, setLearningInsights] = useState<SystemLearnings>(() => selfLearningSvc.getSystemLearnings());

  // Update context on route change
  useEffect(() => {
    const newContext = companionEngine.detectContext(location.pathname);
    setContext(newContext);
    setSuggestions(companionEngine.getSuggestions(newContext));
    setLifeContext(newContext.lifeContext);
  }, [location.pathname, companionEngine]);

  // Periodic refresh of all runtime data
  useEffect(() => {
    const interval = setInterval(() => {
      setHealthPulse(companionEngine.getHealthPulse());
      lifeEngine.invalidateCache();
      setLifeContext(lifeEngine.buildContext());
      setDailyBriefing(lifeEngine.summarizeDay());
      setManifestSnapshot(manifestGen.getManifestSnapshot());
      setFleetStatus(orchestrator.getFleetStatus());
      setErrorPatrolReport(errorPatrolSvc.getHealthReport());
      setSyncStatus(cloudSyncSvc.getSyncStatus());
      setLearningInsights(selfLearningSvc.getSystemLearnings());
    }, 30_000);
    return () => clearInterval(interval);
  }, [companionEngine, lifeEngine, manifestGen, orchestrator, errorPatrolSvc, cloudSyncSvc, selfLearningSvc]);

  const refreshSuggestions = useCallback(() => {
    setSuggestions(companionEngine.getSuggestions(context));
  }, [companionEngine, context]);

  const dismissSuggestion = useCallback(
    (id: string) => {
      companionEngine.dismissSuggestion(id);
      setSuggestions((prev) => prev.filter((s) => s.id !== id));
    },
    [companionEngine]
  );

  const generateProposals = useCallback(() => {
    proposalEngine.generateContextualProposals(context.module);
    setProposals(proposalEngine.getProposals());
  }, [proposalEngine, context.module]);

  const simulateProposal = useCallback(
    async (id: string) => {
      await proposalEngine.simulate(id);
      setProposals([...proposalEngine.getProposals()]);
    },
    [proposalEngine]
  );

  const approveProposal = useCallback(
    async (id: string) => {
      await proposalEngine.approve(id);
      setProposals([...proposalEngine.getProposals()]);
    },
    [proposalEngine]
  );

  const rejectProposal = useCallback(
    (id: string) => {
      proposalEngine.reject(id);
      setProposals([...proposalEngine.getProposals()]);
    },
    [proposalEngine]
  );

  const executeProposal = useCallback(
    async (id: string) => {
      await proposalEngine.execute(id);
      setProposals([...proposalEngine.getProposals()]);
      // Update manifest after execution
      setManifestSnapshot(manifestGen.getManifestSnapshot());
    },
    [proposalEngine, manifestGen]
  );

  const pendingProposalCount = useMemo(
    () => proposalEngine.getPendingCount(),
    [proposals, proposalEngine]
  );

  const obligations = useMemo(
    () => lifeContext.obligations,
    [lifeContext]
  );

  const processNLP = useCallback(
    (input: string) => nlpCompanion.process(input, context.module),
    [nlpCompanion, context.module]
  );

  const nlpSuggestions = useMemo(
    () => nlpCompanion.getPredictiveSuggestions(context.module),
    [nlpCompanion, context.module]
  );

  return {
    context,
    suggestions,
    healthPulse,
    proposals,
    pendingProposalCount,
    lifeContext,
    dailyBriefing,
    obligations,
    manifestSnapshot,
    fleetStatus,
    errorPatrolReport,
    syncStatus,
    learningInsights,
    dismissSuggestion,
    refreshSuggestions,
    generateProposals,
    simulateProposal,
    approveProposal,
    rejectProposal,
    executeProposal,
    companionEngine,
    proposalEngine,
    nlpCompanion,
    processNLP,
    nlpSuggestions,
  };
}
