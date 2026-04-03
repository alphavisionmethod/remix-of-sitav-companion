// ═══════════════════════════════════════════════════════════════
// SITA OS — Proactive Notification System (Enhanced)
// Fires toast alerts for anomalies, proposals, patrol issues,
// learning milestones, self-healing events, and agent lifecycle
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useCompanion } from "./use-companion";

type NotificationRecord = {
  key: string;
  firedAt: number;
};

const COOLDOWN_MS = 60_000;
const MAX_HISTORY = 200;

export function useProactiveNotifications() {
  const {
    errorPatrolReport,
    fleetStatus,
    learningInsights,
    suggestions,
    pendingProposalCount,
    syncStatus,
    healthPulse,
    companionEngine,
  } = useCompanion();

  const historyRef = useRef<NotificationRecord[]>([]);
  const prevFleetRef = useRef({ error: 0, paused: 0, active: 0 });
  const prevPatrolRef = useRef({ criticalIssues: 0, openIssues: 0 });

  const shouldFire = (key: string): boolean => {
    const now = Date.now();
    const existing = historyRef.current.find((r) => r.key === key);
    if (existing && now - existing.firedAt < COOLDOWN_MS) return false;

    historyRef.current = [
      ...historyRef.current.filter((r) => r.key !== key),
      { key, firedAt: now },
    ].slice(-MAX_HISTORY);

    return true;
  };

  // ── Error Patrol Alerts ──────────────────────────────────────
  useEffect(() => {
    if (errorPatrolReport.criticalIssues > 0 && shouldFire("patrol-critical")) {
      toast.error("🔴 Critical Issue Detected", {
        description: `Error Patrol found ${errorPatrolReport.criticalIssues} critical issue(s). Auto-fix rate: ${(errorPatrolReport.autoFixRate * 100).toFixed(0)}%`,
        duration: 10000,
      });
    }

    if (errorPatrolReport.overallHealth === "degraded" && shouldFire("patrol-degraded")) {
      toast.warning("⚠️ System Health Degraded", {
        description: `${errorPatrolReport.openIssues} open issue(s). Self-healing engine investigating.`,
        duration: 7000,
      });
    }

    if (errorPatrolReport.regressionCount > 0 && shouldFire("patrol-regression")) {
      toast.warning("📉 Performance Regression", {
        description: `${errorPatrolReport.regressionCount} regression(s) detected. Baselines recalibrating.`,
        duration: 7000,
      });
    }

    // Auto-fix success notification
    if (errorPatrolReport.autoFixRate > 0 && errorPatrolReport.openIssues === 0 &&
        prevPatrolRef.current.openIssues > 0 && shouldFire("patrol-autofixed")) {
      toast.success("🔧 Issues Auto-Resolved", {
        description: `Self-healing engine resolved all ${prevPatrolRef.current.openIssues} issue(s) automatically.`,
        duration: 6000,
      });
    }

    prevPatrolRef.current = { criticalIssues: errorPatrolReport.criticalIssues, openIssues: errorPatrolReport.openIssues };
  }, [errorPatrolReport]);

  // ── Fleet Status & Agent Lifecycle ───────────────────────────
  useEffect(() => {
    // New errors
    if (fleetStatus.error > prevFleetRef.current.error && shouldFire(`fleet-errors-${fleetStatus.error}`)) {
      const newErrors = fleetStatus.error - prevFleetRef.current.error;
      toast.error(`🤖 ${newErrors} Agent(s) Failed`, {
        description: `Fleet: ${fleetStatus.active} active, ${fleetStatus.error} error, ${fleetStatus.paused} paused.`,
        duration: 8000,
      });
    }

    // Agent recovered (errors decreased)
    if (fleetStatus.error < prevFleetRef.current.error && prevFleetRef.current.error > 0 && shouldFire("fleet-recovered")) {
      const recovered = prevFleetRef.current.error - fleetStatus.error;
      toast.success(`✅ ${recovered} Agent(s) Recovered`, {
        description: `Self-healing restored agent(s) to active state. Fleet now ${fleetStatus.active}/${fleetStatus.totalAgents} active.`,
        duration: 6000,
      });
    }

    // Queue pressure
    if (fleetStatus.queueDepth > 10 && shouldFire(`fleet-queue-${Math.floor(fleetStatus.queueDepth / 5)}`)) {
      toast.warning("📋 Queue Pressure Building", {
        description: `${fleetStatus.queueDepth} items queued. Consider increasing concurrency.`,
        duration: 6000,
      });
    }

    // Escalations
    if (fleetStatus.totalEscalations > 0 && shouldFire(`fleet-escalation-${fleetStatus.totalEscalations}`)) {
      toast.info("📋 Escalation Pending", {
        description: `${fleetStatus.totalEscalations} escalation(s) require human review.`,
        duration: 6000,
      });
    }

    // Cost spike
    const costUsd = fleetStatus.totalCostCompute;
    if (costUsd > 5 && shouldFire("fleet-cost-spike")) {
      toast.warning("💰 Cost Threshold Exceeded", {
        description: `Fleet compute cost at $${costUsd.toFixed(2)}. Review agent budget allocation.`,
        duration: 8000,
      });
    }

    prevFleetRef.current = { error: fleetStatus.error, paused: fleetStatus.paused, active: fleetStatus.active };
  }, [fleetStatus]);

  // ── Feature Proposal Notifications ───────────────────────────
  useEffect(() => {
    if (pendingProposalCount > 0 && shouldFire(`proposals-${pendingProposalCount}`)) {
      toast("✨ New Feature Proposals", {
        description: `SITA generated ${pendingProposalCount} new proposal(s). Review in Companion Bar.`,
        duration: 6000,
      });
    }
  }, [pendingProposalCount]);

  // ── Learning Milestones ──────────────────────────────────────
  useEffect(() => {
    if (learningInsights.topPerformers.length > 0 && shouldFire("learning-promotions")) {
      toast.success("🎓 Promotion Candidates", {
        description: `${learningInsights.topPerformers.length} agent(s) exceed 92% success — eligible for autonomy promotion.`,
        duration: 6000,
      });
    }

    if (learningInsights.underPerformers.length > 0 && shouldFire("learning-demotions")) {
      toast.warning("⚠️ Underperformers Flagged", {
        description: `${learningInsights.underPerformers.length} agent(s) below 60% threshold. Demotion recommended.`,
        duration: 6000,
      });
    }

    if (learningInsights.costSavingOpportunities.length > 0 && shouldFire("learning-savings")) {
      toast.info("💡 Cost Optimization Available", {
        description: learningInsights.costSavingOpportunities[0],
        duration: 5000,
      });
    }

    // New insights detected
    const unapplied = learningInsights.insights.filter(i => !i.applied);
    if (unapplied.length > 0 && shouldFire(`learning-insights-${unapplied.length}`)) {
      toast.info("🧠 Learning Insights", {
        description: `${unapplied.length} new pattern(s) detected. Review in Self-Learning dashboard.`,
        duration: 5000,
      });
    }

    // Agent synergies
    if (learningInsights.agentSynergies.length > 2 && shouldFire("learning-synergies")) {
      toast("🔗 Agent Synergies Detected", {
        description: `${learningInsights.agentSynergies.length} complementary agent pairs identified.`,
        duration: 5000,
      });
    }
  }, [learningInsights]);

  // ── Sync Status ──────────────────────────────────────────────
  useEffect(() => {
    if (!syncStatus.connected && shouldFire("sync-disconnected")) {
      toast.error("🔌 Cloud Sync Lost", {
        description: "Connection to cloud sync interrupted. Changes will queue locally.",
        duration: 8000,
      });
    }

    if (syncStatus.conflictCount > 0 && shouldFire(`sync-conflicts-${syncStatus.conflictCount}`)) {
      toast.warning("⚡ Sync Conflict", {
        description: `${syncStatus.conflictCount} conflict(s) detected. Review in settings.`,
        duration: 6000,
      });
    }
  }, [syncStatus]);

  // ── Trust Score Drops ────────────────────────────────────────
  useEffect(() => {
    if (healthPulse.trustScore < 0.8 && shouldFire("trust-low")) {
      toast.warning("🛡️ Trust Score Low", {
        description: `System trust at ${Math.round(healthPulse.trustScore * 100)}%. Review agent permissions and recent actions.`,
        duration: 8000,
      });
    }

    if (healthPulse.trustScore < 0.5 && shouldFire("trust-critical")) {
      toast.error("🔴 Trust Score Critical", {
        description: `Trust at ${Math.round(healthPulse.trustScore * 100)}%. Agents may be operating in simulation-only mode.`,
        duration: 10000,
      });
    }
  }, [healthPulse.trustScore]);

  // ── High-Priority Suggestions ────────────────────────────────
  useEffect(() => {
    const highPriority = suggestions.filter((s) => s.priority === "high" && s.category === "alert");
    if (highPriority.length > 0 && shouldFire(`alert-${highPriority[0].id}`)) {
      toast.warning(`🚨 ${highPriority[0].title}`, {
        description: highPriority[0].description,
        duration: 8000,
      });
    }

    // Optimization suggestions
    const optimizations = suggestions.filter(s => s.category === "optimization");
    if (optimizations.length > 0 && shouldFire(`optimization-${optimizations[0].id}`)) {
      toast.info(`💡 ${optimizations[0].title}`, {
        description: optimizations[0].description,
        duration: 5000,
      });
    }
  }, [suggestions]);

  // ── Self-Healing Events (polling patrol data) ────────────────
  useEffect(() => {
    if (!companionEngine) return;
    const patrol = companionEngine.getErrorPatrol();
    const issues = patrol.getIssueLog();
    const recentFixed = issues.filter(i => i.status === "fixed" && Date.now() - i.updatedAt < 60000);

    if (recentFixed.length > 0 && shouldFire(`healing-fixed-${recentFixed.length}`)) {
      toast.success("🔧 Self-Healing Active", {
        description: `${recentFixed.length} issue(s) auto-resolved in the last minute. System recovering.`,
        duration: 6000,
      });
    }

    // Circuit breaker alert (simulated check)
    const escalated = issues.filter(i => i.status === "escalated" && Date.now() - i.updatedAt < 120000);
    if (escalated.length > 0 && shouldFire(`healing-escalated-${escalated.length}`)) {
      toast.error("🚨 Escalation Required", {
        description: `${escalated.length} issue(s) could not be auto-fixed and need human review.`,
        duration: 10000,
      });
    }
  }, [errorPatrolReport, companionEngine]);
}
