// ═══════════════════════════════════════════════════════════════
// SITA OS — Simulation → Boardroom Intake
// One-click workflow to create a Boardroom item from a simulation
// memo with prefilled scenario variables and generated summary.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowUpRight, Beaker, Shield, Sparkles, Send,
  CheckCircle, FileText, BarChart3, Brain, Layers, Clock,
} from "lucide-react";
import { fromTable } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────

export interface SimulationVariable {
  key: string;
  label: string;
  value: string | number;
  unit?: string;
  changed?: boolean;
}

export interface SimulationMemo {
  id: string;
  title: string;
  scenario: string;
  domain: string;
  confidence: number;
  risk: number;
  variables: SimulationVariable[];
  outcome: string;
  alternativesConsidered: number;
  createdAt: string;
  evidenceRefs?: Array<{ type: string; id?: string; label?: string }>;
}

interface SimulationToBoardroomProps {
  memo: SimulationMemo;
  trigger?: React.ReactNode;
  className?: string;
}

// ── Helpers ────────────────────────────────────────────────────

function generateBoardroomSummary(memo: SimulationMemo): string {
  const changed = memo.variables.filter(v => v.changed);
  const varSummary = changed.length > 0
    ? `Scenario variables adjusted: ${changed.map(v => `${v.label} → ${v.value}${v.unit ? ` ${v.unit}` : ""}`).join(", ")}.`
    : "Baseline scenario (no variable changes).";

  return [
    `Simulation "${memo.title}" completed with ${(memo.confidence * 100).toFixed(0)}% confidence and ${(memo.risk * 100).toFixed(0)}% risk.`,
    varSummary,
    `Outcome: ${memo.outcome}`,
    `${memo.alternativesConsidered} alternative(s) were evaluated.`,
  ].join("\n\n");
}

function assessSeverity(memo: SimulationMemo): string {
  if (memo.risk > 0.7 || memo.confidence < 0.4) return "critical";
  if (memo.risk > 0.4 || memo.confidence < 0.6) return "high";
  return "medium";
}

// ── Component ──────────────────────────────────────────────────

export function SimulationToBoardroom({ memo, trigger, className }: SimulationToBoardroomProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const summary = useMemo(() => generateBoardroomSummary(memo), [memo]);
  const severity = useMemo(() => assessSeverity(memo), [memo]);

  const handleEscalate = async () => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in"); setSubmitting(false); return; }

      const evidenceRefs = [
        { type: "simulation_memo", id: memo.id, title: memo.title },
        ...(memo.evidenceRefs ?? []),
        ...memo.variables.filter(v => v.changed).map(v => ({
          type: "scenario_variable", key: v.key, label: v.label, value: v.value,
        })),
      ];

      const sourceSignals = [
        { source: "simulation", simulation_id: memo.id, scenario: memo.scenario },
      ];

      await fromTable("boardroom_items").insert({
        user_id: user.id,
        title: `Simulation Review: ${memo.title}`,
        description: summary,
        domain: memo.domain,
        severity,
        escalation_reason: `Simulation outcome requires strategic review: ${memo.outcome}`,
        source_signals: sourceSignals,
        evidence_refs: evidenceRefs,
        advisor_summaries: {
          simulation_engine: memo.outcome,
          confidence: memo.confidence,
          risk: memo.risk,
          alternatives_evaluated: memo.alternativesConsidered,
          scenario_variables: Object.fromEntries(memo.variables.map(v => [v.key, v.value])),
        },
        confidence_state: { score: memo.confidence, source: "simulation" },
        status: "new",
      });

      setSubmitted(true);
      toast.success("Simulation escalated to Boardroom");
    } catch {
      toast.error("Failed to create Boardroom item");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)} className={cn("cursor-pointer", className)}>
          {trigger}
        </span>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className={cn("gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10", className)}
          onClick={() => setOpen(true)}
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
          Send to Boardroom
        </Button>
      )}

      <Dialog open={open} onOpenChange={(v) => { if (!v) setSubmitted(false); setOpen(v); }}>
        <DialogContent className="sm:max-w-lg">
          {submitted ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Boardroom Item Created</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                Simulation <span className="font-semibold text-foreground">"{memo.title}"</span> has been
                packaged as a Boardroom agenda item for strategic review.
              </p>
              <Card className="w-full mt-6 border-primary/20 bg-primary/5 text-left">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <p className="text-xs font-semibold text-foreground">Intake Receipt</p>
                  </div>
                  <Separator className="bg-border/30" />
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Confidence:</span> <span className="font-medium">{(memo.confidence * 100).toFixed(0)}%</span></div>
                    <div><span className="text-muted-foreground">Risk:</span> <span className="font-medium">{(memo.risk * 100).toFixed(0)}%</span></div>
                    <div><span className="text-muted-foreground">Severity:</span> <span className="font-medium capitalize">{severity}</span></div>
                    <div><span className="text-muted-foreground">Variables:</span> <span className="font-medium">{memo.variables.filter(v => v.changed).length} changed</span></div>
                  </div>
                </CardContent>
              </Card>
              <Button size="sm" className="mt-6" onClick={() => setOpen(false)}>Done</Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <Beaker className="h-5 w-5 text-primary" />
                  Escalate Simulation to Boardroom
                </DialogTitle>
                <DialogDescription>
                  This will create a new Boardroom intake item with prefilled scenario data.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Simulation summary card */}
                <Card className="border-border/50 bg-muted/10">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{memo.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{memo.scenario}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <Brain className="h-3 w-3" /> {memo.domain}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-2 rounded-md bg-background/50">
                        <p className={cn(
                          "text-lg font-bold",
                          memo.confidence >= 0.7 ? "text-emerald-400" : memo.confidence >= 0.5 ? "text-amber-400" : "text-red-400"
                        )}>
                          {(memo.confidence * 100).toFixed(0)}%
                        </p>
                        <p className="text-[10px] text-muted-foreground">Confidence</p>
                      </div>
                      <div className="text-center p-2 rounded-md bg-background/50">
                        <p className={cn(
                          "text-lg font-bold",
                          memo.risk <= 0.3 ? "text-emerald-400" : memo.risk <= 0.5 ? "text-amber-400" : "text-red-400"
                        )}>
                          {(memo.risk * 100).toFixed(0)}%
                        </p>
                        <p className="text-[10px] text-muted-foreground">Risk</p>
                      </div>
                      <div className="text-center p-2 rounded-md bg-background/50">
                        <p className="text-lg font-bold text-foreground">{memo.alternativesConsidered}</p>
                        <p className="text-[10px] text-muted-foreground">Alternatives</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Scenario variables */}
                {memo.variables.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-primary" /> Scenario Variables ({memo.variables.filter(v => v.changed).length} modified)
                    </p>
                    <div className="space-y-1.5">
                      {memo.variables.map(v => (
                        <div
                          key={v.key}
                          className={cn(
                            "flex items-center justify-between px-3 py-1.5 rounded-md text-xs",
                            v.changed ? "bg-primary/5 border border-primary/20" : "bg-muted/20 border border-transparent"
                          )}
                        >
                          <span className="text-muted-foreground">{v.label}</span>
                          <span className={cn("font-medium", v.changed ? "text-primary" : "text-foreground")}>
                            {v.value}{v.unit ? ` ${v.unit}` : ""}
                            {v.changed && <Sparkles className="inline h-3 w-3 ml-1 text-primary" />}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Generated summary */}
                <div>
                  <p className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-primary" /> Generated Summary
                  </p>
                  <div className="rounded-md bg-muted/20 border border-border/30 p-3">
                    <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">{summary}</p>
                  </div>
                </div>

                {/* Outcome */}
                <div className="rounded-md bg-primary/5 border border-primary/20 p-3 flex items-start gap-2">
                  <BarChart3 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Simulation Outcome</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{memo.outcome}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Simulation ran {new Date(memo.createdAt).toLocaleDateString()} at {new Date(memo.createdAt).toLocaleTimeString()}
                </div>
              </div>

              <DialogFooter>
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
                <Button
                  size="sm"
                  className="gap-1.5"
                  disabled={submitting}
                  onClick={handleEscalate}
                >
                  {submitting ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" /> Create Boardroom Item
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}