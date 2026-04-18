// ═══════════════════════════════════════════════════════════════
// Advisor Disagreement Card — Side-by-side conflict view
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ChevronDown, ArrowUpRight } from "lucide-react";
import type { AdvisorDisagreement } from "@/domains/engines/business-advisor-engine";

interface Props {
  disagreement: AdvisorDisagreement;
  onEscalate?: (d: AdvisorDisagreement) => void;
}

function ConfidenceBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 rounded-full bg-[hsl(0_0%_15%)] overflow-hidden w-full">
      <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.5 }}
        className="h-full rounded-full" style={{ background: color }} />
    </div>
  );
}

export function AdvisorDisagreementCard({ disagreement, onEscalate }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { advisorA, advisorB, reason, escalatable } = disagreement;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[hsl(38_85%_58%/0.15)] bg-[hsl(38_85%_58%/0.03)] overflow-hidden"
    >
      <div className="p-3.5">
        <div className="flex items-center gap-2 mb-2.5">
          <AlertTriangle className="h-3.5 w-3.5 text-[hsl(38_85%_58%)]" />
          <span className="text-[10px] font-semibold text-[hsl(38_85%_68%)] uppercase tracking-wider">Advisor Disagreement</span>
        </div>

        <p className="text-[10px] text-[hsl(0_0%_55%)] mb-3">{reason}</p>

        {/* Side by side */}
        <div className="grid grid-cols-2 gap-3">
          {/* Advisor A */}
          <div className="rounded-lg bg-[hsl(265_55%_58%/0.05)] border border-[hsl(265_55%_58%/0.1)] p-2.5">
            <p className="text-[10px] font-semibold text-[hsl(265_55%_70%)] mb-1">{advisorA.name}</p>
            <p className="text-[9px] text-[hsl(0_0%_55%)] leading-relaxed mb-2">{advisorA.position}</p>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[8px] text-[hsl(0_0%_40%)]">Confidence</span>
              <span className="text-[9px] font-bold text-[hsl(265_55%_65%)] tabular-nums">{advisorA.confidence}%</span>
            </div>
            <ConfidenceBar value={advisorA.confidence} color="hsl(265 55% 58%)" />
            <div className="mt-2 space-y-0.5">
              {advisorA.factors.map((f, i) => (
                <span key={i} className="text-[8px] text-[hsl(0_0%_50%)] block">• {f}</span>
              ))}
            </div>
          </div>

          {/* Advisor B */}
          <div className="rounded-lg bg-[hsl(38_85%_58%/0.05)] border border-[hsl(38_85%_58%/0.1)] p-2.5">
            <p className="text-[10px] font-semibold text-[hsl(38_85%_68%)] mb-1">{advisorB.name}</p>
            <p className="text-[9px] text-[hsl(0_0%_55%)] leading-relaxed mb-2">{advisorB.position}</p>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[8px] text-[hsl(0_0%_40%)]">Confidence</span>
              <span className="text-[9px] font-bold text-[hsl(38_85%_65%)] tabular-nums">{advisorB.confidence}%</span>
            </div>
            <ConfidenceBar value={advisorB.confidence} color="hsl(38 85% 58%)" />
            <div className="mt-2 space-y-0.5">
              {advisorB.factors.map((f, i) => (
                <span key={i} className="text-[8px] text-[hsl(0_0%_50%)] block">• {f}</span>
              ))}
            </div>
          </div>
        </div>

        {/* VS divider */}
        <div className="flex items-center justify-center -mt-[1px] relative z-10">
          <span className="text-[9px] font-bold text-[hsl(0_0%_35%)] bg-[hsl(38_85%_58%/0.03)] px-2 py-0.5 rounded-full border border-[hsl(0_0%_100%/0.06)]">vs</span>
        </div>

        {/* Confidence split bar */}
        <div className="mt-2.5">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[8px] text-[hsl(265_55%_60%)]">{advisorA.name}</span>
            <span className="flex-1" />
            <span className="text-[8px] text-[hsl(38_85%_60%)]">{advisorB.name}</span>
          </div>
          <div className="h-2 rounded-full bg-[hsl(0_0%_12%)] overflow-hidden flex">
            <div className="h-full rounded-l-full bg-[hsl(265_55%_58%)]" style={{ width: `${(advisorA.confidence / (advisorA.confidence + advisorB.confidence)) * 100}%` }} />
            <div className="h-full rounded-r-full bg-[hsl(38_85%_58%)]" style={{ width: `${(advisorB.confidence / (advisorA.confidence + advisorB.confidence)) * 100}%` }} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <button onClick={() => setExpanded(!expanded)} className="text-[9px] text-[hsl(0_0%_50%)] hover:text-[hsl(0_0%_70%)] transition-colors flex items-center gap-1">
            <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
            Why they differ
          </button>
          {escalatable && onEscalate && (
            <button onClick={() => onEscalate(disagreement)} className="text-[9px] px-2 py-1 rounded-lg bg-[hsl(38_85%_58%/0.12)] text-[hsl(38_85%_68%)] hover:bg-[hsl(38_85%_58%/0.2)] transition-colors flex items-center gap-1 ml-auto">
              <ArrowUpRight className="h-3 w-3" /> Escalate
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-3.5 pb-3.5 border-t border-[hsl(38_85%_58%/0.1)] pt-2.5">
              <p className="text-[10px] text-[hsl(0_0%_55%)] leading-relaxed">
                These advisors are evaluating the same situation with different analytical frameworks. {advisorA.name} weighs
                {advisorA.factors[0] ? ` "${advisorA.factors[0]}"` : " positive signals"} more heavily, while {advisorB.name} emphasizes
                {advisorB.factors[0] ? ` "${advisorB.factors[0]}"` : " risk factors"}. This kind of productive tension helps surface
                complexity that a single perspective might miss.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
