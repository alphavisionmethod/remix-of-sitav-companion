import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, Scale, ChevronDown, ChevronRight, MessageCircle, Users, Shield, Lock, HelpCircle, XCircle } from "lucide-react";
import { ConfidenceBar } from "@/components/sita/primitives";
import { EvidenceChain, type EvidenceNode } from "@/components/sita/primitives/EvidenceChain";
import { getAdvisorRoster, ADVISOR_ROSTERS, type AdvisorRole } from "@/domains/advisors/topology";
import { BoardroomAdvisorCouncil } from "./BoardroomAdvisorCouncil";
import { BoardroomDiscussionThread } from "./BoardroomDiscussionThread";
import { DomainAdvisorBoard } from "@/components/sita/domain-shared/DomainAdvisorBoard";
import { AdvisorProfileCard } from "./AdvisorProfileCard";

interface Props {
  scope: "global" | "business" | "finance" | "concierge";
  onNavigate: (module: string) => void;
}

// Stance types for advisor visualization
type AdvisorStance = "agree" | "caution" | "dissent" | "unresolved" | "blocked" | "simulation-only" | "verified";

const STANCE_CONFIG: Record<AdvisorStance, { icon: React.ElementType; color: string; bg: string; label: string; borderStyle?: string }> = {
  agree: { icon: CheckCircle, color: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/15", label: "Agree" },
  caution: { icon: Shield, color: "text-[hsl(var(--sita-gold))]", bg: "bg-[hsl(var(--sita-gold))]/15", label: "Caution" },
  dissent: { icon: XCircle, color: "text-[hsl(var(--destructive))]", bg: "bg-[hsl(var(--destructive))]/15", label: "Dissent" },
  unresolved: { icon: HelpCircle, color: "text-[hsl(0_0%_100%/0.4)]", bg: "bg-[hsl(0_0%_100%/0.06)]", label: "Unresolved" },
  blocked: { icon: Lock, color: "text-[hsl(var(--destructive))]", bg: "bg-[hsl(var(--destructive))]/10", label: "Blocked" },
  "simulation-only": { icon: HelpCircle, color: "text-[hsl(280_50%_65%)]", bg: "bg-[hsl(280_50%_50%/0.1)]", label: "Sim Only", borderStyle: "border-dashed" },
  verified: { icon: CheckCircle, color: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/10", label: "Verified" },
};

const ADVISOR_STANCE_MAP: Record<string, { recommendation: string; confidence: number; evidenceCount: number; stance: AdvisorStance }> = {
  "biz-revenue": { recommendation: "Prioritize collections — $18.5K overdue threatens cash target", confidence: 72, evidenceCount: 6, stance: "agree" },
  "biz-relationship": { recommendation: "Preserve client relationships — segment by value before outreach", confidence: 68, evidenceCount: 4, stance: "caution" },
  "biz-followthrough": { recommendation: "Pipeline velocity needs attention — 3 deals stalled over 14 days", confidence: 74, evidenceCount: 5, stance: "agree" },
  "biz-support": { recommendation: "Support queue manageable but NPS trending down", confidence: 60, evidenceCount: 2, stance: "unresolved" },
  "biz-collections": { recommendation: "Accelerate TechCorp outreach — largest overdue at $12.5K", confidence: 78, evidenceCount: 5, stance: "agree" },
  "biz-operations": { recommendation: "Reduce support ticket response time to protect NPS", confidence: 60, evidenceCount: 2, stance: "caution" },
  "fin-obligations": { recommendation: "Defer $342/mo subscriptions to restore reserve buffer", confidence: 78, evidenceCount: 5, stance: "agree" },
  "fin-spending": { recommendation: "AWS billing spike detected — investigate before next cycle", confidence: 74, evidenceCount: 4, stance: "caution" },
  "fin-planning": { recommendation: "Q2 forecast needs adjustment based on pipeline slowdown", confidence: 65, evidenceCount: 3, stance: "simulation-only" },
  "fin-reserve": { recommendation: "Accelerate AR collection — reserves critical at 72% of target", confidence: 65, evidenceCount: 3, stance: "dissent" },
  "fin-approvals": { recommendation: "2 pending payments need review before end of week", confidence: 82, evidenceCount: 4, stance: "verified" },
  "fin-receivables": { recommendation: "3 receivables aging past 30 days — collections needed", confidence: 76, evidenceCount: 5, stance: "agree" },
  "con-lifeadmin": { recommendation: "School enrollment deadline approaching — needs decision this week", confidence: 55, evidenceCount: 2, stance: "blocked" },
  "con-travel": { recommendation: "NYC prep fully cleared — safe to approve logistics package", confidence: 88, evidenceCount: 7, stance: "verified" },
  "con-logistics": { recommendation: "Errand batch optimization available — save 45 min this week", confidence: 82, evidenceCount: 3, stance: "agree" },
  "con-support": { recommendation: "Task delegation opportunities detected — 3 items automatable", confidence: 70, evidenceCount: 3, stance: "caution" },
  "con-prep": { recommendation: "All prep items for upcoming appointments are cleared", confidence: 92, evidenceCount: 6, stance: "verified" },
  "con-household": { recommendation: "Household coordination normal — grocery run due Thursday", confidence: 85, evidenceCount: 4, stance: "agree" },
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

function getAdvisorName(id: string): AdvisorRole {
  for (const roster of Object.values(ADVISOR_ROSTERS)) {
    const found = roster.advisors.find(a => a.id === id);
    if (found) return found;
  }
  return { id, name: id, emoji: "🤖", role: "Advisor", specialty: "", accentColor: "hsl(280 50% 55%)", avatarUrl: "" };
}

// Room Tension Map component
function RoomTensionMap({ stances }: { stances: AdvisorStance[] }) {
  const counts = {
    agree: stances.filter(s => s === "agree" || s === "verified").length,
    caution: stances.filter(s => s === "caution" || s === "simulation-only").length,
    dissent: stances.filter(s => s === "dissent" || s === "blocked").length,
    unresolved: stances.filter(s => s === "unresolved").length,
  };
  const total = stances.length || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4"
    >
      <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[hsl(0_0%_100%/0.3)] mb-3">
        Room Tension Map
      </p>
      {/* Stacked bar */}
      <div className="h-3 rounded-full overflow-hidden flex mb-3">
        <motion.div
          className="h-full bg-[hsl(var(--trust-safe))]"
          initial={{ width: 0 }}
          animate={{ width: `${(counts.agree / total) * 100}%` }}
          transition={{ duration: 0.6 }}
        />
        <motion.div
          className="h-full bg-[hsl(var(--sita-gold))]"
          initial={{ width: 0 }}
          animate={{ width: `${(counts.caution / total) * 100}%` }}
          transition={{ duration: 0.6, delay: 0.1 }}
        />
        <motion.div
          className="h-full bg-[hsl(var(--destructive))]"
          initial={{ width: 0 }}
          animate={{ width: `${(counts.dissent / total) * 100}%` }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />
        <motion.div
          className="h-full bg-[hsl(0_0%_100%/0.15)]"
          initial={{ width: 0 }}
          animate={{ width: `${(counts.unresolved / total) * 100}%` }}
          transition={{ duration: 0.6, delay: 0.3 }}
        />
      </div>
      <div className="flex items-center gap-4 text-[9px]">
        <span className="flex items-center gap-1.5 text-[hsl(var(--trust-safe))]">
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--trust-safe))]" /> Agree ({counts.agree})
        </span>
        <span className="flex items-center gap-1.5 text-[hsl(var(--sita-gold))]">
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--sita-gold))]" /> Caution ({counts.caution})
        </span>
        <span className="flex items-center gap-1.5 text-[hsl(var(--destructive))]">
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--destructive))]" /> Dissent ({counts.dissent})
        </span>
        <span className="flex items-center gap-1.5 text-[hsl(0_0%_100%/0.4)]">
          <span className="w-2 h-2 rounded-full bg-[hsl(0_0%_100%/0.15)]" /> Unresolved ({counts.unresolved})
        </span>
      </div>
    </motion.div>
  );
}

export function BoardroomSynthesisView({ scope, onNavigate }: Props) {
  const [expandedEvidence, setExpandedEvidence] = useState<string | null>(null);
  const [showAdvisorBoard, setShowAdvisorBoard] = useState<string | null>(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState<string | null>(null);

  const advisors = useMemo(() => {
    const domains = scope === "global" ? ["business", "finance", "concierge"] : [scope];
    const result: (AdvisorRole & { recommendation: string; confidence: number; evidenceCount: number; stance: AdvisorStance })[] = [];
    domains.forEach(d => {
      const roster = getAdvisorRoster(d);
      roster.advisors.forEach(adv => {
        const stance = ADVISOR_STANCE_MAP[adv.id] || { recommendation: "Awaiting analysis…", confidence: 50, evidenceCount: 0, stance: "unresolved" as AdvisorStance };
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
  const allStances = advisors.map(a => a.stance);

  const domainForBoard = scope === "global" ? "business" : scope;

  return (
    <div className="p-6 space-y-6">
      {/* The Council — Cinematic Arc */}
      <BoardroomAdvisorCouncil scope={scope} onSelectAdvisor={(id) => setSelectedAdvisor(id)} />

      {/* Room Tension Map */}
      <RoomTensionMap stances={allStances} />

      {/* Live Discussion Thread */}
      <BoardroomDiscussionThread scope={scope} />

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

      {/* Advisor Stance Cards with stance badges */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(280_50%_65%/0.5)] mb-3">
          Advisor Positions — Ranked by Confidence
        </p>
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-[hsl(0_0%_100%/0.08)]">
          {advisors.map((adv, i) => {
            const stanceCfg = STANCE_CONFIG[adv.stance];
            const StanceIcon = stanceCfg.icon;
            return (
              <motion.div
                key={adv.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="snap-start shrink-0 w-[160px] relative"
              >
                {/* Stance badge overlay */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.04, type: "spring", stiffness: 400 }}
                  className={cn(
                    "absolute -top-1.5 -right-1.5 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[7px] font-bold border",
                    stanceCfg.bg, stanceCfg.color,
                    stanceCfg.borderStyle || "border-transparent",
                  )}
                >
                  <StanceIcon size={8} />
                  {stanceCfg.label}
                </motion.div>
                <AdvisorProfileCard
                  advisor={adv}
                  recommendation={adv.recommendation}
                  confidence={adv.confidence}
                  evidenceCount={adv.evidenceCount}
                  status={selectedAdvisor === adv.id ? "speaking" : "active"}
                  selected={selectedAdvisor === adv.id}
                  onClick={() => setSelectedAdvisor(selectedAdvisor === adv.id ? null : adv.id)}
                  size="md"
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Disagreement Cards with Evidence */}
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
                    {[{ adv: advA, side: d.advisorA }, { adv: advB, side: d.advisorB }].map(({ adv, side }) => (
                      <div key={adv.id} className="rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.03)] p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-8 h-8 rounded-full overflow-hidden border-2 shrink-0"
                            style={{ borderColor: adv.accentColor }}
                          >
                            {adv.avatarUrl ? (
                              <img src={adv.avatarUrl} alt={adv.name} className="w-full h-full object-cover" />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center text-white"
                                style={{ background: `linear-gradient(135deg, ${adv.accentColor}, ${adv.accentColor}88)` }}
                              >
                                {adv.emoji}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-[hsl(0_0%_100%/0.7)]">{adv.name}</p>
                            <p className="text-[9px]" style={{ color: adv.accentColor }}>{adv.role}</p>
                          </div>
                        </div>
                        <div className="rounded-md bg-[hsl(0_0%_100%/0.02)] border border-[hsl(0_0%_100%/0.04)] p-2 mb-2">
                          <p className="text-[11px] text-[hsl(0_0%_100%/0.6)] italic flex items-start gap-1">
                            <MessageCircle size={9} className="shrink-0 mt-0.5 text-[hsl(280_50%_60%/0.4)]" />
                            "{side.position}"
                          </p>
                        </div>
                        <ConfidenceBar value={side.confidence} size="sm" />
                      </div>
                    ))}
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
                    Evidence Chain ({d.evidence.length} nodes)
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-3"
                      >
                        <EvidenceChain title={d.title} nodes={d.evidence} />
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
