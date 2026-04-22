import { useState, useMemo } from "react";
import { Link2, Plus, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Shield, Clock, Search, Star } from "lucide-react";
import { PLATFORM_CONNECTIONS } from "@/hooks/useInvestmentOfficeData";
import { SYNC_HISTORY, PLATFORM_PERMISSIONS } from "@/domains/investment/mock-data";
import { useMarketWatchlistItems } from "@/hooks/use-investment-office";
import { DEMO_AVAILABLE_PLATFORMS } from "@/data/seed/investment";
import { ConnectPlatformModal } from "@/components/investment/ConnectPlatformModal";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AvailablePlatform, PlatformType } from "@/domains/investment/types";
import { cn } from "@/lib/utils";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
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
  dex: ["LP positions", "Swap history", "Fees earned", "Yield tracking"],
  forex: ["Forex positions", "Real-time rates", "Leverage & margin"],
  "international-broker": ["Multi-asset sync", "Global positions", "Currency exposure"],
};

const CATEGORY_TABS: { value: string; label: string; types: PlatformType[] }[] = [
  { value: "all", label: "All", types: [] },
  { value: "wallets", label: "Wallets", types: ["wallet"] },
  { value: "exchanges", label: "Exchanges", types: ["exchange"] },
  { value: "defi", label: "DeFi", types: ["dex"] },
  { value: "forex", label: "Forex & Intl", types: ["forex", "international-broker"] },
  { value: "brokerages", label: "Brokerages", types: ["brokerage"] },
  { value: "events", label: "Events", types: ["event-market"] },
];

export default function PlatformConnections() {
  const { data: liveData, isLoading } = useMarketWatchlistItems();
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<AvailablePlatform | null>(null);

  const filtered = useMemo(() => {
    let list = DEMO_AVAILABLE_PLATFORMS;
    const tab = CATEGORY_TABS.find(t => t.value === category);
    if (tab && tab.types.length > 0) {
      list = list.filter(p => tab.types.includes(p.type as PlatformType));
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.type.includes(q) || p.chain?.toLowerCase().includes(q));
    }
    return list;
  }, [category, search]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Link2 className="h-6 w-6 text-primary" /> Platform Connections</h1>
          <p className="text-sm text-muted-foreground mt-1">Connect brokerages, exchanges, wallets, DeFi, and forex platforms</p>
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
                    <div className="flex items-center gap-1.5">
                      <p className="text-[10px] text-muted-foreground capitalize">{pc.type}</p>
                      {pc.chain && <Badge variant="outline" className="text-[8px] px-1 py-0">⛓ {pc.chain}</Badge>}
                      {pc.region && <Badge variant="outline" className="text-[8px] px-1 py-0">🌍 {pc.region}</Badge>}
                    </div>
                    {pc.accountValue && <p className="text-xs font-medium text-foreground mt-0.5">${pc.accountValue.toLocaleString()}</p>}
                    {pc.lastSyncAt && <p className="text-[9px] text-muted-foreground">Last sync: {new Date(pc.lastSyncAt).toLocaleString()}</p>}
                  </div>
                  <div className={`rounded-full p-1.5 ${SC.bg}`}><SC.icon className={`h-4 w-4 ${SC.color}`} /></div>
                </div>
                {perms.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Shield className="h-3 w-3 text-muted-foreground" />
                    {perms.map(p => (
                      <span key={p} className="rounded-md bg-[hsl(var(--trust-safe))]/10 px-1.5 py-0.5 text-[8px] font-medium text-[hsl(var(--trust-safe))]">{p}</span>
                    ))}
                  </div>
                )}
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
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Available to Connect</h3>

        {/* Search + Tabs */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search platforms..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Tabs value={category} onValueChange={setCategory}>
            <TabsList className="flex-wrap h-auto gap-1">
              {CATEGORY_TABS.map(t => (
                <TabsTrigger key={t.value} value={t.value} className="text-xs px-2.5 py-1">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Platform Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {filtered.map(ap => (
            <div
              key={ap.name}
              onClick={() => setSelectedPlatform(ap)}
              className="rounded-2xl border border-dashed border-border bg-card p-4 space-y-2 hover:border-primary/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{ap.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-foreground truncate">{ap.name}</p>
                    {ap.popular && <Star className="h-3 w-3 text-[hsl(var(--trust-warn))] fill-[hsl(var(--trust-warn))]" />}
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <p className="text-[10px] text-muted-foreground capitalize">{ap.type.replace("-", " ")}</p>
                    {ap.chain && <Badge variant="outline" className="text-[8px] px-1 py-0">⛓ {ap.chain}</Badge>}
                    {ap.region && <Badge variant="outline" className="text-[8px] px-1 py-0">🌍 {ap.region}</Badge>}
                  </div>
                </div>
                <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              {ap.capabilities && (
                <div className="flex flex-wrap gap-1">
                  {ap.capabilities.slice(0, 3).map(c => (
                    <span key={c} className="rounded-md bg-secondary px-1.5 py-0.5 text-[8px] text-muted-foreground">{c}</span>
                  ))}
                  {ap.capabilities.length > 3 && (
                    <span className="text-[8px] text-muted-foreground">+{ap.capabilities.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No platforms found matching "{search}"
          </div>
        )}
      </div>

      <ConnectPlatformModal
        platform={selectedPlatform}
        open={!!selectedPlatform}
        onOpenChange={open => { if (!open) setSelectedPlatform(null); }}
      />
    </div>
  );
}
