// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Debate View
// Courtroom-style side-by-side advisor disagreement display
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, MessageSquare, ThumbsUp, ThumbsDown, Gavel, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BUSINESS_ADVISORS } from "@/domains/engines/business-advisor-personas";
import type { AIRecommendation } from "@/modules/business/hooks/useBusinessAdvisorBoard";
import { AnimatedConfidenceRing } from "./AnimatedConfidenceRing";
import { resolveDebate, DEFAULT_DEBATE_POLICY, type DebateOutcome } from "@/lib/advisors/advisor-debate-orchestrator";
import { resolveConflict } from "@/lib/advisors/advisor-conflict-resolution-policy";

interface DebatePosition {
  advisorId: string;
  position: string;
  evidence: string[];
  confidence: number;
  recommendation: string;
}

interface Debate {
  id: string;
  topic: string;
  context: string;
  sideA: DebatePosition;
  sideB: DebatePosition;
  resolved: boolean;
  verdict?: "a" | "b" | null;
}

interface Props {
  recommendations: AIRecommendation[];
  onDecide?: (debateId: string, winner: "a" | "b") => void;
}

function generateDebates(recs: AIRecommendation[]): Debate[] {
  const debates: Debate[] = [];

  // Find opposing recommendations
  const revenueRecs = recs.filter(r => r.advisorId === "revenue-advisor");
  const clientRecs = recs.filter(r => r.advisorId === "client-success-advisor");
  const financeRecs = recs.filter(r => r.advisorId === "financial-advisor");
  const opsRecs = recs.filter(r => r.advisorId === "ops-advisor");

  // Revenue vs Client Success: Growth vs Retention
  if (revenueRecs.length > 0 && clientRecs.length > 0) {
    debates.push({
      id: "debate-growth-vs-retention",
      topic: "Growth Push vs Client Retention Focus",
      context: "Revenue and Client Success advisors have different priorities for this quarter.",
      sideA: {
        advisorId: "revenue-advisor",
        position: "Prioritize aggressive lead follow-up and pipeline acceleration to close $52K in open opportunities.",
        evidence: ["3 leads going cold this week", "Quote aging beyond 12 days", "Revenue target gap of $8K"],
        confidence: 0.78,
        recommendation: "Full pipeline push — schedule callback blitz and fast-track 2 proposals",
      },
      sideB: {
        advisorId: "client-success-advisor",
        position: "Focus on retaining existing clients first — Meridian LLC and Cascade Group show churn risk signals.",
        evidence: ["Meridian LLC: 28 days no contact", "Cascade Group: 35 days dormant", "$54K ARR at risk"],
        confidence: 0.82,
        recommendation: "Retention sweep — schedule check-ins with at-risk clients before new outreach",
      },
      resolved: false,
    });
  }

  // Finance vs Ops: Cost control vs Capacity
  if (financeRecs.length > 0 || opsRecs.length > 0) {
    debates.push({
      id: "debate-cost-vs-capacity",
      topic: "Cost Reduction vs Capacity Investment",
      context: "The financial and operations advisors disagree on resource allocation.",
      sideA: {
        advisorId: "financial-advisor",
        position: "Reduce discretionary spending by 20% to extend cash runway from 120 to 150+ days.",
        evidence: ["$3,200 in unused subscriptions", "Marketing ROI below threshold", "Cash reserves declining"],
        confidence: 0.75,
        recommendation: "Trim $2,400/mo in subscriptions and defer non-essential investments",
      },
      sideB: {
        advisorId: "ops-advisor",
        position: "Invest in capacity now — the team is at 85% utilization and blocking new revenue.",
        evidence: ["6 overdue tasks", "2 blocked workflows", "Pipeline exceeds capacity by 30%"],
        confidence: 0.70,
        recommendation: "Hire contractor or part-time help to unlock $14K/mo potential revenue",
      },
      resolved: false,
    });
  }

  return debates;
}

function DebateSide({ position, side, isWinner }: { position: DebatePosition; side: "A" | "B"; isWinner: boolean | null }) {
  const advisor = BUSINESS_ADVISORS.find(a => a.id === position.advisorId);
  const borderColor = isWinner === true ? "hsl(152 55% 48%)" : isWinner === false ? "hsl(0 0% 30%)" : side === "A" ? "hsl(265 55% 58%)" : "hsl(38 85% 58%)";

  return (
    <motion.div
      initial={{ opacity: 0, x: side === "A" ? -15 : 15 }}
      animate={{ opacity: isWinner === false ? 0.5 : 1, x: 0 }}
      transition={{ duration: 0.4, delay: side === "A" ? 0 : 0.15 }}
      className="flex-1 rounded-xl p-3 border"
      style={{ borderColor, backgroundColor: `${borderColor} / 0.05`.replace(" /", "/").replace(")", ")") }}
    >
      {/* Advisor Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-[hsl(0_0%_100%/0.06)] flex items-center justify-center text-base">
          {advisor?.emoji ?? "🤖"}
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-foreground">{advisor?.displayName ?? position.advisorId}</span>
            {isWinner && <CheckCircle className="h-3 w-3 text-[hsl(152_55%_48%)]" />}
          </div>
          <span className="text-[9px] text-muted-foreground">{advisor?.role}</span>
        </div>
        <div className="ml-auto">
          <AnimatedConfidenceRing value={Math.round(position.confidence * 100)} size={40} strokeWidth={3} />
        </div>
      </div>

      {/* Position */}
      <p className="text-[10px] text-foreground/90 mb-2 leading-relaxed">{position.position}</p>

      {/* Evidence */}
      <div className="space-y-1 mb-2">
        <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wider">Evidence</span>
        {position.evidence.map((e, i) => (
          <div key={i} className="flex items-start gap-1.5">
            <div className="w-1 h-1 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />
            <span className="text-[9px] text-muted-foreground">{e}</span>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div className="rounded-lg bg-[hsl(0_0%_100%/0.03)] border border-[hsl(0_0%_100%/0.06)] p-2">
        <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wider">Recommendation</span>
        <p className="text-[10px] text-foreground mt-0.5">{position.recommendation}</p>
      </div>
    </motion.div>
  );
}

export function AdvisorDebateView({ recommendations, onDecide }: Props) {
  const [debates, setDebates] = useState<Debate[]>(() => generateDebates(recommendations));
  const [expandedId, setExpandedId] = useState<string | null>(debates[0]?.id ?? null);

  const handleDecision = (debateId: string, winner: "a" | "b") => {
    setDebates(prev => prev.map(d => d.id === debateId ? { ...d, resolved: true, verdict: winner } : d));
    onDecide?.(debateId, winner);
  };

  if (debates.length === 0) {
    return (
      <div className="text-center py-12">
        <Scale className="h-8 w-8 mx-auto text-muted-foreground/20 mb-3" />
        <p className="text-xs text-muted-foreground">No active disagreements</p>
        <p className="text-[10px] text-muted-foreground/60">When advisors have conflicting views, debates will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Scale className="h-4 w-4 text-[hsl(265_55%_58%)]" />
        <h3 className="text-sm font-display font-bold text-foreground">Advisor Debates</h3>
        <Badge variant="outline" className="text-[8px] px-1.5 py-0 border-[hsl(38_85%_58%)] text-[hsl(38_85%_58%)]">
          {debates.filter(d => !d.resolved).length} unresolved
        </Badge>
      </div>

      {debates.map(debate => (
        <Card key={debate.id} className="border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.015)] overflow-hidden">
          {/* Header */}
          <CardHeader
            className="pb-2 cursor-pointer"
            onClick={() => setExpandedId(expandedId === debate.id ? null : debate.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gavel className="h-3.5 w-3.5 text-[hsl(265_55%_58%)]" />
                <CardTitle className="text-xs font-display">{debate.topic}</CardTitle>
                {debate.resolved && (
                  <Badge variant="outline" className="text-[7px] px-1 py-0 border-[hsl(152_55%_48%)] text-[hsl(152_55%_48%)]">
                    Decided
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground">{debate.context}</p>
          </CardHeader>

          <AnimatePresence>
            {expandedId === debate.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardContent className="pt-0 space-y-3">
                  {/* Side-by-side positions */}
                  <div className="flex gap-3">
                    <DebateSide
                      position={debate.sideA}
                      side="A"
                      isWinner={debate.verdict === "a" ? true : debate.verdict === "b" ? false : null}
                    />
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="w-px h-full bg-[hsl(0_0%_100%/0.1)]" />
                      <span className="text-[8px] text-muted-foreground font-medium">VS</span>
                      <div className="w-px h-full bg-[hsl(0_0%_100%/0.1)]" />
                    </div>
                    <DebateSide
                      position={debate.sideB}
                      side="B"
                      isWinner={debate.verdict === "b" ? true : debate.verdict === "a" ? false : null}
                    />
                  </div>

                  {/* Decision Buttons */}
                  {!debate.resolved && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center justify-center gap-3 pt-2 border-t border-[hsl(0_0%_100%/0.06)]"
                    >
                      <span className="text-[10px] text-muted-foreground">Your decision:</span>
                      <Button
                        size="sm"
                        className="text-[10px] h-7 bg-[hsl(265_55%_58%)] hover:bg-[hsl(265_55%_48%)] text-white"
                        onClick={() => handleDecision(debate.id, "a")}
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        Side with {BUSINESS_ADVISORS.find(a => a.id === debate.sideA.advisorId)?.displayName}
                      </Button>
                      <Button
                        size="sm"
                        className="text-[10px] h-7 bg-[hsl(38_85%_58%)] hover:bg-[hsl(38_85%_48%)] text-white"
                        onClick={() => handleDecision(debate.id, "b")}
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        Side with {BUSINESS_ADVISORS.find(a => a.id === debate.sideB.advisorId)?.displayName}
                      </Button>
                    </motion.div>
                  )}

                  {debate.resolved && debate.verdict && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center gap-2 pt-2 border-t border-[hsl(152_55%_48%/0.15)]"
                    >
                      <CheckCircle className="h-4 w-4 text-[hsl(152_55%_48%)]" />
                      <span className="text-[10px] font-medium text-foreground">
                        Decision: {BUSINESS_ADVISORS.find(a => a.id === (debate.verdict === "a" ? debate.sideA.advisorId : debate.sideB.advisorId))?.displayName}'s position adopted
                      </span>
                    </motion.div>
                  )}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      ))}
    </div>
  );
}