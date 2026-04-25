import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SparklineChart } from "@/platform/sita/components/sita/SparklineChart";
import {
  Cpu, HardDrive, Shield, Wifi, Server, Activity, Zap, RefreshCw,
  Clock, AlertTriangle, CheckCircle2, XCircle, Terminal, Database,
  Layers, Monitor, Lock, Bluetooth, Radio, MemoryStick, Power,
  Eye, Settings, Bug, Download, RotateCcw, Thermometer, Network,
  Volume2, Printer, Globe, Key, Package, FileText, Bell, HeartPulse,
  Gauge, GitBranch, Languages, ShieldCheck, Wrench, BarChart3, Scale
} from "lucide-react";
import { healthd, type ServiceHealth } from "@/lib/os-services/healthd";
import { crashd } from "@/lib/os-services/crashd";
import { timed } from "@/lib/os-services/timed";
import { settingsd } from "@/lib/os-services/settingsd";
import { accessibilityd } from "@/lib/os-services/accessibilityd";
import { healthGraph } from "@/lib/os-services/health-graph";
import { ipcBus } from "@/lib/os-services/platform-ipc-bus";
import { capabilityCatalog } from "@/lib/os-services/capability-catalog";
import { quotaGovernor } from "@/lib/os-services/quota-governor";
import { appLifecycle } from "@/lib/os-services/app-lifecycle";
import { policyResolver } from "@/lib/os-services/policy-resolver";
import { notificationClassifier } from "@/lib/os-services/notification-classifier";
import { recoveryEngine } from "@/lib/os-services/recovery-levels";
import { networkPolicyMatrix } from "@/lib/os-services/network-policy-matrix";
import { audiod } from "@/lib/os-services/audiod";
import { deviced } from "@/lib/os-services/deviced";
import { sloTargets } from "@/lib/os-services/slo-targets";
import { releaseLifecycle } from "@/lib/os-services/release-lifecycle";
import { signingTrustChain } from "@/lib/os-services/signing-trust-chain";
import { diagnosticBundleGenerator } from "@/lib/os-services/diagnostic-bundle";
import { abiVersionManager } from "@/lib/os-services/abi-versioning";
import { migrationEngine } from "@/lib/os-services/migration-engine";
import { localizationInfra } from "@/lib/os-services/localization-infra";
import { recommendationRanker } from "@/lib/os-services/recommendation-ranker";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };

const StatusDot = ({ status }: { status: string }) => {
  const color = status === 'healthy' || status === 'ready' || status === 'live' || status === 'meeting'
    ? 'bg-emerald-500'
    : status === 'degraded' || status === 'at_risk'
    ? 'bg-amber-500'
    : status === 'critical' || status === 'failed' || status === 'breaching' || status === 'unsafe'
    ? 'bg-red-500' : 'bg-muted-foreground/40';
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} />;
};

const BOOT_STAGES = [
  { name: 'Bootloader', icon: Terminal, timeMs: 120, services: ['bootctrl', 'slotmgr'] },
  { name: 'Kernel Init', icon: Cpu, timeMs: 340, services: ['memory-manager', 'scheduler', 'filesystem'] },
  { name: 'HAL & Drivers', icon: HardDrive, timeMs: 280, services: ['hald', 'driverd'] },
  { name: 'Core Services', icon: Server, timeMs: 450, services: ['logd', 'auditd', 'settingsd', 'crashd', 'healthd'] },
  { name: 'Security Layer', icon: Shield, timeMs: 220, services: ['authd', 'sessiond', 'secretsd', 'policyd', 'shieldd', 'sandboxd'] },
  { name: 'Network Layer', icon: Wifi, timeMs: 380, services: ['networkd', 'wifid', 'btd', 'dnsd'] },
  { name: 'Desktop Shell', icon: Monitor, timeMs: 510, services: ['powerd', 'timed', 'notifyd', 'updated', 'pkgd', 'accessibilityd'] },
];

const KERNEL_SUBSYSTEMS = [
  { name: 'Memory Manager', icon: MemoryStick, metric: '4.2 / 16 GB', pct: 26, sparkline: [20, 22, 25, 24, 26, 28, 26] },
  { name: 'Process Scheduler', icon: Activity, metric: '142 tasks', pct: 35, sparkline: [30, 32, 35, 33, 36, 34, 35] },
  { name: 'Filesystem', icon: Database, metric: '128 / 512 GB', pct: 25, sparkline: [24, 24, 25, 25, 25, 25, 25] },
  { name: 'IPC Bus', icon: Radio, metric: `${ipcBus.stats().methods} methods`, pct: 18, sparkline: [15, 18, 22, 19, 16, 20, 18] },
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

const TAB_DEFS = [
  { value: 'boot', label: 'Boot', icon: Terminal },
  { value: 'kernel', label: 'Kernel', icon: Cpu },
  { value: 'services', label: 'Services', icon: Server },
  { value: 'health', label: 'Health Graph', icon: HeartPulse },
  { value: 'security', label: 'Security', icon: Shield },
  { value: 'policy', label: 'Policy', icon: Scale },
  { value: 'drivers', label: 'Hardware', icon: HardDrive },
  { value: 'devices', label: 'Devices', icon: Printer },
  { value: 'audio', label: 'Audio', icon: Volume2 },
  { value: 'network', label: 'Network', icon: Network },
  { value: 'updates', label: 'Updates', icon: Download },
  { value: 'slos', label: 'SLOs', icon: Gauge },
  { value: 'recovery', label: 'Recovery', icon: Wrench },
  { value: 'settings', label: 'Settings', icon: Settings },
  { value: 'diagnostics', label: 'Diagnostics', icon: Bug },
  { value: 'capabilities', label: 'Capabilities', icon: Key },
  { value: 'signing', label: 'Trust Chain', icon: ShieldCheck },
];

export default function OS01PlatformCommandCenter() {
  const [selectedService, setSelectedService] = useState<ServiceHealth | null>(null);
  const services = healthd.getServices();
  const resources = healthd.getResources();
  const healthScore = healthd.getHealthScore();
  const crashes = crashd.getCrashes(10);
  const crashFreq = crashd.getCrashFrequency();
  const syncStatus = timed.getSyncStatus();
  const allSettings = settingsd.getAllEntries();
  const totalBootMs = BOOT_STAGES.reduce((s, b) => s + b.timeMs, 0);

  // New subsystem data
  const graphHealth = healthGraph.systemHealth();
  const graphNodes = healthGraph.allNodes();
  const sloSummary = sloTargets.summary();
  const allSlos = sloTargets.all();
  const capRisk = capabilityCatalog.riskSummary();
  const allCaps = capabilityCatalog.all();
  const quotaStats = quotaGovernor.stats();
  const allQuotas = quotaGovernor.allRules();
  const recoveryActions = recoveryEngine.allActions();
  const policyStats = policyResolver.stats();
  const allPolicies = policyResolver.allRules();
  const audioDevices = audiod.allDevices();
  const extDevices = deviced.allDevices();
  const signingKeys = signingTrustChain.allKeys();
  const currentRelease = releaseLifecycle.getCurrent();
  const abiEntries = abiVersionManager.allEntries();
  const migrationStats = migrationEngine.stats();
  const locales = localizationInfra.availableLocales();
  const notifStats = notificationClassifier.stats();

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">OS Platform Command Center</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">Full-stack operating system monitoring · {services.length} services · {capabilityCatalog.count()} capabilities</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border/50">
            <span className={`w-2.5 h-2.5 rounded-full ${healthScore > 80 ? 'bg-emerald-500' : healthScore > 50 ? 'bg-amber-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-sm font-semibold text-foreground">{healthScore}/100</span>
          </div>
          <Badge variant="outline" className="text-[10px]">SLO {sloSummary.overallScore}%</Badge>
          <Badge variant="outline" className="text-[10px]">{currentRelease.channel} · {currentRelease.version}</Badge>
        </div>
      </div>

      {/* Resource bar */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {[
          { label: 'CPU', value: `${resources.cpuUsage?.toFixed(1)}%`, pct: resources.cpuUsage, icon: Cpu },
          { label: 'Memory', value: `${resources.memoryUsed}/${resources.memoryTotal} GB`, pct: (resources.memoryUsed / resources.memoryTotal) * 100, icon: MemoryStick },
          { label: 'Disk', value: `${resources.diskUsed}/${resources.diskTotal} GB`, pct: (resources.diskUsed / resources.diskTotal) * 100, icon: HardDrive },
          { label: 'Network', value: `${resources.networkRxKBps?.toFixed(0)} KB/s`, pct: Math.min(100, (resources.networkRxKBps || 0) / 10), icon: Network },
          { label: 'Temp', value: `${resources.temperature?.toFixed(0)}°C`, pct: Math.min(100, ((resources.temperature || 0) / 100) * 100), icon: Thermometer },
          { label: 'Health Graph', value: `${graphHealth.score}%`, pct: graphHealth.score, icon: HeartPulse },
        ].map(r => (
          <motion.div key={r.label} variants={fadeUp}>
            <Card className="bg-card/60 backdrop-blur-sm border-border/30">
              <CardContent className="p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{r.label}</span>
                  <r.icon className="h-3 w-3 text-muted-foreground" />
                </div>
                <p className="text-xs font-bold text-foreground mb-1">{r.value}</p>
                <Progress value={r.pct} className="h-1" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Tabs defaultValue="boot" className="space-y-4">
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1 w-max md:w-auto">
            {TAB_DEFS.map(t => (
              <TabsTrigger key={t.value} value={t.value} className="text-[10px] gap-1 px-2 py-1">
                <t.icon className="h-3 w-3" />
                <span className="hidden sm:inline">{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* ════════ BOOT ════════ */}
        <TabsContent value="boot">
          <Card className="bg-card/60 backdrop-blur-sm border-border/30">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Terminal className="h-4 w-4 text-primary" /> Boot Pipeline — {totalBootMs}ms</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {BOOT_STAGES.map((stage, i) => (
                <motion.div key={stage.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="p-1.5 rounded-lg bg-primary/10"><stage.icon className="h-3.5 w-3.5 text-primary" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2"><p className="text-xs font-medium text-foreground">{stage.name}</p><Badge variant="outline" className="text-[9px]">{stage.timeMs}ms</Badge></div>
                    <div className="flex flex-wrap gap-1 mt-0.5">{stage.services.map(s => <span key={s} className="text-[8px] px-1 py-0.5 rounded bg-muted/50 text-muted-foreground">{s}</span>)}</div>
                  </div>
                  <div className="w-20"><Progress value={(stage.timeMs / 600) * 100} className="h-1" /></div>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════ KERNEL ════════ */}
        <TabsContent value="kernel">
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {KERNEL_SUBSYSTEMS.map(ks => (
              <motion.div key={ks.name} variants={fadeUp}>
                <Card className="bg-card/60 backdrop-blur-sm border-border/30 hover:border-primary/30 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <ks.icon className="h-4 w-4 text-primary" />
                      <SparklineChart data={ks.sparkline} width={50} height={16} positive />
                    </div>
                    <p className="text-xs font-semibold text-foreground">{ks.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{ks.metric}</p>
                    <Progress value={ks.pct} className="h-1 mt-1.5" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        {/* ════════ SERVICES ════════ */}
        <TabsContent value="services">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2">
              <Card className="bg-card/60 backdrop-blur-sm border-border/30">
                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Server className="h-4 w-4 text-primary" /> Service Fleet ({services.length})</CardTitle></CardHeader>
                <CardContent className="space-y-0.5 max-h-[500px] overflow-y-auto">
                  {services.map(svc => (
                    <div key={svc.name} onClick={() => setSelectedService(svc)} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${selectedService?.name === svc.name ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/30'}`}>
                      <StatusDot status={svc.status} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5"><p className="text-xs font-mono font-medium text-foreground truncate">{svc.name}</p><Badge className={`text-[8px] ${bootTargetColor(svc.bootTarget)}`}>{svc.bootTarget}</Badge></div>
                        <p className="text-[9px] text-muted-foreground">PID {svc.pid} · {svc.restarts} restarts</p>
                      </div>
                      <div className="text-right"><p className="text-[9px] text-muted-foreground">CPU {svc.cpuPercent}%</p><p className="text-[9px] text-muted-foreground">{svc.memoryMB} MB</p></div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            <Card className="bg-card/60 backdrop-blur-sm border-border/30">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Service Detail</CardTitle></CardHeader>
              <CardContent>
                {selectedService ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2"><StatusDot status={selectedService.status} /><p className="font-mono font-bold text-sm text-foreground">{selectedService.name}</p></div>
                    {[['PID', selectedService.pid], ['Status', selectedService.status], ['Uptime', `${Math.floor(selectedService.uptime / 3600)}h ${Math.floor((selectedService.uptime % 3600) / 60)}m`], ['Restarts', selectedService.restarts], ['CPU', `${selectedService.cpuPercent}%`], ['Memory', `${selectedService.memoryMB} MB`], ['Boot Target', selectedService.bootTarget]].map(([k, v]) => (
                      <div key={String(k)} className="flex justify-between text-xs"><span className="text-muted-foreground">{k}</span><span className="font-mono text-foreground">{v}</span></div>
                    ))}
                    <div className="flex gap-2 pt-2"><Button variant="outline" size="sm" className="text-[10px] flex-1"><RefreshCw className="h-3 w-3 mr-1" />Restart</Button><Button variant="outline" size="sm" className="text-[10px] flex-1"><XCircle className="h-3 w-3 mr-1" />Stop</Button></div>
                  </div>
                ) : <p className="text-xs text-muted-foreground text-center py-8">Click a service to inspect</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ════════ HEALTH GRAPH ════════ */}
        <TabsContent value="health">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <Card className="bg-card/60 backdrop-blur-sm border-border/30 lg:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><HeartPulse className="h-4 w-4 text-primary" /> Service Health DAG ({graphNodes.length} nodes)</CardTitle></CardHeader>
              <CardContent className="space-y-1 max-h-[500px] overflow-y-auto">
                {graphNodes.map(node => (
                  <div key={node.serviceId} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <StatusDot status={node.state} />
                    <p className="text-xs font-mono font-medium text-foreground w-28 truncate">{node.serviceId}</p>
                    <Badge variant="outline" className="text-[8px]">{node.state}</Badge>
                    <div className="flex-1 flex flex-wrap gap-1">
                      {node.dependencies.map(d => <span key={d} className="text-[8px] px-1 py-0.5 rounded bg-muted/50 text-muted-foreground">→{d}</span>)}
                    </div>
                    <span className="text-[9px] text-muted-foreground">{node.restartCount}↻</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <div className="space-y-3">
              <Card className="bg-card/60 backdrop-blur-sm border-border/30">
                <CardHeader className="pb-2"><CardTitle className="text-sm">System Health</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {[['Healthy', graphHealth.healthy, 'text-emerald-400'], ['Degraded', graphHealth.degraded, 'text-amber-400'], ['Failed', graphHealth.failed, 'text-red-400'], ['Score', `${graphHealth.score}%`, 'text-primary']].map(([l, v, c]) => (
                    <div key={String(l)} className="flex justify-between text-xs"><span className="text-muted-foreground">{l}</span><span className={`font-semibold ${c}`}>{v}</span></div>
                  ))}
                </CardContent>
              </Card>
              <Card className="bg-card/60 backdrop-blur-sm border-border/30">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Boot Order</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {healthGraph.bootOrder().map((id, i) => (
                      <Badge key={id} variant="outline" className="text-[8px]">{i + 1}. {id}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/60 backdrop-blur-sm border-border/30">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Quotas</CardTitle></CardHeader>
                <CardContent className="space-y-1.5">
                  {[['Rules', quotaStats.totalRules], ['Enforced', quotaStats.enforced], ['Violations', quotaStats.violations]].map(([l, v]) => (
                    <div key={String(l)} className="flex justify-between text-xs"><span className="text-muted-foreground">{l}</span><span className="font-mono text-foreground">{v}</span></div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ════════ SECURITY ════════ */}
        <TabsContent value="security">
          <Card className="bg-card/60 backdrop-blur-sm border-border/30">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <div className="relative w-40 h-40">
                  {[{ r: 75, label: 'Kernel', color: 'border-red-500/60' }, { r: 56, label: 'Services', color: 'border-amber-500/60' }, { r: 38, label: 'Apps', color: 'border-blue-500/60' }, { r: 20, label: 'User', color: 'border-emerald-500/60' }].map(ring => (
                    <div key={ring.label} className={`absolute rounded-full border-2 ${ring.color}`} style={{ width: ring.r * 2, height: ring.r * 2, left: `calc(50% - ${ring.r}px)`, top: `calc(50% - ${ring.r}px)` }}>
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[7px] bg-card px-1 text-muted-foreground">{ring.label}</span>
                    </div>
                  ))}
                  <div className="absolute inset-0 flex items-center justify-center"><Shield className="h-5 w-5 text-primary" /></div>
                </div>
                <div className="space-y-2">
                  {[{ label: 'Signing Keys', value: `${signingTrustChain.getActiveKeys().length} active`, ok: true }, { label: 'Capabilities', value: `${capabilityCatalog.count()} registered`, ok: true }, { label: 'Policy Rules', value: `${policyStats.totalRules} active`, ok: true }, { label: 'Capability Risk', value: `${capRisk.critical} critical, ${capRisk.high} high`, ok: capRisk.critical === 0 }, { label: 'Sandbox', value: 'All apps sandboxed', ok: true }, { label: 'Firewall', value: '24 active rules', ok: true }].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      {item.ok ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <AlertTriangle className="h-3 w-3 text-amber-500" />}
                      <span className="text-[10px] text-muted-foreground w-28">{item.label}</span>
                      <span className="text-[10px] font-medium text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════ POLICY ════════ */}
        <TabsContent value="policy">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <Card className="bg-card/60 backdrop-blur-sm border-border/30">
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Scale className="h-4 w-4 text-primary" /> Policy Rules ({policyStats.totalRules})</CardTitle></CardHeader>
              <CardContent className="space-y-1 max-h-[400px] overflow-y-auto">
                {allPolicies.map(rule => (
                  <div key={rule.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30">
                    <Badge variant={rule.decision === 'deny' ? 'destructive' : rule.decision === 'allow' ? 'default' : 'outline'} className="text-[8px] w-12 justify-center">{rule.decision}</Badge>
                    <p className="text-[10px] font-mono text-foreground flex-1 truncate">{rule.capabilityId}</p>
                    <Badge variant="outline" className="text-[8px]">{rule.source}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="bg-card/60 backdrop-blur-sm border-border/30">
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Network className="h-4 w-4 text-primary" /> Network Policy Matrix</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Home + Private', input: { interface: 'wifi' as const, trust: 'private' as const, appTrust: 'trusted' as const, session: 'user' as const, mode: 'home' as const } },
                  { label: 'Public Wi-Fi', input: { interface: 'wifi' as const, trust: 'public' as const, appTrust: 'sandboxed' as const, session: 'user' as const, mode: 'travel' as const } },
                  { label: 'Work VPN', input: { interface: 'vpn' as const, trust: 'enterprise' as const, appTrust: 'trusted' as const, session: 'user' as const, mode: 'work' as const } },
                ].map(scenario => {
                  const result = networkPolicyMatrix.evaluate(scenario.input);
                  return (
                    <div key={scenario.label} className="p-2.5 rounded-lg bg-muted/20 border border-border/20 space-y-1.5">
                      <p className="text-xs font-semibold text-foreground">{scenario.label}</p>
                      <div className="grid grid-cols-2 gap-1">
                        {[['VPN', result.autoVPN], ['Bg Sync', result.allowBackgroundSync], ['Updates', result.allowUpdates], ['Tether', result.allowTethering], ['Discovery', result.allowLocalDiscovery], ['Incoming', result.allowIncomingTraffic]].map(([l, v]) => (
                          <div key={String(l)} className="flex items-center gap-1 text-[10px]">
                            {v ? <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" /> : <XCircle className="h-2.5 w-2.5 text-red-400" />}
                            <span className="text-muted-foreground">{l}</span>
                          </div>
                        ))}
                      </div>
                      <Badge variant="outline" className="text-[8px]">{result.firewallProfile}</Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ════════ DRIVERS ════════ */}
        <TabsContent value="drivers">
          <Card className="bg-card/60 backdrop-blur-sm border-border/30">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><HardDrive className="h-4 w-4 text-primary" /> Loaded Drivers ({DRIVERS.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {DRIVERS.map(d => (
                  <div key={d.name} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className={`p-1 rounded ${d.signed ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>{d.signed ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <XCircle className="h-3 w-3 text-red-500" />}</div>
                    <div className="flex-1 min-w-0"><p className="text-xs font-medium text-foreground">{d.name}</p><p className="text-[9px] text-muted-foreground">{d.bus} · v{d.version}</p></div>
                    <Badge variant={d.status === 'loaded' ? 'outline' : 'destructive'} className="text-[8px]">{d.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════ DEVICES ════════ */}
        <TabsContent value="devices">
          <Card className="bg-card/60 backdrop-blur-sm border-border/30">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Printer className="h-4 w-4 text-primary" /> External Devices ({extDevices.length})</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {extDevices.map(d => (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/20">
                  <div className="p-2 rounded-lg bg-primary/10">{d.category === 'printer' ? <Printer className="h-4 w-4 text-primary" /> : d.category === 'display' ? <Monitor className="h-4 w-4 text-primary" /> : <HardDrive className="h-4 w-4 text-primary" />}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">{d.name}</p>
                    <p className="text-[10px] text-muted-foreground">{d.manufacturer} · {d.connection} · {d.category}</p>
                    {d.totalSpaceGB && <p className="text-[10px] text-muted-foreground">{d.usedSpaceGB}/{d.totalSpaceGB} GB used</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={d.status === 'mounted' || d.status === 'connected' ? 'default' : 'outline'} className="text-[8px]">{d.status}</Badge>
                    {d.category === 'removable_drive' && <Button variant="outline" size="sm" className="text-[9px] h-6 px-2">Eject</Button>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════ AUDIO ════════ */}
        <TabsContent value="audio">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card className="bg-card/60 backdrop-blur-sm border-border/30">
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Volume2 className="h-4 w-4 text-primary" /> Audio Devices</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {audioDevices.map(d => (
                  <div key={d.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30">
                    <Volume2 className={`h-4 w-4 ${d.connected ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5"><p className="text-xs font-medium text-foreground">{d.name}</p>{d.isDefault && <Badge className="text-[7px] bg-primary/20 text-primary">DEFAULT</Badge>}</div>
                      <p className="text-[9px] text-muted-foreground">{d.type} · {d.profile} · {d.sampleRate / 1000}kHz · {d.latencyMs}ms</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16"><Progress value={d.volume} className="h-1" /></div>
                      <span className="text-[10px] text-muted-foreground w-8">{d.volume}%</span>
                      <Badge variant={d.connected ? 'default' : 'outline'} className="text-[8px]">{d.connected ? 'ON' : 'OFF'}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="bg-card/60 backdrop-blur-sm border-border/30">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Master Controls</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Master Volume</span><span className="text-xs font-bold text-foreground">{audiod.getMasterVolume()}%</span></div>
                <Progress value={audiod.getMasterVolume()} className="h-2" />
                <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Master Mute</span><Badge variant={audiod.getMasterMuted() ? 'destructive' : 'outline'} className="text-[9px]">{audiod.getMasterMuted() ? 'MUTED' : 'UNMUTED'}</Badge></div>
                <div className="border-t border-border/30 pt-3 mt-3">
                  <p className="text-xs font-medium text-foreground mb-2">Microphone Permissions</p>
                  {audiod.getMicPermissions().length === 0 ? <p className="text-[10px] text-muted-foreground">No permissions granted</p> : audiod.getMicPermissions().map(p => (
                    <div key={p.appId} className="flex items-center justify-between text-[10px] py-1"><span className="text-muted-foreground">{p.appId}</span><Badge variant={p.granted ? 'default' : 'destructive'} className="text-[7px]">{p.granted ? 'GRANTED' : 'REVOKED'}</Badge></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ════════ NETWORK ════════ */}
        <TabsContent value="network">
          <Card className="bg-card/60 backdrop-blur-sm border-border/30">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Localization ({locales.length} locales)</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {locales.map(l => (
                  <div key={l.locale} className={`p-2.5 rounded-lg border transition-colors ${l.locale === localizationInfra.getActiveLocale() ? 'border-primary/50 bg-primary/5' : 'border-border/20 hover:bg-muted/30'}`}>
                    <p className="text-xs font-semibold text-foreground">{l.nativeName}</p>
                    <p className="text-[9px] text-muted-foreground">{l.displayName}</p>
                    <div className="flex items-center gap-1 mt-1"><Badge variant="outline" className="text-[7px]">{l.locale}</Badge><Badge variant="outline" className="text-[7px]">{l.direction}</Badge></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════ UPDATES ════════ */}
        <TabsContent value="updates">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {UPDATE_SLOTS.map(slot => (
              <Card key={slot.slot} className={`bg-card/60 backdrop-blur-sm ${slot.status === 'active' ? 'border-emerald-500/30' : 'border-border/30'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2"><span className={`text-xl font-bold ${slot.status === 'active' ? 'text-emerald-500' : 'text-muted-foreground'}`}>{slot.slot}</span><Badge variant={slot.status === 'active' ? 'default' : 'outline'} className="text-[9px]">{slot.status}</Badge></div>
                    {slot.status === 'active' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  </div>
                  <p className="text-xs font-medium text-foreground">{slot.version}</p>
                  <div className="mt-1.5 space-y-0.5 text-[10px] text-muted-foreground">
                    <p>Health: <span className="text-foreground font-medium">{slot.health}</span></p>
                    <p>Boot count: <span className="text-foreground font-medium">{slot.bootCount}</span></p>
                  </div>
                  {slot.status === 'standby' && <Button variant="outline" size="sm" className="mt-2.5 w-full text-[10px]"><Download className="h-3 w-3 mr-1" />Activate</Button>}
                </CardContent>
              </Card>
            ))}
            <Card className="bg-card/60 backdrop-blur-sm border-border/30 col-span-full">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><GitBranch className="h-4 w-4 text-primary" /> Release Channel: {currentRelease.channel}</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-3">
                  {['canary', 'nightly', 'dev', 'beta', 'rc', 'stable', 'hotfix'].map(ch => (
                    <Badge key={ch} variant={ch === currentRelease.channel ? 'default' : 'outline'} className="text-[9px]">{ch}</Badge>
                  ))}
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Version</span><span className="font-mono text-foreground">{currentRelease.version}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Rollout</span><span className="text-foreground">{currentRelease.rolloutPercentage}%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Max Crash Rate</span><span className="text-foreground">{currentRelease.promotionCriteria.maxCrashRate}/1000</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ════════ SLOs ════════ */}
        <TabsContent value="slos">
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[{ label: 'Meeting', value: sloSummary.meeting, color: 'text-emerald-400' }, { label: 'At Risk', value: sloSummary.atRisk, color: 'text-amber-400' }, { label: 'Breaching', value: sloSummary.breaching, color: 'text-red-400' }].map(s => (
                <Card key={s.label} className="bg-card/60 backdrop-blur-sm border-border/30">
                  <CardContent className="p-3 text-center"><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p><p className="text-[10px] text-muted-foreground">{s.label}</p></CardContent>
                </Card>
              ))}
            </div>
            <Card className="bg-card/60 backdrop-blur-sm border-border/30">
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Gauge className="h-4 w-4 text-primary" /> Service Level Objectives</CardTitle></CardHeader>
              <CardContent className="space-y-1.5">
                {allSlos.map(slo => (
                  <div key={slo.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30">
                    <StatusDot status={slo.status} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{slo.name}</p>
                      <p className="text-[9px] text-muted-foreground">{slo.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono font-bold text-foreground">{slo.current}{slo.unit === '%' || slo.unit === '%/hr' ? slo.unit : ` ${slo.unit}`}</p>
                      <p className="text-[9px] text-muted-foreground">target: {slo.target}{slo.unit === '%' || slo.unit === '%/hr' ? slo.unit : ` ${slo.unit}`}</p>
                    </div>
                    <Badge variant={slo.status === 'meeting' ? 'default' : slo.status === 'at_risk' ? 'outline' : 'destructive'} className="text-[8px]">{slo.window}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ════════ RECOVERY ════════ */}
        <TabsContent value="recovery">
          <Card className="bg-card/60 backdrop-blur-sm border-border/30">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Wrench className="h-4 w-4 text-primary" /> Recovery Levels (8 tiers)</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {recoveryActions.map(action => (
                <div key={action.level} className={`p-3 rounded-lg border transition-colors ${action.destructive ? 'border-red-500/20 bg-red-500/5' : 'border-border/20 hover:bg-muted/30'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${action.destructive ? 'text-red-400' : 'text-foreground'}`}>L{action.level}</span>
                      <p className="text-xs font-semibold text-foreground">{action.name}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {action.requiresMFA && <Badge variant="destructive" className="text-[7px]">MFA</Badge>}
                      {action.requiresConfirmation && <Badge variant="outline" className="text-[7px]">CONFIRM</Badge>}
                      <Badge variant="outline" className="text-[7px]">{action.estimatedDuration}</Badge>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{action.description}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[9px] text-muted-foreground">
                    <span>Data loss: <span className={action.dataLoss === 'none' ? 'text-emerald-400' : action.dataLoss === 'complete' ? 'text-red-400' : 'text-amber-400'}>{action.dataLoss}</span></span>
                    <span>Rollback: {action.rollbackable ? <span className="text-emerald-400">yes</span> : <span className="text-red-400">no</span>}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════ SETTINGS ════════ */}
        <TabsContent value="settings">
          <Card className="bg-card/60 backdrop-blur-sm border-border/30">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Settings className="h-4 w-4 text-primary" /> Settings Registry ({allSettings.length})</CardTitle></CardHeader>
            <CardContent className="space-y-0.5 max-h-[500px] overflow-y-auto">
              {allSettings.map(entry => (
                <div key={entry.key} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/30 transition-colors">
                  <Badge variant="outline" className="text-[8px] w-16 justify-center">{entry.namespace}</Badge>
                  <p className="text-[10px] font-mono text-foreground flex-1 truncate">{entry.key}</p>
                  <span className="text-[10px] text-muted-foreground max-w-[120px] truncate">{JSON.stringify(entry.value)}</span>
                  <Badge variant="outline" className="text-[7px]">{entry.source}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════ DIAGNOSTICS ════════ */}
        <TabsContent value="diagnostics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <Card className="bg-card/60 backdrop-blur-sm border-border/30">
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Bug className="h-4 w-4 text-red-500" /> Recent Crashes ({crashes.length})</CardTitle></CardHeader>
              <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                {crashes.map(crash => (
                  <div key={crash.id} className="p-2.5 rounded-lg bg-muted/30 border border-border/20 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5"><span className="font-mono text-xs font-medium text-foreground">{crash.processName}</span><Badge variant={crash.severity === 'critical' ? 'destructive' : 'outline'} className="text-[8px]">{crash.severity}</Badge></div>
                      <span className="text-[9px] text-muted-foreground">{new Date(crash.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Signal: {crash.signal} · Exit: {crash.exitCode} · PID: {crash.pid}</p>
                    <div className="bg-background/50 rounded p-1.5">{crash.stackTrace.map((frame, i) => <p key={i} className="text-[9px] font-mono text-muted-foreground">{frame}</p>)}</div>
                    <div className="flex items-center gap-1.5 text-[9px]">{crash.restartSucceeded ? <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" /> : <XCircle className="h-2.5 w-2.5 text-red-500" />}<span className="text-muted-foreground">{crash.restartSucceeded ? 'Auto-restarted' : 'Restart failed'}</span></div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <div className="space-y-3">
              <Card className="bg-card/60 backdrop-blur-sm border-border/30">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Crash Frequency</CardTitle></CardHeader>
                <CardContent className="space-y-1.5">
                  {crashFreq.map(f => (<div key={f.process} className="flex items-center gap-2"><span className="text-[10px] font-mono text-foreground w-16 truncate">{f.process}</span><Progress value={Math.min(100, f.count * 25)} className="h-1 flex-1" /><span className="text-[10px] text-muted-foreground">{f.count}x</span></div>))}
                </CardContent>
              </Card>
              <Card className="bg-card/60 backdrop-blur-sm border-border/30">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Self-Repair & Export</CardTitle></CardHeader>
                <CardContent className="space-y-1.5">
                  {[{ label: 'Reset Network Stack', icon: Wifi }, { label: 'Flush DNS Cache', icon: Network }, { label: 'Restart All Services', icon: RefreshCw }, { label: 'Clear Safe Mode', icon: Shield }, { label: 'Export Diagnostic Bundle', icon: Download }].map(action => (
                    <Button key={action.label} variant="outline" size="sm" className="w-full justify-start text-[10px] h-7"><action.icon className="h-3 w-3 mr-1.5" />{action.label}</Button>
                  ))}
                </CardContent>
              </Card>
              <Card className="bg-card/60 backdrop-blur-sm border-border/30">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Time Sync</CardTitle></CardHeader>
                <CardContent className="space-y-1 text-[10px]">
                  {[['Source', syncStatus.source], ['Server', syncStatus.server], ['Drift', `${syncStatus.driftMs.toFixed(2)}ms`], ['RTT', `${syncStatus.roundTripMs.toFixed(0)}ms`], ['Stratum', syncStatus.stratum]].map(([k, v]) => (
                    <div key={String(k)} className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-mono text-foreground">{v}</span></div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ════════ CAPABILITIES ════════ */}
        <TabsContent value="capabilities">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <Card className="bg-card/60 backdrop-blur-sm border-border/30 lg:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Key className="h-4 w-4 text-primary" /> Capability Catalog ({allCaps.length})</CardTitle></CardHeader>
              <CardContent className="space-y-0.5 max-h-[500px] overflow-y-auto">
                {allCaps.map(cap => (
                  <div key={cap.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/30">
                    <Badge variant={cap.risk === 'critical' ? 'destructive' : cap.risk === 'high' ? 'outline' : 'secondary'} className="text-[7px] w-14 justify-center">{cap.risk}</Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-mono font-medium text-foreground truncate">{cap.id}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{cap.description}</p>
                    </div>
                    <Badge variant="outline" className="text-[7px]">{cap.prompt}</Badge>
                    <Badge variant="outline" className="text-[7px]">{cap.scope}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <div className="space-y-3">
              <Card className="bg-card/60 backdrop-blur-sm border-border/30">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Risk Distribution</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(capRisk).map(([risk, count]) => (
                    <div key={risk} className="flex items-center gap-2">
                      <span className={`text-[10px] w-14 ${risk === 'critical' ? 'text-red-400' : risk === 'high' ? 'text-amber-400' : risk === 'medium' ? 'text-yellow-400' : 'text-muted-foreground'}`}>{risk}</span>
                      <Progress value={(count / Math.max(1, allCaps.length)) * 100} className="h-1.5 flex-1" />
                      <span className="text-[10px] text-foreground w-6 text-right">{count}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card className="bg-card/60 backdrop-blur-sm border-border/30">
                <CardHeader className="pb-2"><CardTitle className="text-sm">ABI Versions</CardTitle></CardHeader>
                <CardContent className="space-y-1.5">
                  {abiEntries.map(entry => (
                    <div key={entry.artifactId} className="flex items-center justify-between text-[10px]">
                      <span className="font-mono text-foreground truncate">{entry.artifactId}</span>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-[7px]">v{entry.currentVersion}</Badge>
                        {entry.deprecated && <Badge variant="destructive" className="text-[7px]">DEPRECATED</Badge>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card className="bg-card/60 backdrop-blur-sm border-border/30">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Migrations</CardTitle></CardHeader>
                <CardContent className="space-y-1 text-[10px]">
                  {[['Registered', migrationStats.registered], ['Completed', migrationStats.completed], ['Failed', migrationStats.failed], ['Pending', migrationStats.pending]].map(([l, v]) => (
                    <div key={String(l)} className="flex justify-between"><span className="text-muted-foreground">{l}</span><span className="font-mono text-foreground">{v}</span></div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ════════ SIGNING / TRUST CHAIN ════════ */}
        <TabsContent value="signing">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <Card className="bg-card/60 backdrop-blur-sm border-border/30">
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Signing Keys ({signingKeys.length})</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {signingKeys.map(key => (
                  <div key={key.id} className="p-2.5 rounded-lg bg-muted/20 border border-border/20">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-foreground">{key.name}</p>
                      <Badge variant={key.status === 'active' ? 'default' : key.status === 'revoked' ? 'destructive' : 'outline'} className="text-[8px]">{key.status}</Badge>
                    </div>
                    <div className="space-y-0.5 text-[9px] text-muted-foreground">
                      <p>Algorithm: <span className="text-foreground">{key.algorithm}</span></p>
                      <p>Fingerprint: <span className="font-mono text-foreground">{key.fingerprint}</span></p>
                      <p>Scope: {key.scope.join(', ')}</p>
                      {key.rotationSchedule && <p>Rotation: {key.rotationSchedule}</p>}
                      <p>Expires: {new Date(key.expiresAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="bg-card/60 backdrop-blur-sm border-border/30">
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /> Notification System</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {[['Total', notifStats.total], ['Active', notifStats.active]].map(([l, v]) => (
                    <div key={String(l)} className="p-2.5 rounded-lg bg-muted/20 text-center"><p className="text-lg font-bold text-foreground">{v}</p><p className="text-[9px] text-muted-foreground">{l}</p></div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-foreground">By Priority</p>
                  {Object.entries(notifStats.byPriority).map(([priority, count]) => (
                    <div key={priority} className="flex items-center gap-2 text-[10px]">
                      <span className={`w-20 ${priority === 'critical' ? 'text-red-400' : priority === 'urgent' ? 'text-amber-400' : 'text-muted-foreground'}`}>{priority}</span>
                      <Progress value={Math.min(100, (count as number) * 20)} className="h-1 flex-1" />
                      <span className="text-foreground">{count as number}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
