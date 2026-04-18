// ═══════════════════════════════════════════════════════════════
// Module Advisor Panel — Reusable multi-advisor insight panel
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronDown, ChevronUp, Shield, AlertTriangle, Zap, ArrowUpRight, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdvisorOutput } from "@/domains/engines/business-advisor-engine";

interface Props {
  advisors: AdvisorOutput[];
  title?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  onSendToBoard?: (advisor: AdvisorOutput) => void;
  onEscalate?: (advisor: AdvisorOutput) => void;
  compact?: boolean;
}

const URGENCY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: "bg-[hsl(0_70%_55%/0.12)]", text: "text-[hsl(0_70%_65%)]", label: "Critical" },
  high: { bg: "bg-[hsl(38_85%_58%/0.12)]", text: "text-[hsl(38_85%_68%)]", label: "High" },
  medium: { bg: "bg-[hsl(265_55%_58%/0.12)]", text: "text-[hsl(265_55%_70%)]", label: "Medium" },
  low: { bg: "bg-[hsl(0_0%_100%/0.06)]", text: "text-[hsl(0_0%_50%)]", label: "Low" },
};

function ConfidenceRing({ value, size = 32 }: { value: number; size?: number }) {
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  const color = value >= 80 ? "hsl(152 55% 48%)" : value >= 60 ? "hsl(38 85% 58%)" : "hsl(0 70% 55%)";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(0 0% 15%)" strokeWidth="2" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="2"
          strokeDasharray={`${(value / 100) * circ} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-[hsl(0_0%_75%)] tabular-nums">{value}</span>
    </div>
  );
}

function AdvisorCard({ advisor, onSendToBoard, onEscalate, compact }: {
  advisor: AdvisorOutput;
  onSendToBoard?: (a: AdvisorOutput) => void;
  onEscalate?: (a: AdvisorOutput) => void;
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const urgStyle = URGENCY_STYLES[advisor.urgency] || URGENCY_STYLES.medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] overflow-hidden"
    >
      <div className="p-3.5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[hsl(265_55%_58%/0.12)] flex items-center justify-center shrink-0">
            <Brain className="h-4 w-4 text-[hsl(265_55%_58%)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[hsl(0_0%_80%)]">{advisor.advisorName}</span>
              <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full font-medium", urgStyle.bg, urgStyle.text)}>{urgStyle.label}</span>
            </div>
            <p className="text-[10px] text-[hsl(0_0%_45%)]">{advisor.module}</p>
          </div>
          <ConfidenceRing value={advisor.confidence} />
        </div>

        {/* Summary */}
        <p className="text-[11px] text-[hsl(0_0%_60%)] leading-relaxed mt-2.5">{advisor.summary}</p>

        {/* Signal chips */}
        {!compact && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {advisor.positiveSignals.slice(0, 3).map((s, i) => (
              <span key={i} className="text-[8px] px-1.5 py-0.5 rounded-full bg-[hsl(152_55%_48%/0.1)] text-[hsl(152_55%_60%)] flex items-center gap-0.5">
                <Check className="h-2 w-2" /> {s}
              </span>
            ))}
            {advisor.negativeSignals.slice(0, 3).map((s, i) => (
              <span key={i} className="text-[8px] px-1.5 py-0.5 rounded-full bg-[hsl(0_70%_55%/0.1)] text-[hsl(0_70%_65%)] flex items-center gap-0.5">
                <X className="h-2 w-2" /> {s}
              </span>
            ))}
          </div>
        )}

        {/* Expand toggle */}
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 mt-2 text-[9px] text-[hsl(265_55%_60%)] hover:text-[hsl(265_55%_75%)] transition-colors">
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? "Less" : "Details & Actions"}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 space-y-2.5 border-t border-[hsl(0_0%_100%/0.04)] pt-2.5">
              {/* Rationale */}
              <div>
                <span className="text-[8px] uppercase tracking-wider text-[hsl(0_0%_40%)] font-semibold">Rationale</span>
                <p className="text-[10px] text-[hsl(0_0%_55%)] mt-0.5">{advisor.rationale}</p>
              </div>

              {/* Suggested Actions */}
              {advisor.suggestedActions.length > 0 && (
                <div>
                  <span className="text-[8px] uppercase tracking-wider text-[hsl(0_0%_40%)] font-semibold">Suggested Actions</span>
                  <div className="space-y-1 mt-1">
                    {advisor.suggestedActions.map((a, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-[hsl(0_0%_100%/0.03)]">
                        <div className={cn("w-1.5 h-1.5 rounded-full shrink-0",
                          a.priority === "high" ? "bg-[hsl(38_85%_58%)]" : a.priority === "medium" ? "bg-[hsl(265_55%_58%)]" : "bg-[hsl(0_0%_40%)]"
                        )} />
                        <span className="text-[10px] text-[hsl(0_0%_65%)]">{a.label}</span>
                        <span className="text-[8px] text-[hsl(0_0%_35%)] ml-auto capitalize">{a.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Escalation */}
              {advisor.escalationRecommendation?.shouldEscalate && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[hsl(38_85%_58%/0.06)] border border-[hsl(38_85%_58%/0.12)]">
                  <AlertTriangle className="h-3 w-3 text-[hsl(38_85%_58%)] shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-[hsl(38_85%_68%)]">{advisor.escalationRecommendation.reason}</p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                {onSendToBoard && (
                  <button onClick={() => onSendToBoard(advisor)} className="text-[9px] px-2.5 py-1.5 rounded-lg bg-[hsl(265_55%_58%/0.12)] text-[hsl(265_55%_70%)] hover:bg-[hsl(265_55%_58%/0.2)] transition-colors flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" /> Send to Board
                  </button>
                )}
                {onEscalate && advisor.escalationRecommendation?.shouldEscalate && (
                  <button onClick={() => onEscalate(advisor)} className="text-[9px] px-2.5 py-1.5 rounded-lg bg-[hsl(38_85%_58%/0.12)] text-[hsl(38_85%_68%)] hover:bg-[hsl(38_85%_58%/0.2)] transition-colors flex items-center gap-1">
                    <Zap className="h-3 w-3" /> Escalate
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ModuleAdvisorPanel({ advisors, title = "Advisor Intelligence", collapsible = true, defaultExpanded = true, onSendToBoard, onEscalate, compact }: Props) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);
  const hasEscalation = advisors.some(a => a.escalationRecommendation?.shouldEscalate);

  if (advisors.length === 0) return null;

  return (
    <div className="space-y-2">
      {collapsible ? (
        <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 w-full group">
          <Brain className="h-3.5 w-3.5 text-[hsl(265_55%_58%)]" />
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[hsl(0_0%_55%)]">{title}</span>
          {hasEscalation && <span className="w-1.5 h-1.5 rounded-full bg-[hsl(38_85%_58%)] animate-pulse" />}
          <span className="text-[9px] text-[hsl(0_0%_35%)] ml-auto">{advisors.length} advisor{advisors.length > 1 ? "s" : ""}</span>
          {isOpen ? <ChevronUp className="h-3 w-3 text-[hsl(0_0%_35%)]" /> : <ChevronDown className="h-3 w-3 text-[hsl(0_0%_35%)]" />}
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <Brain className="h-3.5 w-3.5 text-[hsl(265_55%_58%)]" />
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[hsl(0_0%_55%)]">{title}</span>
          {hasEscalation && <span className="w-1.5 h-1.5 rounded-full bg-[hsl(38_85%_58%)] animate-pulse" />}
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-2">
            {advisors.map(a => (
              <AdvisorCard key={a.advisorId} advisor={a} onSendToBoard={onSendToBoard} onEscalate={onEscalate} compact={compact} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
