import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AdvisorPortrait } from "./AdvisorPortrait";
import { GlassPanel, CinematicBackground, HolographicGauge } from "./boardroom-primitives";
import { Swords, ThumbsUp, ArrowRight, Sparkles, FileText } from "lucide-react";
import type { AdvisorConfig } from "./AdvisorCouncilShell";

type AdvisorDomain = "business" | "money" | "concierge" | "family" | "growth" | "trust" | "opportunity" | "recovery" | "boardroom" | "general";

interface DebatePair {
  left: AdvisorConfig;
  right: AdvisorConfig;
  topic: string;
  leftPosition: string;
  rightPosition: string;
}

interface AdvisorDebateViewProps {
  advisors: AdvisorConfig[];
  domainLabel: string;
}

const generateDebates = (advisors: AdvisorConfig[]): DebatePair[] => {
  if (advisors.length < 2) return [];
  const debates: DebatePair[] = [];
  const topics = [
    { topic: "Priority Allocation", left: "Prioritize defensive spending & reserves", right: "Redirect funds to growth opportunities" },
    { topic: "Risk Tolerance", left: "Conservative approach — minimize exposure", right: "Calculated risk — higher potential returns" },
    { topic: "Timeline Strategy", left: "Short-term stability first", right: "Long-term positioning takes priority" },
  ];

  for (let i = 0; i < Math.min(topics.length, Math.floor(advisors.length / 2)); i++) {
    debates.push({
      left: advisors[i * 2],
      right: advisors[i * 2 + 1],
      topic: topics[i].topic,
      leftPosition: topics[i].left,
      rightPosition: topics[i].right,
    });
  }
  return debates;
};

const leftAccent = "#f59e0b";
const rightAccent = "#06b6d4";

export const AdvisorDebateView = ({ advisors, domainLabel }: AdvisorDebateViewProps) => {
  const debates = generateDebates(advisors);
  const [votes, setVotes] = useState<Record<number, "left" | "right">>({});

  if (debates.length === 0) {
    return (
      <div className="py-12 text-center rounded-2xl bg-[#0a0a14]">
        <Swords className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-white/40">Need at least 2 advisors to generate debates</p>
      </div>
    );
  }

  return (
    <CinematicBackground className="rounded-2xl space-y-6 p-4 md:p-6">
      <GlassPanel className="px-4 py-2 inline-flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
        <span className="text-xs text-white/60">
          Where your {domainLabel.toLowerCase()} advisors see things differently
        </span>
      </GlassPanel>

      {debates.map((debate, idx) => {
        const convergence = Math.round((debate.left.confidence + debate.right.confidence) / 2);
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.15 }}
          >
            {/* Topic */}
            <GlassPanel className="px-4 py-2.5 mb-4 flex items-center justify-between">
              <span className="text-sm font-bold text-white">{debate.topic}</span>
              {votes[idx] && (
                <span className="text-[10px] text-emerald-400 font-medium">Decision recorded ✓</span>
              )}
            </GlassPanel>

            {/* Split Screen */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
              {/* Left */}
              <CinematicDebateCard
                advisor={debate.left}
                position={debate.leftPosition}
                accent={leftAccent}
                voted={votes[idx] === "left"}
                onVote={() => setVotes(v => ({ ...v, [idx]: "left" }))}
              />

              {/* Center Convergence */}
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="relative">
                  <HolographicGauge value={convergence} label="Convergence" size={90} color="#f59e0b" />
                </div>
                <motion.div
                  className="flex items-center justify-center h-10 w-10 rounded-full border-2 border-white/20"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Swords className="h-4 w-4 text-white/60" />
                </motion.div>
              </div>

              {/* Right */}
              <CinematicDebateCard
                advisor={debate.right}
                position={debate.rightPosition}
                accent={rightAccent}
                voted={votes[idx] === "right"}
                onVote={() => setVotes(v => ({ ...v, [idx]: "right" }))}
              />
            </div>
          </motion.div>
        );
      })}
    </CinematicBackground>
  );
};

const CinematicDebateCard = ({
  advisor,
  position,
  accent,
  voted,
  onVote,
}: {
  advisor: AdvisorConfig;
  position: string;
  accent: string;
  voted: boolean;
  onVote: () => void;
}) => {
  return (
    <GlassPanel className={cn("p-5 space-y-4", voted && "ring-1 ring-white/20")}>
      {/* Portrait + Name */}
      <div className="flex items-center gap-3">
        <div style={{ filter: `drop-shadow(0 0 12px ${accent}60)` }}>
          <AdvisorPortrait
            domain={advisor.domain as AdvisorDomain}
            name={advisor.name}
            status={advisor.status}
            size="lg"
          />
        </div>
        <div>
          <p className="text-sm font-bold text-white">{advisor.name}</p>
          <p className="text-[10px] text-white/40">{advisor.confidence}% confident</p>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="space-y-1">
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: accent }}
            initial={{ width: 0 }}
            animate={{ width: `${advisor.confidence}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      {/* Evidence Panel */}
      <GlassPanel className="p-3 space-y-2">
        <div className="flex items-center gap-1.5">
          <FileText className="h-3 w-3 text-white/40" />
          <span className="text-[10px] text-white/50 uppercase tracking-wider">Position</span>
        </div>
        <p className="text-xs text-white/70 leading-relaxed">{position}</p>
      </GlassPanel>

      {/* Vote Button */}
      <button
        className={cn(
          "w-full rounded-xl py-2.5 text-xs font-semibold transition-all",
          voted
            ? "bg-white/10 text-white border border-white/20"
            : "bg-white/[0.06] hover:bg-white/[0.12] text-white/70 hover:text-white border border-white/[0.08]"
        )}
        onClick={onVote}
        disabled={voted}
      >
        {voted ? (
          <span className="flex items-center justify-center gap-1.5">
            <ThumbsUp className="h-3 w-3" /> Selected
          </span>
        ) : (
          <span className="flex items-center justify-center gap-1.5">
            <ArrowRight className="h-3 w-3" /> Choose this position
          </span>
        )}
      </button>
    </GlassPanel>
  );
};
