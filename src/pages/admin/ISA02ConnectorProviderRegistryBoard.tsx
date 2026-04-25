import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { dbAny as db } from "@/lib/supabase-helpers";
import { fromTable } from "@/lib/supabase-helpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plug, CheckCircle, XCircle, AlertTriangle, RefreshCw, HardDrive, Mail, Calendar } from "lucide-react";
import { getRelation, parseProviderFamilyRef, parseProviderCapabilityRef } from "@/lib/types/relation-parsers";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const categoryIcons: Record<string, React.ReactNode> = {
  storage: <HardDrive className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  calendar: <Calendar className="h-4 w-4" />,
};

const healthColors: Record<string, string> = {
  healthy: "bg-green-500/20 text-green-400",
  degraded: "bg-yellow-500/20 text-yellow-400",
  error: "bg-red-500/20 text-red-400",
  unknown: "bg-muted text-muted-foreground",
};

export default function ISA02ConnectorProviderRegistryBoard() {
  const { data: capabilities = [] } = useQuery({
    queryKey: ["isa02-capabilities"],
    queryFn: async () => {
      const { data } = await db.from("provider_capabilities")
        .select("*, provider_families(name, provider_key)")
        .order("display_name");
      return data || [];
    },
  });

  const { data: services = [] } = useQuery({
    queryKey: ["isa02-connected-services"],
    queryFn: async () => {
      const { data } = await db.from("connected_service_links")
        .select("*, provider_families(name), provider_capabilities(display_name, capability_key, category)")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: permissions = [] } = useQuery({
    queryKey: ["isa02-permissions"],
    queryFn: async () => {
      const { data } = await fromTable("permission_levels").select("*");
      return data || [];
    },
  });

  const connectedCount = services.filter((s: Record<string, any>) => s.status === "connected").length;
  const errorCount = services.filter((s: Record<string, any>) => s.health_state === "error").length;
  const categories = [...new Set(capabilities.map((c: Record<string, any>) => c.category))];

  return (
    <div className="space-y-6 p-6">
<div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Plug className="h-6 w-6 text-primary" /> Connector Provider Registry
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          External service access only — what services the user CONNECTS. Not identity/login.
        </p>
      </div>

      {/* Separation Callout */}
      <Card className="bg-green-500/5 border-green-500/20">
        <CardContent className="pt-4 flex items-start gap-3">
          <Plug className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-300">Connector ≠ Identity</p>
            <p className="text-xs text-muted-foreground mt-1">
              Connecting Google Drive is an explicit user action. It is never granted automatically by signing in with Google.
              Each connector has its own scopes, tokens, health, and consent lifecycle.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Connector Capabilities</p>
          <p className="text-2xl font-bold">{capabilities.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Connected Services</p>
          <p className="text-2xl font-bold">{connectedCount}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Categories</p>
          <p className="text-2xl font-bold">{categories.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Health Errors</p>
          <p className="text-2xl font-bold text-red-400">{errorCount}</p>
        </CardContent></Card>
      </div>

      {/* Capability Registry */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Connector Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Family</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Auth Type</TableHead>
                <TableHead>Sync</TableHead>
                <TableHead>Launch Stage</TableHead>
                <TableHead>Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {capabilities.map((cap: Record<string, any>) => (
                <TableRow key={cap.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {categoryIcons[cap.category] || <Plug className="h-4 w-4" />}
                    {cap.display_name}
                  </TableCell>
                  <TableCell>{getRelation(cap, "provider_families", parseProviderFamilyRef).name || "—"}</TableCell>
                  <TableCell><Badge variant="outline">{cap.category}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{cap.auth_type || "oauth2"}</TableCell>
                  <TableCell>
                    {cap.sync_support
                      ? <RefreshCw className="h-4 w-4 text-green-400" />
                      : <XCircle className="h-4 w-4 text-muted-foreground" />}
                  </TableCell>
                  <TableCell><Badge variant="outline">{cap.launch_stage || "planned"}</Badge></TableCell>
                  <TableCell>
                    {cap.active !== false
                      ? <CheckCircle className="h-4 w-4 text-green-400" />
                      : <XCircle className="h-4 w-4 text-red-400" />}
                  </TableCell>
                </TableRow>
              ))}
              {capabilities.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No connector capabilities registered. Seed data to populate.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Connected Service Links */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Connected Service Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {services.map((svc: Record<string, any>) => (
                <Card key={svc.id} className="bg-muted/30 border-border">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">
                        {getRelation(svc, "provider_capabilities", parseProviderCapabilityRef).display_name || svc.account_label || "Service"}
                      </p>
                      <Badge className={healthColors[svc.health_state || "unknown"]}>
                        {svc.health_state || "unknown"}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>Family: {getRelation(svc, "provider_families", parseProviderFamilyRef).name || "—"}</p>
                      <p>Mode: <Badge variant="outline" className="text-xs ml-1">{svc.mode || "real"}</Badge></p>
                      <p>Access: <Badge variant="outline" className="text-xs ml-1">{svc.read_write_mode || "read_only"}</Badge></p>
                      {svc.last_sync_at && <p>Last sync: {new Date(svc.last_sync_at).toLocaleDateString()}</p>}
                    </div>
                    {svc.reauth_required && (
                      <div className="mt-2 flex items-center gap-1 text-yellow-400 text-xs">
                        <AlertTriangle className="h-3 w-3" /> Reauth required
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6">No connected services</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
