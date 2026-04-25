// ═══════════════════════════════════════════════════════════════
// SITA OS — Premium Advisor Components (Customer-Facing)
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { TrustBadge } from "@/platform/sita/components/sita/TrustBadge";
import {
  Briefcase, DollarSign, Headphones, Heart, TrendingUp, Target,
  Shield, AlertTriangle, CheckCircle, Clock, Eye, Play, ArrowRight,
  Zap, FileText, Brain, Lightbulb, Scale, GitCompare, Lock, Unlock,
  ChevronRight, Sparkles, BarChart3, ShieldCheck, RefreshCw, X
} from "lucide-react";
import type {
  AdvisorSummary, AdvisorRecommendation, SimulationResult,
  ApprovalRequest, ProofHistoryItem, MemoryItem, MultiAdvisorSynthesis,
} from "@/data/fixtures/mock-data/advisor-mission-control";

const iconMap: Record<string, React.ElementType> = {
  Briefcase, DollarSign, Headphones, Heart, TrendingUp, Target, Shield, BarChart3,
};

const confidenceColor = (c: number) =>
  c >= 0.85 ? "text-[hsl(var(--trust-verified))]" :
  c >= 0.65 ? "text-[hsl(var(--trust-review))]" :
  "text-[hsl(var(--trust-low-confidence))]";

const impactBadge = (impact: string) =>
  impact === "high" ? "bg-[hsl(var(--urgency-high))]/15 text-[hsl(var(--urgency-high))] border-[hsl(var(--urgency-high))]/20" :
  impact === "medium" ? "bg-[hsl(var(--trust-review))]/15 text-[hsl(var(--trust-review))] border-[hsl(var(--trust-review))]/20" :
  "bg-muted text-muted-foreground border-border";

// ── Advisor Card ────────────────────────────────────────────────────────────

export function AdvisorCard({ advisor, onClick }: { advisor: AdvisorSummary; onClick?: () => void }) {
  const Icon = iconMap[advisor.icon] || Brain;
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="group relative rounded-xl border border-border/60 bg-card p-5 cursor-pointer transition-all duration-300 hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{advisor.name}</h3>
            <p className="text-[11px] text-muted-foreground">{advisor.mission}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`h-2 w-2 rounded-full ${advisor.status === "active" ? "bg-[hsl(var(--trust-verified))]" : advisor.status === "degraded" ? "bg-[hsl(var(--trust-degraded))]" : "bg-muted-foreground"}`} />
          <span className="text-[10px] text-muted-foreground capitalize">{advisor.status}</span>
        </div>
      </div>

      <div className="mb-3 rounded-lg bg-muted/40 px-3 py-2">
        <p className="text-[11px] font-medium text-muted-foreground mb-0.5">Top Move</p>
        <p className="text-[12px] text-foreground leading-relaxed">{advisor.topMove}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`text-xs font-mono font-semibold ${confidenceColor(advisor.confidence)}`}>{Math.round(advisor.confidence * 100)}%</span>
          {advisor.pendingApprovals > 0 && (
            <Badge variant="outline" className="text-[10px] bg-[hsl(var(--trust-approval))]/10 text-[hsl(var(--trust-approval))] border-[hsl(var(--trust-approval))]/20">{advisor.pendingApprovals} approval{advisor.pendingApprovals > 1 ? "s" : ""}</Badge>
          )}
          {advisor.uncertainty && (
            <Badge variant="outline" className="text-[10px] bg-[hsl(var(--trust-review))]/10 text-[hsl(var(--trust-review))] border-[hsl(var(--trust-review))]/20">
              <AlertTriangle className="h-2.5 w-2.5 mr-1" />uncertain
            </Badge>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
      </div>
    </motion.div>
  );
}

// ── Recommendation Card ─────────────────────────────────────────────────────

export function RecommendationCard({ rec, onApprove, onSimulate }: {
  rec: AdvisorRecommendation;
  onApprove?: () => void;
  onSimulate?: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border/60 bg-card p-5 hover:border-primary/20 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={`text-[10px] ${impactBadge(rec.impact)}`}>{rec.impact} impact</Badge>
            <Badge variant="outline" className={`text-[10px] ${impactBadge(rec.urgency === "critical" ? "high" : rec.urgency)}`}>{rec.urgency}</Badge>
            <span className="text-[10px] text-muted-foreground">{rec.createdAt}</span>
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">{rec.title}</h3>
          <p className="text-[12px] text-muted-foreground leading-relaxed">{rec.description}</p>
        </div>
        <span className={`text-xs font-mono font-semibold ml-3 ${confidenceColor(rec.confidence)}`}>{Math.round(rec.confidence * 100)}%</span>
      </div>

      <div className="rounded-lg bg-muted/30 px-3 py-2 mb-3">
        <p className="text-[11px] font-medium text-muted-foreground mb-0.5 flex items-center gap-1"><Lightbulb className="h-3 w-3" /> Why</p>
        <p className="text-[12px] text-foreground/80">{rec.reasoning}</p>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] text-muted-foreground">Sources:</span>
        {rec.sources.map((s) => (
          <Badge key={s} variant="outline" className="text-[9px] bg-muted/40">{s}</Badge>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground mr-auto">{rec.advisorName}</span>
        {rec.canSimulate && (
          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onSimulate}>
            <Play className="h-3 w-3 mr-1" />Simulate
          </Button>
        )}
        {rec.requiresApproval && (
          <Button size="sm" className="h-7 text-[11px] bg-primary hover:bg-primary/90" onClick={onApprove}>
            <CheckCircle className="h-3 w-3 mr-1" />Approve
          </Button>
        )}
        {!rec.requiresApproval && !rec.canSimulate && (
          <Button size="sm" variant="outline" className="h-7 text-[11px]">
            <ArrowRight className="h-3 w-3 mr-1" />View
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ── Confidence Ladder ───────────────────────────────────────────────────────

export function ConfidenceLadder({ items }: { items: { label: string; confidence: number }[] }) {
  const sorted = [...items].sort((a, b) => b.confidence - a.confidence);
  return (
    <div className="space-y-2">
      {sorted.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-[11px] text-muted-foreground w-36 truncate">{item.label}</span>
          <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${item.confidence >= 0.85 ? "bg-[hsl(var(--trust-verified))]" : item.confidence >= 0.65 ? "bg-[hsl(var(--trust-review))]" : "bg-[hsl(var(--trust-low-confidence))]"}`}
              style={{ width: `${item.confidence * 100}%` }}
            />
          </div>
          <span className={`text-[11px] font-mono font-medium w-10 text-right ${confidenceColor(item.confidence)}`}>{Math.round(item.confidence * 100)}%</span>
        </div>
      ))}
    </div>
  );
}

// ── Simulation Card ─────────────────────────────────────────────────────────

export function SimulationCard({ sim, onApprove }: { sim: SimulationResult; onApprove?: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border/60 bg-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <GitCompare className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{sim.title}</h3>
        <span className="text-[10px] text-muted-foreground ml-auto">{sim.createdAt}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {[sim.scenarioA, sim.scenarioB].map((s, i) => (
          <div key={i} className={`rounded-lg border p-3 ${i === 0 ? "border-primary/30 bg-primary/5" : "border-border/60 bg-muted/20"}`}>
            <p className="text-[11px] font-semibold text-foreground mb-1">{s.label}</p>
            <p className="text-[11px] text-muted-foreground mb-2">{s.impact}</p>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className={`text-[9px] ${s.risk.includes("strain") || s.risk.includes("pressure") ? impactBadge("medium") : impactBadge("low")}`}>{s.risk}</Badge>
              <span className={`text-[10px] font-mono ${confidenceColor(s.confidence)}`}>{Math.round(s.confidence * 100)}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-[hsl(var(--trust-verified))]/5 border border-[hsl(var(--trust-verified))]/15 px-3 py-2 mb-3">
        <p className="text-[11px] font-medium text-[hsl(var(--trust-verified))]">Recommendation</p>
        <p className="text-[12px] text-foreground/80">{sim.recommendation}</p>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-3">
        <span>Advisors:</span>
        {sim.advisors.map((a) => <Badge key={a} variant="outline" className="text-[9px]">{a}</Badge>)}
      </div>

      <div className="flex items-center gap-2 justify-end">
        <Button size="sm" variant="outline" className="h-7 text-[11px]"><RefreshCw className="h-3 w-3 mr-1" />Revise</Button>
        <Button size="sm" className="h-7 text-[11px] bg-primary" onClick={onApprove}><CheckCircle className="h-3 w-3 mr-1" />Move to Approval</Button>
      </div>
    </motion.div>
  );
}

// ── Approval Card ───────────────────────────────────────────────────────────

export function ApprovalCard({ approval, onApprove, onReject }: {
  approval: ApprovalRequest;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  const riskColor = approval.riskLevel === "critical" ? "urgency-critical" : approval.riskLevel === "high" ? "urgency-high" : approval.riskLevel === "medium" ? "trust-review" : "trust-verified";
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-primary/20 bg-card p-5 shadow-[var(--shadow-glow-purple)]">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">{approval.action}</h3>
          </div>
          <p className="text-[11px] text-muted-foreground">{approval.reason}</p>
        </div>
        <Badge variant="outline" className={`text-[10px] bg-[hsl(var(--${riskColor}))]/10 text-[hsl(var(--${riskColor}))] border-[hsl(var(--${riskColor}))]/20`}>{approval.riskLevel} risk</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3 text-[11px]">
        <div className="rounded-lg bg-muted/30 px-3 py-2">
          <p className="text-muted-foreground mb-0.5">If approved</p>
          <p className="text-foreground/80">{approval.expectedImpact}</p>
        </div>
        <div className="rounded-lg bg-muted/30 px-3 py-2">
          <p className="text-muted-foreground mb-0.5">If delayed</p>
          <p className="text-[hsl(var(--urgency-high))]/80">{approval.ifDelayed}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-1">
        <Lock className="h-3 w-3" />
        <span>Policy: {approval.policyRule}</span>
        <span className="mx-1">·</span>
        <span>Proof: {approval.proofWillExist}</span>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-3">
        <Clock className="h-3 w-3" />
        <span>Expires: {approval.expiresAt}</span>
        <span className="mx-1">·</span>
        <span>Advisors: {approval.advisors.join(", ")}</span>
      </div>

      <Separator className="mb-3" />
      <div className="flex items-center gap-2 justify-end">
        <Button size="sm" variant="outline" className="h-7 text-[11px]"><Play className="h-3 w-3 mr-1" />Simulate</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11px] text-destructive border-destructive/30 hover:bg-destructive/10" onClick={onReject}><X className="h-3 w-3 mr-1" />Reject</Button>
        <Button size="sm" className="h-7 text-[11px] bg-[hsl(var(--trust-verified))] hover:bg-[hsl(var(--trust-verified))]/90 text-white" onClick={onApprove}><CheckCircle className="h-3 w-3 mr-1" />Approve</Button>
      </div>
    </motion.div>
  );
}

// ── Proof/History Card ──────────────────────────────────────────────────────

export function ProofCard({ item }: { item: ProofHistoryItem }) {
  const outcomeIcon = item.outcome === "executed" || item.outcome === "accepted" ? CheckCircle :
    item.outcome === "verified" ? ShieldCheck :
    item.outcome === "rolled-back" ? RefreshCw : X;
  const outcomeColor = item.outcome === "executed" || item.outcome === "accepted" || item.outcome === "verified" ? "trust-verified" : item.outcome === "rolled-back" ? "trust-review" : "urgency-high";
  const OutcomeIcon = outcomeIcon;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-card/50 p-3">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--${outcomeColor}))]/10`}>
        <OutcomeIcon className={`h-4 w-4 text-[hsl(var(--${outcomeColor}))]`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[12px] font-medium text-foreground truncate">{item.title}</p>
          <Badge variant="outline" className="text-[9px] shrink-0">{item.type}</Badge>
        </div>
        <p className="text-[11px] text-muted-foreground">{item.whatChanged}</p>
        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
          <span>{item.advisor}</span>
          <span>·</span>
          <span className="font-mono">{item.receiptHash}</span>
          <span>·</span>
          <span>{item.createdAt}</span>
        </div>
      </div>
      <span className={`text-[10px] font-mono ${confidenceColor(item.confidence)}`}>{Math.round(item.confidence * 100)}%</span>
    </div>
  );
}

// ── Memory Transparency Card ────────────────────────────────────────────────

export function MemoryCard({ item, onCorrect, onForget }: {
  item: MemoryItem;
  onCorrect?: () => void;
  onForget?: () => void;
}) {
  const categoryColor = item.category === "fact" ? "primary" : item.category === "preference" ? "trust-verified" : item.category === "inference" ? "trust-review" : item.category === "instruction" ? "sita-gold" : "muted-foreground";
  const privacyIcon = item.privacy === "restricted" ? Lock : item.privacy === "confidential" ? Shield : Unlock;
  const PrivIcon = privacyIcon;

  return (
    <div className="rounded-lg border border-border/40 bg-card/50 p-3">
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-[9px] capitalize bg-[hsl(var(--${categoryColor}))]/10 text-[hsl(var(--${categoryColor}))] border-[hsl(var(--${categoryColor}))]/20`}>{item.category}</Badge>
          <span className="text-[12px] font-medium text-foreground">{item.key}</span>
        </div>
        <div className="flex items-center gap-1">
          <PrivIcon className="h-3 w-3 text-muted-foreground" />
          <span className="text-[9px] text-muted-foreground capitalize">{item.privacy}</span>
        </div>
      </div>
      <p className="text-[12px] text-foreground/80 mb-1">{item.value}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>Source: {item.source}</span>
          <span>·</span>
          <span className={`font-mono ${confidenceColor(item.confidence)}`}>{Math.round(item.confidence * 100)}%</span>
          <span>·</span>
          <span>{item.createdAt}</span>
        </div>
        <div className="flex items-center gap-1">
          {item.canCorrect && <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={onCorrect}>Correct</Button>}
          {item.canForget && <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 text-destructive" onClick={onForget}>Forget</Button>}
        </div>
      </div>
    </div>
  );
}

// ── Multi-Advisor Synthesis Card ────────────────────────────────────────────

export function SynthesisCard({ synthesis }: { synthesis: MultiAdvisorSynthesis }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-primary/20 bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Scale className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{synthesis.title}</h3>
      </div>

      <div className="space-y-2 mb-4">
        {synthesis.participants.map((p) => (
          <div key={p.name} className="flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-2">
            <span className="text-[11px] font-medium text-foreground w-32 shrink-0">{p.name}</span>
            <p className="text-[11px] text-muted-foreground flex-1">{p.recommendation}</p>
            <span className={`text-[10px] font-mono ${confidenceColor(p.confidence)}`}>{Math.round(p.confidence * 100)}%</span>
          </div>
        ))}
      </div>

      {synthesis.disagreements.length > 0 && (
        <div className="rounded-lg bg-[hsl(var(--trust-review))]/5 border border-[hsl(var(--trust-review))]/15 px-3 py-2 mb-3">
          <p className="text-[11px] font-medium text-[hsl(var(--trust-review))] mb-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Disagreements</p>
          {synthesis.disagreements.map((d, i) => <p key={i} className="text-[11px] text-foreground/70">• {d}</p>)}
        </div>
      )}

      <div className="rounded-lg bg-[hsl(var(--trust-verified))]/5 border border-[hsl(var(--trust-verified))]/15 px-3 py-2 mb-3">
        <p className="text-[11px] font-medium text-[hsl(var(--trust-verified))]">Primary Recommendation</p>
        <p className="text-[12px] text-foreground/80">{synthesis.primaryRecommendation}</p>
      </div>

      <div className="rounded-lg bg-muted/30 px-3 py-2 mb-3">
        <p className="text-[11px] font-medium text-muted-foreground">Alternate Path</p>
        <p className="text-[12px] text-foreground/70">{synthesis.alternatePath}</p>
      </div>

      <div className="flex items-center gap-2 justify-end">
        {synthesis.canSimulate && <Button size="sm" variant="outline" className="h-7 text-[11px]"><Play className="h-3 w-3 mr-1" />Simulate Both</Button>}
        {synthesis.requiresApproval && <Button size="sm" className="h-7 text-[11px] bg-primary"><CheckCircle className="h-3 w-3 mr-1" />Approve Primary</Button>}
      </div>
    </motion.div>
  );
}

// ── Boardroom Advisor Card ──────────────────────────────────────────────────

export function BoardroomAdvisorCard({ advisor, recommendation, priority }: {
  advisor: AdvisorSummary;
  recommendation: string;
  priority: number;
}) {
  const Icon = iconMap[advisor.icon] || Brain;
  return (
    <div className="rounded-lg border border-border/40 bg-card/80 p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <h4 className="text-[12px] font-semibold text-foreground">{advisor.name}</h4>
          <span className={`text-[10px] font-mono ${confidenceColor(advisor.confidence)}`}>Confidence: {Math.round(advisor.confidence * 100)}%</span>
        </div>
        <Badge variant="outline" className="text-[9px]">Priority #{priority}</Badge>
      </div>
      <p className="text-[12px] text-foreground/80 leading-relaxed">{recommendation}</p>
      {advisor.uncertainty && (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-[hsl(var(--trust-review))]">
          <AlertTriangle className="h-3 w-3" />{advisor.uncertainty}
        </div>
      )}
    </div>
  );
}

// ── Uncertainty Card ────────────────────────────────────────────────────────

export function UncertaintyCard({ title, description, sources, suggestion }: {
  title: string; description: string; sources: string[]; suggestion: string;
}) {
  return (
    <div className="rounded-lg border border-[hsl(var(--trust-review))]/30 bg-[hsl(var(--trust-review))]/5 p-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-4 w-4 text-[hsl(var(--trust-review))]" />
        <h4 className="text-[12px] font-semibold text-foreground">{title}</h4>
      </div>
      <p className="text-[11px] text-foreground/70 mb-2">{description}</p>
      <div className="flex items-center gap-1 mb-2 text-[10px] text-muted-foreground">
        {sources.map((s) => <Badge key={s} variant="outline" className="text-[9px]">{s}</Badge>)}
      </div>
      <p className="text-[11px] text-[hsl(var(--trust-review))]">Suggestion: {suggestion}</p>
    </div>
  );
}
