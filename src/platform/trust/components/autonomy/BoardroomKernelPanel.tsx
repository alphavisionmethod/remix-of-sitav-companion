// ═══════════════════════════════════════════════════════════════
// SITA OS — Boardroom Kernel Panel (Phase 7)
// Renders synthesized themes as priority-ranked cards. Read-only:
// themes are derived; the owner acts on them via the existing
// approval queue or advisor settings.
// ═══════════════════════════════════════════════════════════════

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Swords, Hourglass, Sparkle, AlertOctagon, Boxes } from "lucide-react";
import { useBoardroomKernel } from "@/platform/boardroom/hooks/useBoardroomKernel";
import type { BoardroomTheme, ThemeKind } from "@/lib/autonomy/boardroom-kernel";
import { cn } from "@/lib/utils";

const KIND_META: Record<ThemeKind, { icon: typeof Users; label: string; tone: string }> = {
  consensus:      { icon: Users,        label: "Consensus",      tone: "border-trust-safe/40 text-trust-safe" },
  conflict:       { icon: Swords,       label: "Conflict",       tone: "border-destructive/40 text-destructive" },
  stalled:        { icon: Hourglass,    label: "Stalled",        tone: "border-accent/40 text-accent-foreground" },
  emergent:       { icon: Sparkle,      label: "Emergent",       tone: "border-primary/40 text-primary" },
  breaker_storm:  { icon: AlertOctagon, label: "Breaker storm",  tone: "border-destructive/50 text-destructive" },
};

type Props = { compact?: boolean; limit?: number };

export function BoardroomKernelPanel({ compact = false, limit = 20 }: Props) {
  const { themes, loading } = useBoardroomKernel();
  const visible = themes.slice(0, limit);

  const body = (
    <ScrollArea className="h-[460px]">
      <div className="space-y-2 pr-3">
        {loading && (
          <>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </>
        )}
        {!loading && visible.length === 0 && (
          <div className="rounded-lg border border-dashed border-border/50 p-6 text-center text-sm text-muted-foreground">
            <Boxes className="mx-auto mb-2 h-6 w-6 opacity-60" />
            The board is quiet. No emergent themes across the advisor fleet right now.
          </div>
        )}
        {!loading && visible.map((t) => <ThemeCard key={t.id} theme={t} />)}
      </div>
    </ScrollArea>
  );

  if (compact) return body;

  return (
    <Card className={cn("border-border/60")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Boxes className="h-4 w-4 text-primary" /> Boardroom themes
          </CardTitle>
          <Badge variant="secondary">{themes.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>{body}</CardContent>
    </Card>
  );
}

function ThemeCard({ theme }: { theme: BoardroomTheme }) {
  const meta = KIND_META[theme.kind];
  const Icon = meta.icon;
  return (
    <Card className="border-border/60">
      <CardContent className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn("text-[10px]", meta.tone)}>
                <Icon className="mr-1 h-3 w-3" /> {meta.label}
              </Badge>
              {theme.domains.slice(0, 2).map((d) => (
                <Badge key={d} variant="secondary" className="text-[10px]">{d}</Badge>
              ))}
              <span className="text-[10px] text-muted-foreground tabular-nums">
                priority {(theme.priority * 100).toFixed(0)} · conf {(theme.confidence * 100).toFixed(0)}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium leading-snug">{theme.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{theme.summary}</p>
            {theme.advisors.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {theme.advisors.map((a) => (
                  <span key={a} className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {a}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-1.5 text-[11px] italic text-foreground/70">→ {theme.ownerAsk}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}