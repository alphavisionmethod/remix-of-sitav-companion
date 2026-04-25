// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Decision Advisor for Simulations
// Post-simulation plain-English analysis
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Brain, Loader2, Swords, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { generateDecisionBrief, generateDevilsAdvocate } from "@/domains/simulation/market-intelligence";
import type { SimulationResult } from "@/domains/simulation/monte-carlo-engine";

interface SimulationAdvisorProps {
  result: SimulationResult | null;
  scenarioLabel: string;
  isComplete: boolean;
  var95?: number;
  cvar95?: number;
}

export function SimulationAdvisor({ result, scenarioLabel, isComplete, var95, cvar95 }: SimulationAdvisorProps) {
  const [brief, setBrief] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<string | null>(null);
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [loadingChallenge, setLoadingChallenge] = useState(false);

  const handleGenerateBrief = async () => {
    if (!result) return;
    setLoadingBrief(true);
    setBrief(null);
    setChallenge(null);
    try {
      const text = await generateDecisionBrief(scenarioLabel, {
        mean: result.mean,
        stdDev: result.stdDev,
        percentiles: result.percentiles,
        total: result.total,
        sensitivity: result.sensitivity,
        var95,
        cvar95,
      });
      setBrief(text);
    } finally {
      setLoadingBrief(false);
    }
  };

  const handleChallenge = async () => {
    if (!brief) return;
    setLoadingChallenge(true);
    try {
      const text = await generateDevilsAdvocate(scenarioLabel, brief);
      setChallenge(text);
    } finally {
      setLoadingChallenge(false);
    }
  };

  if (!isComplete || !result) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Brain className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          AI Decision Advisor
        </span>
      </div>

      {!brief && (
        <Button
          onClick={handleGenerateBrief}
          disabled={loadingBrief}
          variant="outline"
          size="sm"
          className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/5"
        >
          {loadingBrief ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing...</>
          ) : (
            <><Sparkles className="h-3.5 w-3.5" /> Generate Decision Brief</>
          )}
        </Button>
      )}

      <AnimatePresence>
        {brief && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Brief */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-[9px] font-bold text-primary uppercase">AI Analysis</span>
              </div>
              <div className="prose prose-sm prose-invert max-w-none text-[11px] text-foreground leading-relaxed">
                <ReactMarkdown>{brief}</ReactMarkdown>
              </div>
            </div>

            {/* Challenge Button */}
            {!challenge && (
              <Button
                onClick={handleChallenge}
                disabled={loadingChallenge}
                variant="ghost"
                size="sm"
                className="w-full gap-2 text-xs text-muted-foreground hover:text-[hsl(var(--destructive))]"
              >
                {loadingChallenge ? (
                  <><Loader2 className="h-3 w-3 animate-spin" /> Challenging...</>
                ) : (
                  <><Swords className="h-3 w-3" /> Challenge This</>
                )}
              </Button>
            )}

            {/* Devil's Advocate */}
            {challenge && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-[hsl(var(--destructive))]/20 bg-[hsl(var(--destructive))]/5 p-3"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <Swords className="h-3 w-3 text-[hsl(var(--destructive))]" />
                  <span className="text-[9px] font-bold text-[hsl(var(--destructive))] uppercase">
                    Devil's Advocate
                  </span>
                </div>
                <div className="prose prose-sm prose-invert max-w-none text-[11px] text-foreground leading-relaxed">
                  <ReactMarkdown>{challenge}</ReactMarkdown>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
