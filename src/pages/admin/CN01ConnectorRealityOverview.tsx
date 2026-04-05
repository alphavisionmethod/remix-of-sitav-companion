import React, { useState } from "react";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plug, Shield, Activity, TestTube, Presentation, RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  healthy: "bg-green-500/20 text-green-400", connected: "bg-green-500/20 text-green-400",
  degraded: "bg-yellow-500/20 text-yellow-400", reauth_required: "bg-orange-500/20 text-orange-400",
  unhealthy: "bg-red-500/20 text-red-400", token_expired: "bg-red-500/20 text-red-400",
  demo_simulated: "bg-purple-500/20 text-purple-400", internal_test: "bg-blue-500/20 text-blue-400",
  shell_only: "bg-muted text-muted-foreground", not_configured: "bg-muted text-muted-foreground",
};

const classIcons: Record<string, React.ReactNode> = {
  real: <Plug className="h-4 w-4" />, user_linked: <Shield className="h-4 w-4" />,
  internal_test: <TestTube className="h-4 w-4" />, demo: <Presentation className="h-4 w-4" />,
};

export default function CN01ConnectorRealityOverview() {
  const queryClient = useQueryClient();

  const { data: registry = [] } = useQuery({
    queryKey: ["connector-registry"],
    queryFn: async () => {
      const { data } = await supabase.from("connector_registry").select("*").order("connector_class");
      return data || [];
    },
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["connector-accounts"],
    queryFn: async () => {
      const { data } = await supabase.from("connector_accounts").select("*");
      return data || [];
    },
  });

  const { data: healthRecords = [] } = useQuery({
    queryKey: ["connector-health-latest"],
    queryFn: async () => {
      const { data } = await supabase.from("connector_health_records").select("*").order("checked_at", { ascending: false }).limit(20);
      return data || [];
    },
  });

  const { data: readiness = [] } = useQuery({
    queryKey: ["connector-launch-readiness"],
    queryFn: async () => {
      const { data } = await supabase.from("connector_launch_readiness").select("*");
      return data || [];
    },
  });

  const seedMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("connector-operations", { body: { action: "seed_registry" } });
      if (error) throw error;
      return data;
    },
    onSuccess: () => { toast.success("Connector registry seeded"); queryClient.invalidateQueries({ queryKey: ["connector-registry"] }); queryClient.invalidateQueries({ queryKey: ["connector-launch-readiness"] }); },
    onError: (e: any) => toast.error(`Seed failed: ${e.message}`),
  });

  const realConnectors = registry.filter((r: any) => r.connector_class === "real");
  const testConnectors = registry.filter((r: any) => r.connector_class === "internal_test");
  const demoConnectors = registry.filter((r: any) => r.connector_class === "demo");
  const connectedAccounts = accounts.filter((a: any) => a.status === "connected" || a.status === "demo_simulated" || a.status === "internal_test");

  return (
    <AdminPageLayout
      title="Connector Reality Overview"
      description="Real connectors, demo connectors, internal test connectors, linked accounts, sync health, and launch honesty."
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending} size="sm" variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${seedMutation.isPending ? "animate-spin" : ""}`} />
            {registry.length === 0 ? "Seed Registry" : "Re-Seed Registry"}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border"><CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Plug className="h-4 w-4" /> Real Connectors</div>
            <p className="text-2xl font-bold mt-1">{realConnectors.length}</p>
          </CardContent></Card>
          <Card className="bg-card border-border"><CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><TestTube className="h-4 w-4" /> Test Connectors</div>
            <p className="text-2xl font-bold mt-1">{testConnectors.length}</p>
          </CardContent></Card>
          <Card className="bg-card border-border"><CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Presentation className="h-4 w-4" /> Demo Connectors</div>
            <p className="text-2xl font-bold mt-1">{demoConnectors.length}</p>
          </CardContent></Card>
          <Card className="bg-card border-border"><CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Activity className="h-4 w-4" /> Linked Accounts</div>
            <p className="text-2xl font-bold mt-1">{connectedAccounts.length}</p>
          </CardContent></Card>
        </div>

        {/* Registry */}
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-lg">Connector Registry</CardTitle></CardHeader>
          <CardContent>
            {registry.length === 0 ? (
              <p className="text-sm text-muted-foreground">No connectors registered. Click "Seed Registry" to initialize.</p>
            ) : (
              <div className="space-y-3">
                {registry.map((c: any) => {
                  const lr = readiness.find((r: any) => r.registry_id === c.id);
                  return (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center gap-3">
                        {classIcons[c.connector_class] || <Plug className="h-4 w-4" />}
                        <div>
                          <p className="font-medium text-sm">{c.display_name}</p>
                          <p className="text-xs text-muted-foreground">{c.provider} · {c.auth_method} · {c.connector_class}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={statusColors[c.launch_stage] || ""}>{c.launch_stage}</Badge>
                        {lr && (
                          <div className="flex items-center gap-1">
                            {lr.oauth_working ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-red-400" />}
                            {lr.sync_working ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-red-400" />}
                            {lr.health_reporting ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-red-400" />}
                          </div>
                        )}
                        {c.read_supported && <Badge variant="secondary" className="text-xs">Read</Badge>}
                        {c.write_supported && <Badge variant="secondary" className="text-xs">Write</Badge>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Summary */}
        {healthRecords.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-lg">Recent Health Checks</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {healthRecords.slice(0, 10).map((h: any) => (
                  <div key={h.id} className="flex items-center justify-between p-2 rounded bg-muted/20">
                    <Badge className={statusColors[h.health_status] || ""}>{h.health_status}</Badge>
                    <span className="text-xs text-muted-foreground">{h.latency_ms ? `${h.latency_ms}ms` : "—"}</span>
                    <span className="text-xs text-muted-foreground">{new Date(h.checked_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminPageLayout>
  );
}
