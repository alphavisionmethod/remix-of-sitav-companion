import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AdvisorAvatar } from "@/components/sita/primitives/AdvisorAvatar";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { Button } from "@/components/ui/button";
import { Swords, ThumbsUp, ArrowRight, Sparkles } from "lucide-react";
import type { AdvisorConfig } from "./AdvisorCouncilShell";

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

export const AdvisorDebateView = ({ advisors, domainLabel }: AdvisorDebateViewProps) => {
  const debates = generateDebates(advisors);
  const [votes, setVotes] = useState<Record<number, "left" | "right">>({});

  if (debates.length === 0) {
    return (
      <div className="py-12 text-center">
        <Swords className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Need at least 2 advisors to generate debates</p>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 mt-4"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
    >
      <p className="text-xs text-muted-foreground">
        <Sparkles className="h-3 w-3 inline mr-1" />
        Where your {domainLabel.toLowerCase()} advisors see things differently
      </p>

      {debates.map((debate, idx) => (
        <motion.div
          key={idx}
          variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
          className="rounded-xl border border-border/60 bg-card overflow-hidden"
        >
          {/* Topic Header */}
          <div className="px-4 py-2.5 bg-muted/30 border-b border-border/40 flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">{debate.topic}</span>
            {votes[idx] && (
              <span className="text-[10px] text-primary font-medium">Decision recorded ✓</span>
            )}
          </div>

          {/* Debate Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-0">
            {/* Left */}
            <DebateCard
              advisor={debate.left}
              position={debate.leftPosition}
              side="left"
              voted={votes[idx] === "left"}
              onVote={() => setVotes(v => ({ ...v, [idx]: "left" }))}
            />

            {/* VS Divider */}
            <div className="flex items-center justify-center px-2 py-3 sm:py-0">
              <motion.div
                className="flex items-center justify-center h-10 w-10 rounded-full bg-destructive/10 border-2 border-destructive/20"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="text-xs font-black text-destructive">VS</span>
              </motion.div>
            </div>

            {/* Right */}
            <DebateCard
              advisor={debate.right}
              position={debate.rightPosition}
              side="right"
              voted={votes[idx] === "right"}
              onVote={() => setVotes(v => ({ ...v, [idx]: "right" }))}
            />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

const DebateCard = ({
  advisor,
  position,
  side,
  voted,
  onVote,
}: {
  advisor: AdvisorConfig;
  position: string;
  side: "left" | "right";
  voted: boolean;
  onVote: () => void;
}) => (
  <div className={cn(
    "p-4 space-y-3",
    voted && "bg-primary/5 ring-1 ring-primary/20 rounded-lg m-1"
  )}>
    <div className="flex items-center gap-2">
      <AdvisorAvatar domain={advisor.domain} status={advisor.status} size="sm" />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-foreground truncate">{advisor.name}</p>
        <p className="text-[10px] text-muted-foreground">{advisor.confidence}% confident</p>
      </div>
    </div>

    <ConfidenceBar value={advisor.confidence} height="sm" />

    <p className="text-xs text-foreground/80 leading-relaxed">{position}</p>

    <Button
      size="sm"
      variant={voted ? "default" : "outline"}
      className="w-full text-xs h-8"
      onClick={onVote}
      disabled={voted}
    >
      {voted ? (
        <><ThumbsUp className="h-3 w-3 mr-1" /> Selected</>
      ) : (
        <><ArrowRight className="h-3 w-3 mr-1" /> Choose this position</>
      )}
    </Button>
  </div>
);
