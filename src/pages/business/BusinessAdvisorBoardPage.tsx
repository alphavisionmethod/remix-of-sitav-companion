// ═══════════════════════════════════════════════════════════════
// SITA Business OS — Executive Advisor Boardroom
// World-class AI executive operating layer
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useBusinessAdvisorBoard } from "@/hooks/useBusinessAdvisorBoard";

// Board components
import { ExecutiveBriefCard } from "@/components/business/advisor-board/ExecutiveBriefCard";
import { AdvisorPresenceBar } from "@/components/business/advisor-board/AdvisorPresenceBar";
import { BoardroomModuleGrid } from "@/components/business/advisor-board/BoardroomModuleGrid";
import { ActionQueuePanel } from "@/components/business/advisor-board/ActionQueuePanel";
import { AdvisorDetailSheet } from "@/components/business/advisor-board/AdvisorDetailSheet";
import { TrustModeIndicator } from "@/components/business/advisor-board/TrustModeIndicator";
import { ProfitLeakCard } from "@/components/business/advisor-board/ProfitLeakCard";
import { RevenueRecoveryCard } from "@/components/business/advisor-board/RevenueRecoveryCard";
import { BusinessHealthScoreCard } from "@/components/business/advisor-board/BusinessHealthScoreCard";
import { ProofTimelinePanel } from "@/components/business/advisor-board/ProofTimelinePanel";
import { DailyBriefView } from "@/components/business/advisor-board/DailyBriefView";
import { AutonomyLevelControl } from "@/components/business/advisor-board/AutonomyLevelControl";

// Part 2 components
import { MorningExecutiveBrief } from "@/components/business/advisor-board/MorningExecutiveBrief";
import { RevenueRescuePanel } from "@/components/business/advisor-board/RevenueRescuePanel";
import { BusinessArchetypeSelector } from "@/components/business/advisor-board/BusinessArchetypeSelector";
import { AdvisorMemoryInspector } from "@/components/business/advisor-board/AdvisorMemoryInspector";
import { CrossAdvisorReasoningView } from "@/components/business/advisor-board/CrossAdvisorReasoningView";
import { ExecutiveResetMode } from "@/components/business/advisor-board/ExecutiveResetMode";

// Part 3 components
import { AdvisorConversation } from "@/components/business/advisor-board/AdvisorConversation";
import { ScenarioSimulatorPanel } from "@/components/business/advisor-board/ScenarioSimulatorPanel";
import { AdvisorDebateView } from "@/components/business/advisor-board/AdvisorDebateView";
import { WeeklyExecutiveReport } from "@/components/business/advisor-board/WeeklyExecutiveReport";
import { AdvisorNotificationSystem } from "@/components/business/advisor-board/AdvisorNotificationSystem";

// Part 4 components
import { AdvisorToolExecutionPanel } from "@/components/business/advisor-board/AdvisorToolExecutionPanel";
import { BusinessRadarPanel } from "@/components/business/advisor-board/BusinessRadarPanel";
import { StrategicPlanningStudio } from "@/components/business/advisor-board/StrategicPlanningStudio";

// Part 5 components
import { ClientIntelligenceHub } from "@/components/business/advisor-board/ClientIntelligenceHub";
import { AdvisorPerformancePanel } from "@/components/business/advisor-board/AdvisorPerformancePanel";
import { DecisionJournalPanel } from "@/components/business/advisor-board/DecisionJournalPanel";

const BusinessAdvisorBoardPage = () => {
  const board = useBusinessAdvisorBoard();
  const [activeTab, setActiveTab] = useState("boardroom");

  // Merge persistent + in-memory recommendations; persistent takes priority
  const mergedRecommendations = useMemo(() => {
    const persistedMap = new Map(
      (board.persistedRecommendations ?? []).map((r: any) => [r.title, r])
    );
    const merged = [...board.aiRecommendations];
    for (const pr of board.persistedRecommendations ?? []) {
      if (!merged.find(m => m.title === pr.title)) {
        merged.push({
          advisorId: pr.advisor_id,
          title: pr.title,
          summary: pr.summary,
          urgency: pr.urgency_score > 80 ? "critical" : pr.urgency_score > 60 ? "high" : pr.urgency_score > 40 ? "medium" : "low",
          confidence: pr.confidence_score / 100,
          suggestedActions: [],
          riskFlags: [],
          rationale: pr.rationale,
          domain: pr.domain,
          category: pr.category,
        });
      }
    }
    return merged;
  }, [board.aiRecommendations, board.persistedRecommendations]);

  const criticalRecs = mergedRecommendations.filter(r => r.urgency === "critical" || r.urgency === "high");

  // Show Executive Reset if focus mode is active
  if (board.focusModeActive) {
    return (
      <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageTruthBanner />
        <ExecutiveResetMode
          isActive
          overloadScore={board.overloadScore}
          criticalActions={criticalRecs}
          onActivate={() => board.setFocusModeActive(true)}
          onDeactivate={() => board.setFocusModeActive(false)}
          onApproveAction={board.convertToAction}
        />
      </motion.div>
    );
  }

  // Morning Brief mode
  if (board.briefMode === "brief") {
    return (
      <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PageTruthBanner />
        <MorningExecutiveBrief
          brief={board.profitabilityBrief}
          profitSummary={board.profitSummary}
          context={board.businessContext}
          recommendations={board.aiRecommendations}
          onApproveAction={board.convertToAction}
          onDismiss={() => board.setBriefMode("board")}
        />
      </motion.div>
    );
  }

  return (
    <motion.div className="space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <PageTruthBanner />

      {/* ── Overload Detection Banner ─────────────────── */}
      <ExecutiveResetMode
        isActive={false}
        overloadScore={board.overloadScore}
        criticalActions={criticalRecs}
        onActivate={() => board.setFocusModeActive(true)}
        onDeactivate={() => board.setFocusModeActive(false)}
      />

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[hsl(265_55%_58%/0.12)] flex items-center justify-center">
            <Brain className="h-5 w-5 text-[hsl(265_55%_58%)]" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-foreground">Board of Advisors</h1>
            <p className="text-[10px] text-muted-foreground">
              {board.advisors.length} advisors · {mergedRecommendations.length} insights · {board.actionStats.total} actions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-[10px] h-7"
            onClick={() => board.setBriefMode("brief")}
          >
            Morning Brief
          </Button>
          <TrustModeIndicator state={board.trustState} onTogglePause={board.toggleEmergencyPause} />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => board.refetchAI()}
            disabled={board.aiLoading}
          >
            {board.aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* ── Advisor Presence Bar ───────────────────────── */}
      <AdvisorPresenceBar
        advisors={board.advisors}
        recommendations={board.aiRecommendations}
        selectedId={board.selectedAdvisor?.id ?? null}
        onSelect={board.setSelectedAdvisor}
      />

      {/* ── Tab Navigation ─────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[hsl(0_0%_100%/0.03)] border border-[hsl(0_0%_100%/0.06)] flex-wrap h-auto gap-0.5 p-1">
          <TabsTrigger value="boardroom" className="text-[10px]">Boardroom</TabsTrigger>
          <TabsTrigger value="insights" className="text-[10px]">
            Insights {mergedRecommendations.length > 0 && `(${mergedRecommendations.length})`}
          </TabsTrigger>
          <TabsTrigger value="conversation" className="text-[10px]">Chat</TabsTrigger>
          <TabsTrigger value="scenarios" className="text-[10px]">Scenarios</TabsTrigger>
          <TabsTrigger value="debates" className="text-[10px]">Debates</TabsTrigger>
          <TabsTrigger value="actions" className="text-[10px]">
            Actions {board.actionStats.total > 0 && `(${board.actionStats.total})`}
          </TabsTrigger>
          <TabsTrigger value="proof" className="text-[10px]">Proof</TabsTrigger>
          <TabsTrigger value="tools" className="text-[10px]">Tools</TabsTrigger>
          <TabsTrigger value="radar" className="text-[10px]">Radar</TabsTrigger>
          <TabsTrigger value="planning" className="text-[10px]">Planning</TabsTrigger>
          <TabsTrigger value="clients" className="text-[10px]">Clients</TabsTrigger>
          <TabsTrigger value="performance" className="text-[10px]">Performance</TabsTrigger>
          <TabsTrigger value="journal" className="text-[10px]">Journal</TabsTrigger>
          <TabsTrigger value="memory" className="text-[10px]">Memory</TabsTrigger>
          <TabsTrigger value="report" className="text-[10px]">Report</TabsTrigger>
          <TabsTrigger value="autonomy" className="text-[10px]">Autonomy</TabsTrigger>
        </TabsList>

        {/* ── Boardroom Tab ──────────────────────────────── */}
        <TabsContent value="boardroom" className="space-y-4 mt-4">
          <ExecutiveBriefCard brief={board.profitabilityBrief} />

          {board.profitSummary.criticalSignals.length > 0 && (
            <RevenueRescuePanel
              signals={board.profitSummary.criticalSignals}
              totalAtRisk={board.profitSummary.totalAtRisk}
            />
          )}

          <BoardroomModuleGrid
            brief={board.profitabilityBrief}
            recommendations={mergedRecommendations}
            actionQueue={board.actionQueue}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ProfitLeakCard leaks={board.profitabilityBrief.topLeaks} />
            <RevenueRecoveryCard opportunities={board.profitabilityBrief.opportunities} />
          </div>
          <BusinessHealthScoreCard score={board.profitabilityBrief.healthScore} />
        </TabsContent>

        {/* ── Insights Tab (Cross-Advisor Coordinated) ──── */}
        <TabsContent value="insights" className="mt-4">
          {board.aiLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-[hsl(265_55%_58%)]" />
              <span className="ml-3 text-xs text-muted-foreground">Advisors are deliberating...</span>
            </div>
          ) : board.coordinatedRecommendations.length === 0 ? (
            <div className="text-center py-16">
              <Sparkles className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-xs text-muted-foreground">No insights yet</p>
              <Button variant="ghost" size="sm" className="mt-2 text-[10px]" onClick={() => board.refetchAI()}>
                Request Advisor Analysis
              </Button>
            </div>
          ) : (
            <CrossAdvisorReasoningView recommendations={board.coordinatedRecommendations} />
          )}
        </TabsContent>

        {/* ── Conversation Tab ────────────────────────────── */}
        <TabsContent value="conversation" className="mt-4">
          <AdvisorConversation
            selectedAdvisor={board.conversationAdvisor}
            onSelectAdvisor={board.setConversationAdvisor}
            memorySnapshot={board.memorySnapshot}
            businessContext={board.businessContext}
          />
        </TabsContent>

        {/* ── Scenarios Tab ───────────────────────────────── */}
        <TabsContent value="scenarios" className="mt-4">
          <ScenarioSimulatorPanel />
        </TabsContent>

        {/* ── Debates Tab ─────────────────────────────────── */}
        <TabsContent value="debates" className="mt-4">
          <AdvisorDebateView recommendations={mergedRecommendations} />
        </TabsContent>

        {/* ── Actions Tab ────────────────────────────────── */}
        <TabsContent value="actions" className="mt-4">
          <ActionQueuePanel
            actions={board.actionQueue}
            onSimulate={board.handleSimulate}
            onApprove={board.handleApprove}
            onReject={board.handleReject}
            onExecute={board.handleExecute}
            onRollback={board.handleRollback}
          />
        </TabsContent>

        {/* ── Proof Tab ──────────────────────────────────── */}
        <TabsContent value="proof" className="mt-4">
          <ProofTimelinePanel actions={board.actionQueue} />
        </TabsContent>

        {/* ── Tools Tab ──────────────────────────────────── */}
        <TabsContent value="tools" className="mt-4">
          <AdvisorToolExecutionPanel
            tools={board.tools}
            executions={board.toolExecutions}
            stats={board.toolStats}
            onRequestExecution={board.handleToolRequest}
            onApprove={board.handleToolApprove}
            onExecute={board.handleToolExecute}
            onRollback={board.handleToolRollback}
            onCancel={board.handleToolCancel}
          />
        </TabsContent>

        {/* ── Radar Tab ──────────────────────────────────── */}
        <TabsContent value="radar" className="mt-4">
          <BusinessRadarPanel
            snapshot={board.radarSnapshot}
            signals={board.radarSignals}
            onAcknowledge={board.handleRadarAcknowledge}
            onAcknowledgeAll={board.handleRadarAcknowledgeAll}
            onGenerateSignal={board.handleRadarGenerate}
          />
        </TabsContent>

        {/* ── Planning Tab ───────────────────────────────── */}
        <TabsContent value="planning" className="mt-4">
          <StrategicPlanningStudio
            snapshot={board.planningSnapshot}
            strategyDoc={board.strategyDoc}
            onUpdateGoalProgress={board.handleUpdateGoalProgress}
            onUpdateMilestone={board.handleUpdateMilestone}
            onGenerateStrategy={board.handleGenerateStrategy}
          />
        </TabsContent>

        {/* ── Clients Tab ────────────────────────────────── */}
        <TabsContent value="clients" className="mt-4">
          <ClientIntelligenceHub
            snapshot={board.clientSnapshot}
            clients={board.clientList}
            onResolveSignal={board.handleResolveSignal}
          />
        </TabsContent>

        {/* ── Performance Tab ────────────────────────────── */}
        <TabsContent value="performance" className="mt-4">
          <AdvisorPerformancePanel snapshot={board.perfSnapshot} />
        </TabsContent>

        {/* ── Journal Tab ────────────────────────────────── */}
        <TabsContent value="journal" className="mt-4">
          <DecisionJournalPanel
            snapshot={board.journalSnapshot}
            decisions={board.journalDecisions}
            onUpdateOutcome={board.handleUpdateDecisionOutcome}
          />
        </TabsContent>

        {/* ── Memory Tab ─────────────────────────────────── */}
        <TabsContent value="memory" className="mt-4">
          <AdvisorMemoryInspector
            snapshot={board.memorySnapshot}
            onCorrect={board.correctMemory}
            onArchive={board.archiveMemory}
          />
        </TabsContent>

        {/* ── Report Tab ─────────────────────────────────── */}
        <TabsContent value="report" className="mt-4">
          <WeeklyExecutiveReport
            brief={board.profitabilityBrief}
            profitSummary={board.profitSummary}
            reflectionSummary={board.reflectionSummary}
          />
        </TabsContent>

        {/* ── Autonomy Tab ───────────────────────────────── */}
        <TabsContent value="autonomy" className="mt-4 space-y-6">
          <BusinessArchetypeSelector
            selected={board.selectedArchetype}
            onSelect={board.setArchetype}
          />
          <AutonomyLevelControl
            state={board.trustState}
            onDomainChange={board.updateDomainLevel}
            onGlobalChange={board.updateGlobalLevel}
          />
        </TabsContent>
      </Tabs>

      {/* ── Advisor Detail Sheet ─────────────────────────── */}
      <AnimatePresence>
        {board.selectedAdvisor && (
          <AdvisorDetailSheet
            advisor={board.selectedAdvisor}
            recommendation={mergedRecommendations.find(r => r.advisorId === board.selectedAdvisor?.id)}
            onClose={() => board.setSelectedAdvisor(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Proactive Notifications ──────────────────────── */}
      <AdvisorNotificationSystem
        recommendations={mergedRecommendations}
        onAction={board.convertToAction}
      />
    </motion.div>
  );
};

export default BusinessAdvisorBoardPage;