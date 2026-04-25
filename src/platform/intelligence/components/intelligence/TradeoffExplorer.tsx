// ═══════════════════════════════════════════════════════════════
// SITA OS — Tradeoff Explorer
// Side-by-side comparison of alternatives with confidence/risk
// deltas, linked back to underlying explanation steps.
// ═══════════════════════════════════════════════════════════════

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowUpRight, ArrowDownRight, Minus, Scale, Sparkles,
  ChevronRight, Shield, TrendingUp, AlertTriangle, Eye,
  Layers, CheckCircle, XCircle, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────

export interface ExplanationStep {
  id: string;
  label: string;
  description: string;
  type: "data-input" | "analysis" | "weighting" | "conclusion";
  confidence: number;
}

export interface TradeoffAlternative {
  id: string;
  label: string;
  summary: string;
  confidence: number; // 0-1
  risk: number; // 0-1
  impact: number; // -1 to 1
  dimensions: Record<string, { score: number; label: string }>;
  explanationSteps: ExplanationStep[];
  pros: string[];
  cons: string[];
  recommended?: boolean;
}

interface TradeoffExplorerProps {
  title: string;
  description?: string;
  alternatives: TradeoffAlternative[];
  onSelectAlternative?: (alt: TradeoffAlternative) => void;
  onViewExplanation?: (step: ExplanationStep) => void;
  className?: string;
}

// ── Helpers ────────────────────────────────────────────────────

function DeltaIndicator({ value, label, invert }: { value: number; label: string; invert?: boolean }) {
  const isPositive = invert ? value < 0 : value > 0;
  const isNeutral = Math.abs(value) < 0.02;
  const pct = Math.abs(value * 100).toFixed(0);

  return (
    <div className="flex items-center gap-1.5 text-xs">
      {isNeutral ? (
        <Minus className="h-3 w-3 text-muted-foreground" />
      ) : isPositive ? (
        <ArrowUpRight className="h-3 w-3 text-emerald-400" />
      ) : (
        <ArrowDownRight className="h-3 w-3 text-red-400" />
      )}
      <span className={cn(
        "font-medium",
        isNeutral ? "text-muted-foreground" : isPositive ? "text-emerald-400" : "text-red-400"
      )}>
        {isNeutral ? "—" : `${isPositive ? "+" : "-"}${pct}%`}
      </span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function ConfidenceBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.round(value * 100);
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{pct}%</span>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────

export function TradeoffExplorer({
  title,
  description,
  alternatives,
  onSelectAlternative,
  onViewExplanation,
  className,
}: TradeoffExplorerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const baseline = alternatives.find(a => a.recommended) ?? alternatives[0];

  if (!alternatives.length) return null;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Scale className="h-4 w-4 text-primary" />
            {title}
          </h3>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
        <Badge variant="outline" className="text-[10px] gap-1 border-primary/30 text-primary">
          <Layers className="h-3 w-3" />
          {alternatives.length} alternatives
        </Badge>
      </div>

      {/* Side-by-side cards */}
      <div className={cn(
        "grid gap-3",
        alternatives.length === 2 ? "grid-cols-1 sm:grid-cols-2" :
        alternatives.length === 3 ? "grid-cols-1 sm:grid-cols-3" :
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      )}>
        {alternatives.map((alt) => {
          const isExpanded = expandedId === alt.id;
          const confDelta = alt.confidence - baseline.confidence;
          const riskDelta = alt.risk - baseline.risk;
          const isBaseline = alt.id === baseline.id;

          return (
            <Card
              key={alt.id}
              className={cn(
                "relative overflow-hidden transition-all duration-300 cursor-pointer group",
                "border bg-card/50 hover:bg-card/80",
                alt.recommended && "border-primary/40 ring-1 ring-primary/20",
                isExpanded && "ring-1 ring-primary/30"
              )}
              onClick={() => setExpandedId(isExpanded ? null : alt.id)}
            >
              {/* Recommended glow */}
              {alt.recommended && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              )}

              <CardContent className="p-4 space-y-3 relative">
                {/* Title row */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-semibold text-foreground truncate">{alt.label}</h4>
                      {alt.recommended && (
                        <Badge className="text-[9px] px-1.5 py-0 bg-primary/15 text-primary border-primary/30">
                          <Sparkles className="h-2.5 w-2.5 mr-0.5" /> Top
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{alt.summary}</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Shield className="h-3 w-3" /> Confidence
                      </span>
                      <span className="font-mono text-foreground">{(alt.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <ConfidenceBar value={alt.confidence} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Risk
                      </span>
                      <span className="font-mono text-foreground">{(alt.risk * 100).toFixed(0)}%</span>
                    </div>
                    <ConfidenceBar value={1 - alt.risk} />
                  </div>
                </div>

                {/* Delta vs baseline */}
                {!isBaseline && (
                  <div className="pt-1 border-t border-border/30 space-y-1">
                    <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">vs. {baseline.label}</p>
                    <DeltaIndicator value={confDelta} label="confidence" />
                    <DeltaIndicator value={riskDelta} label="risk" invert />
                  </div>
                )}

                {/* Pros/Cons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="space-y-1">
                    {alt.pros.slice(0, 3).map((p, i) => (
                      <p key={i} className="text-[10px] text-emerald-400/90 flex items-start gap-1">
                        <CheckCircle className="h-3 w-3 shrink-0 mt-px" />
                        <span className="line-clamp-1">{p}</span>
                      </p>
                    ))}
                  </div>
                  <div className="space-y-1">
                    {alt.cons.slice(0, 3).map((c, i) => (
                      <p key={i} className="text-[10px] text-red-400/90 flex items-start gap-1">
                        <XCircle className="h-3 w-3 shrink-0 mt-px" />
                        <span className="line-clamp-1">{c}</span>
                      </p>
                    ))}
                  </div>
                </div>

                {/* Expanded: explanation steps */}
                {isExpanded && (
                  <div className="pt-2 border-t border-border/30 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-[10px] font-semibold text-foreground flex items-center gap-1">
                      <Eye className="h-3 w-3 text-primary" /> Explanation Chain
                    </p>
                    <ScrollArea className="max-h-48">
                      <div className="space-y-1.5">
                        {alt.explanationSteps.map((step, idx) => (
                          <button
                            key={step.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewExplanation?.(step);
                            }}
                            className="w-full text-left flex items-center gap-2 p-2 rounded-md bg-muted/20 hover:bg-muted/40 transition-colors group/step"
                          >
                            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-medium text-foreground truncate">{step.label}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{step.description}</p>
                            </div>
                            <Badge variant="outline" className="text-[9px] shrink-0 border-border/50">
                              {step.type}
                            </Badge>
                            <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover/step:opacity-100 transition-opacity shrink-0" />
                          </button>
                        ))}
                      </div>
                    </ScrollArea>

                    {/* Dimension scores */}
                    {Object.keys(alt.dimensions).length > 0 && (
                      <div className="pt-2 space-y-1.5">
                        <p className="text-[10px] font-semibold text-muted-foreground">Dimension Scores</p>
                        {Object.entries(alt.dimensions).map(([key, dim]) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground w-20 truncate">{dim.label}</span>
                            <ConfidenceBar value={dim.score} className="flex-1" />
                          </div>
                        ))}
                      </div>
                    )}

                    {onSelectAlternative && (
                      <Button
                        size="sm"
                        className="w-full mt-2 text-xs gap-1.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAlternative(alt);
                        }}
                      >
                        <TrendingUp className="h-3 w-3" />
                        Select This Alternative
                      </Button>
                    )}
                  </div>
                )}

                {/* Expand hint */}
                {!isExpanded && (
                  <p className="text-[9px] text-muted-foreground text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to expand explanation chain →
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}