import { useState } from "react";
import { Link2, Plus, RefreshCw, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { PLATFORM_CONNECTIONS } from "@/hooks/useInvestmentOfficeData";
import { useDataMode } from "@/contexts/DataModeContext";

const STATUS_CONFIG = {
  connected: { icon: CheckCircle2, color: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/10" },
  disconnected: { icon: XCircle, color: "text-muted-foreground", bg: "bg-secondary" },
  syncing: { icon: RefreshCw, color: "text-primary", bg: "bg-primary/10" },
  error: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
};

const DEMO_AVAILABLE_PLATFORMS = [
  { name: "Robinhood", type: "brokerage", icon: "🪶" },
  { name: "Binance", type: "exchange", icon: "🟡" },
  { name: "Kraken", type: "exchange", icon: "🐙" },
  { name: "Kalshi", type: "event-market", icon: "📊" },
  { name: "Manifold", type: "event-market", icon: "🎲" },
  { name: "Fidelity", type: "brokerage", icon: "🏦" },
  { name: "Ledger Live", type: "wallet", icon: "🔑" },
];

export default function PlatformConnections() {
  const { isDemoMode } = useDataMode();
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <DemoModeBadge />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Link2 className="h-6 w-6 text-primary" /> Platform Connections</h1>
          <p className="text-sm text-muted-foreground mt-1">Connect brokerages, exchanges, event markets, and wallets</p>
        </div>
        <button className="rounded-xl bg-secondary px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
          <RefreshCw className="h-3.5 w-3.5" /> Sync All
        </button>
      </div>

      {/* Connected */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Connected</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PLATFORM_CONNECTIONS.filter(p => p.status === "connected").map(pc => {
            const SC = STATUS_CONFIG[pc.status];
            return (
              <div key={pc.id} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
                <span className="text-2xl">{pc.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{pc.name}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{pc.type}</p>
                  {pc.accountValue && <p className="text-xs font-medium text-foreground mt-0.5">${pc.accountValue.toLocaleString()}</p>}
                  {pc.lastSyncAt && <p className="text-[9px] text-muted-foreground">Last sync: {new Date(pc.lastSyncAt).toLocaleString()}</p>}
                </div>
                <div className={`rounded-full p-1.5 ${SC.bg}`}><SC.icon className={`h-4 w-4 ${SC.color}`} /></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disconnected */}
      {PLATFORM_CONNECTIONS.filter(p => p.status !== "connected").length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Needs Attention</h3>
          {PLATFORM_CONNECTIONS.filter(p => p.status !== "connected").map(pc => {
            const SC = STATUS_CONFIG[pc.status];
            return (
              <div key={pc.id} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
                <span className="text-2xl">{pc.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{pc.name}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{pc.type} · {pc.status}</p>
                </div>
                <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Reconnect</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Available to Connect */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Available to Connect</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DEMO_AVAILABLE_PLATFORMS.map(ap => (
            <div key={ap.name} className="rounded-2xl border border-dashed border-border bg-card p-4 flex items-center gap-3 hover:border-primary/20 transition-all cursor-pointer">
              <span className="text-xl">{ap.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{ap.name}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{ap.type}</p>
              </div>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
