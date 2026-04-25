import { useMemo, useState } from "react";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaCard";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  AlertTriangle, Zap, Shield, Activity, Brain, Flame,
  HeartCrack, Baby, Briefcase, MapPin, Gift, Accessibility,
  TrendingDown, BarChart3, ChevronRight
} from "lucide-react";
import { useLifeSimulator } from "@/contexts/SitaKernelContext";
import type { ShockType, ShockImpactReport } from "@/lib/services/life-simulation";

const SHOCK_ICONS: Record<ShockType, typeof AlertTriangle> = {
  'job-loss': Briefcase, 'new-baby': Baby, 'divorce': HeartCrack,
  'relocation': MapPin, 'inheritance': Gift, 'disability': Accessibility,
  'business-failure': TrendingDown, 'market-crash': BarChart3,
};

import { SEVERITY_COLORS } from "@/lib/constants/ui-config";
import { PageShell } from "@/platform/sita/components/sita/PageShell";

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const LifeSimulator = () => {
  const simulator = useLifeSimulator(500);
  const shockTypes = useMemo(() => simulator.getShockTypes(), [simulator]);

  const [selectedShock, setSelectedShock] = useState<ShockType | null>(null);
  const [severity, setSeverity] = useState(0.7);
  const [report, setReport] = useState<ShockImpactReport | null>(null);

  const runSimulation = (type: ShockType) => {
    setSelectedShock(type);
    const result = simulator.simulateShock({
      type, severity,
      monthlyIncome: 8000, reserves: 25000, monthlyExpenses: 5500,
      dependents: 2, businessRevenue: 12000, householdMembers: 4,
      activeGoals: 6, insuranceCoverage: 0.65,
    });
    setReport(result);
  };

  return (
    <PageShell width="full">
<motion.div variants={fadeUp}>
        <SitaPageHeader
          title="Life Simulator"
          subtitle="What happens to everything if life changes? Simulate cross-domain shocks."
          actions={
            <span className="text-[10px] px-2 py-1 rounded-full bg-sita-purple/15 text-sita-purple font-medium">
              Monte Carlo · 500 scenarios
            </span>
          }
        />
      </motion.div>

      {/* Severity Slider */}
      <motion.div variants={fadeUp} className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-foreground">Shock Severity</span>
          <span className="text-sm font-bold text-foreground">{Math.round(severity * 100)}%</span>
        </div>
        <input
          type="range" min="10" max="100" value={severity * 100}
          onChange={e => setSeverity(Number(e.target.value) / 100)}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-secondary accent-sita-purple"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>Mild</span><span>Moderate</span><span>Severe</span>
        </div>
      </motion.div>

      {/* Shock Type Grid */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {shockTypes.map(shock => {
          const Icon = SHOCK_ICONS[shock.type];
          const isSelected = selectedShock === shock.type;
          return (
            <button
              key={shock.type}
              onClick={() => runSimulation(shock.type)}
              className={cn(
                "rounded-xl border p-4 text-left transition-all hover:shadow-md",
                isSelected ? "border-sita-purple bg-sita-purple/10 shadow-lg" : "border-border bg-card hover:border-sita-purple/30"
              )}
            >
              <Icon className={cn("w-5 h-5 mb-2", isSelected ? "text-sita-purple" : "text-muted-foreground")} />
              <p className="text-xs font-semibold text-foreground">{shock.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{shock.description}</p>
            </button>
          );
        })}
      </motion.div>

      {/* Results */}
      {report && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard label="Survival Probability" value={`${Math.round(report.survivalProbability * 100)}%`}
              color={report.survivalProbability > 0.7 ? 'text-trust-safe' : report.survivalProbability > 0.4 ? 'text-sita-gold' : 'text-destructive'} />
            <MetricCard label="Recovery Time" value={`${report.recoveryMonths} mo`} color="text-foreground" />
            <MetricCard label="Resilience Score" value={`${report.resilienceScore}/100`}
              color={report.resilienceScore > 70 ? 'text-trust-safe' : 'text-sita-gold'} />
            <MetricCard label="Goals at Risk" value={`${report.goalsAtRisk}`}
              color={report.goalsAtRisk > 3 ? 'text-destructive' : 'text-sita-gold'} />
          </div>

          {/* Domain Impacts */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-sita-purple" />
              <h3 className="text-sm font-semibold text-foreground">Domain Impacts</h3>
            </div>
            <div className="space-y-3">
              {report.domainImpacts.map(impact => (
                <div key={impact.domain} className="p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-foreground capitalize">{impact.domain}</span>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium",
                      impact.severity > 0.7 ? "bg-destructive/15 text-destructive" :
                      impact.severity > 0.4 ? "bg-sita-gold/15 text-sita-gold" : "bg-trust-safe/15 text-trust-safe"
                    )}>
                      {Math.round(impact.severity * 100)}% impact
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-2">{impact.description}</p>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden mb-2">
                    <div className={cn("h-full rounded-full",
                      impact.severity > 0.7 ? "bg-destructive" : impact.severity > 0.4 ? "bg-sita-gold" : "bg-trust-safe"
                    )} style={{ width: `${impact.severity * 100}%` }} />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {impact.immediateActions.slice(0, 2).map((a, i) => (
                      <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{a}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scenario Distribution */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-4 h-4 text-sita-purple" />
              <h3 className="text-sm font-semibold text-foreground">Scenario Distribution (500 runs)</h3>
            </div>
            <div className="space-y-2">
              {report.scenarioDistribution.map(s => (
                <div key={s.percentile} className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground w-16">P{s.percentile}</span>
                  <div className="flex-1 h-3 rounded-full bg-secondary overflow-hidden">
                    <div className={cn("h-full rounded-full", SEVERITY_COLORS[Math.min(7, Math.floor((1 - s.percentile / 100) * 8))])}
                      style={{ width: `${Math.min(100, (s.months / 24) * 100)}%` }} />
                  </div>
                  <span className="text-xs font-medium text-foreground w-16 text-right">{s.months} mo</span>
                  <span className="text-[10px] text-muted-foreground w-20">{s.outcome}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Actions */}
          <div className="rounded-xl border border-destructive/20 bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-4 h-4 text-destructive" />
              <h3 className="text-sm font-semibold text-foreground">Critical Actions</h3>
            </div>
            <div className="space-y-2">
              {report.criticalActions.map((action, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-destructive/5">
                  <ChevronRight className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
                  <span className="text-xs text-foreground">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </PageShell>
  );
};

const MetricCard = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="rounded-xl border border-border bg-card p-4 text-center">
    <p className={cn("text-xl font-bold", color)}>{value}</p>
    <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
  </div>
);

export default LifeSimulator;
