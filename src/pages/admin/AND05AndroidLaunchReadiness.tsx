import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rocket, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Clock } from "lucide-react";
import ANDSubNav from "@/components/admin/ANDSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

// Production fallback — seed data removed
const DEMO_TARGETS: any[] = [];

const AND05AndroidLaunchReadiness = () => {
  const overall = Math.round(([] as typeof DEMO_TARGETS).reduce((s, t) => s + t.readiness, 0) / ([] as typeof DEMO_TARGETS).length);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
<ANDSubNav />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><Rocket className="h-8 w-8 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold">Android Launch Readiness Board</h1>
            <p className="text-muted-foreground">Per-surface launch honesty for the Android ecosystem</p>
          </div>
        </div>
        <Badge variant="secondary">{overall}% overall</Badge>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Demo Ready", count: ([] as typeof DEMO_TARGETS).filter(t => t.demo).length },
          { label: "Critical Path", count: ([] as typeof DEMO_TARGETS).filter(t => t.critical).length },
          { label: "Total Blockers", count: ([] as typeof DEMO_TARGETS).reduce((s, t) => s + t.blockers.length, 0) },
        ].map((s) => (
          <Card key={s.label}><CardContent className="pt-4 pb-3"><div className="text-xs text-muted-foreground">{s.label}</div><div className="text-2xl font-bold">{s.count}</div></CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Surface Grid</TabsTrigger>
          <TabsTrigger value="deps">Dependencies</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {([] as typeof DEMO_TARGETS).map((t) => (
              <Card key={t.target} className={t.critical ? "border-primary/50" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{t.target}</CardTitle>
                    <div className="flex gap-1">{t.critical && <Badge variant="destructive" className="text-[10px]">critical</Badge>}<Badge variant="secondary">{t.stage}</Badge></div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs"><span>Readiness</span><span className="font-mono">{t.readiness}%</span></div>
                    <Progress value={t.readiness} className="h-2" />
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={t.demo ? "default" : "outline"} className="text-[10px]">{t.demo ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}Demo</Badge>
                    <Badge variant={t.pilot ? "default" : "outline"} className="text-[10px]">{t.pilot ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}Pilot</Badge>
                    <Badge variant={t.launch ? "default" : "outline"} className="text-[10px]">{t.launch ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}Launch</Badge>
                  </div>
                  {t.blockers.length > 0 && <div className="space-y-1"><span className="text-[10px] flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Blockers</span>{t.blockers.map((b, i) => <p key={i} className="text-[10px] text-muted-foreground pl-4">• {b}</p>)}</div>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="deps">
          <Card><CardContent className="pt-6 space-y-3">
            {([] as typeof DEMO_TARGETS).filter(t => t.deps.length > 0).map((t) => (
              <div key={t.key} className="flex items-center gap-2 text-xs p-2 rounded border">
                <span className="font-medium min-w-[120px]">{t.target}</span><ArrowRight className="h-3 w-3" /><span className="text-muted-foreground">depends on:</span>
                {t.deps.map((d) => <Badge key={d} variant="outline" className="font-mono">{d}</Badge>)}
              </div>
            ))}
            {([] as typeof DEMO_TARGETS).filter(t => t.deps.length === 0).map((t) => (
              <div key={t.key} className="flex items-center gap-2 text-xs p-2 rounded border bg-green-500/5">
                <CheckCircle2 className="h-3 w-3 text-green-500" /><span className="font-medium">{t.target}</span><span className="text-muted-foreground">— independent</span>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card><CardContent className="pt-6 space-y-4">
            {[
              { q: "Q3 2026", label: "Foundation", items: ["Android Shell", "FCM Push", "Device Trust"] },
              { q: "Q4 2026", label: "Expansion", items: ["Wear OS Shell", "Health Connect"] },
              { q: "Q1 2027", label: "Polish", items: ["Tablet Shell", "Widgets", "App Links"] },
            ].map((p) => (
              <div key={p.q} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2"><span className="font-medium text-sm">{p.q} — {p.label}</span><Badge variant="outline"><Clock className="h-3 w-3 mr-1" />{p.q}</Badge></div>
                <div className="flex flex-wrap gap-2">{p.items.map((i) => <Badge key={i} variant="secondary">{i}</Badge>)}</div>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AND05AndroidLaunchReadiness;
