import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const APL05AppleHealthConsent = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <DemoModeBadge />
    <div className="flex items-center gap-3">
      <Heart className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-2xl font-bold">Apple Health Consent Center</h1>
        <p className="text-muted-foreground">HealthKit signal permissions, privacy controls, visibility policies</p>
      </div>
    </div>
    <Card>
      <CardHeader><CardTitle className="text-sm">Signal Consent Matrix</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b">
              <th className="text-left p-2">Signal</th>
              <th className="p-2">Read</th>
              <th className="p-2">Routing</th>
              <th className="p-2">Boardroom</th>
              <th className="p-2">Assistant</th>
              <th className="p-2">Status</th>
            </tr></thead>
            <tbody>
              {["heart_rate", "hrv", "sleep", "steps", "vo2max", "workout", "stand_hours", "respiratory_rate"].map((sig) => (
                <tr key={sig} className="border-b">
                  <td className="p-2 font-mono">{sig}</td>
                  <td className="p-2 text-center"><ShieldCheck className="h-3 w-3 mx-auto text-muted-foreground" /></td>
                  <td className="p-2 text-center"><Eye className="h-3 w-3 mx-auto text-muted-foreground" /></td>
                  <td className="p-2 text-center"><EyeOff className="h-3 w-3 mx-auto text-muted-foreground" /></td>
                  <td className="p-2 text-center"><Eye className="h-3 w-3 mx-auto text-muted-foreground" /></td>
                  <td className="p-2 text-center"><Badge variant="secondary">not consented</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader><CardTitle className="text-sm">Privacy Controls</CardTitle></CardHeader>
      <CardContent className="text-xs space-y-1">
        <p>• All signal types require explicit opt-in consent</p>
        <p>• Routing influence requires separate consent from read access</p>
        <p>• Boardroom visibility requires explicit approval per signal</p>
        <p>• Revoke & erase available at any time</p>
        <p>• Privacy explanation shown before each consent grant</p>
      </CardContent>
    </Card>
  </div>
);

export default APL05AppleHealthConsent;
