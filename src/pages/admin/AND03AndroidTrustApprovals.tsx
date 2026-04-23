import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Shield, Fingerprint, Smartphone, Watch, Lock, CheckCircle2, XCircle, ArrowRight, AlertTriangle, Key } from "lucide-react";
import ANDSubNav from "@/components/admin/ANDSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const VERIFICATION_EVENTS: any[] = [];

// Production fallback — seed data removed
const TRUST_CLASSES: any[] = [];

const AND03AndroidTrustApprovals = () => {
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
<ANDSubNav />
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10"><Shield className="h-8 w-8 text-primary" /></div>
      <div>
        <h1 className="text-2xl font-bold">Android Trust & Approvals Board</h1>
        <p className="text-muted-foreground">Device trust, biometric verification, Play Integrity, escalation policies</p>
      </div>
    </div>

    <Tabs defaultValue="classes" className="space-y-4">
      <TabsList>
        <TabsTrigger value="classes">Trust Classes</TabsTrigger>
        <TabsTrigger value="escalation">Escalation Matrix</TabsTrigger>
        <TabsTrigger value="verification">Verification Events</TabsTrigger>
        <TabsTrigger value="keystore">Keystore & Integrity</TabsTrigger>
      </TabsList>

      <TabsContent value="classes">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {([] as any[]).map((t) => (
            <Card key={t.cls}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2"><Smartphone className="h-4 w-4" />{t.label}</CardTitle>
                  <Badge>{t.riskCeiling} ceiling</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs"><span>Trust Score</span><span className="font-mono">{t.trustScore}/100</span></div>
                  <Progress value={t.trustScore} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded border flex items-center gap-1"><Fingerprint className="h-3 w-3" />{t.bio}</div>
                  <div className="p-2 rounded border flex items-center gap-1"><Lock className="h-3 w-3" />{t.session}</div>
                  <div className="p-2 rounded border flex items-center gap-1">{t.keystore ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}Keystore</div>
                  <div className="p-2 rounded border flex items-center gap-1">{t.playIntegrity ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}Play Integrity</div>
                </div>
                <div className="text-xs text-muted-foreground font-mono">{t.cls}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="escalation">
        <Card>
          <CardHeader><CardTitle className="text-sm">Risk-Based Escalation Matrix</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b"><th className="text-left p-2">Risk</th><th className="text-left p-2">Action</th><th className="p-2">Biometric</th><th className="p-2">Escalates</th></tr></thead>
              <tbody>
                {([] as any[]).map((r) => (
                  <tr key={r.risk} className="border-b hover:bg-muted/30">
                    <td className="p-2"><Badge variant={r.risk === "Critical" ? "destructive" : r.risk === "High" ? "default" : "secondary"}>{r.risk}</Badge></td>
                    <td className="p-2">{r.action}</td>
                    <td className="p-2 text-center">{r.bio}</td>
                    <td className="p-2 text-center">{r.escalate ? <AlertTriangle className="h-3 w-3 mx-auto text-amber-500" /> : <CheckCircle2 className="h-3 w-3 mx-auto text-green-500" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </CardContent>
        </Card>
        <Card className="mt-4">
          <CardHeader><CardTitle className="text-sm">Escalation Flow</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-3 text-xs flex-wrap">
              {[{ icon: Watch, label: "Wear OS" }, { icon: Smartphone, label: "Phone" }, { icon: Shield, label: "Web/Desktop" }].map((d, i) => (
                <div key={d.label} className="flex items-center gap-2">
                  {i > 0 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                  <div className="p-3 rounded-lg bg-muted/30 flex items-center gap-2"><d.icon className="h-5 w-5" />{d.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="verification">
        <Card>
          <CardHeader><CardTitle className="text-sm">Verification Event Matrix</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b"><th className="text-left p-2">Event</th><th className="text-left p-2">Method</th><th className="p-2">Frequency</th></tr></thead>
              <tbody>
                {([] as any[]).map((v) => (
                  <tr key={v.event} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-medium">{v.event}</td>
                    <td className="p-2"><Badge variant="outline">{v.method}</Badge></td>
                    <td className="p-2 text-center font-mono">{v.frequency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="keystore">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Key className="h-4 w-4" />Android Keystore</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2">
              {["Hardware-backed key storage (StrongBox/TEE)", "Key attestation for device verification", "Biometric-bound key access", "Non-exportable private keys", "Key rotation on device compromise"].map((i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded border"><CheckCircle2 className="h-3 w-3 text-green-500" />{i}</div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" />Play Integrity API</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2">
              {[
                { check: "App integrity", desc: "Verifies genuine, unmodified APK" },
                { check: "Device integrity", desc: "Verifies genuine Android device with Google Play" },
                { check: "Account integrity", desc: "Verifies licensed Google account" },
              ].map((c) => (
                <div key={c.check} className="p-3 rounded border space-y-1">
                  <div className="font-medium">{c.check}</div>
                  <p className="text-muted-foreground">{c.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  </div>
  );
};

export default AND03AndroidTrustApprovals;
