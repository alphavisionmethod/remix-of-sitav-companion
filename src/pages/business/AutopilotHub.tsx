// ═══════════════════════════════════════════════════════════════
// SITA OS — Autopilot Hub Page
// Wizard → Command Center flow
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import { SitaPageHeader } from "@/components/sita/SitaCard";
import AutopilotWizard from "@/components/autopilot/AutopilotWizard";
import AutopilotCommandCenter from "@/components/autopilot/AutopilotCommandCenter";
import { getDefaultConfig, type AutopilotConfig } from "@/lib/domain-engines/autopilot-engine";

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
        <SitaPageHeader
          title="Autopilot Setup"
          subtitle="Configure your revenue automation in under 2 minutes"
        />
        <AutopilotWizard onComplete={handleComplete} onSkip={handleSkip} />
      </div>
    );
  }

  return <AutopilotCommandCenter config={config} onConfigUpdate={handleConfigUpdate} onOpenWizard={handleOpenWizard} />;
};

export default AutopilotHubPage;
