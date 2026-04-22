import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Heart, ShieldCheck, Eye, EyeOff, Lock, Clock, Activity, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";
import { DEMO_ADMIN_SIGNALS as DEMO_SIGNALS } from "@/data/seed/admin-platform";
import ANDSubNav from "@/components/admin/ANDSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

type ConsentMap = Record<string, { read: boolean; routing: boolean; assistant: boolean }>;

const AND04AndroidHealthConsent = () => {
  const { isDemoMode } = useDataMode();
  const [consents, setConsents] = useState<ConsentMap>(
    Object.fromEntries((isDemoMode ? DEMO_SIGNALS : [] as typeof DEMO_SIGNALS).map(s => [s.key, { read: false, routing: false, assistant: false }]))
  );

  const toggle = (sig: string, scope: keyof ConsentMap[string]) => {
    setConsents(prev => ({ ...prev, [sig]: { ...prev[sig], [scope]: !prev[sig][scope] } }));
  };

  const consentedCount = Object.values(consents).filter(c => c.read).length;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
<ANDSubNav />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><Heart className="h-8 w-8 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold">Android Health Consent Center</h1>
            <p className="text-muted-foreground">Health Connect signal permissions and privacy controls</p>
          </div>
        </div>
        <Badge variant={consentedCount > 0 ? "default" : "secondary"}>{consentedCount}/{(isDemoMode ? DEMO_SIGNALS : [] as typeof DEMO_SIGNALS).length} consented</Badge>
      </div>

      <Tabs defaultValue="matrix" className="space-y-4">
        <TabsList>
          <TabsTrigger value="matrix">Consent Matrix</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix">
          <Card>
            <CardHeader><CardTitle className="text-sm">Health Connect Signal Matrix</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b">
                    <th className="text-left p-2">Signal</th>
                    <th className="p-2">Unit</th>
                    <th className="p-2">Sensitivity</th>
                    <th className="p-2"><ShieldCheck className="h-3 w-3 mx-auto" /> Read</th>
                    <th className="p-2"><Activity className="h-3 w-3 mx-auto" /> Routing</th>
                    <th className="p-2"><Heart className="h-3 w-3 mx-auto" /> Assistant</th>
                  </tr></thead>
                  <tbody>
                    {(isDemoMode ? DEMO_SIGNALS : [] as typeof DEMO_SIGNALS).map((sig) => (
                      <tr key={sig.key} className="border-b hover:bg-muted/30">
                        <td className="p-2 font-mono">{sig.key}</td>
                        <td className="p-2 text-center text-muted-foreground">{sig.unit}</td>
                        <td className="p-2 text-center"><Badge variant={sig.sensitivity === "high" ? "destructive" : sig.sensitivity === "medium" ? "default" : "secondary"} className="text-[10px]">{sig.sensitivity}</Badge></td>
                        <td className="p-2 text-center"><Switch checked={consents[sig.key]?.read} onCheckedChange={() => toggle(sig.key, "read")} /></td>
                        <td className="p-2 text-center"><Switch checked={consents[sig.key]?.routing} onCheckedChange={() => toggle(sig.key, "routing")} disabled={!consents[sig.key]?.read} /></td>
                        <td className="p-2 text-center"><Switch checked={consents[sig.key]?.assistant} onCheckedChange={() => toggle(sig.key, "assistant")} disabled={!consents[sig.key]?.read} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Lock className="h-4 w-4" />Privacy Principles</CardTitle></CardHeader>
              <CardContent className="text-xs space-y-2">
                {["Explicit opt-in for every signal type", "Routing influence requires separate consent", "Revoke & erase at any time", "Privacy explanation before consent", "No data leaves device without consent", "Health Connect permissions are granular"].map((p, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded border"><CheckCircle2 className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />{p}</div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Trash2 className="h-4 w-4" />Revocation</CardTitle></CardHeader>
              <CardContent className="text-xs space-y-2">
                {[
                  { action: "Revoke read consent", effect: "Stops ingestion, data cleared within 24h" },
                  { action: "Revoke routing influence", effect: "Signal no longer affects notifications" },
                  { action: "Erase all data", effect: "Complete removal from all stores" },
                ].map((a) => (
                  <div key={a.action} className="p-3 rounded border space-y-1">
                    <div className="font-medium">{a.action}</div>
                    <p className="text-muted-foreground">{a.effect}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="retention">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" />Data Retention</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left p-2">Signal</th><th className="p-2">Sensitivity</th><th className="p-2">Retention</th></tr></thead>
                <tbody>
                  {(isDemoMode ? DEMO_SIGNALS : [] as typeof DEMO_SIGNALS).map((sig) => (
                    <tr key={sig.key} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-mono">{sig.key}</td>
                      <td className="p-2 text-center"><Badge variant={sig.sensitivity === "high" ? "destructive" : "secondary"}>{sig.sensitivity}</Badge></td>
                      <td className="p-2 text-center font-mono">{sig.retention}d</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AND04AndroidHealthConsent;
