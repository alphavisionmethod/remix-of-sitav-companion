import { useAction } from "@/hooks/use-action";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Plug, Shield, Activity, TestTube, Presentation, RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import CNSubNav from "@/components/admin/CNSubNav";
import { DEMO_VERIFICATION_CHECKS } from "@/data/seed/admin-platform";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { ConnectorStateBadge } from "@/components/primitives/status/ConnectorStateBadge";
const statusBadge = (ok: boolean, label: string) => (
  <Badge variant="outline" className={`text-[10px] ${ok ? "bg-emerald-500/15 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
    {ok ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
    {label}
  </Badge>
);

interface VerificationCheck {
  label: string;
  check: (data: { registry: any[]; accounts: any[]; tokens: any[]; receipts: any[]; oauthConfig: any }) => boolean;
}

export default function CN01ConnectorRealityOverview() {
  const queryClient = useQueryClient();

  const { data: registry = [] } = useQuery({
    queryKey: ["connector-registry"],
    queryFn: async () => {
      const { data } = await fromTable("connector_registry").select("*").order("connector_class");
      return data || [];
    },
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["connector-accounts"],
    queryFn: async () => {
      const { data } = await fromTable("connector_accounts").select("*");
      return data || [];
    },
  });

  const { data: tokens = [] } = useQuery({
    queryKey: ["connector-oauth-tokens"],
    queryFn: async () => {
      const { data } = await fromTable("connector_oauth_tokens").select("*");
      return data || [];
    },
  });

  const { data: receipts = [] } = useQuery({
    queryKey: ["connector-receipts-verify"],
    queryFn: async () => {
      const { data } = await fromTable("connector_receipts").select("*").order("created_at", { ascending: false }).limit(50);
      return data || [];
    },
  });

  const { data: oauthConfig } = useQuery({
    queryKey: ["oauth-config-admin"],
    queryFn: async () => {
      const { data } = await supabase.functions.invoke("connector-oauth", { body: { action: "check_config" } });
      return data;
    },
  });

  const { data: healthRecords = [] } = useQuery({
    queryKey: ["connector-health-latest"],
    queryFn: async () => {
      const { data } = await fromTable("connector_health_records").select("*").order("checked_at", { ascending: false }).limit(20);
      return data || [];
    },
  });

  const { data: readiness = [] } = useQuery({
    queryKey: ["connector-launch-readiness"],
    queryFn: async () => {
      const { data } = await fromTable("connector_launch_readiness").select("*");
      return data || [];
    },
  });

  const seedMutation = useAction("admin", "seed.run");

  const realConnectors = registry.filter((r: Record<string, any>) => r.connector_class === "real");
  const testConnectors = registry.filter((r: Record<string, any>) => r.connector_class === "internal_test");
  const demoConnectors = registry.filter((r: Record<string, any>) => r.connector_class === "demo");
  const connectedAccounts = accounts.filter((a: Record<string, any>) => a.status === "connected" || a.status === "demo_simulated" || a.status === "internal_test");

  const verificationData = { registry, accounts, tokens, receipts, oauthConfig };
  const passedChecks = ([] as typeof DEMO_VERIFICATION_CHECKS).filter((c) => c.check(verificationData)).length;

  const failureGroups = [
    { type: "Missing OAuth Config", count: oauthConfig?.google_oauth_configured ? 0 : 1, icon: <AlertTriangle className="h-3 w-3" /> },
    { type: "Callback Failures", count: receipts.filter((r: Record<string, any>) => r.event_type === "oauth_connect" && r.status === "failed").length, icon: <XCircle className="h-3 w-3" /> },
    { type: "Token Expired", count: tokens.filter((t: Record<string, any>) => t.expires_at && new Date(t.expires_at) < new Date()).length, icon: <XCircle className="h-3 w-3" /> },
    { type: "Reauth Required", count: accounts.filter((a: Record<string, any>) => a.status === "reauth_required").length, icon: <AlertTriangle className="h-3 w-3" /> },
    { type: "Disconnected", count: accounts.filter((a: Record<string, any>) => a.status === "disconnected").length, icon: <XCircle className="h-3 w-3" /> },
  ];

  return (
    <div className="space-y-6 p-6">
      <CNSubNav />
<h1 className="sr-only">Connector Reality Overview</h1>
      <div className="flex items-center gap-3">
        <Button onClick={() => seedMutation.mutate({})} disabled={seedMutation.isPending} size="sm" variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${seedMutation.isPending ? "animate-spin" : ""}`} />
          {registry.length === 0 ? "Seed Registry" : "Re-Seed Registry"}
        </Button>
      </div>

      {/* OAuth Verification Matrix */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            OAuth Runtime Verification Matrix
            <Badge variant="outline" className={passedChecks === ([] as typeof DEMO_VERIFICATION_CHECKS).length ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}>
              {passedChecks}/{([] as typeof DEMO_VERIFICATION_CHECKS).length} passed
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {([] as typeof DEMO_VERIFICATION_CHECKS).map((check) => {
              const passed = check.check(verificationData);
              return (
                <div key={check.label} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border">
                  {passed ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-destructive" />}
                  <span className="text-xs font-medium">{check.label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

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

      <Tabs defaultValue="capabilities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="capabilities">Per-Capability Matrix</TabsTrigger>
          <TabsTrigger value="accounts">Connected Accounts</TabsTrigger>
          <TabsTrigger value="registry">Registry</TabsTrigger>
          <TabsTrigger value="failures">Failure Diagnostics</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        <TabsContent value="capabilities">
          <Card>
            <CardHeader><CardTitle className="text-sm">Capability Verification Matrix</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Capability</TableHead>
                    <TableHead>OAuth Client</TableHead>
                    <TableHead>Callback</TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead>Connected</TableHead>
                    <TableHead>Reauth</TableHead>
                    <TableHead>Disconnect</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {([] as typeof DEMO_CAPABILITIES).map((cap) => {
                    const capTokens = tokens.filter((t: Record<string, any>) => t.scopes?.some((s: string) => cap.scopes.some((cs) => s.includes(cs))));
                    const hasCallback = receipts.some((r: Record<string, any>) => r.event_type === "oauth_connect");
                    const hasDisconnect = receipts.some((r: Record<string, any>) => r.event_type === "disconnect");
                    const capAccounts = accounts.filter((a: Record<string, any>) => a.provider === "google");
                    const isConnected = capAccounts.some((a: Record<string, any>) => a.status === "connected");
                    const hasReauth = capTokens.some((t: Record<string, any>) => t.refresh_token);
                    const oauthOk = oauthConfig?.google_oauth_configured === true;
                    const status = isConnected ? "live_verified" : oauthOk ? "partial" : "not_configured";
                    return (
                      <TableRow key={cap.key}>
                        <TableCell className="font-medium text-sm">{cap.label}</TableCell>
                        <TableCell>{statusBadge(oauthOk, oauthOk ? "Yes" : "No")}</TableCell>
                        <TableCell>{statusBadge(hasCallback, hasCallback ? "Verified" : "—")}</TableCell>
                        <TableCell>{statusBadge(capTokens.length > 0, capTokens.length > 0 ? "Stored" : "—")}</TableCell>
                        <TableCell>{statusBadge(isConnected, isConnected ? "Yes" : "No")}</TableCell>
                        <TableCell>{statusBadge(hasReauth, hasReauth ? "Yes" : "—")}</TableCell>
                        <TableCell>{statusBadge(hasDisconnect, hasDisconnect ? "Yes" : "—")}</TableCell>
                        <TableCell><ConnectorStateBadge state={status} size="xs" /></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts">
          <Card>
            <CardHeader><CardTitle className="text-sm">Connected Account Diagnostics</CardTitle></CardHeader>
            <CardContent>
              {accounts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No connected accounts.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scopes</TableHead>
                      <TableHead>Last Auth</TableHead>
                      <TableHead>Token Expiry</TableHead>
                      <TableHead>Reauth</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((a: Record<string, any>) => {
                      const token = tokens.find((t: Record<string, any>) => t.connector_account_id === a.id);
                      const needsReauth = a.status === "reauth_required";
                      const isDegraded = a.status === "degraded";
                      const handleReconnect = async () => {
                        const { data, error } = await supabase.functions.invoke("connector-oauth", {
                          body: { action: "reconnect", account_id: a.id },
                        });
                        if (error || !data?.success) {
                          toast.error(`Reconnect failed: ${error?.message ?? data?.error ?? "unknown"}`);
                          return;
                        }
                        toast.success("Reconnect initiated — redirecting to provider…");
                        if (data.authorization_url) {
                          window.location.href = data.authorization_url;
                        }
                        queryClient.invalidateQueries({ queryKey: ["connector-accounts"] });
                      };
                      const handleDisengageFallback = async () => {
                        const { disengageFakeMode } = await import(
                          "@/lib/services/connector-control-plane/connector-fake-mode.service"
                        );
                        await disengageFakeMode(a.id, a.connector_type);
                        toast.success("Fallback mode disengaged");
                        queryClient.invalidateQueries({ queryKey: ["connector-accounts"] });
                      };
                      return (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium text-sm">{a.provider || a.connector_type || "—"}</TableCell>
                          <TableCell><ConnectorStateBadge state={a.status} size="xs" /></TableCell>
                          <TableCell className="text-xs max-w-[200px] truncate">{token?.scopes?.join(", ") || "—"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{a.connected_at ? new Date(a.connected_at).toLocaleString() : "—"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{token?.expires_at ? new Date(token.expires_at).toLocaleString() : "—"}</TableCell>
                          <TableCell>{statusBadge(needsReauth, needsReauth ? "Required" : "OK")}</TableCell>
                          <TableCell>
                            {needsReauth && (
                              <Button size="sm" variant="outline" onClick={handleReconnect}>
                                <RefreshCw className="h-3 w-3 mr-1" /> Reconnect
                              </Button>
                            )}
                            {isDegraded && (
                              <Button size="sm" variant="outline" onClick={handleDisengageFallback}>
                                Disengage Fallback
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registry">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-lg">Connector Registry</CardTitle></CardHeader>
            <CardContent>
              {registry.length === 0 ? (
                <p className="text-sm text-muted-foreground">No connectors registered.</p>
              ) : (
                <div className="space-y-3">
                  {registry.map((c: Record<string, any>) => {
                    const lr = readiness.find((r: Record<string, any>) => r.registry_id === c.id);
                    return (
                      <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                        <div className="flex items-center gap-3">
                          <Plug className="h-4 w-4" />
                          <div>
                            <p className="font-medium text-sm">{c.display_name}</p>
                            <p className="text-xs text-muted-foreground">{c.provider} · {c.auth_method} · {c.connector_class}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">{c.launch_stage}</Badge>
                          {lr && (
                            <div className="flex items-center gap-1">
                              {lr.oauth_working ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-destructive" />}
                              {lr.sync_working ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-destructive" />}
                              {lr.health_reporting ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-destructive" />}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failures">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" />Failure Diagnostics</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {failureGroups.map((fg) => (
                  <div key={fg.type} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center gap-2">
                      {fg.icon}
                      <span className="text-sm font-medium">{fg.type}</span>
                    </div>
                    <Badge variant={fg.count > 0 ? "destructive" : "outline"}>{fg.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health">
          {healthRecords.length > 0 ? (
            <Card className="bg-card border-border">
              <CardHeader><CardTitle className="text-lg">Recent Health Checks</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {healthRecords.slice(0, 10).map((h: Record<string, any>) => (
                    <div key={h.id} className="flex items-center justify-between p-2 rounded bg-muted/20">
                      <ConnectorStateBadge state={h.health_status} size="xs" />
                      <span className="text-xs text-muted-foreground">{h.latency_ms ? `${h.latency_ms}ms` : "—"}</span>
                      <span className="text-xs text-muted-foreground">{new Date(h.checked_at).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">No health checks recorded yet.</p></CardContent></Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
