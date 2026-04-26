// truth-allow: ia-config
import { useState } from "react";
import { motion } from "framer-motion";
import { ScrollText, Shield, Check, AlertTriangle, Settings, Lock } from "lucide-react";
import { useInvestmentStrategyRecords } from "@/hooks/use-investment-office";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

// Production fallback — seed data removed
const CATEGORIES: any[] = [];

interface Rule {
  id: string;
  label: string;
  description: string;
  value: string;
  category: "sizing" | "behavior" | "governance" | "discipline";
  active: boolean;
  severity: "hard" | "soft";
}

export default function InvestmentConstitution() {
  const { data: liveData, isLoading } = useInvestmentStrategyRecords();
  const [filter, setFilter] = useState("all");
  const filtered = ([] as any[]).filter(r => filter === "all" || r.category === filter);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
<div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><ScrollText className="h-6 w-6 text-primary" /> Personal Investment Constitution</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your living rulebook for disciplined investing. Advisors enforce these gently.</p>
      </div>

      {/* Violations Banner */}
      {([] as any[]).length > 0 && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 space-y-2">
          <p className="text-[10px] font-semibold text-destructive uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> {([] as any[]).length} Active Violations
          </p>
          {([] as any[]).map(v => {
            const rule = ([] as any[]).find(r => r.id === v.ruleId);
            return (
              <div key={v.ruleId} className="flex items-start gap-2 text-sm text-foreground">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                <span><strong>{rule?.label}:</strong> {v.detail}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1.5">
        {([] as any[]).map(c => (
          <button key={c.id} onClick={() => setFilter(c.id)}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              filter === c.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}>{c.label}</button>
        ))}
      </div>

      {/* Rules */}
      <div className="space-y-3">
        {filtered.map((rule, i) => {
          const isViolated = ([] as any[]).some(v => v.ruleId === rule.id);
          return (
            <motion.div key={rule.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className={`rounded-2xl border p-5 space-y-2 ${
                isViolated ? "border-destructive/20 bg-destructive/5" :
                rule.active ? "border-border bg-card" : "border-border/50 bg-card/50 opacity-60"
              }`}>
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-1.5 ${rule.severity === "hard" ? "bg-destructive/10" : "bg-[hsl(var(--trust-warn))]/10"}`}>
                  {rule.severity === "hard" ? <Lock className="h-3.5 w-3.5 text-destructive" /> : <Shield className="h-3.5 w-3.5 text-[hsl(var(--trust-warn))]" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">{rule.label}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${
                      rule.severity === "hard" ? "bg-destructive/10 text-destructive" : "bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))]"
                    }`}>{rule.severity} limit</span>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[8px] text-muted-foreground capitalize">{rule.category}</span>
                    {isViolated && <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[8px] font-bold text-destructive">VIOLATED</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{rule.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-foreground">{rule.value}</p>
                  <p className={`text-[9px] font-medium ${rule.active ? "text-[hsl(var(--trust-safe))]" : "text-muted-foreground"}`}>
                    {rule.active ? "Active" : "Disabled"}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
