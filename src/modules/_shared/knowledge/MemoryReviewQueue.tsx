import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MemoryProvenanceBadge } from "./MemoryProvenanceBadge";
import { usePendingMemoryReviews, useResolveMemoryReview } from "./use-knowledge";
import { Check, X, Inbox } from "lucide-react";

export function MemoryReviewQueue() {
  const { data, isLoading } = usePendingMemoryReviews();
  const resolve = useResolveMemoryReview();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Inbox className="h-4 w-4" />
          Memory review queue
        </CardTitle>
        <span className="text-xs text-muted-foreground">{data?.length ?? 0} pending</span>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && <Skeleton className="h-16 w-full" />}
        {!isLoading && (data?.length ?? 0) === 0 && (
          <p className="text-sm text-muted-foreground">Nothing to review. Inferred memories will appear here for your approval.</p>
        )}
        {data?.map((row) => (
          <div key={row.memory_id} className="flex items-start justify-between gap-3 rounded-md border p-3">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <MemoryProvenanceBadge
                  provenanceKind={row.provenance_kind}
                  confidenceBand={row.confidence_band}
                  sensitivity={row.sensitivity}
                />
                <span className="text-[10px] uppercase text-muted-foreground">{row.pillar}</span>
              </div>
              <p className="text-sm leading-snug break-words">{row.content}</p>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <Button
                size="sm"
                variant="default"
                disabled={resolve.isPending}
                onClick={() => resolve.mutate({ memoryId: row.memory_id, decision: "accepted" })}
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={resolve.isPending}
                onClick={() => resolve.mutate({ memoryId: row.memory_id, decision: "rejected" })}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}