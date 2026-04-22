import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rocket, CheckCircle2, XCircle, AlertTriangle, Clock, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import APLSubNav from "@/components/admin/APLSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

// Production fallback — seed data removed
const DEMO_TARGETS: any[] = [];

const APL06AppleLaunchReadiness = () => {
  const { data: dbTargets } = useQuery({
    queryKey: ["apl-launch-readiness"],
    queryFn: async () => {
      const { data } = await fromTable("ambient_launch_readiness").select("*").like("target_key", "apple_%");
      return data || [];
    },
  });

  const overallReadiness = Math.round(([] as typeof DEMO_TARGETS).reduce((s, t) => s + t.readiness, 0) / ([] as typeof DEMO_TARGETS).length);
  const totalBlockers = ([] as typeof DEMO_TARGETS).reduce((s, t) => s + t.blockers.length, 0);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
<APLSubNav />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><Rocket className="h-8 w-8 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold">Apple Launch Readiness Board</h1>
            <p className="text-muted-foreground">Per-surface launch honesty for the Apple ecosystem</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">{totalBlockers} blockers</Badge>
          <Badge variant={overallReadiness > 50 ? "default" : "secondary"}>{overallReadiness}% overall</Badge>
        </div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        {[
          { label: "Demo Ready", count: ([] as typeof DEMO_TARGETS).filter(t => t.demo).length, total: ([] as typeof DEMO_TARGETS).length, color: "text-green-500" },
          { label: "Pilot Ready", count: ([] as typeof DEMO_TARGETS).filter(t => t.pilot).length, total: ([] as typeof DEMO_TARGETS).length, color: "text-amber-500" },
          { label: "Launch Ready", count: ([] as typeof DEMO_TARGETS).filter(t => t.launch).length, total: ([] as typeof DEMO_TARGETS).length, color: "text-blue-500" },
          { label: "Critical Path", count: ([] as typeof DEMO_TARGETS).filter(t => t.critical).length, total: ([] as typeof DEMO_TARGETS).length, color: "text-destructive" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-3">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.count}/{s.total}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Surface Grid</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="deps">Dependencies</TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {([] as typeof DEMO_TARGETS).map((item) => (
              <Card key={item.target} className={item.critical ? "border-primary/50" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{item.target}</CardTitle>
                    <div className="flex gap-1">
                      {item.critical && <Badge variant="destructive" className="text-[10px]">critical path</Badge>}
                      <Badge variant={item.stage === "alpha" ? "default" : "secondary"}>{item.stage}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs"><span>Readiness</span><span className="font-mono">{item.readiness}%</span></div>
                    <Progress value={item.readiness} className="h-2" />
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={item.demo ? "default" : "outline"} className="text-[10px]">{item.demo ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}Demo</Badge>
                    <Badge variant={item.pilot ? "default" : "outline"} className="text-[10px]">{item.pilot ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}Pilot</Badge>
                    <Badge variant={item.launch ? "default" : "outline"} className="text-[10px]">{item.launch ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}Launch</Badge>
                  </div>
                  {item.blockers.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Blockers ({item.blockers.length})</span>
                      {item.blockers.map((b, i) => <p key={i} className="text-[10px] text-muted-foreground pl-4">• {b}</p>)}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {[
                { quarter: "Q2 2026", items: ([] as typeof DEMO_TARGETS).filter(t => t.stage === "alpha"), label: "Alpha" },
                { quarter: "Q3 2026", items: ([] as typeof DEMO_TARGETS).filter(t => t.critical && t.stage === "planned"), label: "Critical Path" },
                { quarter: "Q4 2026", items: ([] as typeof DEMO_TARGETS).filter(t => !t.critical && t.stage === "planned"), label: "Expansion" },
              ].map((q) => (
                <div key={q.quarter} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{q.quarter} — {q.label}</span>
                    <Badge variant="outline">{q.items.length} surfaces</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {q.items.map((item) => (
                      <Badge key={item.key} variant="secondary">{item.target} ({item.readiness}%)</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deps">
          <Card>
            <CardHeader><CardTitle className="text-sm">Dependency Graph</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {([] as typeof DEMO_TARGETS).filter(t => t.deps.length > 0).map((t) => (
                <div key={t.key} className="flex items-center gap-2 text-xs p-2 rounded border">
                  <span className="font-medium min-w-[140px]">{t.target}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">depends on:</span>
                  {t.deps.map((d) => <Badge key={d} variant="outline" className="font-mono">{d}</Badge>)}
                </div>
              ))}
              {([] as typeof DEMO_TARGETS).filter(t => t.deps.length === 0).map((t) => (
                <div key={t.key} className="flex items-center gap-2 text-xs p-2 rounded border bg-green-500/5">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  <span className="font-medium">{t.target}</span>
                  <span className="text-muted-foreground">— no dependencies (can start independently)</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APL06AppleLaunchReadiness;
