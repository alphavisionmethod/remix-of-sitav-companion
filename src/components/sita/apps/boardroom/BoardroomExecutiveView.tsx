import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  AlertTriangle, ArrowUpRight, ArrowDownRight, Minus,
  Briefcase, DollarSign, Users, Sparkles, FileCheck, Play,
} from "lucide-react";
import { ConfidenceBar } from "@/components/sita/primitives";
import { ExecutionChainTimeline, buildDefaultChain } from "@/components/sita/primitives";

const AGENDA_ITEMS = [
  {
    id: "a1", title: "Collections action review — 3 overdue invoices",
    domain: "business", urgency: "high" as const, confidence: 72,
    motion: "Initiate phased recovery outreach",
    detail: "David Kim ($4,200), Sarah Chen ($1,800), TechCorp ($12,500) — combined $18,500 overdue. CRM advisor recommends segmented approach based on relationship value.",
  },
  {
    id: "a2", title: "Reserve shortfall — $2,800 below target",
    domain: "finance", urgency: "medium" as const, confidence: 65,
    motion: "Defer non-essential subscriptions for 30 days",
    detail: "Current reserves at $7,200 vs $10,000 target. Three subscriptions totaling $342/mo identified as deferrable without operational impact.",
  },
  {
    id: "a3", title: "Travel prep decision — Q2 client visit",
    domain: "concierge", urgency: "low" as const, confidence: 88,
    motion: "Approve travel package and pre-book logistics",
    detail: "NYC client visit Apr 22-24. Flights, hotel, and restaurant reservations ready. All documents current. Prep items cleared.",
  },
];

const SIGNALS = [
  { domain: "Business", icon: Briefcase, summary: "Pipeline pressure rising", metric: "3 deals stalled", trend: "down" as const, confidence: 68 },
  { domain: "Finance", icon: DollarSign, summary: "Cash flow stabilizing", metric: "$7,200 reserves", trend: "up" as const, confidence: 74 },
  { domain: "Concierge", icon: Users, summary: "Prep burden moderate", metric: "2 items overdue", trend: "flat" as const, confidence: 82 },
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

const TrendIcon = ({ trend }: { trend: "up" | "down" | "flat" }) => {
  if (trend === "up") return <ArrowUpRight size={14} className="text-[hsl(var(--trust-safe))]" />;
  if (trend === "down") return <ArrowDownRight size={14} className="text-[hsl(var(--destructive))]" />;
  return <Minus size={14} className="text-muted-foreground" />;
};

const mockChain = buildDefaultChain("simulation");

export function BoardroomExecutiveView() {
  const [activeAgenda, setActiveAgenda] = useState("a1");
  const active = AGENDA_ITEMS.find((a) => a.id === activeAgenda)!;

  return (
    <div className="space-y-6 p-6">
      {/* Section: Agenda Table */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)] mb-3">
          Current Agenda
        </p>
        <div className="space-y-2">
          {AGENDA_ITEMS.map((item, i) => (
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
        </div>
      </div>

      {/* Section: Cross-Domain Signals */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)] mb-3">
          Cross-Domain Signals
        </p>
        <div className="grid grid-cols-3 gap-3">
          {SIGNALS.map((sig, i) => (
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
            </motion.div>
          ))}
        </div>
      </div>

      {/* Section: Recommended Motion */}
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
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[hsl(280_50%_50%/0.15)] border border-[hsl(280_50%_50%/0.3)] text-[hsl(280_50%_75%)] text-[12px] font-semibold hover:bg-[hsl(280_50%_50%/0.25)] transition-all">
              <Play size={14} /> Simulate First
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[hsl(var(--trust-safe))]/10 border border-[hsl(var(--trust-safe))]/30 text-[hsl(var(--trust-safe))] text-[12px] font-semibold hover:bg-[hsl(var(--trust-safe))]/20 transition-all">
              <FileCheck size={14} /> Approve Motion
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
