// ═══════════════════════════════════════════════════════════════
// SITA OS — Pre-Boardroom Preparation Pack
// Generates a concise "read before meeting" summary
// ═══════════════════════════════════════════════════════════════

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ConfidenceBar } from "./ConfidenceBar";
import {
  FileText, ChevronDown, ChevronUp, AlertTriangle, CheckCircle,
  Clock, Target, TrendingUp, TrendingDown, Sparkles, ArrowRight
} from "lucide-react";

interface PrepItem {
  title: string;
  detail: string;
  domain: "business" | "money" | "concierge" | "general";
  urgency: "critical" | "high" | "medium" | "low";
  changed?: boolean;
}

interface PrepPackProps {
  title?: string;
  generatedAt?: string;
  confidence?: number;
  whatChanged: string[];
  priorities: PrepItem[];
  unresolvedFromLast: PrepItem[];
  readyDecisions: PrepItem[];
  className?: string;
}

const urgencyColors = {
  critical: "border-[hsl(var(--destructive))]/20 bg-[hsl(var(--destructive))]/5",
  high: "border-[hsl(var(--sita-gold))]/20 bg-[hsl(var(--sita-gold))]/5",
  medium: "border-border bg-card",
  low: "border-border bg-card/50",
};

const urgencyTextColors = {
  critical: "text-[hsl(var(--destructive))]",
  high: "text-[hsl(var(--sita-gold))]",
  medium: "text-muted-foreground",
  low: "text-muted-foreground/60",
};

export const PrepPack = ({
  title = "Pre-Boardroom Prep Pack",
  generatedAt,
  confidence = 82,
  whatChanged,
  priorities,
  unresolvedFromLast,
  readyDecisions,
  className,
}: PrepPackProps) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-2xl border border-primary/15 overflow-hidden", className)}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between bg-gradient-to-r from-primary/8 to-transparent px-5 py-4 text-left hover:from-primary/12 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-foreground">{title}</h3>
            <p className="text-[11px] text-muted-foreground">
              {generatedAt ? `Generated ${generatedAt}` : "Prepared for your review"} · {priorities.length} priorities · {unresolvedFromLast.length} carryovers
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ConfidenceBar value={confidence} size="sm" className="w-20" />
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-border/50"
          >
            <div className="p-5 space-y-5">
              {/* What Changed */}
              {whatChanged.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <TrendingUp className="h-3 w-3" /> What Changed Since Last Review
                  </h4>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {whatChanged.map((change, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg bg-secondary/40 px-3 py-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <span className="text-xs text-foreground">{change}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Priorities */}
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Target className="h-3 w-3" /> Top Priorities for This Review
                </h4>
                <div className="space-y-2">
                  {priorities.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={cn("flex items-center gap-3 rounded-xl border p-3 transition-all hover:shadow-card-hover", urgencyColors[item.urgency])}
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 font-display text-xs font-bold text-primary shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{item.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{item.detail}</p>
                      </div>
                      <span className={cn("text-[10px] font-semibold capitalize shrink-0", urgencyTextColors[item.urgency])}>
                        {item.urgency}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Decisions Ready */}
              {readyDecisions.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <CheckCircle className="h-3 w-3" /> Decisions Ready for This Session
                  </h4>
                  <div className="space-y-2">
                    {readyDecisions.map((d, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-xl border border-primary/10 bg-primary/3 p-3 cursor-pointer hover:bg-primary/5 transition-all group">
                        <Sparkles className="h-4 w-4 text-primary shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{d.title}</p>
                          <p className="text-[11px] text-muted-foreground">{d.detail}</p>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Carryovers */}
              {unresolvedFromLast.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="h-3 w-3" /> Carryover from Last Review
                  </h4>
                  <div className="space-y-1.5">
                    {unresolvedFromLast.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg bg-[hsl(var(--sita-gold))]/5 border border-[hsl(var(--sita-gold))]/10 px-3 py-2">
                        <Clock className="h-3.5 w-3.5 text-[hsl(var(--sita-gold))] shrink-0" />
                        <p className="text-xs text-foreground">{item.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
