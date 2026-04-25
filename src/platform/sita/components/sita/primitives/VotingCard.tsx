// ═══════════════════════════════════════════════════════════════
// SITA OS — VotingCard Primitive
// Multi-advisor vote visualization with stacked bar
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react";

export interface Vote {
  advisorName: string;
  domain: string;
  position: "for" | "against" | "abstain";
  confidence: number;
  reasoning: string;
}

interface VotingCardProps {
  question: string;
  votes: Vote[];
  className?: string;
}

const domainColors: Record<string, string> = {
  business: "hsl(210 60% 55%)",
  finance: "hsl(152 55% 48%)",
  concierge: "hsl(280 50% 55%)",
  legal: "hsl(35 80% 55%)",
  strategy: "hsl(265 55% 58%)",
};

export function VotingCard({ question, votes, className }: VotingCardProps) {
  const forVotes = votes.filter(v => v.position === "for");
  const againstVotes = votes.filter(v => v.position === "against");
  const abstainVotes = votes.filter(v => v.position === "abstain");
  const total = votes.length;
  const forPct = (forVotes.length / total) * 100;
  const againstPct = (againstVotes.length / total) * 100;

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 space-y-3", className)}>
      <p className="text-sm font-semibold text-foreground">{question}</p>

      {/* Stacked Bar */}
      <div className="h-3 rounded-full overflow-hidden flex bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${forPct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-[hsl(var(--trust-safe))] rounded-l-full"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${againstPct}%` }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="bg-destructive"
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3 text-[hsl(var(--trust-safe))]" /> {forVotes.length} For</span>
        <span className="flex items-center gap-1"><Minus className="h-3 w-3" /> {abstainVotes.length} Abstain</span>
        <span className="flex items-center gap-1"><ThumbsDown className="h-3 w-3 text-destructive" /> {againstVotes.length} Against</span>
      </div>

      {/* Individual Votes */}
      <div className="space-y-1.5">
        {votes.map((v, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-2 text-[11px]"
          >
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: domainColors[v.domain] || "hsl(var(--muted-foreground))" }} />
            <span className="font-medium text-foreground w-20 truncate">{v.advisorName}</span>
            <span className={cn(
              "px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase",
              v.position === "for" ? "bg-[hsl(var(--trust-safe)/0.15)] text-[hsl(var(--trust-safe))]" :
              v.position === "against" ? "bg-destructive/10 text-destructive" :
              "bg-muted text-muted-foreground"
            )}>
              {v.position}
            </span>
            <span className="text-muted-foreground truncate flex-1">{v.reasoning}</span>
            <span className="text-[9px] tabular-nums text-muted-foreground/60 shrink-0">{v.confidence}%</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
