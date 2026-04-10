import { motion } from "framer-motion";
import { Store, Package, ShoppingCart, TrendingDown, Star, Layers, Tag, AlertTriangle, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useSites } from "@/hooks/use-digital-presence";
import { DEMO_CART_DIAGNOSTICS, DEMO_COLLECTIONS, DEMO_DPO_PRODUCTS as DEMO_PRODUCTS, DEMO_MERCHANDISING_OPS } from "@/lib/demo-data/digital-presence";
import DPOSubNav from "./DPOSubNav";

export default function EcommerceOffice() {
  const { isDemoMode } = useDataMode();
  const { data: liveData, isLoading } = useSites();
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DPOSubNav />
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
            {DEMO_PRODUCTS.map(p => (
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
            {DEMO_COLLECTIONS.map(c => (
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
            {DEMO_CART_DIAGNOSTICS.map(c => (
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
              {DEMO_MERCHANDISING_OPS.map(m => (
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
