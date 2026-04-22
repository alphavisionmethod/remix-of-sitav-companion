import { useState } from "react";
import { motion } from "framer-motion";
import { Package, DollarSign, Star, Users, Plus, Edit3, BarChart3, Tag, Layers, ArrowUpRight, TrendingUp, FlaskConical, Zap, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import {
import { useDataMode } from "@/contexts/DataModeContext";
  DEMO_REV_BUNDLES as DEMO_BUNDLES,
  DEMO_REV_PRODUCTS as DEMO_PRODUCTS,
  DEMO_OFFER_UPSELLS,
  DEMO_PRICING_EXPERIMENTS,
} from "@/data/seed/revenue-office";

export default function OffersWorkspace() {
  const { isDemoMode } = useDataMode();
  const [tab, setTab] = useState("catalog");
  const totalRevenue = DEMO_PRODUCTS.reduce((s, p) => s + parseInt(p.revenue.replace(/[^0-9]/g, "")), 0);
  const activeProd = DEMO_PRODUCTS.filter(p => p.status === "active").length;
  const totalSales = DEMO_PRODUCTS.reduce((s, p) => s + p.sales, 0);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Offers Workspace</h1>
            <p className="text-sm text-muted-foreground">Products, services, memberships, courses, bundles, upsells & pricing intelligence</p>
          </div>
          <Button className="gap-2"><Plus className="w-4 h-4" /> New Offer</Button>
        </div>
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Product Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-400" },
          { label: "Active Products", value: String(activeProd), icon: Package, color: "text-blue-400" },
          { label: "Total Sales", value: String(totalSales), icon: BarChart3, color: "text-purple-400" },
          { label: "Upsell Paths", value: String((isDemoMode ? DEMO_OFFER_UPSELLS : [] as typeof DEMO_OFFER_UPSELLS).length), icon: ArrowUpRight, color: "text-amber-400" },
        ].map(s => (
          <Card key={s.label} className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5">
          <TabsTrigger value="catalog" className="text-[10px] h-7 px-2.5 gap-1"><Package className="h-3 w-3" />Catalog</TabsTrigger>
          <TabsTrigger value="upsells" className="text-[10px] h-7 px-2.5 gap-1"><ArrowUpRight className="h-3 w-3" />Upsell Paths</TabsTrigger>
          <TabsTrigger value="pricing" className="text-[10px] h-7 px-2.5 gap-1"><FlaskConical className="h-3 w-3" />Pricing Lab</TabsTrigger>
          <TabsTrigger value="bundles" className="text-[10px] h-7 px-2.5 gap-1"><Layers className="h-3 w-3" />Bundles</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          {/* Catalog Tab */}
          <TabsContent value="catalog">
            <div className="space-y-3">
              {(isDemoMode ? DEMO_PRODUCTS : [] as typeof DEMO_PRODUCTS).map((p, i) => (
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
          </TabsContent>

          {/* Upsell Paths Tab */}
          <TabsContent value="upsells">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Upsell & Cross-sell Paths</h3>
                <Button variant="outline" size="sm" className="gap-1 text-xs"><Plus className="w-3 h-3" />New Path</Button>
              </div>
              {(isDemoMode ? DEMO_OFFER_UPSELLS : [] as typeof DEMO_OFFER_UPSELLS).map((u, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="bg-card/50 border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="outline" className="text-xs">{u.from}</Badge>
                        <ArrowUpRight className="w-4 h-4 text-primary" />
                        <Badge className="text-xs bg-primary/20 text-primary">{u.to}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-lg font-bold text-emerald-400">{u.conversionRate}</p>
                          <p className="text-[10px] text-muted-foreground">Conversion Rate</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-foreground">{u.avgRevenue}</p>
                          <p className="text-[10px] text-muted-foreground">Avg Revenue</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mt-1">{u.trigger}</p>
                          <p className="text-[10px] text-muted-foreground">Trigger</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              {/* Advisor Guidance */}
              <Card className="bg-amber-500/5 border-amber-500/20">
                <CardContent className="p-4 flex items-start gap-3">
                  <Zap className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Offer Advisor</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upsell After Delivery has only 43% success rate — well below the 65% benchmark. 
                      Consider personalizing upsells based on the service type delivered. 
                      Clients who received "VIP Day Experience" show 67% conversion to Community Membership — 
                      this pattern should be replicated for other service tiers.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pricing Lab Tab */}
          <TabsContent value="pricing">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-primary" /> Pricing Experiments
                </h3>
                <Button variant="outline" size="sm" className="gap-1 text-xs"><Plus className="w-3 h-3" />New Test</Button>
              </div>
              {(isDemoMode ? DEMO_PRICING_EXPERIMENTS : [] as typeof DEMO_PRICING_EXPERIMENTS).map((exp, i) => (
                <motion.div key={exp.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="bg-card/50 border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground text-sm">{exp.name}</p>
                          <Badge variant={exp.status === "running" ? "default" : "secondary"} className="text-[10px]">{exp.status}</Badge>
                        </div>
                        {exp.winner && (
                          <Badge className="text-[10px] bg-emerald-500/20 text-emerald-400">Winner: {exp.winner}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{exp.variant}</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2 rounded bg-muted/10 border border-border/30 text-center">
                          <p className="text-sm font-bold text-foreground">{exp.resultA}</p>
                          <p className="text-[10px] text-muted-foreground">Variant A</p>
                        </div>
                        <div className={`p-2 rounded border text-center ${exp.winner === "B" ? "bg-emerald-500/5 border-emerald-500/20" : "bg-muted/10 border-border/30"}`}>
                          <p className="text-sm font-bold text-foreground">{exp.resultB}</p>
                          <p className="text-[10px] text-muted-foreground">Variant B</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-[10px] text-muted-foreground">{exp.participants} participants</span>
                        <div className="flex-1" />
                        <span className="text-[10px] text-muted-foreground">Confidence</span>
                        <Progress value={exp.confidence} className="w-20 h-1.5" />
                        <span className="text-[10px] text-foreground">{exp.confidence}%</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Bundles Tab */}
          <TabsContent value="bundles">
            <div className="space-y-3">
              {(isDemoMode ? DEMO_BUNDLES : [] as typeof DEMO_BUNDLES).map(b => (
                <Card key={b.name} className="bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-primary" />
                        <p className="font-medium text-foreground">{b.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="text-xs bg-green-500/20 text-green-400">{b.savings}</Badge>
                        <span className="text-sm font-bold text-primary">{b.price}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {b.includes.map(item => <Badge key={item} variant="outline" className="text-xs">{item}</Badge>)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
