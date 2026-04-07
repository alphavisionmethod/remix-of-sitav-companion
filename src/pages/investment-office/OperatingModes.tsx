import { useState } from "react";
import { motion } from "framer-motion";
import { Settings2, Eye, Search, Zap, Calendar, Activity, Shield } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useInvestmentStrategyRecords } from "@/hooks/use-investment-office";

const DEMO_MODES = [
  {
    id: "quiet", label: "Quiet Monitoring", icon: <Eye className="h-5 w-5" />, emoji: "🌙",
    description: "Low-intensity passive observation. Advisors watch silently. Alerts only for material changes.",
    density: "Minimal", advisorIntensity: "Silent / alert-only", alerting: "Critical only", riskFraming: "Steady-state",
    color: "hsl(var(--primary))",
  },
  {
    id: "research", label: "Research Day", icon: <Search className="h-5 w-5" />, emoji: "🔬",
    description: "Deep analysis mode. Research library and dossiers prioritized. Advisors provide longer-form intelligence.",
    density: "Medium", advisorIntensity: "Detailed memos", alerting: "Low", riskFraming: "Analytical",
    color: "hsl(200 65% 55%)",
  },
  {
    id: "execution", label: "Execution Day", icon: <Zap className="h-5 w-5" />, emoji: "⚡",
    description: "Active trading mode. Execution desk prominent. Advisors provide real-time trade prep commentary.",
    density: "High", advisorIntensity: "Real-time", alerting: "Active", riskFraming: "Pre-trade focus",
    color: "hsl(38 85% 58%)",
  },
  {
    id: "event", label: "Event Week", icon: <Calendar className="h-5 w-5" />, emoji: "📅",
    description: "Catalyst-aware mode. War room active. Event markets highlighted. Timeline-driven framing.",
    density: "High", advisorIntensity: "Event-focused", alerting: "Catalyst-driven", riskFraming: "Event sensitivity",
    color: "hsl(280 60% 55%)",
  },
  {
    id: "volatility", label: "High Volatility", icon: <Activity className="h-5 w-5" />, emoji: "🌊",
    description: "Storm mode. Risk office prominent. Behavioral firewall elevated. Execution requires extra review.",
    density: "Dense", advisorIntensity: "Maximum", alerting: "All channels", riskFraming: "Defensive",
    color: "hsl(0 65% 55%)",
  },
  {
    id: "preservation", label: "Capital Preservation", icon: <Shield className="h-5 w-5" />, emoji: "🛡️",
    description: "Safety mode. Focus on reserve health, hedging, and income. Aggressive actions require elevated approval.",
    density: "Low", advisorIntensity: "Cautious", alerting: "Risk-only", riskFraming: "Preservation-first",
    color: "hsl(152 55% 48%)",
  },
];

export default function OperatingModes() {
  const { isDemoMode } = useDataMode();
  const { data: liveData, isLoading } = useInvestmentStrategyRecords();
  const [activeMode, setActiveMode] = useState("quiet");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Settings2 className="h-6 w-6 text-primary" /> Investment Operating Modes</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Shift the office's density, advisor intensity, alerting, and risk framing to match your current intent</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEMO_MODES.map((mode, i) => {
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
        <p className="text-3xl">{DEMO_MODES.find(m => m.id === activeMode)?.emoji}</p>
        <p className="text-lg font-bold text-foreground">{DEMO_MODES.find(m => m.id === activeMode)?.label} Mode Active</p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">{DEMO_MODES.find(m => m.id === activeMode)?.description}</p>
      </motion.div>
    </div>
  );
}
