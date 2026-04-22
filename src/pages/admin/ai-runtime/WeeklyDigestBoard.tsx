// ═══════════════════════════════════════════════════════════════
// SITA OS — /admin/ai-runtime/weekly-digest (Phase 3C)
// Persisted weekly digest viewer — admin AI engineering team only.
// Reads internal_agent_weekly_digests, can manually trigger a fresh pass.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarRange, RefreshCw, Sparkles, FileText, Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/sita/EmptyState";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface Digest {
  id: string;
  period_start: string;
  period_end: string;
  generated_by: string;
  summary_markdown: string;
  highlights: any;
  top_incidents: any;
  top_suggestions: any;
  top_cost_anomalies: any;
  trust_changes: any;
  escalations: any;
  evidence_refs: any;
  delivery_state: string;
  created_at: string;
}

export default function WeeklyDigestBoard() {
  const [digests, setDigests] = useState<Digest[]>([]);
  const [selected, setSelected] = useState<Digest | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("internal_agent_weekly_digests")
      .select("*")
      .order("period_end", { ascending: false })
      .limit(60);
    if (error) toast.error("Digest load failed", { description: error.message });
    else {
      const rows = (data ?? []) as Digest[];
      setDigests(rows);
      if (!selected && rows.length > 0) setSelected(rows[0]);
    }
    setLoading(false);
  }, [selected]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-weekly-digest-board")
      .on("postgres_changes", { event: "*", schema: "public", table: "internal_agent_weekly_digests" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runDigest = useCallback(async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("internal-agent-weekly-digest", { body: {} });
      if (error) throw error;
      toast.success("Weekly digest generated", { description: data?.digest_id ? `id ${String(data.digest_id).slice(0, 8)}…` : "ok" });
      await load();
    } catch (e: any) {
      toast.error("Digest generation failed", { description: e?.message ?? String(e) });
    } finally {
      setGenerating(false);
    }
  }, [load]);

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <CalendarRange className="h-6 w-6 text-primary" />
            Weekly Workforce Digest
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Phase 3 — synthesized 7-day digests from real workforce signals: incidents, suggestions, trust shifts, cost, escalations, consensus.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button size="sm" onClick={runDigest} disabled={generating}>
            <Sparkles className={cn("h-4 w-4 mr-2", generating && "animate-pulse")} />
            Generate now
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Digests ({digests.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {digests.length === 0 ? (
                loading ? (
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                  </div>
                ) : (
                  <div className="p-4">
                    <EmptyState
                      icon={<Inbox className="h-5 w-5" />}
                      title="No digests generated yet"
                      description="Run the weekly digest job or wait for the scheduled pass to populate the archive."
                    />
                  </div>
                )
              ) : (
                <ul className="divide-y">
                  {digests.map((d) => (
                    <li
                      key={d.id}
                      className={cn(
                        "p-3 cursor-pointer hover:bg-muted/40 transition",
                        selected?.id === d.id && "bg-muted/60",
                      )}
                      onClick={() => setSelected(d)}
                    >
                      <div className="text-sm font-medium">
                        {new Date(d.period_start).toLocaleDateString()} → {new Date(d.period_end).toLocaleDateString()}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">{d.generated_by}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="outline" className="text-[10px]">{d.delivery_state}</Badge>
                        {Array.isArray(d.highlights) && d.highlights.length > 0 && (
                          <Badge variant="outline" className="text-[10px]">{d.highlights.length} highlights</Badge>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Reader */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {selected
                ? `${new Date(selected.period_start).toLocaleDateString()} → ${new Date(selected.period_end).toLocaleDateString()}`
                : "Select a digest"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selected ? (
              <EmptyState
                icon={<FileText className="h-5 w-5" />}
                title="Select a digest from the list"
                description="Pick any week from the left to read its summary, highlights, and evidence references."
              />
            ) : (
              <ScrollArea className="h-[600px] pr-3">
                <article className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{selected.summary_markdown || "_(empty digest)_"}</ReactMarkdown>
                </article>
                {selected.evidence_refs && (
                  <div className="mt-6 border-t pt-4">
                    <div className="text-xs text-muted-foreground mb-2">Evidence references</div>
                    <pre className="text-[11px] bg-muted p-2 rounded overflow-x-auto">
                      {JSON.stringify(selected.evidence_refs, null, 2)}
                    </pre>
                  </div>
                )}
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
