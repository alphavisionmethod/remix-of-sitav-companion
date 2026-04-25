// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 7 Admin: Live Cortex Board
// Operator dashboard for the Live Semantic Cortex layer:
//   • Embedding budget rollups (cost & token usage)
//   • Voice intents queue (proposed/approved/rejected)
//   • Streaming chat sandbox (uses ai-orchestrator-stream)
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Wand2, Radio } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EmbeddingBudgetPanel } from "@/modules/_shared/knowledge/EmbeddingBudgetPanel";
import { StreamingChatPanel } from "@/modules/_shared/ai/StreamingChatPanel";

interface IntentRow {
  id: string;
  session_id: string;
  action_key: string;
  status: string;
  confidence: number;
  rationale: string | null;
  created_at: string;
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  proposed: "default",
  approved: "secondary",
  rejected: "destructive",
  executed: "secondary",
  expired: "outline",
};

function LiveCortexBoard() {
  const [intents, setIntents] = useState<IntentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const sb = supabase as any;
      const { data } = await sb
        .from("voice_intents")
        .select("id, session_id, action_key, status, confidence, rationale, created_at")
        .order("created_at", { ascending: false })
        .limit(40);
      if (!cancelled) {
        setIntents((data ?? []) as IntentRow[]);
        setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 30_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const counts = intents.reduce<Record<string, number>>((acc, i) => {
    acc[i.status] = (acc[i.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Radio className="h-5 w-5" /> Live Cortex
        </h1>
        <p className="text-sm text-muted-foreground">
          Phase 7 — streaming orchestration, voice intents, and embedding budget governance.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EmbeddingBudgetPanel />
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Wand2 className="h-4 w-4" /> Voice intents queue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(["proposed", "approved", "executed", "rejected", "expired"] as const).map((s) => (
                <Badge key={s} variant={STATUS_VARIANT[s] ?? "outline"} className="text-[10px] uppercase">
                  {s}: {counts[s] ?? 0}
                </Badge>
              ))}
            </div>
            {loading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <ScrollArea className="max-h-72 pr-2">
                {intents.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No voice intents extracted yet. Run an intent extraction from a voice session to populate the queue.
                  </p>
                )}
                <div className="space-y-2">
                  {intents.slice(0, 20).map((i) => (
                    <div key={i.id} className="rounded-md border bg-card p-2 text-xs space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="text-[10px] font-mono">{i.action_key}</Badge>
                        <Badge variant={STATUS_VARIANT[i.status] ?? "outline"} className="text-[10px] uppercase">
                          {i.status}
                        </Badge>
                      </div>
                      {i.rationale && (
                        <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{i.rationale}</p>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>conf {Math.round(i.confidence * 100)}%</span>
                        <span>{new Date(i.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" /> Streaming sandbox
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StreamingChatPanel
            title="ai-orchestrator-stream"
            capabilityKey="shared.chat"
            systemPrompt="You are the SITA OS Live Cortex assistant. Be concise and cite which memory or chunk you used."
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default LiveCortexBoard;