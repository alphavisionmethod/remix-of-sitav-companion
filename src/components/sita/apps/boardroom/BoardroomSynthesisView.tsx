import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, Scale, ChevronDown, ChevronRight, MessageCircle, Users } from "lucide-react";
import { ConfidenceBar, AdvisorAvatar } from "@/components/sita/primitives";
import { EvidenceChain, type EvidenceNode } from "@/components/sita/primitives/EvidenceChain";
import { getAdvisorRoster, ADVISOR_ROSTERS, type AdvisorRole } from "@/lib/advisor-topology";
import { DomainAdvisorBoard } from "@/components/sita/domain-shared/DomainAdvisorBoard";

interface Props {
  scope: "global" | "business" | "finance" | "concierge";
  onNavigate: (module: string) => void;
}

// Map advisor IDs to their current boardroom stance (mock)
const ADVISOR_STANCE_MAP: Record<string, { recommendation: string; confidence: number; evidenceCount: number }> = {
  "biz-revenue": { recommendation: "Prioritize collections — $18.5K overdue threatens cash target", confidence: 72, evidenceCount: 6 },
  "biz-relationship": { recommendation: "Preserve client relationships — segment by value before outreach", confidence: 68, evidenceCount: 4 },
  "biz-followthrough": { recommendation: "Pipeline velocity needs attention — 3 deals stalled over 14 days", confidence: 74, evidenceCount: 5 },
  "biz-support": { recommendation: "Support queue manageable but NPS trending down", confidence: 60, evidenceCount: 2 },
  "biz-collections": { recommendation: "Accelerate TechCorp outreach — largest overdue at $12.5K", confidence: 78, evidenceCount: 5 },
  "biz-operations": { recommendation: "Reduce support ticket response time to protect NPS", confidence: 60, evidenceCount: 2 },
  "fin-obligations": { recommendation: "Defer $342/mo subscriptions to restore reserve buffer", confidence: 78, evidenceCount: 5 },
  "fin-spending": { recommendation: "AWS billing spike detected — investigate before next cycle", confidence: 74, evidenceCount: 4 },
  "fin-planning": { recommendation: "Q2 forecast needs adjustment based on pipeline slowdown", confidence: 65, evidenceCount: 3 },
  "fin-reserve": { recommendation: "Accelerate AR collection — reserves critical at 72% of target", confidence: 65, evidenceCount: 3 },
  "fin-approvals": { recommendation: "2 pending payments need review before end of week", confidence: 82, evidenceCount: 4 },
  "fin-receivables": { recommendation: "3 receivables aging past 30 days — collections needed", confidence: 76, evidenceCount: 5 },
  "con-lifeadmin": { recommendation: "School enrollment deadline approaching — needs decision this week", confidence: 55, evidenceCount: 2 },
  "con-travel": { recommendation: "NYC prep fully cleared — safe to approve logistics package", confidence: 88, evidenceCount: 7 },
  "con-logistics": { recommendation: "Errand batch optimization available — save 45 min this week", confidence: 82, evidenceCount: 3 },
  "con-support": { recommendation: "Task delegation opportunities detected — 3 items automatable", confidence: 70, evidenceCount: 3 },
  "con-prep": { recommendation: "All prep items for upcoming appointments are cleared", confidence: 92, evidenceCount: 6 },
  "con-household": { recommendation: "Household coordination normal — grocery run due Thursday", confidence: 85, evidenceCount: 4 },
};

const DISAGREEMENTS = [
  {
    id: "d1",
    title: "Collections Approach",
    domain: "business",
    advisorA: { id: "biz-revenue", position: "Immediate outreach to all overdue accounts", confidence: 72 },
    advisorB: { id: "biz-relationship", position: "Phased approach — high-value clients get personal touch first", confidence: 68 },
    gap: 4,
    resolution: "System recommends phased approach — relationship preservation outweighs speed for top accounts",
    evidence: [
      { id: "de1", label: "TechCorp revenue contribution: $45K/yr (top 5 client)", type: "source" as const, confidence: 95 },
      { id: "de2", label: "Prior phased collection recovery rate: 91% vs 76% immediate", type: "verification" as const, confidence: 85 },
      { id: "de3", label: "Client churn risk higher with aggressive outreach", type: "inference" as const, confidence: 68 },
      { id: "de4", label: "Phased approach yields higher net recovery", type: "conclusion" as const, confidence: 78 },
    ] as EvidenceNode[],
  },
  {
    id: "d2",
    title: "Reserve Recovery Strategy",
    domain: "finance",
    advisorA: { id: "fin-obligations", position: "Cut subscriptions immediately", confidence: 78 },
    advisorB: { id: "fin-reserve", position: "Accelerate receivables instead of cutting services", confidence: 65 },
    gap: 13,
    resolution: "System recommends hybrid — defer lowest-value subscriptions AND accelerate top 2 receivables",
    evidence: [
      { id: "de5", label: "3 subscriptions identified with zero usage last 30 days", type: "source" as const, confidence: 92 },
      { id: "de6", label: "Receivables acceleration typically yields 60% within 2 weeks", type: "verification" as const, confidence: 70 },
      { id: "de7", label: "Hybrid approach restores buffer 40% faster than either alone", type: "inference" as const, confidence: 72 },
      { id: "de8", label: "Combined strategy minimizes service disruption while restoring reserves", type: "conclusion" as const, confidence: 75 },
    ] as EvidenceNode[],
  },
];

function getAdvisorName(id: string): { name: string; emoji: string; role: string; specialty: string; accentColor: string } {
  for (const roster of Object.values(ADVISOR_ROSTERS)) {
    const found = roster.advisors.find(a => a.id === id);
    if (found) return found;
  }
  return { name: id, emoji: "🤖", role: "Advisor", specialty: "", accentColor: "hsl(280 50% 55%)" };
}

export function BoardroomSynthesisView({ scope, onNavigate }: Props) {
  const [expandedEvidence, setExpandedEvidence] = useState<string | null>(null);
  const [showAdvisorBoard, setShowAdvisorBoard] = useState<string | null>(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState<string | null>(null);

  // Build advisor list from topology, filtered by scope
  const advisors = useMemo(() => {
    const domains = scope === "global" ? ["business", "finance", "concierge"] : [scope];
    const result: (AdvisorRole & { recommendation: string; confidence: number; evidenceCount: number })[] = [];
    domains.forEach(d => {
      const roster = getAdvisorRoster(d);
      roster.advisors.forEach(adv => {
        const stance = ADVISOR_STANCE_MAP[adv.id] || { recommendation: "Awaiting analysis…", confidence: 50, evidenceCount: 0 };
        result.push({ ...adv, ...stance });
      });
    });
    return result.sort((a, b) => b.confidence - a.confidence);
  }, [scope]);

  const filteredDisagreements = scope === "global"
    ? DISAGREEMENTS
    : DISAGREEMENTS.filter(d => d.domain === scope);

  const avgConfidence = Math.round(advisors.reduce((s, a) => s + a.confidence, 0) / (advisors.length || 1));
  const maxGap = advisors.length > 1 ? Math.max(...advisors.map(a => a.confidence)) - Math.min(...advisors.map(a => a.confidence)) : 0;
  const consensusPercent = Math.round(100 - maxGap);

  const domainForBoard = scope === "global" ? "business" : scope;

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
            <span className="text-[10px] text-[hsl(0_0%_100%/0.3)] ml-2">
              {advisors.length} advisors · {scope === "global" ? "All domains" : scope}
            </span>
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
        <div className="flex items-center justify-between mt-2">
          <p className="text-[11px] text-[hsl(0_0%_100%/0.35)]">
            Average confidence: {avgConfidence}% · Max spread: {maxGap} pts · {filteredDisagreements.length} active disagreement{filteredDisagreements.length !== 1 ? "s" : ""}
          </p>
          <button
            onClick={() => setShowAdvisorBoard(showAdvisorBoard ? null : domainForBoard)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-[hsl(280_50%_50%/0.1)] border border-[hsl(280_50%_50%/0.2)] text-[hsl(280_50%_75%)] hover:bg-[hsl(280_50%_50%/0.2)] transition-all"
          >
            <Users size={12} />
            {showAdvisorBoard ? "Close Advisor Board" : "Open Advisor Board"}
          </button>
        </div>
      </motion.div>

      {/* Embedded Advisor Board */}
      <AnimatePresence>
        {showAdvisorBoard && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-2xl border border-[hsl(280_50%_50%/0.15)]"
          >
            <DomainAdvisorBoard domain={showAdvisorBoard} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advisor Stance Cards */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)] mb-3">
          Advisor Positions — Ranked by Confidence
        </p>
        <div className="grid grid-cols-2 gap-3">
          {advisors.map((adv, i) => {
            const isSelected = selectedAdvisor === adv.id;
            return (
              <motion.button
                key={adv.id}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedAdvisor(isSelected ? null : adv.id)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all duration-200 relative group",
                  isSelected
                    ? "border-[hsl(280_50%_55%/0.3)] bg-[hsl(280_40%_50%/0.08)] shadow-[0_0_20px_hsl(280_50%_50%/0.08)]"
                    : "border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] hover:bg-[hsl(0_0%_100%/0.04)] hover:border-[hsl(0_0%_100%/0.1)]",
                )}
              >
                {/* Advisor header with emoji and role */}
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-lg" role="img">{adv.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-[hsl(0_0%_100%/0.85)] leading-tight">{adv.name}</p>
                    <p className="text-[10px] font-medium" style={{ color: adv.accentColor }}>{adv.role}</p>
                  </div>
                  <span className="text-[9px] text-[hsl(0_0%_100%/0.25)] shrink-0">{adv.evidenceCount} sources</span>
                </div>

                {/* Voice bubble — advisor "speaking" */}
                <div className="relative rounded-lg bg-[hsl(0_0%_100%/0.03)] border border-[hsl(0_0%_100%/0.06)] p-3 mb-3">
                  <div className="absolute -top-1.5 left-4 w-3 h-3 rotate-45 bg-[hsl(0_0%_100%/0.03)] border-l border-t border-[hsl(0_0%_100%/0.06)]" />
                  <div className="flex items-start gap-1.5">
                    <MessageCircle size={10} className="text-[hsl(280_50%_60%/0.5)] mt-0.5 shrink-0" />
                    <p className="text-[12px] text-[hsl(0_0%_100%/0.65)] leading-relaxed italic">
                      "{adv.recommendation}"
                    </p>
                  </div>
                </div>

                <ConfidenceBar value={adv.confidence} size="sm" />

                {/* Expanded specialty info */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mt-3 pt-3 border-t border-[hsl(0_0%_100%/0.06)]"
                    >
                      <p className="text-[10px] font-semibold text-[hsl(0_0%_100%/0.5)] mb-1">Specialty</p>
                      <p className="text-[11px] text-[hsl(0_0%_100%/0.4)] leading-relaxed">{adv.specialty}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate("synthesis");
                          setShowAdvisorBoard(scope === "global" ? "business" : scope);
                        }}
                        className="mt-2 text-[10px] font-semibold text-[hsl(280_50%_65%)] hover:text-[hsl(280_50%_80%)] transition-colors flex items-center gap-1"
                      >
                        <Users size={10} /> Deep Focus →
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Disagreement Cards with Evidence Chains */}
      {filteredDisagreements.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(var(--sita-gold))]/60 mb-3 flex items-center gap-1.5">
            <AlertTriangle size={12} /> Active Disagreements
          </p>
          <div className="space-y-3">
            {filteredDisagreements.map((d, i) => {
              const isExpanded = expandedEvidence === d.id;
              const advA = getAdvisorName(d.advisorA.id);
              const advB = getAdvisorName(d.advisorB.id);
              return (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="rounded-xl border border-[hsl(var(--sita-gold))]/15 bg-[hsl(var(--sita-gold))]/3 p-5"
                >
                  <p className="text-sm font-semibold text-[hsl(0_0%_100%/0.85)] mb-3">{d.title}</p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* Advisor A */}
                    <div className="rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.03)] p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">{advA.emoji}</span>
                        <div>
                          <p className="text-[11px] font-bold text-[hsl(0_0%_100%/0.7)]">{advA.name}</p>
                          <p className="text-[9px]" style={{ color: advA.accentColor }}>{advA.role}</p>
                        </div>
                      </div>
                      <div className="rounded-md bg-[hsl(0_0%_100%/0.02)] border border-[hsl(0_0%_100%/0.04)] p-2 mb-2">
                        <p className="text-[11px] text-[hsl(0_0%_100%/0.6)] italic flex items-start gap-1">
                          <MessageCircle size={9} className="shrink-0 mt-0.5 text-[hsl(280_50%_60%/0.4)]" />
                          "{d.advisorA.position}"
                        </p>
                      </div>
                      <ConfidenceBar value={d.advisorA.confidence} size="sm" />
                    </div>
                    {/* Advisor B */}
                    <div className="rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.03)] p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">{advB.emoji}</span>
                        <div>
                          <p className="text-[11px] font-bold text-[hsl(0_0%_100%/0.7)]">{advB.name}</p>
                          <p className="text-[9px]" style={{ color: advB.accentColor }}>{advB.role}</p>
                        </div>
                      </div>
                      <div className="rounded-md bg-[hsl(0_0%_100%/0.02)] border border-[hsl(0_0%_100%/0.04)] p-2 mb-2">
                        <p className="text-[11px] text-[hsl(0_0%_100%/0.6)] italic flex items-start gap-1">
                          <MessageCircle size={9} className="shrink-0 mt-0.5 text-[hsl(280_50%_60%/0.4)]" />
                          "{d.advisorB.position}"
                        </p>
                      </div>
                      <ConfidenceBar value={d.advisorB.confidence} size="sm" />
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-lg bg-[hsl(280_40%_50%/0.06)] border border-[hsl(280_50%_50%/0.15)] p-3 mb-3">
                    <CheckCircle size={14} className="text-[hsl(280_50%_65%)] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-[hsl(280_50%_75%/0.8)] leading-relaxed">{d.resolution}</p>
                  </div>

                  <button
                    onClick={() => setExpandedEvidence(isExpanded ? null : d.id)}
                    className="flex items-center gap-1.5 text-[10px] font-semibold text-[hsl(280_50%_65%/0.6)] hover:text-[hsl(280_50%_75%)] transition-colors"
                  >
                    {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    {isExpanded ? "Hide Evidence Trail" : "View Evidence Trail"}
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-3"
                      >
                        <EvidenceChain title="Evidence Trail" nodes={d.evidence} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
