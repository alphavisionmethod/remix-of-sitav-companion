import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rocket, CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";
import { useNssLaunchReadiness } from "@/platform/runtime/hooks/use-native-shell-data";
import NSSSubNav from "@/platform/admin/components/admin/NSSSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const NSS04MobileLaunchHonesty = () => {
  const { data: targets, isLoading } = useNssLaunchReadiness();
  const items = targets ?? [];
  const overall = items.length ? Math.round(items.reduce((s: number,  t: Record<string, any>) => s + (t.readiness ?? 0), 0) / items.length) : 0;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
<NSSSubNav />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><Rocket className="h-8 w-8 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold">Mobile Launch Honesty Board</h1>
            <p className="text-muted-foreground">Launch readiness for native shells, features, and capabilities</p>
          </div>
        </div>
        <Badge variant="secondary">{overall}% overall</Badge>
      </div>

      {isLoading ? <p className="text-xs text-muted-foreground">Loading…</p> : (
        <>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {[
              { label: "Production", count: items.filter((t: Record<string, any>) => t.stage === "production").length },
              { label: "Alpha", count: items.filter((t: Record<string, any>) => t.stage === "alpha").length },
              { label: "Planned", count: items.filter((t: Record<string, any>) => t.stage === "planned").length },
              { label: "Critical Path", count: items.filter((t: Record<string, any>) => t.critical).length },
            ].map((s) => (
              <Card key={s.label}><CardContent className="pt-4 pb-3"><div className="text-xs text-muted-foreground">{s.label}</div><div className="text-2xl font-bold">{s.count}</div></CardContent></Card>
            ))}
          </div>

          <Tabs defaultValue="grid" className="space-y-4">
            <TabsList>
              <TabsTrigger value="grid">Launch Grid</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="grid">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item: Record<string, any>) => (
                  <Card key={item.target} className={item.critical ? "border-primary/50" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{item.target}</CardTitle>
                        <div className="flex gap-1">{item.critical && <Badge variant="destructive" className="text-[10px]">critical</Badge>}<Badge variant={item.stage === "production" ? "default" : item.stage === "alpha" ? "default" : "secondary"}>{item.stage}</Badge></div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs"><span>Readiness</span><span className="font-mono">{item.readiness}%</span></div>
                        <Progress value={item.readiness} className="h-2" />
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={item.webAlt ? "default" : "outline"} className="text-[10px]">{item.webAlt ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}Web alt</Badge>
                        <Badge variant={item.native ? "default" : "outline"} className="text-[10px]">{item.native ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}Native</Badge>
                      </div>
                      {item.blockers?.length > 0 && <div className="space-y-1"><span className="text-[10px] flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Blockers</span>{item.blockers.map((b: string, i: number) => <p key={i} className="text-[10px] text-muted-foreground pl-4">• {b}</p>)}</div>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="timeline">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  {[
                    { q: "Now", label: "Production", filter: (t: Record<string, any>) => t.stage === "production" },
                    { q: "Q2 2026", label: "Alpha", filter: (t: Record<string, any>) => t.stage === "alpha" },
                    { q: "Q3–Q4 2026", label: "Planned — Critical", filter: (t: Record<string, any>) => t.stage === "planned" && t.critical },
                    { q: "Q1 2027", label: "Planned — Extension", filter: (t: Record<string, any>) => t.stage === "planned" && !t.critical },
                  ].map((q) => {
                    const filtered = items.filter(q.filter);
                    if (!filtered.length) return null;
                    return (
                      <div key={q.q} className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2"><span className="font-medium text-sm">{q.q} — {q.label}</span><Badge variant="outline"><Clock className="h-3 w-3 mr-1" />{filtered.length} items</Badge></div>
                        <div className="flex flex-wrap gap-2">{filtered.map((i: Record<string, any>) => <Badge key={i.key} variant="secondary">{i.target} ({i.readiness}%)</Badge>)}</div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default NSS04MobileLaunchHonesty;
