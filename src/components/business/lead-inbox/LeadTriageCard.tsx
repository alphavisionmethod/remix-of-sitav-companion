import { cn } from "@/lib/utils";
import { SitaCard } from "@/components/sita/SitaCard";
import { LeadSourceBadge } from "./LeadSourceBadge";
import { LeadAdvisorWhisper } from "./LeadAdvisorWhisper";
import { LeadQuickActions } from "./LeadQuickActions";
import { LeadPriorityBadge } from "./LeadPriorityBadge";
import { LeadHeatIndicator } from "./LeadHeatIndicator";
import { PriorityEvolutionTimeline } from "./PriorityEvolutionTimeline";
import { AlertTriangle, Copy, ChevronRight, Zap } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { InboxItem } from "./mock-inbox-data";
import type { LeadSource } from "./LeadSourceBadge";
import type { LeadScoreResult } from "@/domains/engines/lead-scoring-engine";

const urgencyBar: Record<string, string> = {
  critical: "bg-[hsl(var(--urgency-critical))]",
  high: "bg-[hsl(var(--urgency-high))]",
  medium: "bg-[hsl(var(--sita-gold))]",
  low: "bg-muted-foreground/30",
};

const initials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

interface CardProps {
  item: InboxItem;
  score?: LeadScoreResult;
  selected?: boolean;
  checked?: boolean;
  onSelect: () => void;
  onCheck: (checked: boolean) => void;
  onAccept: () => void;
  onRoute: (dest: string) => void;
  onReject: () => void;
  onSnooze: () => void;
  onFlag: () => void;
  onExplain?: () => void;
}

export const LeadTriageCard = ({
  item, score, selected, checked, onSelect, onCheck, onAccept, onRoute, onReject, onSnooze, onFlag, onExplain
}: CardProps) => {
  const isSpam = item.suggested_route === "spam";
  const isExceptional = score?.boardroomWorthy ?? item.suggested_route === "boardroom";
  const tier = score?.priorityTier;

  return (
    <SitaCard
      onClick={onSelect}
      selected={selected}
      lane={isExceptional ? "opportunity" : tier === "critical-now" ? "action" : undefined}
      className={cn("p-0 group relative overflow-hidden", isSpam && "opacity-60")}
    >
      {/* Urgency bar */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl", urgencyBar[item.urgency])} />

      <div className="pl-4 pr-4 py-3.5">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div className="pt-1" onClick={e => e.stopPropagation()}>
            <Checkbox checked={checked} onCheckedChange={v => onCheck(!!v)} className="h-3.5 w-3.5" />
          </div>

          {/* Avatar with priority ring */}
          <div className={cn(
            "h-10 w-10 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold",
            tier === "critical-now" ? "border-[hsl(var(--urgency-critical))] text-[hsl(var(--urgency-critical))]" :
            tier === "high-priority" ? "border-[hsl(var(--urgency-high))] text-[hsl(var(--urgency-high))]" :
            score && score.priorityScore >= 60 ? "border-[hsl(var(--trust-safe))] text-[hsl(var(--trust-safe))]" :
            score && score.priorityScore >= 40 ? "border-[hsl(var(--sita-gold))] text-[hsl(var(--sita-gold))]" :
            "border-[hsl(var(--trust-degraded))] text-[hsl(var(--trust-degraded))]"
          )}>
            {initials(item.contact_name)}
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-foreground truncate">{item.contact_name}</p>
              {item.company && <span className="text-[11px] text-muted-foreground truncate">· {item.company}</span>}
              <LeadSourceBadge source={item.source as LeadSource} size="xs" />
              {item.duplicate_status !== "none" && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-[hsl(var(--trust-degraded))] bg-[hsl(var(--trust-degraded))]/10 rounded-full px-1.5 py-px">
                  <Copy className="h-2.5 w-2.5" /> Duplicate
                </span>
              )}
              {item.missing_fields.length > 0 && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-[hsl(var(--sita-gold))] bg-[hsl(var(--sita-gold))]/10 rounded-full px-1.5 py-px">
                  <AlertTriangle className="h-2.5 w-2.5" /> Incomplete
                </span>
              )}
            </div>

            {/* Priority + Heat badges */}
            {score && (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <LeadPriorityBadge tier={score.priorityTier} size="xs" />
                <LeadHeatIndicator heat={score.heatStatus} size="xs" />
                {isExceptional && (
                  <span className="inline-flex items-center text-[9px] font-bold text-[hsl(var(--sita-gold))] bg-[hsl(var(--sita-gold))]/15 rounded-full px-2 py-px border border-[hsl(var(--sita-gold))]/20">
                    ★ Boardroom
                  </span>
                )}
              </div>
            )}

            {item.inquiry_text && (
              <p className="text-[12px] text-muted-foreground mt-1 line-clamp-1">{item.inquiry_text}</p>
            )}

            {/* Next action whisper */}
            {score?.nextBestAction && (
              <div className="flex items-start gap-1.5 mt-1">
                <Zap className="h-3 w-3 text-accent shrink-0 mt-0.5" />
                <p className="text-[10px] text-accent/70 leading-tight line-clamp-1">{score.nextBestAction}</p>
              </div>
            )}
          </div>

          {/* Right side: score + trend */}
          <div className="text-right shrink-0 space-y-1">
            <div className={cn(
              "font-display text-lg font-bold tabular-nums",
              score && score.priorityScore >= 75 ? "text-[hsl(var(--trust-safe))]" :
              score && score.priorityScore >= 50 ? "text-[hsl(var(--sita-gold))]" :
              "text-[hsl(var(--trust-degraded))]"
            )}>
              {score?.priorityScore ?? item.quality_score}
            </div>
            {score && (
              <PriorityEvolutionTimeline
                heat={score.heatStatus}
                staleRisk={score.staleRisk}
                priorityScore={score.priorityScore}
                compact
              />
            )}
          </div>

          {/* Explain button */}
          {onExplain && (
            <button
              onClick={e => { e.stopPropagation(); onExplain(); }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-all self-center"
              title="View score breakdown"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Quick actions row */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {item.quality_hints.slice(0, 2).map((h, i) => (
              <span key={i} className="text-[9px] text-muted-foreground bg-muted/30 rounded-md px-1.5 py-0.5">{h}</span>
            ))}
          </div>
          <LeadQuickActions
            onAccept={onAccept}
            onRoute={onRoute}
            onReject={onReject}
            onSnooze={onSnooze}
            onFlag={onFlag}
          />
        </div>
      </div>
    </SitaCard>
  );
};
