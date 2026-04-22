import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Layers, Smartphone, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useNativeShellPlatforms } from "@/hooks/use-native-shell-data";
import { DEMO_STRATEGY_PRINCIPLES, DEMO_ARCHITECTURE_LAYERS } from "@/data/seed/native-shell";
import NSSSubNav from "@/components/admin/NSSSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const NSS01StrategyBoard = () => {
  const { data: platforms, isLoading } = useNativeShellPlatforms();
  const items = platforms ?? [];

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
<NSSSubNav />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Layers className="h-8 w-8 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Native Shell Strategy Board</h1>
          <p className="text-muted-foreground">iPhone and Android native shells — one sovereign runtime, native-feeling apps</p>
        </div>
      </div>

      <Tabs defaultValue="platforms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="platforms">Platform Shells</TabsTrigger>
          <TabsTrigger value="strategy">Strategy Principles</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms">
          {isLoading ? <p className="text-xs text-muted-foreground p-4">Loading…</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((s: Record<string, any>) => (
                <Card key={s.platform ?? s.family_key} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2"><Smartphone className="h-4 w-4 text-primary" />{s.platform ?? s.name}</CardTitle>
                      <Badge variant={(s.stage ?? s.launch_stage) === "alpha" ? "default" : "secondary"}>{s.stage ?? s.launch_stage}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs"><span>Readiness</span><span className="font-mono">{s.readiness ?? 0}%</span></div>
                      <Progress value={s.readiness ?? 0} className="h-2" />
                    </div>
                    {s.approach && <p className="text-xs text-muted-foreground">{s.approach}</p>}
                    {s.tech && <div className="flex flex-wrap gap-1">{s.tech.map((t: string) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}</div>}
                    {s.strengths?.length > 0 && (
                      <div className="space-y-1 pt-2 border-t">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" />Strengths</span>
                        {s.strengths.map((st: string) => <p key={st} className="text-[10px] text-muted-foreground pl-4">• {st}</p>)}
                      </div>
                    )}
                    {s.blockers?.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Blockers</span>
                        {s.blockers.map((b: string) => <p key={b} className="text-[10px] text-muted-foreground pl-4">• {b}</p>)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="strategy">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {([] as typeof DEMO_STRATEGY_PRINCIPLES).map((p) => (
              <Card key={p.principle} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{p.principle}</CardTitle>
                    <Badge variant={p.priority === "P0" ? "destructive" : "default"}>{p.priority}</Badge>
                  </div>
                </CardHeader>
                <CardContent><p className="text-xs text-muted-foreground">{p.desc}</p></CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="architecture">
          <Card>
            <CardHeader><CardTitle className="text-sm">Hybrid Shell Architecture</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {([] as typeof DEMO_ARCHITECTURE_LAYERS).map((l) => (
                  <div key={l.layer} className={`p-4 rounded-lg border ${l.color}`}>
                    <div className="font-medium text-sm mb-2">{l.layer}</div>
                    {l.items.map((i) => <div key={i} className="text-xs p-1.5 rounded border bg-background/50 mb-1">{i}</div>)}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">The native shell provides platform-native UX while the WebView layer delivers the full SITA experience.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NSS01StrategyBoard;
