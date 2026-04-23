import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import type { PbMemory } from "./hooks/usePbInsights";

interface BrainInsightCardProps {
  insights: PbMemory[];
  loading: boolean;
}

export function BrainInsightCard({ insights, loading }: BrainInsightCardProps) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Brain insights
        </h2>
        {loading ? (
          <p className="text-xs text-muted-foreground">Loading…</p>
        ) : insights.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Nothing learned yet. As you chat, the Brain will surface patterns here.
          </p>
        ) : (
          <ul className="space-y-2">
            {insights.map((m) => (
              <li key={m.id} className="rounded-md border border-border bg-card/50 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {m.category}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {Math.round(Number(m.confidence) * 100)}%
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-foreground line-clamp-3">{m.content}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}