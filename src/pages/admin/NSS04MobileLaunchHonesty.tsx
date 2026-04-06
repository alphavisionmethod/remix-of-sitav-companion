import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const NSS04MobileLaunchHonesty = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <DemoModeBadge />
    <div className="flex items-center gap-3">
      <Rocket className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-2xl font-bold">Mobile Launch Honesty Board</h1>
        <p className="text-muted-foreground">Launch readiness for native shells, features, and capabilities</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        { target: "iPhone Shell", stage: "alpha", readiness: 25, webAlt: true, native: false, blockers: ["Core shell build"] },
        { target: "Android Shell", stage: "planned", readiness: 10, webAlt: true, native: false, blockers: ["Architecture design"] },
        { target: "Tablet Shell", stage: "planned", readiness: 5, webAlt: true, native: false, blockers: ["Phone shells first"] },
        { target: "App-Only Features", stage: "planned", readiness: 0, webAlt: false, native: true, blockers: ["Camera capture", "Biometric actions"] },
        { target: "Web-Only Features", stage: "production", readiness: 100, webAlt: true, native: false, blockers: [] },
        { target: "Native-Only Features", stage: "planned", readiness: 0, webAlt: false, native: true, blockers: ["Push integration", "Background sync"] },
      ].map((item) => (
        <Card key={item.target}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{item.target}</CardTitle>
              <Badge variant={item.stage === "production" ? "default" : item.stage === "alpha" ? "default" : "secondary"}>{item.stage}</Badge>
            </div>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Readiness:</span>
              <div className="flex-1 h-2 bg-muted rounded overflow-hidden">
                <div className="h-full bg-primary rounded" style={{ width: `${item.readiness}%` }} />
              </div>
              <span>{item.readiness}%</span>
            </div>
            <div className="flex gap-2">
              <Badge variant={item.webAlt ? "default" : "outline"}>Web alt: {item.webAlt ? "✓" : "✗"}</Badge>
              <Badge variant={item.native ? "default" : "outline"}>Native: {item.native ? "✓" : "✗"}</Badge>
            </div>
            {item.blockers.map((b, i) => <p key={i} className="text-muted-foreground">• {b}</p>)}
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default NSS04MobileLaunchHonesty;
