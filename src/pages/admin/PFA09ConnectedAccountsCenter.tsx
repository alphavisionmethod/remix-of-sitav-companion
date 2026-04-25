import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { User, Shield, Link2, CheckCircle, XCircle, AlertTriangle, ArrowUpCircle } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const statusColors: Record<string, string> = { connected: "bg-green-500/20 text-green-400", disconnected: "bg-muted text-muted-foreground", error: "bg-red-500/20 text-red-400" };
const healthIcons: Record<string, React.ReactNode> = { healthy: <CheckCircle className="h-4 w-4 text-green-400" />, degraded: <AlertTriangle className="h-4 w-4 text-yellow-400" />, error: <XCircle className="h-4 w-4 text-red-400" />, unknown: <div className="h-4 w-4 rounded-full bg-muted-foreground/30" /> };

export default function PFA09ConnectedAccountsCenter() {
  const { data: identities = [] } = useQuery({
    queryKey: ["identity-links"],
    queryFn: async () => { const { data } = await fromTable("identity_provider_links").select("*, provider_families(name, provider_key)").order("created_at"); return data || []; },
  });

  const { data: services = [] } = useQuery({
    queryKey: ["service-links"],
    queryFn: async () => { const { data } = await fromTable("connected_service_links").select("*, provider_families(name, provider_key), provider_capabilities(display_name, capability_key, category)").order("created_at"); return data || []; },
  });

  const { data: families = [] } = useQuery({
    queryKey: ["provider-families"],
    queryFn: async () => { const { data } = await fromTable("provider_families").select("*").eq("active", true).order("name"); return data || []; },
  });

  const { data: levels = [] } = useQuery({
    queryKey: ["permission-levels"],
    queryFn: async () => { const { data } = await fromTable("permission_levels").select("*, provider_capabilities(display_name)"); return data || []; },
  });

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
<div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><User className="h-6 w-6" /> Connected Accounts</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your identity providers and connected services</p>
      </div>

      {/* Identity Section */}
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Sign-In Identity</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {identities.length > 0 ? identities.map((id: Record<string, any>) => (
            <div key={id.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/10 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">{id.provider_families?.name?.charAt(0)}</div>
                <div>
                  <p className="text-sm font-medium">{id.provider_families?.name} Sign-In</p>
                  <p className="text-xs text-muted-foreground">{id.email || "No email"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {id.primary_identity && <Badge className="bg-primary/20 text-primary text-xs">Primary</Badge>}
                {id.active ? <CheckCircle className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-red-400" />}
              </div>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground text-center py-4">No identity providers linked yet</p>
          )}
        </CardContent>
      </Card>

      {/* Connected Services */}
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="flex items-center gap-2"><Link2 className="h-5 w-5" /> Connected Services</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {services.length > 0 ? services.map((svc: Record<string, any>) => {
            const level = levels.find((l: Record<string, any>) => l.provider_capability_id === svc.provider_capability_id);
            return (
              <div key={svc.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/10 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold">{svc.provider_families?.name?.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-medium">{svc.provider_capabilities?.display_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{svc.provider_families?.name}</span>
                      <Badge variant="outline" className="text-xs">{svc.permission_level}</Badge>
                      {svc.mode !== "real" && <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">{svc.mode}</Badge>}
                    </div>
                    {svc.granted_scopes?.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">{svc.granted_scopes.length} scopes granted</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {healthIcons[svc.health_status] || healthIcons.unknown}
                  <Badge className={statusColors[svc.connection_status] || ""}>{svc.connection_status}</Badge>
                  {svc.reauth_needed && <AlertTriangle className="h-4 w-4 text-yellow-400" />}
                  {level?.upgrade_available && <ArrowUpCircle className="h-4 w-4 text-blue-400" />}
                </div>
              </div>
            );
          }) : (
            <p className="text-sm text-muted-foreground text-center py-4">No services connected yet</p>
          )}
        </CardContent>
      </Card>

      {/* Available Providers */}
      {families.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Available Providers</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {families.map((f: Record<string, any>) => {
                const hasIdentity = identities.some((i: Record<string, any>) => i.provider_family_id === f.id);
                const connectedServices = services.filter((s: Record<string, any>) => s.provider_family_id === f.id);
                return (
                  <div key={f.id} className="p-3 rounded-lg border border-border bg-muted/5 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">{f.name.charAt(0)}</div>
                      <span className="text-sm font-medium">{f.name}</span>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {(f.categories || []).slice(0, 3).map((c: string) => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {hasIdentity && "✓ Identity"} {connectedServices.length > 0 && `✓ ${connectedServices.length} services`}
                      {!hasIdentity && connectedServices.length === 0 && <Badge variant="outline" className="text-xs">{f.launch_stage}</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
