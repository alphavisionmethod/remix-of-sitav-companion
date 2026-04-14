import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SparklineChart } from "@/components/sita/SparklineChart";
import {
  Cpu, HardDrive, Shield, Wifi, Server, Activity, Zap, RefreshCw,
  Clock, AlertTriangle, CheckCircle2, XCircle, Terminal, Database,
  Layers, Monitor, Lock, Bluetooth, Radio, MemoryStick, Power,
  Eye, Settings, Bug, Download, RotateCcw, Thermometer, Network
} from "lucide-react";
import { healthd, type ServiceHealth } from "@/lib/os-services/healthd";
import { crashd } from "@/lib/os-services/crashd";
import { timed } from "@/lib/os-services/timed";
import { settingsd } from "@/lib/os-services/settingsd";
import { accessibilityd } from "@/lib/os-services/accessibilityd";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };

const StatusDot = ({ status }: { status: string }) => {
  const color = status === 'healthy' ? 'bg-emerald-500' : status === 'degraded' ? 'bg-amber-500' : status === 'critical' ? 'bg-red-500' : 'bg-muted-foreground/40';
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} />;
};

const BOOT_STAGES = [
  { name: 'Bootloader', icon: Terminal, timeMs: 120, status: 'complete' as const, services: ['bootctrl', 'slotmgr'] },
  { name: 'Kernel Init', icon: Cpu, timeMs: 340, status: 'complete' as const, services: ['memory-manager', 'scheduler', 'filesystem'] },
  { name: 'HAL & Drivers', icon: HardDrive, timeMs: 280, status: 'complete' as const, services: ['hald', 'driverd'] },
  { name: 'Core Services', icon: Server, timeMs: 450, status: 'complete' as const, services: ['logd', 'auditd', 'settingsd', 'crashd', 'healthd'] },
  { name: 'Security Layer', icon: Shield, timeMs: 220, status: 'complete' as const, services: ['authd', 'sessiond', 'secretsd', 'policyd', 'shieldd', 'sandboxd'] },
  { name: 'Network Layer', icon: Wifi, timeMs: 380, status: 'complete' as const, services: ['networkd', 'wifid', 'btd', 'dnsd'] },
  { name: 'Desktop Shell', icon: Monitor, timeMs: 510, status: 'complete' as const, services: ['powerd', 'timed', 'notifyd', 'updated', 'pkgd', 'accessibilityd'] },
];

const KERNEL_SUBSYSTEMS = [
  { name: 'Memory Manager', icon: MemoryStick, metric: '4.2 / 16 GB', pct: 26, sparkline: [20, 22, 25, 24, 26, 28, 26] },
  { name: 'Process Scheduler', icon: Activity, metric: '142 tasks', pct: 35, sparkline: [30, 32, 35, 33, 36, 34, 35] },
  { name: 'Filesystem', icon: Database, metric: '128 / 512 GB', pct: 25, sparkline: [24, 24, 25, 25, 25, 25, 25] },
  { name: 'IPC Bus', icon: Radio, metric: '2.4k msg/s', pct: 18, sparkline: [15, 18, 22, 19, 16, 20, 18] },
  { name: 'Security Hooks', icon: Lock, metric: '0 violations', pct: 0, sparkline: [0, 0, 0, 0, 0, 1, 0] },
  { name: 'Network Stack', icon: Network, metric: '340 KB/s', pct: 12, sparkline: [8, 12, 15, 10, 14, 11, 12] },
  { name: 'Power Hooks', icon: Power, metric: 'S0 Active', pct: 45, sparkline: [40, 42, 45, 44, 46, 43, 45] },
  { name: 'Driver Interface', icon: Layers, metric: '12 loaded', pct: 8, sparkline: [8, 8, 8, 8, 8, 8, 8] },
];

const DRIVERS = [
  { name: 'Display Driver', bus: 'PCI', signed: true, version: '4.2.1', status: 'loaded' },
  { name: 'Audio Controller', bus: 'PCI', signed: true, version: '2.8.0', status: 'loaded' },
  { name: 'WiFi Adapter', bus: 'PCI', signed: true, version: '6.1.3', status: 'loaded' },
  { name: 'Bluetooth HCI', bus: 'USB', signed: true, version: '1.4.2', status: 'loaded' },
  { name: 'NVMe Storage', bus: 'PCI', signed: true, version: '3.0.1', status: 'loaded' },
  { name: 'USB Hub', bus: 'USB', signed: true, version: '2.0.0', status: 'loaded' },
  { name: 'Input Devices', bus: 'USB', signed: true, version: '1.1.0', status: 'loaded' },
  { name: 'Camera Module', bus: 'USB', signed: true, version: '1.2.4', status: 'loaded' },
  { name: 'Thermal Sensor', bus: 'ACPI', signed: true, version: '1.0.0', status: 'loaded' },
  { name: 'Battery ACPI', bus: 'ACPI', signed: true, version: '1.0.0', status: 'loaded' },
  { name: 'TPM 2.0', bus: 'Platform', signed: true, version: '2.0.0', status: 'loaded' },
  { name: 'Virtual GPU', bus: 'Virtual', signed: false, version: '0.9.1', status: 'quarantined' },
];

const UPDATE_SLOTS = [
  { slot: 'A', version: 'SITA OS 2.3.1', status: 'active', health: 'verified', bootCount: 142 },
  { slot: 'B', version: 'SITA OS 2.4.0-rc2', status: 'standby', health: 'staged', bootCount: 0 },
];

const bootTargetColor = (t: string) => t === 'core' ? 'text-blue-400 bg-blue-500/10' : t === 'network' ? 'text-emerald-400 bg-emerald-500/10' : t === 'security' ? 'text-red-400 bg-red-500/10' : 'text-purple-400 bg-purple-500/10';

export default function OS01PlatformCommandCenter() {
  const [selectedService, setSelectedService] = useState<ServiceHealth | null>(null);
  const services = healthd.getServices();
  const resources = healthd.getResources();
  const healthScore = healthd.getHealthScore();
  const crashes = crashd.getCrashes(10);
  const crashFreq = crashd.getCrashFrequency();
  const syncStatus = timed.getSyncStatus();
  const allSettings = settingsd.getAllEntries();
  const a11y = accessibilityd.getState();
  const totalBootMs = BOOT_STAGES.reduce((s, b) => s + b.timeMs, 0);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">OS Platform Command Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Full-stack operating system monitoring and control</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border/50">
            <span className={`w-2.5 h-2.5 rounded-full ${healthScore > 80 ? 'bg-emerald-500' : healthScore > 50 ? 'bg-amber-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-sm font-semibold text-foreground">{healthScore}/100</span>
          </div>
          <Badge variant="outline" className="text-xs">{services.length} services</Badge>
        </div>
      </div>

      {/* Top resource bar */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: 'CPU', value: `${resources.cpuUsage?.toFixed(1)}%`, pct: resources.cpuUsage, icon: Cpu },
          { label: 'Memory', value: `${resources.memoryUsed}/${resources.memoryTotal} GB`, pct: (resources.memoryUsed / resources.memoryTotal) * 100, icon: MemoryStick },
          { label: 'Disk', value: `${resources.diskUsed}/${resources.diskTotal} GB`, pct: (resources.diskUsed / resources.diskTotal) * 100, icon: HardDrive },
          { label: 'Network', value: `${resources.networkRxKBps?.toFixed(0)} KB/s`, pct: Math.min(100, (resources.networkRxKBps || 0) / 10), icon: Network },
          { label: 'Temp', value: `${resources.temperature?.toFixed(0)}°C`, pct: Math.min(100, ((resources.temperature || 0) / 100) * 100), icon: Thermometer },
          { label: 'Load', value: resources.loadAvg?.join(' / ') || '0', pct: Math.min(100, ((resources.loadAvg?.[0] || 0) / 4) * 100), icon: Activity },
        ].map(r => (
          <motion.div key={r.label} variants={fadeUp}>
            <Card className="bg-card/60 backdrop-blur-sm border-border/30">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{r.label}</span>
                  <r.icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <p className="text-sm font-bold text-foreground mb-1">{r.value}</p>
                <Progress value={r.pct} className="h-1" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Tabs defaultValue="boot" className="space-y-4">
        <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1">
          {['boot', 'kernel', 'services', 'security', 'drivers', 'updates', 'settings', 'diagnostics'].map(t => (
            <TabsTrigger key={t} value={t} className="text-xs capitalize">{t === 'boot' ? 'Boot Pipeline' : t === 'kernel' ? 'Kernel' : t === 'services' ? 'Service Fleet' : t === 'security' ? 'Security' : t === 'drivers' ? 'Hardware' : t === 'updates' ? 'Updates' : t === 'settings' ? 'Settings' : 'Diagnostics'}</TabsTrigger>
          ))}
        </TabsList>

        {/* BOOT PIPELINE */}
        <TabsContent value="boot">
          <Card className="bg-card/60 backdrop-blur-sm border-border/30">
            <CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><Terminal className="h-5 w-5 text-primary" /> Boot Pipeline — {totalBootMs}ms total</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {BOOT_STAGES.map((stage, i) => (
                <motion.div key={stage.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors group">
                  <div className="p-2 rounded-lg bg-primary/10"><stage.icon className="h-4 w-4 text-primary" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{stage.name}</p>
                      <Badge variant="outline" className="text-[10px]">{stage.timeMs}ms</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {stage.services.map(s => <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">{s}</span>)}
                    </div>
                  </div>
                  <div className="w-24">
                    <Progress value={(stage.timeMs / 600) * 100} className="h-1.5" />
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* KERNEL */}
        <TabsContent value="kernel">
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {KERNEL_SUBSYSTEMS.map(ks => (
              <motion.div key={ks.name} variants={fadeUp}>
                <Card className="bg-card/60 backdrop-blur-sm border-border/30 hover:border-primary/30 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <ks.icon className="h-5 w-5 text-primary" />
                      <SparklineChart data={ks.sparkline} width={60} height={20} positive />
                    </div>
                    <p className="text-sm font-semibold text-foreground">{ks.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{ks.metric}</p>
                    <Progress value={ks.pct} className="h-1 mt-2" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        {/* SERVICE FLEET */}
        <TabsContent value="services">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Card className="bg-card/60 backdrop-blur-sm border-border/30">
                <CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><Server className="h-5 w-5 text-primary" /> Service Fleet ({services.length})</CardTitle></CardHeader>
                <CardContent className="space-y-1 max-h-[600px] overflow-y-auto">
                  {services.map(svc => (
                    <div key={svc.name} onClick={() => setSelectedService(svc)} className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${selectedService?.name === svc.name ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/30'}`}>
                      <StatusDot status={svc.status} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono font-medium text-foreground">{svc.name}</p>
                          <Badge className={`text-[9px] ${bootTargetColor(svc.bootTarget)}`}>{svc.bootTarget}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">PID {svc.pid} · {svc.restarts} restarts</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">CPU {svc.cpuPercent}%</p>
                        <p className="text-[10px] text-muted-foreground">{svc.memoryMB} MB</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            <Card className="bg-card/60 backdrop-blur-sm border-border/30">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Service Detail</CardTitle></CardHeader>
              <CardContent>
                {selectedService ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <StatusDot status={selectedService.status} />
                      <p className="font-mono font-bold text-foreground">{selectedService.name}</p>
                    </div>
                    {[
                      ['PID', selectedService.pid],
                      ['Status', selectedService.status],
                      ['Uptime', `${Math.floor(selectedService.uptime / 3600)}h ${Math.floor((selectedService.uptime % 3600) / 60)}m`],
                      ['Restarts', selectedService.restarts],
                      ['CPU', `${selectedService.cpuPercent}%`],
                      ['Memory', `${selectedService.memoryMB} MB`],
                      ['Boot Target', selectedService.bootTarget],
                    ].map(([k, v]) => (
                      <div key={String(k)} className="flex justify-between text-xs"><span className="text-muted-foreground">{k}</span><span className="font-mono text-foreground">{v}</span></div>
                    ))}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="text-xs flex-1"><RefreshCw className="h-3 w-3 mr-1" />Restart</Button>
                      <Button variant="outline" size="sm" className="text-xs flex-1"><XCircle className="h-3 w-3 mr-1" />Stop</Button>
                    </div>
                  </div>
                ) : <p className="text-xs text-muted-foreground text-center py-8">Click a service to view details</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SECURITY */}
        <TabsContent value="security">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-card/60 backdrop-blur-sm border-border/30 col-span-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-8">
                  {/* Trust rings */}
                  <div className="relative w-48 h-48">
                    {[{ r: 90, label: 'Kernel', color: 'border-red-500/60' }, { r: 68, label: 'Services', color: 'border-amber-500/60' }, { r: 46, label: 'Apps', color: 'border-blue-500/60' }, { r: 24, label: 'User', color: 'border-emerald-500/60' }].map(ring => (
                      <div key={ring.label} className={`absolute rounded-full border-2 ${ring.color}`} style={{ width: ring.r * 2, height: ring.r * 2, left: `calc(50% - ${ring.r}px)`, top: `calc(50% - ${ring.r}px)` }}>
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[8px] bg-card px-1 text-muted-foreground">{ring.label}</span>
                      </div>
                    ))}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Sandbox Active', value: 'All apps sandboxed', ok: true },
                      { label: 'Firewall Rules', value: '24 active rules', ok: true },
                      { label: 'Capability Enforcement', value: '100% enforced', ok: true },
                      { label: 'VPN Status', value: 'Not connected', ok: false },
                      { label: 'Active Threats', value: '0 detected', ok: true },
                      { label: 'Audit Trail', value: '1,247 entries', ok: true },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-2">
                        {item.ok ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                        <span className="text-xs text-muted-foreground w-36">{item.label}</span>
                        <span className="text-xs font-medium text-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* DRIVERS */}
        <TabsContent value="drivers">
          <Card className="bg-card/60 backdrop-blur-sm border-border/30">
            <CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><HardDrive className="h-5 w-5 text-primary" /> Loaded Drivers ({DRIVERS.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {DRIVERS.map(d => (
                  <div key={d.name} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className={`p-1.5 rounded ${d.signed ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                      {d.signed ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 text-red-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{d.name}</p>
                      <p className="text-[10px] text-muted-foreground">{d.bus} · v{d.version}</p>
                    </div>
                    <Badge variant={d.status === 'loaded' ? 'outline' : 'destructive'} className="text-[9px]">{d.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* UPDATES */}
        <TabsContent value="updates">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {UPDATE_SLOTS.map(slot => (
              <Card key={slot.slot} className={`bg-card/60 backdrop-blur-sm ${slot.status === 'active' ? 'border-emerald-500/30' : 'border-border/30'}`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${slot.status === 'active' ? 'text-emerald-500' : 'text-muted-foreground'}`}>{slot.slot}</span>
                      <Badge variant={slot.status === 'active' ? 'default' : 'outline'} className="text-xs">{slot.status}</Badge>
                    </div>
                    {slot.status === 'active' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                  </div>
                  <p className="text-sm font-medium text-foreground">{slot.version}</p>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <p>Health: <span className="text-foreground font-medium">{slot.health}</span></p>
                    <p>Boot count: <span className="text-foreground font-medium">{slot.bootCount}</span></p>
                  </div>
                  {slot.status === 'standby' && <Button variant="outline" size="sm" className="mt-3 w-full text-xs"><Download className="h-3 w-3 mr-1" />Activate Slot {slot.slot}</Button>}
                </CardContent>
              </Card>
            ))}
            <Card className="bg-card/60 backdrop-blur-sm border-border/30 col-span-full">
              <CardContent className="p-5">
                <p className="text-sm font-medium text-foreground mb-3">Rollback History</p>
                {[
                  { from: '2.2.0', to: '2.1.8', reason: 'WiFi driver regression', date: '2026-03-28' },
                  { from: '2.0.1', to: '2.0.0', reason: 'Boot loop on slot B', date: '2026-02-14' },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-muted/30">
                    <RotateCcw className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs text-muted-foreground">{r.date}</span>
                    <span className="text-xs text-foreground">{r.from} → {r.to}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">{r.reason}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SETTINGS */}
        <TabsContent value="settings">
          <Card className="bg-card/60 backdrop-blur-sm border-border/30">
            <CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><Settings className="h-5 w-5 text-primary" /> Settings Registry ({allSettings.length} entries)</CardTitle></CardHeader>
            <CardContent className="space-y-1 max-h-[500px] overflow-y-auto">
              {allSettings.map(entry => (
                <div key={entry.key} className="flex items-center gap-3 p-2 rounded hover:bg-muted/30 transition-colors">
                  <Badge variant="outline" className="text-[9px] w-20 justify-center">{entry.namespace}</Badge>
                  <p className="text-xs font-mono text-foreground flex-1">{entry.key}</p>
                  <span className="text-xs text-muted-foreground">{JSON.stringify(entry.value)}</span>
                  <Badge variant="outline" className="text-[8px]">{entry.source}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DIAGNOSTICS */}
        <TabsContent value="diagnostics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card/60 backdrop-blur-sm border-border/30">
              <CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><Bug className="h-5 w-5 text-red-500" /> Recent Crashes ({crashes.length})</CardTitle></CardHeader>
              <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                {crashes.map(crash => (
                  <div key={crash.id} className="p-3 rounded-lg bg-muted/30 border border-border/20 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium text-foreground">{crash.processName}</span>
                        <Badge variant={crash.severity === 'critical' ? 'destructive' : 'outline'} className="text-[9px]">{crash.severity}</Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{new Date(crash.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Signal: {crash.signal} · Exit: {crash.exitCode} · PID: {crash.pid}</p>
                    <div className="bg-background/50 rounded p-2 mt-1">
                      {crash.stackTrace.map((frame, i) => <p key={i} className="text-[10px] font-mono text-muted-foreground">{frame}</p>)}
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      {crash.restartSucceeded ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                      <span className="text-muted-foreground">{crash.restartSucceeded ? 'Auto-restarted' : 'Restart failed'}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <div className="space-y-4">
              <Card className="bg-card/60 backdrop-blur-sm border-border/30">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Crash Frequency</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {crashFreq.map(f => (
                    <div key={f.process} className="flex items-center gap-3">
                      <span className="text-xs font-mono text-foreground w-20">{f.process}</span>
                      <Progress value={Math.min(100, f.count * 25)} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground">{f.count}x</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card className="bg-card/60 backdrop-blur-sm border-border/30">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Self-Repair Actions</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { label: 'Reset Network Stack', icon: Wifi },
                    { label: 'Flush DNS Cache', icon: Network },
                    { label: 'Restart All Services', icon: RefreshCw },
                    { label: 'Clear Safe Mode', icon: Shield },
                    { label: 'Export Diagnostic Bundle', icon: Download },
                  ].map(action => (
                    <Button key={action.label} variant="outline" size="sm" className="w-full justify-start text-xs">
                      <action.icon className="h-3.5 w-3.5 mr-2" />{action.label}
                    </Button>
                  ))}
                </CardContent>
              </Card>
              <Card className="bg-card/60 backdrop-blur-sm border-border/30">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Time Sync</CardTitle></CardHeader>
                <CardContent className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Source</span><span className="text-foreground">{syncStatus.source}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Server</span><span className="font-mono text-foreground">{syncStatus.server}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Drift</span><span className="text-foreground">{syncStatus.driftMs.toFixed(2)}ms</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">RTT</span><span className="text-foreground">{syncStatus.roundTripMs.toFixed(0)}ms</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Stratum</span><span className="text-foreground">{syncStatus.stratum}</span></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
