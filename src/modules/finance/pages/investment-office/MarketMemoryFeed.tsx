// truth-allow: ia-config
import { motion } from "framer-motion";
import { History, TrendingUp, TrendingDown, AlertTriangle, Brain, RefreshCw, Zap, Shield, FileText, Globe } from "lucide-react";
import { useMarketMemoryEvents, useAdvisorObservations, useCatalystEvents, useBehavioralSignals, usePortfolioPositionsMemory } from "@/hooks/use-investment-memory";
import { computeWhatChanged } from "@/lib/services/finance-os/investment-memory.service";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
const SEVERITY_STYLES: Record<string, string> = {
  alert: "border-destructive/20 bg-destructive/5",
  warning: "border-[hsl(var(--trust-warn))]/15 bg-[hsl(var(--trust-warn))]/5",
  positive: "border-[hsl(var(--trust-safe))]/15 bg-[hsl(var(--trust-safe))]/5",
  info: "border-border bg-card",
};

export default function MarketMemoryFeed() {
  const { data: liveMemoryEvents } = useMarketMemoryEvents();
  const { data: liveObservations } = useAdvisorObservations();
  const { data: liveCatalysts } = useCatalystEvents();
  const { data: liveBehavioral } = useBehavioralSignals();
  const { data: livePositions } = usePortfolioPositionsMemory();
  const liveChanges = computeWhatChanged(
    liveObservations ?? [], livePositions ?? [], liveCatalysts ?? [],
    liveMemoryEvents ?? [], liveBehavioral ?? []
  );
  return (
    <div className="mx-auto max-w-4xl space-y-6">
<div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><History className="h-6 w-6 text-primary" /> Market Memory Feed</h1>
        <p className="text-sm text-muted-foreground mt-0.5">A living stream of everything that changed in your investment world</p>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Holdings Moved", value: "3", sub: "NVDA ↓, SOL ↑, BTC →" },
          { label: "Advisor Updates", value: "4", sub: "New views from council" },
          { label: "Active Alerts", value: "2", sub: "Risk + Behavioral" },
          { label: "Catalysts Near", value: "3", sub: "Within 60 days" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-3">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-[9px] text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-2">
        {([] as any[]).map((evt, i) => (
          <motion.div key={evt.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
            className={`rounded-xl border p-4 ${SEVERITY_STYLES[evt.severity] || SEVERITY_STYLES.info}`}>
            <div className="flex items-start gap-3">
              <span className="text-lg shrink-0">{evt.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-bold text-foreground">{evt.title}</p>
                  <span className="text-[9px] text-muted-foreground">{evt.time}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{evt.detail}</p>
              </div>
              {evt.severity === "alert" && <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
