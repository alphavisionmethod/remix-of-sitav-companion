import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Fingerprint, Smartphone } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const AND03AndroidTrustApprovals = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <DemoModeBadge />
    <div className="flex items-center gap-3">
      <Shield className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-2xl font-bold">Android Trust & Approvals Board</h1>
        <p className="text-muted-foreground">Device trust, biometric verification, SafetyNet, escalation policies</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-sm">Trust Classes</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[
            { cls: "trusted_phone", bio: "Fingerprint / Face", keystore: true, safety: true },
            { cls: "trusted_tablet", bio: "Fingerprint / Face", keystore: true, safety: true },
            { cls: "trusted_watch", bio: "Wrist detection", keystore: false, safety: false },
          ].map((t) => (
            <div key={t.cls} className="flex items-center justify-between p-2 rounded border text-xs">
              <span className="font-mono">{t.cls}</span>
              <div className="flex gap-2">
                <Badge variant="outline"><Fingerprint className="h-3 w-3 inline mr-1" />{t.bio}</Badge>
                {t.keystore && <Badge variant="outline">Keystore ✓</Badge>}
                {t.safety && <Badge variant="outline">SafetyNet ✓</Badge>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm">Risk-Based Escalation</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-2">
          <div className="p-2 rounded border">Low risk → approve on any trusted device</div>
          <div className="p-2 rounded border">Medium risk → biometric required</div>
          <div className="p-2 rounded border">High risk → phone with biometric only</div>
          <div className="p-2 rounded border">Critical → escalate to web/desktop</div>
          <p className="text-muted-foreground mt-2">Watch → Phone escalation for medium+ risk</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default AND03AndroidTrustApprovals;
