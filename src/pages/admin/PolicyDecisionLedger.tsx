import { useState } from "react";
import CPSSubNav from "@/platform/admin/components/admin/CPSSubNav";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, AlertTriangle, CheckCircle, Link2, RefreshCw, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchPolicyEvaluations, getPolicyEvaluationStats, type PersistedPolicyEvaluation } from "@/data/persistence";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const fade = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

function EffectBadge({ effect }: { effect: string }) {
  const c: Record<string, string> = { deny: "bg-red-500/20 text-red-400", allow: "bg-emerald-500/20 text-emerald-400", "require-approval": "bg-amber-500/20 text-amber-400", "require-dual-approval": "bg-orange-500/20 text-orange-400", "require-simulation": "bg-blue-500/20 text-blue-400" };
  return <Badge className={`text-[10px] ${c[effect] ?? c.allow}`}>{effect}</Badge>;
}

export default function PolicyDecisionLedger() {
  const [effectFilter, setEffectFilter] = useState<string>("all");
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [selectedEval, setSelectedEval] = useState<PersistedPolicyEvaluation | null>(null);

  const { data: stats } = useQuery({ queryKey: ["pol-stats"], queryFn: getPolicyEvaluationStats, staleTime: 30000 });
  const { data: evals = [], refetch } = useQuery({
    queryKey: ["pol-evals", effectFilter, domainFilter],
    queryFn: () => fetchPolicyEvaluations({
      effect: effectFilter !== "all" ? effectFilter : undefined,
      domain: domainFilter !== "all" ? domainFilter : undefined,
      limit: 200,
    }),
    staleTime: 15000,
  });

  const uniqueDomains = [...new Set(evals.map(e => e.domain).filter(Boolean))];

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <CPSSubNav />
<motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.04 } } }} className="space-y-4">
        <motion.div variants={fade} className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Policy Decision Ledger</h1>
          <Badge>{stats?.total ?? 0} evaluations</Badge>
          {(stats?.recentDenials ?? 0) > 0 && <Badge variant="destructive">{stats?.recentDenials} recent denials</Badge>}
        </motion.div>

        {/* Effect Summary */}
        <motion.div variants={fade} className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(stats?.byEffect ?? {}).map(([effect, count]) => (
            <Card key={effect} className="border-border/50 bg-card/50 cursor-pointer hover:border-primary/30" onClick={() => setEffectFilter(effect)}>
              <CardContent className="p-3 text-center">
                <EffectBadge effect={effect} />
                <p className="text-lg font-bold text-foreground mt-1">{count as number}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div variants={fade} className="flex gap-3">
          <Select value={effectFilter} onValueChange={setEffectFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Effect" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Effects</SelectItem>
              <SelectItem value="deny">Deny</SelectItem>
              <SelectItem value="allow">Allow</SelectItem>
              <SelectItem value="require-approval">Require Approval</SelectItem>
              <SelectItem value="require-dual-approval">Require Dual Approval</SelectItem>
              <SelectItem value="require-simulation">Require Simulation</SelectItem>
            </SelectContent>
          </Select>
          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Domain" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {uniqueDomains.map(d => <SelectItem key={d!} value={d!}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="h-3 w-3 mr-1" />Refresh</Button>
        </motion.div>

        {/* Evaluation Table */}
        <motion.div variants={fade}>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-border/50 text-muted-foreground">
                  <th className="p-3 text-left">Rule</th>
                  <th className="p-3 text-left">Effect</th>
                  <th className="p-3 text-left">Domain</th>
                  <th className="p-3 text-left">Risk</th>
                  <th className="p-3 text-left">Reason</th>
                  <th className="p-3 text-left">Action Link</th>
                  <th className="p-3 text-left">Sim?</th>
                  <th className="p-3 text-left">Time</th>
                </tr></thead>
                <tbody>
                  {evals.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No policy evaluations persisted</td></tr>}
                  {evals.map(ev => (
                    <tr key={ev.id} className="border-b border-border/20 hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedEval(ev)}>
                      <td className="p-3 font-mono">{ev.rule_name}</td>
                      <td className="p-3"><EffectBadge effect={ev.effect} /></td>
                      <td className="p-3 text-muted-foreground">{ev.domain ?? "—"}</td>
                      <td className="p-3"><Badge variant="outline" className="text-[10px]">{ev.risk_tier ?? "—"}</Badge></td>
                      <td className="p-3 text-muted-foreground max-w-[200px] truncate">{ev.reason}</td>
                      <td className="p-3 font-mono text-muted-foreground">{ev.linked_action_id?.slice(0, 8) ?? "—"}</td>
                      <td className="p-3">{ev.is_simulation ? <Badge className="text-[10px] bg-blue-500/20 text-blue-400">sim</Badge> : "—"}</td>
                      <td className="p-3 text-muted-foreground">{new Date(ev.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detail Drawer */}
        {selectedEval && (
          <motion.div variants={fade}>
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Evaluation: {selectedEval.rule_name}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedEval(null)}>✕</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground">Rule ID:</span> <span className="font-mono">{selectedEval.rule_id}</span></div>
                  <div><span className="text-muted-foreground">Effect:</span> <EffectBadge effect={selectedEval.effect} /></div>
                  <div><span className="text-muted-foreground">Rules Evaluated:</span> {selectedEval.evaluated_rules_count}</div>
                  <div><span className="text-muted-foreground">Eval Time:</span> {selectedEval.evaluation_time_ms?.toFixed(1) ?? "—"}ms</div>
                  <div><span className="text-muted-foreground">Actor:</span> <span className="font-mono">{selectedEval.actor_id?.slice(0, 8) ?? "—"}</span></div>
                  <div><span className="text-muted-foreground">Capability:</span> {selectedEval.capability_id ?? "—"}</div>
                  {selectedEval.linked_action_id && <div><span className="text-muted-foreground">Linked Action:</span> <span className="font-mono">{selectedEval.linked_action_id.slice(0, 12)}</span></div>}
                  {selectedEval.linked_approval_id && <div><span className="text-muted-foreground">Linked Approval:</span> <span className="font-mono">{selectedEval.linked_approval_id.slice(0, 12)}</span></div>}
                </div>
                <div>
                  <span className="text-muted-foreground">Matched Conditions:</span>
                  <pre className="mt-1 p-2 bg-muted/30 rounded text-[10px] overflow-auto max-h-20">{JSON.stringify(selectedEval.matched_conditions, null, 2)}</pre>
                </div>
                <div>
                  <span className="text-muted-foreground">Context Snapshot:</span>
                  <pre className="mt-1 p-2 bg-muted/30 rounded text-[10px] overflow-auto max-h-40">{JSON.stringify(selectedEval.context_snapshot, null, 2)}</pre>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
