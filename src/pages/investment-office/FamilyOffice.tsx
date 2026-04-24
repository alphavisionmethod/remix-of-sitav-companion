import { motion } from "framer-motion";
import { Users, Shield, Landmark, Heart, GraduationCap, Home, Check, AlertTriangle } from "lucide-react";
import { useCapitalPurposeBuckets } from "@/hooks/use-investment-office";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const fmt = (n: number) => n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : `$${(n / 1e3).toFixed(0)}K`;

export default function FamilyOffice() {
  const { data: liveData, isLoading } = useCapitalPurposeBuckets();
  return (
    <div className="mx-auto max-w-5xl space-y-6">
<div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Users className="h-6 w-6 text-primary" /> Family Office</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Household capital governance, shared goals, family rules, and multi-member permissions</p>
      </div>

      {/* Members */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-bold text-foreground">Household Members</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {([] as never[]).map(m => (
            <div key={m.name} className="rounded-xl border border-border bg-secondary/20 p-3 flex items-center gap-3">
              <span className="text-2xl">{m.emoji}</span>
              <div>
                <p className="text-xs font-bold text-foreground">{m.name}</p>
                <p className="text-[10px] text-muted-foreground">{m.role}</p>
                <p className="text-[9px] text-primary">{m.permissions}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Family Goals */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Heart className="h-4 w-4 text-primary" /> Family Goals</h3>
        {([] as never[]).map((g, i) => {
          const pct = Math.min((g.current / g.target) * 100, 100);
          return (
            <motion.div key={g.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="rounded-xl border border-border bg-secondary/10 p-4 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xl">{g.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">{g.label}</p>
                  <p className="text-[10px] text-muted-foreground">Target: {fmt(g.target)} by {g.deadline} · Contributing {fmt(g.monthlyContribution)}/mo</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                  g.status === "funded" ? "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" :
                  g.status === "on-track" ? "bg-primary/10 text-primary" :
                  "bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))]"
                }`}>{g.status}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{fmt(g.current)}</span>
                  <span>{pct.toFixed(0)}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Family Rules */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Family Investment Rules</h3>
        {([] as never[]).map((r, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            {r.status === "pass" || r.status === "active" ? <Check className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" /> : <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
            <span className="text-foreground">{r.rule}</span>
            {r.status === "active" && <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-bold text-primary uppercase">Active Rule</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
