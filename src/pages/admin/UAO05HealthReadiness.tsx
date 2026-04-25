import UAOSubNav from "@/platform/admin/components/admin/UAOSubNav";
import { useAction } from "@/hooks/use-action";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Heart, RefreshCw, CheckCircle, XCircle, Shield } from "lucide-react";
import { toast } from "sonner";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



export default function UAO05HealthReadiness() {
  const queryClient = useQueryClient();

  const { data: consents = [] } = useQuery({
    queryKey: ["health-consents"],
    queryFn: async () => { const { data } = await fromTable("health_signal_consents").select("*, wearable_providers(name)").order("signal_category"); return data || []; },
  });

  const { data: privacy = [] } = useQuery({
    queryKey: ["health-privacy"],
    queryFn: async () => { const { data } = await fromTable("health_signal_privacy").select("*").order("signal_category"); return data || []; },
  });

  const { data: signals = [] } = useQuery({
    queryKey: ["wearable-signals"],
    queryFn: async () => { const { data } = await fromTable("wearable_signals").select("*, wearable_providers(name)").order("recorded_at", { ascending: false }).limit(30); return data || []; },
  });

  const { data: readiness = [] } = useQuery({
    queryKey: ["readiness-states"],
    queryFn: async () => { const { data } = await fromTable("readiness_states").select("*").order("updated_at", { ascending: false }).limit(5); return data || []; },
  });

  const checkReadiness = useAction("admin", "health.check-readiness");

  const current = readiness[0];
  const consentedCount = consents.filter((c: Record<string, any>) => c.consented).length;

  return (
    <div className="space-y-6 p-6">
      <UAOSubNav />
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Heart className="h-6 w-6" /> Health & Readiness Signals</h1>
          <p className="text-sm text-muted-foreground mt-1">Signal sources, consent, readiness, and privacy controls</p>
        </div>
        <Button onClick={() => checkReadiness.mutate({})} disabled={checkReadiness.isPending} size="sm" variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${checkReadiness.isPending ? "animate-spin" : ""}`} /> Check Readiness
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Readiness</p><p className="text-2xl font-bold">{current?.readiness_level || "—"}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Interruption</p><p className="text-2xl font-bold">{current?.interruption_tolerance || "—"}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Consented Signals</p><p className="text-2xl font-bold text-green-400">{consentedCount}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Recent Signals</p><p className="text-2xl font-bold">{signals.length}</p></CardContent></Card>
      </div>

      {consents.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Signal Consents</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Provider</TableHead><TableHead>Consented</TableHead><TableHead>Retention</TableHead><TableHead>Advisors</TableHead><TableHead>Routing</TableHead><TableHead>Visibility</TableHead></TableRow></TableHeader>
              <TableBody>
                {consents.map((c: Record<string, any>) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.signal_category}</TableCell>
                    <TableCell className="text-xs">{c.wearable_providers?.name || "—"}</TableCell>
                    <TableCell>{c.consented ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-red-400" />}</TableCell>
                    <TableCell className="text-xs">{c.data_retention_days}d</TableCell>
                    <TableCell>{c.share_with_advisors ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{c.share_with_routing ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{c.visibility}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {privacy.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Privacy Settings</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Privacy Tier</TableHead><TableHead>Local Only</TableHead><TableHead>Anonymize</TableHead><TableHead>Redact Export</TableHead><TableHead>Boardroom</TableHead><TableHead>Timeline</TableHead></TableRow></TableHeader>
              <TableBody>
                {privacy.map((p: Record<string, any>) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.signal_category}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{p.privacy_tier}</Badge></TableCell>
                    <TableCell>{p.local_only ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{p.anonymize ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{p.redact_from_exports ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{p.visible_in_boardroom ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{p.visible_in_timeline ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {signals.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Recent Signals</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Value</TableHead><TableHead>Unit</TableHead><TableHead>Quality</TableHead><TableHead>Provider</TableHead><TableHead>Recorded</TableHead></TableRow></TableHeader>
              <TableBody>
                {signals.slice(0, 10).map((s: Record<string, any>) => (
                  <TableRow key={s.id}>
                    <TableCell className="text-xs font-mono">{s.signal_type}</TableCell>
                    <TableCell className="font-bold">{s.signal_value}</TableCell>
                    <TableCell className="text-xs">{s.signal_unit || "—"}</TableCell>
                    <TableCell className="text-xs">{s.signal_quality}</TableCell>
                    <TableCell className="text-xs">{s.wearable_providers?.name || "—"}</TableCell>
                    <TableCell className="text-xs">{new Date(s.recorded_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {consents.length === 0 && signals.length === 0 && (<Card className="bg-card border-border"><CardContent className="pt-6 text-center text-muted-foreground">No health signals or consents configured yet.</CardContent></Card>)}
    </div>
  );
}
