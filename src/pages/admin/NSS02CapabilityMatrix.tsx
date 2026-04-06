import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Grid3X3 } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const NSS02CapabilityMatrix = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <DemoModeBadge />
    <div className="flex items-center gap-3">
      <Grid3X3 className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-2xl font-bold">Mobile Capability Matrix</h1>
        <p className="text-muted-foreground">Surface fit classification for every capability</p>
      </div>
    </div>
    <Card>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b">
              <th className="text-left p-2">Capability</th>
              <th className="p-2">Mobile</th>
              <th className="p-2">Desktop</th>
              <th className="p-2">Watch</th>
              <th className="p-2">Fit</th>
            </tr></thead>
            <tbody>
              {[
                { cap: "Approvals", mobile: "full", desktop: "full", watch: "micro_action", fit: "mobile_primary" },
                { cap: "Alerts", mobile: "full", desktop: "adapted", watch: "glance", fit: "mobile_primary" },
                { cap: "Advisor Chat", mobile: "full", desktop: "full", watch: "n/a", fit: "mobile_supported" },
                { cap: "Daily Pulse", mobile: "full", desktop: "full", watch: "glance", fit: "cross_surface" },
                { cap: "Quick Capture", mobile: "full", desktop: "minimal", watch: "n/a", fit: "mobile_primary" },
                { cap: "Boardroom", mobile: "adapted", desktop: "full", watch: "glance", fit: "desktop_primary" },
                { cap: "Workflow Builder", mobile: "minimal", desktop: "full", watch: "n/a", fit: "desktop_primary" },
                { cap: "AI Engineering", mobile: "n/a", desktop: "full", watch: "n/a", fit: "not_mobile" },
                { cap: "Finance Workspace", mobile: "adapted", desktop: "full", watch: "n/a", fit: "desktop_primary" },
                { cap: "Micro Approvals", mobile: "full", desktop: "n/a", watch: "micro_action", fit: "wearable_micro" },
              ].map((r) => (
                <tr key={r.cap} className="border-b">
                  <td className="p-2 font-medium">{r.cap}</td>
                  <td className="p-2 text-center"><Badge variant={r.mobile === "full" ? "default" : "outline"}>{r.mobile}</Badge></td>
                  <td className="p-2 text-center"><Badge variant={r.desktop === "full" ? "default" : "outline"}>{r.desktop}</Badge></td>
                  <td className="p-2 text-center"><Badge variant={r.watch !== "n/a" ? "default" : "outline"}>{r.watch}</Badge></td>
                  <td className="p-2"><Badge variant="secondary">{r.fit}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default NSS02CapabilityMatrix;
