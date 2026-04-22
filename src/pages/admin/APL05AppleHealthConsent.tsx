import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Heart, ShieldCheck, Eye, EyeOff, Lock, AlertTriangle, CheckCircle2, Clock, Activity, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import APLSubNav from "@/components/admin/APLSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

// Production fallback — seed data removed
const DEMO_SIGNALS: any[] = [];

type ConsentState = Record<string, { read: boolean; routing: boolean; boardroom: boolean; assistant: boolean }>;

const APL05AppleHealthConsent = () => {
  const [consents, setConsents] = useState<ConsentState>(
    Object.fromEntries(([] as typeof DEMO_SIGNALS).map(s => [s.key, { read: false, routing: false, boardroom: false, assistant: false }]))
  );

  const toggleConsent = (signal: string, scope: keyof ConsentState[string]) => {
    setConsents(prev => ({ ...prev, [signal]: { ...prev[signal], [scope]: !prev[signal][scope] } }));
  };

  const consentedCount = Object.values(consents).filter(c => c.read).length;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
<APLSubNav />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><Heart className="h-8 w-8 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold">Apple Health Consent Center</h1>
            <p className="text-muted-foreground">HealthKit signal permissions, privacy controls, visibility policies</p>
          </div>
        </div>
        <Badge variant={consentedCount > 0 ? "default" : "secondary"}>{consentedCount}/{([] as typeof DEMO_SIGNALS).length} consented</Badge>
      </div>

      <Tabs defaultValue="matrix" className="space-y-4">
        <TabsList>
          <TabsTrigger value="matrix">Consent Matrix</TabsTrigger>
          <TabsTrigger value="privacy">Privacy Controls</TabsTrigger>
          <TabsTrigger value="retention">Data Retention</TabsTrigger>
          <TabsTrigger value="audit">Consent Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix">
          <Card>
            <CardHeader><CardTitle className="text-sm">Signal Consent Matrix</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b">
                    <th className="text-left p-2">Signal</th>
                    <th className="p-2">Unit</th>
                    <th className="p-2">Sensitivity</th>
                    <th className="p-2"><ShieldCheck className="h-3 w-3 mx-auto" /> Read</th>
                    <th className="p-2"><Activity className="h-3 w-3 mx-auto" /> Routing</th>
                    <th className="p-2"><Eye className="h-3 w-3 mx-auto" /> Boardroom</th>
                    <th className="p-2"><Heart className="h-3 w-3 mx-auto" /> Assistant</th>
                  </tr></thead>
                  <tbody>
                    {([] as typeof DEMO_SIGNALS).map((sig) => (
                      <tr key={sig.key} className="border-b hover:bg-muted/30">
                        <td className="p-2 font-mono font-medium">{sig.key}</td>
                        <td className="p-2 text-center text-muted-foreground">{sig.unit}</td>
                        <td className="p-2 text-center"><Badge variant={sig.sensitivity === "high" ? "destructive" : sig.sensitivity === "medium" ? "default" : "secondary"} className="text-[10px]">{sig.sensitivity}</Badge></td>
                        <td className="p-2 text-center"><Switch checked={consents[sig.key]?.read} onCheckedChange={() => toggleConsent(sig.key, "read")} /></td>
                        <td className="p-2 text-center"><Switch checked={consents[sig.key]?.routing} onCheckedChange={() => toggleConsent(sig.key, "routing")} disabled={!consents[sig.key]?.read} /></td>
                        <td className="p-2 text-center"><Switch checked={consents[sig.key]?.boardroom} onCheckedChange={() => toggleConsent(sig.key, "boardroom")} disabled={!consents[sig.key]?.read} /></td>
                        <td className="p-2 text-center"><Switch checked={consents[sig.key]?.assistant} onCheckedChange={() => toggleConsent(sig.key, "assistant")} disabled={!consents[sig.key]?.read} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-muted-foreground mt-3">Routing, boardroom, and assistant scopes require read consent first. Each scope is independently revocable.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Lock className="h-4 w-4" />Core Principles</CardTitle></CardHeader>
              <CardContent className="text-xs space-y-2">
                {[
                  "Every signal type requires explicit opt-in consent",
                  "Routing influence requires separate consent from read access",
                  "Boardroom visibility requires explicit approval per signal",
                  "Assistant use requires separate consent from boardroom",
                  "Revoke & erase available at any time — immediate effect",
                  "Privacy explanation shown before each consent grant",
                  "No signal data leaves device without active consent",
                  "Consent state is audited and version-controlled",
                ].map((p, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded border"><CheckCircle2 className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />{p}</div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Revocation Actions</CardTitle></CardHeader>
              <CardContent className="text-xs space-y-2">
                {[
                  { action: "Revoke read consent", effect: "Stops all ingestion, derived data cleared within 24h" },
                  { action: "Revoke routing influence", effect: "Signal no longer affects notification decisions" },
                  { action: "Revoke boardroom visibility", effect: "Signal removed from all briefing summaries" },
                  { action: "Erase all data", effect: "Complete removal from all stores, audit trail preserved" },
                ].map((a) => (
                  <div key={a.action} className="p-3 rounded border space-y-1">
                    <div className="font-medium flex items-center gap-2"><Trash2 className="h-3 w-3 text-destructive" />{a.action}</div>
                    <p className="text-muted-foreground">{a.effect}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="retention">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" />Data Retention Policies</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b">
                    <th className="text-left p-2">Signal</th>
                    <th className="p-2">Sensitivity</th>
                    <th className="p-2">Retention</th>
                    <th className="text-left p-2">Notes</th>
                  </tr></thead>
                  <tbody>
                    {([] as typeof DEMO_SIGNALS).map((sig) => (
                      <tr key={sig.key} className="border-b hover:bg-muted/30">
                        <td className="p-2 font-mono">{sig.key}</td>
                        <td className="p-2 text-center"><Badge variant={sig.sensitivity === "high" ? "destructive" : "secondary"}>{sig.sensitivity}</Badge></td>
                        <td className="p-2 text-center font-mono">{sig.retentionDays}d</td>
                        <td className="p-2 text-muted-foreground">{sig.sensitivity === "high" ? "Auto-purge after retention period" : "User can extend retention"}</td>
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
            <CardHeader><CardTitle className="text-sm">Consent Audit Trail</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2">
              <p className="text-muted-foreground">Every consent grant, revocation, and data access is logged in the audit trail.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                {[
                  { label: "Consent events logged", value: "All", icon: CheckCircle2 },
                  { label: "Retention of audit logs", value: "7 years", icon: Clock },
                  { label: "Export format", value: "JSON + PDF", icon: Eye },
                ].map((a) => (
                  <div key={a.label} className="p-3 rounded border flex items-center gap-2">
                    <a.icon className="h-4 w-4 text-primary" />
                    <div><div className="font-medium">{a.label}</div><div className="text-muted-foreground">{a.value}</div></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APL05AppleHealthConsent;
