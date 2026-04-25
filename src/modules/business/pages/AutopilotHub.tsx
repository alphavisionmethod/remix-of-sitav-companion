// ═══════════════════════════════════════════════════════════════
// SITA OS — Autopilot Hub Page (Migrated)
// Wizard → Command Center flow
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { ModuleAdvisorInsight } from "@/platform/sita/components/sita/domain-shared/ModuleAdvisorInsight";
import AutopilotWizard from "@/platform/orchestration/components/autopilot/AutopilotWizard";
import AutopilotCommandCenter from "@/platform/orchestration/components/autopilot/AutopilotCommandCenter";
import { getDefaultConfig, type AutopilotConfig } from "@/lib/domain-engines/autopilot-engine";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/domains/engines/business-identity-layers";

const STORAGE_KEY = "sita-autopilot-config";

function loadConfig(): AutopilotConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return getDefaultConfig();
}

function saveConfig(config: AutopilotConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

const AutopilotHubPage = () => {
  const { primaryMode } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);
  const autopilotLabel = primaryMode === "ecommerce" ? "Sales Autopilot" : primaryMode === "agency" ? "Growth Engine" : primaryMode === "employee-based" ? "Workflow Engine" : primaryMode === "appointment-based" ? "Booking Autopilot" : "Revenue Autopilot";
  const [config, setConfig] = useState<AutopilotConfig>(loadConfig);
  const [showWizard, setShowWizard] = useState(!config.isOnboarded);

  const handleComplete = useCallback((newConfig: AutopilotConfig) => {
    setConfig(newConfig);
    saveConfig(newConfig);
    setShowWizard(false);
  }, []);

  const handleSkip = useCallback(() => {
    const skipped: AutopilotConfig = {
      ...getDefaultConfig(),
      isOnboarded: true,
      activePlaybooks: ["receivable-recovery", "leak-seal"],
    };
    setConfig(skipped);
    saveConfig(skipped);
    setShowWizard(false);
  }, []);

  const handleConfigUpdate = useCallback((updated: AutopilotConfig) => {
    setConfig(updated);
    saveConfig(updated);
  }, []);

  const handleOpenWizard = useCallback(() => setShowWizard(true), []);

  if (showWizard) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <PageTruthBanner />
        <div>
          <h2 className={SITA_TYPE.pageTitle}>Autopilot Setup</h2>
          <p className="text-sm text-muted-foreground mt-1">Configure your revenue automation in under 2 minutes</p>
        </div>
        <AutopilotWizard onComplete={handleComplete} onSkip={handleSkip} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageTruthBanner />
      <AutopilotCommandCenter config={config} onConfigUpdate={handleConfigUpdate} onOpenWizard={handleOpenWizard} />
      <ModuleAdvisorInsight
        advisorName="Automation Advisor"
        domain="business"
        insight={`${config.activePlaybooks?.length || 0} playbooks active. Autopilot is ${config.isOnboarded ? "running" : "awaiting setup"} — review trust boundaries and approval gates.`}
        confidence={88}
      />
    </div>
  );
};

export default AutopilotHubPage;
