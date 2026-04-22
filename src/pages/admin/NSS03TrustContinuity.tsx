import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, ArrowRightLeft, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { DEMO_SECURE_ACTIONS, DEMO_CONTINUITY_FLOWS, DEMO_TRUST_CONTINUITY } from "@/data/seed/native-shell";
import NSSSubNav from "@/components/admin/NSSSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

const NSS03TrustContinuity = () => {
  const { isDemoMode } = useDataMode();
  const secureActions = DEMO_SECURE_ACTIONS;
  const continuityFlows = DEMO_CONTINUITY_FLOWS;
  const trustContinuity = DEMO_TRUST_CONTINUITY;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
<NSSSubNav />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Shield className="h-8 w-8 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Native Trust & Continuity Center</h1>
          <p className="text-muted-foreground">Secure actions, device trust, and cross-surface continuity</p>
        </div>
      </div>

      <Tabs defaultValue="actions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="actions">Secure Actions</TabsTrigger>
          <TabsTrigger value="continuity">Continuity Flows</TabsTrigger>
          <TabsTrigger value="trust">Trust Continuity</TabsTrigger>
        </TabsList>

        <TabsContent value="actions">
          <Card>
            <CardHeader><CardTitle className="text-sm">Secure Action Model</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left p-2">Risk</th><th className="text-left p-2">Device</th><th className="p-2">Biometric</th><th className="text-left p-2">Session</th><th className="text-left p-2">Examples</th></tr></thead>
                <tbody>
                  {secureActions.map((r) => (
                    <tr key={r.risk} className="border-b hover:bg-muted/30">
                      <td className="p-2"><Badge variant={r.risk === "Critical" ? "destructive" : r.risk === "High" ? "default" : r.risk === "Medium" ? "default" : "secondary"}>{r.risk}</Badge></td>
                      <td className="p-2">{r.device}</td>
                      <td className="p-2 text-center"><Badge variant="outline">{r.bio}</Badge></td>
                      <td className="p-2">{r.session}</td>
                      <td className="p-2"><div className="flex flex-wrap gap-1">{r.examples.map((e) => <Badge key={e} variant="outline" className="text-[10px]">{e}</Badge>)}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="continuity">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><ArrowRightLeft className="h-4 w-4" />Cross-Surface Continuity</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left p-2">From</th><th className="p-2"><ArrowRight className="h-3 w-3 mx-auto" /></th><th className="text-left p-2">To</th><th className="text-left p-2">Context</th><th className="text-left p-2">Method</th><th className="p-2">Latency</th><th className="p-2">State</th></tr></thead>
                <tbody>
                  {continuityFlows.map((f, i) => (
                    <tr key={i} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-medium">{f.from}</td>
                      <td className="p-2 text-center"><ArrowRight className="h-3 w-3 mx-auto text-primary" /></td>
                      <td className="p-2 font-medium">{f.to}</td>
                      <td className="p-2"><div className="flex flex-wrap gap-1">{f.context.map((c) => <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>)}</div></td>
                      <td className="p-2 text-muted-foreground">{f.method}</td>
                      <td className="p-2 text-center font-mono">{f.latency}</td>
                      <td className="p-2 text-center">{f.statePreserved ? <CheckCircle2 className="h-3 w-3 mx-auto text-green-500" /> : <AlertTriangle className="h-3 w-3 mx-auto text-amber-500" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trust">
          <Card>
            <CardHeader><CardTitle className="text-sm">Trust Continuity Architecture</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {trustContinuity.map((t) => (
                <div key={t.aspect} className="flex items-start gap-3 p-3 rounded border text-xs">
                  <Badge variant={t.status === "designed" ? "secondary" : "outline"} className="shrink-0 mt-0.5">{t.status}</Badge>
                  <div><div className="font-medium">{t.aspect}</div><p className="text-muted-foreground mt-0.5">{t.desc}</p></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NSS03TrustContinuity;
