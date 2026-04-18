import { useState } from "react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getModuleAdaptation } from "@/domains/engines/business-module-adaptations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SparklineChart } from "@/components/sita/SparklineChart";
import {
  ShoppingCart, Package, BarChart3, Store, TrendingUp, AlertTriangle,
  Search, ChevronDown, ChevronRight, Clock, CheckCircle, Truck, XCircle,
  RefreshCw, ExternalLink, Zap, Eye, ArrowUpRight, ArrowDownRight, Box
} from "lucide-react";

/* ─── Demo Data ─── */
const kpis = [
  { label: "Today's Sales", value: "$2,847", change: "+12.3%", up: true, spark: [18, 22, 19, 25, 28, 31, 28] },
  { label: "Orders", value: "43", change: "+8.1%", up: true, spark: [30, 35, 32, 38, 40, 43, 43] },
  { label: "Avg Order Value", value: "$66.21", change: "-2.4%", up: false, spark: [72, 68, 70, 65, 67, 64, 66] },
  { label: "Conversion Rate", value: "3.8%", change: "+0.5%", up: true, spark: [3.1, 3.2, 3.0, 3.4, 3.5, 3.6, 3.8] },
];

const topProducts = [
  { name: "Premium Wireless Headphones", revenue: "$4,280", units: 68, trend: [40, 52, 48, 60, 65, 68, 68] },
  { name: "Organic Cotton T-Shirt", revenue: "$3,120", units: 156, trend: [90, 110, 130, 140, 145, 150, 156] },
  { name: "Smart Home Hub Pro", revenue: "$2,940", units: 42, trend: [25, 28, 30, 35, 38, 40, 42] },
  { name: "Artisan Coffee Blend (1lb)", revenue: "$1,890", units: 210, trend: [150, 165, 175, 185, 195, 200, 210] },
];

type OrderStatus = "pending" | "fulfilled" | "shipped" | "delivered" | "refunded";
const statusConfig: Record<OrderStatus, { color: string; icon: typeof Clock }> = {
  pending: { color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: Clock },
  fulfilled: { color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: CheckCircle },
  shipped: { color: "bg-purple-500/10 text-purple-600 border-purple-500/20", icon: Truck },
  delivered: { color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle },
  refunded: { color: "bg-red-500/10 text-red-600 border-red-500/20", icon: XCircle },
};

const orders = [
  { id: "ORD-1042", customer: "Sarah Johnson", items: 3, total: "$189.97", status: "shipped" as OrderStatus, date: "Today, 2:34 PM",
    timeline: [
      { action: "Order placed", time: "Apr 9, 10:15 AM" },
      { action: "Payment confirmed", time: "Apr 9, 10:16 AM" },
      { action: "Fulfilled by warehouse", time: "Apr 10, 8:30 AM" },
      { action: "Shipped via USPS", time: "Apr 10, 3:45 PM" },
    ]},
  { id: "ORD-1041", customer: "Marcus Lee", items: 1, total: "$62.00", status: "pending" as OrderStatus, date: "Today, 1:12 PM",
    timeline: [
      { action: "Order placed", time: "Apr 11, 1:12 PM" },
      { action: "Awaiting fulfillment", time: "Pending" },
    ]},
  { id: "ORD-1040", customer: "Emily Chen", items: 5, total: "$324.50", status: "delivered" as OrderStatus, date: "Yesterday",
    timeline: [
      { action: "Order placed", time: "Apr 8, 9:00 AM" },
      { action: "Shipped", time: "Apr 8, 4:00 PM" },
      { action: "Delivered", time: "Apr 10, 11:30 AM" },
    ]},
  { id: "ORD-1039", customer: "James Wright", items: 2, total: "$97.80", status: "fulfilled" as OrderStatus, date: "Yesterday",
    timeline: [
      { action: "Order placed", time: "Apr 8, 11:45 AM" },
      { action: "Payment confirmed", time: "Apr 8, 11:46 AM" },
      { action: "Fulfilled", time: "Apr 9, 9:00 AM" },
    ]},
  { id: "ORD-1038", customer: "Aisha Patel", items: 1, total: "$45.00", status: "refunded" as OrderStatus, date: "Apr 7",
    timeline: [
      { action: "Order placed", time: "Apr 5, 3:00 PM" },
      { action: "Refund requested", time: "Apr 7, 10:00 AM" },
      { action: "Refund processed", time: "Apr 7, 2:00 PM" },
    ]},
];

const inventory = [
  { name: "Premium Wireless Headphones", sku: "PWH-001", stock: 124, reorder: 50, price: "$62.99", status: "in-stock" },
  { name: "Organic Cotton T-Shirt (M)", sku: "OCT-M02", stock: 8, reorder: 30, price: "$19.99", status: "low-stock" },
  { name: "Smart Home Hub Pro", sku: "SHH-001", stock: 67, reorder: 20, price: "$69.99", status: "in-stock" },
  { name: "Artisan Coffee Blend (1lb)", sku: "ACB-1LB", stock: 3, reorder: 40, price: "$8.99", status: "critical" },
  { name: "Leather Crossbody Bag", sku: "LCB-003", stock: 45, reorder: 15, price: "$89.99", status: "in-stock" },
  { name: "Bamboo Water Bottle", sku: "BWB-001", stock: 0, reorder: 50, price: "$24.99", status: "out-of-stock" },
];

const channels = [
  { name: "Online Store", status: "active", orders: 38, revenue: "$2,410" },
  { name: "Point of Sale", status: "active", orders: 5, revenue: "$437" },
  { name: "Instagram Shop", status: "connected", orders: 0, revenue: "$0" },
  { name: "Facebook Shop", status: "planned", orders: 0, revenue: "$0" },
];

/* ─── Sub-Components ─── */
const KPICard = ({ label, value, change, up, spark }: typeof kpis[0]) => (
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
        <SparklineChart data={spark} width={64} height={28} positive={up} />
      </div>
    </CardContent>
  </Card>
);

const OrderRow = ({ order, expanded, onToggle }: { order: typeof orders[0]; expanded: boolean; onToggle: () => void }) => {
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
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" className="text-xs h-7">View Details</Button>
            {order.status === "pending" && <Button size="sm" className="text-xs h-7">Fulfill Order</Button>}
          </div>
        </div>
      )}
    </div>
  );
};

const InventoryRow = ({ item }: { item: typeof inventory[0] }) => {
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
  const { primaryMode } = useBusinessProfile();
  const moduleConfig = getModuleAdaptation("ecommerce", primaryMode);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderSearch, setOrderSearch] = useState("");

  const filteredOrders = orders.filter(o =>
    o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.customer.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const lowStockCount = inventory.filter(i => i.status === "low-stock" || i.status === "critical" || i.status === "out-of-stock").length;

  return (
    <div className="space-y-6">
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

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-6 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {kpis.map(k => <KPICard key={k.label} {...k} />)}
          </div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Top Products by Revenue</CardTitle>
              <CardDescription>Last 7 days performance</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3 px-6 py-3 border-b border-border/40 last:border-0">
                  <span className="text-xs font-mono text-muted-foreground w-6">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.units} units sold</p>
                  </div>
                  <SparklineChart data={p.trend} width={56} height={20} positive />
                  <span className="text-sm font-semibold text-foreground w-20 text-right">{p.revenue}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders */}
        <TabsContent value="orders" className="space-y-4 mt-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search orders..."
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <Badge variant="secondary" className="text-xs">{orders.length} orders</Badge>
          </div>
          <Card className="overflow-hidden">
            <div className="divide-y-0">
              {filteredOrders.map(o => (
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

        {/* Inventory */}
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
            {inventory.map(item => <InventoryRow key={item.sku} item={item} />)}
          </Card>
        </TabsContent>

        {/* Storefront */}
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
              <Button className="gap-2">
                <ExternalLink className="h-3.5 w-3.5" /> Connect Shopify Store
              </Button>
              <p className="text-xs text-muted-foreground mt-2">Link your existing Shopify store or create a new one to manage everything from SITA OS.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Sales Channels</CardTitle>
              <CardDescription>Manage where your products are sold</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {channels.map(ch => (
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
                  Based on your sales trends, consider bundling <strong>Headphones + Coffee Blend</strong> — customers who buy one often purchase the other within 14 days. Estimated +18% AOV lift.
                </p>
                <Button size="sm" variant="outline" className="text-xs h-7 mt-2 gap-1">
                  <Eye className="h-3 w-3" /> View Full Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EcommerceManager;
