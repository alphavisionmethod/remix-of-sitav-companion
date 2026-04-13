import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Scale } from "lucide-react";
import { ConfidenceBar, AdvisorAvatar } from "@/components/sita/primitives";

const ADVISOR_STANCES = [
  { id: "rev", name: "Revenue Advisor", domain: "business" as const, recommendation: "Prioritize collections — $18.5K overdue threatens cash target", confidence: 72, evidenceCount: 6 },
  { id: "crm", name: "CRM Advisor", domain: "business" as const, recommendation: "Preserve client relationships — segment by value before outreach", confidence: 68, evidenceCount: 4 },
  { id: "obl", name: "Obligations Advisor", domain: "money" as const, recommendation: "Defer $342/mo subscriptions to restore reserve buffer", confidence: 78, evidenceCount: 5 },
  { id: "res", name: "Reserve Advisor", domain: "money" as const, recommendation: "Accelerate AR collection — reserves critical at 72% of target", confidence: 65, evidenceCount: 3 },
  { id: "tra", name: "Travel Advisor", domain: "concierge" as const, recommendation: "NYC prep fully cleared — safe to approve logistics package", confidence: 88, evidenceCount: 7 },
  { id: "ops", name: "Operations Advisor", domain: "business" as const, recommendation: "Reduce support ticket response time to protect NPS", confidence: 60, evidenceCount: 2 },
];

const DISAGREEMENTS = [
  {
    id: "d1",
    title: "Collections Approach",
    advisorA: { name: "Revenue Advisor", position: "Immediate outreach to all overdue accounts", confidence: 72 },
    advisorB: { name: "CRM Advisor", position: "Phased approach — high-value clients get personal touch first", confidence: 68 },
    gap: 4,
    resolution: "System recommends phased approach — relationship preservation outweighs speed for top accounts",
  },
  {
    id: "d2",
    title: "Reserve Recovery Strategy",
    advisorA: { name: "Obligations Advisor", position: "Cut subscriptions immediately", confidence: 78 },
    advisorB: { name: "Reserve Advisor", position: "Accelerate receivables instead of cutting services", confidence: 65 },
    gap: 13,
    resolution: "System recommends hybrid — defer lowest-value subscriptions AND accelerate top 2 receivables",
  },
];

export function BoardroomSynthesisView() {
  const sorted = [...ADVISOR_STANCES].sort((a, b) => b.confidence - a.confidence);
  const avgConfidence = Math.round(sorted.reduce((s, a) => s + a.confidence, 0) / sorted.length);
  const maxGap = Math.max(...sorted.map(a => a.confidence)) - Math.min(...sorted.map(a => a.confidence));
  const consensusPercent = Math.round(100 - maxGap);

  return (
    <div className="p-6 space-y-6">
      {/* Consensus Meter */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-[hsl(280_50%_50%/0.15)] bg-[hsl(280_40%_50%/0.04)] p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Scale size={16} className="text-[hsl(280_50%_65%)]" />
            <span className="text-sm font-semibold text-[hsl(0_0%_100%/0.85)]">Advisor Consensus</span>
          </div>
          <span className="text-2xl font-bold text-[hsl(280_50%_75%)] tabular-nums">{consensusPercent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[hsl(0_0%_100%/0.06)] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${consensusPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-[hsl(280_50%_55%)] to-[hsl(280_60%_70%)]"
          />
        </div>
        <p className="text-[11px] text-[hsl(0_0%_100%/0.35)] mt-2">
          Average confidence: {avgConfidence}% · Max spread: {maxGap} points · {DISAGREEMENTS.length} active disagreement{DISAGREEMENTS.length !== 1 ? "s" : ""}
        </p>
      </motion.div>

      {/* Advisor Stance Cards */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)] mb-3">
          Advisor Positions — Ranked by Confidence
        </p>
        <div className="grid grid-cols-2 gap-3">
          {sorted.map((adv, i) => (
            <motion.div
              key={adv.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4"
            >
              <div className="flex items-start gap-3 mb-3">
                <AdvisorAvatar domain={adv.domain} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-[hsl(0_0%_100%/0.7)]">{adv.name}</p>
                  <span className="text-[9px] text-[hsl(0_0%_100%/0.3)]">{adv.evidenceCount} evidence sources</span>
                </div>
              </div>
              <p className="text-[12px] text-[hsl(0_0%_100%/0.55)] italic mb-3 leading-relaxed">"{adv.recommendation}"</p>
              <ConfidenceBar value={adv.confidence} size="sm" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Disagreement Cards */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(var(--sita-gold))]/60 mb-3 flex items-center gap-1.5">
          <AlertTriangle size={12} /> Active Disagreements
        </p>
        <div className="space-y-3">
          {DISAGREEMENTS.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="rounded-xl border border-[hsl(var(--sita-gold))]/15 bg-[hsl(var(--sita-gold))]/3 p-5"
            >
              <p className="text-sm font-semibold text-[hsl(0_0%_100%/0.85)] mb-3">{d.title}</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.03)] p-3">
                  <p className="text-[10px] font-semibold text-[hsl(0_0%_100%/0.5)] mb-1">{d.advisorA.name}</p>
                  <p className="text-[12px] text-[hsl(0_0%_100%/0.7)]">{d.advisorA.position}</p>
                  <ConfidenceBar value={d.advisorA.confidence} size="sm" className="mt-2" />
                </div>
                <div className="rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.03)] p-3">
                  <p className="text-[10px] font-semibold text-[hsl(0_0%_100%/0.5)] mb-1">{d.advisorB.name}</p>
                  <p className="text-[12px] text-[hsl(0_0%_100%/0.7)]">{d.advisorB.position}</p>
                  <ConfidenceBar value={d.advisorB.confidence} size="sm" className="mt-2" />
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-[hsl(280_40%_50%/0.06)] border border-[hsl(280_50%_50%/0.15)] p-3">
                <CheckCircle size={14} className="text-[hsl(280_50%_65%)] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[hsl(280_50%_75%/0.8)] leading-relaxed">{d.resolution}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
