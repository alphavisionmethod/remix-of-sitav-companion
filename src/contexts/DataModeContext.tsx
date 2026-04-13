import React, { createContext, useContext, useCallback, useMemo } from "react";
import { useRealityModeSafe } from "@/lib/dual-reality/reality-mode-context";
import { toast } from "sonner";

type DataMode = "demo" | "live";

interface ConnectorStatus {
  id: string;
  name: string;
  status: "connected" | "disconnected" | "degraded" | "error";
  lastSync?: string;
  type: "slack" | "resend" | "twilio" | "stripe" | "google-calendar" | "quickbooks" | "custom";
}

interface DataModeContextType {
  mode: DataMode;
  isDemoMode: boolean;
  isLiveMode: boolean;
  toggleMode: () => void;
  setMode: (mode: DataMode) => void;
  connectors: ConnectorStatus[];
  refreshConnectors: () => void;
}

const DataModeContext = createContext<DataModeContextType | undefined>(undefined);

/**
 * Shim provider that bridges old DataMode API to RealityModeProvider.
 * Children still call useDataMode() and get the same interface.
 */
export function DataModeProvider({ children }: { children: React.ReactNode }) {
  const reality = useRealityModeSafe();

  const mode: DataMode = reality.isDemo ? "demo" : "live";

  const setMode = useCallback((newMode: DataMode) => {
    if (newMode === "demo") {
      reality.enterDemoMode("default");
    } else {
      reality.exitDemoMode();
    }
    toast.success(
      newMode === "demo"
        ? "Switched to Demo Mode — using sample data"
        : "Switched to Live Mode — using real connections",
      { duration: 3000 }
    );
  }, [reality]);

  const toggleMode = useCallback(() => {
    setMode(mode === "demo" ? "live" : "demo");
  }, [mode, setMode]);

  const refreshConnectors = useCallback(() => {
    toast.info("Connector status refreshed");
  }, []);

  const value = useMemo<DataModeContextType>(() => ({
    mode,
    isDemoMode: mode === "demo",
    isLiveMode: mode === "live",
    toggleMode,
    setMode,
    connectors: [],
    refreshConnectors,
  }), [mode, toggleMode, setMode, refreshConnectors]);

  return (
    <DataModeContext.Provider value={value}>
      {children}
    </DataModeContext.Provider>
  );
}

export function useDataMode() {
  const ctx = useContext(DataModeContext);
  if (!ctx) {
    // Fallback if outside provider — defaults to demo
    return {
      mode: "demo" as DataMode,
      isDemoMode: true,
      isLiveMode: false,
      toggleMode: () => {},
      setMode: () => {},
      connectors: [] as ConnectorStatus[],
      refreshConnectors: () => {},
    };
  }
  return ctx;
}
