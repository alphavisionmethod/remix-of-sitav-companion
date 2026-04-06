import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Smartphone } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const NSS01StrategyBoard = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <DemoModeBadge />
    <div className="flex items-center gap-3">
      <Layers className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-2xl font-bold">Native Shell Strategy Board</h1>
        <p className="text-muted-foreground">iPhone and Android native shells — one sovereign runtime, native-feeling apps</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { platform: "iOS (iPhone)", tech: ["Swift/SwiftUI", "WebView hybrid"], stage: "alpha", readiness: 25, blockers: ["Core navigation shell", "Push integration"] },
        { platform: "Android", tech: ["Kotlin/Compose", "WebView hybrid"], stage: "planned", readiness: 10, blockers: ["Architecture design", "Material Design shell"] },
        { platform: "iOS Tablet (iPad)", tech: ["SwiftUI", "Sidebar layout"], stage: "planned", readiness: 5, blockers: ["Awaiting iPhone shell", "Tablet layouts"] },
        { platform: "Android Tablet", tech: ["Compose", "Rail navigation"], stage: "planned", readiness: 5, blockers: ["Awaiting Android shell"] },
      ].map((s) => (
        <Card key={s.platform}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2"><Smartphone className="h-4 w-4" /> {s.platform}</CardTitle>
              <Badge variant={s.stage === "alpha" ? "default" : "secondary"}>{s.stage}</Badge>
            </div>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="flex gap-2">{s.tech.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}</div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Readiness:</span>
              <div className="flex-1 h-2 bg-muted rounded overflow-hidden">
                <div className="h-full bg-primary rounded" style={{ width: `${s.readiness}%` }} />
              </div>
              <span>{s.readiness}%</span>
            </div>
            {s.blockers.map((b, i) => <p key={i} className="text-muted-foreground">• {b}</p>)}
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default NSS01StrategyBoard;
