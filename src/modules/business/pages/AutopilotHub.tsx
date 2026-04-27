// ═══════════════════════════════════════════════════════════════
// SITA OS — Autopilot Hub Page (Canonical)
// Wizard → Command Center flow, backed by canonical persistence
// (RLS-scoped autopilot_configs table). Demo-aware, auth-aware,
// with full loading/error/unauth/ready state coverage.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useState } from "react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import HierarchyHint from "@/modules/business/components/business/shared/HierarchyHint";
import { ModuleAdvisorInsight } from "@/platform/sita/components/sita/domain-shared/ModuleAdvisorInsight";
import { PageSkeleton } from "@/platform/sita/components/sita/PageSkeleton";
import { EmptyStateCard } from "@/platform/sita/components/sita/EmptyStateCard";
import AutopilotWizard from "@/platform/orchestration/components/autopilot/AutopilotWizard";
import AutopilotCommandCenter from "@/platform/orchestration/components/autopilot/AutopilotCommandCenter";
import { type AutopilotConfig } from "@/lib/domain-engines/autopilot-engine";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
import {
  useAutopilotConfig,
  useCompleteAutopilotWizard,
  useSaveAutopilotConfig,
  useSkipAutopilotWizard,
} from "@/platform/orchestration/hooks/use-autopilot-config";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Lock } from "lucide-react";

const AutopilotHubPage = () => {
  const { primaryMode } = useBusinessProfile();
  const autopilotLabel =
    primaryMode === "ecommerce" ? "Sales Autopilot" :
    primaryMode === "agency" ? "Growth Engine" :
    primaryMode === "employee-based" ? "Workflow Engine" :
    primaryMode === "appointment-based" ? "Booking Autopilot" :
    "Revenue Autopilot";

  const { data: snapshot, state, error, refetch, userId, mode } = useAutopilotConfig();
  const completeMutation = useCompleteAutopilotWizard();
  const skipMutation = useSkipAutopilotWizard();
  const saveMutation = useSaveAutopilotConfig();

  // Allow user to manually re-open the wizard from the command center.
  const [forceWizard, setForceWizard] = useState(false);

  const handleComplete = useCallback(
    (newConfig: AutopilotConfig) => {
      completeMutation.mutate(newConfig, { onSuccess: () => setForceWizard(false) });
    },
    [completeMutation],
  );

  const handleSkip = useCallback(() => {
    skipMutation.mutate(undefined, { onSuccess: () => setForceWizard(false) });
  }, [skipMutation]);

  const handleConfigUpdate = useCallback(
    (updated: AutopilotConfig) => {
      saveMutation.mutate(updated);
    },
    [saveMutation],
  );

  const handleOpenWizard = useCallback(() => setForceWizard(true), []);

  // ── Loading ─────────────────────────────────────────────────────
  if (state === "loading") {
    return (
      <div className="space-y-4">
        <PageTruthBanner />
        <PageSkeleton rows={3} />
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────
  if (state === "error") {
    return (
      <div className="space-y-4">
        <PageTruthBanner />
        <EmptyStateCard
          icon={AlertTriangle}
          title="Autopilot unavailable"
          description={error?.message || "We couldn't load your Autopilot configuration."}
          action={<Button onClick={() => refetch()}>Try again</Button>}
        />
      </div>
    );
  }

  // ── Unauthenticated (live mode only) ───────────────────────────
  if (mode === "live" && !userId) {
    return (
      <div className="space-y-4">
        <PageTruthBanner />
        <EmptyStateCard
          icon={Lock}
          title={`${autopilotLabel} requires sign-in`}
          description="Autopilot configuration is tied to your account so it stays consistent across devices and is governed by your trust boundaries."
        />
      </div>
    );
  }

  const isOnboarded = Boolean(snapshot?.isOnboarded) && !forceWizard;

  // ── Wizard (not onboarded, or user re-opened it) ───────────────
  if (!isOnboarded) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <PageTruthBanner />
        <div>
          <h2 className={SITA_TYPE.pageTitle}>{autopilotLabel} Setup</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure your automation in under 2 minutes — every action stays governed by your approval rules.
          </p>
        </div>
        <AutopilotWizard onComplete={handleComplete} onSkip={handleSkip} />
      </div>
    );
  }

  // ── Command Center (ready) ─────────────────────────────────────
  const config = snapshot?.config ?? ({} as AutopilotConfig);
  const activeCount = config.activePlaybooks?.length ?? 0;
  const insightText =
    activeCount === 0
      ? `${autopilotLabel} is on stand-by — no playbooks active. Enable a playbook below to start governed automation.`
      : `${activeCount} playbook${activeCount === 1 ? "" : "s"} active under "${config.approvalMode}" approval mode. ${
          mode === "demo" ? "Demo data — no real actions are executed." : "All runs are recorded as receipts and respect your kill-switches."
        }`;

  return (
    <div className="space-y-4">
      <PageTruthBanner />
      <HierarchyHint tier="execution" surface="Autopilot Hub" description="Strategy / config view" />
      <AutopilotCommandCenter
        config={config}
        onConfigUpdate={handleConfigUpdate}
        onOpenWizard={handleOpenWizard}
      />
      <ModuleAdvisorInsight
        advisorName="Automation Advisor"
        domain="business"
        insight={insightText}
        confidence={activeCount === 0 ? 60 : 88}
      />
    </div>
  );
};

export default AutopilotHubPage;
