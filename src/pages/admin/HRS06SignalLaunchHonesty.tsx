import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket } from "lucide-react";

const HRS06SignalLaunchHonesty = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
    <div className="flex items-center gap-3">
      <Rocket className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-2xl font-bold">Signal Launch Honesty Board</h1>
        <p className="text-muted-foreground">Launch truth for every signal intelligence subsystem</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        { target: "Signal Ingestion", stage: "planned", demo: true, real: false, blockers: ["Provider API integrations", "Native SDK setup"] },
        { target: "Normalization", stage: "planned", demo: true, real: false, blockers: ["Signal mapping engine", "Unit conversion system"] },
        { target: "Readiness Derivation", stage: "planned", demo: true, real: false, blockers: ["Derivation rules engine", "Multi-signal combine"] },
        { target: "Routing Influence", stage: "planned", demo: true, real: false, blockers: ["Calm router integration", "Readiness → posture mapping"] },
        { target: "Assistant Timing", stage: "planned", demo: true, real: false, blockers: ["Timing rules engine", "Context awareness"] },
        { target: "Demo Signals", stage: "internal", demo: true, real: false, blockers: [] },
      ].map((item) => (
        <Card key={item.target}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{item.target}</CardTitle>
              <Badge variant={item.stage === "internal" ? "default" : "secondary"}>{item.stage}</Badge>
            </div>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="flex gap-2">
              <Badge variant={item.demo ? "default" : "outline"}>Demo: {item.demo ? "✓" : "✗"}</Badge>
              <Badge variant={item.real ? "default" : "outline"}>Real: {item.real ? "✓" : "✗"}</Badge>
            </div>
            {item.blockers.map((b, i) => <p key={i} className="text-muted-foreground">• {b}</p>)}
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default HRS06SignalLaunchHonesty;
