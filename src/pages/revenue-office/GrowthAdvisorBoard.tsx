import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Target, Shield, DollarSign, Users, MessageSquare, Zap, AlertTriangle, CheckCircle, Clock, GitCompare, Eye, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { DEMO_ADVISORS, DEMO_ADVISOR_DEBATES, DEMO_ADVISOR_WHAT_CHANGED, DEMO_ADVISOR_INVALIDATION, DEMO_ALIGNMENT_CLUSTERS } from "@/lib/demo-data/revenue-office";

export default function GrowthAdvisorBoard() {
  const { isDemoMode } = useDataMode();
  const [tab, setTab] = useState("council");
  const [expandedAdvisor, setExpandedAdvisor] = useState<string | null>(null);

  const advisors = DEMO_ADVISORS;
  const debates = DEMO_ADVISOR_DEBATES;
  const whatChanged = DEMO_ADVISOR_WHAT_CHANGED;
  const invalidation = DEMO_ADVISOR_INVALIDATION;
  const clusters = DEMO_ALIGNMENT_CLUSTERS;

  const boardConfidence = Math.round(advisors.reduce((s, a) => s + a.confidence, 0) / advisors.length * 100);
  const alertCount = advisors.filter(a => a.type === "alert").length;
  const debateCount = debates.reduce((s, d) => s + d.disagreements.length, 0);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" /> Growth Advisor Board
        </h1>
        <p className="text-sm text-muted-foreground">9-advisor council with debate engine, alignment mapping, and structured intelligence</p>
      </motion.div>

      {/* Board Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{advisors.length}</p><p className="text-xs text-muted-foreground">Active Advisors</p>
        </CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{boardConfidence}%</p><p className="text-xs text-muted-foreground">Board Confidence</p>
        </CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{debateCount}</p><p className="text-xs text-muted-foreground">Active Debates</p>
        </CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{alertCount}</p><p className="text-xs text-muted-foreground">Alerts</p>
        </CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5">
          <TabsTrigger value="council" className="text-[10px] h-7 px-2.5 gap-1"><Users className="h-3 w-3" />Council</TabsTrigger>
          <TabsTrigger value="debates" className="text-[10px] h-7 px-2.5 gap-1"><GitCompare className="h-3 w-3" />Debates</TabsTrigger>
          <TabsTrigger value="alignment" className="text-[10px] h-7 px-2.5 gap-1"><Target className="h-3 w-3" />Alignment</TabsTrigger>
          <TabsTrigger value="changes" className="text-[10px] h-7 px-2.5 gap-1"><Clock className="h-3 w-3" />What Changed</TabsTrigger>
          <TabsTrigger value="synthesis" className="text-[10px] h-7 px-2.5 gap-1"><Sparkles className="h-3 w-3" />Synthesis</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          {/* Council Tab */}
          <TabsContent value="council">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {advisors.map((a, i) => (
                <motion.div key={a.name} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className={`border-border/50 cursor-pointer transition-all ${a.type === "alert" ? "bg-red-500/5 border-red-500/20" : a.type === "warning" ? "bg-yellow-500/5 border-yellow-500/20" : "bg-card/50"} ${expandedAdvisor === a.name ? "ring-1 ring-primary/30" : ""}`}
                    onClick={() => setExpandedAdvisor(expandedAdvisor === a.name ? null : a.name)}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><a.icon className="w-4 h-4 text-primary" /></div>
                          <div>
                            <p className="font-medium text-foreground">{a.name}</p>
                            <p className="text-xs text-muted-foreground">{a.domain}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Confidence</span>
                            <span className="text-sm font-bold text-foreground">{Math.round(a.confidence * 100)}%</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">Uncertainty: {Math.round((1 - a.confidence) * 100)}%</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{a.stance}</p>
                      <div className="flex gap-1 flex-wrap">
                        {a.watching.map(w => <Badge key={w} variant="outline" className="text-xs">{w}</Badge>)}
                      </div>
                      <div className="pt-2 border-t border-border/30">
                        <p className="text-xs text-primary font-medium">→ {a.recommendation}</p>
                      </div>
                      <Progress value={a.confidence * 100} className="h-1" />

                      {/* Expanded Detail */}
                      {expandedAdvisor === a.name && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-3 border-t border-border/30 space-y-2">
                          {invalidation.filter(inv => inv.advisor === a.name).map((inv, j) => (
                            <div key={j} className="p-2 rounded bg-muted/10 border border-border/20">
                              <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1">What would change my mind</p>
                              <p className="text-xs text-foreground">{inv.condition}</p>
                              <p className="text-[10px] text-muted-foreground mt-1">Impact: {inv.impact}</p>
                            </div>
                          ))}
                          {whatChanged.filter(wc => wc.advisor === a.name).map((wc, j) => (
                            <div key={j} className="flex items-start gap-2 text-xs">
                              <Clock className="w-3 h-3 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-foreground">{wc.change}</p>
                                <p className="text-muted-foreground">{wc.reason} · {wc.when}</p>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Debates Tab */}
          <TabsContent value="debates">
            <div className="space-y-4">
              {debates.map((debate, di) => (
                <Card key={di} className="bg-card/50 border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <GitCompare className="w-4 h-4 text-amber-400" /> {debate.topic}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {debate.disagreements.map((d, j) => (
                      <div key={j} className="p-3 rounded-lg bg-muted/10 border border-border/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px]">{d.advisorA}</Badge>
                              <span className="text-xs text-muted-foreground">{Math.round(d.confidenceA * 100)}%</span>
                            </div>
                            <p className="text-sm text-foreground">{d.stanceA}</p>
                          </div>
                          <div className="space-y-1 md:border-l md:border-border/30 md:pl-4">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px]">{d.advisorB}</Badge>
                              <span className="text-xs text-muted-foreground">{Math.round(d.confidenceB * 100)}%</span>
                            </div>
                            <p className="text-sm text-foreground">{d.stanceB}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant={d.severity === "strong" ? "destructive" : "secondary"} className="text-[9px]">{d.severity}</Badge>
                          <span className="text-[10px] text-muted-foreground">Confidence gap: {Math.round(Math.abs(d.confidenceA - d.confidenceB) * 100)}%</span>
                        </div>
                      </div>
                    ))}
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-xs font-medium text-primary mb-1">Board Synthesis</p>
                      <p className="text-sm text-foreground">{debate.synthesis}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Alignment Tab */}
          <TabsContent value="alignment">
            <div className="space-y-4">
              {clusters.map((cluster, ci) => (
                <Card key={ci} className={`border-border/50 ${cluster.direction === "bullish" ? "bg-emerald-500/5" : cluster.direction === "bearish" ? "bg-red-500/5" : "bg-card/50"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${cluster.direction === "bullish" ? "bg-emerald-400" : cluster.direction === "bearish" ? "bg-red-400" : "bg-amber-400"}`} />
                        <p className="font-medium text-foreground">{cluster.theme}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] capitalize">{cluster.direction}</Badge>
                    </div>
                    <div className="flex gap-2 flex-wrap mb-3">
                      {cluster.advisors.map(name => <Badge key={name} variant="secondary" className="text-xs">{name}</Badge>)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Avg Confidence:</span>
                      <Progress value={cluster.avgConfidence * 100} className="h-1.5 flex-1" />
                      <span className="text-xs font-medium text-foreground">{Math.round(cluster.avgConfidence * 100)}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* What Changed Tab */}
          <TabsContent value="changes">
            <div className="space-y-3">
              {whatChanged.map((wc, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="bg-card/50 border-border/50">
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-[10px]">{wc.advisor}</Badge>
                          <span className="text-[10px] text-muted-foreground">{wc.when}</span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-1">{wc.change}</p>
                        <p className="text-xs text-muted-foreground">{wc.reason}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Synthesis Tab */}
          <TabsContent value="synthesis">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <span className="font-medium text-primary">Chief Revenue Advisor — Board Synthesis</span>
                </div>
                <p className="text-foreground">The board sees strong fundamentals with opportunity to scale. Key risk is Enterprise pipeline slowdown and 2 at-risk high-value clients. Consensus: invest in acquisition while protecting retention. Pricing increase is viable but should be tested carefully on new customers only.</p>
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-primary/20">
                  <div>
                    <p className="text-xs font-medium text-primary mb-2">Top Priorities</p>
                    <ul className="space-y-1 text-sm text-foreground">
                      <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-400" /> Outreach to 2 at-risk clients</li>
                      <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-400" /> Re-qualify 12 stale pipeline deals</li>
                      <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-400" /> Scale acquisition spend 15%</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-primary mb-2">Key Watchpoints</p>
                    <ul className="space-y-1 text-sm text-foreground">
                      <li className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-400" /> Enterprise deal velocity</li>
                      <li className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-400" /> Email fatigue signals</li>
                      <li className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-400" /> Price sensitivity on increase test</li>
                    </ul>
                  </div>
                </div>
                <div className="pt-3 border-t border-primary/20">
                  <p className="text-xs font-medium text-primary mb-2">What Would Change This Synthesis</p>
                  {invalidation.slice(0, 3).map((inv, i) => (
                    <p key={i} className="text-xs text-muted-foreground mb-1">• <span className="text-foreground">{inv.advisor}:</span> {inv.condition}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
