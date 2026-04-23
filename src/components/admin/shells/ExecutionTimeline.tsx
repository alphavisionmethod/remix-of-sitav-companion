import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MessageSquare, CheckCircle, AlertTriangle, Clock, Zap, Eye, Play,
  RotateCcw, Shield, ChevronDown, ChevronRight, Target, XCircle,
  Sparkles, FileText, ArrowRight, Loader2
} from "lucide-react";
import { useDataMode } from "@/contexts/DataModeContext";

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: "command" | "plan" | "task_start" | "validation" | "simulation" | "approval" | "rollout" | "health_check" | "rollback" | "outcome" | "error";
  title: string;
  description?: string;
  status: "completed" | "in_progress" | "pending" | "failed" | "skipped";
  metadata?: Record<string, string>;
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  command: { icon: MessageSquare, color: "text-blue-400" },
  plan: { icon: FileText, color: "text-purple-400" },
  task_start: { icon: Play, color: "text-cyan-400" },
  validation: { icon: CheckCircle, color: "text-emerald-400" },
  simulation: { icon: Eye, color: "text-violet-400" },
  approval: { icon: Shield, color: "text-amber-400" },
  rollout: { icon: Target, color: "text-green-400" },
  health_check: { icon: Sparkles, color: "text-teal-400" },
  rollback: { icon: RotateCcw, color: "text-orange-400" },
  outcome: { icon: Zap, color: "text-emerald-400" },
  error: { icon: XCircle, color: "text-red-400" },
};

const STATUS_STYLES: Record<string, string> = {
  completed: "border-emerald-500/30",
  in_progress: "border-primary/40 bg-primary/5",
  pending: "border-white/[0.06] opacity-60",
  failed: "border-red-500/30",
  skipped: "border-white/[0.06] opacity-40",
};

// Demo data showing a realistic command lifecycle
const TIMELINE: TimelineEvent[] = [
  { id: "1", timestamp: "12:01 PM", type: "command", title: "Founder requested sync reliability improvement", description: '"Improve sync reliability across all devices"', status: "completed" },
  { id: "2", timestamp: "12:02 PM", type: "plan", title: "AI created execution plan", description: "6 tasks identified across sync-service, storage-service, and mobile sync core", status: "completed" },
  { id: "3", timestamp: "12:03 PM", type: "task_start", title: "Analyzing sync failure rates by platform", status: "completed", metadata: { duration: "45s", findings: "3 patterns" } },
  { id: "4", timestamp: "12:04 PM", type: "validation", title: "Review agent validated analysis", description: "Confirmed retry storm pattern on iOS 17.4+", status: "completed" },
  { id: "5", timestamp: "12:05 PM", type: "task_start", title: "Generating idempotency fixes", status: "completed", metadata: { patches: "2 files", confidence: "94%" } },
  { id: "6", timestamp: "12:09 PM", type: "simulation", title: "Simulation completed successfully", description: "500-device burst test passed. Sync failures predicted to drop 18%.", status: "completed", metadata: { iterations: "1,000", confidence: "91%" } },
  { id: "7", timestamp: "12:10 PM", type: "approval", title: "Canary deployment approved", description: "Founder approved canary rollout to 10% of beta users", status: "completed" },
  { id: "8", timestamp: "12:15 PM", type: "rollout", title: "Canary deployed to 10%", description: "Targeting desktop beta cohort", status: "completed" },
  { id: "9", timestamp: "12:42 PM", type: "health_check", title: "Health stable — expanding to 25%", description: "No regressions detected after 27 minutes", status: "completed" },
  { id: "10", timestamp: "1:20 PM", type: "outcome", title: "Sync failures reduced 18%", description: "Final outcome confirmed. Runbook updated with new retry policy.", status: "completed", metadata: { improvement: "18%", impact: "all platforms" } },
];

interface ExecutionTimelineProps {
  events?: TimelineEvent[];
  compact?: boolean;
  maxVisible?: number;
}

export function ExecutionTimeline({ events = TIMELINE, compact = false, maxVisible }: ExecutionTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const visible = maxVisible && !showAll ? events.slice(0, maxVisible) : events;
  const hasMore = maxVisible ? events.length > maxVisible : false;

  return (
    <div className="space-y-1">
      {visible.map((event, i) => {
        const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.command;
        const Icon = config.icon;
        const isExpanded = expandedId === event.id;
        const isLast = i === visible.length - 1;

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="relative"
          >
            <div className="flex gap-3">
              {/* Timeline connector line */}
              <div className="flex flex-col items-center w-8 shrink-0">
                <div className={cn("rounded-full p-1.5 border bg-card z-10", STATUS_STYLES[event.status])}>
                  {event.status === "in_progress" ? (
                    <Loader2 className={cn("h-3 w-3 animate-spin", config.color)} />
                  ) : (
                    <Icon className={cn("h-3 w-3", config.color)} />
                  )}
                </div>
                {!isLast && (
                  <div className={cn(
                    "w-px flex-1 min-h-[16px]",
                    event.status === "completed" ? "bg-emerald-500/20" : "bg-border/30"
                  )} />
                )}
              </div>

              {/* Event content */}
              <div
                className={cn(
                  "flex-1 rounded-lg border p-2.5 mb-1.5 cursor-pointer transition-all",
                  "bg-white/[0.02] hover:bg-white/[0.04]",
                  STATUS_STYLES[event.status]
                )}
                onClick={() => setExpandedId(isExpanded ? null : event.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] text-muted-foreground font-mono shrink-0">{event.timestamp}</span>
                    <h4 className={cn("text-xs font-medium truncate", event.status === "failed" ? "text-red-400" : "text-foreground")}>
                      {event.title}
                    </h4>
                  </div>
                  {event.status === "in_progress" && (
                    <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/20 animate-pulse">
                      In Progress
                    </Badge>
                  )}
                  {(event.description || event.metadata) && (
                    <ChevronDown className={cn("h-3 w-3 text-muted-foreground shrink-0 transition-transform", isExpanded && "rotate-180")} />
                  )}
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      {event.description && (
                        <p className="text-[11px] text-muted-foreground mt-2">{event.description}</p>
                      )}
                      {event.metadata && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(event.metadata).map(([k, v]) => (
                            <div key={k} className="flex items-center gap-1 text-[9px]">
                              <span className="text-muted-foreground">{k}:</span>
                              <span className="text-foreground font-medium">{v}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        );
      })}

      {hasMore && !showAll && (
        <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" onClick={() => setShowAll(true)}>
          Show {events.length - (maxVisible || 0)} more events
        </Button>
      )}
    </div>
  );
}
