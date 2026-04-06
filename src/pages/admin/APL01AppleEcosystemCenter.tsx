import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Apple, Smartphone, Watch, Shield, Heart, Wifi, Monitor, ChevronRight, CheckCircle2, AlertTriangle, Clock, Zap, Activity, RefreshCw } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SURFACES = [
  { key: "iphone_shell", title: "iPhone Shell", stage: "alpha", icon: Smartphone, readiness: 35, desc: "Primary mobile surface — task, approval, advisor flows", tech: ["Swift/SwiftUI", "WebView hybrid"], capabilities: ["push", "biometric", "camera", "haptic"], blockers: ["Core navigation shell", "Push integration"], dependencies: ["apple_identity", "apple_push_channel"] },
  { key: "ipad_shell", title: "iPad Shell", stage: "planned", icon: Monitor, readiness: 8, desc: "Tablet surface — expanded layouts, sidebar navigation", tech: ["SwiftUI", "Sidebar layout"], capabilities: ["multitask", "pencil", "drag_drop"], blockers: ["Awaiting iPhone shell completion", "Tablet layout design"], dependencies: ["iphone_shell"] },
  { key: "apple_watch", title: "Apple Watch", stage: "planned", icon: Watch, readiness: 12, desc: "Glance cards, micro-approvals, haptic routing", tech: ["WatchKit", "SwiftUI"], capabilities: ["haptic", "complication", "glance"], blockers: ["WatchKit integration", "Complication design"], dependencies: ["iphone_shell", "apple_push_channel"] },
  { key: "sign_in_apple", title: "Sign in with Apple", stage: "planned", icon: Shield, readiness: 5, desc: "Identity provider, linked accounts, session semantics", tech: ["AuthenticationServices"], capabilities: ["email_relay", "jwt", "device_bound"], blockers: ["Apple Developer setup", "Identity provider integration"], dependencies: [] },
  { key: "apple_health", title: "Apple Health / HealthKit", stage: "planned", icon: Heart, readiness: 10, desc: "Readiness signals, consent-driven health integration", tech: ["HealthKit", "Background delivery"], capabilities: ["heart_rate", "sleep", "activity", "hrv"], blockers: ["HealthKit permissions flow", "Consent UI", "Privacy review"], dependencies: ["iphone_shell", "sign_in_apple"] },
  { key: "apple_continuity", title: "Apple Continuity", stage: "planned", icon: Wifi, readiness: 3, desc: "Handoff, Universal Clipboard, cross-device flows", tech: ["NSUserActivity", "Handoff API"], capabilities: ["handoff", "clipboard", "airdrop"], blockers: ["Requires native app on both surfaces", "Handoff API integration"], dependencies: ["iphone_shell", "ipad_shell"] },
];

const PROVIDER_CAPS = [
  { key: "apple_identity", label: "Identity", status: "planned", priority: "P0" },
  { key: "apple_mobile_shell", label: "Mobile Shell", status: "alpha", priority: "P0" },
  { key: "apple_watch_surface", label: "Watch Surface", status: "planned", priority: "P1" },
  { key: "apple_health_readiness", label: "Health Readiness", status: "planned", priority: "P1" },
  { key: "apple_push_channel", label: "Push Channel", status: "planned", priority: "P0" },
  { key: "apple_device_trust", label: "Device Trust", status: "planned", priority: "P0" },
  { key: "apple_continuity", label: "Continuity", status: "planned", priority: "P2" },
];

const APL01AppleEcosystemCenter = () => {
  const [showDependencies, setShowDependencies] = useState(false);

  const { data: launchData } = useQuery({
    queryKey: ["apple-launch-readiness"],
    queryFn: async () => {
      const { data } = await supabase.from("ambient_launch_readiness").select("*").like("target_key", "apple_%").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const overallReadiness = Math.round(SURFACES.reduce((sum, s) => sum + s.readiness, 0) / SURFACES.length);
  const alphaCount = SURFACES.filter(s => s.stage === "alpha").length;
  const plannedCount = SURFACES.filter(s => s.stage === "planned").length;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <DemoModeBadge />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><Apple className="h-8 w-8 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold">Apple Ecosystem Center</h1>
            <p className="text-muted-foreground">Unified view of Apple surfaces, identity, trust, and health readiness</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm"><span className="text-muted-foreground">Show deps</span><Switch checked={showDependencies} onCheckedChange={setShowDependencies} /></div>
          <Button variant="outline" size="sm"><RefreshCw className="h-3 w-3 mr-1" />Refresh</Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Overall Readiness", value: `${overallReadiness}%`, icon: Activity, color: overallReadiness > 30 ? "text-green-500" : "text-amber-500" },
          { label: "Surfaces", value: SURFACES.length.toString(), icon: Smartphone, color: "text-primary" },
          { label: "Alpha", value: alphaCount.toString(), icon: Zap, color: "text-green-500" },
          { label: "Planned", value: plannedCount.toString(), icon: Clock, color: "text-muted-foreground" },
          { label: "Capabilities", value: PROVIDER_CAPS.length.toString(), icon: CheckCircle2, color: "text-primary" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold mt-1">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="surfaces" className="space-y-4">
        <TabsList>
          <TabsTrigger value="surfaces">Surfaces</TabsTrigger>
          <TabsTrigger value="capabilities">Provider Family</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
        </TabsList>

        <TabsContent value="surfaces">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SURFACES.map((surface) => (
              <Card key={surface.key} className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <surface.icon className="h-4 w-4 text-primary" /> {surface.title}
                    </CardTitle>
                    <Badge variant={surface.stage === "alpha" ? "default" : "secondary"}>{surface.stage}</Badge>
                  </div>
                  <CardDescription className="text-xs">{surface.desc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs"><span>Readiness</span><span className="font-mono">{surface.readiness}%</span></div>
                    <Progress value={surface.readiness} className="h-2" />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {surface.tech.map((t) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {surface.capabilities.map((c) => <Badge key={c} variant="secondary" className="text-[10px] font-mono">{c}</Badge>)}
                  </div>
                  {surface.blockers.length > 0 && (
                    <div className="space-y-1 pt-1 border-t">
                      <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Blockers</span>
                      {surface.blockers.map((b, i) => <p key={i} className="text-[10px] text-muted-foreground pl-4">• {b}</p>)}
                    </div>
                  )}
                  {showDependencies && surface.dependencies.length > 0 && (
                    <div className="space-y-1 pt-1 border-t">
                      <span className="text-[10px] font-medium text-blue-500">Dependencies</span>
                      {surface.dependencies.map((d) => <p key={d} className="text-[10px] text-muted-foreground pl-4 font-mono">→ {d}</p>)}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="capabilities">
          <Card>
            <CardHeader><CardTitle className="text-sm">Apple Provider Family Registry</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b">
                    <th className="text-left p-2">Capability Key</th>
                    <th className="text-left p-2">Label</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Priority</th>
                    <th className="p-2">Actions</th>
                  </tr></thead>
                  <tbody>
                    {PROVIDER_CAPS.map((cap) => (
                      <tr key={cap.key} className="border-b hover:bg-muted/30">
                        <td className="p-2 font-mono">{cap.key}</td>
                        <td className="p-2 font-medium">{cap.label}</td>
                        <td className="p-2 text-center"><Badge variant={cap.status === "alpha" ? "default" : "secondary"}>{cap.status}</Badge></td>
                        <td className="p-2 text-center"><Badge variant={cap.priority === "P0" ? "destructive" : cap.priority === "P1" ? "default" : "outline"}>{cap.priority}</Badge></td>
                        <td className="p-2 text-center"><Button variant="ghost" size="sm" className="h-6"><ChevronRight className="h-3 w-3" /></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roadmap">
          <Card>
            <CardHeader><CardTitle className="text-sm">Development Roadmap</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { phase: "Phase 1 — Foundation", items: ["iPhone Shell (WebView hybrid)", "Sign in with Apple", "Push notifications (APNs)"], timeline: "Q2 2026", status: "in-progress" },
                { phase: "Phase 2 — Expansion", items: ["Apple Watch (glance + micro-approvals)", "HealthKit integration", "iPad Shell"], timeline: "Q3 2026", status: "planned" },
                { phase: "Phase 3 — Polish", items: ["Apple Continuity (Handoff)", "Siri Shortcuts", "Widget support"], timeline: "Q4 2026", status: "planned" },
              ].map((phase) => (
                <div key={phase.phase} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{phase.phase}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline">{phase.timeline}</Badge>
                      <Badge variant={phase.status === "in-progress" ? "default" : "secondary"}>{phase.status}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {phase.items.map((item) => (
                      <div key={item} className="text-xs p-2 rounded bg-muted/30 flex items-center gap-2">
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />{item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DB Launch Records */}
      {launchData && launchData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Live Launch Readiness Records</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {launchData.map((rec: any) => (
                <div key={rec.id} className="p-3 rounded border text-xs space-y-1">
                  <div className="font-medium">{rec.target_name}</div>
                  <div className="flex gap-2">
                    <Badge variant={rec.launch_ready ? "default" : "outline"}>Launch: {rec.launch_ready ? "✓" : "✗"}</Badge>
                    <Badge variant={rec.pilot_ready ? "default" : "outline"}>Pilot: {rec.pilot_ready ? "✓" : "✗"}</Badge>
                  </div>
                  {rec.blockers?.length > 0 && rec.blockers.map((b: string, i: number) => <p key={i} className="text-muted-foreground">• {b}</p>)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default APL01AppleEcosystemCenter;
