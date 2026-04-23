// Personal Brain — Phase 7 insights signals card
import { Lightbulb, Loader2, Pin, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePbInsightsSignals } from "./hooks/usePbInsightsSignals";

const KIND_COLOR: Record<string, string> = {
  pattern: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  blocker: "bg-destructive/10 text-destructive",
  win: "bg-green-500/10 text-green-600 dark:text-green-400",
  theme: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  suggestion: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export function BrainSignalsCard() {
  const { signals, loading, busy, scan, updateStatus } = usePbInsightsSignals();
  return (
    <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-accent/8 via-card to-card-elevated">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent/30 to-primary/30">
            <Lightbulb className="h-3.5 w-3.5 text-primary" />
          </span>
          Signals
        </CardTitle>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => void scan()}>
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : "Scan"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : signals.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No signals yet. Tap Scan to analyze recent activity for patterns, blockers, and wins.
          </p>
        ) : (
          signals.slice(0, 6).map((s) => (
            <div key={s.id} className="rounded-lg border border-border/50 p-2.5">
              <div className="flex items-start gap-2">
                <Badge className={`text-[10px] uppercase ${KIND_COLOR[s.kind] ?? "bg-muted"}`} variant="outline">
                  {s.kind}
                </Badge>
                <div className="flex-1">
                  <h4 className="text-xs font-semibold">{s.title}</h4>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <Button size="icon" variant="ghost" className="h-6 w-6"
                    onClick={() => void updateStatus(s.id, s.status === "pinned" ? "new" : "pinned")}>
                    <Pin className={`h-3 w-3 ${s.status === "pinned" ? "fill-primary text-primary" : ""}`} />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6"
                    onClick={() => void updateStatus(s.id, "dismissed")}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
