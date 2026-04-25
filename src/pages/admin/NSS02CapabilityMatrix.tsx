import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid3X3, CheckCircle2, AlertTriangle } from "lucide-react";
import { useCapabilitySurfaceBindings } from "@/hooks/use-native-shell-data";
import NSSSubNav from "@/platform/admin/components/admin/NSSSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const getBadgeVariant = (v: string) => v === "full" ? "default" as const : v === "n/a" ? "outline" as const : "secondary" as const;

const NSS02CapabilityMatrix = () => {
  const { data: capabilities, isLoading } = useCapabilitySurfaceBindings();
  const items = capabilities ?? [];

  const fitClasses = [
    { fit: "mobile_primary", desc: "Best experience on mobile, adapted elsewhere" },
    { fit: "desktop_primary", desc: "Best experience on desktop, simplified on mobile" },
    { fit: "cross_surface", desc: "Works well on all surfaces" },
    { fit: "wearable_micro", desc: "Micro-interaction designed for wearables" },
    { fit: "mobile_only", desc: "Requires mobile hardware (camera, NFC)" },
    { fit: "not_mobile", desc: "Desktop-only — too complex for mobile" },
    { fit: "mobile_supported", desc: "Supported on mobile with full experience" },
  ].map(f => ({ ...f, count: items.filter((c: Record<string, any>) => (c.fit ?? c.surface_fit) === f.fit).length })).filter(f => f.count > 0);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
<NSSSubNav />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Grid3X3 className="h-8 w-8 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Mobile Capability Matrix</h1>
          <p className="text-muted-foreground">Surface fit classification for every capability</p>
        </div>
      </div>

      <Tabs defaultValue="matrix" className="space-y-4">
        <TabsList>
          <TabsTrigger value="matrix">Full Matrix</TabsTrigger>
          <TabsTrigger value="fit">Fit Classes</TabsTrigger>
          <TabsTrigger value="native">Native Requirements</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix">
          <Card>
            <CardContent className="pt-6">
              {isLoading ? <p className="text-xs text-muted-foreground">Loading…</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b">
                      <th className="text-left p-2">Capability</th>
                      <th className="p-2">Mobile</th>
                      <th className="p-2">Desktop</th>
                      <th className="p-2">Watch</th>
                      <th className="p-2">Tablet</th>
                      <th className="p-2">Fit Class</th>
                      <th className="p-2">Native</th>
                    </tr></thead>
                    <tbody>
                      {items.map((r: Record<string, any>) => (
                        <tr key={r.cap ?? r.capability_key} className="border-b hover:bg-muted/30">
                          <td className="p-2 font-medium">{r.cap ?? r.capability_name}</td>
                          <td className="p-2 text-center"><Badge variant={getBadgeVariant(r.mobile ?? "n/a")} className="text-[10px]">{r.mobile ?? r.mobile_experience}</Badge></td>
                          <td className="p-2 text-center"><Badge variant={getBadgeVariant(r.desktop ?? "n/a")} className="text-[10px]">{r.desktop ?? r.desktop_experience}</Badge></td>
                          <td className="p-2 text-center"><Badge variant={getBadgeVariant(r.watch ?? "n/a")} className="text-[10px]">{r.watch ?? r.wearable_experience}</Badge></td>
                          <td className="p-2 text-center"><Badge variant={getBadgeVariant(r.tablet ?? "n/a")} className="text-[10px]">{r.tablet ?? "n/a"}</Badge></td>
                          <td className="p-2 text-center"><Badge variant="secondary" className="text-[10px] font-mono">{r.fit ?? r.surface_fit}</Badge></td>
                          <td className="p-2 text-center">{(r.nativeRequired ?? r.requires_native_api) ? <CheckCircle2 className="h-3 w-3 mx-auto text-amber-500" /> : <span className="text-muted-foreground">—</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fit">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fitClasses.map((f) => (
              <Card key={f.fit}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-mono">{f.fit}</CardTitle>
                    <Badge variant="outline">{f.count} capabilities</Badge>
                  </div>
                </CardHeader>
                <CardContent><p className="text-xs text-muted-foreground">{f.desc}</p></CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="native">
          <Card>
            <CardHeader><CardTitle className="text-sm">Native-Required Capabilities</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {items.filter((c: Record<string, any>) => c.nativeRequired ?? c.requires_native_api).map((c: Record<string, any>) => (
                <div key={c.cap ?? c.capability_key} className="flex items-center justify-between p-3 rounded border text-xs">
                  <div className="flex items-center gap-2"><AlertTriangle className="h-3 w-3 text-amber-500" /><span className="font-medium">{c.cap ?? c.capability_name}</span></div>
                  <div className="flex gap-1">
                    <Badge variant={getBadgeVariant(c.mobile ?? "n/a")} className="text-[10px]">M: {c.mobile ?? c.mobile_experience}</Badge>
                    <Badge variant={getBadgeVariant(c.watch ?? "n/a")} className="text-[10px]">W: {c.watch ?? c.wearable_experience}</Badge>
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-muted-foreground mt-2">These capabilities require native platform APIs and cannot be fully implemented in WebView alone.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NSS02CapabilityMatrix;
