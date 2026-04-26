import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown, Shield, Users, TrendingUp, Clock, AlertTriangle,
  CheckCircle, Star, Heart, DollarSign, BarChart3, FileText,
  Phone, Calendar, Target, ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCustomers } from "@/hooks/use-customers";
import {
  STRATEGIC_ACCOUNT_SAMPLES,
  ACCOUNT_HEALTH_FACTOR_SAMPLES,
  BUYING_COMMITTEE_SAMPLES,
  ACCOUNT_STRATEGY_SAMPLES,
} from "./_config/StrategicAccountRoom.config";

const tierColors: Record<string, string> = {
  Platinum: "bg-[hsl(265_55%_58%/0.12)] text-[hsl(var(--sita-purple))] border-[hsl(265_55%_58%/0.2)]",
  Gold: "bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))] border-[hsl(var(--sita-gold))]/20",
};

export default function StrategicAccountRoom() {
  const { customers } = useCustomers();
  const liveAccounts = customers
    .filter((c) => (c.lifetimeValueCents ?? 0) > 0)
    .sort((a, b) => (b.lifetimeValueCents ?? 0) - (a.lifetimeValueCents ?? 0))
    .slice(0, 6)
    .map((c, i) => {
      const ltv = c.lifetimeValueCents ?? 0;
      return {
        id: c.id,
        name: c.name ?? `Account ${i + 1}`,
        tier: (ltv >= 30_000_00 ? "Platinum" : "Gold") as "Platinum" | "Gold",
        revenue: ltv >= 1_000_00
          ? `$${Math.round(ltv / 100_000)}K`
          : `$${Math.round(ltv / 100).toLocaleString()}`,
        health: typeof c.healthScore === "number" ? Math.round(c.healthScore) : 70,
        contracts: 1,
        contacts: 1,
        since: c.createdAt ? new Date(c.createdAt).getFullYear().toString() : "—",
      };
    });
  const accounts = liveAccounts.length > 0 ? liveAccounts : STRATEGIC_ACCOUNT_SAMPLES;
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id ?? "");
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) ?? accounts[0];
  const [activeTab, setActiveTab] = useState<"health" | "committee" | "strategy">("health");

  return (
    <div className="flex h-full">
      {/* Account list */}
      <div className="w-[220px] shrink-0 border-r border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.01)] p-3 space-y-1.5 overflow-y-auto">
        <div className="flex items-center gap-2 px-2 mb-3">
          <Crown size={14} className="text-[hsl(var(--sita-gold))]" />
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-foreground/25">Strategic Accounts</p>
        </div>
        {accounts.map((acct) => (
          <button
            key={acct.id}
            onClick={() => setSelectedAccountId(acct.id)}
            className={cn(
              "w-full text-left rounded-xl p-3 transition-all",
              selectedAccount.id === acct.id
                ? "bg-[hsl(265_55%_58%/0.08)] border border-[hsl(265_55%_58%/0.2)]"
                : "hover:bg-[hsl(0_0%_100%/0.03)] border border-transparent"
            )}
          >
            <p className="text-[11px] font-semibold text-foreground/80 truncate">{acct.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-bold border", tierColors[acct.tier])}>{acct.tier}</span>
              <span className="text-[10px] font-bold text-foreground/50">{acct.revenue}/yr</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Heart size={9} className={cn(acct.health > 80 ? "text-[hsl(var(--trust-safe))]" : acct.health > 60 ? "text-[hsl(var(--sita-gold))]" : "text-[hsl(var(--destructive))]")} />
              <span className="text-[9px] text-foreground/30">{acct.health}% health</span>
            </div>
          </button>
        ))}
      </div>

      {/* Account detail */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <motion.div key={selectedAccount.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-lg font-bold text-foreground">{selectedAccount.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold border", tierColors[selectedAccount.tier])}>{selectedAccount.tier}</span>
                <span className="text-sm font-bold text-[hsl(var(--trust-safe))]">{selectedAccount.revenue}/yr</span>
                <span className="text-[10px] text-foreground/25">Since {selectedAccount.since}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-foreground/30">
              <span>{selectedAccount.contracts} contracts</span>
              <span>{selectedAccount.contacts} contacts</span>
            </div>
          </div>
        </motion.div>

        {/* Health ring */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Health", value: `${selectedAccount.health}%`, icon: Heart, color: selectedAccount.health > 80 ? "text-[hsl(var(--trust-safe))]" : "text-[hsl(var(--sita-gold))]" },
            { label: "Revenue", value: selectedAccount.revenue, icon: DollarSign, color: "text-[hsl(var(--trust-safe))]" },
            { label: "Contacts", value: `${selectedAccount.contacts}`, icon: Users, color: "text-[hsl(var(--sita-purple))]" },
            { label: "Contracts", value: `${selectedAccount.contracts}`, icon: FileText, color: "text-foreground/50" },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3 flex items-center gap-3">
              <m.icon size={16} className={cn("shrink-0", m.color)} />
              <div>
                <p className="text-lg font-bold text-foreground/90">{m.value}</p>
                <p className="text-[9px] text-foreground/30">{m.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-[hsl(0_0%_100%/0.06)]">
          {(["health", "committee", "strategy"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-2 text-[11px] font-semibold capitalize transition-colors border-b-2",
                activeTab === tab
                  ? "text-foreground/80 border-[hsl(var(--sita-purple))]"
                  : "text-foreground/30 border-transparent hover:text-foreground/50"
              )}
            >
              {tab === "committee" ? "Buying Committee" : tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "health" && (
            <motion.div key="health" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {ACCOUNT_HEALTH_FACTOR_SAMPLES.map((f) => (
                <div key={f.factor} className="flex items-center gap-3 rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3">
                  <span className="text-[11px] text-foreground/60 flex-1">{f.factor}</span>
                  <div className="w-24 h-1.5 rounded-full bg-[hsl(0_0%_100%/0.06)] overflow-hidden">
                    <div className={cn("h-full rounded-full", f.score > 80 ? "bg-[hsl(var(--trust-safe))]" : f.score > 60 ? "bg-[hsl(var(--sita-gold))]" : "bg-[hsl(var(--destructive))]")} style={{ width: `${f.score}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-foreground/40 w-8 text-right">{f.score}</span>
                  <span className={cn("text-[9px]", f.trend === "up" ? "text-[hsl(var(--trust-safe))]" : f.trend === "down" ? "text-[hsl(var(--destructive))]" : "text-foreground/30")}>
                    {f.trend === "up" ? "↑" : f.trend === "down" ? "↓" : "→"}
                  </span>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "committee" && (
            <motion.div key="committee" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {BUYING_COMMITTEE_SAMPLES.map((p) => (
                <div key={p.name} className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[hsl(265_55%_58%/0.15)] flex items-center justify-center text-xs font-bold text-[hsl(var(--sita-purple))]">
                    {p.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] font-semibold text-foreground/80">{p.name}</p>
                    <p className="text-[10px] text-foreground/40">{p.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[hsl(var(--sita-purple))]/10 text-[hsl(var(--sita-purple))] font-semibold">{p.role}</span>
                      {!p.engaged && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))] font-semibold">Not Engaged</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-foreground/25">Influence</p>
                    <p className="text-sm font-bold text-foreground/60">{p.influence}%</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "strategy" && (
            <motion.div key="strategy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {ACCOUNT_STRATEGY_SAMPLES.map((s, i) => (
                <div key={i} className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[12px] font-medium text-foreground/80">{s.objective}</p>
                    <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-semibold",
                      s.status === "in_progress" ? "bg-[hsl(var(--sita-purple))]/10 text-[hsl(var(--sita-purple))]" : "bg-[hsl(0_0%_100%/0.06)] text-foreground/30"
                    )}>{s.status === "in_progress" ? "In Progress" : "Planned"}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[hsl(0_0%_100%/0.06)] overflow-hidden">
                    <div className="h-full rounded-full bg-[hsl(var(--sita-purple))] transition-all" style={{ width: `${s.progress}%` }} />
                  </div>
                  <p className="text-[9px] text-foreground/25 mt-1">{s.progress}% complete</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
