// ═══════════════════════════════════════════════════════════════
// SITA OS — Ecommerce Manager (Honest-Degraded)
//
// Manifest classification: `degraded` (Shopify connector not yet
// wired into this surface). Live mode renders a setup-required
// EmptyStateCard + descriptive preview. Demo mode renders the
// rich sample workspace from `ecommerce-manager-demo` fixtures.
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRealityModeSafe } from "@/lib/dual-reality/reality-mode-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SparklineChart } from "@/platform/sita/components/sita/SparklineChart";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { LegacyEmptyStateCard as EmptyStateCard } from "@/platform/sita/components/sita/EmptyStateCard";
import {
  ShoppingCart, Package, BarChart3, Store, AlertTriangle,
  Search, ChevronDown, ChevronRight, Clock, CheckCircle, Truck, XCircle,
  RefreshCw, ExternalLink, Zap, Eye, ArrowUpRight, ArrowDownRight, Box, LogIn,
} from "lucide-react";
import {
  ECOMMERCE_KPIS,
  ECOMMERCE_TOP_PRODUCTS,
  ECOMMERCE_ORDERS,
  ECOMMERCE_INVENTORY,
  ECOMMERCE_CHANNELS,
  type EcommerceKpiFixture,
  type EcommerceOrderFixture,
  type EcommerceOrderStatus,
  type EcommerceInventoryFixture,
} from "@/data/fixtures/mock-data/ecommerce-manager-demo";

const statusConfig: Record<EcommerceOrderStatus, { color: string; icon: typeof Clock }> = {
  pending:   { color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",    icon: Clock        },
  fulfilled: { color: "bg-blue-500/10 text-blue-600 border-blue-500/20",          icon: CheckCircle  },
  shipped:   { color: "bg-purple-500/10 text-purple-600 border-purple-500/20",    icon: Truck        },
  delivered: { color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle  },
  refunded:  { color: "bg-red-500/10 text-red-600 border-red-500/20",             icon: XCircle      },
};

// truth-allow: ia-config
const LIVE_PREVIEW_FEATURES: ReadonlyArray<{ icon: typeof ShoppingCart; title: string; description: string }> = [
  { icon: BarChart3,    title: "Sales dashboard",    description: "Today's sales, orders, AOV, and conversion rate sourced from your connected store." },
  { icon: ShoppingCart, title: "Order timeline",     description: "Order lifecycle from placement to delivery with payment and fulfilment events." },
  { icon: Package,      title: "Inventory health",   description: "Live stock levels with low-stock and reorder alerts." },
  { icon: Store,        title: "Sales channels",     description: "Online store, POS, Instagram Shop, and Facebook Shop performance side-by-side." },
];

/* ─── Sub-Components ─── */
const KPICard = ({ label, value, change, up, spark }: EcommerceKpiFixture) => (
  <Card className="relative overflow-hidden">
    <CardContent className="p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <span className={`inline-flex items-center gap-0.5 text-xs font-medium mt-1 ${up ? "text-emerald-600" : "text-red-500"}`}>
            {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {change}
          </span>
        </div>
        <SparklineChart data={[...spark]} width={64} height={28} positive={up} />
      </div>
    </CardContent>
  </Card>
);

const OrderRow = ({ order, expanded, onToggle }: { order: EcommerceOrderFixture; expanded: boolean; onToggle: () => void }) => {
  const cfg = statusConfig[order.status];
  const StatusIcon = cfg.icon;
  return (
    <div className="border-b border-border/40 last:border-0">
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left">
        {expanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
        <span className="text-sm font-mono font-medium text-foreground w-24">{order.id}</span>
        <span className="text-sm text-foreground flex-1">{order.customer}</span>
        <span className="text-xs text-muted-foreground w-20">{order.items} items</span>
        <span className="text-sm font-semibold text-foreground w-24 text-right">{order.total}</span>
        <Badge variant="outline" className={`${cfg.color} text-[10px] ml-2`}>
          <StatusIcon className="h-3 w-3 mr-1" />{order.status}
        </Badge>
        <span className="text-xs text-muted-foreground w-32 text-right">{order.date}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pl-12 space-y-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">Order Timeline</p>
          {order.timeline.map((ev, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              <span className="text-foreground">{ev.action}</span>
              <span className="text-muted-foreground ml-auto">{ev.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const InventoryRow = ({ item }: { item: EcommerceInventoryFixture }) => {
  const stockColor = item.status === "critical" || item.status === "out-of-stock"
    ? "text-red-500" : item.status === "low-stock" ? "text-yellow-600" : "text-emerald-600";
  const stockBg = item.status === "critical" || item.status === "out-of-stock"
    ? "bg-red-500/10" : item.status === "low-stock" ? "bg-yellow-500/10" : "bg-emerald-500/10";
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors">
      <Box className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
        <p className="text-[10px] text-muted-foreground font-mono">{item.sku}</p>
      </div>
      <span className="text-sm text-foreground w-16 text-right">{item.price}</span>
      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${stockBg} ${stockColor} min-w-[80px] justify-center`}>
        {item.stock === 0 ? "Out of stock" : `${item.stock} units`}
      </div>
      {(item.status === "low-stock" || item.status === "critical" || item.status === "out-of-stock") && (
        <Button size="sm" variant="outline" className="text-xs h-7 shrink-0">
          <RefreshCw className="h-3 w-3 mr-1" /> Reorder
        </Button>
      )}
    </div>
  );
};

/* ─── Main Component ─── */
const EcommerceManager = () => {
  const { user } = useAuth();
  const { isDemo } = useRealityModeSafe();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderSearch, setOrderSearch] = useState("");

  // ── LIVE MODE: honest setup-required state ────────────────────
  if (!isDemo) {
    if (!user) {
      return (
        <div className="space-y-4 p-4">
          <PageTruthBanner truthState="partial" />
          <EmptyStateCard
            icon={LogIn}
            title="Sign in to manage your ecommerce store"
            description="Ecommerce Manager unifies orders, inventory, and revenue across your connected store. Sign in to connect Shopify, or switch to Demo mode to explore a sample workspace."
            ctaLabel="Open sign-in"
            ctaPath="/auth"
          />
        </div>
      );
    }
    return (
      <div className="space-y-4 p-4">
        <PageTruthBanner truthState="partial" />
        <EmptyStateCard
          icon={Store}
          title="Connect your Shopify store"
          description="A Shopify connector exists at the platform level but is not yet wired into this surface. Connect a store to populate today's sales, orders, inventory, and channel performance. Until then this surface stays intentionally empty rather than displaying fabricated revenue, orders, or stock counts."
          ctaLabel="Connect Shopify"
          ctaPath="/business/integrations"
        />
        <div className="rounded-xl border border-border/40 bg-card/50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">What this surface will show once connected</p>
          </div>
          <ul className="space-y-2">
            {LIVE_PREVIEW_FEATURES.map((f) => (
              <li key={f.title} className="flex items-start gap-3 text-xs">
                <f.icon className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-foreground">{f.title}</p>
                  <p className="text-muted-foreground">{f.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // ── DEMO MODE: rich sample workspace ──────────────────────────
  const filteredOrders = ECOMMERCE_ORDERS.filter((o) =>
    o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.customer.toLowerCase().includes(orderSearch.toLowerCase()),
  );

  const lowStockCount = ECOMMERCE_INVENTORY.filter((i) => i.status === "low-stock" || i.status === "critical" || i.status === "out-of-stock").length;

  return (
    <div className="space-y-6">
      <PageTruthBanner truthState="demo" />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-surface-1 border border-border/40">
          <TabsTrigger value="dashboard" className="gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" /> Dashboard</TabsTrigger>
          <TabsTrigger value="orders" className="gap-1.5 text-xs"><ShoppingCart className="h-3.5 w-3.5" /> Orders</TabsTrigger>
          <TabsTrigger value="inventory" className="gap-1.5 text-xs">
            <Package className="h-3.5 w-3.5" /> Inventory
            {lowStockCount > 0 && <span className="ml-1 rounded-full bg-red-500/10 text-red-500 px-1.5 text-[10px] font-semibold">{lowStockCount}</span>}
          </TabsTrigger>
          <TabsTrigger value="storefront" className="gap-1.5 text-xs"><Store className="h-3.5 w-3.5" /> Storefront</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ECOMMERCE_KPIS.map((k) => <KPICard key={k.label} {...k} />)}
          </div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Top Products by Revenue</CardTitle>
              <CardDescription>Last 7 days performance</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {ECOMMERCE_TOP_PRODUCTS.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3 px-6 py-3 border-b border-border/40 last:border-0">
                  <span className="text-xs font-mono text-muted-foreground w-6">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.units} units sold</p>
                  </div>
                  <SparklineChart data={[...p.trend]} width={56} height={20} positive />
                  <span className="text-sm font-semibold text-foreground w-20 text-right">{p.revenue}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4 mt-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search orders..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <Badge variant="secondary" className="text-xs">{ECOMMERCE_ORDERS.length} orders</Badge>
          </div>
          <Card className="overflow-hidden">
            <div className="divide-y-0">
              {filteredOrders.map((o) => (
                <OrderRow
                  key={o.id}
                  order={o}
                  expanded={expandedOrder === o.id}
                  onToggle={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                />
              ))}
              {filteredOrders.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">No orders match your search.</div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4 mt-4">
          {lowStockCount > 0 && (
            <Card className="border-yellow-500/30 bg-yellow-500/5">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{lowStockCount} products need attention</p>
                  <p className="text-xs text-muted-foreground">Low stock or out-of-stock items require reordering</p>
                </div>
              </CardContent>
            </Card>
          )}
          <Card className="overflow-hidden">
            {ECOMMERCE_INVENTORY.map((item) => <InventoryRow key={item.sku} item={item} />)}
          </Card>
        </TabsContent>

        <TabsContent value="storefront" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Store className="h-4 w-4" /> Shopify Connection
                  </CardTitle>
                  <CardDescription>Connect your Shopify store to sync products, orders, and inventory</CardDescription>
                </div>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Not Connected</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="gap-2"><ExternalLink className="h-3.5 w-3.5" /> Connect Shopify Store</Button>
              <p className="text-xs text-muted-foreground mt-2">Link your existing Shopify store or create a new one to manage everything from SITA OS.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Sales Channels</CardTitle>
              <CardDescription>Manage where your products are sold</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {ECOMMERCE_CHANNELS.map((ch) => (
                <div key={ch.name} className="flex items-center gap-3 px-6 py-3 border-b border-border/40 last:border-0">
                  <div className={`w-2 h-2 rounded-full ${ch.status === "active" ? "bg-emerald-500" : ch.status === "connected" ? "bg-blue-500" : "bg-muted-foreground/30"}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{ch.name}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{ch.status}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{ch.orders} orders</span>
                  <span className="text-sm font-medium text-foreground">{ch.revenue}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-accent/20 bg-accent/5">
            <CardContent className="p-4 flex items-start gap-3">
              <Zap className="h-4 w-4 text-accent mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">AI Merchandising Advisor</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on your sales trends, consider bundling <strong>Headphones + Coffee Blend</strong> — customers who buy one often purchase the other within 14 days.
                </p>
                <Button size="sm" variant="outline" className="text-xs h-7 mt-2 gap-1"><Eye className="h-3 w-3" /> View Full Analysis</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EcommerceManager;