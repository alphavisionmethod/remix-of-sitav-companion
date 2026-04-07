import { motion } from "framer-motion";
import { Package, DollarSign, Star, Users, Plus, Edit3, BarChart3, Tag, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const PRODUCTS = [
  { name: "Growth Strategy Blueprint", type: "digital", price: "$297", sales: 142, revenue: "$42,174", status: "active", category: "Course" },
  { name: "1:1 Coaching — Monthly", type: "service", price: "$500/mo", sales: 18, revenue: "$9,000", status: "active", category: "Membership" },
  { name: "VIP Day Experience", type: "service", price: "$2,000", sales: 8, revenue: "$16,000", status: "active", category: "Service" },
  { name: "Starter Kit Bundle", type: "bundle", price: "$97", sales: 234, revenue: "$22,698", status: "active", category: "Bundle" },
  { name: "Community Membership", type: "membership", price: "$47/mo", sales: 67, revenue: "$3,149", status: "active", category: "Membership" },
  { name: "Advanced Workshop Series", type: "course", price: "$497", sales: 0, revenue: "$0", status: "draft", category: "Course" },
];

const BUNDLES = [
  { name: "Launch Package", includes: ["Growth Strategy Blueprint", "Starter Kit Bundle", "1 Coaching Session"], price: "$697", savings: "Save $197" },
  { name: "VIP All-Access", includes: ["All Courses", "Community Membership", "Monthly Coaching"], price: "$997/mo", savings: "Save $347/mo" },
];

export default function OffersWorkspace() {
  const { isDemoMode } = useDataMode();
  const totalRevenue = PRODUCTS.reduce((s, p) => s + parseInt(p.revenue.replace(/[^0-9]/g, "")), 0);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Offers Workspace</h1>
            <p className="text-sm text-muted-foreground">Products, services, memberships, courses, and bundles</p>
          </div>
          <Button className="gap-2"><Plus className="w-4 h-4" /> New Offer</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Total Product Revenue</p>
          <p className="text-2xl font-bold text-foreground">${totalRevenue.toLocaleString()}</p>
        </CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Active Products</p>
          <p className="text-2xl font-bold text-foreground">{PRODUCTS.filter(p => p.status === "active").length}</p>
        </CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Total Sales</p>
          <p className="text-2xl font-bold text-foreground">{PRODUCTS.reduce((s, p) => s + p.sales, 0)}</p>
        </CardContent></Card>
      </div>

      {/* Products */}
      <div className="space-y-3">
        {PRODUCTS.map((p, i) => (
          <motion.div key={p.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{p.name}</p>
                      <Badge variant={p.status === "active" ? "default" : "secondary"} className="text-xs">{p.status}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-xs">{p.category}</Badge>
                      <span className="text-xs text-muted-foreground">{p.price}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{p.revenue}</p>
                    <p className="text-xs text-muted-foreground">{p.sales} sales</p>
                  </div>
                  <Button variant="ghost" size="sm"><Edit3 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Bundles */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><Layers className="w-4 h-4 text-primary" /> Bundles</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {BUNDLES.map(b => (
            <div key={b.name} className="p-4 rounded-lg bg-muted/10 border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-foreground">{b.name}</p>
                <div className="flex items-center gap-2">
                  <Badge className="text-xs bg-green-500/20 text-green-400">{b.savings}</Badge>
                  <span className="text-sm font-bold text-primary">{b.price}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {b.includes.map(item => <Badge key={item} variant="outline" className="text-xs">{item}</Badge>)}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
