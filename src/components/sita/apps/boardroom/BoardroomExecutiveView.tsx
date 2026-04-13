import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  AlertTriangle, ArrowUpRight, ArrowDownRight, Minus,
  Briefcase, DollarSign, Users, Sparkles, FileCheck, Play, Clock, Zap,
} from "lucide-react";
import { ConfidenceBar, ExecutionChainTimeline, buildDefaultChain } from "@/components/sita/primitives";
import { EvidenceChain, type EvidenceNode } from "@/components/sita/primitives/EvidenceChain";

interface Props {
  scope: "global" | "business" | "finance" | "concierge";
  onNavigate: (module: string) => void;
}

const AGENDA_ITEMS = [
  {
    id: "a1", title: "Collections action review — 3 overdue invoices",
    domain: "business", urgency: "high" as const, confidence: 72,
    motion: "Initiate phased recovery outreach",
    detail: "David Kim ($4,200), Sarah Chen ($1,800), TechCorp ($12,500) — combined $18,500 overdue. CRM advisor recommends segmented approach based on relationship value.",
    freshness: "Updated 12 min ago",
  },
  {
    id: "a2", title: "Reserve shortfall — $2,800 below target",
    domain: "finance", urgency: "medium" as const, confidence: 65,
    motion: "Defer non-essential subscriptions for 30 days",
    detail: "Current reserves at $7,200 vs $10,000 target. Three subscriptions totaling $342/mo identified as deferrable without operational impact.",
    freshness: "Updated 3 hours ago",
  },
  {
    id: "a3", title: "Travel prep decision — Q2 client visit",
    domain: "concierge", urgency: "low" as const, confidence: 88,
    motion: "Approve travel package and pre-book logistics",
    detail: "NYC client visit Apr 22-24. Flights, hotel, and restaurant reservations ready. All documents current. Prep items cleared.",
    freshness: "Updated 45 min ago",
  },
];

const SIGNALS = [
  { domain: "Business", icon: Briefcase, summary: "Pipeline pressure rising", metric: "3 deals stalled", trend: "down" as const, confidence: 68, freshness: "8 min ago" },
  { domain: "Finance", icon: DollarSign, summary: "Cash flow stabilizing", metric: "$7,200 reserves", trend: "up" as const, confidence: 74, freshness: "2 min ago" },
  { domain: "Concierge", icon: Users, summary: "Prep burden moderate", metric: "2 items overdue", trend: "flat" as const, confidence: 82, freshness: "1 hour ago" },
];

const WHAT_CHANGED = [
  { label: "TechCorp invoice aged to 45+ days — now flagged critical", domain: "business", time: "3 hours ago", type: "escalation" as const },
  { label: "Reserve buffer dropped below 75% threshold", domain: "finance", time: "6 hours ago", type: "warning" as const },
  { label: "NYC flight prices increased $120 — approval window closing", domain: "concierge", time: "1 hour ago", type: "info" as const },
];

const EVIDENCE_NODES: EvidenceNode[] = [
  { id: "e1", label: "Invoice aging report — 3 accounts overdue", type: "source", confidence: 95, detail: "Pulled from financial records 12 min ago" },
  { id: "e2", label: "CRM relationship scoring — TechCorp is top-tier", type: "inference", confidence: 78, detail: "Based on revenue history and engagement frequency" },
  { id: "e3", label: "Historical recovery rate for phased approach: 91%", type: "verification", confidence: 85, detail: "Based on 4 prior phased collections (Q3-Q1)" },
  { id: "e4", label: "Phased outreach preserves relationships + higher recovery", type: "conclusion", confidence: 72 },
];

const urgencyColors = {
  high: "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]/20",
  medium: "bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))] border-[hsl(var(--sita-gold))]/20",
  low: "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))] border-[hsl(var(--trust-safe))]/20",
};

const domainColors: Record<string, string> = {
  business: "text-[hsl(var(--sita-purple-light))]",
  finance: "text-[hsl(var(--trust-safe))]",
  concierge: "text-[hsl(var(--sita-gold))]",
};

const changeTypeStyles = {
  escalation: "border-[hsl(var(--destructive))]/20 bg-[hsl(var(--destructive))]/5",
  warning: "border-[hsl(var(--sita-gold))]/20 bg-[hsl(var(--sita-gold))]/5",
  info: "border-[hsl(var(--sita-purple))]/20 bg-[hsl(var(--sita-purple))]/5",
};

const TrendIcon = ({ trend }: { trend: "up" | "down" | "flat" }) => {
  if (trend === "up") return <ArrowUpRight size={14} className="text-[hsl(var(--trust-safe))]" />;
  if (trend === "down") return <ArrowDownRight size={14} className="text-[hsl(var(--destructive))]" />;
  return <Minus size={14} className="text-muted-foreground" />;
};

const mockChain = buildDefaultChain("simulation");

export function BoardroomExecutiveView({ scope, onNavigate }: Props) {
  const [activeAgenda, setActiveAgenda] = useState("a1");

  const filteredAgenda = scope === "global"
    ? AGENDA_ITEMS
    : AGENDA_ITEMS.filter((a) => a.domain === scope);

  const filteredSignals = scope === "global"
    ? SIGNALS
    : SIGNALS.filter((s) => s.domain.toLowerCase() === scope);

  const active = filteredAgenda.find((a) => a.id === activeAgenda) || filteredAgenda[0];

  return (
    <div className="space-y-6 p-6">
      {/* Section: Agenda Table */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)] mb-3">
          Current Agenda {scope !== "global" && `— ${scope}`}
        </p>
        <div className="space-y-2">
          {filteredAgenda.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setActiveAgenda(item.id)}
              className={cn(
                "w-full text-left rounded-xl border p-4 transition-all duration-200",
                activeAgenda === item.id
                  ? "bg-[hsl(280_40%_50%/0.06)] border-[hsl(280_50%_55%/0.25)] shadow-[0_0_20px_hsl(280_50%_50%/0.08)]"
                  : "bg-[hsl(0_0%_100%/0.02)] border-[hsl(0_0%_100%/0.06)] hover:bg-[hsl(0_0%_100%/0.04)]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-[10px] font-bold uppercase", domainColors[item.domain])}>
                      {item.domain}
                    </span>
                    <span className={cn("text-[9px] font-semibold px-2 py-0.5 rounded-full border", urgencyColors[item.urgency])}>
                      {item.urgency}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] text-[hsl(0_0%_100%/0.25)] ml-auto">
                      <Clock size={9} /> {item.freshness}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[hsl(0_0%_100%/0.9)]">{item.title}</p>
                  {activeAgenda === item.id && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-[12px] text-[hsl(0_0%_100%/0.45)] mt-2 leading-relaxed"
                    >
                      {item.detail}
                    </motion.p>
                  )}
                </div>
                <ConfidenceBar value={item.confidence} size="sm" className="w-24 shrink-0" />
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[hsl(280_40%_70%/0.7)]">
                <Sparkles size={12} />
                <span className="italic">Motion: {item.motion}</span>
              </div>
            </motion.button>
          ))}
          {filteredAgenda.length === 0 && (
            <p className="text-[12px] text-[hsl(0_0%_100%/0.3)] text-center py-8">No agenda items for this scope.</p>
          )}
        </div>
      </div>

      {/* Section: What Changed */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)] mb-3 flex items-center gap-1.5">
          <Zap size={11} /> What Changed Since Last Session
        </p>
        <div className="space-y-1.5">
          {WHAT_CHANGED.filter(c => scope === "global" || c.domain === scope).map((change, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn("rounded-lg border p-3 flex items-center gap-3", changeTypeStyles[change.type])}
            >
              <span className={cn("text-[10px] font-bold uppercase shrink-0 w-16", domainColors[change.domain])}>
                {change.domain}
              </span>
              <p className="text-[12px] text-[hsl(0_0%_100%/0.6)] flex-1">{change.label}</p>
              <span className="text-[9px] text-[hsl(0_0%_100%/0.25)] shrink-0 flex items-center gap-1">
                <Clock size={9} /> {change.time}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Section: Cross-Domain Signals */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)] mb-3">
          Cross-Domain Signals
        </p>
        <div className="grid grid-cols-3 gap-3">
          {filteredSignals.map((sig, i) => (
            <motion.div
              key={sig.domain}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <sig.icon size={14} className="text-[hsl(0_0%_100%/0.4)]" />
                  <span className="text-[11px] font-semibold text-[hsl(0_0%_100%/0.7)]">{sig.domain}</span>
                </div>
                <TrendIcon trend={sig.trend} />
              </div>
              <p className="text-[12px] text-[hsl(0_0%_100%/0.5)] mb-1">{sig.summary}</p>
              <p className="text-sm font-bold text-[hsl(0_0%_100%/0.85)] tabular-nums">{sig.metric}</p>
              <ConfidenceBar value={sig.confidence} size="sm" showValue={false} className="mt-2" />
              <span className="text-[9px] text-[hsl(0_0%_100%/0.2)] flex items-center gap-1 mt-1.5">
                <Clock size={8} /> {sig.freshness}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Section: Recommended Motion */}
      {active && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)] mb-3">
            Recommended Motion
          </p>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl border border-[hsl(280_50%_50%/0.2)] bg-[hsl(280_40%_50%/0.04)] p-6 shadow-[0_0_40px_hsl(280_50%_40%/0.06)]"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h3 className="text-base font-bold text-[hsl(0_0%_100%/0.95)] mb-1">{active.motion}</h3>
                <p className="text-[12px] text-[hsl(0_0%_100%/0.45)] leading-relaxed">
                  Based on {active.domain} advisor synthesis. {active.detail?.split(".")[0]}.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-[9px] font-semibold px-2 py-0.5 rounded-full border", urgencyColors[active.urgency])}>
                  {active.urgency} priority
                </span>
                <span className="flex items-center gap-1 text-[10px] text-[hsl(0_0%_100%/0.4)] bg-[hsl(0_0%_100%/0.04)] px-2 py-0.5 rounded-full">
                  <FileCheck size={10} /> 4 sources
                </span>
              </div>
            </div>

            <ConfidenceBar value={active.confidence} label="System Confidence" className="mb-5" />
            <ExecutionChainTimeline steps={mockChain} compact className="mb-5" />

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate("simulation")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[hsl(280_50%_50%/0.15)] border border-[hsl(280_50%_50%/0.3)] text-[hsl(280_50%_75%)] text-[12px] font-semibold hover:bg-[hsl(280_50%_50%/0.25)] transition-all"
              >
                <Play size={14} /> Simulate First
              </button>
              <button
                onClick={() => onNavigate("approvals")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[hsl(var(--trust-safe))]/10 border border-[hsl(var(--trust-safe))]/30 text-[hsl(var(--trust-safe))] text-[12px] font-semibold hover:bg-[hsl(var(--trust-safe))]/20 transition-all"
              >
                <FileCheck size={14} /> Approve Motion
              </button>
            </div>
          </motion.div>

          {/* Evidence Chain */}
          <div className="mt-4">
            <EvidenceChain title="Evidence Trail — How This Conclusion Was Reached" nodes={EVIDENCE_NODES} />
          </div>
        </div>
      )}
    </div>
  );
}
