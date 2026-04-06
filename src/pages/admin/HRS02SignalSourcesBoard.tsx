import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Radio, CheckCircle2, Clock, Activity, Wifi, Smartphone, AlertTriangle } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const PROVIDERS = [
  { key: "apple_health", name: "Apple Health", api: "HealthKit", native: true, partner: false, stage: "planned", readiness: 10, signals: ["heart_rate", "hrv", "sleep", "steps", "vo2max", "workout"], platform: "iOS" },
  { key: "health_connect", name: "Health Connect", api: "Health Connect API", native: true, partner: false, stage: "planned", readiness: 6, signals: ["heart_rate", "steps", "sleep", "exercise", "blood_glucose"], platform: "Android" },
  { key: "fitbit", name: "Fitbit", api: "REST API", native: false, partner: false, stage: "planned", readiness: 0, signals: ["heart_rate", "sleep", "steps", "activity_zones"], platform: "Cloud" },
  { key: "garmin", name: "Garmin", api: "REST API", native: false, partner: true, stage: "planned", readiness: 0, signals: ["heart_rate", "sleep", "stress", "body_battery"], platform: "Cloud" },
  { key: "oura", name: "Oura Ring", api: "REST API", native: false, partner: false, stage: "planned", readiness: 0, signals: ["sleep", "readiness", "activity", "hrv"], platform: "Cloud" },
  { key: "whoop", name: "Whoop", api: "REST API", native: false, partner: true, stage: "planned", readiness: 0, signals: ["strain", "recovery", "sleep", "hrv"], platform: "Cloud" },
  { key: "polar", name: "Polar", api: "REST API", native: false, partner: true, stage: "planned", readiness: 0, signals: ["heart_rate", "sleep", "training_load"], platform: "Cloud" },
  { key: "manual_input", name: "Manual Input", api: "Manual", native: false, partner: false, stage: "planned", readiness: 15, signals: ["mood", "energy", "pain", "custom"], platform: "All" },
  { key: "device_focus", name: "Device Focus State", api: "SDK", native: true, partner: false, stage: "alpha", readiness: 30, signals: ["focus_mode", "dnd_state", "screen_state"], platform: "iOS/Android" },
];

const HRS02SignalSourcesBoard = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
    <DemoModeBadge />
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10"><Radio className="h-8 w-8 text-primary" /></div>
      <div>
        <h1 className="text-2xl font-bold">Signal Sources Board</h1>
        <p className="text-muted-foreground">Signal provider registry — all health/readiness data sources</p>
      </div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: "Total Providers", value: PROVIDERS.length, icon: Radio },
        { label: "Native", value: PROVIDERS.filter(p => p.native).length, icon: Smartphone },
        { label: "Cloud API", value: PROVIDERS.filter(p => !p.native && p.api !== "Manual").length, icon: Wifi },
        { label: "Partner", value: PROVIDERS.filter(p => p.partner).length, icon: CheckCircle2 },
      ].map((s) => (
        <Card key={s.label}><CardContent className="pt-4 pb-3"><div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{s.label}</span><s.icon className="h-4 w-4 text-muted-foreground" /></div><div className="text-2xl font-bold">{s.value}</div></CardContent></Card>
      ))}
    </div>

    <Tabs defaultValue="providers" className="space-y-4">
      <TabsList>
        <TabsTrigger value="providers">Providers</TabsTrigger>
        <TabsTrigger value="signals">Signal Coverage</TabsTrigger>
      </TabsList>

      <TabsContent value="providers">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROVIDERS.map((p) => (
            <Card key={p.key} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{p.name}</CardTitle>
                  <Badge variant={p.stage === "alpha" ? "default" : "secondary"}>{p.stage}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs"><span>Readiness</span><span className="font-mono">{p.readiness}%</span></div>
                  <Progress value={p.readiness} className="h-2" />
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-[10px]">API: {p.api}</Badge>
                  <Badge variant="outline" className="text-[10px]">{p.platform}</Badge>
                  {p.native && <Badge variant="secondary" className="text-[10px]">Native</Badge>}
                  {p.partner && <Badge variant="secondary" className="text-[10px]">Partner</Badge>}
                </div>
                <div className="flex flex-wrap gap-1">
                  {p.signals.map((s) => <Badge key={s} variant="outline" className="text-[10px] font-mono">{s}</Badge>)}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">{p.key}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="signals">
        <Card>
          <CardHeader><CardTitle className="text-sm">Signal Type Coverage</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left p-2">Signal</th>{PROVIDERS.slice(0, 6).map((p) => <th key={p.key} className="p-2 text-center">{p.name.split(" ")[0]}</th>)}</tr></thead>
                <tbody>
                  {["heart_rate", "sleep", "steps", "hrv", "exercise", "stress"].map((sig) => (
                    <tr key={sig} className="border-b">
                      <td className="p-2 font-mono">{sig}</td>
                      {PROVIDERS.slice(0, 6).map((p) => (
                        <td key={p.key} className="p-2 text-center">{p.signals.includes(sig) ? <CheckCircle2 className="h-3 w-3 mx-auto text-green-500" /> : <span className="text-muted-foreground">—</span>}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
);

export default HRS02SignalSourcesBoard;
