import { cn } from "@/lib/utils";
import { SitaCard } from "@/components/sita/SitaCard";
import { LeadSourceBadge } from "./LeadSourceBadge";
import { LeadAdvisorWhisper } from "./LeadAdvisorWhisper";
import { LeadQuickActions } from "./LeadQuickActions";
import { AlertTriangle, Copy, Clock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { InboxItem } from "./mock-inbox-data";
import type { LeadSource } from "./LeadSourceBadge";

const urgencyBar: Record<string, string> = {
  critical: "bg-[hsl(var(--urgency-critical))]",
  high: "bg-[hsl(var(--urgency-high))]",
  medium: "bg-[hsl(var(--sita-gold))]",
  low: "bg-muted-foreground/30",
};

const qualityRing = (score: number) => {
  if (score >= 75) return "border-[hsl(var(--trust-safe))] text-[hsl(var(--trust-safe))]";
  if (score >= 40) return "border-[hsl(var(--sita-gold))] text-[hsl(var(--sita-gold))]";
  return "border-[hsl(var(--trust-degraded))] text-[hsl(var(--trust-degraded))]";
};

const timeAgo = (dt: string) => {
  const d = Date.now() - new Date(dt).getTime();
  const mins = Math.floor(d / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const initials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

interface CardProps {
  item: InboxItem;
  selected?: boolean;
  checked?: boolean;
  onSelect: () => void;
  onCheck: (checked: boolean) => void;
  onAccept: () => void;
  onRoute: (dest: string) => void;
  onReject: () => void;
  onSnooze: () => void;
  onFlag: () => void;
}

export const LeadTriageCard = ({
  item, selected, checked, onSelect, onCheck, onAccept, onRoute, onReject, onSnooze, onFlag
}: CardProps) => {
  const isSpam = item.suggested_route === "spam";
  const isExceptional = item.suggested_route === "boardroom";

  return (
    <SitaCard
      onClick={onSelect}
      selected={selected}
      lane={isExceptional ? "opportunity" : item.urgency === "critical" ? "action" : undefined}
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

          {/* Avatar with quality ring */}
          <div className={cn("h-10 w-10 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold", qualityRing(item.quality_score))}>
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
              {isExceptional && (
                <span className="inline-flex items-center text-[9px] font-bold text-[hsl(var(--sita-gold))] bg-[hsl(var(--sita-gold))]/15 rounded-full px-2 py-px border border-[hsl(var(--sita-gold))]/20">
                  ★ Exceptional
                </span>
              )}
            </div>

            {item.inquiry_text && (
              <p className="text-[12px] text-muted-foreground mt-1 line-clamp-1">{item.inquiry_text}</p>
            )}

            <LeadAdvisorWhisper suggestion={item.advisor_suggestion} />
          </div>

          {/* Right side: score + time */}
          <div className="text-right shrink-0 space-y-1">
            <div className={cn("font-display text-lg font-bold tabular-nums", qualityRing(item.quality_score).split(" ")[1])}>
              {item.quality_score}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground justify-end">
              <Clock className="h-2.5 w-2.5" />
              {timeAgo(item.created_at)}
            </div>
          </div>
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
