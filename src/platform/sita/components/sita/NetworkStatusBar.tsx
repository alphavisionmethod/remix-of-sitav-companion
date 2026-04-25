// ═══════════════════════════════════════════════════════════════
// SITA OS — Network Status Bar
// Shows offline/reconnection banners with trust-aware messaging
// ═══════════════════════════════════════════════════════════════

import { useOnlineStatus, type ConnectionQuality } from "@/hooks/use-online-status";
import { WifiOff, Wifi, SignalLow, CheckCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const QUALITY_CONFIG: Record<ConnectionQuality, { icon: typeof Wifi; label: string; color: string }> = {
  excellent: { icon: Wifi, label: "Connected", color: "bg-trust-safe/10 text-trust-safe border-trust-safe/20" },
  good: { icon: Wifi, label: "Connected", color: "bg-trust-safe/10 text-trust-safe border-trust-safe/20" },
  poor: { icon: SignalLow, label: "Weak connection — data may be delayed", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  offline: { icon: WifiOff, label: "You're offline — changes will sync when reconnected", color: "bg-destructive/10 text-destructive border-destructive/20" },
};

export function NetworkStatusBar() {
  const { isOnline, connectionQuality, wasOffline } = useOnlineStatus();

  const showBar = !isOnline || connectionQuality === "poor" || wasOffline;

  return (
    <AnimatePresence>
      {showBar && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          {wasOffline && isOnline ? (
            <div className="flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium bg-trust-safe/10 text-trust-safe border-b border-trust-safe/20">
              <CheckCircle className="h-3.5 w-3.5" />
              Back online — syncing your data
            </div>
          ) : (
            <div
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium border-b",
                QUALITY_CONFIG[connectionQuality].color
              )}
            >
              {(() => {
                const Icon = QUALITY_CONFIG[connectionQuality].icon;
                return <Icon className="h-3.5 w-3.5" />;
              })()}
              {QUALITY_CONFIG[connectionQuality].label}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
