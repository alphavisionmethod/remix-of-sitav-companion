import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  RefreshCw, CheckCircle, WifiOff, PauseCircle, Wifi, BatteryLow,
  AlertTriangle, AlertCircle, Shield, Download, Upload, Clock,
  XCircle, Loader, ChevronDown, ChevronUp, Smartphone, HardDrive
} from "lucide-react";
import { syncStateMachine, type SyncUXState, type SyncStateInfo } from "@/platform/sync-engine/sync-state-machine";
import { syncd } from "@/platform/sync-engine/syncd";
import { uploadScheduler } from "@/platform/sync-engine/transport/upload-scheduler";
import { deviceIdentity } from "@/platform/sync-engine/security/device-identity";
import { cn } from "@/lib/utils";

const stateIcons: Record<SyncUXState, React.ElementType> = {
  syncing: RefreshCw, "up-to-date": CheckCircle, offline: WifiOff,
  paused: PauseCircle, "waiting-for-wifi": Wifi, "waiting-for-charge": BatteryLow,
  conflict: AlertTriangle, "attention-needed": AlertCircle,
  "secure-sync-active": Shield, downloading: Download, uploading: Upload,
  pending: Clock, error: XCircle, initializing: Loader,
};

export function SyncStatusIndicator() {
  const [expanded, setExpanded] = useState(false);
  const [stateInfo, setStateInfo] = useState<SyncStateInfo>(syncStateMachine.getStateInfo());

  useEffect(() => {
    const unsub = syncStateMachine.onStateChange((_, info) => setStateInfo(info));
    return unsub;
  }, []);

  const Icon = stateIcons[stateInfo.state] || RefreshCw;
  const status = syncd.getStatus();
  const xferStats = uploadScheduler.getStats();
  const deviceCount = deviceIdentity.getUserDevices("demo-user").length;
  const isAnimating = ["syncing", "downloading", "uploading", "initializing"].includes(stateInfo.state);

  return (
    <div className="relative">
      {/* Compact indicator */}
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 gap-1.5 text-xs font-medium px-2.5 rounded-lg transition-all",
          stateInfo.state === "error" || stateInfo.state === "conflict"
            ? "text-destructive hover:text-destructive"
            : stateInfo.state === "up-to-date" || stateInfo.state === "secure-sync-active"
              ? "text-emerald-400 hover:text-emerald-300"
              : "text-muted-foreground"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <motion.div animate={isAnimating ? { rotate: 360 } : {}} transition={isAnimating ? { repeat: Infinity, duration: 2, ease: "linear" } : {}}>
          <Icon className="h-3.5 w-3.5" />
        </motion.div>
        <span className="hidden md:inline">{stateInfo.label}</span>
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </Button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 z-50 w-72 rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-xl p-4 space-y-3"
          >
            {/* Header */}
            <div className="flex items-center gap-2">
              <div className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center",
                stateInfo.state === "up-to-date" ? "bg-emerald-500/20" :
                stateInfo.state === "error" || stateInfo.state === "conflict" ? "bg-destructive/20" : "bg-primary/20"
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{stateInfo.label}</p>
                <p className="text-xs text-muted-foreground">{stateInfo.description}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-lg bg-muted/30 text-center">
                <Smartphone className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-1" />
                <p className="text-xs font-medium">{deviceCount}</p>
                <p className="text-[10px] text-muted-foreground">Devices</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/30 text-center">
                <Upload className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-1" />
                <p className="text-xs font-medium">{status.pendingPush}</p>
                <p className="text-[10px] text-muted-foreground">Pending</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/30 text-center">
                <AlertTriangle className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-1" />
                <p className="text-xs font-medium">{status.conflictCount}</p>
                <p className="text-[10px] text-muted-foreground">Conflicts</p>
              </div>
            </div>

            {/* Transfer activity */}
            {(xferStats.activeUploads > 0 || xferStats.activeDownloads > 0) && (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Active Transfers</p>
                <div className="flex gap-3 text-xs">
                  <span className="flex items-center gap-1"><Upload className="h-3 w-3" /> {xferStats.activeUploads} uploading</span>
                  <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {xferStats.activeDownloads} downloading</span>
                </div>
              </div>
            )}

            {/* Action */}
            {stateInfo.actionable && (
              <Button size="sm" className="w-full text-xs" variant="default">
                {stateInfo.actionLabel ?? "Take Action"}
              </Button>
            )}

            {/* Last sync */}
            {status.lastSyncAt && (
              <p className="text-[10px] text-muted-foreground text-center">
                Last synced: {new Date(status.lastSyncAt).toLocaleTimeString()}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
