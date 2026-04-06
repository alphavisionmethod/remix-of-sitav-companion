import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Smartphone, Watch } from "lucide-react";

const APL02AppleDevicesTrust = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
    <div className="flex items-center gap-3">
      <Shield className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-2xl font-bold">Apple Devices & Trust Board</h1>
        <p className="text-muted-foreground">Device trust, biometric verification, escalation policies</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-sm">Trust Classes</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[
            { cls: "trusted_iphone", bio: "Face ID / Touch ID", risk: "high" },
            { cls: "trusted_ipad", bio: "Face ID / Touch ID", risk: "high" },
            { cls: "trusted_watch", bio: "Wrist detection", risk: "medium" },
            { cls: "trusted_mac", bio: "Touch ID / Password", risk: "high" },
          ].map((t) => (
            <div key={t.cls} className="flex items-center justify-between p-2 rounded border">
              <span className="text-xs font-mono">{t.cls}</span>
              <div className="flex gap-2">
                <Badge variant="outline">{t.bio}</Badge>
                <Badge>risk ceiling: {t.risk}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm">Escalation Chain</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-xs">
            <div className="p-2 rounded bg-muted"><Watch className="h-4 w-4 inline mr-1" />Watch</div>
            <span>→</span>
            <div className="p-2 rounded bg-muted"><Smartphone className="h-4 w-4 inline mr-1" />iPhone</div>
            <span>→</span>
            <div className="p-2 rounded bg-muted">iPad / Mac</div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">When risk tier exceeds device ceiling, action escalates to next trusted device</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default APL02AppleDevicesTrust;
