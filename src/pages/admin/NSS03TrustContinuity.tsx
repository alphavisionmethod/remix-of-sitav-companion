import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowRightLeft } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const NSS03TrustContinuity = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <DemoModeBadge />
    <div className="flex items-center gap-3">
      <Shield className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-2xl font-bold">Native Trust & Continuity Center</h1>
        <p className="text-muted-foreground">Secure actions, device trust, and cross-surface continuity</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-sm">Secure Action Model</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-2">
          {[
            { risk: "Low", action: "Any trusted device", bio: "No" },
            { risk: "Medium", action: "Phone/tablet with biometric", bio: "Yes" },
            { risk: "High", action: "Phone with biometric + session elevation", bio: "Yes" },
            { risk: "Critical", action: "Web/desktop with full auth", bio: "Yes + MFA" },
          ].map((r) => (
            <div key={r.risk} className="flex items-center justify-between p-2 rounded border">
              <Badge>{r.risk} risk</Badge>
              <span>{r.action}</span>
              <Badge variant="outline">Bio: {r.bio}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><ArrowRightLeft className="h-4 w-4" /> Continuity Flows</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-2">
          {[
            { flow: "Web → App", context: "navigation state, assistant thread" },
            { flow: "App → Web", context: "document, workflow, boardroom" },
            { flow: "Watch → App", context: "approval context, alert detail" },
            { flow: "App → Desktop", context: "full context resume" },
            { flow: "Desktop → App", context: "continue on mobile" },
          ].map((f) => (
            <div key={f.flow} className="flex items-center justify-between p-2 rounded border">
              <Badge variant="outline">{f.flow}</Badge>
              <span className="text-muted-foreground">{f.context}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </div>
);

export default NSS03TrustContinuity;
