import { useConnectivity } from "@/contexts/ConnectivityContext";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { WifiOff, Wifi, Signal, SignalLow, SignalMedium } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * OfflineBanner — Surfaces connectivity state from useConnectivity
 * and connection quality from useOnlineStatus.
 * 
 * Mounted inside the main app layout. The ConnectivityContext already
 * renders its own offline/reconnected banners at the top of the viewport.
 * This component adds quality indicators for degraded connections.
 */
export function OfflineBanner() {
  const { isOnline } = useConnectivity();
  const { connectionQuality } = useOnlineStatus();

  // ConnectivityContext already handles offline/reconnected banners.
  // This component surfaces "poor" connection quality when online.
  if (!isOnline || connectionQuality === "excellent" || connectionQuality === "good" || connectionQuality === "offline") {
    return null;
  }

  return (
    <AnimatePresence>
      {connectionQuality === "poor" && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[9998] flex items-center justify-center gap-2 bg-amber-500/90 backdrop-blur-sm text-amber-950 py-2 text-xs font-medium"
        >
          <SignalLow className="h-3.5 w-3.5" />
          Slow connection — some features may be delayed
        </motion.div>
      )}
    </AnimatePresence>
  );
}
