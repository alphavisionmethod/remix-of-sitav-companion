// ═══════════════════════════════════════════════════════════════
// SITA OS — Ecommerce Manager Demo Fixture
//
// Demo-only data for `EcommerceManager.tsx`. Consumed exclusively
// when `useRealityModeSafe().isDemo === true`. In live mode the
// page renders an honest setup-required state until a Shopify
// store is connected at the platform level.
// See `_demo-source-marker.ts`.
// ═══════════════════════════════════════════════════════════════

export interface EcommerceKpiFixture {
  label: string;
  value: string;
  change: string;
  up: boolean;
  spark: ReadonlyArray<number>;
}

export const ECOMMERCE_KPIS: ReadonlyArray<EcommerceKpiFixture> = [
  { label: "Today's Sales",     value: "$2,847", change: "+12.3%", up: true,  spark: [18, 22, 19, 25, 28, 31, 28] },
  { label: "Orders",            value: "43",     change: "+8.1%",  up: true,  spark: [30, 35, 32, 38, 40, 43, 43] },
  { label: "Avg Order Value",   value: "$66.21", change: "-2.4%",  up: false, spark: [72, 68, 70, 65, 67, 64, 66] },
  { label: "Conversion Rate",   value: "3.8%",   change: "+0.5%",  up: true,  spark: [3.1, 3.2, 3.0, 3.4, 3.5, 3.6, 3.8] },
] as const;

export interface EcommerceTopProductFixture {
  name: string;
  revenue: string;
  units: number;
  trend: ReadonlyArray<number>;
}

export const ECOMMERCE_TOP_PRODUCTS: ReadonlyArray<EcommerceTopProductFixture> = [
  { name: "Premium Wireless Headphones", revenue: "$4,280", units:  68, trend: [40, 52, 48, 60, 65, 68, 68]   },
  { name: "Organic Cotton T-Shirt",      revenue: "$3,120", units: 156, trend: [90, 110, 130, 140, 145, 150, 156] },
  { name: "Smart Home Hub Pro",          revenue: "$2,940", units:  42, trend: [25, 28, 30, 35, 38, 40, 42]   },
  { name: "Artisan Coffee Blend (1lb)",  revenue: "$1,890", units: 210, trend: [150, 165, 175, 185, 195, 200, 210] },
] as const;

export type EcommerceOrderStatus = "pending" | "fulfilled" | "shipped" | "delivered" | "refunded";

export interface EcommerceOrderTimelineEvent {
  action: string;
  time: string;
}

export interface EcommerceOrderFixture {
  id: string;
  customer: string;
  items: number;
  total: string;
  status: EcommerceOrderStatus;
  date: string;
  timeline: ReadonlyArray<EcommerceOrderTimelineEvent>;
}

export const ECOMMERCE_ORDERS: ReadonlyArray<EcommerceOrderFixture> = [
  { id: "ORD-1042", customer: "Sarah Johnson", items: 3, total: "$189.97", status: "shipped",   date: "Today, 2:34 PM",
    timeline: [
      { action: "Order placed",            time: "Apr 9, 10:15 AM" },
      { action: "Payment confirmed",        time: "Apr 9, 10:16 AM" },
      { action: "Fulfilled by warehouse",   time: "Apr 10, 8:30 AM" },
      { action: "Shipped via USPS",         time: "Apr 10, 3:45 PM" },
    ] },
  { id: "ORD-1041", customer: "Marcus Lee",    items: 1, total: "$62.00",  status: "pending",   date: "Today, 1:12 PM",
    timeline: [
      { action: "Order placed",         time: "Apr 11, 1:12 PM" },
      { action: "Awaiting fulfillment", time: "Pending" },
    ] },
  { id: "ORD-1040", customer: "Emily Chen",    items: 5, total: "$324.50", status: "delivered", date: "Yesterday",
    timeline: [
      { action: "Order placed", time: "Apr 8, 9:00 AM" },
      { action: "Shipped",      time: "Apr 8, 4:00 PM" },
      { action: "Delivered",    time: "Apr 10, 11:30 AM" },
    ] },
  { id: "ORD-1039", customer: "James Wright",  items: 2, total: "$97.80",  status: "fulfilled", date: "Yesterday",
    timeline: [
      { action: "Order placed",      time: "Apr 8, 11:45 AM" },
      { action: "Payment confirmed", time: "Apr 8, 11:46 AM" },
      { action: "Fulfilled",         time: "Apr 9, 9:00 AM" },
    ] },
  { id: "ORD-1038", customer: "Aisha Patel",   items: 1, total: "$45.00",  status: "refunded",  date: "Apr 7",
    timeline: [
      { action: "Order placed",      time: "Apr 5, 3:00 PM" },
      { action: "Refund requested",  time: "Apr 7, 10:00 AM" },
      { action: "Refund processed",  time: "Apr 7, 2:00 PM" },
    ] },
] as const;

export interface EcommerceInventoryFixture {
  name: string;
  sku: string;
  stock: number;
  reorder: number;
  price: string;
  status: "in-stock" | "low-stock" | "critical" | "out-of-stock";
}

export const ECOMMERCE_INVENTORY: ReadonlyArray<EcommerceInventoryFixture> = [
  { name: "Premium Wireless Headphones", sku: "PWH-001", stock: 124, reorder: 50, price: "$62.99", status: "in-stock"     },
  { name: "Organic Cotton T-Shirt (M)",  sku: "OCT-M02", stock:   8, reorder: 30, price: "$19.99", status: "low-stock"    },
  { name: "Smart Home Hub Pro",          sku: "SHH-001", stock:  67, reorder: 20, price: "$69.99", status: "in-stock"     },
  { name: "Artisan Coffee Blend (1lb)",  sku: "ACB-1LB", stock:   3, reorder: 40, price: "$8.99",  status: "critical"     },
  { name: "Leather Crossbody Bag",       sku: "LCB-003", stock:  45, reorder: 15, price: "$89.99", status: "in-stock"     },
  { name: "Bamboo Water Bottle",         sku: "BWB-001", stock:   0, reorder: 50, price: "$24.99", status: "out-of-stock" },
] as const;

export interface EcommerceChannelFixture {
  name: string;
  status: "active" | "connected" | "planned";
  orders: number;
  revenue: string;
}

export const ECOMMERCE_CHANNELS: ReadonlyArray<EcommerceChannelFixture> = [
  { name: "Online Store",     status: "active",    orders: 38, revenue: "$2,410" },
  { name: "Point of Sale",    status: "active",    orders:  5, revenue: "$437"   },
  { name: "Instagram Shop",   status: "connected", orders:  0, revenue: "$0"     },
  { name: "Facebook Shop",    status: "planned",   orders:  0, revenue: "$0"     },
] as const;