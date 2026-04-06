import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Clock } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const HRS04NotificationInfluence = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <DemoModeBadge />
    <div className="flex items-center gap-3">
      <Bell className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-2xl font-bold">Notification Influence Studio</h1>
        <p className="text-muted-foreground">How readiness states influence notification routing decisions</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BellOff className="h-4 w-4" /> Suppression Rules</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-2">
          {[
            { readiness: "overload_risk", action: "Suppress all non-critical" },
            { readiness: "deep_focus", action: "Defer low + normal urgency" },
            { readiness: "recovery_priority", action: "Suppress unless high+" },
            { readiness: "low_interruption", action: "Queue for next window" },
          ].map((r) => (
            <div key={r.readiness} className="flex justify-between p-2 rounded border">
              <Badge variant="outline">{r.readiness}</Badge>
              <span>{r.action}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Timing Rules</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-2">
          {[
            { readiness: "ideal_strategic_window", action: "Show strategic brief" },
            { readiness: "high", action: "Normal routing, all channels" },
            { readiness: "medium", action: "Prefer summary over push" },
          ].map((r) => (
            <div key={r.readiness} className="flex justify-between p-2 rounded border">
              <Badge variant="outline">{r.readiness}</Badge>
              <span>{r.action}</span>
            </div>
          ))}
          <p className="text-muted-foreground mt-2">Critical urgency always overrides readiness</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default HRS04NotificationInfluence;
