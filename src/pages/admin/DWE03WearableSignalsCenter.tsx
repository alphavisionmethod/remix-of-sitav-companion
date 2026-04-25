import DWESubNav from "@/platform/admin/components/admin/DWESubNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, HeartPulse, Shield, Lock } from "lucide-react";
import { fromTable } from "@/lib/supabase-helpers";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import type { WearableProviderRow, WearableSignalRow, HealthSignalConsentRow, ReadinessStateRow } from "@/lib/types/dwe-types";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { DemoOnlyBanner } from "@/platform/trust/components/claim-safety/DemoOnlyBanner";

export default function DWE03WearableSignalsCenter() {
  const { user } = useAuth();

  const { data: providers = [] } = useQuery<WearableProviderRow[]>({
    queryKey: ["dwe03-providers", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await fromTable("wearable_providers").select("*").order("name");
      return (data ?? []) as WearableProviderRow[];
    },
  });

  const { data: signals = [] } = useQuery<WearableSignalRow[]>({
    queryKey: ["dwe03-signals", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await fromTable("wearable_signals").select("*").order("captured_at", { ascending: false }).limit(50);
      return (data ?? []) as WearableSignalRow[];
    },
  });

  const { data: consents = [] } = useQuery<HealthSignalConsentRow[]>({
    queryKey: ["dwe03-consents", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await fromTable("health_signal_consents").select("*");
      return (data ?? []) as HealthSignalConsentRow[];
    },
  });

  const { data: readiness = [] } = useQuery<ReadinessStateRow[]>({
    queryKey: ["dwe03-readiness", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await fromTable("readiness_states").select("*").order("created_at", { ascending: false }).limit(10);
      return (data ?? []) as ReadinessStateRow[];
    },
  });

  return (
    <div className="space-y-6 p-6">
      <DWESubNav />
      <DemoOnlyBanner surfaceId="DWE03" />
<div>
        <h1 className="text-2xl font-bold text-foreground">DWE03 — Wearable Signals & Readiness Center</h1>
        <p className="text-muted-foreground">Connected wearable providers, granted signals, readiness, privacy controls.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Wearable Providers</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{providers.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Recent Signals</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{signals.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Consents</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{consents.filter((c) => c.consented).length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Readiness Records</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{readiness.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5" /> Wearable Providers</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {providers.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <Activity className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.auth_method} · {(p.categories || []).join(", ")}</p>
                </div>
                <Badge variant="outline" className="text-xs">{p.launch_stage}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Health Signal Consents</CardTitle></CardHeader>
        <CardContent>
          {consents.length === 0 ? <p className="text-sm text-muted-foreground">No consents configured. Users will grant consent when connecting wearables.</p> : (
            <div className="space-y-2">
              {consents.map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <Shield className={`h-4 w-4 ${c.consented ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{c.consent_reason || "Health Signal"}</p>
                    <p className="text-xs text-muted-foreground">{c.consent_reason || "No reason provided"}</p>
                  </div>
                  <Badge variant={c.consented ? "default" : "secondary"} className="text-xs">{c.consented ? "Consented" : "Revoked"}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Readiness States</CardTitle></CardHeader>
        <CardContent>
          {readiness.length === 0 ? <p className="text-sm text-muted-foreground">No readiness records yet.</p> : (
            <div className="space-y-2">
              {readiness.map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Readiness: {r.readiness_level}</p>
                    <p className="text-xs text-muted-foreground">Energy: {r.energy_estimate} · Activity: {r.activity_state} · Confidence: {r.confidence}%</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
