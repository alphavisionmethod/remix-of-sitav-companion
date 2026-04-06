import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Smartphone, Watch, Shield, Heart, Wifi, Activity, Clock, Zap, CheckCircle2, AlertTriangle, ChevronRight, RefreshCw } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { Button } from "@/components/ui/button";

const SURFACES = [
  { key: "android_phone", title: "Android Phone Shell", stage: "planned", icon: Smartphone, readiness: 10, desc: "Primary Android surface — Material Design shell", tech: ["Kotlin", "Jetpack Compose", "WebView hybrid"], capabilities: ["push_fcm", "biometric", "camera", "nfc"], blockers: ["Architecture design", "Material Design implementation"], deps: [] },
  { key: "wearos", title: "Wear OS", stage: "planned", icon: Watch, readiness: 8, desc: "Tiles, complications, micro-actions", tech: ["Kotlin", "Wear Compose", "Tile SDK"], capabilities: ["haptic", "tile", "complication", "glance"], blockers: ["Tile SDK integration", "Complication design"], deps: ["android_phone"] },
  { key: "android_trust", title: "Android Device Trust", stage: "planned", icon: Shield, readiness: 5, desc: "Biometric, keystore, SafetyNet verification", tech: ["BiometricPrompt", "Android Keystore", "Play Integrity"], capabilities: ["fingerprint", "face", "keystore", "attestation"], blockers: ["Keystore integration", "SafetyNet verification"], deps: [] },
  { key: "android_push", title: "Android Push (FCM)", stage: "planned", icon: Wifi, readiness: 12, desc: "FCM data/notification channels, DND awareness", tech: ["Firebase Cloud Messaging", "Notification channels"], capabilities: ["data_message", "notification", "channel_management", "dnd_check"], blockers: ["FCM setup", "Channel configuration"], deps: [] },
  { key: "health_connect", title: "Health Connect", stage: "planned", icon: Heart, readiness: 6, desc: "Android health signal path with consent", tech: ["Health Connect API", "Permission model"], capabilities: ["heart_rate", "sleep", "steps", "exercise"], blockers: ["Health Connect API integration", "Consent flow"], deps: ["android_phone"] },
];

const CAPS = [
  { key: "android_mobile_shell", label: "Mobile Shell", status: "planned", priority: "P0" },
  { key: "wearos_surface", label: "Wear OS Surface", status: "planned", priority: "P1" },
  { key: "android_push_channel", label: "Push Channel (FCM)", status: "planned", priority: "P0" },
  { key: "android_device_trust", label: "Device Trust", status: "planned", priority: "P0" },
  { key: "android_health_readiness", label: "Health Readiness", status: "planned", priority: "P1" },
];

const AND01AndroidEcosystemCenter = () => {
  const [showDeps, setShowDeps] = useState(false);
  const overallReadiness = Math.round(SURFACES.reduce((s, x) => s + x.readiness, 0) / SURFACES.length);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <DemoModeBadge />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><Smartphone className="h-8 w-8 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold">Android Ecosystem Center</h1>
            <p className="text-muted-foreground">Android phone, tablet, Wear OS, trust, push, and Health Connect</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm"><span className="text-muted-foreground">Show deps</span><Switch checked={showDeps} onCheckedChange={setShowDeps} /></div>
          <Badge variant="secondary">{overallReadiness}% overall</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Overall", value: `${overallReadiness}%`, icon: Activity },
          { label: "Surfaces", value: SURFACES.length.toString(), icon: Smartphone },
          { label: "Planned", value: SURFACES.length.toString(), icon: Clock },
          { label: "Capabilities", value: CAPS.length.toString(), icon: Zap },
          { label: "Blockers", value: SURFACES.reduce((s, x) => s + x.blockers.length, 0).toString(), icon: AlertTriangle },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{stat.label}</span><stat.icon className="h-4 w-4 text-muted-foreground" /></div>
              <div className="text-2xl font-bold mt-1">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="surfaces" className="space-y-4">
        <TabsList>
          <TabsTrigger value="surfaces">Surfaces</TabsTrigger>
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
        </TabsList>

        <TabsContent value="surfaces">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SURFACES.map((s) => (
              <Card key={s.key} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2"><s.icon className="h-4 w-4 text-primary" />{s.title}</CardTitle>
                    <Badge variant="secondary">{s.stage}</Badge>
                  </div>
                  <CardDescription className="text-xs">{s.desc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs"><span>Readiness</span><span className="font-mono">{s.readiness}%</span></div>
                    <Progress value={s.readiness} className="h-2" />
                  </div>
                  <div className="flex flex-wrap gap-1">{s.tech.map((t) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}</div>
                  <div className="flex flex-wrap gap-1">{s.capabilities.map((c) => <Badge key={c} variant="secondary" className="text-[10px] font-mono">{c}</Badge>)}</div>
                  {s.blockers.length > 0 && (
                    <div className="space-y-1 pt-1 border-t">
                      <span className="text-[10px] flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Blockers</span>
                      {s.blockers.map((b, i) => <p key={i} className="text-[10px] text-muted-foreground pl-4">• {b}</p>)}
                    </div>
                  )}
                  {showDeps && s.deps.length > 0 && (
                    <div className="space-y-1 pt-1 border-t">
                      <span className="text-[10px] text-blue-500">Dependencies</span>
                      {s.deps.map((d) => <p key={d} className="text-[10px] text-muted-foreground pl-4 font-mono">→ {d}</p>)}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="capabilities">
          <Card>
            <CardHeader><CardTitle className="text-sm">Android Capability Registry</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left p-2">Key</th><th className="text-left p-2">Label</th><th className="p-2">Status</th><th className="p-2">Priority</th></tr></thead>
                <tbody>
                  {CAPS.map((c) => (
                    <tr key={c.key} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-mono">{c.key}</td>
                      <td className="p-2">{c.label}</td>
                      <td className="p-2 text-center"><Badge variant="secondary">{c.status}</Badge></td>
                      <td className="p-2 text-center"><Badge variant={c.priority === "P0" ? "destructive" : "default"}>{c.priority}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roadmap">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {[
                { phase: "Phase 1 — Foundation", timeline: "Q3 2026", items: ["Android Phone Shell", "FCM Push", "Device Trust"] },
                { phase: "Phase 2 — Expansion", timeline: "Q4 2026", items: ["Wear OS Shell", "Health Connect integration"] },
                { phase: "Phase 3 — Polish", timeline: "Q1 2027", items: ["Android Tablet Shell", "Widget support", "App Links"] },
              ].map((p) => (
                <div key={p.phase} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{p.phase}</span>
                    <Badge variant="outline">{p.timeline}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">{p.items.map((i) => <Badge key={i} variant="secondary">{i}</Badge>)}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AND01AndroidEcosystemCenter;
