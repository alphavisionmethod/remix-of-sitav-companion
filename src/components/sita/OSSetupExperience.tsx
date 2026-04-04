// ═══════════════════════════════════════════════════════════════
// SITA OS — Premium OS Setup Experience
// Full premium setup flow: boot → welcome → language → mode →
// model → trust → advisors → environment prep → ready
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FirstBootScreen } from "@/components/sita/FirstBootScreen";
import { FirstWelcomeScreen } from "@/components/sita/FirstWelcomeScreen";
import { SetupLanguageRegion } from "@/components/sita/setup/SetupLanguageRegion";
import { SetupOperatingMode } from "@/components/sita/setup/SetupOperatingMode";
import { SetupOperatingModel, type OperatingModelData } from "@/components/sita/setup/SetupOperatingModel";
import { SetupTrustAutonomy } from "@/components/sita/setup/SetupTrustAutonomy";
import { SetupAdvisorTeam } from "@/components/sita/setup/SetupAdvisorTeam";
import { SetupEnvironmentPrep } from "@/components/sita/setup/SetupEnvironmentPrep";

// ── Types ───────────────────────────────────────────────────

type Phase =
  | "boot"
  | "welcome"
  | "language-region"
  | "operating-mode"
  | "operating-model"
  | "trust-autonomy"
  | "advisor-team"
  | "environment-prep";

interface SetupData {
  // Language & Region
  language: string;
  region: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  // Operating Mode
  operatingMode: string;
  // Operating Model
  operatingModel: OperatingModelData | null;
  // Trust
  autonomyLevel: number;
  thresholds: Record<string, string>;
  // Advisors
  activeAdvisors: string[];
  // Identity (from welcome flow — placeholder for now)
  displayName: string;
}

const TOTAL_STEPS = 6; // language, mode, model, trust, advisors, prep

// ── Main Setup Component ────────────────────────────────────

export function OSSetupExperience() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("boot");
  const [data, setData] = useState<SetupData>({
    language: "en",
    region: "US",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    currency: "USD",
    operatingMode: "",
    operatingModel: null,
    autonomyLevel: 3,
    thresholds: {},
    activeAdvisors: [],
    displayName: "",
  });

  const goTo = useCallback((p: Phase) => setPhase(p), []);

  const finishSetup = async () => {
    if (!user) { navigate("/"); return; }
    try {
      const memoryItems = [
        { user_id: user.id, key: "language", value: JSON.stringify(data.language), category: "preference" },
        { user_id: user.id, key: "region", value: JSON.stringify(data.region), category: "preference" },
        { user_id: user.id, key: "timezone", value: JSON.stringify(data.timezone), category: "preference" },
        { user_id: user.id, key: "operating_mode", value: JSON.stringify(data.operatingMode), category: "preference" },
        { user_id: user.id, key: "operating_model", value: JSON.stringify(data.operatingModel), category: "preference" },
        { user_id: user.id, key: "autonomy_level", value: JSON.stringify(data.autonomyLevel), category: "preference" },
        { user_id: user.id, key: "trust_thresholds", value: JSON.stringify(data.thresholds), category: "preference" },
        { user_id: user.id, key: "active_advisors", value: JSON.stringify(data.activeAdvisors), category: "preference" },
      ].filter(m => m.value && m.value !== '""' && m.value !== 'null');

      await (supabase as any).from("user_memory").upsert(memoryItems, { onConflict: "user_id,key" });
      await (supabase as any).from("profiles").update({ onboarding_completed: true }).eq("user_id", user.id);
      toast.success("SITA OS configured successfully");
    } catch (e) {
      console.error(e);
    }
    navigate("/");
  };

  return (
    <>
      {/* Boot */}
      {phase === "boot" && <FirstBootScreen onComplete={() => goTo("welcome")} />}

      {/* Setup phases */}
      {phase !== "boot" && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center overflow-y-auto p-4 sm:p-8"
          style={{ backgroundColor: "#0B0D10" }}>
          {/* Ambient glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full blur-[120px]"
              style={{ background: "hsl(265 55% 58% / 0.04)" }} />
            <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full blur-[100px]"
              style={{ background: "hsl(38 85% 58% / 0.03)" }} />
          </div>

          <div className="relative z-10 w-full">
            <AnimatePresence mode="wait">
              {/* Welcome */}
              {phase === "welcome" && (
                <FirstWelcomeScreen key="welcome" onSetup={() => goTo("language-region")} />
              )}

              {/* Language & Region */}
              {phase === "language-region" && (
                <SetupLanguageRegion
                  key="language"
                  step={0}
                  total={TOTAL_STEPS}
                  onBack={() => goTo("welcome")}
                  onNext={(locale) => {
                    setData(d => ({ ...d, ...locale }));
                    goTo("operating-mode");
                  }}
                />
              )}

              {/* Operating Mode */}
              {phase === "operating-mode" && (
                <SetupOperatingMode
                  key="mode"
                  step={1}
                  total={TOTAL_STEPS}
                  onBack={() => goTo("language-region")}
                  onNext={(mode) => {
                    setData(d => ({ ...d, operatingMode: mode }));
                    goTo("operating-model");
                  }}
                />
              )}

              {/* Operating Model */}
              {phase === "operating-model" && (
                <SetupOperatingModel
                  key="model"
                  operatingMode={data.operatingMode}
                  step={2}
                  total={TOTAL_STEPS}
                  onBack={() => goTo("operating-mode")}
                  onNext={(model) => {
                    setData(d => ({ ...d, operatingModel: model }));
                    goTo("trust-autonomy");
                  }}
                />
              )}

              {/* Trust & Autonomy */}
              {phase === "trust-autonomy" && (
                <SetupTrustAutonomy
                  key="trust"
                  step={3}
                  total={TOTAL_STEPS}
                  onBack={() => goTo("operating-model")}
                  onNext={({ autonomyLevel, thresholds }) => {
                    setData(d => ({ ...d, autonomyLevel, thresholds }));
                    goTo("advisor-team");
                  }}
                />
              )}

              {/* Advisor Team */}
              {phase === "advisor-team" && (
                <SetupAdvisorTeam
                  key="advisors"
                  operatingMode={data.operatingMode}
                  step={4}
                  total={TOTAL_STEPS}
                  onBack={() => goTo("trust-autonomy")}
                  onNext={(advisors) => {
                    setData(d => ({ ...d, activeAdvisors: advisors }));
                    goTo("environment-prep");
                  }}
                />
              )}

              {/* Environment Prep + Ready */}
              {phase === "environment-prep" && (
                <SetupEnvironmentPrep
                  key="prep"
                  displayName={data.displayName}
                  activeAdvisors={data.activeAdvisors}
                  autonomyLevel={data.autonomyLevel}
                  onFinish={finishSetup}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </>
  );
}
