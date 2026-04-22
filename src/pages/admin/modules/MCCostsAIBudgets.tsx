import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign, TrendingUp, BarChart3, RefreshCw, Zap, Brain,
  AlertTriangle, CheckCircle, Database, HardDrive, ArrowDown
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };

const COST_METRICS = {
  aiCostToday: 4.28,
  aiCostMonth: 89.42,
  tokenUsageToday: 847000,
  cacheHitRate: 72,
  localVsCloud: { local: 34, cloud: 66 },
  storageCost: 12.40,
  egressCost: 3.20,
  budgetUsed: 63,
  forecastMonth: 142,
};

const COST_BY_FEATURE = [
  { feature: "Business Advisor", cost: 1.84, percent: 43, tokens: 312000 },
  { feature: "Finance Advisor", cost: 0.96, percent: 22, tokens: 156000 },
  { feature: "Concierge Agent", cost: 0.62, percent: 14, tokens: 198000 },
  { feature: "Security Scanner", cost: 0.48, percent: 11, tokens: 89000 },
  { feature: "Sync Optimizer", cost: 0.38, percent: 9, tokens: 92000 },
];

const MODEL_TIER = [
  { tier: "Utility (nano/flash-lite)", percent: 38, cost: 0.84 },
  { tier: "Standard (flash/mini)", percent: 35, cost: 1.42 },
  { tier: "Premium (pro/gpt-5)", percent: 27, cost: 2.02 },
];

const MCCostsAIBudgets = () => {
  ;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Costs & AI Budgets</h1>
          <p className="text-sm text-muted-foreground mt-1">AI spend, token usage, storage costs, and budget governance</p>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><RefreshCw className="h-3 w-3" /> Refresh</Button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
        {/* Top Metrics */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "AI Cost Today", value: `$${COST_METRICS.aiCostToday}`, icon: Brain, color: "text-primary" },
            { label: "AI Cost MTD", value: `$${COST_METRICS.aiCostMonth}`, icon: DollarSign, color: "text-primary" },
            { label: "Cache Hit Rate", value: `${COST_METRICS.cacheHitRate}%`, icon: Zap, color: "text-emerald-400" },
            { label: "Budget Used", value: `${COST_METRICS.budgetUsed}%`, icon: BarChart3, color: "text-primary" },
          ].map(m => (
            <Card key={m.label} className="hover:-translate-y-0.5 transition-transform">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <m.icon className={`h-4 w-4 ${m.color}`} />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</span>
                </div>
                <p className="text-xl font-bold text-foreground">{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Budget Bar */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> Monthly Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-foreground">$89.42 spent</span>
                <span className="text-muted-foreground">$142 forecast · $200 budget</span>
              </div>
              <Progress value={COST_METRICS.budgetUsed} className="h-3" />
              <div className="flex items-center gap-4 mt-3 text-[11px]">
                <span className="flex items-center gap-1"><Brain className="h-3 w-3 text-primary" /> AI: ${COST_METRICS.aiCostMonth}</span>
                <span className="flex items-center gap-1"><HardDrive className="h-3 w-3 text-muted-foreground" /> Storage: ${COST_METRICS.storageCost}</span>
                <span className="flex items-center gap-1"><Database className="h-3 w-3 text-muted-foreground" /> Egress: ${COST_METRICS.egressCost}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Cost by Feature */}
          <motion.div variants={fadeUp}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">AI Cost by Feature</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {COST_BY_FEATURE.map(f => (
                  <div key={f.feature} className="flex items-center gap-3">
                    <span className="text-xs text-foreground w-32 shrink-0">{f.feature}</span>
                    <div className="flex-1"><Progress value={f.percent} className="h-2" /></div>
                    <span className="text-[10px] text-foreground w-12 text-right">${f.cost}</span>
                    <span className="text-[10px] text-muted-foreground w-16 text-right">{(f.tokens / 1000).toFixed(0)}k tok</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Model Tier */}
          <motion.div variants={fadeUp}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Model Tier Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {MODEL_TIER.map(t => (
                  <div key={t.tier} className="p-3 rounded-lg bg-muted/5 border border-border/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">{t.tier}</span>
                      <span className="text-xs text-muted-foreground">${t.cost}/day</span>
                    </div>
                    <Progress value={t.percent} className="h-1.5" />
                    <span className="text-[10px] text-muted-foreground">{t.percent}% of calls</span>
                  </div>
                ))}
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs text-foreground">Local vs Cloud: {COST_METRICS.localVsCloud.local}% local / {COST_METRICS.localVsCloud.cloud}% cloud</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {[
                { label: "Reduce AI Spend", icon: ArrowDown },
                { label: "Switch to Local Model", icon: Brain },
                { label: "Increase Cache", icon: Zap },
                { label: "Disable Low-Value Suggestions", icon: AlertTriangle },
                { label: "Review Budget Policies", icon: BarChart3 },
              ].map(a => (
                <Button key={a.label} variant="outline" size="sm" className="h-8 text-xs gap-1.5"><a.icon className="h-3 w-3" /> {a.label}</Button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MCCostsAIBudgets;
