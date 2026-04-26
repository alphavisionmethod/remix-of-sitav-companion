// truth-allow: ia-config
import { useState } from "react";
import { motion } from "framer-motion";
import { Settings2, Eye, Search, Zap, Calendar, Activity, Shield } from "lucide-react";
import { useInvestmentStrategyRecords } from "@/hooks/use-investment-office";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
export default function OperatingModes() {
  const { data: liveData, isLoading } = useInvestmentStrategyRecords();
  const [activeMode, setActiveMode] = useState("quiet");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
<div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Settings2 className="h-6 w-6 text-primary" /> Investment Operating Modes</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Shift the office's density, advisor intensity, alerting, and risk framing to match your current intent</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {([] as any[]).map((mode, i) => {
          const isActive = activeMode === mode.id;
          return (
            <motion.button key={mode.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => setActiveMode(mode.id)}
              className={`rounded-2xl border p-5 text-left transition-all space-y-3 ${
                isActive ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-card hover:border-primary/20"
              }`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{mode.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">{mode.label}</p>
                  {isActive && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-bold text-primary uppercase">Active</span>}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{mode.description}</p>
              <div className="space-y-1.5">
                {[
                  { label: "UI Density", value: mode.density },
                  { label: "Advisor Intensity", value: mode.advisorIntensity },
                  { label: "Alerting", value: mode.alerting },
                  { label: "Risk Framing", value: mode.riskFraming },
                ].map(attr => (
                  <div key={attr.label} className="flex items-center justify-between">
                    <span className="text-[9px] text-muted-foreground">{attr.label}</span>
                    <span className="text-[9px] font-medium text-foreground">{attr.value}</span>
                  </div>
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Active Mode Detail */}
      <motion.div key={activeMode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/15 bg-primary/5 p-6 text-center space-y-2">
      <PageTruthBanner truthState="partial" />
        <p className="text-3xl">{([] as any[]).find(m => m.id === activeMode)?.emoji}</p>
        <p className="text-lg font-bold text-foreground">{([] as any[]).find(m => m.id === activeMode)?.label} Mode Active</p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">{([] as any[]).find(m => m.id === activeMode)?.description}</p>
      </motion.div>
    </div>
  );
}
