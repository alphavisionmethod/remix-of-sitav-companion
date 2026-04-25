// ═══════════════════════════════════════════════════════════════
// SITA OS — EmbeddingHealthPanel
// Operator card showing semantic embedding coverage across the
// knowledge spine and voice transcripts.
// Class: SURFACE.
// ═══════════════════════════════════════════════════════════════
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Brain, Mic, AlertTriangle } from "lucide-react";
import { useEmbeddingCoverage } from "./use-voice-spine";

function pct(num: number, denom: number): number {
  if (!denom) return 100;
  return Math.round((num / denom) * 100);
}

function tone(coverage: number): "good" | "warn" | "bad" {
  if (coverage >= 95) return "good";
  if (coverage >= 75) return "warn";
  return "bad";
}

const TONE_CLASS: Record<"good" | "warn" | "bad", string> = {
  good: "text-emerald-600",
  warn: "text-amber-600",
  bad: "text-destructive",
};

export function EmbeddingHealthPanel() {
  const { data, isLoading } = useEmbeddingCoverage();

  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Semantic coverage</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-24 w-full" /></CardContent>
      </Card>
    );
  }

  const chunkCov = pct(data.chunks_embedded, data.chunks_total);
  const memCov = pct(data.memories_embedded, data.memories_total);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4" /> Semantic coverage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Row
          icon={<Brain className="h-3.5 w-3.5" />}
          label="Memory embeddings"
          value={`${memCov}%`}
          sub={`${data.memories_embedded}/${data.memories_total} embedded · ${data.memories_pending} pending`}
          toneClass={TONE_CLASS[tone(memCov)]}
        />
        <Row
          icon={<Sparkles className="h-3.5 w-3.5" />}
          label="Knowledge chunks"
          value={`${chunkCov}%`}
          sub={`${data.chunks_embedded}/${data.chunks_total} embedded · ${data.chunks_pending} pending`}
          toneClass={TONE_CLASS[tone(chunkCov)]}
        />
        <Row
          icon={<Mic className="h-3.5 w-3.5" />}
          label="Voice transcripts"
          value={`${data.transcripts_total}`}
          sub={`${data.transcripts_pending} pending embed · ${data.transcripts_promoted} promoted to memory`}
        />
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge variant="outline" className="text-[10px]">
            Active sessions: {data.voice_sessions_active}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            Last 24h sessions: {data.voice_sessions_total_24h}
          </Badge>
          {data.chunks_failed > 0 && (
            <Badge variant="destructive" className="gap-1 text-[10px]">
              <AlertTriangle className="h-3 w-3" /> {data.chunks_failed} failed embeddings
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Row({
  icon, label, value, sub, toneClass,
}: { icon: React.ReactNode; label: string; value: string; sub: string; toneClass?: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-medium">{icon} {label}</div>
        <p className="text-[11px] text-muted-foreground">{sub}</p>
      </div>
      <p className={`text-xl font-semibold ${toneClass ?? ""}`}>{value}</p>
    </div>
  );
}
