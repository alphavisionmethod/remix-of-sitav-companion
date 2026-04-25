// ═══════════════════════════════════════════════════════════════
// SITA OS — Budget Automation Panel (Money Center Widget)
// Shows budget alerts, auto-save rules, rebalance proposals
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/platform/sita/components/sita/SitaCard";
import { TrustBadge } from "@/platform/sita/components/sita/TrustBadge";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  BudgetAutomationService,
  type BudgetAlert,
  type SpendingRule,
  type AutoSaveRule,
  type BudgetRebalanceProposal,
  type CategoryPattern,
} from "@/lib/core-services/budget-automation";
import {
  AlertTriangle, Bell, CheckCircle, TrendingUp, TrendingDown, ArrowRight,
  PiggyBank, Zap, Shield, BarChart3, RefreshCw, DollarSign,
  ArrowRightLeft, Sparkles, Eye, XCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const demoBudgets = [
  { category: "Housing", allocated: 2500, spent: 2400, period: "Apr 2026" },
  { category: "Food & Dining", allocated: 1200, spent: 1380, period: "Apr 2026" },
  { category: "Transportation", allocated: 700, spent: 420, period: "Apr 2026" },
  { category: "Subscriptions", allocated: 300, spent: 340, period: "Apr 2026" },
  { category: "Entertainment", allocated: 400, spent: 180, period: "Apr 2026" },
  { category: "Savings", allocated: 2000, spent: 2000, period: "Apr 2026" },
  { category: "Utilities", allocated: 300, spent: 275, period: "Apr 2026" },
  { category: "Insurance", allocated: 450, spent: 450, period: "Apr 2026" },
];

export function BudgetAutomationPanel() {
  const [expanded, setExpanded] = useState(false);

  const service = useMemo(() => {
    const s = new BudgetAutomationService();
    s.evaluateBudgets(demoBudgets);
    s.generateRebalanceProposals(demoBudgets);
    s.executeAutoSave(demoBudgets);
    return s;
  }, []);

  const summary = service.getSummary();
  const alerts = service.getAlerts();
  const proposals = service.getProposals();
  const autoSaveRules = service.getAutoSaveRules();
  const patterns = service.getPatterns();
  const rules = service.getRules();

  const [localRules, setLocalRules] = useState(rules);
  const [localAutoSave, setLocalAutoSave] = useState(autoSaveRules);
  const [localProposals, setLocalProposals] = useState(proposals);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set());

  const toggleRule = (id: string) => {
    setLocalRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    toast.success("Rule updated");
  };

  const toggleAutoSave = (id: string) => {
    setLocalAutoSave(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    toast.success("Auto-save rule updated");
  };

  const approveProposal = (id: string) => {
    setLocalProposals(prev => prev.map(p => p.id === id ? { ...p, status: "approved" as const } : p));
    toast.success("Rebalance approved");
  };

  const rejectProposal = (id: string) => {
    setLocalProposals(prev => prev.map(p => p.id === id ? { ...p, status: "rejected" as const } : p));
  };

  const acknowledgeAlert = (id: string) => {
    setAcknowledgedAlerts(prev => new Set([...prev, id]));
    toast("Alert acknowledged");
  };

  const activeAlerts = alerts.filter(a => !acknowledgedAlerts.has(a.id));

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <SitaCard hover={false} className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <SitaCardTitle sub="Automated budget monitoring & savings">Budget Automation</SitaCardTitle>
          </div>
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            {expanded ? "Less" : "More"} {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Alerts", value: activeAlerts.length, icon: Bell, color: activeAlerts.length > 0 ? "text-accent" : "text-trust-safe" },
            { label: "Health", value: `${summary.healthScore}%`, icon: Shield, color: summary.healthScore >= 80 ? "text-trust-safe" : "text-accent" },
            { label: "Auto-Saved", value: `$${summary.totalAutoSaved}`, icon: PiggyBank, color: "text-trust-safe" },
            { label: "Proposals", value: localProposals.filter(p => p.status === "proposed").length, icon: ArrowRightLeft, color: "text-primary" },
          ].map(m => (
            <div key={m.label} className="rounded-xl border border-border bg-card/50 p-2.5 text-center">
              <m.icon className={cn("h-3.5 w-3.5 mx-auto mb-1", m.color)} />
              <p className={cn("font-display text-sm font-bold", m.color)}>{m.value}</p>
              <p className="text-[9px] text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      </SitaCard>

      {/* Active alerts */}
      {activeAlerts.length > 0 && (
        <div className="space-y-2">
          <SitaSectionHeader title="Budget Alerts" subtitle={`${activeAlerts.length} active`} />
          {activeAlerts.slice(0, expanded ? undefined : 3).map(alert => (
            <motion.div key={alert.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
              <SitaCard className="p-3" lane={alert.severity === "critical" ? "action" : undefined}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className={cn("h-4 w-4 mt-0.5 shrink-0",
                    alert.severity === "critical" ? "text-destructive" : alert.severity === "warning" ? "text-accent" : "text-primary"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{alert.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{alert.suggestedAction}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Progress value={Math.min(alert.percentUsed, 100)} className="h-1.5 flex-1" />
                      <span className="text-[10px] text-muted-foreground">{alert.percentUsed.toFixed(0)}%</span>
                    </div>
                  </div>
                  <button onClick={() => acknowledgeAlert(alert.id)} className="shrink-0 rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                    <CheckCircle className="h-3.5 w-3.5" />
                  </button>
                </div>
              </SitaCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Rebalance proposals */}
      {localProposals.filter(p => p.status === "proposed").length > 0 && (
        <div className="space-y-2">
          <SitaSectionHeader title="Rebalance Proposals" subtitle="AI-recommended budget shifts" />
          {localProposals.filter(p => p.status === "proposed").map(p => (
            <SitaCard key={p.id} className="p-3" lane="opportunity">
              <div className="flex items-start gap-3">
                <ArrowRightLeft className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">
                    Move <span className="font-bold text-primary">${p.amount}</span> from {p.fromCategory} → {p.toCategory}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{p.reason}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <TrustBadge level="review" label={`${(p.confidence * 100).toFixed(0)}% confident`} size="sm" />
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => approveProposal(p.id)} className="rounded-lg bg-trust-verified/10 p-1.5 text-trust-safe hover:bg-trust-verified/20 transition-colors">
                    <CheckCircle className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => rejectProposal(p.id)} className="rounded-lg bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20 transition-colors">
                    <XCircle className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </SitaCard>
          ))}
        </div>
      )}

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
            {/* Spending Rules */}
            <div className="space-y-2">
              <SitaSectionHeader title="Spending Rules" subtitle={`${localRules.filter(r => r.enabled).length} active`} />
              {localRules.map(rule => (
                <SitaCard key={rule.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <Shield className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{rule.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {rule.category === "*" ? "All categories" : rule.category} · {rule.condition} {rule.threshold}% → {rule.action}
                        </p>
                      </div>
                    </div>
                    <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                  </div>
                </SitaCard>
              ))}
            </div>

            {/* Auto-Save Rules */}
            <div className="space-y-2">
              <SitaSectionHeader title="Auto-Save Rules" subtitle={`$${localAutoSave.reduce((s, r) => s + r.totalSaved, 0)} saved`} />
              {localAutoSave.map(rule => (
                <SitaCard key={rule.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <PiggyBank className="h-3.5 w-3.5 text-trust-safe shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{rule.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {rule.sourceCategory} → {rule.targetReserve} · ${rule.totalSaved} saved
                        </p>
                      </div>
                    </div>
                    <Switch checked={rule.enabled} onCheckedChange={() => toggleAutoSave(rule.id)} />
                  </div>
                </SitaCard>
              ))}
            </div>

            {/* Spending Patterns */}
            <div className="space-y-2">
              <SitaSectionHeader title="Spending Patterns" subtitle="Category analysis" />
              <SitaCard hover={false} className="p-3">
                <div className="space-y-2">
                  {patterns.map(p => (
                    <div key={p.category} className="flex items-center gap-3">
                      <span className="text-xs text-foreground w-28 truncate">{p.category}</span>
                      <Progress value={Math.min((p.anomalyScore) * 100, 100)} className="h-1.5 flex-1" />
                      <div className="flex items-center gap-1">
                        {p.trend === "increasing" && <TrendingUp className="h-3 w-3 text-accent" />}
                        {p.trend === "decreasing" && <TrendingDown className="h-3 w-3 text-trust-safe" />}
                        <span className={cn("text-[10px]",
                          p.trendPct > 5 ? "text-accent" : p.trendPct < -2 ? "text-trust-safe" : "text-muted-foreground"
                        )}>
                          {p.trendPct > 0 ? "+" : ""}{p.trendPct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </SitaCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
