import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Monitor, Smartphone, Cloud, Search, Filter, ChevronDown, ChevronUp,
  Eye, FileText, RefreshCw, ShieldCheck, Cpu, HardDrive, Wifi, Lock,
  Activity, Layers, Zap, RotateCcw
} from "lucide-react";
import { WhyTooltip } from "./WhyTooltip";

export type OwnershipLayer = "os" | "cloud" | "app" | "os_cloud" | "app_cloud" | "os_app";

interface OwnershipCell {
  primary: OwnershipLayer;
  detail: string;
}

interface FeatureOwnershipEntry {
  id: string;
  feature: string;
  icon: React.ElementType;
  execution: OwnershipCell;
  truth: OwnershipCell;
  control: OwnershipCell;
  approval: OwnershipCell;
  visibility: OwnershipCell;
  recovery: OwnershipCell;
}

const LAYER_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  os: { label: "OS", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", icon: Monitor },
  cloud: { label: "Cloud", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30", icon: Cloud },
  app: { label: "App", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30", icon: Smartphone },
  os_cloud: { label: "OS + Cloud", color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/30", icon: Layers },
  app_cloud: { label: "App + Cloud", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/30", icon: ShieldCheck },
  os_app: { label: "OS + App", color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/30", icon: Activity },
};

const FEATURES: FeatureOwnershipEntry[] = [
  {
    id: "fo-1", feature: "File Open / Edit", icon: FileText,
    execution: { primary: "os", detail: "OS opens and renders files locally using native or web-based editors" },
    truth: { primary: "os_cloud", detail: "OS owns local in-progress state; Cloud owns synced/versioned canonical state" },
    control: { primary: "os", detail: "OS controls the file editing environment and local save behavior" },
    approval: { primary: "os", detail: "No approval normally required — direct user action on local surface" },
    visibility: { primary: "os_app", detail: "OS shows active editing; App can show recent activity feed if enabled" },
    recovery: { primary: "os_cloud", detail: "OS recovers unsaved local state; Cloud provides version history restore" },
  },
  {
    id: "fo-2", feature: "File Sync", icon: RefreshCw,
    execution: { primary: "os", detail: "OS sync client executes upload/download operations locally" },
    truth: { primary: "cloud", detail: "Cloud is the canonical source of truth for all synced file state" },
    control: { primary: "app_cloud", detail: "App supervises sync; Cloud coordinates conflict resolution" },
    approval: { primary: "app", detail: "App approves risky conflict resolutions or sensitive namespace ops" },
    visibility: { primary: "os_app", detail: "Both surfaces show sync progress — OS inline, App in overview" },
    recovery: { primary: "os_cloud", detail: "Cloud coordinates restore; OS performs local file reapplication" },
  },
  {
    id: "fo-3", feature: "App Execution", icon: Cpu,
    execution: { primary: "os", detail: "OS manages process lifecycle, memory, rendering for running apps" },
    truth: { primary: "os_cloud", detail: "OS owns runtime state; Cloud stores optional cross-device app metadata" },
    control: { primary: "os_app", detail: "OS controls locally; App can remotely supervise or kill processes" },
    approval: { primary: "app", detail: "App approves risky remote actions like force-terminate if needed" },
    visibility: { primary: "os_app", detail: "OS shows process/window state; App shows fleet app status" },
    recovery: { primary: "os", detail: "OS handles crash recovery, restart, and local state restoration" },
  },
  {
    id: "fo-4", feature: "App Install", icon: HardDrive,
    execution: { primary: "os", detail: "OS performs local installation, unpacking, and configuration" },
    truth: { primary: "cloud", detail: "Cloud stores installation eligibility, trust metadata, and policy" },
    control: { primary: "os_app", detail: "App can initiate or supervise; OS executes the installation" },
    approval: { primary: "app", detail: "App approves low-trust or sensitive installs before OS proceeds" },
    visibility: { primary: "os_app", detail: "OS shows install progress; App shows fleet install status" },
    recovery: { primary: "os_cloud", detail: "OS uninstalls/rolls back locally; Cloud logs and coordinates trust" },
  },
  {
    id: "fo-5", feature: "Device Trust", icon: ShieldCheck,
    execution: { primary: "os_cloud", detail: "Cloud decides trust state; OS enforces local trust restrictions" },
    truth: { primary: "cloud", detail: "Cloud is the sole source of truth for device trust levels" },
    control: { primary: "app", detail: "App is the primary control surface for managing device trust" },
    approval: { primary: "app", detail: "App holds exclusive approval authority for trust changes" },
    visibility: { primary: "app", detail: "App shows trust dashboard first; OS shows trust-aware behavior" },
    recovery: { primary: "app_cloud", detail: "App + Cloud coordinate recovery — re-enrollment, trust rebuild" },
  },
  {
    id: "fo-6", feature: "Remote Lock", icon: Lock,
    execution: { primary: "os", detail: "OS enforces lock state on the target device when instructed" },
    truth: { primary: "cloud", detail: "Cloud stores the requested/confirmed lock state as canonical" },
    control: { primary: "app", detail: "App is the exclusive control surface for remote lock actions" },
    approval: { primary: "app", detail: "App session/auth itself serves as the approval mechanism" },
    visibility: { primary: "app", detail: "App shows lock status and confirmation receipts" },
    recovery: { primary: "app_cloud", detail: "App/Cloud coordinate unlock or trust revoke flow" },
  },
  {
    id: "fo-7", feature: "System Update", icon: Zap,
    execution: { primary: "os", detail: "OS downloads, stages, and applies updates to local system" },
    truth: { primary: "cloud", detail: "Cloud stores rollout channel, version truth, and eligibility" },
    control: { primary: "app_cloud", detail: "App and Cloud jointly control update timing and rollout" },
    approval: { primary: "app", detail: "App approves user-sensitive or major update flows if configured" },
    visibility: { primary: "os_app", detail: "OS shows update/install progress; App shows fleet rollout overview" },
    recovery: { primary: "os_cloud", detail: "OS rolls back locally; Cloud controls rollout pause/block" },
  },
  {
    id: "fo-8", feature: "Security Alert", icon: ShieldCheck,
    execution: { primary: "os_cloud", detail: "OS may detect locally; Cloud may detect from global telemetry" },
    truth: { primary: "cloud", detail: "Cloud is the source of truth for security events and severity" },
    control: { primary: "app", detail: "App is the primary control surface for security response" },
    approval: { primary: "app", detail: "App approves follow-up actions if remediation is needed" },
    visibility: { primary: "app", detail: "App shows alerts first; OS shows contextual trust messages" },
    recovery: { primary: "os_cloud", detail: "Cloud plans remediation; OS executes; App confirms/approves" },
  },
  {
    id: "fo-9", feature: "Workspace Continuity", icon: Layers,
    execution: { primary: "os", detail: "OS restores workspace layout, windows, and state locally" },
    truth: { primary: "cloud", detail: "Cloud stores continuity state as the canonical handoff record" },
    control: { primary: "os_app", detail: "OS controls immersive UX; App oversees trusted device confirmation" },
    approval: { primary: "app", detail: "App approves when continuity crosses trust boundary or sensitive class" },
    visibility: { primary: "os_app", detail: "OS shows workspace restore; App shows ecosystem continuity health" },
    recovery: { primary: "os_cloud", detail: "Cloud + OS coordinate — Cloud provides state, OS renders it" },
  },
  {
    id: "fo-10", feature: "Command Execution", icon: Activity,
    execution: { primary: "os", detail: "OS performs device-local command effects (mutations, IO, processes)" },
    truth: { primary: "cloud", detail: "Cloud stores command history, outcomes, and audit trail" },
    control: { primary: "app", detail: "App or admin surfaces issue and control commands" },
    approval: { primary: "app", detail: "App approves risky or destructive commands before execution" },
    visibility: { primary: "app", detail: "App shows command history, receipts, and status" },
    recovery: { primary: "os_cloud", detail: "Cloud plans rollback path; OS executes local rollback if needed" },
  },
];

const OWNERSHIP_COLS = ["execution", "truth", "control", "approval", "visibility", "recovery"] as const;
const COL_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  execution: { label: "Execution", icon: Cpu },
  truth: { label: "Truth", icon: Cloud },
  control: { label: "Control", icon: Smartphone },
  approval: { label: "Approval", icon: Lock },
  visibility: { label: "Visibility", icon: Eye },
  recovery: { label: "Recovery", icon: RotateCcw },
};

function LayerBadge({ layer }: { layer: OwnershipLayer }) {
  const cfg = LAYER_CONFIG[layer];
  return (
    <Badge variant="outline" className={cn("text-[8px] px-1.5 py-0 gap-1", cfg.color, cfg.border, cfg.bg)}>
      <cfg.icon className="h-2.5 w-2.5" />
      {cfg.label}
    </Badge>
  );
}

export function FeatureOwnershipMatrix() {
  const [search, setSearch] = useState("");
  const [layerFilter, setLayerFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return FEATURES.filter(f => {
      if (search && !f.feature.toLowerCase().includes(search.toLowerCase())) return false;
      if (layerFilter !== "all") {
        const hasLayer = OWNERSHIP_COLS.some(col => f[col].primary.includes(layerFilter));
        if (!hasLayer) return false;
      }
      return true;
    });
  }, [search, layerFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Feature Ownership Matrix
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Canonical mapping of every feature to its execution, truth, control, approval, visibility, and recovery owners
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { layer: "os", label: "OS-Owned", count: FEATURES.reduce((s, f) => s + OWNERSHIP_COLS.filter(c => f[c].primary === "os").length, 0) },
          { layer: "cloud", label: "Cloud-Owned", count: FEATURES.reduce((s, f) => s + OWNERSHIP_COLS.filter(c => f[c].primary === "cloud").length, 0) },
          { layer: "app", label: "App-Owned", count: FEATURES.reduce((s, f) => s + OWNERSHIP_COLS.filter(c => f[c].primary === "app").length, 0) },
        ].map(s => (
          <Card key={s.layer} className={cn("border bg-white/[0.02]", LAYER_CONFIG[s.layer].border)}>
            <CardContent className="p-3 flex items-center gap-3">
              {(() => { const Icon = LAYER_CONFIG[s.layer].icon; return <Icon className={cn("h-6 w-6", LAYER_CONFIG[s.layer].color)} />; })()}
              <div>
                <p className={cn("text-xl font-bold", LAYER_CONFIG[s.layer].color)}>{s.count}</p>
                <p className="text-[10px] text-muted-foreground">{s.label} cells</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-white/[0.06] bg-white/[0.03]">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search features..." className="pl-8 h-8 text-xs bg-white/[0.02] border-white/[0.06]" />
            </div>
            <div className="flex items-center gap-1">
              <Filter className="h-3 w-3 text-muted-foreground" />
              {["all", "os", "cloud", "app"].map(f => (
                <button key={f} onClick={() => setLayerFilter(f)} className={cn("px-2 py-1 rounded text-[10px] font-medium transition-colors", layerFilter === f ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}>
                  {f === "all" ? "All Layers" : LAYER_CONFIG[f]?.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matrix Table */}
      <Card className="border-white/[0.06] bg-white/[0.03]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="px-4 py-2.5 text-left min-w-[160px]">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Feature</span>
                  </th>
                  {OWNERSHIP_COLS.map(col => {
                    const cfg = COL_LABELS[col];
                    return (
                      <th key={col} className="px-3 py-2.5 text-center min-w-[100px]">
                        <div className="flex items-center justify-center gap-1">
                          <cfg.icon className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">{cfg.label}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry, i) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                    className={cn("border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer transition-colors", i % 2 === 0 && "bg-white/[0.01]")}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <entry.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="font-medium text-foreground">{entry.feature}</span>
                        <button className="ml-auto">
                          {expandedId === entry.id ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
                        </button>
                      </div>
                    </td>
                    {OWNERSHIP_COLS.map(col => (
                      <td key={col} className="px-3 py-2.5 text-center">
                        <div className="flex justify-center">
                          <LayerBadge layer={entry[col].primary} />
                        </div>
                      </td>
                    ))}
                  </motion.tr>
                ))}
                {/* Expanded detail rows rendered separately */}
                {filtered.map(entry => expandedId === entry.id && (
                  <tr key={`${entry.id}-detail`}>
                    <td colSpan={7} className="px-4 py-3 bg-white/[0.02]">
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {OWNERSHIP_COLS.map(col => {
                          const cfg = COL_LABELS[col];
                          const cell = entry[col];
                          const layerCfg = LAYER_CONFIG[cell.primary];
                          return (
                            <div key={col} className={cn("p-2.5 rounded-lg border", layerCfg.border, layerCfg.bg)}>
                              <div className="flex items-center gap-1.5 mb-1">
                                <cfg.icon className={cn("h-3 w-3", layerCfg.color)} />
                                <span className={cn("text-[10px] font-semibold uppercase tracking-wider", layerCfg.color)}>{cfg.label}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground leading-relaxed">{cell.detail}</p>
                            </div>
                          );
                        })}
                      </motion.div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap text-[9px] text-muted-foreground">
        {Object.entries(LAYER_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1">
            <cfg.icon className={cn("h-3 w-3", cfg.color)} />
            <span className={cfg.color}>{cfg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
