import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Radio, CheckCircle2, Wifi, Smartphone, Loader2 } from "lucide-react";
import { useWearableProviders } from "@/hooks/use-health-signal-data";
import { DEMO_SIGNAL_PROVIDERS } from "@/data/seed/health-signals";
import HRSSubNav from "@/components/admin/HRSSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";



const HRS02SignalSourcesBoard = () => {
  const { isDemoMode } = useDataMode();
  const { data: providers, isLoading } = useWearableProviders();

  // Use DB data if available, map to display shape; else use demo
  const displayProviders = providers && providers.length > 0 && 'provider_key' in (providers[0] as never)
    ? (providers as never[]).map((p: Record<string, any>) => ({
        key: p.provider_key || p.key,
        name: p.display_name || p.name,
        api: p.api_type || p.api || "REST API",
        native: p.native ?? false,
        partner: p.partner ?? false,
        stage: p.launch_stage || p.stage || "planned",
        readiness: p.readiness ?? 0,
        signals: p.categories || p.signals || [],
        platform: p.platform || "Cloud",
      }))
    : (providers as typeof DEMO_SIGNAL_PROVIDERS) ?? DEMO_SIGNAL_PROVIDERS;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
<HRSSubNav />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Radio className="h-8 w-8 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Signal Sources Board</h1>
          <p className="text-muted-foreground">Signal provider registry — all health/readiness data sources</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Providers", value: displayProviders.length, icon: Radio },
              { label: "Native", value: displayProviders.filter((p: Record<string, any>) => p.native).length, icon: Smartphone },
              { label: "Cloud API", value: displayProviders.filter((p: Record<string, any>) => !p.native && p.api !== "Manual").length, icon: Wifi },
              { label: "Partner", value: displayProviders.filter((p: Record<string, any>) => p.partner).length, icon: CheckCircle2 },
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
                {displayProviders.map((p: Record<string, any>) => (
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
                        {(Array.isArray(p.signals) ? p.signals : []).map((s: string) => <Badge key={s} variant="outline" className="text-[10px] font-mono">{s}</Badge>)}
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
                    <thead><tr className="border-b"><th className="text-left p-2">Signal</th>{displayProviders.slice(0, 6).map((p: Record<string, any>) => <th key={p.key} className="p-2 text-center">{p.name.split(" ")[0]}</th>)}</tr></thead>
                    <tbody>
                      {["heart_rate", "sleep", "steps", "hrv", "exercise", "stress"].map((sig) => (
                        <tr key={sig} className="border-b">
                          <td className="p-2 font-mono">{sig}</td>
                          {displayProviders.slice(0, 6).map((p: Record<string, any>) => (
                            <td key={p.key} className="p-2 text-center">{Array.isArray(p.signals) && p.signals.includes(sig) ? <CheckCircle2 className="h-3 w-3 mx-auto text-green-500" /> : <span className="text-muted-foreground">—</span>}</td>
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
        </>
      )}
    </div>
  );
};

export default HRS02SignalSourcesBoard;
