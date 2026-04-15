// ═══════════════════════════════════════════════════════════════
// SITA OS — useBusinessAdvisorBoard Hook
// Central orchestration for the Business Advisor Board
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BUSINESS_ADVISORS, type AdvisorPersona } from "@/lib/engines/business-advisor-personas";
import { generateProfitabilityBrief, type ProfitabilityBrief } from "@/lib/engines/business-profitability-engine";
import {
  createDefaultTrustState, setDomainLevel, setGlobalLevel, emergencyPause, resumeFromPause,
  canExecute, AUTONOMY_LEVELS,
  type TrustModeState, type AutonomyDomain, type AutonomyLevel,
} from "@/lib/engines/business-autonomy-engine";
import {
  createAction, simulateAction, requestApproval, approveAction, rejectAction, executeAction, rollbackAction,
  getActionStats, getPendingApprovals,
  type BusinessAction,
} from "@/lib/engines/business-action-pipeline";
// Part 2 imports
import { getAdvisorMemoryEngine } from "@/lib/engines/advisor-memory-engine";
// Part 4 imports
import { getAdvisorToolExecutionEngine, ADVISOR_TOOLS } from "@/lib/engines/advisor-tool-execution-engine";
import { getBusinessRadarEngine } from "@/lib/engines/business-radar-engine";
import { getStrategicPlanningEngine } from "@/lib/engines/strategic-planning-engine";
import type { MilestoneStatus } from "@/lib/engines/strategic-planning-engine";
import { getBusinessContextGraph } from "@/lib/engines/business-context-graph";
import { getBusinessArchetypeEngine, type BusinessArchetype } from "@/lib/engines/business-archetype-engine";
import { getCrossAdvisorCoordinator } from "@/lib/engines/cross-advisor-coordinator";
import { getConfidenceRiskScorer } from "@/lib/engines/confidence-risk-scorer";
import { getContinuousProfitEngine } from "@/lib/engines/continuous-profit-engine";
import { getAdvisorReflectionEngine } from "@/lib/engines/advisor-reflection-engine";

export interface AIRecommendation {
  advisorId: string;
  title: string;
  summary: string;
  urgency: "low" | "medium" | "high" | "critical";
  confidence: number;
  suggestedActions: string[];
  riskFlags: string[];
}

// ── Demo context for profitability engine ─────────────────────
const DEMO_CONTEXT = {
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
  const [trustState, setTrustState] = useState<TrustModeState>(createDefaultTrustState);
  const [actionQueue, setActionQueue] = useState<BusinessAction[]>([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState<AdvisorPersona | null>(null);
  const [focusModeActive, setFocusModeActive] = useState(false);
  const [briefMode, setBriefMode] = useState<"brief" | "board">("board");

  // ── Part 2 Engine singletons ─────────────────────────────────
  const memoryEngine = useMemo(() => getAdvisorMemoryEngine(), []);
  const contextGraph = useMemo(() => getBusinessContextGraph(), []);
  const archetypeEngine = useMemo(() => getBusinessArchetypeEngine(), []);
  const coordinator = useMemo(() => getCrossAdvisorCoordinator(), []);
  const confidenceScorer = useMemo(() => getConfidenceRiskScorer(), []);
  const profitEngine = useMemo(() => getContinuousProfitEngine(), []);
  const reflectionEngine = useMemo(() => getAdvisorReflectionEngine(), []);

  // ── Profitability Brief ──────────────────────────────────────
  const profitabilityBrief = useMemo<ProfitabilityBrief>(
    () => generateProfitabilityBrief(DEMO_CONTEXT),
    []
  );

  // ── Part 2 computed state ────────────────────────────────────
  const memorySnapshot = useMemo(() => memoryEngine.getMemorySnapshot(), [memoryEngine]);
  const businessContext = useMemo(() => contextGraph.getBusinessSnapshot(), [contextGraph]);
  const profitSummary = useMemo(() => profitEngine.getSummary(), [profitEngine]);
  const selectedArchetype = archetypeEngine.getSelectedArchetype();

  // ── AI Recommendations (upgraded to deep intelligence) ───────
  const aiRecommendations = useQuery({
    queryKey: ["business-advisor-deep-intelligence"],
    queryFn: async (): Promise<AIRecommendation[]> => {
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
      return data?.recommendations ?? [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
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

  // ── Trust/Autonomy controls ──────────────────────────────────
  const updateDomainLevel = useCallback((domain: AutonomyDomain, level: AutonomyLevel) => {
    setTrustState(prev => setDomainLevel(prev, domain, level));
    toast.success(`${domain} autonomy set to Level ${level} — ${AUTONOMY_LEVELS[level].label}`);
  }, []);

  const updateGlobalLevel = useCallback((level: AutonomyLevel) => {
    setTrustState(prev => setGlobalLevel(prev, level));
    toast.success(`Global autonomy set to Level ${level} — ${AUTONOMY_LEVELS[level].label}`);
  }, []);

  const toggleEmergencyPause = useCallback(() => {
    setTrustState(prev =>
      prev.emergencyPaused ? resumeFromPause(prev) : emergencyPause(prev, "Manual emergency pause")
    );
    toast[trustState.emergencyPaused ? "success" : "warning"](
      trustState.emergencyPaused ? "Automation resumed" : "Emergency pause activated"
    );
  }, [trustState.emergencyPaused]);

  // ── Action Pipeline ──────────────────────────────────────────
  const proposeAction = useCallback((params: Parameters<typeof createAction>[0]) => {
    const action = createAction(params);
    setActionQueue(prev => [action, ...prev]);
    toast.info(`New action proposed: ${action.title}`);
    return action;
  }, []);

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
    toast.success(`Business type set to ${archetype}`);
  }, [archetypeEngine, memoryEngine]);

  // ── Memory operations ────────────────────────────────────────
  const correctMemory = useCallback((id: string, field: "content" | "confidence", newValue: unknown, reason: string) => {
    memoryEngine.correctMemory(id, field, newValue, reason);
    toast.success("Memory corrected");
  }, [memoryEngine]);

  const archiveMemory = useCallback((id: string) => {
    memoryEngine.archiveMemory(id);
    toast.info("Memory archived");
  }, [memoryEngine]);

  // ── Reflection summary ─────────────────────────────────────────
  const reflectionSummary = useMemo(
    () => reflectionEngine.generateWeeklySummary(BUSINESS_ADVISORS.map(a => a.id)),
    [reflectionEngine]
  );

  // ── Conversation advisor ────────────────────────────────────────
  const [conversationAdvisor, setConversationAdvisor] = useState<AdvisorPersona | null>(null);

  // ── Part 4 Engine singletons ─────────────────────────────────
  const toolEngine = useMemo(() => getAdvisorToolExecutionEngine(), []);
  const radarEngine = useMemo(() => getBusinessRadarEngine(), []);
  const planningEngine = useMemo(() => getStrategicPlanningEngine(), []);

  // Part 4 state
  const [toolExecutions, setToolExecutions] = useState(toolEngine.getAllExecutions());
  const [radarSignals, setRadarSignals] = useState(radarEngine.getSignals());
  const [radarSnapshot, setRadarSnapshot] = useState(radarEngine.getSnapshot());
  const [planningSnapshot, setPlanningSnapshot] = useState(planningEngine.getSnapshot());
  const [strategyDoc, setStrategyDoc] = useState(planningEngine.generateStrategyDocument());

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
    toast.info("Tool execution requested");
  }, [toolEngine, refreshToolState]);

  const handleRadarAcknowledge = useCallback((id: string) => { radarEngine.acknowledge(id); refreshRadar(); }, [radarEngine, refreshRadar]);
  const handleRadarAcknowledgeAll = useCallback(() => { radarEngine.acknowledgeAll(); refreshRadar(); }, [radarEngine, refreshRadar]);
  const handleRadarGenerate = useCallback(() => { radarEngine.generateSignal(); refreshRadar(); toast.info("New signal detected"); }, [radarEngine, refreshRadar]);

  const handleUpdateGoalProgress = useCallback((goalId: string, progress: number) => { planningEngine.updateGoalProgress(goalId, progress); setPlanningSnapshot(planningEngine.getSnapshot()); }, [planningEngine]);
  const handleUpdateMilestone = useCallback((id: string, status: MilestoneStatus) => { planningEngine.updateMilestoneStatus(id, status); setPlanningSnapshot(planningEngine.getSnapshot()); toast.success("Milestone updated"); }, [planningEngine]);
  const handleGenerateStrategy = useCallback(() => { setStrategyDoc(planningEngine.generateStrategyDocument()); toast.success("Strategy document generated"); }, [planningEngine]);

  return {
    // Advisors
    advisors: BUSINESS_ADVISORS,
    selectedAdvisor,
    setSelectedAdvisor,

    // AI Intelligence
    aiRecommendations: aiRecommendations.data ?? [],
    aiLoading: aiRecommendations.isLoading,
    aiError: aiRecommendations.error,
    refetchAI: aiRecommendations.refetch,

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
  };
}
