import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, ShieldAlert, Activity, Clock, RefreshCw } from "lucide-react";

interface IncidentRow {
  id: string;
  subsystem: string;
  symptom: string;
  severity: string;
  runbook_ref: string | null;
  suggested_kill_switch: string | null;
  created_at: string;
  status: string | null;
}

interface KillSwitchAuditRow {
  id: string;
  switch_id: string;
  action: string;
  reason: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

const sevTone = (s: string) =>
  s === "critical" || s === "severe" ? "destructive"
  : s === "error" ? "destructive"
  : s === "warning" ? "secondary"
  : "outline";

export default function IncidentDashboardPage() {
  const [incidents, setIncidents] = useState<IncidentRow[]>([]);
  const [audit, setAudit] = useState<KillSwitchAuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [incRes, ksRes] = await Promise.all([
        supabase
          .from("incident_classifications" as never)
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100) as unknown as Promise<{ data: IncidentRow[] | null; error: unknown }>,
        supabase
          .from("kill_switch_audit_log" as never)
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100) as unknown as Promise<{ data: KillSwitchAuditRow[] | null; error: unknown }>,
      ]);
      if (incRes.data) setIncidents(incRes.data);
      if (ksRes.data) setAudit(ksRes.data);
      setLastFetch(new Date());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    const i = setInterval(load, 30_000);
    return () => clearInterval(i);
  }, []);

  const stats = useMemo(() => ({
    open: incidents.filter((i) => i.status !== "resolved").length,
    critical: incidents.filter((i) => i.severity === "critical" || i.severity === "severe").length,
    activations24h: audit.filter(
      (a) => a.action === "activated" && new Date(a.created_at).getTime() > Date.now() - 86_400_000,
    ).length,
  }), [incidents, audit]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Incident Dashboard</h1>
          <p className="text-muted-foreground">
            Live operator view of incident classifications + kill-switch activations.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Open incidents
            </CardTitle>
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{stats.open}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" /> Critical (last 24h)
            </CardTitle>
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{stats.critical}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" /> Switch activations (24h)
            </CardTitle>
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{stats.activations24h}</div></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="incidents">
        <TabsList>
          <TabsTrigger value="incidents">Incidents ({incidents.length})</TabsTrigger>
          <TabsTrigger value="switches">Kill-switch audit ({audit.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="incidents">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[480px]">
                <div className="divide-y">
                  {incidents.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      No incidents recorded yet.
                    </div>
                  )}
                  {incidents.map((i) => (
                    <div key={i.id} className="p-4 hover:bg-accent/30 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={sevTone(i.severity)}>{i.severity}</Badge>
                            <span className="font-medium">{i.subsystem}</span>
                            <span className="text-muted-foreground">·</span>
                            <span>{i.symptom}</span>
                          </div>
                          {(i.runbook_ref || i.suggested_kill_switch) && (
                            <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                              {i.runbook_ref && <span>📘 {i.runbook_ref}</span>}
                              {i.suggested_kill_switch && <span>🛑 {i.suggested_kill_switch}</span>}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                          <Clock className="h-3 w-3" />
                          {new Date(i.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="switches">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[480px]">
                <div className="divide-y">
                  {audit.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      No kill-switch activity recorded.
                    </div>
                  )}
                  {audit.map((a) => (
                    <div key={a.id} className="p-4 hover:bg-accent/30 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={a.action === "activated" ? "destructive" : "outline"}>
                              {a.action}
                            </Badge>
                            <span className="font-mono text-sm">{a.switch_id}</span>
                          </div>
                          {a.reason && (
                            <p className="mt-1 text-sm text-muted-foreground">{a.reason}</p>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                          <Clock className="h-3 w-3" />
                          {new Date(a.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {lastFetch && (
        <p className="text-xs text-muted-foreground text-right">
          Updated {lastFetch.toLocaleTimeString()} · auto-refreshes every 30s
        </p>
      )}
    </div>
  );
}
