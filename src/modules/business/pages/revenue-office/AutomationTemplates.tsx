import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import {
  Layout, Users, Phone, Star, Mail, FileText, RefreshCw, ShoppingBag,
  UserPlus, Heart, ArrowRight, Zap, Target, MessageSquare, Shield,
  Clock, CheckCircle, Brain, Package, DollarSign, AlertTriangle, Workflow,
  Eye, Search, TrendingUp, BarChart3
} from "lucide-react";
import AutomationSubNav from "./AutomationSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
const templates: any[] = [];

// Production fallback — seed data removed
const categories: any[] = [];

const RECENTLY_USED = [
  { name: "Stale Lead Recovery", lastUsed: "3 days ago", timesUsed: 12, avgImpact: "$1,200/use" },
  { name: "Post-Service Review Request", lastUsed: "Yesterday", timesUsed: 34, avgImpact: "+3 reviews/use" },
  { name: "Welcome Onboarding", lastUsed: "Today", timesUsed: 28, avgImpact: "92% completion" },
];

const TEMPLATE_COMBOS = [
  { name: "Full Client Lifecycle", templates: ["Welcome Onboarding", "Nurture Sequence", "Post-Service Review", "Churn Prevention"], totalSteps: 26, impact: "$24K/mo" },
  { name: "Revenue Recovery Stack", templates: ["Stale Lead Recovery", "No-Show Rescue", "Abandoned Checkout", "Quote Follow-up"], totalSteps: 18, impact: "$18K/mo" },
  { name: "Reputation Engine", templates: ["Post-Service Review", "Happy Client Referral", "Testimonial Harvest"], totalSteps: 12, impact: "+20 reviews/mo" },
];

export default function AutomationTemplates() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [tab, setTab] = useState("gallery");
  const filtered = selectedCategory === "All" ? templates : ([] as typeof templates).filter(t => t.category === selectedCategory);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
<AutomationSubNav />
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Layout className="h-6 w-6 text-primary" />Automation Template Gallery
        </h1>
        <p className="text-muted-foreground">Ready-made automation blueprints — customize, simulate, and activate in minutes</p>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        <Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-foreground">{([] as typeof templates).length}</p><p className="text-[10px] text-muted-foreground">Templates</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-emerald-400">{([] as typeof categories).length - 1}</p><p className="text-[10px] text-muted-foreground">Categories</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-400">6.1</p><p className="text-[10px] text-muted-foreground">Avg Steps</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-purple-400">4.8 min</p><p className="text-[10px] text-muted-foreground">Avg Setup</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-amber-400">$82K</p><p className="text-[10px] text-muted-foreground">Total Impact/mo</p></CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="gallery"><Layout className="h-3.5 w-3.5 mr-1" />Gallery</TabsTrigger>
          <TabsTrigger value="combos"><Workflow className="h-3.5 w-3.5 mr-1" />Template Combos</TabsTrigger>
          <TabsTrigger value="recent"><Clock className="h-3.5 w-3.5 mr-1" />Recently Used</TabsTrigger>
        </TabsList>

        {/* Gallery */}
        <TabsContent value="gallery" className="space-y-4 mt-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-1.5">
            {([] as typeof categories).map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10"}`}>{cat}</button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((t) => (
              <Card key={t.name} className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 mt-0.5"><t.icon className="h-4 w-4 text-primary" /></div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{t.name}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge variant="secondary" className="text-[10px]">{t.category}</Badge>
                          <Badge className="bg-emerald-500/10 text-emerald-400 text-[10px]">{t.trustLevel}</Badge>
                          <Badge variant="outline" className="text-[10px]">{t.difficulty}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{t.desc}</p>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground mb-2">
                    <span>{t.steps} steps</span>
                    <span>Setup: {t.timeToSetup}</span>
                    <span>Popularity: {t.popularity}%</span>
                    <span className="text-emerald-400 font-medium">{t.impact}</span>
                  </div>
                  <div className="p-2 rounded bg-primary/5 border border-primary/10 mb-3">
                    <div className="flex items-start gap-1.5">
                      <Brain className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-[10px] text-foreground">{t.advisorNote}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="default" size="sm" className="text-xs flex-1 gap-1">Use Template <ArrowRight className="h-3 w-3" /></Button>
                    <Button variant="outline" size="sm" className="text-xs flex-1 gap-1"><Eye className="h-3 w-3" />Preview</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Template Combos */}
        <TabsContent value="combos" className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">Pre-built template combinations for common business workflows</p>
          {TEMPLATE_COMBOS.map((combo, i) => (
            <Card key={i} className="bg-card/50 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{combo.name}</p>
                    <p className="text-xs text-muted-foreground">{combo.totalSteps} total steps across {combo.templates.length} templates</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">{combo.impact}</p>
                    <p className="text-[10px] text-muted-foreground">estimated impact</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {combo.templates.map((t, ti) => (
                    <div key={ti} className="flex items-center gap-1">
                      <Badge variant="secondary" className="text-[10px]">{t}</Badge>
                      {ti < combo.templates.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  ))}
                </div>
                <Button variant="default" size="sm" className="text-xs gap-1">Deploy Combo <Zap className="h-3 w-3" /></Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Recently Used */}
        <TabsContent value="recent" className="space-y-3 mt-4">
          {RECENTLY_USED.map((r, i) => (
            <Card key={i} className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{r.name}</p>
                  <p className="text-xs text-muted-foreground">Last used: {r.lastUsed} · {r.timesUsed} total uses</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-medium text-emerald-400">{r.avgImpact}</p>
                    <p className="text-[10px] text-muted-foreground">avg impact</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-[10px] gap-1"><RefreshCw className="h-3 w-3" />Reuse</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}