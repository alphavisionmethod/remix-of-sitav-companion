import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Smartphone, Watch, Shield, Heart, Wifi, Activity, Clock, Zap, CheckCircle2, AlertTriangle, ChevronRight, RefreshCw, Loader2, Database, Monitor, Plus, Trash2 } from "lucide-react";


import {
  useEcosystemDevices, useEcosystemLaunchReadiness, useEcosystemTrustRecords,
  useEcosystemHealthConsents, useEcosystemWearableConfigs, useEcosystemPushRoutes,
  useEcosystemContinuityEvents, useSeedEcosystemData,
  useAddEcosystemDevice, useRemoveEcosystemDevice, useUpdateDeviceTrust,
  useToggleHealthConsent, useUpdatePushRoute,
} from "@/hooks/useEcosystemDevices";
import ANDSubNav from "@/components/admin/ANDSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const SURFACE_META: Record<string, { title: string; icon: any; desc: string; tech: string[]; capabilities: string[] }> = {
  android_phone: { title: "Android Phone Shell", icon: Smartphone, desc: "Primary Android surface — Material Design shell", tech: ["Kotlin", "Jetpack Compose", "WebView hybrid"], capabilities: ["push_fcm", "biometric", "camera", "nfc"] },
  wearos: { title: "Wear OS", icon: Watch, desc: "Tiles, complications, micro-actions", tech: ["Kotlin", "Wear Compose", "Tile SDK"], capabilities: ["haptic", "tile", "complication", "glance"] },
  android_trust: { title: "Android Device Trust", icon: Shield, desc: "Biometric, keystore, SafetyNet verification", tech: ["BiometricPrompt", "Android Keystore", "Play Integrity"], capabilities: ["fingerprint", "face", "keystore", "attestation"] },
  android_push: { title: "Android Push (FCM)", icon: Wifi, desc: "FCM data/notification channels, DND awareness", tech: ["Firebase Cloud Messaging", "Notification channels"], capabilities: ["data_message", "notification", "channel_management", "dnd_check"] },
  health_connect: { title: "Health Connect", icon: Heart, desc: "Android health signal path with consent", tech: ["Health Connect API", "Permission model"], capabilities: ["heart_rate", "sleep", "steps", "exercise"] },
};

const AND01AndroidEcosystemCenter = () => {
  const [showDeps, setShowDeps] = useState(false);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [newDevice, setNewDevice] = useState({ surface: "android_phone", device_model: "", os_version: "" });

  const { data: devices, isLoading: devicesLoading } = useEcosystemDevices("android");
  const { data: launchData, isLoading: launchLoading } = useEcosystemLaunchReadiness("android");
  const { data: trustRecords } = useEcosystemTrustRecords("android");
  const { data: healthConsents } = useEcosystemHealthConsents("android");
  const { data: wearableConfigs } = useEcosystemWearableConfigs("android");
  const { data: pushRoutes } = useEcosystemPushRoutes("android");
  const { data: continuityEvents } = useEcosystemContinuityEvents("android");
  const seedMutation = useSeedEcosystemData();
  const addDevice = useAddEcosystemDevice();
  const removeDevice = useRemoveEcosystemDevice();
  const updateTrust = useUpdateDeviceTrust();
  const toggleConsent = useToggleHealthConsent();
  const updatePush = useUpdatePushRoute();

  const hasData = (devices?.length ?? 0) > 0;
  const trustedCount = trustRecords?.filter((t: Record<string, any>) => t.biometric_verified).length ?? 0;
  const consentCount = healthConsents?.filter((c: Record<string, any>) => c.read_permission && !c.revoked_at).length ?? 0;
  const launchReadyCount = launchData?.filter((r: Record<string, any>) => r.launch_ready).length ?? 0;

  const overallReadiness = launchData && launchData.length > 0
    ? Math.round(launchData.reduce((sum: number,  r: Record<string, any>) => {
        const stageScore: Record<string, number> = { planned: 5, internal: 25, demo: 40, pilot: 60, launch_ready: 85, production: 100 };
        return sum + (stageScore[r.launch_stage] ?? 0);
      }, 0) / launchData.length)
    : 0;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
<ANDSubNav />
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
          {!hasData && (
            <Button size="sm" onClick={() => seedMutation.mutate("android")} disabled={seedMutation.isPending}>
              {seedMutation.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Database className="h-3 w-3 mr-1" />}Seed Android Data
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowAddDevice(true)}><Plus className="h-3 w-3 mr-1" />Add Device</Button>
          <Badge variant="secondary">{overallReadiness}% overall</Badge>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Overall Readiness", value: `${overallReadiness}%`, icon: Activity, color: overallReadiness > 30 ? "text-green-500" : "text-amber-500" },
          { label: "Devices", value: (devices?.length ?? 0).toString(), icon: Smartphone, color: "text-primary" },
          { label: "Trusted", value: trustedCount.toString(), icon: Shield, color: "text-green-500" },
          { label: "Health Consents", value: consentCount.toString(), icon: Heart, color: "text-pink-500" },
          { label: "Launch Ready", value: `${launchReadyCount}/${launchData?.length ?? 0}`, icon: Zap, color: "text-primary" },
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
        <TabsList className="flex-wrap">
          <TabsTrigger value="surfaces">Surfaces</TabsTrigger>
          <TabsTrigger value="capabilities">Provider Family</TabsTrigger>
          <TabsTrigger value="launch">Launch Readiness</TabsTrigger>
          <TabsTrigger value="wearables">Wearable Configs</TabsTrigger>
          <TabsTrigger value="push">Push Routes</TabsTrigger>
          <TabsTrigger value="continuity">Continuity Events</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
        </TabsList>

        <TabsContent value="surfaces">
          {devicesLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : !hasData ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No Android devices registered. Click "Seed Android Data" to populate demo devices.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {devices!.map((device: Record<string, any>) => {
                const meta = SURFACE_META[device.surface] || { title: device.surface, icon: Smartphone, desc: "", tech: [], capabilities: [] };
                const trust = trustRecords?.find((t: Record<string, any>) => t.device_id === device.id);
                return (
                  <Card key={device.id} className="group hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <meta.icon className="h-4 w-4 text-primary" /> {meta.title}
                        </CardTitle>
                        <Badge variant={trust?.biometric_verified ? "default" : "secondary"}>{trust?.trust_class || device.trust_class}</Badge>
                      </div>
                      <CardDescription className="text-xs">{device.device_model} — {device.os_version}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {trust && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs"><span>Risk Ceiling</span><span className="font-mono">{trust.risk_tier_ceiling}</span></div>
                          <Progress value={trust.risk_tier_ceiling === "high" ? 90 : trust.risk_tier_ceiling === "medium" ? 60 : 30} className="h-2" />
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {meta.tech.map((t: string) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[10px]">
                        <div className="flex items-center gap-1">{device.biometric_capable ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <AlertTriangle className="h-3 w-3 text-muted-foreground" />}Biometric</div>
                        <div className="flex items-center gap-1">{device.continuity_eligible ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <AlertTriangle className="h-3 w-3 text-muted-foreground" />}Continuity</div>
                        <div className="flex items-center gap-1">{trust?.keystore_secured ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <AlertTriangle className="h-3 w-3 text-muted-foreground" />}Keystore</div>
                        <div className="flex items-center gap-1">{trust?.attestation_verified ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <AlertTriangle className="h-3 w-3 text-muted-foreground" />}Attestation</div>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {trust && (
                          <Button size="sm" variant="outline" className="text-[10px] h-6 px-2" onClick={() => updateTrust.mutate({ id: trust.id, biometric_verified: !trust.biometric_verified })}>
                            {trust.biometric_verified ? "Revoke Trust" : "Re-verify"}
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="text-[10px] h-6 px-2 text-destructive" onClick={() => removeDevice.mutate(device.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="capabilities">
          <Card>
            <CardHeader><CardTitle className="text-sm">Android Provider Family Registry</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b">
                    <th className="text-left p-2">Capability Key</th>
                    <th className="text-left p-2">Label</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Priority</th>
                  </tr></thead>
                  <tbody>
                    {([] as typeof DEMO_PROVIDER_CAPS).map((cap) => {
                      const matchingLaunch = launchData?.find((r: Record<string, any>) => r.target.includes(cap.key.replace("android_", "")));
                      const status = matchingLaunch?.launch_stage || "planned";
                      return (
                        <tr key={cap.key} className="border-b hover:bg-muted/30">
                          <td className="p-2 font-mono">{cap.key}</td>
                          <td className="p-2 font-medium">{cap.label}</td>
                          <td className="p-2 text-center"><Badge variant={status !== "planned" ? "default" : "secondary"}>{status}</Badge></td>
                          <td className="p-2 text-center"><Badge variant={cap.priority === "P0" ? "destructive" : "default"}>{cap.priority}</Badge></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="launch">
          {launchLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : !launchData?.length ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No launch readiness records. Seed data first.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {launchData.map((rec: Record<string, any>) => (
                <Card key={rec.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{rec.target_name || rec.target}</CardTitle>
                      <Badge variant={rec.launch_stage === "production" ? "default" : rec.launch_stage === "internal" ? "secondary" : "outline"}>{rec.launch_stage}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex gap-2">
                      <Badge variant={rec.demo_available ? "default" : "outline"} className="text-[10px]">Demo {rec.demo_available ? "✓" : "✗"}</Badge>
                      <Badge variant={rec.pilot_ready ? "default" : "outline"} className="text-[10px]">Pilot {rec.pilot_ready ? "✓" : "✗"}</Badge>
                      <Badge variant={rec.launch_ready ? "default" : "outline"} className="text-[10px]">Launch {rec.launch_ready ? "✓" : "✗"}</Badge>
                    </div>
                    {rec.blockers?.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Blockers</span>
                        {rec.blockers.map((b: string, i: number) => <p key={i} className="text-[10px] text-muted-foreground pl-4">• {b}</p>)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Wearable Configs Tab */}
        <TabsContent value="wearables">
          {!wearableConfigs?.length ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No wearable configs found. Seed data to populate Android wearable configurations.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wearableConfigs.map((config: Record<string, any>) => (
                <Card key={config.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2"><Watch className="h-4 w-4" />{config.ecosystem_devices?.surface || "Wearable"}</CardTitle>
                      <Badge variant={config.enabled ? "default" : "secondary"}>{config.enabled ? "Active" : "Inactive"}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2">
                    <div className="flex justify-between"><span className="text-muted-foreground">Model</span><span>{config.ecosystem_devices?.device_model || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Complication</span><span>{config.complication_type || "none"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Haptic</span><Badge variant="outline">{config.haptic_level || "default"}</Badge></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Glance</span><Badge variant={config.glance_enabled ? "default" : "outline"}>{config.glance_enabled ? "Yes" : "No"}</Badge></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Push Routes Tab */}
        <TabsContent value="push">
          {!pushRoutes?.length ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No push routes configured. Seed data to populate Android push routing.</CardContent></Card>
          ) : (
            <Card>
              <CardHeader><CardTitle className="text-sm">Android Push Route Registry</CardTitle></CardHeader>
              <CardContent>
                <table className="w-full text-xs">
                  <thead><tr className="border-b">
                    <th className="text-left p-2">Device</th>
                    <th className="text-left p-2">Channel</th>
                    <th className="p-2">Priority</th>
                    <th className="p-2">DND Bypass</th>
                    <th className="p-2">Active</th>
                  </tr></thead>
                  <tbody>
                    {pushRoutes.map((route: Record<string, any>) => (
                      <tr key={route.id} className="border-b hover:bg-muted/30">
                        <td className="p-2">{route.ecosystem_devices?.device_model || route.ecosystem_devices?.surface || "—"}</td>
                        <td className="p-2 font-mono">{route.channel_type || "default"}</td>
                        <td className="p-2 text-center"><Badge variant={route.routing_priority > 7 ? "destructive" : route.routing_priority > 4 ? "default" : "secondary"}>{route.routing_priority}</Badge></td>
                        <td className="p-2 text-center">{route.dnd_bypass ? <CheckCircle2 className="h-3 w-3 mx-auto text-green-500" /> : <span className="text-muted-foreground">—</span>}</td>
                        <td className="p-2 text-center">
                          <Switch checked={route.urgency_filter !== "none"} onCheckedChange={(v) => updatePush.mutate({ id: route.id, enabled: v })} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Continuity Events Tab */}
        <TabsContent value="continuity">
          {!continuityEvents?.length ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No continuity events recorded for Android ecosystem.</CardContent></Card>
          ) : (
            <Card>
              <CardHeader><CardTitle className="text-sm">Android Continuity Events</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {continuityEvents.map((event: Record<string, any>) => (
                    <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30">
                      <div className="p-1.5 rounded bg-primary/10"><Monitor className="h-3.5 w-3.5 text-primary" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{event.event_type}</span>
                          <Badge variant="outline" className="text-[10px]">{event.handoff_result || "pending"}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {event.source_surface} → {event.target_surface} • {new Date(event.created_at).toLocaleString()}
                        </div>
                      </div>
                      <Badge variant={event.handoff_result === "success" ? "default" : "secondary"} className="text-[10px]">
                        {event.latency_ms ? `${event.latency_ms}ms` : "—"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
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

      {/* Add Device Dialog */}
      <Dialog open={showAddDevice} onOpenChange={setShowAddDevice}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Android Device</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs font-medium">Surface</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newDevice.surface} onChange={e => setNewDevice(d => ({ ...d, surface: e.target.value }))}>
                {Object.entries(SURFACE_META).map(([k, v]) => <option key={k} value={k}>{v.title}</option>)}
              </select>
            </div>
            <div><label className="text-xs font-medium">Device Model</label><Input value={newDevice.device_model} onChange={e => setNewDevice(d => ({ ...d, device_model: e.target.value }))} placeholder="e.g. Pixel 8 Pro" /></div>
            <div><label className="text-xs font-medium">OS Version</label><Input value={newDevice.os_version} onChange={e => setNewDevice(d => ({ ...d, os_version: e.target.value }))} placeholder="e.g. Android 14" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDevice(false)}>Cancel</Button>
            <Button onClick={() => {
              addDevice.mutate({ ecosystem: "android", surface: newDevice.surface, device_model: newDevice.device_model, os_version: newDevice.os_version });
              setShowAddDevice(false);
              setNewDevice({ surface: "android_phone", device_model: "", os_version: "" });
            }} disabled={!newDevice.device_model}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AND01AndroidEcosystemCenter;
