import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, DollarSign, RefreshCw, Zap, Target, CheckCircle, AlertTriangle, Clock, Shield, Activity, Heart } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const statusColor: Record<string, string> = { completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", pending: "bg-amber-500/10 text-amber-500 border-amber-500/20", active: "bg-blue-500/10 text-blue-500 border-blue-500/20" };

const RECOVERED = [
  { id: "rv1", type: "Abandoned Cart Recovery", customer: "Apex Ltd", value: 2400, recovered: "2026-04-08", confidence: 0.94, proofId: "PRF-421" },
  { id: "rv2", type: "Late Payment Follow-up", customer: "Nova Inc", value: 1800, recovered: "2026-04-07", confidence: 0.88, proofId: "PRF-418" },
  { id: "rv3", type: "Subscription Renewal Nudge", customer: "Stellar Co", value: 1200, recovered: "2026-04-06", confidence: 0.92, proofId: "PRF-415" },
  { id: "rv4", type: "Dormant Account Reactivation", customer: "Blue Wave", value: 1300, recovered: "2026-04-05", confidence: 0.79, proofId: "PRF-410" },
];

const SAVED_COSTS = [
  { id: "sc1", category: "AI Model Routing Optimization", savedUsd: 890, period: "Last 30 days", method: "Downgraded non-critical calls to GPT-4o-mini" },
  { id: "sc2", category: "Cache Hit Optimization", savedUsd: 620, period: "Last 30 days", method: "Increased semantic cache coverage from 22% to 41%" },
  { id: "sc3", category: "Batch Processing", savedUsd: 450, period: "Last 30 days", method: "Combined 47 individual advisory calls into 12 batch runs" },
  { id: "sc4", category: "Duplicate Suppression", savedUsd: 340, period: "Last 30 days", method: "Eliminated 23 redundant inference requests" },
  { id: "sc5", category: "Smart Retry Reduction", savedUsd: 280, period: "Last 30 days", method: "Reduced retry storms by implementing circuit breakers" },
];

const HEALTH = {
  automationUptime: 99.7,
  activeRules: 14,
  pausedRules: 2,
  lastFailure: "2026-04-03T14:20:00Z",
  dailyActions: 23,
  confidenceFloor: 0.75,
  safetyOverrides: 3,
};

const RevenueAutopilotMonitor = () => {
  const [tab, setTab] = useState("overview");
  const totalRecovered = ([] as any[]).reduce((s, r) => s + r.value, 0);
  const totalSaved = ([] as any[]).reduce((s, c) => s + c.savedUsd, 0);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" /> Revenue Autopilot
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Automated revenue recovery, cost optimization, autopilot health, and proof-backed recommendations</p>
        </div>
        <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh</Button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Recovered Value", value: `$${totalRecovered.toLocaleString()}`, icon: DollarSign, color: "text-emerald-500" },
          { label: "Cost Saved", value: `$${totalSaved.toLocaleString()}`, icon: TrendingUp, color: "text-blue-500" },
          { label: "Autopilot Actions", value: String(([] as any[]).length), icon: Zap, color: "text-primary" },
          { label: "Win-Back Queue", value: String(([] as any[]).length), icon: Target, color: "text-amber-500" },
          { label: "Uptime", value: `${HEALTH.automationUptime}%`, icon: Activity, color: "text-emerald-500" },
        ].map(m => (
          <motion.div key={m.label} variants={fadeUp}>
            <Card className="hover:-translate-y-0.5 transition-transform">
              <CardContent className="p-3.5">
                <div className="flex items-center gap-2 mb-1"><m.icon className={`h-4 w-4 ${m.color}`} /><span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{m.label}</span></div>
                <p className="text-xl font-bold text-foreground">{m.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-secondary/50 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="overview" className="text-xs">Autopilot Actions</TabsTrigger>
          <TabsTrigger value="recovered" className="text-xs">Recovered Value</TabsTrigger>
          <TabsTrigger value="saved" className="text-xs">Saved Cost Timeline</TabsTrigger>
          <TabsTrigger value="winback" className="text-xs">Win-Back Queue</TabsTrigger>
          <TabsTrigger value="health" className="text-xs">Autopilot Health</TabsTrigger>
          <TabsTrigger value="proof" className="text-xs">Revenue Action Proof</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Autopilot Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {([] as any[]).map(a => (
                <div key={a.id} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-foreground">{a.action}</span>
                    <Badge variant="outline" className={`text-[9px] ${statusColor[a.status]}`}>{a.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                    <span>Result: <span className="text-foreground">{a.result}</span></span>
                    <span>Value: <span className="text-emerald-500 font-medium">{a.value}</span></span>
                    <span>Confidence: <span className={a.confidence > 0.8 ? "text-emerald-500" : "text-amber-500"}>{(a.confidence * 100).toFixed(0)}%</span></span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recovered" className="mt-4 space-y-3">
          {([] as any[]).map(r => (
            <Card key={r.id} className="hover:bg-muted/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-semibold text-foreground">{r.type}</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-500">${r.value.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                  <span>Customer: <span className="text-foreground">{r.customer}</span></span>
                  <span>Recovered: {r.recovered}</span>
                  <span>Confidence: <span className={r.confidence > 0.85 ? "text-emerald-500" : "text-amber-500"}>{(r.confidence * 100).toFixed(0)}%</span></span>
                  <Badge variant="outline" className="text-[9px] bg-blue-500/10 text-blue-500 border-blue-500/20">{r.proofId}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="saved" className="mt-4 space-y-3">
          {([] as any[]).map(c => (
            <Card key={c.id} className="hover:bg-muted/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-foreground">{c.category}</span>
                  <span className="text-lg font-bold text-blue-500">${c.savedUsd}</span>
                </div>
                <p className="text-xs text-muted-foreground">{c.method}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{c.period}</p>
              </CardContent>
            </Card>
          ))}
          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardContent className="p-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Total Saved</span>
              <span className="text-xl font-bold text-blue-500">${totalSaved.toLocaleString()}</span>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="winback" className="mt-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Win-Back Opportunities</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {([] as any[]).map(w => (
                <div key={w.name} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{w.name}</p>
                    <p className="text-[10px] text-muted-foreground">Lost: ${w.lostRevenue} · Last contact: {w.lastContact}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[9px] ${w.probability > 0.6 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>
                      {(w.probability * 100).toFixed(0)}% likely
                    </Badge>
                    <Button variant="outline" size="sm" className="h-6 text-[10px]">Engage</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="mt-4 space-y-3">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Heart className="h-4 w-4 text-primary" /> Autopilot Health & Limits</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Uptime", value: `${HEALTH.automationUptime}%`, good: true },
                  { label: "Active Rules", value: String(HEALTH.activeRules), good: true },
                  { label: "Paused Rules", value: String(HEALTH.pausedRules), good: HEALTH.pausedRules === 0 },
                  { label: "Daily Actions", value: String(HEALTH.dailyActions), good: true },
                  { label: "Confidence Floor", value: `${(HEALTH.confidenceFloor * 100).toFixed(0)}%`, good: true },
                  { label: "Safety Overrides", value: String(HEALTH.safetyOverrides), good: false },
                  { label: "Last Failure", value: new Date(HEALTH.lastFailure).toLocaleDateString(), good: true },
                ].map(m => (
                  <div key={m.label} className="p-3 rounded-lg border">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{m.label}</p>
                    <p className={`text-lg font-bold ${m.good ? "text-foreground" : "text-amber-500"}`}>{m.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proof" className="mt-4 space-y-3">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Revenue Action Proof</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {([] as any[]).map(r => (
                <div key={r.id} className="p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">{r.type} — {r.customer}</span>
                    <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      <CheckCircle className="h-2.5 w-2.5 mr-0.5" /> Proof Verified
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                    <span>Proof: {r.proofId}</span>
                    <span>Value: ${r.value}</span>
                    <span>Confidence: {(r.confidence * 100).toFixed(0)}%</span>
                    <span>Date: {r.recovered}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RevenueAutopilotMonitor;
