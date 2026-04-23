import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Shield, Smartphone, Watch, Monitor, Fingerprint, Lock, ArrowRight, AlertTriangle, CheckCircle2, XCircle, Eye } from "lucide-react";
import APLSubNav from "@/components/admin/APLSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const VERIFICATION_EVENTS: any[] = [];

// Production fallback — seed data removed
const TRUST_CLASSES: any[] = [];

const APL02AppleDevicesTrust = () => {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
<APLSubNav />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Shield className="h-8 w-8 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Apple Devices & Trust Board</h1>
          <p className="text-muted-foreground">Device trust classes, biometric verification, escalation policies, and attestation</p>
        </div>
      </div>

      <Tabs defaultValue="trust-classes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trust-classes">Trust Classes</TabsTrigger>
          <TabsTrigger value="escalation">Escalation Chain</TabsTrigger>
          <TabsTrigger value="verification">Verification Events</TabsTrigger>
          <TabsTrigger value="attestation">Attestation</TabsTrigger>
        </TabsList>

        <TabsContent value="trust-classes">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {([] as any[]).map((t) => (
              <Card key={t.cls} className={`cursor-pointer transition-all ${selectedClass === t.cls ? "ring-2 ring-primary" : "hover:shadow-md"}`} onClick={() => setSelectedClass(selectedClass === t.cls ? null : t.cls)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2"><t.icon className="h-4 w-4 text-primary" />{t.label}</CardTitle>
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
                    <div className="p-2 rounded border flex items-center gap-1"><Lock className="h-3 w-3" />Session: {t.sessionDuration}</div>
                    <div className="p-2 rounded border flex items-center gap-1">{t.keychain ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}Keychain</div>
                    <div className="p-2 rounded border flex items-center gap-1">{t.attestation ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}Attestation</div>
                  </div>
                  <div className="text-xs text-muted-foreground">Re-auth method: <span className="font-mono">{t.reauth}</span></div>
                  {selectedClass === t.cls && (
                    <div className="p-3 rounded bg-muted/30 text-xs space-y-1 border-t mt-2">
                      <p className="font-medium">Class Details: <span className="font-mono">{t.cls}</span></p>
                      <p>• Maximum risk tier for autonomous actions: {t.riskCeiling}</p>
                      <p>• Session persists for: {t.sessionDuration}</p>
                      <p>• Keychain storage: {t.keychain ? "Secure Enclave backed" : "Not available"}</p>
                      <p>• Device attestation: {t.attestation ? "DCAppAttest supported" : "Not supported on this surface"}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="escalation">
          <Card>
            <CardHeader><CardTitle className="text-sm">Escalation Chain Rules</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b">
                    <th className="text-left p-2">From</th>
                    <th className="p-2"><ArrowRight className="h-3 w-3 mx-auto" /></th>
                    <th className="text-left p-2">To</th>
                    <th className="text-left p-2">Trigger</th>
                    <th className="p-2">Timeout</th>
                    <th className="text-left p-2">Method</th>
                  </tr></thead>
                  <tbody>
                    {([] as any[]).map((r, i) => (
                      <tr key={i} className="border-b hover:bg-muted/30">
                        <td className="p-2 font-medium">{r.from}</td>
                        <td className="p-2 text-center"><ArrowRight className="h-3 w-3 mx-auto text-primary" /></td>
                        <td className="p-2 font-medium">{r.to}</td>
                        <td className="p-2"><Badge variant="outline">{r.trigger}</Badge></td>
                        <td className="p-2 text-center font-mono">{r.timeout}</td>
                        <td className="p-2 text-muted-foreground">{r.method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader><CardTitle className="text-sm">Visual Flow</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-3 text-xs flex-wrap">
                {[{ icon: Watch, label: "Watch", color: "bg-amber-500/10 text-amber-500" }, { icon: Smartphone, label: "iPhone", color: "bg-green-500/10 text-green-500" }, { icon: Monitor, label: "iPad / Mac", color: "bg-blue-500/10 text-blue-500" }].map((d, i) => (
                  <div key={d.label} className="flex items-center gap-2">
                    {i > 0 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                    <div className={`p-3 rounded-lg ${d.color} flex items-center gap-2`}>
                      <d.icon className="h-5 w-5" /><span className="font-medium">{d.label}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">When risk tier exceeds device ceiling, action escalates to the next trusted device in chain</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification">
          <Card>
            <CardHeader><CardTitle className="text-sm">Verification Event Matrix</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b">
                    <th className="text-left p-2">Event</th>
                    <th className="text-left p-2">Requires</th>
                    <th className="p-2">Frequency</th>
                    <th className="p-2">Min Risk Tier</th>
                  </tr></thead>
                  <tbody>
                    {([] as any[]).map((v) => (
                      <tr key={v.event} className="border-b hover:bg-muted/30">
                        <td className="p-2 font-medium">{v.event}</td>
                        <td className="p-2"><Badge variant="outline">{v.requires}</Badge></td>
                        <td className="p-2 text-center font-mono">{v.frequency}</td>
                        <td className="p-2 text-center"><Badge variant={v.risk === "critical" ? "destructive" : v.risk.includes("high") ? "default" : "secondary"}>{v.risk}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attestation">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Eye className="h-4 w-4" />DCAppAttest</CardTitle></CardHeader>
              <CardContent className="text-xs space-y-2">
                <p>Apple's Device Check App Attest verifies requests come from legitimate app instances on genuine Apple hardware.</p>
                <div className="space-y-1 mt-3">
                  {["Key generation on device", "Attestation statement from Apple servers", "Assertion verification on backend", "Fraud risk reduction for high-value actions", "App integrity verification"].map((item) => (
                    <div key={item} className="p-2 rounded border flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" />{item}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Attestation Policy</CardTitle></CardHeader>
              <CardContent className="text-xs space-y-2">
                {[
                  { rule: "Financial actions > $500", enforcement: "required" },
                  { rule: "Device registration", enforcement: "required" },
                  { rule: "Standard approvals", enforcement: "optional" },
                  { rule: "Read-only browsing", enforcement: "not_required" },
                ].map((r) => (
                  <div key={r.rule} className="flex items-center justify-between p-2 rounded border">
                    <span>{r.rule}</span>
                    <Badge variant={r.enforcement === "required" ? "default" : r.enforcement === "optional" ? "outline" : "secondary"}>{r.enforcement}</Badge>
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

export default APL02AppleDevicesTrust;
