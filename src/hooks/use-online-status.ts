// ═══════════════════════════════════════════════════════════════
// SITA OS — Online/Offline Status Hook
// Tracks network connectivity and provides reconnection events
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";

export type ConnectionQuality = "excellent" | "good" | "poor" | "offline";

export interface UseOnlineStatusReturn {
  isOnline: boolean;
  connectionQuality: ConnectionQuality;
  lastOnlineAt: Date | null;
  reconnectedAt: Date | null;
  wasOffline: boolean;
}

export function useOnlineStatus(): UseOnlineStatusReturn {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>(
    navigator.onLine ? "good" : "offline"
  );
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(
    navigator.onLine ? new Date() : null
  );
  const [reconnectedAt, setReconnectedAt] = useState<Date | null>(null);
  const [wasOffline, setWasOffline] = useState(false);
  const wasOfflineRef = useRef(false);

  const checkConnectionQuality = useCallback(() => {
    const conn = (navigator as Record<string, unknown>).connection;
    if (!navigator.onLine) {
      setConnectionQuality("offline");
      return;
    }
    if (conn) {
      const effectiveType = conn.effectiveType;
      if (effectiveType === "4g") setConnectionQuality("excellent");
      else if (effectiveType === "3g") setConnectionQuality("good");
      else setConnectionQuality("poor");
    } else {
      setConnectionQuality("good");
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastOnlineAt(new Date());
      if (wasOfflineRef.current) {
        setReconnectedAt(new Date());
        setWasOffline(true);
        // Auto-clear reconnection banner after 5s
        setTimeout(() => setWasOffline(false), 5000);
      }
      wasOfflineRef.current = false;
      checkConnectionQuality();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionQuality("offline");
      wasOfflineRef.current = true;
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    checkConnectionQuality();

    // Listen for connection quality changes
    const conn = (navigator as Record<string, unknown>).connection;
    if (conn) {
      conn.addEventListener("change", checkConnectionQuality);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (conn) conn.removeEventListener("change", checkConnectionQuality);
    };
  }, [checkConnectionQuality]);

  return { isOnline, connectionQuality, lastOnlineAt, reconnectedAt, wasOffline };
}
