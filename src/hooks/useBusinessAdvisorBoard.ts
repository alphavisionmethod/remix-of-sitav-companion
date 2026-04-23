// ═══════════════════════════════════════════════════════════════
// SITA OS — useBusinessAdvisorBoard Hook (Persistence-Wired)
// Central orchestration with real backend persistence
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BUSINESS_ADVISORS, type AdvisorPersona } from "@/domains/engines/business-advisor-personas";
import { generateProfitabilityBrief, type ProfitabilityBrief } from "@/domains/engines/business-profitability-engine";
import {
  createDefaultTrustState, setDomainLevel, setGlobalLevel, emergencyPause, resumeFromPause,
  canExecute, AUTONOMY_LEVELS,
  type TrustModeState, type AutonomyDomain, type AutonomyLevel,
} from "@/domains/engines/business-autonomy-engine";
import {
  createAction, simulateAction, requestApproval, approveAction, rejectAction, executeAction, rollbackAction,
  getActionStats, getPendingApprovals,
  type BusinessAction,
} from "@/domains/engines/business-action-pipeline";
import { getAdvisorMemoryEngine } from "@/domains/engines/advisor-memory-engine";
import { getAdvisorToolExecutionEngine, ADVISOR_TOOLS } from "@/domains/engines/advisor-tool-execution-engine";
import { getBusinessRadarEngine } from "@/domains/engines/business-radar-engine";
import { getStrategicPlanningEngine } from "@/domains/engines/strategic-planning-engine";
import { getClientIntelligenceEngine } from "@/domains/engines/client-intelligence-engine";
import { getAdvisorPerformanceEngine } from "@/domains/engines/advisor-performance-engine";
import { getDecisionJournalEngine } from "@/domains/engines/decision-journal-engine";
import type { DecisionOutcome } from "@/domains/engines/decision-journal-engine";
import type { MilestoneStatus } from "@/domains/engines/strategic-planning-engine";
import { getBusinessContextGraph } from "@/domains/engines/business-context-graph";
import { getBusinessArchetypeEngine, type BusinessArchetype } from "@/domains/engines/business-archetype-engine";
import { getCrossAdvisorCoordinator } from "@/domains/engines/cross-advisor-coordinator";
import { getConfidenceRiskScorer } from "@/domains/engines/confidence-risk-scorer";
import { getContinuousProfitEngine } from "@/domains/engines/continuous-profit-engine";
import { getAdvisorReflectionEngine } from "@/domains/engines/advisor-reflection-engine";
import { BoardAPI, type BoardRecommendation, type BoardAction as PersistentAction, type AutonomyPolicy } from "@/lib/services/board-api-client";

export interface AIRecommendation {
  advisorId: string;
  title: string;
  summary: string;
  urgency: "low" | "medium" | "high" | "critical";
  confidence: number;
  suggestedActions: string[];
  riskFlags: string[];
  rationale?: string;
  domain?: string;
  category?: string;
  contributingAdvisors?: string[];
  confidenceProfile?: Record<string, number>;
  dataGaps?: string[];
  estimatedImpactCents?: number;
  timeHorizon?: string;
  actionPlan?: {
    steps: Array<{ order: number; description: string; requiresApproval: boolean; estimatedMinutes: number; toolCategory: string }>;
    totalSteps: number;
    canAutoExecute: boolean;
    riskTier: string;
  };
}

export interface PipelineReceipt {
  pipelineVersion: string;
  layers: number;
  signalsDetected: number;
  signalsCritical: number;
  recommendationsGenerated: number;
  recommendationsPersisted: number;
  disagreements: number;
  activeAdvisors: number;
  archetype: string;
  hadRealData: boolean;
  dataSources: string[];
  modelsUsed: string[];
  elapsedMs: number;
  timestamp: string;
}

export interface AdvisorDisagreement {
  topic: string;
  advisorA: string;
  positionA: string;
  advisorB: string;
  positionB: string;
  resolution?: string;
}

export interface CognitivePipelineResult {
  recommendations: AIRecommendation[];
  boardSummary: string;
  topPriority: string;
  executiveSummary: string;
  disagreements: AdvisorDisagreement[];
  signals: Array<{ type: string; severity: string; domain: string; summary: string; priority: number }>;
  receipt: PipelineReceipt;
}

// ── Demo context for profitability engine ─────────────────────
const CONTEXT = {
  leads: [
    { id: "l1", name: "David Chen", value: 17000, lastActivity: 3, status: "active" },
    { id: "l2", name: "Rachel Adams", value: 28000, lastActivity: 18, status: "active" },
    { id: "l3", name: "Lisa Park", value: 6400, lastActivity: 38, status: "active" },
    { id: "l4", name: "James Morton", value: 15000, lastActivity: 45, status: "active" },
  ],
  invoices: [
    { id: "i1", amount: 12500, status: "overdue", daysOverdue: 15, customer: "Atlas Corp" },
    { id: "i2", amount: 8400, status: "overdue", daysOverdue: 7, customer: "Meridian LLC" },
    { id: "i3", amount: 3200, status: "paid", daysOverdue: 0, customer: "Nova Inc" },
  ],
  quotes: [
    { id: "q1", value: 24000, daysSinceSent: 12, status: "sent" },
    { id: "q2", value: 8500, daysSinceSent: 3, status: "sent" },
  ],
  upcomingBills: [
    { amount: 2400, dueDate: "2026-04-18" },
    { amount: 1800, dueDate: "2026-04-22" },
    { amount: 950, dueDate: "2026-04-25" },
  ],
  overdueReceivables: [
    { amount: 12500, customer: "Atlas Corp", daysOverdue: 15 },
    { amount: 8400, customer: "Meridian LLC", daysOverdue: 7 },
  ],
  currentBalance: 45000,
  monthlyBurn: 18000,
  totalTasks: 34,
  overdueTasks: 6,
  teamMembers: 3,
  blockedWorkflows: 2,
  clients: [
    { name: "Atlas Corp", lastContact: 15, value: 48000, satisfaction: 72 },
    { name: "Meridian LLC", lastContact: 28, value: 36000, satisfaction: 55 },
    { name: "Nova Inc", lastContact: 5, value: 24000, satisfaction: 90 },
    { name: "Cascade Group", lastContact: 35, value: 18000 },
  ],
  topClients: [
    { name: "Atlas Corp", revenue: 48000, potential: 72000 },
    { name: "Nova Inc", revenue: 24000, potential: 36000 },
  ],
  leadSources: [
    { name: "Referrals", leads: 12, conversion: 0.45 },
    { name: "Website", leads: 28, conversion: 0.15 },
    { name: "LinkedIn", leads: 8, conversion: 0.35 },
  ],
};

export function useBusinessAdvisorBoard() {
  const queryClient = useQueryClient();
  const [trustState, setTrustState] = useState<TrustModeState>(createDefaultTrustState);
  const [actionQueue, setActionQueue] = useState<BusinessAction[]>([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState<AdvisorPersona | null>(null);
  const [focusModeActive, setFocusModeActive] = useState(false);
  const [briefMode, setBriefMode] = useState<"brief" | "board">("board");

  // ── Engine singletons (local computation) ─────────────────
  const memoryEngine = useMemo(() => getAdvisorMemoryEngine(), []);
  const contextGraph = useMemo(() => getBusinessContextGraph(), []);
  const archetypeEngine = useMemo(() => getBusinessArchetypeEngine(), []);
  const coordinator = useMemo(() => getCrossAdvisorCoordinator(), []);
  const confidenceScorer = useMemo(() => getConfidenceRiskScorer(), []);
  const profitEngine = useMemo(() => getContinuousProfitEngine(), []);
  const reflectionEngine = useMemo(() => getAdvisorReflectionEngine(), []);

  const profitabilityBrief = useMemo<ProfitabilityBrief>(
    () => generateProfitabilityBrief(CONTEXT), []
  );

  const memorySnapshot = useMemo(() => memoryEngine.getMemorySnapshot(), [memoryEngine]);
  const businessContext = useMemo(() => contextGraph.getBusinessSnapshot(), [contextGraph]);
  const profitSummary = useMemo(() => profitEngine.getSummary(), [profitEngine]);
  const selectedArchetype = archetypeEngine.getSelectedArchetype();

  // ── PERSISTENT: Boardroom Summary ─────────────────────────
  const boardSummary = useQuery({
    queryKey: ["board-summary"],
    queryFn: () => BoardAPI.getSummary(),
    staleTime: 2 * 60 * 1000,
    retry: 1,
    meta: { silent: true },
  });

  // ── PERSISTENT: Recommendations from DB ───────────────────
  const persistedRecs = useQuery({
    queryKey: ["board-recommendations"],
    queryFn: () => BoardAPI.listRecommendations("new", 50),
    staleTime: 2 * 60 * 1000,
    retry: 1,
    meta: { silent: true },
  });

  // ── PERSISTENT: Health Scores ─────────────────────────────
  const healthScores = useQuery({
    queryKey: ["board-health"],
    queryFn: () => BoardAPI.getHealth(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    meta: { silent: true },
  });

  // ── PERSISTENT: Profit Signals ────────────────────────────
  const persistedProfitSignals = useQuery({
    queryKey: ["board-profit-signals"],
    queryFn: () => BoardAPI.listProfitSignals(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    meta: { silent: true },
  });

  // ── PERSISTENT: Autonomy Policies ─────────────────────────
  const autonomyPolicies = useQuery({
    queryKey: ["board-autonomy"],
    queryFn: () => BoardAPI.getAutonomy(),
    staleTime: 10 * 60 * 1000,
    retry: 1,
    meta: { silent: true },
  });

  // ── AI Recommendations (cognitive pipeline) ────────────────
  const cognitivePipeline = useQuery({
    queryKey: ["business-advisor-deep-intelligence"],
    queryFn: async (): Promise<CognitivePipelineResult> => {
      const { data, error } = await supabase.functions.invoke("advisor-deep-intelligence", {
        body: {
          advisorIds: BUSINESS_ADVISORS.map(a => a.id),
          businessContext: contextGraph.toPromptContext(),
          memorySnapshot: {
            totalItems: memorySnapshot.totalItems,
            longTerm: memorySnapshot.longTerm.map(m => m.content).slice(0, 5),
            preferences: memorySnapshot.preference.map(m => m.content).slice(0, 3),
          },
          archetype: selectedArchetype,
        },
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["board-recommendations"] });
      return {
        recommendations: data?.recommendations ?? [],
        boardSummary: data?.boardSummary ?? "",
        topPriority: data?.topPriority ?? "",
        executiveSummary: data?.executiveSummary ?? "",
        disagreements: data?.disagreements ?? [],
        signals: data?.signals ?? [],
        receipt: data?.receipt ?? {},
      };
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const aiRecommendations = useMemo(() => ({
    data: cognitivePipeline.data?.recommendations ?? [],
    isLoading: cognitivePipeline.isLoading,
    error: cognitivePipeline.error,
    refetch: cognitivePipeline.refetch,
  }), [cognitivePipeline]);

  // ── Mutation: Update recommendation status ─────────────────
  const updateRecMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      BoardAPI.updateRecommendation(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-recommendations"] });
      queryClient.invalidateQueries({ queryKey: ["board-summary"] });
    },
  });

  // ── Mutation: Create persisted action ──────────────────────
  const createActionMutation = useMutation({
    mutationFn: (payload: Partial<PersistentAction>) => BoardAPI.createAction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-summary"] });
    },
  });

  // ── Mutation: Store memory ─────────────────────────────────
  const storeMemoryMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => BoardAPI.storeMemory(payload),
  });

  // ── Mutation: Autonomy update ──────────────────────────────
  const upsertAutonomyMutation = useMutation({
    mutationFn: (payload: Partial<AutonomyPolicy>) => BoardAPI.upsertAutonomy(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-autonomy"] });
    },
  });

  // ── Coordinated recommendations ──────────────────────────────
  const coordinatedRecommendations = useMemo(
    () => coordinator.coordinate(aiRecommendations.data ?? []),
    [coordinator, aiRecommendations.data]
  );

  const escalationBundle = useMemo(
    () => coordinator.buildEscalationBundle(coordinatedRecommendations),
    [coordinator, coordinatedRecommendations]
  );

  // ── Overload detection ───────────────────────────────────────
  const overloadScore = useMemo(() => {
    const recs = aiRecommendations.data ?? [];
    const critical = recs.filter(r => r.urgency === "critical" || r.urgency === "high").length;
    const pending = getPendingApprovals(actionQueue).length;
    return Math.min(100, critical * 15 + pending * 10 + (profitSummary.unresolvedSignals > 5 ? 20 : 0));
  }, [aiRecommendations.data, actionQueue, profitSummary]);

  // ── Realtime subscriptions ─────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("board-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "advisor_board_recommendations" }, () => {
        queryClient.invalidateQueries({ queryKey: ["board-recommendations"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "advisor_board_actions" }, () => {
        queryClient.invalidateQueries({ queryKey: ["board-summary"] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  // ── Trust/Autonomy controls ──────────────────────────────────
  const updateDomainLevel = useCallback((domain: AutonomyDomain, level: AutonomyLevel) => {
    setTrustState(prev => setDomainLevel(prev, domain, level));
    upsertAutonomyMutation.mutate({ domain, autonomy_level: level });
    toast.success(`${domain} autonomy set to Level ${level} — ${AUTONOMY_LEVELS[level].label}`);
  }, [upsertAutonomyMutation]);

  const updateGlobalLevel = useCallback((level: AutonomyLevel) => {
    setTrustState(prev => setGlobalLevel(prev, level));
    upsertAutonomyMutation.mutate({ domain: "global", autonomy_level: level });
    toast.success(`Global autonomy set to Level ${level} — ${AUTONOMY_LEVELS[level].label}`);
  }, [upsertAutonomyMutation]);

  const toggleEmergencyPause = useCallback(() => {
    const isPaused = trustState.emergencyPaused;
    setTrustState(prev =>
      prev.emergencyPaused ? resumeFromPause(prev) : emergencyPause(prev, "Manual emergency pause")
    );
    if (isPaused) {
      BoardAPI.resume().catch(() => {});
      toast.success("Automation resumed");
    } else {
      BoardAPI.emergencyStop().catch(() => {});
      toast.warning("Emergency pause activated");
    }
  }, [trustState.emergencyPaused]);

  // ── Action Pipeline ──────────────────────────────────────────
  const proposeAction = useCallback((params: Parameters<typeof createAction>[0]) => {
    const action = createAction(params);
    setActionQueue(prev => [action, ...prev]);
    // Persist to backend
    createActionMutation.mutate({
      advisor_id: params.advisorId,
      title: params.title,
      description: params.description,
      domain: params.domain,
      risk_tier: params.riskLevel === "critical" ? "critical" : params.riskLevel,
      confidence: params.confidence,
    });
    toast.info(`New action proposed: ${action.title}`);
    return action;
  }, [createActionMutation]);

  const handleSimulate = useCallback((actionId: string) => {
    setActionQueue(prev => prev.map(a => a.id === actionId ? simulateAction(a) : a));
    toast.info("Simulation complete");
  }, []);

  const handleRequestApproval = useCallback((actionId: string) => {
    setActionQueue(prev => prev.map(a => a.id === actionId ? requestApproval(a) : a));
  }, []);

  const handleApprove = useCallback((actionId: string) => {
    setActionQueue(prev => prev.map(a => a.id === actionId ? approveAction(a, "owner") : a));
    toast.success("Action approved");
  }, []);

  const handleReject = useCallback((actionId: string, reason: string) => {
    setActionQueue(prev => prev.map(a => a.id === actionId ? rejectAction(a, reason) : a));
    toast.info("Action rejected");
  }, []);

  const handleExecute = useCallback((actionId: string) => {
    setActionQueue(prev => prev.map(a => a.id === actionId ? executeAction(a) : a));
    toast.success("Action executed with proof");
  }, []);

  const handleRollback = useCallback((actionId: string) => {
    setActionQueue(prev => prev.map(a => a.id === actionId ? rollbackAction(a) : a));
    toast.info("Action rolled back");
  }, []);

  // ── Convert AI recommendation to action ──────────────────────
  const convertToAction = useCallback((rec: AIRecommendation) => {
    const advisor = BUSINESS_ADVISORS.find(a => a.id === rec.advisorId);
    reflectionEngine.recordAction({
      advisorId: rec.advisorId,
      recommendationTitle: rec.title,
      ownerAction: "approved",
      confidenceAtTime: rec.confidence,
    });
    // Record reflection to backend
    BoardAPI.recordReflection({
      advisor_id: rec.advisorId,
      owner_action: "approved",
      owner_feedback: `Converted to action: ${rec.title}`,
    }).catch(() => {});

    return proposeAction({
      advisorId: rec.advisorId,
      advisorName: advisor?.displayName ?? rec.advisorId,
      title: rec.title,
      description: rec.summary,
      domain: advisor?.domainScope[0] ?? "general",
      riskLevel: rec.urgency === "critical" ? "high" : rec.urgency === "high" ? "medium" : "low",
      estimatedImpact: rec.suggestedActions[0] ?? "Improve business operations",
      estimatedValue: 0,
      confidence: rec.confidence,
    });
  }, [proposeAction, reflectionEngine]);

  // ── Archetype selection ──────────────────────────────────────
  const setArchetype = useCallback((archetype: BusinessArchetype) => {
    archetypeEngine.setArchetype(archetype);
    memoryEngine.store({
      layer: "long-term",
      advisorId: null,
      category: "business-type",
      content: `Business archetype set to: ${archetype}`,
      source: "owner-input",
      tags: ["archetype"],
    });
    // Persist to backend
    storeMemoryMutation.mutate({
      advisor_id: "system",
      memory_layer: "long_term",
      category: "business-type",
      content: `Business archetype set to: ${archetype}`,
      importance: 0.9,
    });
    toast.success(`Business type set to ${archetype}`);
  }, [archetypeEngine, memoryEngine, storeMemoryMutation]);

  // ── Memory operations ────────────────────────────────────────
  const correctMemory = useCallback((id: string, field: "content" | "confidence", newValue: unknown, reason: string) => {
    memoryEngine.correctMemory(id, field, newValue, reason);
    toast.success("Memory corrected");
  }, [memoryEngine]);

  const archiveMemory = useCallback((id: string) => {
    memoryEngine.archiveMemory(id);
    BoardAPI.archiveMemory(id).catch(() => {});
    toast.info("Memory archived");
  }, [memoryEngine]);

  // ── Reflection summary ─────────────────────────────────────────
  const reflectionSummary = useMemo(
    () => reflectionEngine.generateWeeklySummary(BUSINESS_ADVISORS.map(a => a.id)),
    [reflectionEngine]
  );

  const [conversationAdvisor, setConversationAdvisor] = useState<AdvisorPersona | null>(null);

  // ── Part 4 Engine singletons ─────────────────────────────────
  const toolEngine = useMemo(() => getAdvisorToolExecutionEngine(), []);
  const radarEngine = useMemo(() => getBusinessRadarEngine(), []);
  const planningEngine = useMemo(() => getStrategicPlanningEngine(), []);

  // ── Part 5 Engine singletons ─────────────────────────────────
  const clientEngine = useMemo(() => getClientIntelligenceEngine(), []);
  const perfEngine = useMemo(() => getAdvisorPerformanceEngine(), []);
  const journalEngine = useMemo(() => getDecisionJournalEngine(), []);

  // Part 4 state
  const [toolExecutions, setToolExecutions] = useState(toolEngine.getAllExecutions());
  const [radarSignals, setRadarSignals] = useState(radarEngine.getSignals());
  const [radarSnapshot, setRadarSnapshot] = useState(radarEngine.getSnapshot());
  const [planningSnapshot, setPlanningSnapshot] = useState(planningEngine.getSnapshot());
  const [strategyDoc, setStrategyDoc] = useState(planningEngine.generateStrategyDocument());

  // Part 5 state
  const clientSnapshot = useMemo(() => clientEngine.getSnapshot(), [clientEngine]);
  const clientList = useMemo(() => clientEngine.getClients(), [clientEngine]);
  const perfSnapshot = useMemo(() => perfEngine.getSnapshot(), [perfEngine]);
  const journalSnapshot = useMemo(() => journalEngine.getSnapshot(), [journalEngine]);
  const journalDecisions = useMemo(() => journalEngine.getDecisions(), [journalEngine]);

  const refreshToolState = useCallback(() => setToolExecutions(toolEngine.getAllExecutions()), [toolEngine]);
  const refreshRadar = useCallback(() => { setRadarSignals(radarEngine.getSignals()); setRadarSnapshot(radarEngine.getSnapshot()); }, [radarEngine]);

  const handleToolApprove = useCallback((id: string) => { toolEngine.approve(id); toolEngine.execute(id); refreshToolState(); toast.success("Tool execution approved & executed"); }, [toolEngine, refreshToolState]);
  const handleToolExecute = useCallback((id: string) => { toolEngine.execute(id); refreshToolState(); toast.success("Tool executed"); }, [toolEngine, refreshToolState]);
  const handleToolRollback = useCallback((id: string) => { toolEngine.rollback(id); refreshToolState(); toast.info("Tool execution rolled back"); }, [toolEngine, refreshToolState]);
  const handleToolCancel = useCallback((id: string) => { toolEngine.cancel(id); refreshToolState(); toast.info("Tool execution cancelled"); }, [toolEngine, refreshToolState]);
  const handleToolRequest = useCallback((toolId: string, advisorId: string, params: Record<string, unknown>) => {
    const advisor = BUSINESS_ADVISORS.find(a => a.id === advisorId);
    toolEngine.requestExecution({ toolId, advisorId, advisorName: advisor?.displayName ?? advisorId, parameters: params, confidence: 0.85, impactSummary: "Advisor-initiated action" });
    refreshToolState();
    // Persist to backend
    BoardAPI.recordToolExecution({
      advisor_id: advisorId,
      tool_category: "advisor",
      tool_name: toolId,
      operation: "execute",
      parameters: params,
    }).catch(() => {});
    toast.info("Tool execution requested");
  }, [toolEngine, refreshToolState]);

  const handleRadarAcknowledge = useCallback((id: string) => { radarEngine.acknowledge(id); refreshRadar(); }, [radarEngine, refreshRadar]);
  const handleRadarAcknowledgeAll = useCallback(() => { radarEngine.acknowledgeAll(); refreshRadar(); }, [radarEngine, refreshRadar]);
  const handleRadarGenerate = useCallback(() => { radarEngine.generateSignal(); refreshRadar(); toast.info("New signal detected"); }, [radarEngine, refreshRadar]);

  const handleUpdateGoalProgress = useCallback((goalId: string, progress: number) => { planningEngine.updateGoalProgress(goalId, progress); setPlanningSnapshot(planningEngine.getSnapshot()); }, [planningEngine]);
  const handleUpdateMilestone = useCallback((id: string, status: MilestoneStatus) => { planningEngine.updateMilestoneStatus(id, status); setPlanningSnapshot(planningEngine.getSnapshot()); toast.success("Milestone updated"); }, [planningEngine]);
  const handleGenerateStrategy = useCallback(() => { setStrategyDoc(planningEngine.generateStrategyDocument()); toast.success("Strategy document generated"); }, [planningEngine]);

  const handleResolveSignal = useCallback((clientId: string, signalId: string) => {
    clientEngine.resolveSignal(clientId, signalId);
    toast.success("Signal resolved");
  }, [clientEngine]);

  const handleUpdateDecisionOutcome = useCallback((id: string, outcome: DecisionOutcome, actualOutcome: string, impact: number, lessons: string) => {
    journalEngine.updateOutcome(id, outcome, actualOutcome, impact, lessons);
    toast.success("Decision outcome updated");
  }, [journalEngine]);

  return {
    // Advisors
    advisors: BUSINESS_ADVISORS,
    selectedAdvisor,
    setSelectedAdvisor,

    // AI Intelligence
    aiRecommendations: aiRecommendations.data,
    aiLoading: aiRecommendations.isLoading,
    aiError: aiRecommendations.error,
    refetchAI: aiRecommendations.refetch,

    // Cognitive Pipeline (Phase 3)
    pipelineResult: cognitivePipeline.data ?? null,
    boardSummary: cognitivePipeline.data?.boardSummary ?? "",
    topPriority: cognitivePipeline.data?.topPriority ?? "",
    executiveSummary: cognitivePipeline.data?.executiveSummary ?? "",
    advisorDisagreements: cognitivePipeline.data?.disagreements ?? [],
    businessSignals: cognitivePipeline.data?.signals ?? [],
    pipelineReceipt: cognitivePipeline.data?.receipt ?? null,

    // Profitability
    profitabilityBrief,

    // Trust/Autonomy
    trustState,
    updateDomainLevel,
    updateGlobalLevel,
    toggleEmergencyPause,
    canExecute: (domain: AutonomyDomain, risk: "low" | "medium" | "high" | "critical") =>
      canExecute(trustState, domain, risk),

    // Action Pipeline
    actionQueue,
    actionStats: getActionStats(actionQueue),
    pendingApprovals: getPendingApprovals(actionQueue),
    proposeAction,
    convertToAction,
    handleSimulate,
    handleRequestApproval,
    handleApprove,
    handleReject,
    handleExecute,
    handleRollback,

    // Part 2: Deep Intelligence
    memorySnapshot,
    businessContext,
    profitSummary,
    coordinatedRecommendations,
    escalationBundle,
    overloadScore,
    selectedArchetype,
    setArchetype,
    correctMemory,
    archiveMemory,
    focusModeActive,
    setFocusModeActive,
    briefMode,
    setBriefMode,
    reflectionEngine,

    // Part 3: Executive Experience
    reflectionSummary,
    conversationAdvisor,
    setConversationAdvisor,

    // Part 4: Tool Execution + Radar + Planning
    tools: ADVISOR_TOOLS,
    toolExecutions,
    toolStats: toolEngine.getStats(),
    handleToolApprove,
    handleToolExecute,
    handleToolRollback,
    handleToolCancel,
    handleToolRequest,
    radarSignals,
    radarSnapshot,
    handleRadarAcknowledge,
    handleRadarAcknowledgeAll,
    handleRadarGenerate,
    planningSnapshot,
    strategyDoc,
    handleUpdateGoalProgress,
    handleUpdateMilestone,
    handleGenerateStrategy,

    // Part 5: Client Intelligence + Performance + Decision Journal
    clientSnapshot,
    clientList,
    perfSnapshot,
    journalSnapshot,
    journalDecisions,
    handleResolveSignal,
    handleUpdateDecisionOutcome,

    // NEW: Persistent Backend Data
    boardSummaryData: boardSummary.data,
    boardSummaryLoading: boardSummary.isLoading,
    persistedRecommendations: persistedRecs.data?.recommendations ?? [],
    healthScoresData: healthScores.data?.scores ?? [],
    persistedProfitSignals: persistedProfitSignals.data?.signals ?? [],
    autonomyPoliciesData: autonomyPolicies.data?.policies ?? [],
    updateRecommendationStatus: (id: string, status: string, notes?: string) =>
      updateRecMutation.mutate({ id, status, notes }),
  };
}
