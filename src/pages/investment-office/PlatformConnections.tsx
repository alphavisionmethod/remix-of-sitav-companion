import { Link2, Plus, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Shield, Clock } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { PLATFORM_CONNECTIONS } from "@/hooks/useInvestmentOfficeData";
import { SYNC_HISTORY, PLATFORM_PERMISSIONS } from "@/lib/investment-office/mock-data";
import { useDataMode } from "@/contexts/DataModeContext";
import { useMarketWatchlistItems } from "@/hooks/use-investment-office";
import { DEMO_AVAILABLE_PLATFORMS } from "@/lib/demo-data/investment";

const STATUS_CONFIG = {
  connected: { icon: CheckCircle2, color: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/10" },
  disconnected: { icon: XCircle, color: "text-muted-foreground", bg: "bg-secondary" },
  syncing: { icon: RefreshCw, color: "text-primary", bg: "bg-primary/10" },
  error: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
};

const VALUE_UNLOCKED: Record<string, string[]> = {
  brokerage: ["Portfolio sync", "Trade execution", "Balance tracking", "Tax lot history"],
  exchange: ["Crypto positions", "Real-time balances", "Order routing", "Withdrawal monitoring"],
  "event-market": ["Event positions", "Probability tracking", "Contract execution"],
  wallet: ["Token balances", "DeFi positions", "On-chain activity"],
};

export default function PlatformConnections() {
  const { isDemoMode } = useDataMode();
  const { data: liveData, isLoading } = useMarketWatchlistItems();
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
            const perms = PLATFORM_PERMISSIONS[pc.id] || [];
            const unlocked = VALUE_UNLOCKED[pc.type] || [];
            return (
              <div key={pc.id} className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{pc.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{pc.name}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{pc.type}</p>
                    {pc.accountValue && <p className="text-xs font-medium text-foreground mt-0.5">${pc.accountValue.toLocaleString()}</p>}
                    {pc.lastSyncAt && <p className="text-[9px] text-muted-foreground">Last sync: {new Date(pc.lastSyncAt).toLocaleString()}</p>}
                  </div>
                  <div className={`rounded-full p-1.5 ${SC.bg}`}><SC.icon className={`h-4 w-4 ${SC.color}`} /></div>
                </div>
                {/* Permissions */}
                {perms.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Shield className="h-3 w-3 text-muted-foreground" />
                    {perms.map(p => (
                      <span key={p} className="rounded-md bg-[hsl(var(--trust-safe))]/10 px-1.5 py-0.5 text-[8px] font-medium text-[hsl(var(--trust-safe))]">{p}</span>
                    ))}
                  </div>
                )}
                {/* Value Unlocked */}
                {unlocked.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                    {unlocked.map(v => (
                      <span key={v} className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[8px] font-medium text-primary">{v}</span>
                    ))}
                  </div>
                )}
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

      {/* Sync History */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Sync History</h3>
        <div className="space-y-2">
          {SYNC_HISTORY.map(sh => {
            const platform = PLATFORM_CONNECTIONS.find(p => p.id === sh.platformId);
            return (
              <div key={sh.id} className="flex items-center gap-3 text-xs">
                <span>{platform?.icon || "🔗"}</span>
                <span className="text-foreground font-medium w-32">{platform?.name || "Unknown"}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${sh.status === "success" ? "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" : "bg-destructive/10 text-destructive"}`}>{sh.status}</span>
                <span className="text-muted-foreground">{sh.positionsSynced} positions</span>
                <span className="text-muted-foreground">{sh.duration}</span>
                <span className="text-muted-foreground ml-auto">{new Date(sh.timestamp).toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>

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