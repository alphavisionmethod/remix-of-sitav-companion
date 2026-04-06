import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket } from "lucide-react";

const APL06AppleLaunchReadiness = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
    <div className="flex items-center gap-3">
      <Rocket className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-2xl font-bold">Apple Launch Readiness Board</h1>
        <p className="text-muted-foreground">Per-surface launch honesty for the Apple ecosystem</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        { target: "iPhone Shell", stage: "alpha", demo: true, pilot: false, launch: false, blockers: ["Native app build in progress"] },
        { target: "iPad Shell", stage: "planned", demo: false, pilot: false, launch: false, blockers: ["Awaiting iPhone shell completion", "Tablet layout design needed"] },
        { target: "Apple Watch", stage: "planned", demo: true, pilot: false, launch: false, blockers: ["WatchKit integration pending", "Complication design needed"] },
        { target: "Sign in with Apple", stage: "planned", demo: false, pilot: false, launch: false, blockers: ["Apple Developer Program setup", "Identity provider integration"] },
        { target: "Apple Health", stage: "planned", demo: true, pilot: false, launch: false, blockers: ["HealthKit permissions flow", "Consent UI design", "Privacy review"] },
        { target: "Apple Continuity", stage: "planned", demo: false, pilot: false, launch: false, blockers: ["Requires native app on both surfaces", "Handoff API integration"] },
        { target: "Apple Device Trust", stage: "planned", demo: false, pilot: false, launch: false, blockers: ["Biometric verification flow", "Trust receipt architecture"] },
      ].map((item) => (
        <Card key={item.target}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{item.target}</CardTitle>
              <Badge variant={item.stage === "alpha" ? "default" : "secondary"}>{item.stage}</Badge>
            </div>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="flex gap-2">
              <Badge variant={item.demo ? "default" : "outline"}>Demo: {item.demo ? "✓" : "✗"}</Badge>
              <Badge variant={item.pilot ? "default" : "outline"}>Pilot: {item.pilot ? "✓" : "✗"}</Badge>
              <Badge variant={item.launch ? "default" : "outline"}>Launch: {item.launch ? "✓" : "✗"}</Badge>
            </div>
            {item.blockers.length > 0 && (
              <div className="space-y-1">
                <span className="font-medium">Blockers:</span>
                {item.blockers.map((b, i) => <p key={i} className="text-muted-foreground">• {b}</p>)}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default APL06AppleLaunchReadiness;
