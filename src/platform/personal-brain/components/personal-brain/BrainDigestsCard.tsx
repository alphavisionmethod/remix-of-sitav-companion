// Personal Brain — Phase 7 digest card
import { Sparkles, Loader2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePbDigests } from "./hooks/usePbDigests";

export function BrainDigestsCard() {
  const { digests, loading, busy, generate, dismiss } = usePbDigests();
  const latest = digests[0];

  return (
    <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-primary/8 via-card to-card-elevated">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary/30 to-accent/30">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </span>
          Brain digest
        </CardTitle>
        <div className="flex gap-1.5">
          <Button size="sm" variant="outline" disabled={busy} onClick={() => void generate("daily")}>
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : "Daily"}
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => void generate("weekly")}>
            Weekly
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !latest ? (
          <p className="text-sm text-muted-foreground">
            No digest yet. Generate one to see a summary of your recent Brain activity.
          </p>
        ) : (
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Badge variant="secondary" className="text-[10px] uppercase">{latest.period}</Badge>
                <h3 className="mt-1 text-sm font-semibold leading-snug">{latest.title}</h3>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => void dismiss(latest.id)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{latest.summary}</p>
            {latest.highlights?.length > 0 && (
              <ul className="space-y-1.5 pt-1">
                {latest.highlights.slice(0, 5).map((h, i) => (
                  <li key={i} className="flex gap-2 text-xs">
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] uppercase text-primary">{h.kind}</span>
                    <span className="flex-1 text-foreground">{h.text}</span>
                  </li>
                ))}
              </ul>
            )}
            {digests.length > 1 && (
              <p className="pt-1 text-[11px] text-muted-foreground">+ {digests.length - 1} more</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
