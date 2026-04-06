import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rocket, CheckCircle2, XCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useNrcLaunchReadiness } from "@/hooks/use-notification-calm-data";

const NRC06NotificationLaunchHonesty = () => {
  const { data: subsystems, isLoading } = useNrcLaunchReadiness();
  const items = subsystems ?? [];
  const overall = items.length ? Math.round(items.reduce((s: number, t: any) => s + (t.readiness ?? 0), 0) / items.length) : 0;

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

      {isLoading ? <p className="text-xs text-muted-foreground">Loading…</p> : (
        <>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Real Routing", count: items.filter((t: any) => t.realRouting).length },
              { label: "Rule-based", count: items.filter((t: any) => t.ruleBased).length },
              { label: "Demo Ready", count: items.filter((t: any) => t.demo).length },
              { label: "Critical", count: items.filter((t: any) => t.critical).length },
            ].map((s) => (
              <Card key={s.label}><CardContent className="pt-4 pb-3"><div className="text-xs text-muted-foreground">{s.label}</div><div className="text-2xl font-bold">{s.count}/{items.length}</div></CardContent></Card>
            ))}
          </div>

          <Tabs defaultValue="grid" className="space-y-4">
            <TabsList>
              <TabsTrigger value="grid">Subsystem Grid</TabsTrigger>
              <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
            </TabsList>

            <TabsContent value="grid">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item: any) => (
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
                      {item.blockers?.length > 0 && <div className="space-y-1"><span className="text-[10px] flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Blockers</span>{item.blockers.map((b: string, i: number) => <p key={i} className="text-[10px] text-muted-foreground pl-4">• {b}</p>)}</div>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pipeline">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 flex-wrap">
                    {items.map((s: any, i: number) => (
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
        </>
      )}
    </div>
  );
};

export default NRC06NotificationLaunchHonesty;
