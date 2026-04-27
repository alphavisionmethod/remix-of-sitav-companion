import { useState } from "react";
import { Watch, Plus, RefreshCw, X, ShieldCheck } from "lucide-react";
// truth-allow: ia-config — PROVIDERS / STATUS_VARIANT below are static
// presentation catalogs (provider labels, badge variants), not telemetry.
import { useCreateWearableConnection, useRevokeWearable, useSyncEvents, useSyncWearable, useWearableConnections } from "@/modules/health/data/use-health-data";
import type { WearableProvider } from "@/modules/health/data/health-data-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const PROVIDERS: { id: WearableProvider; label: string }[] = [
  { id: "apple_health", label: "Apple Health" },
  { id: "google_fit", label: "Google Fit" },
  { id: "fitbit", label: "Fitbit" },
  { id: "oura", label: "Oura" },
  { id: "garmin", label: "Garmin" },
  { id: "whoop", label: "Whoop" },
  { id: "withings", label: "Withings" },
  { id: "custom", label: "Custom" },
];

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  connected: "default", pending: "secondary", revoked: "outline", error: "destructive",
};

export default function HealthWearables() {
  const { data: connections = [], isLoading } = useWearableConnections();
  const { data: syncs = [] } = useSyncEvents();
  const create = useCreateWearableConnection();
  const revoke = useRevokeWearable();
  const sync = useSyncWearable();
  const [provider, setProvider] = useState<WearableProvider>("oura");
  const [label, setLabel] = useState("");

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header className="flex items-center gap-3">
        <Watch className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold">Wearables</h1>
          <p className="text-sm text-muted-foreground">Connect devices. Every sync emits a Trust receipt.</p>
        </div>
      </header>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-4 w-4" />Add a connection</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={provider} onValueChange={(v) => setProvider(v as WearableProvider)}>
              <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Account label (optional)" value={label} onChange={(e) => setLabel(e.target.value)} className="sm:flex-1" />
            <Button
              onClick={() => { create.mutate({ provider, account_label: label || undefined }); setLabel(""); }}
              disabled={create.isPending}
            >Connect</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            High-risk action — your Authority setting determines if approval is required.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Your connections</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p>
           : connections.length === 0 ? <p className="text-sm text-muted-foreground">No wearables connected yet.</p>
           : (
            <div className="space-y-2">
              {connections.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {PROVIDERS.find(p => p.id === c.provider)?.label ?? c.provider}
                      {c.account_label && <span className="text-muted-foreground text-sm">· {c.account_label}</span>}
                      <Badge variant={STATUS_VARIANT[c.status]}>{c.status}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {c.last_sync_at ? `Last sync: ${new Date(c.last_sync_at).toLocaleString()}` : "Never synced"}
                      {c.error_message && <span className="text-destructive ml-2">· {c.error_message}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => sync.mutate(c.id)} disabled={sync.isPending || c.status === "revoked"}>
                      <RefreshCw className="h-3.5 w-3.5 mr-1" />Sync
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => revoke.mutate(c.id)} disabled={revoke.isPending || c.status === "revoked"}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent sync events</CardTitle></CardHeader>
        <CardContent>
          {syncs.length === 0 ? <p className="text-sm text-muted-foreground">No sync events yet.</p> : (
            <div className="space-y-1 text-sm">
              {syncs.slice(0, 10).map((s) => (
                <div key={s.id} className="flex justify-between border-b py-1.5 last:border-0">
                  <span>{new Date(s.started_at).toLocaleString()}</span>
                  <span className="text-muted-foreground">{s.signal_count} signals · {s.status}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}