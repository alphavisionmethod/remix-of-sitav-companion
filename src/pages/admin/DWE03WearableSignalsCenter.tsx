import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, HeartPulse, Shield, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

export default function DWE03WearableSignalsCenter() {
  const { isDemoMode } = useDataMode();
  const [providers, setProviders] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [consents, setConsents] = useState<any[]>([]);
  const [readiness, setReadiness] = useState<any[]>([]);

  useEffect(() => {
    fromTable("wearable_providers").select("*").order("name").then(({ data }: any) => setProviders(data || []));
    fromTable("wearable_signals").select("*").order("captured_at", { ascending: false }).limit(50).then(({ data }: any) => setSignals(data || []));
    fromTable("health_signal_consents").select("*").then(({ data }: any) => setConsents(data || []));
    fromTable("readiness_states").select("*").order("created_at", { ascending: false }).limit(10).then(({ data }: any) => setReadiness(data || []));
  }, []);

  return (
    <div className="space-y-6 p-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground">DWE03 — Wearable Signals & Readiness Center</h1>
        <p className="text-muted-foreground">Connected wearable providers, granted signals, readiness, privacy controls.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Wearable Providers</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{providers.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Recent Signals</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{signals.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Consents</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{consents.filter((c: any) => c.mode === "active").length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Readiness Records</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{readiness.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5" /> Wearable Providers</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {providers.map((p: any) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <Activity className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.auth_method} · {(p.categories_supported || []).join(", ")}</p>
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
              {consents.map((c: any) => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <Shield className={`h-4 w-4 ${c.mode === "active" ? "text-green-500" : "text-muted-foreground"}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{c.provider_key}</p>
                    <p className="text-xs text-muted-foreground">{(c.signal_types_allowed || []).join(", ")}</p>
                  </div>
                  <Badge variant={c.mode === "active" ? "default" : "secondary"} className="text-xs">{c.mode}</Badge>
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
              {readiness.map((r: any) => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Readiness: {r.readiness_level}</p>
                    <p className="text-xs text-muted-foreground">Workload: {r.workload_tolerance} · Interruption: {r.interruption_sensitivity} · Confidence: {r.confidence}%</p>
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