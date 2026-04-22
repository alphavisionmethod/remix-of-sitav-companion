// ============================================================
// SITA OS — Boardroom Evidence Panel
// Slide-out right panel for evidence, assumptions, lineage
// ============================================================

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
import { useDataMode } from "@/contexts/DataModeContext";
  X, CheckCircle, AlertTriangle, HelpCircle, Brain,
  Clock, Link2, ShieldCheck, ShieldAlert, Eye, FileText,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

type EvidenceType = "verified" | "inferred" | "assumption" | "stale";

interface EvidenceItem {
  id: string;
  sourceType: EvidenceType;
  sourceName: string;
  content: string;
  confidence: number;
  freshness: string;
  lineage: string[];
}

const DEMO_EVIDENCE: EvidenceItem[] = [
  {
    id: "ev1", sourceType: "verified", sourceName: "Invoice Aging Report",
    content: "3 accounts overdue: TechCorp ($12,500), David Kim ($4,200), Sarah Chen ($1,800). Total: $18,500.",
    confidence: 95, freshness: "12 min ago",
    lineage: ["QuickBooks sync", "Finance adapter", "Revenue advisor"],
  },
  {
    id: "ev2", sourceType: "verified", sourceName: "Bank Balance",
    content: "Current reserves: $7,200. Target: $10,000. Shortfall: $2,800 (28%).",
    confidence: 99, freshness: "2 min ago",
    lineage: ["Bank connector", "Finance adapter"],
  },
  {
    id: "ev3", sourceType: "inferred", sourceName: "CRM Relationship Score",
    content: "TechCorp is a top-5 client by revenue ($45K/yr). Relationship preservation critical.",
    confidence: 78, freshness: "1 hour ago",
    lineage: ["CRM data", "Relationship advisor", "Revenue analysis"],
  },
  {
    id: "ev4", sourceType: "assumption", sourceName: "Recovery Timeline",
    content: "TechCorp expected to respond within 5 business days based on prior payment patterns.",
    confidence: 70, freshness: "Current",
    lineage: ["Historical payment data", "Pattern matching"],
  },
  {
    id: "ev5", sourceType: "stale", sourceName: "Client Sentiment",
    content: "Last interaction with TechCorp was 3 weeks ago. Sentiment data may not reflect current state.",
    confidence: 40, freshness: "3 weeks ago",
    lineage: ["CRM notes", "Last meeting log"],
  },
];

const UNKNOWNS = [
  "TechCorp's current cash position is unknown",
  "Sarah Chen's response pattern has limited data (2 prior invoices)",
  "Impact of outreach timing on client renewal probability not modeled",
];

const typeConfig: Record<EvidenceType, { icon: typeof CheckCircle; color: string; bg: string; label: string }> = {
  verified: { icon: CheckCircle, color: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/10", label: "Verified" },
  inferred: { icon: Brain, color: "text-[hsl(var(--sita-purple-light))]", bg: "bg-[hsl(var(--sita-purple))]/10", label: "Inferred" },
  assumption: { icon: HelpCircle, color: "text-[hsl(var(--sita-gold))]", bg: "bg-[hsl(var(--sita-gold))]/10", label: "Assumption" },
  stale: { icon: AlertTriangle, color: "text-[hsl(var(--destructive))]", bg: "bg-[hsl(var(--destructive))]/10", label: "Stale" },
};

const TRUST_POSTURE = {
  verifiedCount: 2,
  inferredCount: 1,
  assumptionCount: 1,
  staleCount: 1,
  overallGrade: "B+",
  summary: "Strong evidence base with 1 stale input. Confidence is mostly evidence-backed. One assumption needs validation.",
};

export function BoardroomEvidencePanel({ open, onClose }: Props) {
  const [expandedLineage, setExpandedLineage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<EvidenceType | "all">("all");

  const filtered = activeFilter === "all"
    ? DEMO_EVIDENCE
    : (isDemoMode ? DEMO_EVIDENCE : [] as typeof DEMO_EVIDENCE).filter(e => e.sourceType === activeFilter);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[hsl(0_0%_0%/0.5)] z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[420px] bg-[hsl(220_18%_5%)] border-l border-[hsl(0_0%_100%/0.08)] z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(0_0%_100%/0.06)]">
              <div className="flex items-center gap-2">
                <Eye size={14} className="text-[hsl(280_50%_65%)]" />
                <span className="text-sm font-bold text-[hsl(0_0%_100%/0.9)]">Evidence & Sources</span>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
              >
                <X size={14} className="text-[hsl(0_0%_100%/0.4)]" />
              </button>
            </div>

            {/* Trust Posture Summary */}
            <div className="px-5 py-4 border-b border-[hsl(0_0%_100%/0.06)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)]">Trust Posture</span>
                <span className="text-lg font-bold text-[hsl(280_50%_75%)]">{TRUST_POSTURE.overallGrade}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                {(["verified", "inferred", "assumption", "stale"] as EvidenceType[]).map(t => {
                  const cfg = typeConfig[t];
                  const count = DEMO_EVIDENCE.filter(e => e.sourceType === t).length;
                  return (
                    <div key={t} className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold", cfg.bg, cfg.color)}>
                      {count} {cfg.label}
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-[hsl(0_0%_100%/0.45)] leading-relaxed">{TRUST_POSTURE.summary}</p>
            </div>

            {/* Filter tabs */}
            <div className="px-5 py-2 flex items-center gap-1 border-b border-[hsl(0_0%_100%/0.04)]">
              {(["all", "verified", "inferred", "assumption", "stale"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[9px] font-semibold transition-all",
                    activeFilter === f
                      ? "bg-[hsl(280_50%_50%/0.15)] text-[hsl(280_50%_75%)]"
                      : "text-[hsl(0_0%_100%/0.3)] hover:text-[hsl(0_0%_100%/0.6)]",
                  )}
                >
                  {f === "all" ? "All" : typeConfig[f].label}
                </button>
              ))}
            </div>

            {/* Evidence list */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scrollbar-thin scrollbar-thumb-[hsl(0_0%_100%/0.06)]">
              {filtered.map((ev, i) => {
                const cfg = typeConfig[ev.sourceType];
                const Icon = cfg.icon;
                const showLineage = expandedLineage === ev.id;

                return (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold", cfg.bg, cfg.color)}>
                        <Icon size={9} /> {cfg.label}
                      </div>
                      <span className="text-[10px] font-semibold text-[hsl(0_0%_100%/0.6)]">{ev.sourceName}</span>
                      <span className="ml-auto text-[9px] text-[hsl(0_0%_100%/0.25)] flex items-center gap-1">
                        <Clock size={8} /> {ev.freshness}
                      </span>
                    </div>
                    <p className="text-[12px] text-[hsl(0_0%_100%/0.6)] leading-relaxed mb-2">{ev.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-[hsl(0_0%_100%/0.06)] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${ev.confidence}%`,
                              backgroundColor: ev.confidence >= 80 ? "hsl(var(--trust-safe))" : ev.confidence >= 60 ? "hsl(var(--sita-gold))" : "hsl(var(--destructive))",
                            }}
                          />
                        </div>
                        <span className="text-[9px] text-[hsl(0_0%_100%/0.35)] tabular-nums">{ev.confidence}%</span>
                      </div>
                      <button
                        onClick={() => setExpandedLineage(showLineage ? null : ev.id)}
                        className="flex items-center gap-1 text-[9px] text-[hsl(280_50%_65%/0.6)] hover:text-[hsl(280_50%_75%)] transition-colors"
                      >
                        <Link2 size={9} /> Lineage
                      </button>
                    </div>
                    <AnimatePresence>
                      {showLineage && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 pt-2 border-t border-[hsl(0_0%_100%/0.05)] overflow-hidden"
                        >
                          <div className="flex items-center gap-1.5">
                            {ev.lineage.map((step, j) => (
                              <React.Fragment key={j}>
                                <span className="text-[9px] text-[hsl(280_50%_65%/0.7)] bg-[hsl(280_50%_50%/0.08)] px-2 py-0.5 rounded-full">
                                  {step}
                                </span>
                                {j < ev.lineage.length - 1 && (
                                  <span className="text-[hsl(0_0%_100%/0.15)]">→</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              {/* Unresolved Unknowns */}
              <div className="pt-4 border-t border-[hsl(0_0%_100%/0.06)]">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--sita-gold))]/60 mb-2 flex items-center gap-1.5">
                  <ShieldAlert size={10} /> Unresolved Unknowns
                </p>
                <div className="space-y-1.5">
                  {UNKNOWNS.map((u, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-[hsl(var(--sita-gold))]/10 bg-[hsl(var(--sita-gold))]/5 p-2.5"
                    >
                      <p className="text-[11px] text-[hsl(var(--sita-gold))]/80">• {u}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
