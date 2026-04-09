import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import {
  Layout, Users, Phone, Star, Mail, FileText, RefreshCw, ShoppingBag,
  UserPlus, Heart, ArrowRight, Zap, Target, MessageSquare, Shield,
  Clock, CheckCircle, Brain, Package, DollarSign, AlertTriangle, Workflow
} from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { DEMO_REV_categories as DEMO_categories, DEMO_templates } from "@/lib/demo-data/revenue-office";

export default function AutomationTemplates() {
  const { isDemoMode } = useDataMode();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const filtered = selectedCategory === "All" ? DEMO_templates : DEMO_templates.filter(t => t.category === selectedCategory);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Layout className="h-6 w-6 text-primary" />Automation Template Gallery
        </h1>
        <p className="text-muted-foreground">Ready-made automation blueprints — customize, simulate, and activate in minutes</p>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        <Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-foreground">{DEMO_templates.length}</p><p className="text-[10px] text-muted-foreground">Templates</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-emerald-400">{DEMO_categories.length - 1}</p><p className="text-[10px] text-muted-foreground">Categories</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-400">6.1</p><p className="text-[10px] text-muted-foreground">Avg Steps</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-purple-400">4.8 min</p><p className="text-[10px] text-muted-foreground">Avg Setup</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-amber-400">$82K</p><p className="text-[10px] text-muted-foreground">Total Impact/mo</p></CardContent></Card>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-1.5">
        {DEMO_categories.map((cat) => (
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
              {/* Advisor Note */}
              <div className="p-2 rounded bg-primary/5 border border-primary/10 mb-3">
                <div className="flex items-start gap-1.5">
                  <Brain className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-foreground">{t.advisorNote}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors flex items-center gap-1 flex-1 justify-center">Use Template <ArrowRight className="h-3 w-3" /></button>
                <button className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-xs flex-1 justify-center flex items-center gap-1">Preview Flow</button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
