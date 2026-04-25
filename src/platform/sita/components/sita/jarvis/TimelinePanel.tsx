// ═══════════════════════════════════════════════════════════════
// SITA OS — TimelinePanel (Jarvis Bridge)
// One chronological feed: episodes + perception + advisor actions
// + reflection journal entries.
// ═══════════════════════════════════════════════════════════════

import { Activity, Eye, Receipt, BookOpen, Layers, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PremiumEmptyState } from "@/components/sita/PremiumEmptyState";
import { useUnifiedTimeline } from "@/lib/sita-jarvis";

const ICONS = {
  episode: Layers,
  perception: Eye,
  action: Activity,
  receipt: Receipt,
  journal: BookOpen,
} as const;

function fmtTs(ts: string): string {
  const d = new Date(ts);
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
  return `${Math.floor(sec / 86400)}d`;
}

export function TimelinePanel() {
  const { items, loading, refresh } = useUnifiedTimeline();
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" /> Timeline
        </CardTitle>
        <Button size="sm" variant="ghost" onClick={() => void refresh()} aria-label="Refresh timeline">
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="max-h-[480px] overflow-y-auto">
        {loading ? (
          <div className="space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
        ) : items.length === 0 ? (
          <PremiumEmptyState
            variant="no-data"
            title="No recent activity"
            description="As Sita observes sessions and executes actions, they will appear here as a single chronological feed."
          />
        ) : (
          <ol className="relative border-l border-border/40 pl-4 space-y-3">
            {items.map((it) => {
              const Icon = ICONS[it.icon];
              return (
                <li key={it.key} className="relative">
                  <span className="absolute -left-[22px] flex h-4 w-4 items-center justify-center rounded-full border border-border/40 bg-card">
                    <Icon className="h-2.5 w-2.5 text-muted-foreground" />
                  </span>
                  <div className="text-sm font-medium leading-tight line-clamp-1">{it.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{it.summary}</div>
                  <div className="text-[10px] text-muted-foreground/70 mt-0.5">{fmtTs(it.ts)} · {it.source.replace(/_/g, " ")}</div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}