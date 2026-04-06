import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const HRS02SignalSourcesBoard = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <DemoModeBadge />
    <div className="flex items-center gap-3">
      <Radio className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-2xl font-bold">Signal Sources Board</h1>
        <p className="text-muted-foreground">Signal provider registry — all health/readiness data sources</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        { key: "apple_health", name: "Apple Health", api: "healthkit", native: true, partner: false, stage: "planned" },
        { key: "health_connect", name: "Health Connect", api: "health_connect", native: true, partner: false, stage: "planned" },
        { key: "fitbit", name: "Fitbit", api: "rest", native: false, partner: false, stage: "planned" },
        { key: "garmin", name: "Garmin", api: "rest", native: false, partner: true, stage: "planned" },
        { key: "oura", name: "Oura Ring", api: "rest", native: false, partner: false, stage: "planned" },
        { key: "whoop", name: "Whoop", api: "rest", native: false, partner: true, stage: "planned" },
        { key: "polar", name: "Polar", api: "rest", native: false, partner: true, stage: "planned" },
        { key: "manual_input", name: "Manual Input", api: "manual", native: false, partner: false, stage: "planned" },
        { key: "device_focus_state", name: "Device Focus State", api: "sdk", native: true, partner: false, stage: "planned" },
      ].map((p) => (
        <Card key={p.key}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{p.name}</CardTitle>
              <Badge variant="secondary">{p.stage}</Badge>
            </div>
          </CardHeader>
          <CardContent className="text-xs space-y-1">
            <div className="flex gap-2">
              <Badge variant="outline">API: {p.api}</Badge>
              {p.native && <Badge variant="outline">Native app</Badge>}
              {p.partner && <Badge variant="outline">Partner program</Badge>}
            </div>
            <p className="font-mono text-muted-foreground">{p.key}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default HRS02SignalSourcesBoard;
