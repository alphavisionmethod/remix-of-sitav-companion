import { MobileShell } from "@/platform/experience/components/mobile/MobileShell";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw, Pause, Play, AlertTriangle, CheckCircle2, Clock,
  Smartphone, ArrowUpDown, Wrench, XCircle, Zap, Database,
  ChevronRight, RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SyncItem {
  id: string;
  name: string;
  device: string;
  status: "syncing" | "queued" | "complete" | "conflict" | "error";
  progress?: number;
  size: string;
  lastSync?: string;
}

interface SyncDevice {
  id: string;
  name: string;
  online: boolean;
  lastSync: string;
  pendingItems: number;
  latency: string;
  status: "current" | "syncing" | "behind" | "offline";
}

interface ConflictItem {
  id: string;
  file: string;
  device1: string;
  device2: string;
  modified1: string;
  modified2: string;
  type: string;
}

const syncQueue: SyncItem[] = [
  { id: "s1", name: "Project Files / Q4 Budget", device: "MacBook Pro", status: "syncing", progress: 67, size: "12.4 MB" },
  { id: "s2", name: "Settings / Theme Config", device: "All Devices", status: "syncing", progress: 89, size: "2.1 KB" },
  { id: "s3", name: "Documents / Contract Draft v3", device: "iPad Air", status: "queued", size: "4.8 MB" },
  { id: "s4", name: "Media / Presentation Assets", device: "MacBook Pro", status: "queued", size: "128 MB" },
  { id: "s5", name: "Workspace State", device: "All Devices", status: "complete", size: "840 B", lastSync: "2 min ago" },
  { id: "s6", name: "App Preferences", device: "iPhone 15", status: "error", size: "1.2 KB" },
];

const syncDevices: SyncDevice[] = [
  { id: "sd1", name: "MacBook Pro", online: true, lastSync: "30s ago", pendingItems: 2, latency: "45ms", status: "syncing" },
  { id: "sd2", name: "iPad Air", online: true, lastSync: "5 min ago", pendingItems: 1, latency: "120ms", status: "behind" },
  { id: "sd3", name: "iPhone 15", online: true, lastSync: "1 min ago", pendingItems: 0, latency: "38ms", status: "current" },
  { id: "sd4", name: "Home Server", online: false, lastSync: "2 hr ago", pendingItems: 47, latency: "—", status: "offline" },
];

const conflicts: ConflictItem[] = [
  { id: "cf1", file: "Budget_2025.xlsx", device1: "MacBook Pro", device2: "iPad Air", modified1: "10:14 AM", modified2: "10:12 AM", type: "Edit conflict" },
  { id: "cf2", file: "team-photo.jpg", device1: "iPhone 15", device2: "MacBook Pro", modified1: "Yesterday", modified2: "Yesterday", type: "Version mismatch" },
];

const statusIcons: Record<string, { icon: any; color: string }> = {
  syncing: { icon: RefreshCw, color: "text-blue-400" },
  queued: { icon: Clock, color: "text-muted-foreground" },
  complete: { icon: CheckCircle2, color: "text-emerald-400" },
  conflict: { icon: AlertTriangle, color: "text-amber-400" },
  error: { icon: XCircle, color: "text-red-400" },
  current: { icon: CheckCircle2, color: "text-emerald-400" },
  behind: { icon: Clock, color: "text-amber-400" },
  offline: { icon: XCircle, color: "text-muted-foreground" },
};

const MobileSyncControl = () => {
  const [tab, setTab] = useState<"queue" | "devices" | "conflicts">("queue");
  const [isPaused, setIsPaused] = useState(false);

  return (
    <MobileShell title="Sync Control">
      {/* Status Bar */}
      <div className="rounded-xl border border-border/40 bg-card p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <RefreshCw className={cn("h-4 w-4", isPaused ? "text-muted-foreground" : "text-blue-400 animate-spin")} style={{ animationDuration: "3s" }} />
            <div>
              <p className="text-xs font-semibold">{isPaused ? "Sync Paused" : "Syncing..."}</p>
              <p className="text-[10px] text-muted-foreground">4 items in queue · 2 active</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={cn("px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors",
                isPaused ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
              )}
            >
              {isPaused ? <><Play className="h-3 w-3 inline mr-1" />Resume</> : <><Pause className="h-3 w-3 inline mr-1" />Pause</>}
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-primary/15 text-primary text-[10px] font-medium">
              <Zap className="h-3 w-3 inline mr-1" />Force
            </button>
          </div>
        </div>
        {/* Latency bar */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-muted-foreground">Avg latency</span>
          <div className="flex-1 h-1.5 rounded-full bg-muted/30">
            <div className="h-full w-[35%] rounded-full bg-emerald-400" />
          </div>
          <span className="text-[9px] text-emerald-400 font-medium">68ms</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {([
          { key: "queue" as const, label: "Queue", count: syncQueue.length },
          { key: "devices" as const, label: "Devices", count: syncDevices.length },
          { key: "conflicts" as const, label: "Conflicts", count: conflicts.length },
        ]).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={cn(
            "px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors",
            tab === t.key ? "bg-primary/20 text-primary" : "text-muted-foreground"
          )}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Queue */}
      {tab === "queue" && (
        <div className="space-y-2">
          {syncQueue.map((item, i) => {
            const si = statusIcons[item.status];
            const Icon = si.icon;
            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-border/40 bg-card p-3">
                <div className="flex items-start gap-2.5">
                  <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", si.color, item.status === "syncing" && "animate-spin")}
                    style={item.status === "syncing" ? { animationDuration: "2s" } : undefined} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-muted-foreground">{item.device}</span>
                      <span className="text-[9px] text-muted-foreground">· {item.size}</span>
                      {item.lastSync && <span className="text-[9px] text-muted-foreground">· {item.lastSync}</span>}
                    </div>
                    {item.progress !== undefined && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1 rounded-full bg-muted/30">
                          <div className="h-full rounded-full bg-blue-400 transition-all" style={{ width: `${item.progress}%` }} />
                        </div>
                        <span className="text-[9px] text-blue-400 font-medium">{item.progress}%</span>
                      </div>
                    )}
                  </div>
                  {item.status === "error" && (
                    <button className="px-2 py-1 rounded-lg text-[9px] font-medium bg-red-500/10 text-red-400">Retry</button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Devices */}
      {tab === "devices" && (
        <div className="space-y-2">
          {syncDevices.map((d, i) => {
            const si = statusIcons[d.status];
            const Icon = si.icon;
            return (
              <motion.div key={d.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-border/40 bg-card p-3">
                <div className="flex items-center gap-3">
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", d.online ? "bg-emerald-500/15" : "bg-muted")}>
                    <Smartphone className={cn("h-4 w-4", d.online ? "text-emerald-400" : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold">{d.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Icon className={cn("h-3 w-3", si.color)} />
                      <span className="text-[10px] text-muted-foreground capitalize">{d.status}</span>
                      <span className="text-[10px] text-muted-foreground">· {d.latency}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">{d.lastSync}</p>
                    {d.pendingItems > 0 && (
                      <span className="text-[9px] font-medium text-amber-400">{d.pendingItems} pending</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Conflicts */}
      {tab === "conflicts" && (
        <div className="space-y-2">
          {conflicts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-medium">No conflicts</p>
            </div>
          ) : conflicts.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium">{c.file}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{c.type}</p>
                  <div className="flex gap-3 mt-2 text-[9px]">
                    <span className="text-muted-foreground">{c.device1}: {c.modified1}</span>
                    <span className="text-muted-foreground">{c.device2}: {c.modified2}</span>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    <button className="px-2 py-1 rounded-lg text-[9px] font-medium bg-card border border-border/40">Keep {c.device1}</button>
                    <button className="px-2 py-1 rounded-lg text-[9px] font-medium bg-card border border-border/40">Keep {c.device2}</button>
                    <button className="px-2 py-1 rounded-lg text-[9px] font-medium bg-primary/15 text-primary">Merge</button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </MobileShell>
  );
};

export default MobileSyncControl;
