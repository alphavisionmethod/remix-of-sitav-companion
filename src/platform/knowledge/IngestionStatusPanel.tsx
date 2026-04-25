import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useIngestionJobs } from "./use-knowledge";
import type { IngestionStage } from "./knowledge-service";
import { Activity } from "lucide-react";

const STAGE_VARIANT: Record<IngestionStage, "default" | "secondary" | "outline" | "destructive"> = {
  queued: "outline",
  extracting: "outline",
  classifying: "outline",
  chunking: "secondary",
  embedding: "secondary",
  indexed: "default",
  failed: "destructive",
};

export function IngestionStatusPanel() {
  const { data, isLoading } = useIngestionJobs();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Ingestion pipeline
        </CardTitle>
        <span className="text-xs text-muted-foreground">{data?.length ?? 0} recent</span>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && <Skeleton className="h-12 w-full" />}
        {!isLoading && (data?.length ?? 0) === 0 && (
          <p className="text-sm text-muted-foreground">No ingestion jobs yet. Jobs will appear when files are reindexed.</p>
        )}
        {data?.map((job) => (
          <div key={job.id} className="space-y-1.5 rounded-md border p-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <Badge variant={STAGE_VARIANT[job.stage]} className="text-[10px] uppercase">
                  {job.stage}
                </Badge>
                <span className="text-xs text-muted-foreground">{job.source_kind}</span>
                {job.source_id && (
                  <span className="text-[10px] text-muted-foreground truncate font-mono">
                    {job.source_id.slice(0, 8)}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {new Date(job.created_at).toLocaleTimeString()}
              </span>
            </div>
            <Progress value={Math.round(Number(job.progress) * 100)} className="h-1" />
            {job.error && <p className="text-[11px] text-destructive">{job.error}</p>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}