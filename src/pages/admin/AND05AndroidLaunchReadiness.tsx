import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const AND05AndroidLaunchReadiness = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <DemoModeBadge />
    <div className="flex items-center gap-3">
      <Rocket className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-2xl font-bold">Android Launch Readiness Board</h1>
        <p className="text-muted-foreground">Per-surface launch honesty for the Android ecosystem</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        { target: "Android Shell", stage: "planned", demo: false, blockers: ["Native app architecture", "Material Design implementation"] },
        { target: "Wear OS Shell", stage: "planned", demo: true, blockers: ["Tile SDK integration", "Complication design"] },
        { target: "Android Trust", stage: "planned", demo: false, blockers: ["Keystore integration", "SafetyNet verification flow"] },
        { target: "Android Health", stage: "planned", demo: true, blockers: ["Health Connect API integration", "Consent flow design"] },
        { target: "Android Push (FCM)", stage: "planned", demo: false, blockers: ["FCM setup", "Channel configuration"] },
      ].map((item) => (
        <Card key={item.target}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{item.target}</CardTitle>
              <Badge variant="secondary">{item.stage}</Badge>
            </div>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <Badge variant={item.demo ? "default" : "outline"}>Demo: {item.demo ? "✓" : "✗"}</Badge>
            {item.blockers.map((b, i) => <p key={i} className="text-muted-foreground">• {b}</p>)}
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default AND05AndroidLaunchReadiness;
