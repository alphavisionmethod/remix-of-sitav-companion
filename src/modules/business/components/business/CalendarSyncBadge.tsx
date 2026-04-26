// ═══════════════════════════════════════════════════════════════
// SITA OS — Calendar Sync Status Badge (Phase 10 UI)
// Honest, evidence-backed badge that reflects the latest row(s)
// in `calendar_sync_links` for an appointment.
// ═══════════════════════════════════════════════════════════════

import { CalendarCheck2, CalendarClock, CalendarX2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { AppointmentSyncBadgeData } from "@/hooks/use-phase10-actions";

interface Props {
  links: AppointmentSyncBadgeData[] | undefined;
  size?: "sm" | "md";
}

function formatRelative(iso: string | null): string {
  if (!iso) return "never";
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.round(ms / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  return `${day}d ago`;
}

function pickPrimary(links: AppointmentSyncBadgeData[]): AppointmentSyncBadgeData {
  // Surface the most actionable status first: failed > conflict > pending > synced > deleted.
  const order: AppointmentSyncBadgeData["status"][] = ["failed", "conflict", "pending", "synced", "deleted"];
  for (const s of order) {
    const hit = links.find((l) => l.status === s);
    if (hit) return hit;
  }
  return links[0]!;
}

export function CalendarSyncBadge({ links, size = "sm" }: Props) {
  if (!links || links.length === 0) {
    // Honest empty: no link record yet, so we say "not synced" rather than fake success.
    return (
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/40 text-muted-foreground border-border">
        <CalendarX2 className="h-3 w-3 mr-0.5" /> Not synced
      </Badge>
    );
  }

  const primary = pickPrimary(links);

  const config: Record<
    AppointmentSyncBadgeData["status"],
    { className: string; icon: JSX.Element; label: string }
  > = {
    synced: {
      className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
      icon: <CalendarCheck2 className="h-3 w-3 mr-0.5" />,
      label: "Synced",
    },
    pending: {
      className: "bg-amber-500/10 text-amber-600 border-amber-500/30",
      icon: <CalendarClock className="h-3 w-3 mr-0.5" />,
      label: "Sync queued",
    },
    failed: {
      className: "bg-destructive/10 text-destructive border-destructive/30",
      icon: <AlertTriangle className="h-3 w-3 mr-0.5" />,
      label: "Sync failed",
    },
    conflict: {
      className: "bg-orange-500/10 text-orange-600 border-orange-500/30",
      icon: <AlertTriangle className="h-3 w-3 mr-0.5" />,
      label: "Sync conflict",
    },
    deleted: {
      className: "bg-muted text-muted-foreground border-border",
      icon: <CalendarX2 className="h-3 w-3 mr-0.5" />,
      label: "Removed from calendar",
    },
  };
  const c = config[primary.status];

  // Tooltip carries the full provider × status breakdown plus the
  // last non-fatal error so engineers and operators can self-debug.
  const tooltipBody = (
    <div className="space-y-1.5 text-[11px]">
      {links.map((l, i) => (
        <div key={`${l.provider}-${i}`} className="space-y-0.5">
          <div className="flex items-center justify-between gap-3">
            <span className="capitalize font-semibold">{l.provider}</span>
            <span className="capitalize text-muted-foreground">{l.status}</span>
          </div>
          <div className="text-[10px] text-muted-foreground">
            Last sync: {formatRelative(l.lastSyncedAt)}
          </div>
          {l.lastError && (
            <div className="text-[10px] text-destructive/90 break-words">
              {l.lastError}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`${c.className} text-[10px] px-1.5 py-0 cursor-help ${size === "md" ? "py-0.5" : ""}`}
          >
            {c.icon}
            {c.label}
            {links.length > 1 && (
              <span className="ml-1 text-[9px] opacity-70">×{links.length}</span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[260px]">
          {tooltipBody}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}