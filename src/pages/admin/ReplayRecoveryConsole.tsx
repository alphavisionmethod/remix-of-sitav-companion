import { useState, useCallback } from "react";
import CPSSubNav from "@/platform/admin/components/admin/CPSSubNav";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RotateCcw, Play, AlertTriangle, CheckCircle, Clock, Layers, Search, GitBranch } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchPersistedEvents, getEventLineage, markEventReplayed,
  fetchActionLineage, fetchPolicyEvaluations, getActionExplanation,
} from "@/data/persistence";
import { toast } from "sonner";
import { getSitaKernel } from "@/lib/sita-kernel";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const fade = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function ReplayRecoveryConsole() {
  const [replayScope, setReplayScope] = useState<string>("topic");
  const [scopeValue, setScopeValue] = useState("");
  const [dryRun, setDryRun] = useState(true);
  const [replayResults, setReplayResults] = useState<any[] | null>(null);
  const [replaying, setReplaying] = useState(false);
  const [actionDetail, setActionDetail] = useState<any | null>(null);

  const { data: events = [], refetch: refetchEvents } = useQuery({
    queryKey: ["replay-events"],
    queryFn: () => fetchPersistedEvents({ limit: 200 }),
    staleTime: 30000,
  });
  const { data: actions = [] } = useQuery({
    queryKey: ["replay-actions"],
    queryFn: () => fetchActionLineage({ limit: 200 }),
    staleTime: 30000,
  });
  const { data: policies = [] } = useQuery({
    queryKey: ["replay-policies"],
    queryFn: () => fetchPolicyEvaluations({ limit: 100 }),
    staleTime: 30000,
  });

  const uniqueTopics = [...new Set(events.map(e => e.topic))];
  const uniqueDomains = [...new Set(events.map(e => e.domain).filter(Boolean))];
  const uniqueCorrelations = [...new Set(events.map(e => e.correlation_id).filter(Boolean))];
  const replayableCount = events.filter(e => e.replay_eligible || e.status === "dead_letter").length;
  const deadLetterCount = events.filter(e => e.status === "dead_letter").length;

  // Execute replay from durable storage
  const executeReplay = useCallback(async () => {
    setReplaying(true);
    setReplayResults(null);

    try {
      // Filter events based on scope
      let targetEvents = [...events];
      if (replayScope === "topic" && scopeValue) {
        targetEvents = targetEvents.filter(e => e.topic === scopeValue);
      } else if (replayScope === "domain" && scopeValue) {
        targetEvents = targetEvents.filter(e => e.domain === scopeValue);
      } else if (replayScope === "correlation" && scopeValue) {
        targetEvents = targetEvents.filter(e => e.correlation_id === scopeValue);
      }

      // Filter to replayable only
      targetEvents = targetEvents.filter(e => e.replay_eligible || e.status === "dead_letter");

      if (targetEvents.length === 0) {
        toast.info("No replayable events match scope");
        setReplaying(false);
        return;
      }

      if (dryRun) {
        // Dry-run: show what would be replayed without dispatching
        const results = targetEvents.map(e => ({
          ...e,
          replay_status: "dry_run",
          would_dispatch: true,
        }));
        setReplayResults(results);
        toast.success(`Dry-run complete: ${results.length} events would be replayed`);
      } else {
        // Live replay: dispatch events through kernel EventBus
        const kernel = getSitaKernel();
        const results: any[] = [];

        for (const event of targetEvents) {
          try {
            // Re-dispatch through EventBus (which also re-persists)
            await kernel.eventBus.publish(event.topic, event.payload ?? {}, {
              source: `replay:${event.source ?? "unknown"}`,
              correlationId: event.correlation_id ?? undefined,
              domain: event.domain ?? undefined,
            });

            // Mark original event as replayed in durable store
            await markEventReplayed(event.id);

            results.push({ ...event, replay_status: "replayed" });
          } catch (err: any) {
            results.push({ ...event, replay_status: "failed", error: err?.message });
          }
        }

        setReplayResults(results);
        const succeeded = results.filter(r => r.replay_status === "replayed").length;
        const failed = results.filter(r => r.replay_status === "failed").length;
        toast.success(`Replay complete: ${succeeded} succeeded, ${failed} failed`);
        refetchEvents();
      }
    } catch (err: any) {
      toast.error(`Replay error: ${err?.message}`);
    }

    setReplaying(false);
  }, [events, replayScope, scopeValue, dryRun, refetchEvents]);

  // Inspect action lineage detail
  const inspectAction = useCallback(async (actionId: string) => {
    const detail = await getActionExplanation(actionId);
    setActionDetail(detail);
  }, []);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <CPSSubNav />
<motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.04 } } }} className="space-y-4">
        <motion.div variants={fade} className="flex items-center gap-3">
          <RotateCcw className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Replay & Recovery Console</h1>
          <Badge>{replayableCount} replayable</Badge>
          {deadLetterCount > 0 && <Badge variant="destructive">{deadLetterCount} dead letters</Badge>}
        </motion.div>

        {/* Replay Builder */}
        <motion.div variants={fade}>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Replay Scope Builder</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Scope</label>
                  <Select value={replayScope} onValueChange={setReplayScope}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="topic">By Topic</SelectItem>
                      <SelectItem value="domain">By Domain</SelectItem>
                      <SelectItem value="correlation">By Correlation ID</SelectItem>
                      <SelectItem value="all">All Events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {replayScope !== "all" && (
                  <div className="flex-1 min-w-48">
                    <label className="text-xs text-muted-foreground mb-1 block">Value</label>
                    {replayScope === "topic" ? (
                      <Select value={scopeValue} onValueChange={setScopeValue}>
                        <SelectTrigger><SelectValue placeholder="Select topic…" /></SelectTrigger>
                        <SelectContent>
                          {uniqueTopics.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : replayScope === "domain" ? (
                      <Select value={scopeValue} onValueChange={setScopeValue}>
                        <SelectTrigger><SelectValue placeholder="Select domain…" /></SelectTrigger>
                        <SelectContent>
                          {uniqueDomains.map(d => <SelectItem key={d!} value={d!}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input value={scopeValue} onChange={e => setScopeValue(e.target.value)} placeholder="Enter correlation ID…" />
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Switch checked={dryRun} onCheckedChange={setDryRun} />
                  <span className="text-xs text-muted-foreground">{dryRun ? "Dry Run" : "Live Replay"}</span>
                </div>
                <Button onClick={executeReplay} disabled={replaying}>
                  <Play className="h-4 w-4 mr-1" />{replaying ? "Replaying…" : dryRun ? "Dry Run" : "Execute Replay"}
                </Button>
              </div>
              {!dryRun && (
                <div className="flex items-center gap-2 text-xs text-amber-400">
                  <AlertTriangle className="h-3 w-3" /> Live replay will re-dispatch events and mark originals as replayed.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Replay Results */}
        {replayResults && (
          <motion.div variants={fade}>
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  {dryRun ? "Dry-Run" : "Replay"} Results ({replayResults.length} events)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 max-h-60 overflow-y-auto">
                {replayResults.map((e, i) => (
                  <div key={e.id ?? i} className="flex items-center gap-2 text-xs border-b border-border/20 pb-1">
                    <span className="font-mono w-4 text-muted-foreground">{i + 1}</span>
                    <Badge variant="outline" className="text-[10px]">{e.topic}</Badge>
                    <Badge className={`text-[9px] ${
                      e.replay_status === "replayed" ? "bg-emerald-500/20 text-emerald-400" :
                      e.replay_status === "dry_run" ? "bg-blue-500/20 text-blue-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>{e.replay_status}</Badge>
                    {e.domain && <span className="text-muted-foreground text-[10px]">{e.domain}</span>}
                    <span className="text-muted-foreground ml-auto">{new Date(e.created_at).toLocaleTimeString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Action Lineage Detail */}
        {actionDetail?.action && (
          <motion.div variants={fade}>
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-primary" />
                  Action Lineage: {actionDetail.action.action_type ?? actionDetail.action.id.slice(0, 8)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <div><span className="text-muted-foreground">State:</span> <Badge variant="outline" className="text-[10px]">{actionDetail.action.current_state}</Badge></div>
                  <div><span className="text-muted-foreground">Domain:</span> {actionDetail.action.domain}</div>
                  <div><span className="text-muted-foreground">Confidence:</span> {(actionDetail.action.confidence_score * 100).toFixed(0)}%</div>
                </div>
                <div className="flex gap-3 text-muted-foreground">
                  <span>Events: {actionDetail.events.length}</span>
                  <span>Policies: {actionDetail.policies.length}</span>
                  <span>Receipts: {actionDetail.receipts.length}</span>
                </div>
                {actionDetail.action.state_history?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-muted-foreground mb-1">State History:</p>
                    <div className="flex flex-wrap gap-1">
                      {actionDetail.action.state_history.map((t: any, i: number) => (
                        <Badge key={i} variant="outline" className="text-[9px]">
                          {t.from} → {t.to}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* System Summary */}
        <motion.div variants={fade} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4 text-center">
              <Layers className="h-5 w-5 text-primary mx-auto" />
              <p className="text-lg font-bold text-foreground mt-1">{events.length}</p>
              <p className="text-xs text-muted-foreground">Durable Events</p>
              <p className="text-[10px] text-muted-foreground mt-1">{uniqueTopics.length} topics · {uniqueCorrelations.length} correlations</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 text-primary mx-auto" />
              <p className="text-lg font-bold text-foreground mt-1">{actions.length}</p>
              <p className="text-xs text-muted-foreground">Action Records</p>
              <p className="text-[10px] text-muted-foreground mt-1">Full lineage available</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4 text-center">
              <RotateCcw className="h-5 w-5 text-primary mx-auto" />
              <p className="text-lg font-bold text-foreground mt-1">{policies.length}</p>
              <p className="text-xs text-muted-foreground">Policy Decisions</p>
              <p className="text-[10px] text-muted-foreground mt-1">Inspectable evaluations</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-5 w-5 text-amber-400 mx-auto" />
              <p className="text-lg font-bold text-foreground mt-1">{deadLetterCount}</p>
              <p className="text-xs text-muted-foreground">Dead Letters</p>
              <p className="text-[10px] text-muted-foreground mt-1">Failed / retriable events</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Actions with Inspect */}
        {actions.length > 0 && (
          <motion.div variants={fade}>
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Action Lineage (click to inspect)</CardTitle></CardHeader>
              <CardContent className="space-y-1 max-h-48 overflow-y-auto">
                {actions.slice(0, 20).map(a => (
                  <div
                    key={a.id}
                    className="flex items-center gap-2 text-xs border-b border-border/20 pb-1 cursor-pointer hover:bg-primary/5 rounded px-1"
                    onClick={() => inspectAction(a.id)}
                  >
                    <Badge variant="outline" className="text-[10px]">{a.current_state}</Badge>
                    <span className="text-foreground">{a.action_type ?? a.domain}</span>
                    <span className="text-muted-foreground ml-auto">{new Date(a.updated_at).toLocaleTimeString()}</span>
                    <Search className="h-3 w-3 text-muted-foreground" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
