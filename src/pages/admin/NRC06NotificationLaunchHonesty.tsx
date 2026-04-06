import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rocket, CheckCircle2, XCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const SUBSYSTEMS = [
  { target: "Attention Routing", key: "nrc_routing", stage: "alpha", readiness: 35, realRouting: true, ruleBased: true, demo: false, blockers: [], critical: true },
  { target: "Fatigue Engine", key: "nrc_fatigue", stage: "planned", readiness: 10, realRouting: false, ruleBased: false, demo: true, blockers: ["Fatigue tracking implementation", "Signal weighting calibration"], critical: true },
  { target: "Assistant Roles", key: "nrc_roles", stage: "alpha", readiness: 40, realRouting: false, ruleBased: true, demo: true, blockers: ["Role orchestration engine"], critical: false },
  { target: "Queue System", key: "nrc_queue", stage: "planned", readiness: 8, realRouting: false, ruleBased: false, demo: true, blockers: ["Queue persistence", "Digest generation", "Retention policies"], critical: true },
  { target: "Cross-Device Delivery", key: "nrc_cross", stage: "planned", readiness: 5, realRouting: false, ruleBased: false, demo: true, blockers: ["Native push setup", "Multi-device coordination", "Presence detection"], critical: false },
  { target: "Calm Synthesis", key: "nrc_calm", stage: "planned", readiness: 12, realRouting: false, ruleBased: false, demo: true, blockers: ["Tone engine", "Summarization system"], critical: false },
];

const NRC06NotificationLaunchHonesty = () => {
  const overall = Math.round(SUBSYSTEMS.reduce((s, t) => s + t.readiness, 0) / SUBSYSTEMS.length);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <DemoModeBadge />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><Rocket className="h-8 w-8 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold">Attention Systems Launch Honesty</h1>
            <p className="text-muted-foreground">Launch truth for routing, fatigue, assistant, and delivery systems</p>
          </div>
        </div>
        <Badge variant="secondary">{overall}% overall</Badge>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Real Routing", count: SUBSYSTEMS.filter(t => t.realRouting).length },
          { label: "Rule-based", count: SUBSYSTEMS.filter(t => t.ruleBased).length },
          { label: "Demo Ready", count: SUBSYSTEMS.filter(t => t.demo).length },
          { label: "Critical", count: SUBSYSTEMS.filter(t => t.critical).length },
        ].map((s) => (
          <Card key={s.label}><CardContent className="pt-4 pb-3"><div className="text-xs text-muted-foreground">{s.label}</div><div className="text-2xl font-bold">{s.count}/{SUBSYSTEMS.length}</div></CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Subsystem Grid</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUBSYSTEMS.map((item) => (
              <Card key={item.target} className={item.critical ? "border-primary/50" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{item.target}</CardTitle>
                    <div className="flex gap-1">{item.critical && <Badge variant="destructive" className="text-[10px]">critical</Badge>}<Badge variant={item.stage === "alpha" ? "default" : "secondary"}>{item.stage}</Badge></div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs"><span>Readiness</span><span className="font-mono">{item.readiness}%</span></div>
                    <Progress value={item.readiness} className="h-2" />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant={item.realRouting ? "default" : "outline"} className="text-[10px]">{item.realRouting ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}Real</Badge>
                    <Badge variant={item.ruleBased ? "default" : "outline"} className="text-[10px]">{item.ruleBased ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}Rule-based</Badge>
                    <Badge variant={item.demo ? "default" : "outline"} className="text-[10px]">{item.demo ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}Demo</Badge>
                  </div>
                  {item.blockers.length > 0 && <div className="space-y-1"><span className="text-[10px] flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Blockers</span>{item.blockers.map((b, i) => <p key={i} className="text-[10px] text-muted-foreground pl-4">• {b}</p>)}</div>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pipeline">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 flex-wrap">
                {SUBSYSTEMS.map((s, i) => (
                  <div key={s.key} className="flex items-center gap-2">
                    {i > 0 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                    <div className={`p-3 rounded-lg border ${s.readiness > 30 ? "bg-green-500/10" : "bg-muted/30"}`}>
                      <div className="text-xs font-medium">{s.target}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{s.readiness}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NRC06NotificationLaunchHonesty;
