import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, ArrowRightLeft, Lock, Fingerprint, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const SECURE_ACTIONS = [
  { risk: "Low", device: "Any trusted device", bio: "None required", session: "Standard", examples: ["View dashboard", "Read notifications", "Browse content"] },
  { risk: "Medium", device: "Phone/tablet with biometric", bio: "Fingerprint/Face", session: "Standard", examples: ["Approve low-risk action", "Edit profile", "Change preferences"] },
  { risk: "High", device: "Phone with biometric + session elevation", bio: "Required + elevated", session: "Elevated (15 min)", examples: ["Financial transaction", "Settings change", "Export data"] },
  { risk: "Critical", device: "Web/desktop with full auth", bio: "Required + MFA", session: "Elevated + MFA", examples: ["Delete account", "Revoke device", "Change auth provider"] },
];

const CONTINUITY_FLOWS = [
  { from: "Web", to: "App", context: ["Navigation state", "Assistant thread", "Form progress"], method: "Deep link + URL state", latency: "<2s", statePreserved: true },
  { from: "App", to: "Web", context: ["Document view", "Workflow step", "Boardroom card"], method: "Share URL", latency: "Immediate", statePreserved: true },
  { from: "Watch", to: "App", context: ["Approval context", "Alert detail", "Full thread"], method: "Deep link via push", latency: "<3s", statePreserved: true },
  { from: "App", to: "Desktop", context: ["Full context resume", "Complex workflows"], method: "Continuity / URL", latency: "<5s", statePreserved: true },
  { from: "Desktop", to: "App", context: ["Continue on mobile", "Quick approve"], method: "Push + deep link", latency: "<3s", statePreserved: false },
];

const TRUST_CONTINUITY = [
  { aspect: "Session portability", desc: "Auth sessions transfer across surfaces via secure token exchange", status: "planned" },
  { aspect: "Trust receipt chain", desc: "Each device approval creates a verifiable trust receipt", status: "planned" },
  { aspect: "Escalation tracking", desc: "Cross-device escalations logged with full audit trail", status: "planned" },
  { aspect: "Biometric downgrade prevention", desc: "Cannot approve high-risk action on lower-trust device", status: "designed" },
  { aspect: "Offline trust cache", desc: "Cached trust receipts allow offline approvals for low risk", status: "planned" },
  { aspect: "Device revocation propagation", desc: "Revoking trust on one device propagates to all linked surfaces", status: "designed" },
];

const NSS03TrustContinuity = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
    <DemoModeBadge />
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
            <table className="w-full text-xs">
              <thead><tr className="border-b"><th className="text-left p-2">Risk</th><th className="text-left p-2">Device</th><th className="p-2">Biometric</th><th className="text-left p-2">Session</th><th className="text-left p-2">Examples</th></tr></thead>
              <tbody>
                {SECURE_ACTIONS.map((r) => (
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
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="continuity">
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><ArrowRightLeft className="h-4 w-4" />Cross-Surface Continuity</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-xs">
              <thead><tr className="border-b"><th className="text-left p-2">From</th><th className="p-2"><ArrowRight className="h-3 w-3 mx-auto" /></th><th className="text-left p-2">To</th><th className="text-left p-2">Context</th><th className="text-left p-2">Method</th><th className="p-2">Latency</th><th className="p-2">State</th></tr></thead>
              <tbody>
                {CONTINUITY_FLOWS.map((f, i) => (
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
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="trust">
        <Card>
          <CardHeader><CardTitle className="text-sm">Trust Continuity Architecture</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {TRUST_CONTINUITY.map((t) => (
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

export default NSS03TrustContinuity;
