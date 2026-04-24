import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";

interface ConnectivityState {
  isOnline: boolean;
  wasOffline: boolean;
}

const ConnectivityContext = createContext<ConnectivityState>({ isOnline: true, wasOffline: false });
export const useConnectivity = () => useContext(ConnectivityContext);

export const ConnectivityProvider = ({ children }: { children: ReactNode }) => {
  // navigator.onLine can be undefined in jsdom/test envs — default to online
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" && typeof navigator.onLine === "boolean"
      ? navigator.onLine
      : true
  );
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const goOffline = () => { setIsOnline(false); setWasOffline(true); };
    const goOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setShowReconnected(true);
        setTimeout(() => setShowReconnected(false), 3000);
      }
    };
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => { window.removeEventListener("online", goOnline); window.removeEventListener("offline", goOffline); };
  }, [wasOffline]);

  return (
    <ConnectivityContext.Provider value={{ isOnline, wasOffline }}>
      {children}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 bg-destructive/90 backdrop-blur-sm text-destructive-foreground py-2 text-xs font-medium"
          >
            <WifiOff className="h-3.5 w-3.5" /> You're offline — changes will sync when reconnected
          </motion.div>
        )}
        {showReconnected && isOnline && (
          <motion.div
            initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 bg-primary/90 backdrop-blur-sm text-primary-foreground py-2 text-xs font-medium"
          >
            <Wifi className="h-3.5 w-3.5" /> Back online — syncing...
          </motion.div>
        )}
      </AnimatePresence>
    </ConnectivityContext.Provider>
  );
};
