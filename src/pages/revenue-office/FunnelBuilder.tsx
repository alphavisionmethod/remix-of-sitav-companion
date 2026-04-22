import { useState } from "react";
import { motion } from "framer-motion";
import { GitBranch, Plus, Eye, MousePointer, CreditCard, ArrowDown, Edit3, BarChart3, AlertTriangle, Zap, Layers, TestTube2, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DEMO_FUNNELS, DEMO_FUNNEL_STEP_ANALYTICS, DEMO_FUNNEL_TRIGGERS } from "@/data/seed/revenue-office";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const STEP_TYPES = [
  { type: "page", label: "Landing Page", icon: Eye },
  { type: "form", label: "Form / Lead Magnet", icon: Layers },
  { type: "email", label: "Email Sequence", icon: Zap },
  { type: "booking", label: "Booking", icon: MousePointer },
  { type: "checkout", label: "Checkout", icon: CreditCard },
  { type: "followup", label: "Follow-Up", icon: Settings },
];

export default function FunnelBuilder() {
  const [tab, setTab] = useState("funnels");
  const [selectedFunnel, setSelectedFunnel] = useState(0);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Funnel & Journey Studio</h1>
            <p className="text-sm text-muted-foreground">Visual conversion journeys with step-by-step analytics and leak detection</p>
          </div>
          <Button className="gap-2"><Plus className="w-4 h-4" /> New Funnel</Button>
        </div>
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5">
          <TabsTrigger value="funnels" className="text-[10px] h-7 px-2.5 gap-1"><GitBranch className="h-3 w-3" />Funnels</TabsTrigger>
          <TabsTrigger value="analytics" className="text-[10px] h-7 px-2.5 gap-1"><BarChart3 className="h-3 w-3" />Step Analytics</TabsTrigger>
          <TabsTrigger value="leaks" className="text-[10px] h-7 px-2.5 gap-1"><AlertTriangle className="h-3 w-3" />What's Leaking?</TabsTrigger>
          <TabsTrigger value="ab" className="text-[10px] h-7 px-2.5 gap-1"><TestTube2 className="h-3 w-3" />A/B Tests</TabsTrigger>
          <TabsTrigger value="triggers" className="text-[10px] h-7 px-2.5 gap-1"><Zap className="h-3 w-3" />Triggers</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          {/* Funnels Overview */}
          <TabsContent value="funnels">
            <div className="space-y-6">
              {([] as typeof DEMO_FUNNELS).map((funnel, fi) => (
                <motion.div key={funnel.name} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: fi * 0.1 }}>
                  <Card className={`bg-card/50 border-border/50 ${selectedFunnel === fi ? "ring-1 ring-primary/30" : ""}`} onClick={() => setSelectedFunnel(fi)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <GitBranch className="w-5 h-5 text-primary" />
                          <div>
                            <CardTitle className="text-base">{funnel.name}</CardTitle>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <Badge variant={funnel.status === "live" ? "default" : "secondary"}>{funnel.status}</Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1"><Eye className="w-3 h-3" />{funnel.visitors.toLocaleString()}</span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1"><MousePointer className="w-3 h-3" />{funnel.optIns} opt-ins</span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1"><CreditCard className="w-3 h-3" />{funnel.sales} sales</span>
                              <span className="text-xs font-medium text-primary">{funnel.revenue}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm"><BarChart3 className="w-4 h-4 mr-1" /> Analytics</Button>
                          <Button variant="ghost" size="sm"><Edit3 className="w-4 h-4 mr-1" /> Edit</Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {funnel.steps.map((step, si) => (
                          <div key={step.name} className="flex items-center gap-2">
                            <div className="min-w-[160px] p-3 rounded-lg bg-muted/10 border border-border/30 text-center relative">
                              <p className="text-sm font-medium text-foreground">{step.name}</p>
                              <p className="text-lg font-bold text-foreground mt-1">{step.visitors.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">{step.conversion}</p>
                            </div>
                            {si < funnel.steps.length - 1 && (
                              <ArrowDown className="w-4 h-4 text-muted-foreground rotate-[-90deg] flex-shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Step Types Palette */}
            <Card className="bg-card/50 border-border/50 mt-6">
              <CardHeader className="pb-3"><CardTitle className="text-sm">Step Types Available</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {STEP_TYPES.map(st => (
                    <div key={st.type} className="p-3 rounded-lg bg-muted/10 border border-border/30 text-center cursor-pointer hover:border-primary/30 transition-colors">
                      <st.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                      <p className="text-[10px] text-foreground">{st.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step Analytics with Leak Detection */}
          <TabsContent value="analytics">
            <div className="space-y-3">
              {([] as typeof DEMO_FUNNEL_STEP_ANALYTICS).map((step, i) => (
                <Card key={i} className={`bg-card/50 border-border/50 ${step.dropoffPct > 50 ? "border-l-4 border-l-red-400" : step.dropoffPct > 25 ? "border-l-4 border-l-amber-400" : "border-l-4 border-l-emerald-400"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div>
                        <p className="font-medium text-foreground">{step.step}</p>
                        <p className="text-xs text-muted-foreground">{step.visitors.toLocaleString()} visitors → {step.converted.toLocaleString()} converted</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">{(100 - step.dropoffPct).toFixed(1)}%</p>
                        <p className="text-[10px] text-red-400">-{step.dropoffPct.toFixed(1)}% dropoff ({step.dropoff.toLocaleString()} lost)</p>
                      </div>
                    </div>
                    <Progress value={100 - step.dropoffPct} className="h-2 mb-3" />
                    <div className="flex items-start gap-2 p-2 rounded bg-amber-500/5 border border-amber-500/20">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-foreground font-medium">Leak Detected</p>
                        <p className="text-xs text-muted-foreground">{step.leakReason}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* What's Leaking Intelligence */}
          <TabsContent value="leaks">
            <Card className="bg-red-500/5 border-red-500/20 mb-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="font-medium text-foreground">Funnel Leak Summary</span>
                </div>
                <p className="text-sm text-muted-foreground">Total visitors lost across all steps: <span className="text-red-400 font-bold">{([] as typeof DEMO_FUNNEL_STEP_ANALYTICS).reduce((s, a) => s + a.dropoff, 0).toLocaleString()}</span></p>
                <p className="text-xs text-muted-foreground mt-1">Biggest leak: <span className="text-foreground font-medium">{([] as typeof DEMO_FUNNEL_STEP_ANALYTICS).sort((a, b) => b.dropoffPct - a.dropoffPct)[0]?.step}</span> at {([] as typeof DEMO_FUNNEL_STEP_ANALYTICS).sort((a, b) => b.dropoffPct - a.dropoffPct)[0]?.dropoffPct.toFixed(1)}% dropoff</p>
              </CardContent>
            </Card>
            <div className="space-y-3">
              {([] as typeof DEMO_FUNNEL_STEP_ANALYTICS).sort((a, b) => b.dropoffPct - a.dropoffPct).map((step, i) => (
                <Card key={i} className="bg-card/50 border-border/50">
                  <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="font-medium text-foreground">{step.step}</p>
                      <p className="text-xs text-muted-foreground">{step.leakReason}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={step.dropoffPct > 50 ? "destructive" : "secondary"} className="text-xs">{step.dropoffPct.toFixed(0)}% lost</Badge>
                      <Button variant="outline" size="sm" className="text-xs">Fix This</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* A/B Tests */}
          <TabsContent value="ab">
            <div className="space-y-3">
              {([] as typeof DEMO_FUNNEL_STEP_ANALYTICS).filter(s => s.abVariants.length > 0).map((step, i) => (
                <Card key={i} className="bg-card/50 border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2"><TestTube2 className="w-4 h-4 text-primary" /> {step.step}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {step.abVariants.map((v, j) => (
                        <div key={j} className={`p-3 rounded-lg border ${j === 1 && v.conversion > step.abVariants[0]?.conversion ? "bg-emerald-500/5 border-emerald-500/20" : "bg-muted/10 border-border/30"}`}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-foreground">{v.name}</p>
                            {j === 1 && v.conversion > step.abVariants[0]?.conversion && <Badge className="text-[9px] bg-emerald-500/20 text-emerald-400">Winner</Badge>}
                          </div>
                          <p className="text-2xl font-bold text-foreground">{v.conversion}%</p>
                          <Progress value={v.conversion} className="h-1.5 mt-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Triggers */}
          <TabsContent value="triggers">
            <div className="space-y-3">
              {([] as typeof DEMO_FUNNEL_TRIGGERS).map((t, i) => (
                <Card key={i} className="bg-card/50 border-border/50">
                  <CardContent className="p-4 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <Zap className={`w-4 h-4 ${t.status === "active" ? "text-emerald-400" : "text-muted-foreground"}`} />
                      <div>
                        <p className="text-sm font-medium text-foreground">When: {t.trigger}</p>
                        <p className="text-xs text-muted-foreground">Then: {t.action}</p>
                      </div>
                    </div>
                    <Badge variant={t.status === "active" ? "default" : "secondary"}>{t.status}</Badge>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" className="w-full gap-2"><Plus className="w-4 h-4" /> Add Trigger Rule</Button>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
