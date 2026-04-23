import { Check, Loader2, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { PbMemory } from "./hooks/usePbMemories";

interface Props {
  pending: PbMemory[];
  onApprove: (id: string) => Promise<void> | void;
  onReject: (id: string) => Promise<void> | void;
  onScan?: () => Promise<void> | void;
  scanning?: boolean;
}

export function PendingReviewTray({ pending, onApprove, onReject, onScan, scanning }: Props) {
  const [busyId, setBusyId] = useState<string | null>(null);

  const wrap = async (id: string, fn: () => Promise<void> | void) => {
    setBusyId(id);
    try { await fn(); } finally { setBusyId(null); }
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Pending review</h2>
            <Badge variant="outline" className="text-[10px]">{pending.length}</Badge>
          </div>
          {onScan && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[11px]"
              onClick={() => void onScan()}
              disabled={!!scanning}
            >
              {scanning ? <Loader2 className="h-3 w-3 animate-spin" /> : "Scan now"}
            </Button>
          )}
        </div>
        {pending.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Nothing to review. The Brain will surface low-confidence inferences here so you can approve or reject them.
          </p>
        ) : (
          <div className="space-y-2">
            {pending.map((m) => {
              const conf = Math.round(Number(m.confidence) * 100);
              const isBusy = busyId === m.id;
              return (
                <div key={m.id} className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {m.category.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-[10px] tabular-nums text-muted-foreground">{conf}% confidence</span>
                  </div>
                  <p className="mt-2 text-sm text-foreground">{m.content}</p>
                  <Progress value={conf} className="mt-2 h-1" />
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px]"
                      onClick={() => void wrap(m.id, () => onReject(m.id))}
                      disabled={isBusy}
                    >
                      <X className="h-3 w-3" /> Reject
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 text-[11px]"
                      onClick={() => void wrap(m.id, () => onApprove(m.id))}
                      disabled={isBusy}
                    >
                      {isBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                      Approve
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
