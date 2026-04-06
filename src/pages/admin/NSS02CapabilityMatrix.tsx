import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid3X3, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const CAPABILITIES = [
  { cap: "Approvals", mobile: "full", desktop: "full", watch: "micro_action", tablet: "full", fit: "mobile_primary", nativeRequired: false },
  { cap: "Alerts", mobile: "full", desktop: "adapted", watch: "glance", tablet: "full", fit: "mobile_primary", nativeRequired: true },
  { cap: "Advisor Chat", mobile: "full", desktop: "full", watch: "n/a", tablet: "full", fit: "mobile_supported", nativeRequired: false },
  { cap: "Daily Pulse", mobile: "full", desktop: "full", watch: "glance", tablet: "full", fit: "cross_surface", nativeRequired: false },
  { cap: "Quick Capture", mobile: "full", desktop: "minimal", watch: "n/a", tablet: "full", fit: "mobile_primary", nativeRequired: true },
  { cap: "Boardroom", mobile: "adapted", desktop: "full", watch: "glance", tablet: "full", fit: "desktop_primary", nativeRequired: false },
  { cap: "Workflow Builder", mobile: "minimal", desktop: "full", watch: "n/a", tablet: "adapted", fit: "desktop_primary", nativeRequired: false },
  { cap: "AI Engineering", mobile: "n/a", desktop: "full", watch: "n/a", tablet: "adapted", fit: "not_mobile", nativeRequired: false },
  { cap: "Finance Workspace", mobile: "adapted", desktop: "full", watch: "n/a", tablet: "full", fit: "desktop_primary", nativeRequired: false },
  { cap: "Micro Approvals", mobile: "full", desktop: "n/a", watch: "micro_action", tablet: "n/a", fit: "wearable_micro", nativeRequired: true },
  { cap: "Camera Capture", mobile: "full", desktop: "n/a", watch: "n/a", tablet: "full", fit: "mobile_only", nativeRequired: true },
  { cap: "Biometric Actions", mobile: "full", desktop: "limited", watch: "wrist", tablet: "full", fit: "mobile_primary", nativeRequired: true },
  { cap: "Push Notifications", mobile: "full", desktop: "browser", watch: "full", tablet: "full", fit: "cross_surface", nativeRequired: true },
];

const FIT_CLASSES = [
  { fit: "mobile_primary", desc: "Best experience on mobile, adapted elsewhere", count: CAPABILITIES.filter(c => c.fit === "mobile_primary").length },
  { fit: "desktop_primary", desc: "Best experience on desktop, simplified on mobile", count: CAPABILITIES.filter(c => c.fit === "desktop_primary").length },
  { fit: "cross_surface", desc: "Works well on all surfaces", count: CAPABILITIES.filter(c => c.fit === "cross_surface").length },
  { fit: "wearable_micro", desc: "Micro-interaction designed for wearables", count: CAPABILITIES.filter(c => c.fit === "wearable_micro").length },
  { fit: "mobile_only", desc: "Requires mobile hardware (camera, NFC)", count: CAPABILITIES.filter(c => c.fit === "mobile_only").length },
  { fit: "not_mobile", desc: "Desktop-only — too complex for mobile", count: CAPABILITIES.filter(c => c.fit === "not_mobile").length },
];

const getBadgeVariant = (v: string) => v === "full" ? "default" as const : v === "n/a" ? "outline" as const : "secondary" as const;

const NSS02CapabilityMatrix = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
    <DemoModeBadge />
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
                  {CAPABILITIES.map((r) => (
                    <tr key={r.cap} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-medium">{r.cap}</td>
                      <td className="p-2 text-center"><Badge variant={getBadgeVariant(r.mobile)} className="text-[10px]">{r.mobile}</Badge></td>
                      <td className="p-2 text-center"><Badge variant={getBadgeVariant(r.desktop)} className="text-[10px]">{r.desktop}</Badge></td>
                      <td className="p-2 text-center"><Badge variant={getBadgeVariant(r.watch)} className="text-[10px]">{r.watch}</Badge></td>
                      <td className="p-2 text-center"><Badge variant={getBadgeVariant(r.tablet)} className="text-[10px]">{r.tablet}</Badge></td>
                      <td className="p-2 text-center"><Badge variant="secondary" className="text-[10px] font-mono">{r.fit}</Badge></td>
                      <td className="p-2 text-center">{r.nativeRequired ? <CheckCircle2 className="h-3 w-3 mx-auto text-amber-500" /> : <span className="text-muted-foreground">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="fit">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FIT_CLASSES.map((f) => (
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
            {CAPABILITIES.filter(c => c.nativeRequired).map((c) => (
              <div key={c.cap} className="flex items-center justify-between p-3 rounded border text-xs">
                <div className="flex items-center gap-2"><AlertTriangle className="h-3 w-3 text-amber-500" /><span className="font-medium">{c.cap}</span></div>
                <div className="flex gap-1">
                  <Badge variant={getBadgeVariant(c.mobile)} className="text-[10px]">M: {c.mobile}</Badge>
                  <Badge variant={getBadgeVariant(c.watch)} className="text-[10px]">W: {c.watch}</Badge>
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

export default NSS02CapabilityMatrix;
