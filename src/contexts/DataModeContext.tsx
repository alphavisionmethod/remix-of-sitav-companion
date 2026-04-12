import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

const STORAGE_KEY = "sita-data-mode";

// Demo connector statuses (shown in demo mode)
const demoConnectors: ConnectorStatus[] = [
  { id: "slack-1", name: "Slack", type: "slack", status: "connected", lastSync: "2 min ago" },
  { id: "resend-1", name: "Resend (Email)", type: "resend", status: "connected", lastSync: "Just now" },
  { id: "twilio-1", name: "Twilio (SMS)", type: "twilio", status: "connected", lastSync: "5 min ago" },
  { id: "stripe-1", name: "Stripe", type: "stripe", status: "connected", lastSync: "1 min ago" },
  { id: "gcal-1", name: "Google Calendar", type: "google-calendar", status: "connected", lastSync: "3 min ago" },
  { id: "qb-1", name: "QuickBooks", type: "quickbooks", status: "degraded", lastSync: "2h ago" },
];

export function DataModeProvider({ children }: { children: React.ReactNode }) {
  // VITE_DEMO_MODE=true forces demo mode for presentations/demos in production
  const envDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

  const [mode, setModeState] = useState<DataMode>(() => {
    if (envDemoMode) return "demo";
    try {
      return (localStorage.getItem(STORAGE_KEY) as DataMode) || "demo";
    } catch {
      return "demo";
    }
  });

  const [connectors, setConnectors] = useState<ConnectorStatus[]>(demoConnectors);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const setMode = useCallback((newMode: DataMode) => {
    setModeState(newMode);
    toast.success(
      newMode === "demo"
        ? "Switched to Demo Mode — using sample data"
        : "Switched to Live Mode — using real connections",
      { duration: 3000 }
    );
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const next = prev === "demo" ? "live" : "demo";
      toast.success(
        next === "demo"
          ? "Switched to Demo Mode — using sample data"
          : "Switched to Live Mode — using real connections",
        { duration: 3000 }
      );
      return next;
    });
  }, []);

  const refreshConnectors = useCallback(async () => {
    if (mode === "demo") {
      setConnectors(demoConnectors);
    } else {
      // Query real connector_configs from Supabase
      try {
        const { data, error } = await (supabase as any)
          .from("connector_configs")
          .select("id, connector_type, display_name, status, health_score, last_health_check")
          .order("created_at", { ascending: false });
        
        if (error || !data || data.length === 0) {
          // No connectors configured — show empty, not fake disconnected ones
          setConnectors([]);
        } else {
          setConnectors((data as any[]).map((c: any) => ({
            id: c.id,
            name: c.display_name || c.connector_type,
            type: c.connector_type as any,
            status: c.status === "active" ? "connected" as const
              : c.status === "error" ? "error" as const
              : c.status === "degraded" ? "degraded" as const
              : "disconnected" as const,
            lastSync: c.last_health_check
              ? new Date(c.last_health_check).toLocaleString()
              : undefined,
          })));
        }
      } catch {
        setConnectors([]);
      }
    }
    toast.info("Connector status refreshed");
  }, [mode]);

  return (
    <DataModeContext.Provider
      value={{
        mode,
        isDemoMode: mode === "demo",
        isLiveMode: mode === "live",
        toggleMode,
        setMode,
        connectors,
        refreshConnectors,
      }}
    >
      {children}
    </DataModeContext.Provider>
  );
}

export function useDataMode() {
  const ctx = useContext(DataModeContext);
  if (!ctx) throw new Error("useDataMode must be used within DataModeProvider");
  return ctx;
}
