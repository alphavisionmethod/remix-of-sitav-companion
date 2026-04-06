import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const NRC06NotificationLaunchHonesty = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <DemoModeBadge />
    <div className="flex items-center gap-3">
      <Rocket className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-2xl font-bold">Attention Systems Launch Honesty</h1>
        <p className="text-muted-foreground">Launch truth for routing, fatigue, assistant, and delivery systems</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        { target: "Attention Routing", stage: "alpha", realRouting: true, ruleBased: true, demo: false, blockers: [] },
        { target: "Fatigue Engine", stage: "planned", realRouting: false, ruleBased: false, demo: true, blockers: ["Fatigue tracking implementation"] },
        { target: "Assistant Roles", stage: "alpha", realRouting: false, ruleBased: true, demo: true, blockers: ["Role orchestration engine"] },
        { target: "Queue System", stage: "planned", realRouting: false, ruleBased: false, demo: true, blockers: ["Queue persistence", "Digest generation"] },
        { target: "Cross-Device Delivery", stage: "planned", realRouting: false, ruleBased: false, demo: true, blockers: ["Native push setup", "Multi-device coordination"] },
        { target: "Calm Synthesis", stage: "planned", realRouting: false, ruleBased: false, demo: true, blockers: ["Tone engine", "Summarization system"] },
      ].map((item) => (
        <Card key={item.target}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{item.target}</CardTitle>
              <Badge variant={item.stage === "alpha" ? "default" : "secondary"}>{item.stage}</Badge>
            </div>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="flex gap-2 flex-wrap">
              <Badge variant={item.realRouting ? "default" : "outline"}>Real: {item.realRouting ? "✓" : "✗"}</Badge>
              <Badge variant={item.ruleBased ? "default" : "outline"}>Rule-based: {item.ruleBased ? "✓" : "✗"}</Badge>
              <Badge variant={item.demo ? "default" : "outline"}>Demo: {item.demo ? "✓" : "✗"}</Badge>
            </div>
            {item.blockers.map((b, i) => <p key={i} className="text-muted-foreground">• {b}</p>)}
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default NRC06NotificationLaunchHonesty;
