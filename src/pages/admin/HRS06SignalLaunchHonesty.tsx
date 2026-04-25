import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Rocket, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Loader2, Database } from "lucide-react";
import { useSignalSubsystemReadiness } from "@/hooks/use-health-signal-data";
import { useSeedEcosystemData } from "@/hooks/useEcosystemDevices";
import HRSSubNav from "@/platform/admin/components/admin/HRSSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const HRS06SignalLaunchHonesty = () => {
  const { data: subsystems, isLoading } = useSignalSubsystemReadiness();
  const seedMutation = useSeedEcosystemData();

  const items = subsystems ?? [];
  const overall = items.length > 0 ? Math.round(items.reduce((s: number,  t: Record<string, any>) => s + (t.readiness ?? 0), 0) / items.length) : 0;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
<HRSSubNav />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><Rocket className="h-8 w-8 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold">Signal Launch Honesty Board</h1>
            <p className="text-muted-foreground">Launch truth for every signal intelligence subsystem</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={() => seedMutation.mutate("apple")} disabled={seedMutation.isPending}>
            {seedMutation.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Database className="h-3 w-3 mr-1" />}Seed Signal Data
          </Button>
          <Badge variant="secondary">{overall}% overall</Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Demo Ready", count: items.filter((t: Record<string, any>) => t.demo).length },
              { label: "Real Data", count: items.filter((t: Record<string, any>) => t.real).length },
              { label: "Critical Path", count: items.filter((t: Record<string, any>) => t.critical).length },
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
                {items.map((item: Record<string, any>) => (
                  <Card key={item.target || item.key} className={item.critical ? "border-primary/50" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{item.target}</CardTitle>
                        <div className="flex gap-1">{item.critical && <Badge variant="destructive" className="text-[10px]">critical</Badge>}<Badge variant={item.stage === "internal" || item.stage === "production" ? "default" : "secondary"}>{item.stage}</Badge></div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs"><span>Readiness</span><span className="font-mono">{item.readiness}%</span></div>
                        <Progress value={item.readiness} className="h-2" />
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={item.demo ? "default" : "outline"} className="text-[10px]">{item.demo ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}Demo</Badge>
                        <Badge variant={item.real ? "default" : "outline"} className="text-[10px]">{item.real ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}Real</Badge>
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
                    {items.filter((s: Record<string, any>) => s.key !== "hrs_demo").map((s: any, i: number) => (
                      <div key={s.key} className="flex items-center gap-2">
                        {i > 0 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                        <div className={`p-3 rounded-lg border ${s.readiness > 50 ? "bg-green-500/10" : "bg-muted/30"}`}>
                          <div className="text-xs font-medium">{s.target}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">{s.readiness}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">Each subsystem must reach &gt;80% readiness before the next stage can be considered production-ready.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default HRS06SignalLaunchHonesty;
