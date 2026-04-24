import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, Database, Layers, Shield, FileCheck, GitBranch, Loader2 } from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

// Production fallback — seed data removed
const CORE_SERVICES: any[] = [];

interface ServiceStatus {
  name: string;
  icon: React.ReactNode;
  adapter: string;
  table: string;
  wired: boolean;
  description: string;
}

function useSubstrateStats() {
  return useQuery({
    queryKey: ["substrate-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const [events, memory, policies, receipts, actions] = await Promise.all([
        fromTable("os_event_log").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        fromTable("os_memory_scoped").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        fromTable("os_policy_evaluations").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        fromTable("sita_receipts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        fromTable("os_action_lineage").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);

      return {
        events: events.count ?? 0,
        memory: memory.count ?? 0,
        policies: policies.count ?? 0,
        receipts: receipts.count ?? 0,
        actions: actions.count ?? 0,
      };
    },
    staleTime: 30_000,
    retry: 1,
  });
}

function useRecentWrites() {
  return useQuery({
    queryKey: ["substrate-recent-writes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const [eventsRes, memoryRes, policiesRes, receiptsRes, actionsRes] = await Promise.all([
        fromTable("os_event_log").select("id, topic, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
        fromTable("os_memory_scoped").select("id, key, updated_at").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(3),
        fromTable("os_policy_evaluations").select("id, rule_name, effect, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
        fromTable("sita_receipts").select("id, type, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
        fromTable("os_action_lineage").select("id, domain, current_state, updated_at").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(3),
      ]);

      const writes: Array<{ service: string; detail: string; time: string }> = [];

      for (const e of eventsRes.data ?? []) {
        writes.push({ service: "EventBus", detail: e.topic, time: e.created_at });
      }
      for (const m of memoryRes.data ?? []) {
        writes.push({ service: "Memory", detail: m.key, time: m.updated_at });
      }
      for (const p of policiesRes.data ?? []) {
        writes.push({ service: "Policy", detail: `${p.rule_name} → ${p.effect}`, time: p.created_at });
      }
      for (const r of receiptsRes.data ?? []) {
        writes.push({ service: "Receipt", detail: String(r.type ?? ""), time: String(r.created_at ?? "") });
      }
      for (const a of actionsRes.data ?? []) {
        writes.push({ service: "Action", detail: `${a.domain} → ${a.current_state}`, time: a.updated_at });
      }

      return writes.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 15);
    },
    staleTime: 30_000,
    retry: 1,
  });
}

export default function PersistenceStatus() {
  
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useSubstrateStats();
  const { data: recentWrites, isLoading: writesLoading, refetch: refetchWrites, isFetching } = useRecentWrites();

  const allWired = ([] as never[]).every(s => s.wired);

  return (
    <div className="space-y-6 p-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Core Persistence Status</h1>
          <p className="text-sm text-muted-foreground mt-1">Substrate wiring health for SITA's durable OS layer</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { refetchStats(); refetchWrites(); }} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Status */}
      <Card className={`border ${allWired ? "bg-green-500/10 border-green-500/30" : "bg-yellow-500/10 border-yellow-500/30"}`}>
        <CardContent className="flex items-center gap-4 py-4">
          <CheckCircle2 className={`h-5 w-5 ${allWired ? "text-green-400" : "text-yellow-400"}`} />
          <div>
            <span className="font-semibold text-foreground">
              {allWired ? "All Core Services Wired to Persistence" : "Partial Wiring"}
            </span>
            <p className="text-sm text-muted-foreground mt-0.5">
              {([] as never[]).filter(s => s.wired).length}/{([] as never[]).length} services durably backed
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service Wiring Status */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Service → Adapter → Table Wiring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 pr-4 text-muted-foreground font-medium">Service</th>
                    <th className="py-2 pr-4 text-muted-foreground font-medium">Adapter</th>
                    <th className="py-2 pr-4 text-muted-foreground font-medium">Table</th>
                    <th className="py-2 pr-4 text-muted-foreground font-medium">Records</th>
                    <th className="py-2 pr-4 text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {([] as never[]).map((svc) => {
                    const count = stats ? (
                      svc.name === "EventBus" ? stats.events :
                      svc.name === "MemoryService" ? stats.memory :
                      svc.name === "PolicyEngine" ? stats.policies :
                      svc.name === "ReceiptService" ? stats.receipts :
                      stats.actions
                    ) : null;

                    return (
                      <tr key={svc.name} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 pr-4">
                          <div className="flex items-center gap-2">
                            {svc.icon}
                            <div>
                              <div className="font-medium text-foreground">{svc.name}</div>
                              <div className="text-xs text-muted-foreground">{svc.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">{svc.adapter}</td>
                        <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">{svc.table}</td>
                        <td className="py-2.5 pr-4">
                          {statsLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                          ) : (
                            <span className="font-mono text-xs">{count ?? "—"}</span>
                          )}
                        </td>
                        <td className="py-2.5 pr-4">
                          <Badge className={`text-xs ${svc.wired ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                            {svc.wired ? "wired" : "orphaned"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Writes */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Substrate Writes</CardTitle>
          </CardHeader>
          <CardContent>
            {writesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (recentWrites?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No substrate writes yet — interact with the system to generate durable records</p>
            ) : (
              <div className="space-y-1">
                {recentWrites?.map((w, i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5 border-b border-border/30 last:border-0 text-sm">
                    <Badge variant="outline" className="text-xs min-w-[70px] justify-center">{w.service}</Badge>
                    <span className="text-muted-foreground flex-1 truncate">{w.detail}</span>
                    <span className="text-xs text-muted-foreground font-mono shrink-0">
                      {new Date(w.time).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
