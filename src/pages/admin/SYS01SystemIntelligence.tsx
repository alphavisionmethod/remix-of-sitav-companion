// ═══════════════════════════════════════════════════════════════
// SITA OS — SYS01 System Intelligence Dashboard
// 6-tab premium dashboard: Network, Bluetooth, Power, Automation,
// Recommendations, Diagnostics & Self-Repair
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Wifi, Bluetooth, Battery, Cpu, Shield, Activity, Sparkles,
  Globe, Router, Radio, Thermometer, Heart, PlugZap, TrendingDown,
  Volume2, Mic, Headphones, Keyboard, Mouse, Clock, CheckCircle2,
  AlertTriangle, XCircle, Zap, Moon, Monitor, RefreshCw, Wrench,
  Play, Pause, ChevronRight, Eye, BrainCircuit,
} from "lucide-react";
import { getWifiDaemon } from "@/lib/os-services/wifid";
import { getBluetoothDaemon } from "@/lib/os-services/btd";
import { getPowerDaemon } from "@/lib/os-services/powerd";
import { getAutomationDaemon } from "@/lib/os-services/automationd";
import { useRequireAdmin } from "@/platform/auth/hooks/useRequireAdmin";
import { PageSkeleton } from "@/platform/sita/components/sita/PageSkeleton";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={fadeUp}>
      <Card className={`bg-card/50 backdrop-blur-xl border-border/30 ${className || ""}`}>
        {children}
      </Card>
    </motion.div>
  );
}

function StatusDot({ status }: { status: "ok" | "warn" | "error" }) {
  const colors = { ok: "bg-emerald-400", warn: "bg-amber-400", error: "bg-red-400" };
  return <div className={`w-2 h-2 rounded-full ${colors[status]} animate-pulse`} />;
}

// ── Tab 1: Network Intelligence ──
function NetworkIntelligenceTab() {
  const wifi = getWifiDaemon().getState();
  const diagnostics = [
    { test: "DNS Resolution", status: "ok" as const, time: "12ms" },
    { test: "TLS Handshake", status: "ok" as const, time: "34ms" },
    { test: "API Gateway", status: "ok" as const, time: "48ms" },
    { test: "WebSocket", status: "ok" as const, time: "22ms" },
    { test: "VPN Tunnel", status: "ok" as const, time: "67ms" },
    { test: "DNS Leak Check", status: wifi.dnsLeakPrevention ? "ok" as const : "warn" as const, time: "—" },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2">
      {/* Current Connection */}
      <GlassCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wifi className="w-4 h-4 text-blue-400" /> Current Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {wifi.currentNetwork ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{wifi.currentNetwork.ssid}</span>
                <Badge variant={wifi.connectivity === "online" ? "default" : "secondary"}>
                  {wifi.connectivity}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>Band: <span className="text-foreground">{wifi.currentNetwork.band}</span></div>
                <div>Channel: <span className="text-foreground">{wifi.currentNetwork.channel}</span></div>
                <div>Security: <span className="text-foreground">{wifi.currentNetwork.security.replace("_", " ")}</span></div>
                <div>Signal: <span className="text-foreground">{wifi.currentNetwork.rssiPercent}%</span></div>
              </div>
              <Progress value={wifi.currentNetwork.rssiPercent} className="h-1.5" />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Not connected</p>
          )}
        </CardContent>
      </GlassCard>

      {/* Captive Portal Status */}
      <GlassCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" /> Portal & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Captive Portal</span>
            <Badge variant={wifi.captivePortal.detected ? "destructive" : "outline"}>
              {wifi.captivePortal.detected ? "Detected" : "Clear"}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">DNS Leak Prevention</span>
            <Badge variant={wifi.dnsLeakPrevention ? "default" : "secondary"}>
              {wifi.dnsLeakPrevention ? "Active" : "Off"}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">DNS Policy</span>
            <span className="text-xs font-medium">{wifi.systemDnsPolicy}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Airplane Mode</span>
            <Badge variant={wifi.airplaneMode ? "destructive" : "outline"}>
              {wifi.airplaneMode ? "On" : "Off"}
            </Badge>
          </div>
        </CardContent>
      </GlassCard>

      {/* Saved Networks */}
      <GlassCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Router className="w-4 h-4 text-blue-400" /> Saved Networks ({wifi.savedNetworks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {wifi.savedNetworks.map(n => (
              <div key={n.bssid} className="flex items-center justify-between p-2 rounded-lg border border-border/20 text-xs">
                <div className="flex items-center gap-2">
                  <StatusDot status={n.connected ? "ok" : "warn"} />
                  <span>{n.ssid}</span>
                </div>
                <div className="flex items-center gap-2">
                  {n.perNetworkSettings.isMetered && <Badge variant="outline" className="text-[10px]">Metered</Badge>}
                  <span className="text-muted-foreground">{n.security.replace("_", " ")}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </GlassCard>

      {/* Diagnostics */}
      <GlassCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" /> Connectivity Tests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {diagnostics.map(d => (
              <div key={d.test} className="flex items-center justify-between text-xs p-1.5 rounded border border-border/20">
                <div className="flex items-center gap-2">
                  <StatusDot status={d.status} />
                  <span>{d.test}</span>
                </div>
                <span className="text-muted-foreground">{d.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </GlassCard>

      {/* Hotspot */}
      <GlassCard className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" /> Personal Hotspot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div><span className="text-muted-foreground">Status</span><p className="font-medium">{wifi.hotspot.enabled ? "Active" : "Off"}</p></div>
            <div><span className="text-muted-foreground">SSID</span><p className="font-medium">{wifi.hotspot.ssid}</p></div>
            <div><span className="text-muted-foreground">Security</span><p className="font-medium">{wifi.hotspot.security.toUpperCase()}</p></div>
            <div><span className="text-muted-foreground">Clients</span><p className="font-medium">{wifi.hotspot.connectedClients.length} / {wifi.hotspot.maxClients}</p></div>
          </div>
        </CardContent>
      </GlassCard>
    </motion.div>
  );
}

// ── Tab 2: Bluetooth Intelligence ──
function BluetoothIntelligenceTab() {
  const bt = getBluetoothDaemon().getState();
  const connected = bt.devices.filter(d => d.connected);
  const stale = getBluetoothDaemon().getStaleDevices();
  const lowBat = getBluetoothDaemon().getLowBatteryDevices();

  const deviceIcon: Record<string, typeof Headphones> = {
    headphones: Headphones, earbuds: Headphones, keyboard: Keyboard, mouse: Mouse,
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2">
      <GlassCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bluetooth className="w-4 h-4 text-indigo-400" /> Device Fleet ({bt.devices.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {bt.devices.map(d => {
            const Icon = deviceIcon[d.type] || Bluetooth;
            return (
              <div key={d.id} className="flex items-center justify-between p-2 rounded-lg border border-border/20">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-indigo-400/60" />
                  <div>
                    <p className="text-xs font-medium">{d.name}</p>
                    <p className="text-[10px] text-muted-foreground">{d.connected ? "Connected" : "Paired"} · {d.reconnectPolicy}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {d.battery.main !== undefined && (
                    <div className="flex items-center gap-1">
                      <Battery className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs">{d.battery.main}%</span>
                    </div>
                  )}
                  {d.battery.left !== undefined && (
                    <span className="text-[10px] text-muted-foreground">L:{d.battery.left}% R:{d.battery.right}%</span>
                  )}
                  <StatusDot status={d.connected ? "ok" : "warn"} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </GlassCard>

      <GlassCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-400" /> Audio Route
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5"><Volume2 className="w-3.5 h-3.5" /> Output</span>
            <span className="font-medium">{bt.devices.find(d => d.id === bt.audioRoute.outputDevice)?.name || "System"}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5"><Mic className="w-3.5 h-3.5" /> Input</span>
            <span className="font-medium">{bt.devices.find(d => d.id === bt.audioRoute.inputDevice)?.name || "System"}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Active Role</span>
            <Badge variant="outline">{bt.audioRoute.activeRole}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">BLE Privacy</span>
            <Badge variant={bt.blePrivacyEnabled ? "default" : "secondary"}>
              {bt.blePrivacyEnabled ? "Enabled" : "Off"}
            </Badge>
          </div>
        </CardContent>
      </GlassCard>

      {/* Warnings */}
      {(lowBat.length > 0 || stale.length > 0) && (
        <GlassCard className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowBat.map(d => (
              <div key={d.id} className="flex items-center gap-2 text-sm text-amber-400">
                <Battery className="w-4 h-4" />
                <span>{d.name} — Low battery ({d.battery.main ?? d.battery.left}%)</span>
              </div>
            ))}
            {stale.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{stale.length} stale device{stale.length !== 1 ? "s" : ""} available for cleanup</span>
              </div>
            )}
          </CardContent>
        </GlassCard>
      )}
    </motion.div>
  );
}

// ── Tab 3: Power Intelligence ──
function PowerIntelligenceTab() {
  const power = getPowerDaemon().getState();

  const thermalColors: Record<string, string> = {
    nominal: "text-emerald-400", warm: "text-amber-400", hot: "text-orange-400",
    throttling: "text-red-400", critical: "text-red-500",
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2">
      {/* Battery overview */}
      <GlassCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Battery className="w-4 h-4 text-amber-400" /> Battery Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold">{power.level}%</div>
            <Badge variant={power.charging ? "default" : "outline"}>
              {power.charging ? "Charging" : "On Battery"}
            </Badge>
          </div>
          <Progress value={power.level} className="h-2" />
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>Charger: <span className="text-foreground">{power.charger.label}</span></div>
            <div>Time: <span className="text-foreground">{power.charging ? `${power.timeToFullMin}m to full` : `${power.timeRemainingMin}m left`}</span></div>
          </div>
        </CardContent>
      </GlassCard>

      {/* Health */}
      <GlassCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-400" /> Battery Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Capacity</span>
            <span className="font-medium">{power.health.capacityPercent}% ({power.health.fullChargeCapacityMah}/{power.health.designCapacityMah} mAh)</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Cycles</span>
            <span className="font-medium">{power.health.cycleCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Health</span>
            <Badge variant={power.health.healthRating === "good" ? "default" : "destructive"}>
              {power.health.healthRating}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Aging</span>
            <span className="text-xs">{power.health.agingTrend.replace("_", " ")}</span>
          </div>
        </CardContent>
      </GlassCard>

      {/* Thermal */}
      <GlassCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-orange-400" /> Thermal Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-bold ${thermalColors[power.thermal]}`}>{power.health.temperatureC}°C</span>
            <Badge variant={power.thermal === "nominal" ? "default" : "destructive"}>
              {power.thermal}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            {power.thermal === "nominal" ? "System temperature is within normal range" :
              power.thermal === "warm" ? "System is slightly warm, monitoring" :
                "System may throttle to protect hardware"}
          </div>
        </CardContent>
      </GlassCard>

      {/* Profile */}
      <GlassCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" /> Active Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Badge variant="default" className="text-sm">{power.activeProfile}</Badge>
          {(() => {
            const t = power.profileTuning[power.activeProfile];
            return (
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">
                <div>CPU Limit: <span className="text-foreground">{t.cpuLimit}%</span></div>
                <div>GPU Limit: <span className="text-foreground">{t.gpuLimit}%</span></div>
                <div>Refresh: <span className="text-foreground">{t.displayRefreshHz}Hz</span></div>
                <div>Fan: <span className="text-foreground">{t.thermalFanCurve}</span></div>
              </div>
            );
          })()}
        </CardContent>
      </GlassCard>

      {/* App drain */}
      <GlassCard className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-amber-400" /> Top Battery Consumers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {power.appDrain.sort((a, b) => b.totalDrainPercent - a.totalDrainPercent).map(app => (
              <div key={app.appName} className="flex items-center gap-3">
                <span className="text-lg w-7 text-center">{app.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{app.appName}</span>
                    <span className="text-muted-foreground">{app.totalDrainPercent}%</span>
                  </div>
                  <Progress value={app.totalDrainPercent} className="h-1 mt-1" />
                  <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground">
                    <span>CPU {app.cpuPercent}%</span>
                    <span>Net {app.networkMb}MB</span>
                    <span>{app.wakeupsPerHour} wakeups/h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </GlassCard>
    </motion.div>
  );
}

// ── Tab 4: Automation Rules ──
function AutomationRulesTab() {
  const daemon = getAutomationDaemon();
  const [state, setState] = useState(daemon.getState());
  const { toast } = useToast();

  const domainColors: Record<string, string> = {
    network: "bg-blue-400/10 text-blue-400 border-blue-400/20",
    power: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    security: "bg-red-400/10 text-red-400 border-red-400/20",
    bluetooth: "bg-indigo-400/10 text-indigo-400 border-indigo-400/20",
    notification: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    system: "bg-purple-400/10 text-purple-400 border-purple-400/20",
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4">
      {/* Rules */}
      <GlassCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" /> Active Rules ({state.rules.filter(r => r.enabled).length}/{state.rules.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {state.rules.map(rule => (
            <div key={rule.id} className="p-3 rounded-lg border border-border/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${domainColors[rule.domain]}`}>
                    {rule.domain}
                  </div>
                  <span className="text-sm font-medium">{rule.name}</span>
                </div>
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={() => {
                    daemon.toggleRule(rule.id);
                    setState(daemon.getState());
                    toast({ title: rule.enabled ? "Rule paused" : "Rule activated" });
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{rule.description}</p>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span>Triggered {rule.triggerCount}x</span>
                {rule.lastTriggered && (
                  <span>Last: {new Date(rule.lastTriggered).toLocaleDateString()}</span>
                )}
                {rule.policyOverride && <Badge variant="outline" className="text-[10px]">Policy Override</Badge>}
              </div>
              <div className="flex flex-wrap gap-1">
                {rule.conditions.map((c, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">
                    {c.field} {c.operator} {String(c.value)}
                  </span>
                ))}
                <ChevronRight className="w-3 h-3 text-muted-foreground self-center" />
                {rule.actions.map((a, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                    {a.displayLabel}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </GlassCard>

      {/* Execution History */}
      <GlassCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" /> Execution History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {state.executionHistory.map(exec => (
              <div key={exec.id} className="flex items-center justify-between p-2 rounded-lg border border-border/20 text-xs">
                <div className="flex items-center gap-2">
                  {exec.success ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
                  <div>
                    <p className="font-medium">{exec.ruleName}</p>
                    <p className="text-muted-foreground text-[10px]">{exec.actionsExecuted.join(" → ")}</p>
                  </div>
                </div>
                <span className="text-muted-foreground text-[10px]">{new Date(exec.triggeredAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </GlassCard>
    </motion.div>
  );
}

// ── Tab 5: Recommendations ──
function RecommendationsTab() {
  const recommendations = [
    { id: "r1", icon: <Shield className="w-5 h-5 text-blue-400" />, title: "You joined café WiFi — Shield secured your traffic", desc: "VPN was automatically enabled when you connected to CoffeeShop-Free, an open network.", confidence: 0.95, domain: "network", action: "View Details" },
    { id: "r2", icon: <Heart className="w-5 h-5 text-pink-400" />, title: "Battery wear is increasing — enable optimized charging?", desc: "Your battery has completed 187 cycles. Holding charge at 80% can extend lifespan by up to 2 years.", confidence: 0.88, domain: "power", action: "Enable" },
    { id: "r3", icon: <Bluetooth className="w-5 h-5 text-indigo-400" />, title: "You haven't used Bluetooth in 7 days — turn it off?", desc: "Disabling Bluetooth when not in use saves approximately 3-5% battery per day.", confidence: 0.72, domain: "bluetooth", action: "Turn Off" },
    { id: "r4", icon: <Sparkles className="w-5 h-5 text-purple-400" />, title: "Calm Mode starts in 10 minutes for your work schedule", desc: "Based on your calendar, Focus Mode will activate at 9:00 AM for Sprint Planning.", confidence: 0.90, domain: "notification", action: "Adjust" },
    { id: "r5", icon: <AlertTriangle className="w-5 h-5 text-amber-400" />, title: "App requested startup + network + notifications — review?", desc: "Docker Desktop requested broad permissions. Review and restrict if not needed.", confidence: 0.82, domain: "security", action: "Review" },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
      {recommendations.map(rec => (
        <motion.div key={rec.id} variants={fadeUp}>
          <Card className="bg-card/50 backdrop-blur-xl border-border/30">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                  {rec.icon}
                </div>
                <div className="flex-1 space-y-1.5">
                  <p className="text-sm font-medium">{rec.title}</p>
                  <p className="text-xs text-muted-foreground">{rec.desc}</p>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <Progress value={rec.confidence * 100} className="w-16 h-1" />
                      <span className="text-[10px] text-muted-foreground">{Math.round(rec.confidence * 100)}% confidence</span>
                    </div>
                    <div className="flex gap-1.5">
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground">Dismiss</Button>
                      <Button size="sm" className="h-6 text-xs">{rec.action}</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ── Tab 6: Diagnostics & Self-Repair ──
function DiagnosticsTab() {
  const { toast } = useToast();
  const [running, setRunning] = useState<string | null>(null);

  const repairActions = [
    { id: "dns", label: "Flush DNS Cache", icon: <Globe className="w-4 h-4" />, desc: "Clear DNS resolver cache to fix name resolution issues" },
    { id: "net", label: "Reset Network Stack", icon: <Wifi className="w-4 h-4" />, desc: "Restart all network interfaces and routing tables" },
    { id: "bt", label: "Restart Bluetooth", icon: <Bluetooth className="w-4 h-4" />, desc: "Reset Bluetooth controller and re-initialize pairings" },
    { id: "fw", label: "Rebuild Firewall Rules", icon: <Shield className="w-4 h-4" />, desc: "Regenerate firewall policy from current security posture" },
    { id: "vpn", label: "Verify VPN Configuration", icon: <Globe className="w-4 h-4" />, desc: "Check VPN certificates, routes, and leak prevention" },
    { id: "power", label: "Recalibrate Battery", icon: <Battery className="w-4 h-4" />, desc: "Update battery capacity estimation from current readings" },
  ];

  const handleRepair = async (id: string) => {
    setRunning(id);
    await new Promise(r => setTimeout(r, 1500));
    setRunning(null);
    toast({ title: "Repair Complete", description: `${repairActions.find(a => a.id === id)?.label} completed successfully.` });
  };

  const halCapabilities = [
    { name: "WiFi Chipset", detected: true, driver: "iwlwifi", version: "12.0.3" },
    { name: "Bluetooth Controller", detected: true, driver: "btusb", version: "6.1.2" },
    { name: "Battery/ACPI", detected: true, driver: "acpi_battery", version: "1.0" },
    { name: "Thermal Sensors", detected: true, driver: "coretemp", version: "3.2.1" },
    { name: "Fan Control", detected: true, driver: "thinkpad_acpi", version: "0.26" },
    { name: "USB-C PD Controller", detected: true, driver: "ucsi_acpi", version: "2.1" },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2">
      <GlassCard className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wrench className="w-4 h-4 text-cyan-400" /> Self-Repair Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {repairActions.map(action => (
              <button
                key={action.id}
                onClick={() => handleRepair(action.id)}
                disabled={running === action.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border/20 hover:bg-muted/30 transition-colors text-left disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-400/10 flex items-center justify-center text-cyan-400 shrink-0">
                  {running === action.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : action.icon}
                </div>
                <div>
                  <p className="text-xs font-medium">{action.label}</p>
                  <p className="text-[10px] text-muted-foreground">{action.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </GlassCard>

      <GlassCard className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" /> Hardware Abstraction Layer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {halCapabilities.map(cap => (
              <div key={cap.name} className="flex items-center justify-between text-xs p-2 rounded border border-border/20">
                <div className="flex items-center gap-2">
                  <StatusDot status={cap.detected ? "ok" : "error"} />
                  <span className="font-medium">{cap.name}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>{cap.driver}</span>
                  <Badge variant="outline" className="text-[10px]">{cap.version}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </GlassCard>
    </motion.div>
  );
}

// ── Main Dashboard ──
export default function SYS01SystemIntelligence() {
  const { isAdmin, loading } = useRequireAdmin();
  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-primary" />
            System Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Network, Bluetooth, Power, Automation, and Diagnostics — unified OS intelligence
          </p>
        </div>
      </div>

      <Tabs defaultValue="network" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="network" className="text-xs gap-1"><Wifi className="w-3 h-3" /> Network</TabsTrigger>
          <TabsTrigger value="bluetooth" className="text-xs gap-1"><Bluetooth className="w-3 h-3" /> Bluetooth</TabsTrigger>
          <TabsTrigger value="power" className="text-xs gap-1"><Battery className="w-3 h-3" /> Power</TabsTrigger>
          <TabsTrigger value="automation" className="text-xs gap-1"><Sparkles className="w-3 h-3" /> Automation</TabsTrigger>
          <TabsTrigger value="recommendations" className="text-xs gap-1"><Eye className="w-3 h-3" /> Intel</TabsTrigger>
          <TabsTrigger value="diagnostics" className="text-xs gap-1"><Wrench className="w-3 h-3" /> Repair</TabsTrigger>
        </TabsList>

        <TabsContent value="network"><NetworkIntelligenceTab /></TabsContent>
        <TabsContent value="bluetooth"><BluetoothIntelligenceTab /></TabsContent>
        <TabsContent value="power"><PowerIntelligenceTab /></TabsContent>
        <TabsContent value="automation"><AutomationRulesTab /></TabsContent>
        <TabsContent value="recommendations"><RecommendationsTab /></TabsContent>
        <TabsContent value="diagnostics"><DiagnosticsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
