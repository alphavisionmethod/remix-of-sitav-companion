import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gavel, ChevronDown, AlertTriangle, Shield,
  ArrowRight, TrendingDown, Users, Clock, Zap
} from "lucide-react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/lib/engines/business-identity-layers";
import { Button } from "@/components/ui/button";

interface BoardroomCandidate {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium";
  domain: string;
  riskFactors: string[];
  strategicFraming: string;
  options: string[];
  nextStep: string;
}

const DEMO_CANDIDATES: BoardroomCandidate[] = [
  {
    id: "bc1",
    title: "Revenue concentration risk — top 3 accounts represent 62% of revenue",
    severity: "critical",
    domain: "Revenue Strategy",
    riskFactors: [
      "Loss of any single top-3 account would reduce revenue by 18-25%",
      "No active diversification pipeline targeting new verticals",
      "Renewal timing for 2 of 3 accounts falls within the same quarter",
    ],
    strategicFraming: "The business is operationally sound but structurally vulnerable. Revenue concentration at 62% creates a single-point-of-failure risk that standard operational improvements cannot address. This requires a strategic decision on diversification timeline and investment.",
    options: [
      "Launch targeted outbound to 3 new verticals within 30 days",
      "Deepen existing accounts to increase switching cost and lock-in",
      "Accept current risk and focus on renewal preparation",
    ],
    nextStep: "Formal Boardroom review to model scenarios and approve diversification budget",
  },
  {
    id: "bc2",
    title: "Recurring operational breakdown in client handoff process",
    severity: "high",
    domain: "Operations",
    riskFactors: [
      "3 client complaints linked to handoff failures in last 30 days",
      "Average handoff delay increased from 2 to 5 days",
      "Team satisfaction declining in affected departments",
    ],
    strategicFraming: "The handoff process has degraded from an occasional friction point to a systematic failure. This is now affecting client satisfaction and team morale simultaneously.",
    options: [
      "Redesign handoff process with mandatory checkpoints",
      "Add dedicated handoff coordinator role",
      "Implement automated handoff tracking with escalation triggers",
    ],
    nextStep: "Review in Boardroom to assess structural vs. staffing solutions",
  },
];

const SEV_STYLES = {
  critical: { border: "border-red-500/20", glow: "bg-red-500/5", text: "text-red-400", dot: "bg-red-400" },
  high: { border: "border-amber-500/20", glow: "bg-amber-500/5", text: "text-amber-400", dot: "bg-amber-400" },
  medium: { border: "border-blue-400/20", glow: "bg-blue-400/5", text: "text-blue-400", dot: "bg-blue-400" },
};

export function BoardroomEntryZone() {
  const { primaryMode } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
      className="rounded-2xl overflow-hidden border border-border/20"
      style={{ background: "hsl(var(--card) / 0.4)" }}
    >
      {/* Boardroom header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-foreground/5 flex items-center justify-center border border-border/20">
            <Gavel size={14} className="text-foreground/50" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground/80">Boardroom Candidates</h3>
            <p className="text-[9px] text-muted-foreground">{DEMO_CANDIDATES.length} issues warrant strategic review</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/8 border border-red-500/15">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          <span className="text-[9px] font-semibold text-red-400">{DEMO_CANDIDATES.filter(c => c.severity === "critical").length} Critical</span>
        </div>
      </div>

      {/* Candidates */}
      <div className="px-5 pb-5 space-y-2">
        {DEMO_CANDIDATES.map((candidate, i) => {
          const sev = SEV_STYLES[candidate.severity];
          const isExpanded = expandedId === candidate.id;

          return (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className={`rounded-xl border ${sev.border} ${sev.glow} overflow-hidden transition-all duration-300 cursor-pointer group`}
              style={{
                boxShadow: isExpanded ? `0 0 30px hsl(${identity.accentColor} / 0.05)` : "none",
              }}
              onClick={() => setExpandedId(isExpanded ? null : candidate.id)}
            >
              {/* Collapsed view */}
              <div className="p-4 flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${sev.dot} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground/80 truncate">{candidate.title}</p>
                  <span className="text-[9px] text-muted-foreground">{candidate.domain}</span>
                </div>
                <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
              </div>

              {/* Expanded cinematic reveal */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-0 border-t border-border/10 space-y-4">
                      {/* Strategic framing */}
                      <div className="pt-3">
                        <span className="text-[9px] uppercase tracking-[0.12em] text-foreground/30 font-semibold">Strategic Assessment</span>
                        <p className="text-[11px] text-foreground/55 leading-relaxed mt-1.5">{candidate.strategicFraming}</p>
                      </div>

                      {/* Risk factors */}
                      <div>
                        <span className="text-[9px] uppercase tracking-[0.12em] text-foreground/30 font-semibold">Risk Factors</span>
                        <div className="mt-1.5 space-y-1.5">
                          {candidate.riskFactors.map((rf, j) => (
                            <div key={j} className="flex items-start gap-2">
                              <AlertTriangle size={10} className={`${sev.text} mt-0.5 shrink-0 opacity-60`} />
                              <p className="text-[10px] text-foreground/50">{rf}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Options */}
                      <div>
                        <span className="text-[9px] uppercase tracking-[0.12em] text-foreground/30 font-semibold">Options for Review</span>
                        <div className="mt-1.5 space-y-1">
                          {candidate.options.map((opt, j) => (
                            <div key={j} className="flex items-center gap-2 p-2 rounded-lg bg-card/30 border border-border/10">
                              <span className="text-[9px] font-bold text-foreground/30 w-4 shrink-0">{j + 1}.</span>
                              <p className="text-[10px] text-foreground/60">{opt}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Next step + CTA */}
                      <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/10">
                        <p className="text-[10px] text-muted-foreground flex-1">{candidate.nextStep}</p>
                        <Button
                          size="sm"
                          className="shrink-0 text-[10px] gap-1.5"
                          style={{
                            background: `hsl(${identity.accentColor} / 0.12)`,
                            color: `hsl(${identity.accentColor})`,
                            border: `1px solid hsl(${identity.accentColor} / 0.2)`,
                          }}
                        >
                          <Gavel size={10} />
                          Open in Boardroom
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
