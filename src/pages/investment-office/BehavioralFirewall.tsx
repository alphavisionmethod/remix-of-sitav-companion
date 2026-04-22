import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Brain, AlertTriangle, Check, Clock, Eye, TrendingUp, Zap, MessageSquare } from "lucide-react";
import { useBehavioralSignals, useInvestmentConstitution } from "@/hooks/use-investment-memory";
import { assessBehavioralFirewall } from "@/lib/services/finance-os/investment-memory.service";
import { DEMO_BEHAVIORAL_SIGNALS } from "@/data/seed/investment";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

const FIREWALL_STATUS = {
  overallHealth: 85,
  label: "Disciplined",
  activeDetectors: 6,
  recentAlerts: 1,
  positiveSignals: 3,
};

export default function BehavioralFirewall() {
  const { isDemoMode } = useDataMode();
  const { data: liveBehavioralSignals } = useBehavioralSignals();
  const { data: constitution } = useInvestmentConstitution();
  const firewallState = assessBehavioralFirewall(liveBehavioralSignals ?? [], constitution);
  const [filter, setFilter] = useState<string>("all");
  const filtered = (isDemoMode ? DEMO_BEHAVIORAL_SIGNALS : [] as typeof DEMO_BEHAVIORAL_SIGNALS).filter(s => filter === "all" || s.type === filter);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
<div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><ShieldAlert className="h-6 w-6 text-primary" /> Behavioral Firewall</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Protecting you from impulsive, emotional, and undisciplined investment decisions</p>
      </div>

      {/* Health Summary */}
      <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card p-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground">{FIREWALL_STATUS.overallHealth}%</p>
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">{FIREWALL_STATUS.label}</p>
          </div>
          <div className="flex-1 h-3 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-[hsl(var(--trust-safe))]" style={{ width: `${FIREWALL_STATUS.overallHealth}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-foreground">{FIREWALL_STATUS.activeDetectors}</p>
              <p className="text-[9px] text-muted-foreground">Active Detectors</p>
            </div>
            <div>
              <p className="text-lg font-bold text-[hsl(var(--trust-warn))]">{FIREWALL_STATUS.recentAlerts}</p>
              <p className="text-[9px] text-muted-foreground">Recent Alerts</p>
            </div>
            <div>
              <p className="text-lg font-bold text-[hsl(var(--trust-safe))]">{FIREWALL_STATUS.positiveSignals}</p>
              <p className="text-[9px] text-muted-foreground">Positive Signals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Detectors */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {["FOMO Detection", "Revenge Trading", "Panic Monitor", "Thesis Drift", "Overtrading", "Consistency"].map(d => (
          <div key={d} className="rounded-xl border border-border bg-card p-3 text-center">
            <Check className="h-3 w-3 text-[hsl(var(--trust-safe))] mx-auto mb-1" />
            <p className="text-[9px] font-medium text-foreground">{d}</p>
            <p className="text-[8px] text-[hsl(var(--trust-safe))]">Active</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-1.5">
        {[{ v: "all", l: "All Signals" }, { v: "attention", l: "Attention" }, { v: "discipline", l: "Discipline" }, { v: "allocation", l: "Allocation" }, { v: "timing", l: "Timing" }].map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              filter === f.v ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}>{f.l}</button>
        ))}
      </div>

      {/* Signals */}
      <div className="space-y-3">
        {filtered.map((signal, i) => (
          <motion.div key={signal.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className={`rounded-2xl border p-5 space-y-3 ${
              signal.severity === "warning" ? "border-[hsl(var(--trust-warn))]/20 bg-[hsl(var(--trust-warn))]/5" :
              signal.severity === "moderate" ? "border-[hsl(var(--trust-warn))]/15 bg-card" :
              signal.severity === "positive" ? "border-[hsl(var(--trust-safe))]/20 bg-[hsl(var(--trust-safe))]/5" :
              "border-border bg-card"
            }`}>
            <div className="flex items-start gap-3">
              <span className="text-xl">{signal.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-foreground">{signal.title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${
                    signal.severity === "warning" ? "bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))]" :
                    signal.severity === "moderate" ? "bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))]" :
                    signal.severity === "positive" ? "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" :
                    "bg-secondary text-muted-foreground"
                  }`}>{signal.severity}</span>
                  <span className="text-[9px] text-muted-foreground">{signal.timestamp}</span>
                </div>
                <p className="text-xs text-foreground mt-2 leading-relaxed">{signal.detail}</p>
              </div>
            </div>
            <div className="rounded-xl bg-secondary/30 p-3">
              <p className="text-[9px] font-semibold text-primary uppercase tracking-wider mb-1">Mirror Suggests</p>
              <p className="text-[11px] text-foreground leading-relaxed">{signal.suggestion}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
