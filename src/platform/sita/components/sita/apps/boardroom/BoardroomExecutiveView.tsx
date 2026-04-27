import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  AlertTriangle, ArrowUpRight, ArrowDownRight, Minus,
  Briefcase, DollarSign, Users, Sparkles, FileCheck, Play, Clock, Zap, MessageCircle,
} from "lucide-react";
import { ConfidenceBar, ExecutionChainTimeline, buildDefaultChain } from "@/platform/sita/components/sita/primitives";
import { EvidenceChain, type EvidenceNode } from "@/platform/sita/components/sita/primitives/EvidenceChain";
import { BoardroomAdvisorCouncil } from "./BoardroomAdvisorCouncil";
import { BoardroomIssueFrame } from "./BoardroomIssueFrame";
import { useCountUp, useCountUpFormatted } from "@/hooks/useCountUp";
import { SparklineChart } from "@/platform/sita/components/sita/SparklineChart";
import { TrustStateBadge, type TrustState } from "@/platform/sita/components/sita/TrustStateBadge";
import { useBoardroomLiveData } from "@/platform/boardroom/hooks/useBoardroomLiveData";
import { getSynthesisForDomain } from "@/lib/services/orchestration-pipeline/app-board-synthesizer";
import { getTransmissionLog } from "@/lib/services/orchestration-pipeline/signal-emitter";
import type { Domain } from "@/lib/services/orchestration-pipeline/types";
import { useDataMode } from "@/contexts/DataModeContext";

interface Props {
  scope: "global" | "business" | "finance" | "concierge";
  onNavigate: (module: string) => void;
}

const HERO_METRICS: { label: string; value: string; rawValue: number; sparkData: number[]; positive: boolean; trustState: TrustState }[] = [
  { label: "Total Overdue", value: "$18.5K", rawValue: 18500, sparkData: [12000, 14200, 15800, 16100, 17400, 18000, 18500], positive: false, trustState: "verified" },
  { label: "Reserves", value: "$7.2K", rawValue: 7200, sparkData: [9800, 9200, 8600, 8100, 7800, 7400, 7200], positive: false, trustState: "evidence-backed" },
  { label: "Pending Actions", value: "3", rawValue: 3, sparkData: [1, 2, 1, 3, 2, 4, 3], positive: false, trustState: "inferred" },
  { label: "Advisor Consensus", value: "72%", rawValue: 72, sparkData: [65, 68, 70, 69, 71, 73, 72], positive: true, trustState: "advisory-only" },
];

const FALLBACK_SIGNALS = [
  { domain: "Business", icon: Briefcase, summary: "Pipeline pressure rising", metric: "3 deals stalled", trend: "down" as const, confidence: 68, freshness: "8 min ago", trustState: "evidence-backed" as TrustState },
  { domain: "Finance", icon: DollarSign, summary: "Cash flow stabilizing", metric: "$7,200 reserves", trend: "up" as const, confidence: 74, freshness: "2 min ago", trustState: "verified" as TrustState },
  { domain: "Concierge", icon: Users, summary: "Prep burden moderate", metric: "2 items overdue", trend: "flat" as const, confidence: 82, freshness: "1 hour ago", trustState: "inferred" as TrustState },
];

const FALLBACK_WHAT_CHANGED = [
  { label: "TechCorp invoice aged to 45+ days — now flagged critical", domain: "business", time: "3 hours ago", type: "escalation" as const },
  { label: "Reserve buffer dropped below 75% threshold", domain: "finance", time: "6 hours ago", type: "warning" as const },
  { label: "NYC flight prices increased $120 — approval window closing", domain: "concierge", time: "1 hour ago", type: "info" as const },
];

/** Build signals from live pipeline synthesis data, with fallback */
function buildLiveSignals(scope: string) {
  const domains: Domain[] = scope === "global" ? ["business", "finance", "concierge"] : [scope as Domain];
  const signals: typeof FALLBACK_SIGNALS = [];

  for (const domain of domains) {
    const synthesis = getSynthesisForDomain(domain);
    if (synthesis) {
      const label = domain.charAt(0).toUpperCase() + domain.slice(1);
      const IconComp = label === "Business" ? Briefcase : label === "Finance" ? DollarSign : Users;
      signals.push({
        domain: label,
        icon: IconComp,
        summary: synthesis.issue_summary.slice(0, 60),
        metric: `${synthesis.module_advisor_positions.length} advisors`,
        trend: synthesis.boardroom_worthiness_score > 0.6 ? "down" as const : synthesis.boardroom_worthiness_score > 0.3 ? "flat" as const : "up" as const,
        confidence: Math.round(synthesis.module_advisor_positions.reduce((s, p) => s + p.confidence, 0) / Math.max(1, synthesis.module_advisor_positions.length)),
        freshness: "Live",
        trustState: synthesis.trust_state as TrustState,
      });
    }
  }

  return signals.length > 0 ? signals : FALLBACK_SIGNALS;
}

/** Build "What Changed" from transmission log, with fallback */
function buildLiveWhatChanged() {
  const log = getTransmissionLog();
  if (log.length === 0) return FALLBACK_WHAT_CHANGED;

  return log.slice(-5).reverse().map((entry) => {
    const timeDiff = Date.now() - entry.timestamp;
    const minutes = Math.floor(timeDiff / 60000);
    const timeLabel = minutes < 1 ? "Just now" : minutes < 60 ? `${minutes} min ago` : `${Math.floor(minutes / 60)}h ago`;

    return {
      label: `${entry.packet_type} transmitted from ${entry.source_layer} → ${entry.destination_layer}`,
      domain: entry.packet_id.includes("business") ? "business" : entry.packet_id.includes("finance") ? "finance" : "concierge",
      time: timeLabel,
      type: (entry.status === "failed" ? "escalation" : entry.source_layer.includes("A:") ? "info" : "warning") as "escalation" | "warning" | "info",
    };
  });
}

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

const chain = buildDefaultChain("simulation");

function MorningBrief({ scope }: { scope: string }) {
  // Generate brief from live synthesis when available
  const domains: Domain[] = scope === "global" ? ["business", "finance", "concierge"] : [scope as Domain];
  const synthParts: string[] = [];
  for (const d of domains) {
    const synth = getSynthesisForDomain(d);
    if (synth) {
      synthParts.push(synth.recommendation.slice(0, 100));
    }
  }

  const text = synthParts.length > 0
    ? synthParts.join(". ") + "."
    : scope === "business"
    ? "Pipeline pressure is rising with 3 stalled deals. Collections are the top priority — $18.5K overdue across 3 accounts. CRM advisors recommend a segmented recovery approach."
    : scope === "finance"
    ? "Reserves are $2,800 below target at $7,200. Three deferrable subscriptions identified worth $342/mo. Receivables collection can restore buffer within 3 weeks."
    : scope === "concierge"
    ? "Travel prep for your NYC client visit is fully cleared. School enrollment needs immediate attention — overdue. Automation rate is healthy at 68%."
    : "3 items need your attention today. Collections pressure is the top priority — $18.5K overdue. Your reserves are recovering. Travel prep is fully cleared.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="rounded-2xl border border-[hsl(280_50%_50%/0.15)] bg-[hsl(280_40%_50%/0.03)] p-4 md:p-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[hsl(280_50%_50%/0.06)] blur-3xl pointer-events-none" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[hsl(280_50%_65%/0.5)] mb-3 flex items-center gap-1.5">
        <Sparkles size={11} /> Morning Brief
      </p>
      <p className="text-[13px] md:text-[15px] leading-relaxed text-[hsl(0_0%_100%/0.75)] font-light tracking-wide relative z-10" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
        {text}
      </p>
    </motion.div>
  );
}

function PriorityHeatStrip({ items }: { items: { id: string; urgency: string; heatPosition: number; title: string }[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0.8 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="relative h-6 rounded-full overflow-hidden"
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: "linear-gradient(90deg, hsl(0 80% 50% / 0.4) 0%, hsl(40 90% 55% / 0.3) 50%, hsl(145 60% 45% / 0.3) 100%)" }}
      />
      {items.map((item, idx) => (
        <motion.div
          key={item.id}
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[hsl(220_18%_4%)]"
          style={{
            left: `${item.heatPosition * 100}%`,
            backgroundColor:
              item.urgency === "high" ? "hsl(0 80% 55%)"
              : item.urgency === "medium" ? "hsl(40 90% 55%)"
              : "hsl(145 60% 50%)",
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 + idx * 0.1 }}
          title={item.title}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
        <span className="text-[8px] font-bold uppercase text-[hsl(0_0%_100%/0.3)]">Urgent</span>
        <span className="text-[8px] font-bold uppercase text-[hsl(0_0%_100%/0.3)]">Clear</span>
      </div>
    </motion.div>
  );
}

export function BoardroomExecutiveView({ scope, onNavigate }: Props) {
  const { items, isDemoMode } = useBoardroomLiveData();
  const [activeAgenda, setActiveAgenda] = useState<string | null>(null);

  // Map live items to agenda format
  const agendaItems = items.map((item, i) => ({
    id: item.id,
    title: item.title,
    domain: item.domain,
    urgency: (item.severity === "high" ? "high" : item.severity === "medium" ? "medium" : "low") as "high" | "medium" | "low",
    confidence: (item.confidence_state as any)?.overall || 70,
    motion: Object.values(item.advisor_summaries || {})[0] as string || "Pending recommendation",
    detail: item.description,
    freshness: (item.freshness_state as any)?.last_check || "Recent",
    heatPosition: i === 0 ? 0.15 : i === 1 ? 0.5 : 0.85,
    trustState: (item.simulation_state === "complete" ? "simulation-only" : item.confidence_state?.overall >= 80 ? "evidence-backed" : "inferred") as TrustState,
  }));

  const filteredAgenda = scope === "global"
    ? agendaItems
    : agendaItems.filter((a) => a.domain === scope);

  const SIGNALS = buildLiveSignals(scope);
  const WHAT_CHANGED = buildLiveWhatChanged();

  const filteredSignals = scope === "global"
    ? SIGNALS
    : SIGNALS.filter((s) => s.domain.toLowerCase() === scope);

  const currentActive = activeAgenda || filteredAgenda[0]?.id;
  const active = filteredAgenda.find((a) => a.id === currentActive) || filteredAgenda[0];

  return (
    <div className="space-y-5 p-4 md:p-6">
      <BoardroomIssueFrame onNavigate={onNavigate} />
      <MorningBrief scope={scope} />

      {/* Hero Metrics — responsive */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {HERO_METRICS.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3 md:p-4 backdrop-blur-sm hover:bg-[hsl(0_0%_100%/0.04)] hover:border-[hsl(280_50%_50%/0.15)] hover:shadow-[0_4px_20px_hsl(280_50%_50%/0.06)] transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-[9px] font-medium text-[hsl(0_0%_100%/0.35)] uppercase tracking-wider">{m.label}</p>
              <TrustStateBadge state={m.trustState} />
            </div>
            <div className="flex items-end justify-between gap-2">
              <p className="text-lg font-bold text-[hsl(0_0%_100%/0.9)] tabular-nums">
                {useCountUpFormatted(m.value, 1000)}
              </p>
              <SparklineChart data={m.sparkData} width={50} height={18} positive={m.positive} />
            </div>
          </motion.div>
        ))}
      </div>

      <PriorityHeatStrip items={filteredAgenda} />

      {/* Agenda */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)] mb-3">
          Current Agenda {scope !== "global" && `— ${scope}`}
          {isDemoMode && <span className="ml-2 text-[8px] text-[hsl(0_0%_100%/0.2)]">(demo)</span>}
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
                "w-full text-left rounded-xl border p-3 md:p-4 transition-all duration-200 group hover:shadow-[0_4px_20px_hsl(280_50%_50%/0.06)]",
                currentActive === item.id
                  ? "bg-[hsl(280_40%_50%/0.06)] border-[hsl(280_50%_55%/0.25)] shadow-[0_0_20px_hsl(280_50%_50%/0.08)]"
                  : "bg-[hsl(0_0%_100%/0.02)] border-[hsl(0_0%_100%/0.06)] hover:bg-[hsl(0_0%_100%/0.04)]",
              )}
            >
              <div className="flex items-start justify-between gap-2 md:gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={cn("text-[10px] font-bold uppercase", domainColors[item.domain])}>
                      {item.domain}
                    </span>
                    <span className={cn("text-[9px] font-semibold px-2 py-0.5 rounded-full border", urgencyColors[item.urgency])}>
                      {item.urgency}
                    </span>
                    <TrustStateBadge state={item.trustState} />
                    <span className="flex items-center gap-1 text-[9px] text-[hsl(0_0%_100%/0.25)] ml-auto">
                      <Clock size={9} /> {item.freshness}
                    </span>
                  </div>
                  <p className="text-[13px] md:text-sm font-semibold text-[hsl(0_0%_100%/0.9)]">{item.title}</p>
                  {currentActive === item.id && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-[12px] text-[hsl(0_0%_100%/0.45)] mt-2 leading-relaxed"
                    >
                      {item.detail}
                    </motion.p>
                  )}
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <ConfidenceBar value={item.confidence} size="sm" className="w-24 shrink-0" />
                  <motion.span
                    className="text-[9px] font-semibold px-2.5 py-1 rounded-full bg-[hsl(280_50%_50%/0.1)] text-[hsl(280_50%_70%)] border border-[hsl(280_50%_50%/0.2)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 cursor-pointer hover:bg-[hsl(280_50%_50%/0.2)]"
                    whileHover={{ scale: 1.05, boxShadow: "0 0 12px hsl(280 50% 50% / 0.3)" }}
                  >
                    Act Now
                  </motion.span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[hsl(280_40%_70%/0.7)]">
                <Sparkles size={12} />
                <span className="italic truncate">Motion: {item.motion}</span>
              </div>
            </motion.button>
          ))}
          {filteredAgenda.length === 0 && (
            <p className="text-[12px] text-[hsl(0_0%_100%/0.3)] text-center py-8">No agenda items for this scope.</p>
          )}
        </div>
      </div>

      {/* What Changed */}
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
              className={cn("rounded-lg border p-3 flex items-start md:items-center gap-2 md:gap-3", changeTypeStyles[change.type])}
            >
              <span className={cn("text-[10px] font-bold uppercase shrink-0 w-16", domainColors[change.domain])}>
                {change.domain}
              </span>
              <p className="text-[11px] md:text-[12px] text-[hsl(0_0%_100%/0.6)] flex-1">{change.label}</p>
              <span className="text-[9px] text-[hsl(0_0%_100%/0.25)] shrink-0 flex items-center gap-1">
                <Clock size={9} /> {change.time}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cross-Domain Signals — responsive */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)] mb-3">
          Cross-Domain Signals
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {filteredSignals.map((sig, i) => (
            <motion.div
              key={sig.domain}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4 backdrop-blur-sm hover:bg-[hsl(0_0%_100%/0.04)] hover:border-[hsl(0_0%_100%/0.1)] hover:shadow-[0_4px_20px_hsl(280_50%_50%/0.06)] transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <sig.icon size={14} className="text-[hsl(0_0%_100%/0.4)]" />
                  <span className="text-[11px] font-semibold text-[hsl(0_0%_100%/0.7)]">{sig.domain}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrustStateBadge state={sig.trustState} />
                  <TrendIcon trend={sig.trend} />
                </div>
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

      {/* Recommended Motion */}
      {active && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)] mb-3">
            Recommended Motion
          </p>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl border border-[hsl(280_50%_50%/0.2)] bg-[hsl(280_40%_50%/0.04)] p-4 md:p-6 shadow-[0_0_40px_hsl(280_50%_40%/0.06)]"
          >
            <div className="flex items-start justify-between gap-3 md:gap-4 mb-4">
              <div className="flex-1">
                <h3 className="text-base font-bold text-[hsl(0_0%_100%/0.95)] mb-1">{active.motion}</h3>
                <p className="text-[12px] text-[hsl(0_0%_100%/0.45)] leading-relaxed">
                  Based on {active.domain} advisor synthesis. {active.detail?.split(".")[0]}.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn("text-[9px] font-semibold px-2 py-0.5 rounded-full border", urgencyColors[active.urgency])}>
                  {active.urgency} priority
                </span>
                <span className="flex items-center gap-1 text-[10px] text-[hsl(0_0%_100%/0.4)] bg-[hsl(0_0%_100%/0.04)] px-2 py-0.5 rounded-full">
                  <FileCheck size={10} /> 4 sources
                </span>
              </div>
            </div>

            <ConfidenceBar value={active.confidence} label="System Confidence" className="mb-5" />
            <ExecutionChainTimeline steps={chain} compact className="mb-5" />

            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              <button
                onClick={() => onNavigate("simulation")}
                className="flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl bg-[hsl(280_50%_50%/0.15)] border border-[hsl(280_50%_50%/0.3)] text-[hsl(280_50%_75%)] text-[12px] font-semibold hover:bg-[hsl(280_50%_50%/0.25)] transition-all"
              >
                <Play size={14} /> Simulate
              </button>
              <button
                onClick={() => onNavigate("approvals")}
                className="flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl bg-[hsl(var(--trust-safe))]/10 border border-[hsl(var(--trust-safe))]/30 text-[hsl(var(--trust-safe))] text-[12px] font-semibold hover:bg-[hsl(var(--trust-safe))]/20 transition-all"
              >
                <FileCheck size={14} /> Approve
              </button>
            </div>
          </motion.div>

          <div className="mt-4">
            <BoardroomAdvisorCouncil
              scope={active?.domain as any || "business"}
              onSelectAdvisor={() => onNavigate("synthesis")}
              compact
            />
          </div>

          <div className="mt-4">
            <EvidenceChain title="Evidence Trail — How This Conclusion Was Reached" nodes={EVIDENCE_NODES} />
          </div>
        </div>
      )}
    </div>
  );
}
