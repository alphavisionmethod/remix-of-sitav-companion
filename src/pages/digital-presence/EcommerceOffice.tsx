import { motion } from "framer-motion";
import { Store, Package, ShoppingCart, TrendingDown, Star, Layers, Tag, AlertTriangle, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const PRODUCTS = [
  { name: "Premium Yoga Mat", price: "$79", stock: 24, views: 1200, conversion: "4.2%", rating: 4.8, status: "active" },
  { name: "Resistance Bands Set", price: "$29", stock: 156, views: 890, conversion: "6.1%", rating: 4.5, status: "active" },
  { name: "Summer Tee (Limited)", price: "$45", stock: 3, views: 342, conversion: "2.8%", rating: 4.2, status: "low-stock" },
  { name: "Wellness Journal", price: "$22", stock: 89, views: 120, conversion: "1.1%", rating: 3.9, status: "underperforming" },
  { name: "Gift Bundle", price: "$120", stock: 45, views: 567, conversion: "3.5%", rating: 4.7, status: "active" },
];

const COLLECTIONS = [
  { name: "Best Sellers", products: 8, revenue: "$4,280", featured: true },
  { name: "New Arrivals", products: 5, revenue: "$1,200", featured: true },
  { name: "Summer Collection", products: 12, revenue: "$2,100", featured: false },
  { name: "Gift Ideas", products: 6, revenue: "$890", featured: false },
];

const CART_DIAGNOSTICS = [
  { issue: "Shipping cost surprise at checkout", impact: "32% of cart abandonments", severity: "critical" },
  { issue: "No guest checkout option", impact: "18% of abandonments", severity: "high" },
  { issue: "Payment method limited to credit card", impact: "12% of abandonments", severity: "medium" },
  { issue: "No urgency/scarcity signals", impact: "Estimated 5% lift possible", severity: "opportunity" },
];

const MERCHANDISING_OPS = [
  { action: "Feature 'Resistance Bands' on homepage — highest conversion", type: "opportunity", confidence: 89 },
  { action: "Bundle 'Yoga Mat' + 'Resistance Bands' — natural pair", type: "opportunity", confidence: 82 },
  { action: "Archive 'Wellness Journal' — low performance, update or remove", type: "cleanup", confidence: 75 },
  { action: "Add related products to 'Gift Bundle' page", type: "improvement", confidence: 91 },
];

export default function EcommerceOffice() {
  const { isDemoMode } = useDataMode();
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Ecommerce / Merchandising Office</h1>
        <p className="text-sm text-muted-foreground">Products, collections, cart recovery, merchandising & promotion planning</p>
      </motion.div>

      {/* Product Table */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Package className="w-4 h-4 text-blue-400" /> Products</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {PRODUCTS.map(p => (
              <div key={p.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <span className="text-sm font-medium text-foreground">{p.name}</span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">{p.price}</span>
                    <span className="text-xs text-muted-foreground">{p.stock} in stock</span>
                    <span className="text-xs text-muted-foreground">{p.views} views</span>
                    <span className="text-xs text-muted-foreground">{p.conversion} CVR</span>
                    <span className="text-xs text-amber-400 flex items-center gap-0.5"><Star className="w-3 h-3" />{p.rating}</span>
                  </div>
                </div>
                <Badge variant={p.status === "active" ? "default" : p.status === "low-stock" ? "destructive" : "secondary"} className="text-[10px]">{p.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Collections */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Layers className="w-4 h-4 text-purple-400" /> Collections</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {COLLECTIONS.map(c => (
              <div key={c.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-foreground">{c.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{c.products} products</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{c.revenue}</span>
                  {c.featured && <Badge variant="default" className="text-[10px]">Featured</Badge>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Cart Diagnostics */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-red-400" /> Cart Abandonment Diagnostics</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {CART_DIAGNOSTICS.map(c => (
              <div key={c.issue} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant={c.severity === "critical" ? "destructive" : c.severity === "opportunity" ? "default" : "secondary"} className="text-[10px]">{c.severity}</Badge>
                </div>
                <p className="text-xs font-medium text-foreground">{c.issue}</p>
                <p className="text-[10px] text-muted-foreground">{c.impact}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Merchandising Suggestions */}
        <Card className="bg-card/50 border-border/50 lg:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Sparkles className="w-4 h-4 text-violet-400" /> AI Merchandising Suggestions</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {MERCHANDISING_OPS.map(m => (
                <div key={m.action} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant={m.type === "opportunity" ? "default" : "secondary"} className="text-[10px]">{m.type}</Badge>
                    <span className="text-[10px] text-muted-foreground">{m.confidence}% confidence</span>
                  </div>
                  <p className="text-xs text-foreground">{m.action}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
