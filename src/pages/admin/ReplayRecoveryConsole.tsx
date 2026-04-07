import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RotateCcw, Play, AlertTriangle, CheckCircle, Clock, Layers } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchPersistedEvents, getEventLineage, markEventReplayed, fetchActionLineage, fetchPolicyEvaluations } from "@/lib/persistence";
import { toast } from "sonner";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const fade = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function ReplayRecoveryConsole() {
  const { isDemoMode } = useDataMode();
  const [replayScope, setReplayScope] = useState<string>("topic");
  const [scopeValue, setScopeValue] = useState("");
  const [dryRun, setDryRun] = useState(true);
  const [replayResults, setReplayResults] = useState<any[] | null>(null);

  const { data: events = [] } = useQuery({ queryKey: ["replay-events"], queryFn: () => fetchPersistedEvents({ limit: 100 }), staleTime: 30000 });
  const { data: actions = [] } = useQuery({ queryKey: ["replay-actions"], queryFn: () => fetchActionLineage({ limit: 100 }), staleTime: 30000 });
  const { data: policies = [] } = useQuery({ queryKey: ["replay-policies"], queryFn: () => fetchPolicyEvaluations({ limit: 100 }), staleTime: 30000 });

  const replayMutation = useMutation({
    mutationFn: async () => {
      let results: any[] = [];
      if (replayScope === "correlation" && scopeValue) {
        results = await getEventLineage(scopeValue);
      } else if (replayScope === "topic" && scopeValue) {
        results = await fetchPersistedEvents({ topic: scopeValue, limit: 50 });
      } else if (replayScope === "domain" && scopeValue) {
        results = await fetchPersistedEvents({ domain: scopeValue, limit: 50 });
      } else {
        results = await fetchPersistedEvents({ limit: 50 });
      }

      if (!dryRun) {
        for (const e of results) {
          if (e.status === "dead_letter" || e.status === "failed") {
            await markEventReplayed(e.id);
          }
        }
      }
      return results;
    },
    onSuccess: (data) => {
      setReplayResults(data);
      toast.success(`${dryRun ? "Dry-run" : "Replay"} complete: ${data.length} events processed`);
    },
    onError: () => toast.error("Replay failed"),
  });

  const uniqueTopics = [...new Set(events.map(e => e.topic))];
  const uniqueDomains = [...new Set(events.map(e => e.domain).filter(Boolean))];
  const replayableCount = events.filter(e => e.replay_eligible || e.status === "dead_letter").length;

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <DemoModeBadge />
      <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.04 } } }} className="space-y-4">
        <motion.div variants={fade} className="flex items-center gap-3">
          <RotateCcw className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Replay & Recovery Console</h1>
          <Badge>{replayableCount} replayable</Badge>
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
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Value</label>
                    <Input value={scopeValue} onChange={e => setScopeValue(e.target.value)} placeholder={`Enter ${replayScope}...`} />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Switch checked={dryRun} onCheckedChange={setDryRun} />
                  <span className="text-xs text-muted-foreground">{dryRun ? "Dry Run" : "Live Replay"}</span>
                </div>
                <Button onClick={() => replayMutation.mutate()} disabled={replayMutation.isPending}>
                  <Play className="h-4 w-4 mr-1" />{dryRun ? "Dry Run" : "Execute Replay"}
                </Button>
              </div>
              {!dryRun && (
                <div className="flex items-center gap-2 text-xs text-amber-400">
                  <AlertTriangle className="h-3 w-3" /> Live replay will mark events as replayed. Use with caution.
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
                    <Badge className={`text-[9px] ${e.status === "processed" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>{e.status}</Badge>
                    <span className="text-muted-foreground ml-auto">{new Date(e.created_at).toLocaleTimeString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* System Summary */}
        <motion.div variants={fade} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4 text-center">
              <Layers className="h-5 w-5 text-primary mx-auto" />
              <p className="text-lg font-bold text-foreground mt-1">{events.length}</p>
              <p className="text-xs text-muted-foreground">Events in Store</p>
              <p className="text-[10px] text-muted-foreground mt-1">{uniqueTopics.length} unique topics</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 text-primary mx-auto" />
              <p className="text-lg font-bold text-foreground mt-1">{actions.length}</p>
              <p className="text-xs text-muted-foreground">Action Records</p>
              <p className="text-[10px] text-muted-foreground mt-1">Reconstructable workflows</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4 text-center">
              <RotateCcw className="h-5 w-5 text-primary mx-auto" />
              <p className="text-lg font-bold text-foreground mt-1">{policies.length}</p>
              <p className="text-xs text-muted-foreground">Policy Decisions</p>
              <p className="text-[10px] text-muted-foreground mt-1">Inspectable decisions</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
