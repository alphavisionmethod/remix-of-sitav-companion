import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Users, TrendingUp, AlertTriangle, CheckCircle, Clock,
  FileText, Phone, Mail, Calendar, DollarSign, Shield, ChevronRight,
  BarChart3, ArrowUpRight, Star, Briefcase, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDeals } from "@/hooks/use-deals";
import {
  DEAL_SAMPLES,
  DEAL_RISK_FACTORS,
  DEAL_STAKEHOLDERS,
  DEAL_STAGE_PLAYBOOK,
  DEAL_CLOSE_SCENARIOS,
} from "./_config/DealRoom.config";

const healthColors: Record<string, string> = {
  good: "text-[hsl(var(--trust-safe))]",
  warning: "text-[hsl(var(--sita-gold))]",
  critical: "text-[hsl(var(--destructive))]",
};

const sentimentColors: Record<string, string> = {
  positive: "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]",
  neutral: "bg-[hsl(0_0%_100%/0.06)] text-foreground/40",
  negative: "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]",
};

const roleColors: Record<string, string> = {
  "Decision Maker": "bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]",
  "Champion": "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]",
  "Evaluator": "bg-[hsl(var(--sita-purple))]/10 text-[hsl(var(--sita-purple))]",
  "Blocker": "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]",
};

export default function DealRoom() {
  const { deals: liveDeals } = useDeals();
  const deals = liveDeals.length > 0
    ? liveDeals.map((d) => ({
        id: d.id,
        name: d.name,
        value: d.valueDisplay ?? `$${(d.valueCents / 100).toLocaleString()}`,
        stage: d.stage,
        probability: d.probability,
        daysInStage: d.daysInStage,
        contacts: d.contactCount ?? 0,
        nextAction: d.nextAction ?? "Review deal status",
        health: (d.health ?? "good") as "good" | "warning" | "critical",
      }))
    : DEAL_SAMPLES;
  const [selectedDealId, setSelectedDealId] = useState<string>(deals[0]?.id ?? "");
  const selectedDeal = deals.find((d) => d.id === selectedDealId) ?? deals[0];
  const [activeTab, setActiveTab] = useState<"overview" | "stakeholders" | "playbook" | "scenarios">("overview");

  return (
    <div className="flex h-full">
      {/* Deal list sidebar */}
      <div className="w-[220px] shrink-0 border-r border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.01)] p-3 space-y-1.5 overflow-y-auto">
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-foreground/25 px-2 mb-2">Active Deals</p>
        {deals.map((deal) => (
          <button
            key={deal.id}
            onClick={() => setSelectedDealId(deal.id)}
            className={cn(
              "w-full text-left rounded-xl p-3 transition-all",
              selectedDeal.id === deal.id
                ? "bg-[hsl(265_55%_58%/0.08)] border border-[hsl(265_55%_58%/0.2)]"
                : "hover:bg-[hsl(0_0%_100%/0.03)] border border-transparent"
            )}
          >
            <p className="text-[11px] font-semibold text-foreground/80 truncate">{deal.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-foreground/60">{deal.value}</span>
              <span className={cn("text-[9px]", healthColors[deal.health])}>{deal.probability}%</span>
            </div>
            <p className="text-[9px] text-foreground/25 mt-0.5">{deal.stage} · {deal.daysInStage}d</p>
          </button>
        ))}
      </div>

      {/* Deal room main */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Deal header */}
        <motion.div key={selectedDeal.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">{selectedDeal.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm font-bold text-[hsl(var(--trust-safe))]">{selectedDeal.value}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[hsl(var(--sita-purple))]/10 text-[hsl(var(--sita-purple))] font-semibold">{selectedDeal.stage}</span>
              <span className="text-[10px] text-foreground/30">{selectedDeal.probability}% probability</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-foreground/25">{selectedDeal.daysInStage} days in stage</span>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-[hsl(0_0%_100%/0.06)] pb-0">
          {(["overview", "stakeholders", "playbook", "scenarios"] as const).map((tab) => (
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
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-4">
              {/* Next action */}
              <div className="rounded-xl border border-[hsl(var(--sita-gold))]/20 bg-[hsl(var(--sita-gold))]/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-[hsl(var(--sita-gold))]" />
                  <span className="text-[10px] font-bold uppercase text-foreground/50">Next Best Move</span>
                </div>
                <p className="text-[12px] font-medium text-foreground/80">{selectedDeal.nextAction}</p>
              </div>

              {/* Risk factors */}
              <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={14} className="text-[hsl(var(--destructive))]" />
                  <span className="text-[10px] font-bold uppercase text-foreground/50">Risk Factors</span>
                </div>
                <div className="space-y-1.5">
                  {DEAL_RISK_FACTORS.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", r.severity === "high" ? "bg-[hsl(var(--destructive))]" : "bg-[hsl(var(--sita-gold))]")} />
                      <span className="text-[10px] text-foreground/50">{r.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity feed */}
              <div className="col-span-2 rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={14} className="text-foreground/30" />
                  <span className="text-[10px] font-bold uppercase text-foreground/50">Recent Activity</span>
                </div>
                <div className="space-y-2">
                  {[
                    { icon: Phone, text: "Discovery call with Sarah Chen — 45 min", time: "Yesterday" },
                    { icon: Mail, text: "Proposal v2 sent to Mike Johnson", time: "2 days ago" },
                    { icon: FileText, text: "Technical requirements document shared", time: "4 days ago" },
                    { icon: Calendar, text: "Demo scheduled for next Tuesday", time: "5 days ago" },
                  ].map((a, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <a.icon size={11} className="text-foreground/25 shrink-0" />
                      <span className="text-[10px] text-foreground/60 flex-1">{a.text}</span>
                      <span className="text-[9px] text-foreground/20">{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "stakeholders" && (
            <motion.div key="stakeholders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {DEAL_STAKEHOLDERS.map((s) => (
                <div key={s.name} className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[hsl(265_55%_58%/0.15)] flex items-center justify-center text-xs font-bold text-[hsl(var(--sita-purple))]">
                    {s.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] font-semibold text-foreground/80">{s.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-semibold", roleColors[s.role])}>{s.role}</span>
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-semibold", sentimentColors[s.sentiment])}>{s.sentiment}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-foreground/25">Last contact</p>
                    <p className="text-[10px] text-foreground/50">{s.lastContact}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "playbook" && (
            <motion.div key="playbook" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              <p className="text-xs font-bold text-foreground/50 mb-3">Stage Playbook — {selectedDeal.stage}</p>
              {DEAL_STAGE_PLAYBOOK.map((step, i) => (
                <div key={i} className={cn("flex items-center gap-3 rounded-lg p-3 border", step.done ? "border-[hsl(var(--trust-safe))]/15 bg-[hsl(var(--trust-safe))]/5" : "border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)]")}>
                  {step.done ? (
                    <CheckCircle size={14} className="text-[hsl(var(--trust-safe))] shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-foreground/15 shrink-0" />
                  )}
                  <span className={cn("text-[11px]", step.done ? "text-foreground/40 line-through" : "text-foreground/70 font-medium")}>{step.step}</span>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "scenarios" && (
            <motion.div key="scenarios" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <p className="text-xs font-bold text-foreground/50 mb-3">Close Scenarios</p>
              {DEAL_CLOSE_SCENARIOS.map((s) => (
                <div key={s.name} className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-semibold text-foreground/80">{s.name}</span>
                    <span className="text-sm font-bold text-[hsl(var(--trust-safe))]">{s.value}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <BarChart3 size={10} className="text-foreground/25" />
                      <span className="text-[10px] text-foreground/40">{s.probability}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={10} className="text-foreground/25" />
                      <span className="text-[10px] text-foreground/40">{s.timeline}</span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
