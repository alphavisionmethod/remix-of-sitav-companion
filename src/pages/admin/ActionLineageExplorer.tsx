import { useState } from "react";
import CPSSubNav from "@/platform/admin/components/admin/CPSSubNav";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitBranch, RefreshCw, Eye, RotateCcw, Link2, Shield, Activity, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchActionLineage, getActionExplanation, findStuckActions, type PersistedActionLineage } from "@/data/persistence";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const fade = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const STATE_COLORS: Record<string, string> = {
  detected: "bg-slate-500/20 text-slate-400", proposed: "bg-blue-500/20 text-blue-400", drafted: "bg-indigo-500/20 text-indigo-400",
  simulated: "bg-purple-500/20 text-purple-400", approval_requested: "bg-amber-500/20 text-amber-400", approved: "bg-emerald-500/20 text-emerald-400",
  rejected: "bg-red-500/20 text-red-400", queued: "bg-sky-500/20 text-sky-400", executing: "bg-orange-500/20 text-orange-400",
  partially_completed: "bg-yellow-500/20 text-yellow-400", completed: "bg-green-500/20 text-green-400", verified: "bg-teal-500/20 text-teal-400",
  failed: "bg-red-500/20 text-red-400", rolled_back: "bg-pink-500/20 text-pink-400", escalated: "bg-rose-500/20 text-rose-400", archived: "bg-gray-500/20 text-muted-foreground",
};

export default function ActionLineageExplorer() {
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [selected, setSelected] = useState<PersistedActionLineage | null>(null);

  const { data: actions = [], refetch } = useQuery({
    queryKey: ["action-lineage", domainFilter, stateFilter],
    queryFn: () => fetchActionLineage({
      domain: domainFilter !== "all" ? domainFilter : undefined,
      currentState: stateFilter !== "all" ? stateFilter as never : undefined,
      includeArchived: true,
      limit: 200,
    }),
    staleTime: 15000,
  });

  const { data: stuckActions = [] } = useQuery({ queryKey: ["stuck-actions"], queryFn: () => findStuckActions(), staleTime: 30000 });
  const { data: explanation } = useQuery({
    queryKey: ["action-explain", selected?.id],
    queryFn: () => selected ? getActionExplanation(selected.id) : Promise.resolve(null),
    enabled: !!selected,
  });

  const uniqueDomains = [...new Set(actions.map(a => a.domain))];
  const stateCounts: Record<string, number> = {};
  actions.forEach(a => { stateCounts[a.current_state] = (stateCounts[a.current_state] ?? 0) + 1; });

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <CPSSubNav />
<motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.04 } } }} className="space-y-4">
        <motion.div variants={fade} className="flex items-center gap-3">
          <GitBranch className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Action-State & Receipt Lineage</h1>
          <Badge>{actions.length} actions</Badge>
          {stuckActions.length > 0 && <Badge variant="destructive">{stuckActions.length} stuck</Badge>}
        </motion.div>

        {/* State distribution */}
        <motion.div variants={fade} className="flex flex-wrap gap-2">
          {Object.entries(stateCounts).map(([state, count]) => (
            <Badge key={state} className={`text-[10px] cursor-pointer ${STATE_COLORS[state] ?? ""}`} onClick={() => setStateFilter(state)}>
              {state}: {count}
            </Badge>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div variants={fade} className="flex gap-3">
          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Domain" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {uniqueDomains.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="State" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {Object.keys(STATE_COLORS).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="h-3 w-3 mr-1" />Refresh</Button>
        </motion.div>

        {/* Action Table */}
        <motion.div variants={fade}>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-border/50 text-muted-foreground">
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Domain</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">State</th>
                  <th className="p-3 text-left">Transitions</th>
                  <th className="p-3 text-left">Links</th>
                  <th className="p-3 text-left">Flags</th>
                  <th className="p-3 text-left">Updated</th>
                </tr></thead>
                <tbody>
                  {actions.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No action records</td></tr>}
                  {actions.map(action => (
                    <tr key={action.id} className="border-b border-border/20 hover:bg-muted/30 cursor-pointer" onClick={() => setSelected(action)}>
                      <td className="p-3 font-mono">{action.id.slice(0, 8)}</td>
                      <td className="p-3">{action.domain}</td>
                      <td className="p-3 text-muted-foreground">{action.action_type ?? "—"}</td>
                      <td className="p-3"><Badge className={`text-[10px] ${STATE_COLORS[action.current_state] ?? ""}`}>{action.current_state}</Badge></td>
                      <td className="p-3 text-muted-foreground">{action.state_history?.length ?? 0}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {(action.linked_event_ids?.length ?? 0) > 0 && <Badge variant="outline" className="text-[9px]"><Activity className="h-2 w-2 mr-0.5" />{action.linked_event_ids.length}</Badge>}
                          {(action.linked_policy_ids?.length ?? 0) > 0 && <Badge variant="outline" className="text-[9px]"><Shield className="h-2 w-2 mr-0.5" />{action.linked_policy_ids.length}</Badge>}
                          {(action.linked_receipt_ids?.length ?? 0) > 0 && <Badge variant="outline" className="text-[9px]"><FileText className="h-2 w-2 mr-0.5" />{action.linked_receipt_ids.length}</Badge>}
                          {(action.proof_ids?.length ?? 0) > 0 && <Badge variant="outline" className="text-[9px]"><Link2 className="h-2 w-2 mr-0.5" />{action.proof_ids.length}</Badge>}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {action.rollback_eligible && <Badge className="text-[9px] bg-amber-500/20 text-amber-400">rollback</Badge>}
                          {action.replayable && <Badge className="text-[9px] bg-blue-500/20 text-blue-400">replay</Badge>}
                          {action.stuck_since && <Badge variant="destructive" className="text-[9px]">stuck</Badge>}
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{new Date(action.updated_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detail + Explanation */}
        {selected && (
          <motion.div variants={fade}>
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Action: {selected.id.slice(0, 12)}... — {selected.domain}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>✕</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {/* State Timeline */}
                <div>
                  <p className="text-muted-foreground mb-2">State History:</p>
                  <div className="space-y-1">
                    {(selected.state_history ?? []).map((t: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-muted-foreground font-mono w-4">{i + 1}</span>
                        <Badge className={`text-[9px] ${STATE_COLORS[t.from] ?? ""}`}>{t.from}</Badge>
                        <span className="text-muted-foreground">→</span>
                        <Badge className={`text-[9px] ${STATE_COLORS[t.to] ?? ""}`}>{t.to}</Badge>
                        <span className="text-muted-foreground">{t.reason}</span>
                        <span className="ml-auto text-muted-foreground">{new Date(t.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Linked entities */}
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground">Advisor:</span> {selected.assigned_advisor ?? "—"}</div>
                  <div><span className="text-muted-foreground">Confidence:</span> {(selected.confidence_score * 100).toFixed(0)}%</div>
                  <div><span className="text-muted-foreground">Blocking:</span> {selected.blocking_reasons?.join(", ") || "None"}</div>
                  <div><span className="text-muted-foreground">Depends on:</span> {selected.depends_on?.length ?? 0} actions</div>
                </div>

                {/* Explanation linked data */}
                {explanation && (
                  <div className="space-y-2 border-t border-border/30 pt-2">
                    {(explanation.events?.length ?? 0) > 0 && (
                      <div>
                        <p className="text-muted-foreground mb-1">Linked Events ({explanation.events.length}):</p>
                        {explanation.events.slice(0, 5).map((e: Record<string, any>) => (
                          <Badge key={e.id} variant="outline" className="text-[9px] mr-1">{e.topic}</Badge>
                        ))}
                      </div>
                    )}
                    {(explanation.policies?.length ?? 0) > 0 && (
                      <div>
                        <p className="text-muted-foreground mb-1">Linked Policies ({explanation.policies.length}):</p>
                        {explanation.policies.slice(0, 5).map((p: Record<string, any>) => (
                          <Badge key={p.id} variant="outline" className="text-[9px] mr-1">{p.rule_name}: {p.effect}</Badge>
                        ))}
                      </div>
                    )}
                    {(explanation.receipts?.length ?? 0) > 0 && (
                      <div>
                        <p className="text-muted-foreground mb-1">Linked Receipts ({explanation.receipts.length}):</p>
                        {explanation.receipts.slice(0, 5).map((r: Record<string, any>) => (
                          <Badge key={r.id} variant="outline" className="text-[9px] mr-1">{r.action_type}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
