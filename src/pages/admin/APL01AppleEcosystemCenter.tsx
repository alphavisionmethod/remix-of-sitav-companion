import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Apple, Smartphone, Watch, Shield, Heart, Wifi, Monitor, ChevronRight, CheckCircle2, AlertTriangle, Clock, Zap, Activity, RefreshCw, Loader2, Database, Radio, Bell, Plus, Trash2 } from "lucide-react";


import {
  useEcosystemDevices, useEcosystemLaunchReadiness, useEcosystemTrustRecords,
  useEcosystemHealthConsents, useEcosystemWearableConfigs, useEcosystemPushRoutes,
  useEcosystemContinuityEvents, useSeedEcosystemData,
  useAddEcosystemDevice, useRemoveEcosystemDevice, useUpdateDeviceTrust,
  useToggleHealthConsent, useUpdatePushRoute,
} from "@/hooks/useEcosystemDevices";
import APLSubNav from "@/components/admin/APLSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const SURFACE_META: Record<string, { title: string; icon: any; desc: string; tech: string[]; capabilities: string[] }> = {
  iphone: { title: "iPhone Shell", icon: Smartphone, desc: "Primary mobile — task, approval, advisor", tech: ["Swift/SwiftUI", "WebView hybrid"], capabilities: ["push", "biometric", "camera", "haptic"] },
  ipad: { title: "iPad Shell", icon: Monitor, desc: "Tablet — expanded layouts, sidebar", tech: ["SwiftUI", "Sidebar layout"], capabilities: ["multitask", "pencil", "drag_drop"] },
  apple_watch: { title: "Apple Watch", icon: Watch, desc: "Glance cards, micro-approvals, haptic", tech: ["WatchKit", "SwiftUI"], capabilities: ["haptic", "complication", "glance"] },
  mac_desktop: { title: "Mac Desktop", icon: Monitor, desc: "Desktop surface — full workspace", tech: ["AppKit/SwiftUI", "Catalyst"], capabilities: ["keyboard", "multi_window"] },
  vision_pro: { title: "Vision Pro", icon: Monitor, desc: "Spatial computing surface", tech: ["RealityKit", "SwiftUI"], capabilities: ["gaze", "gesture", "spatial_audio"] },
};

const APL01AppleEcosystemCenter = () => {
  const [showDependencies, setShowDependencies] = useState(false);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [newDevice, setNewDevice] = useState({ surface: "iphone", device_model: "", os_version: "" });
  const { data: devices, isLoading: devicesLoading } = useEcosystemDevices("apple");
  const { data: launchData, isLoading: launchLoading } = useEcosystemLaunchReadiness("apple");
  const { data: trustRecords } = useEcosystemTrustRecords("apple");
  const { data: healthConsents } = useEcosystemHealthConsents("apple");
  const { data: wearableConfigs } = useEcosystemWearableConfigs("apple");
  const { data: pushRoutes } = useEcosystemPushRoutes("apple");
  const { data: continuityEvents } = useEcosystemContinuityEvents("apple");
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
<APLSubNav />
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
          {!hasData && (
            <Button size="sm" onClick={() => seedMutation.mutate("apple")} disabled={seedMutation.isPending}>
              {seedMutation.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Database className="h-3 w-3 mr-1" />}Seed Apple Data
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowAddDevice(true)}><Plus className="h-3 w-3 mr-1" />Add Device</Button>
          <Button variant="outline" size="sm"><RefreshCw className="h-3 w-3 mr-1" />Refresh</Button>
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
        <TabsList>
          <TabsTrigger value="surfaces">Surfaces</TabsTrigger>
          <TabsTrigger value="capabilities">Provider Family</TabsTrigger>
          <TabsTrigger value="launch">Launch Readiness</TabsTrigger>
          <TabsTrigger value="wearables">Wearables</TabsTrigger>
          <TabsTrigger value="push">Push Routes</TabsTrigger>
          <TabsTrigger value="continuity">Continuity</TabsTrigger>
        </TabsList>

        <TabsContent value="surfaces">
          {devicesLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : !hasData ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No Apple devices registered. Click "Seed Apple Data" to populate demo devices.</CardContent></Card>
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
                        <div className="flex items-center gap-1">{trust?.keystore_secured ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <AlertTriangle className="h-3 w-3 text-muted-foreground" />}Keychain</div>
                        <div className="flex items-center gap-1">{trust?.attestation_verified ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <AlertTriangle className="h-3 w-3 text-muted-foreground" />}Attestation</div>
                      </div>
                      {trust?.session_duration && <div className="text-[10px] text-muted-foreground">Session: {trust.session_duration} · Re-auth: {trust.reauth_method}</div>}
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
            <CardHeader><CardTitle className="text-sm">Apple Provider Family Registry</CardTitle></CardHeader>
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
                      const matchingLaunch = launchData?.find((r: Record<string, any>) => r.target.includes(cap.key.replace("apple_", "")));
                      const status = matchingLaunch?.launch_stage || "planned";
                      return (
                        <tr key={cap.key} className="border-b hover:bg-muted/30">
                          <td className="p-2 font-mono">{cap.key}</td>
                          <td className="p-2 font-medium">{cap.label}</td>
                          <td className="p-2 text-center"><Badge variant={status !== "planned" ? "default" : "secondary"}>{status}</Badge></td>
                          <td className="p-2 text-center"><Badge variant={cap.priority === "P0" ? "destructive" : cap.priority === "P1" ? "default" : "outline"}>{cap.priority}</Badge></td>
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

        {/* ── Wearables Tab ── */}
        <TabsContent value="wearables">
          {!wearableConfigs?.length ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No wearable configurations found. Seed Apple data first.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wearableConfigs.map((wc: Record<string, any>) => (
                <Card key={wc.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2"><Watch className="h-4 w-4 text-primary" />{wc.config_name || wc.wearable_type}</CardTitle>
                    <CardDescription className="text-xs">{wc.wearable_type} · {wc.complication_type || "standard"}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex gap-2">
                      <Badge variant={wc.haptic_enabled ? "default" : "outline"} className="text-[10px]">Haptic {wc.haptic_enabled ? "✓" : "✗"}</Badge>
                      <Badge variant={wc.always_on ? "default" : "outline"} className="text-[10px]">Always-On {wc.always_on ? "✓" : "✗"}</Badge>
                    </div>
                    {wc.refresh_interval_sec && <div className="text-[10px] text-muted-foreground">Refresh: {wc.refresh_interval_sec}s</div>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Push Routes Tab ── */}
        <TabsContent value="push">
          {!pushRoutes?.length ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No push routes configured. Seed Apple data first.</CardContent></Card>
          ) : (
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Bell className="h-4 w-4" />Push Routes</CardTitle></CardHeader>
              <CardContent>
                <table className="w-full text-xs">
                  <thead><tr className="border-b">
                    <th className="text-left p-2">Route</th>
                    <th className="p-2">Channel</th>
                    <th className="p-2">Priority</th>
                    <th className="p-2">Active</th>
                  </tr></thead>
                  <tbody>
                    {pushRoutes.map((pr: Record<string, any>) => (
                      <tr key={pr.id} className="border-b hover:bg-muted/30">
                        <td className="p-2 font-mono">{pr.route_key || pr.category}</td>
                        <td className="p-2 text-center">{pr.channel || "apns"}</td>
                        <td className="p-2 text-center"><Badge variant={pr.priority === "high" ? "destructive" : "secondary"}>{pr.priority || "normal"}</Badge></td>
                        <td className="p-2 text-center">
                          <Switch checked={pr.urgency_filter !== "none"} onCheckedChange={(v) => updatePush.mutate({ id: pr.id, enabled: v })} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Continuity Tab ── */}
        <TabsContent value="continuity">
          {!continuityEvents?.length ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No continuity events recorded. Seed Apple data first.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {continuityEvents.map((ce: Record<string, any>) => (
                <Card key={ce.id}>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Radio className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{ce.event_type || ce.handoff_type}</p>
                          <p className="text-xs text-muted-foreground">{ce.source_device} → {ce.target_device}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={ce.success ? "default" : "destructive"} className="text-[10px]">{ce.success ? "Success" : "Failed"}</Badge>
                        {ce.latency_ms && <span className="text-[10px] text-muted-foreground">{ce.latency_ms}ms</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Device Dialog */}
      <Dialog open={showAddDevice} onOpenChange={setShowAddDevice}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Apple Device</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs font-medium">Surface</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newDevice.surface} onChange={e => setNewDevice(d => ({ ...d, surface: e.target.value }))}>
                {Object.entries(SURFACE_META).map(([k, v]) => <option key={k} value={k}>{v.title}</option>)}
              </select>
            </div>
            <div><label className="text-xs font-medium">Device Model</label><Input value={newDevice.device_model} onChange={e => setNewDevice(d => ({ ...d, device_model: e.target.value }))} placeholder="e.g. iPhone 15 Pro" /></div>
            <div><label className="text-xs font-medium">OS Version</label><Input value={newDevice.os_version} onChange={e => setNewDevice(d => ({ ...d, os_version: e.target.value }))} placeholder="e.g. iOS 17.4" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDevice(false)}>Cancel</Button>
            <Button onClick={() => {
              addDevice.mutate({ ecosystem: "apple", surface: newDevice.surface, device_model: newDevice.device_model, os_version: newDevice.os_version });
              setShowAddDevice(false);
              setNewDevice({ surface: "iphone", device_model: "", os_version: "" });
            }} disabled={!newDevice.device_model}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default APL01AppleEcosystemCenter;
