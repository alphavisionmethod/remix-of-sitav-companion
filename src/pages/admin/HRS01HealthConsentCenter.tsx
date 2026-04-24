import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ShieldCheck, Heart, Lock, Eye, AlertTriangle, CheckCircle2, Trash2, Clock, FileText, Loader2 } from "lucide-react";
import { useHealthSignalConsents } from "@/hooks/use-health-signal-data";
import { useToggleSignalConsent } from "@/hooks/use-health-signal-mutations";
import HRSSubNav from "@/components/admin/HRSSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const ICON_MAP: Record<string, any> = { ingestion: Eye, routing: ShieldCheck, boardroom: FileText, assistant: Heart };

const HRS01HealthConsentCenter = () => {
  const [enabledCats, setEnabledCats] = useState<Record<string, boolean>>(
    Object.fromEntries(([] as any[]).map(c => [c.key, false]))
  );
  const { data: dbConsents, isLoading } = useHealthSignalConsents();
  const toggleConsent = useToggleSignalConsent();

  // Sync local state from DB consents
  useEffect(() => {
    if (dbConsents?.length) {
      const fromDb: Record<string, boolean> = {};
      ([] as any[]).forEach(c => {
        const match = dbConsents.find((dc: Record<string, any>) => dc.consent_scope === c.key && dc.read_permission && !dc.revoked_at);
        fromDb[c.key] = !!match;
      });
      setEnabledCats(fromDb);
    }
  }, [dbConsents]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
<HRSSubNav />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><ShieldCheck className="h-8 w-8 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Health & Readiness Consent Center</h1>
          <p className="text-muted-foreground">Signal-level consent governance, privacy controls, revoke/erase</p>
        </div>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Consent Categories</TabsTrigger>
          <TabsTrigger value="db-consents">DB Consent Records</TabsTrigger>
          <TabsTrigger value="principles">Principles</TabsTrigger>
          <TabsTrigger value="revocation">Revocation</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {([] as any[]).map((c) => {
              const Icon = ICON_MAP[c.key] || Eye;
              return (
                <Card key={c.key} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2"><Icon className="h-4 w-4" />{c.cat}</CardTitle>
                      <Switch checked={enabledCats[c.key]} onCheckedChange={(v) => {
                        setEnabledCats(prev => ({ ...prev, [c.key]: v }));
                        toggleConsent.mutate({ signalType: "health", consentScope: c.key, enabled: v });
                      }} />
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2">
                    <p className="text-muted-foreground">{c.desc}</p>
                    <div className="flex gap-2">
                      <Badge variant={enabledCats[c.key] ? "default" : "secondary"}>{enabledCats[c.key] ? "Enabled" : "Disabled"}</Badge>
                      <Badge variant={c.risk === "high" ? "destructive" : c.risk === "medium" ? "default" : "secondary"}>Risk: {c.risk}</Badge>
                    </div>
                    {c.key !== "ingestion" && !enabledCats["ingestion"] && enabledCats[c.key] && (
                      <div className="flex items-center gap-1 text-amber-500"><AlertTriangle className="h-3 w-3" /><span>Requires ingestion consent first</span></div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="db-consents">
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : !dbConsents?.length ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No consent records in database. In live mode, consent grants will appear here.</CardContent></Card>
          ) : (
            <Card>
              <CardHeader><CardTitle className="text-sm">Active Consent Records</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b"><th className="text-left p-2">Signal Type</th><th className="text-left p-2">Scope</th><th className="p-2">Read</th><th className="p-2">Revoked</th><th className="text-left p-2">Granted</th></tr></thead>
                  <tbody>
                    {dbConsents.map((consent: Record<string, any>) => (
                      <tr key={consent.id} className="border-b hover:bg-muted/30">
                        <td className="p-2 font-mono">{consent.signal_type}</td>
                        <td className="p-2">{consent.consent_scope || "—"}</td>
                        <td className="p-2 text-center">{consent.read_permission ? <CheckCircle2 className="h-3 w-3 mx-auto text-green-500" /> : <span>—</span>}</td>
                        <td className="p-2 text-center">{consent.revoked_at ? <Badge variant="destructive" className="text-[10px]">Revoked</Badge> : <Badge variant="default" className="text-[10px]">Active</Badge>}</td>
                        <td className="p-2 text-muted-foreground">{new Date(consent.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="principles">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Lock className="h-4 w-4" />Core Consent Principles</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {([] as any[]).map((p, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded border text-xs"><CheckCircle2 className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />{p}</div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revocation">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Trash2 className="h-4 w-4" />Revocation Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left p-2">Action</th><th className="text-left p-2">Effect</th><th className="p-2">Timeline</th><th className="text-left p-2">Cascade</th></tr></thead>
                <tbody>
                  {([] as any[]).map((r) => (
                    <tr key={r.action} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-medium">{r.action}</td>
                      <td className="p-2 text-muted-foreground">{r.effect}</td>
                      <td className="p-2 text-center"><Badge variant="outline">{r.timeline}</Badge></td>
                      <td className="p-2 text-muted-foreground">{r.cascade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader><CardTitle className="text-sm">Consent Audit Configuration</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { label: "Events logged", value: "All consent changes", icon: CheckCircle2 },
                  { label: "Audit retention", value: "7 years (GDPR/HIPAA)", icon: Clock },
                  { label: "Export formats", value: "JSON, PDF, CSV", icon: FileText },
                ].map((a) => (
                  <div key={a.label} className="p-3 rounded border flex items-center gap-2">
                    <a.icon className="h-4 w-4 text-primary" />
                    <div><div className="font-medium">{a.label}</div><div className="text-muted-foreground">{a.value}</div></div>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground">All consent events are cryptographically signed and stored in an append-only audit log.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HRS01HealthConsentCenter;
