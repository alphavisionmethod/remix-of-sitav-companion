import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WhyTooltip } from "./WhyTooltip";
import { Brain, Lightbulb, Play, Eye, X, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useDataMode } from "@/contexts/DataModeContext";

interface AISuggestion {
  id: string;
  text: string;
  impact: string;
  confidence: number;
  domain: string;
  why: string;
}

const DEMO_SUGGESTIONS: AISuggestion[] = [
  {
    id: "s1",
    text: "Platform can improve sync performance by 12% by optimizing upload finalization path.",
    impact: "Sync latency reduced ~40ms for 80% of devices",
    confidence: 0.87,
    domain: "reliability",
    why: "Analysis of 7-day sync telemetry shows upload finalization accounts for 38% of total sync latency. A retry-backoff adjustment would reduce p95 latency.",
  },
  {
    id: "s2",
    text: "Battery regression risk exists in current beta release due to background sync frequency.",
    impact: "~6% excess battery drain on mobile cohort",
    confidence: 0.74,
    domain: "performance",
    why: "Device telemetry from Ring 0 beta users shows 6% higher battery drain vs baseline, correlated with a sync interval change in v2.14.0-rc3.",
  },
  {
    id: "s3",
    text: "Storage costs increased 8% due to preview generation growth. Consider lazy generation.",
    impact: "Estimated $120/mo savings with lazy previews",
    confidence: 0.91,
    domain: "cost",
    why: "Storage egress and compute bills show preview generation grew 22% this month. Switching to on-demand generation for inactive files would cut costs.",
  },
  {
    id: "s4",
    text: "Trust prompts appear too often for one user cohort — reducing false positives improves UX.",
    impact: "~15% fewer trust prompts for verified users",
    confidence: 0.82,
    domain: "ux",
    why: "Trust service logs show 15% of prompts fire for users with verified devices and no suspicious history. Adjusting the threshold would reduce friction.",
  },
];

export function AISuggestionsPanel() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);

  const visible = (isDemoMode ? DEMO_SUGGESTIONS : [] as typeof DEMO_SUGGESTIONS).filter(s => !dismissed.has(s.id));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">AI Suggestions</h3>
        <Badge variant="outline" className="text-[9px] ml-auto">{visible.length} active</Badge>
      </div>

      <AnimatePresence>
        {visible.map((s) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            layout
          >
            <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.05] transition-colors">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-sita-gold shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground leading-relaxed flex-1">{s.text}</p>
                  <WhyTooltip explanation={s.why} />
                </div>

                {expanded === s.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-6 space-y-2"
                  >
                    <div className="text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground">Impact:</span> {s.impact}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground">Confidence:</span> {Math.round(s.confidence * 100)}%
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] text-muted-foreground leading-relaxed">
                      <span className="font-medium text-foreground">Why: </span>{s.why}
                    </div>
                  </motion.div>
                )}

                <div className="flex items-center gap-1.5 ml-6">
                  <Button
                    variant="ghost" size="sm"
                    className="h-6 text-[10px] gap-1 px-2"
                    onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                  >
                    {expanded === s.id ? <ChevronUp className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    {expanded === s.id ? "Less" : "Explain"}
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    className="h-6 text-[10px] gap-1 px-2"
                    onClick={() => toast.info("Simulation started", { description: s.text.slice(0, 60) })}
                  >
                    <Play className="h-3 w-3" /> Simulate
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    className="h-6 text-[10px] gap-1 px-2 text-primary"
                    onClick={() => toast.success("Safe fix applied", { description: s.text.slice(0, 60) })}
                  >
                    Apply Fix
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    className="h-6 text-[10px] gap-1 px-2 ml-auto"
                    onClick={() => setDismissed(prev => new Set([...prev, s.id]))}
                  >
                    <X className="h-3 w-3" /> Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {visible.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">All suggestions addressed ✓</p>
      )}
    </div>
  );
}
