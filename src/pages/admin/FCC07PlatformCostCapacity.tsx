// ═══════════════════════════════════════════════════════════════
// SITA OS — Platform Cost & Capacity Board (FCC07)
// Unified view: AI tokens, compute, storage, bandwidth
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign, Brain, HardDrive, Wifi, TrendingUp, TrendingDown,
  Cpu, BarChart3, AlertTriangle, CheckCircle2, Zap, Server
} from "lucide-react";
import { founderOrchestrator, type PlatformCostSnapshot } from "@/lib/services/founder-orchestrator";
interface CostBreakdownItem {
  label: string;
  value: number;
  unit: string;
  budget: number;
  trend: number;
  icon: React.ElementType;
  color: string;
}

const COST_DATA: CostBreakdownItem[] = [
  { label: "AI Inference", value: 428, unit: "cents", budget: 800, trend: -12.5, icon: Brain, color: "text-primary" },
  { label: "Compute", value: 4500, unit: "cents/mo", budget: 8000, trend: 1.8, icon: Cpu, color: "text-sita-gold" },
  { label: "Storage", value: 2.4, unit: "GB", budget: 10, trend: 5.2, icon: HardDrive, color: "text-accent" },
  { label: "Bandwidth", value: 12400, unit: "req/day", budget: 50000, trend: -1.1, icon: Wifi, color: "text-trust-safe" },
];

const AI_MODEL_COSTS = [
  { model: "gemini-2.5-flash", calls: 847, tokens: 124000, cents: 142, pct: 33 },
  { model: "gpt-5-mini", calls: 312, tokens: 89000, cents: 118, pct: 28 },
  { model: "gemini-2.5-pro", calls: 45, tokens: 67000, cents: 98, pct: 23 },
  { model: "gpt-5-nano", calls: 1200, tokens: 45000, cents: 42, pct: 10 },
  { model: "gemini-2.5-flash-lite", calls: 2100, tokens: 31000, cents: 28, pct: 6 },
];

const COST_HISTORY = [
  { date: "Apr 9", ai: 510, compute: 150, storage: 22, bandwidth: 31 },
  { date: "Apr 10", ai: 480, compute: 148, storage: 22, bandwidth: 29 },
  { date: "Apr 11", ai: 445, compute: 152, storage: 23, bandwidth: 32 },
  { date: "Apr 12", ai: 462, compute: 149, storage: 23, bandwidth: 30 },
  { date: "Apr 13", ai: 438, compute: 150, storage: 24, bandwidth: 31 },
  { date: "Apr 14", ai: 420, compute: 151, storage: 24, bandwidth: 28 },
  { date: "Apr 15", ai: 428, compute: 150, storage: 24, bandwidth: 30 },
];

const EFFICIENCY_METRICS = [
  { label: "Cache Hit Rate", value: "73%", target: "80%", status: "improving", icon: Zap },
  { label: "Avg Cost/Request", value: "$0.0034", target: "<$0.005", status: "on-track", icon: DollarSign },
  { label: "Waste Rate", value: "4.2%", target: "<5%", status: "on-track", icon: AlertTriangle },
  { label: "Model Downgrade Savings", value: "$1.42/day", target: ">$1.00", status: "exceeding", icon: TrendingDown },
];

export default function FCC07PlatformCostCapacity() {
  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        icon={DollarSign}
        title="Platform Cost & Capacity"
        subtitle="Unified view of AI, compute, storage, and bandwidth economics"
        accent="trust"
      />

      {/* Cost Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {([] as any[]).map((item, i) => {
          const Icon = item.icon;
          const usage = item.unit === "GB" ? (item.value / item.budget) * 100 : (item.value / item.budget) * 100;
          const isPositive = item.trend < 0;
          return (
            <motion.div key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-white/10 bg-white/[0.03] backdrop-blur-xl">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg bg-white/[0.05] ${item.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <div className={`flex items-center gap-0.5 text-[10px] ${isPositive ? "text-trust-safe" : "text-sita-gold"}`}>
                      {isPositive ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                      {Math.abs(item.trend)}%
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-display">
                      {item.unit === "cents" || item.unit === "cents/mo" ? `$${(item.value / 100).toFixed(2)}` : `${item.value} ${item.unit}`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      of {item.unit === "cents" || item.unit === "cents/mo" ? `$${(item.budget / 100).toFixed(2)}` : `${item.budget} ${item.unit}`} budget
                    </p>
                  </div>
                  <Progress value={Math.min(usage, 100)} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground">{Math.round(usage)}% utilized</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Tabs defaultValue="ai" className="space-y-4">
        <TabsList className="bg-white/[0.03] border border-white/10">
          <TabsTrigger value="ai">AI Costs</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          <TabsTrigger value="history">Cost History</TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Model Breakdown */}
            <Card className="border-white/10 bg-white/[0.02]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" /> Cost by Model
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {AI_MODEL_COSTS.map((m, i) => (
                  <motion.div key={m.model} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono font-medium">{m.model}</span>
                          <span className="text-xs font-medium">${(m.cents / 100).toFixed(2)}</span>
                        </div>
                        <Progress value={m.pct} className="h-1" />
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                          <span>{m.calls} calls</span>
                          <span>{(m.tokens / 1000).toFixed(0)}k tokens</span>
                          <span>{m.pct}% of spend</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Cost Optimization */}
            <Card className="border-white/10 bg-white/[0.02]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-sita-gold" /> Optimization Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { title: "Downgrade 23 low-risk tasks from Pro to Flash", savings: "$0.86/day", confidence: 92, risk: "low" },
                  { title: "Enable response caching for repeated queries", savings: "$0.54/day", confidence: 88, risk: "low" },
                  { title: "Batch similar inference requests", savings: "$0.32/day", confidence: 78, risk: "medium" },
                  { title: "Reduce max_tokens for classification tasks", savings: "$0.21/day", confidence: 85, risk: "low" },
                ].map((opp, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <p className="text-xs font-medium">{opp.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-[9px] text-trust-safe border-trust-safe/20">Save {opp.savings}</Badge>
                      <Badge variant="outline" className="text-[9px]">Confidence: {opp.confidence}%</Badge>
                      <Badge variant="outline" className={`text-[9px] ${opp.risk === "low" ? "text-trust-safe" : "text-sita-gold"}`}>Risk: {opp.risk}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="efficiency">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {EFFICIENCY_METRICS.map((m, i) => {
              const Icon = m.icon;
              const statusColor = m.status === "exceeding" ? "text-trust-safe" : m.status === "on-track" ? "text-sita-gold" : "text-primary";
              return (
                <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="border-white/10 bg-white/[0.02]">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{m.label}</span>
                      </div>
                      <p className="text-2xl font-bold font-display">{m.value}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">Target: {m.target}</span>
                        <Badge variant="outline" className={`text-[9px] ${statusColor}`}>{m.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-white/10 bg-white/[0.02]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Daily Cost Breakdown (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {COST_HISTORY.map((day, i) => {
                  const total = day.ai + day.compute + day.storage + day.bandwidth;
                  return (
                    <div key={day.date} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                      <span className="text-xs font-mono w-14 text-muted-foreground">{day.date}</span>
                      <div className="flex-1 flex h-3 rounded-full overflow-hidden">
                        <div className="bg-primary/60" style={{ width: `${(day.ai / total) * 100}%` }} />
                        <div className="bg-sita-gold/60" style={{ width: `${(day.compute / total) * 100}%` }} />
                        <div className="bg-accent/60" style={{ width: `${(day.storage / total) * 100}%` }} />
                        <div className="bg-trust-safe/60" style={{ width: `${(day.bandwidth / total) * 100}%` }} />
                      </div>
                      <span className="text-xs font-medium w-14 text-right">${(total / 100).toFixed(2)}</span>
                    </div>
                  );
                })}
                <div className="flex items-center gap-4 pt-2 justify-center text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-primary/60" /> AI</span>
                  <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-sita-gold/60" /> Compute</span>
                  <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-accent/60" /> Storage</span>
                  <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-trust-safe/60" /> Bandwidth</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
