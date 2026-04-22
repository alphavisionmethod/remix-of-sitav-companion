// ═══════════════════════════════════════════════════════════════
// SITA OS — Predictive Analysis Dashboard
// Anomaly detection, trend analysis, failure prediction
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
import { useDataMode } from "@/contexts/DataModeContext";
  TrendingUp, TrendingDown, AlertTriangle, Activity, Brain,
  Zap, Clock, Shield, Eye, Target, Gauge, BarChart3,
  ArrowUpRight, ArrowDownRight, Minus, RefreshCw, Cpu,
  Flame, Thermometer, Radio, ChevronRight,
} from "lucide-react";

// ── Types ───────────────────────────────────────────────────────

interface PredictionSignal {
  id: string;
  agentId: string;
  agentName: string;
  type: "failure" | "degradation" | "cost-spike" | "latency" | "capacity" | "trust-drift";
  severity: "critical" | "high" | "medium" | "low";
  probability: number;
  timeToEvent: string;
  description: string;
  recommendation: string;
  trend: "rising" | "falling" | "stable";
  confidence: number;
  dataPoints: number;
  detectedAt: number;
}

interface TrendMetric {
  timestamp: string;
  value: number;
  predicted: number;
  anomaly?: boolean;
  upperBound: number;
  lowerBound: number;
}

interface AnomalyEvent {
  id: string;
  timestamp: number;
  metric: string;
  actual: number;
  expected: number;
  deviation: number;
  service: string;
  autoResolved: boolean;
}

// ── Mock Data ───────────────────────────────────────────────────

const MOCK_PREDICTIONS: PredictionSignal[] = [
  {
    id: "pred-1", agentId: "aw-connector-health", agentName: "Connector Health Agent",
    type: "failure", severity: "high", probability: 0.82, timeToEvent: "~4 hours",
    description: "Plaid API error rate trending toward circuit breaker threshold",
    recommendation: "Pre-emptively switch to fallback connector or increase retry budget",
    trend: "rising", confidence: 0.91, dataPoints: 2400, detectedAt: Date.now() - 1800000,
  },
  {
    id: "pred-2", agentId: "aw-cost-guardrail", agentName: "Cost Guardrail Agent",
    type: "cost-spike", severity: "medium", probability: 0.67, timeToEvent: "~8 hours",
    description: "Token consumption accelerating — projected to exceed daily budget by 23%",
    recommendation: "Consider switching non-critical agents to lighter model tier",
    trend: "rising", confidence: 0.78, dataPoints: 1800, detectedAt: Date.now() - 3600000,
  },
  {
    id: "pred-3", agentId: "aw-latency-optimizer", agentName: "Latency Optimizer",
    type: "latency", severity: "medium", probability: 0.58, timeToEvent: "~12 hours",
    description: "P99 latency creeping upward — cache hit ratio declining by 2%/hr",
    recommendation: "Schedule cache warm-up or increase cache TTL for stable queries",
    trend: "rising", confidence: 0.72, dataPoints: 3600, detectedAt: Date.now() - 7200000,
  },
  {
    id: "pred-4", agentId: "aw-fleet-health", agentName: "Fleet Health Agent",
    type: "capacity", severity: "low", probability: 0.41, timeToEvent: "~2 days",
    description: "Memory utilization growing linearly — may reach 85% threshold",
    recommendation: "Monitor — auto-scale will trigger at 80%, but pre-scaling is safer",
    trend: "stable", confidence: 0.65, dataPoints: 4800, detectedAt: Date.now() - 14400000,
  },
  {
    id: "pred-5", agentId: "aw-permission-drift", agentName: "Permission Drift Agent",
    type: "trust-drift", severity: "high", probability: 0.73, timeToEvent: "~6 hours",
    description: "3 agents operating near autonomy ceiling — drift pattern matches past incidents",
    recommendation: "Review autonomy levels and reset agents operating above policy bounds",
    trend: "rising", confidence: 0.85, dataPoints: 960, detectedAt: Date.now() - 5400000,
  },
];

function generateTrendData(): TrendMetric[] {
  const data: TrendMetric[] = [];
  let val = 45;
  for (let i = 0; i < 48; i++) {
    const noise = (Math.random() - 0.5) * 8;
    val = Math.max(10, Math.min(95, val + noise + (i > 36 ? 1.5 : 0)));
    const predicted = val + (Math.random() - 0.3) * 4;
    data.push({
      timestamp: `${Math.floor(i / 2)}:${i % 2 === 0 ? "00" : "30"}`,
      value: Math.round(val * 10) / 10,
      predicted: Math.round(predicted * 10) / 10,
      anomaly: i === 29 || i === 42,
      upperBound: Math.round((val + 15) * 10) / 10,
      lowerBound: Math.round(Math.max(0, val - 15) * 10) / 10,
    });
  }
  return data;
}

const MOCK_ANOMALIES: AnomalyEvent[] = [
  { id: "a-1", timestamp: Date.now() - 900000, metric: "Error Rate", actual: 4.2, expected: 0.8, deviation: 425, service: "Plaid Connector", autoResolved: false },
  { id: "a-2", timestamp: Date.now() - 3600000, metric: "Response Time", actual: 2800, expected: 450, deviation: 522, service: "Brain Core", autoResolved: true },
  { id: "a-3", timestamp: Date.now() - 7200000, metric: "Token Usage", actual: 45000, expected: 28000, deviation: 61, service: "Business Advisor", autoResolved: false },
  { id: "a-4", timestamp: Date.now() - 14400000, metric: "Cache Miss Rate", actual: 35, expected: 12, deviation: 192, service: "Projections", autoResolved: true },
  { id: "a-5", timestamp: Date.now() - 28800000, metric: "Queue Depth", actual: 890, expected: 120, deviation: 642, service: "Event Bus", autoResolved: true },
];

// ── Components ──────────────────────────────────────────────────

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/20",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  low: "bg-blue-500/15 text-blue-400 border-blue-500/20",
};

const TYPE_ICONS: Record<string, typeof Activity> = {
  failure: Flame, degradation: TrendingDown, "cost-spike": BarChart3,
  latency: Clock, capacity: Gauge, "trust-drift": Shield,
};

function PredictionCard({ signal }: { signal: PredictionSignal }) {
  const Icon = TYPE_ICONS[signal.type] || AlertTriangle;
  const TrendIcon = signal.trend === "rising" ? ArrowUpRight : signal.trend === "falling" ? ArrowDownRight : Minus;
  const trendColor = signal.trend === "rising" ? "text-destructive" : signal.trend === "falling" ? "text-trust-safe" : "text-muted-foreground";
  const timeAgo = Math.round((Date.now() - signal.detectedAt) / 60000);
  const timeLabel = timeAgo < 60 ? `${timeAgo}m ago` : `${Math.round(timeAgo / 60)}h ago`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border p-4 transition-all hover:shadow-md",
        signal.severity === "critical" ? "border-destructive/25 bg-destructive/3" :
        signal.severity === "high" ? "border-orange-500/20 bg-orange-500/3" :
        "border-border/50 bg-card/50"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          signal.severity === "critical" ? "bg-destructive/15" : signal.severity === "high" ? "bg-orange-500/15" : "bg-primary/10"
        )}>
          <Icon className={cn("h-4 w-4",
            signal.severity === "critical" ? "text-destructive" : signal.severity === "high" ? "text-orange-400" : "text-primary"
          )} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-foreground">{signal.agentName}</span>
            <Badge variant="outline" className={cn("text-[8px] px-1.5 py-0 h-4 border", SEVERITY_COLORS[signal.severity])}>
              {signal.severity}
            </Badge>
            <div className={cn("flex items-center gap-0.5 text-[9px]", trendColor)}>
              <TrendIcon className="h-2.5 w-2.5" />{signal.trend}
            </div>
          </div>

          <p className="text-[11px] text-foreground/90 mb-2">{signal.description}</p>

          <div className="flex items-center gap-4 text-[9px] text-muted-foreground mb-2">
            <span className="flex items-center gap-1">
              <Target className="h-2.5 w-2.5" />{(signal.probability * 100).toFixed(0)}% probability
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />ETA: {signal.timeToEvent}
            </span>
            <span className="flex items-center gap-1">
              <Brain className="h-2.5 w-2.5" />{(signal.confidence * 100).toFixed(0)}% confidence
            </span>
            <span className="flex items-center gap-1">
              <Activity className="h-2.5 w-2.5" />{signal.dataPoints.toLocaleString()} samples
            </span>
          </div>

          {/* Probability bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between text-[9px] mb-0.5">
              <span className="text-muted-foreground">Failure Probability</span>
              <span className={cn("font-bold",
                signal.probability > 0.7 ? "text-destructive" : signal.probability > 0.5 ? "text-accent" : "text-trust-safe"
              )}>{(signal.probability * 100).toFixed(0)}%</span>
            </div>
            <Progress value={signal.probability * 100} className="h-1.5" />
          </div>

          <div className="rounded-lg bg-secondary/30 border border-border/30 p-2">
            <p className="text-[10px] text-muted-foreground">
              <span className="font-semibold text-foreground">Recommendation:</span> {signal.recommendation}
            </p>
          </div>

          <p className="text-[9px] text-muted-foreground/60 mt-1.5">Detected {timeLabel} • Type: {signal.type}</p>
        </div>
      </div>
    </motion.div>
  );
}

function AnomalyRow({ anomaly }: { anomaly: AnomalyEvent }) {
  const timeAgo = Math.round((Date.now() - anomaly.timestamp) / 60000);
  const timeLabel = timeAgo < 60 ? `${timeAgo}m ago` : `${Math.round(timeAgo / 60)}h ago`;

  return (
    <div className={cn(
      "flex items-center gap-3 rounded-lg border p-3 transition-all",
      anomaly.autoResolved ? "border-border/30 bg-card/30" : "border-accent/20 bg-accent/3"
    )}>
      <Thermometer className={cn("h-4 w-4 shrink-0", anomaly.autoResolved ? "text-muted-foreground" : "text-accent")} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">{anomaly.metric}</span>
          <span className="text-[9px] text-muted-foreground">in {anomaly.service}</span>
          {anomaly.autoResolved && (
            <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 border-trust-safe/20 text-trust-safe">auto-resolved</Badge>
          )}
        </div>
        <p className="text-[9px] text-muted-foreground mt-0.5">
          Expected: {anomaly.expected} • Actual: {anomaly.actual} • Deviation: +{anomaly.deviation}%
        </p>
      </div>
      <span className="text-[9px] text-muted-foreground shrink-0">{timeLabel}</span>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────

export function PredictiveAnalysisDashboard() {
  const [selectedView, setSelectedView] = useState<"predictions" | "trends" | "anomalies">("predictions");
  const trendData = useMemo(() => generateTrendData(), []);

  const stats = useMemo(() => ({
    totalPredictions: (isDemoMode ? MOCK_PREDICTIONS : [] as typeof MOCK_PREDICTIONS).length,
    highRisk: (isDemoMode ? MOCK_PREDICTIONS : [] as typeof MOCK_PREDICTIONS).filter(p => p.probability > 0.7).length,
    avgConfidence: Math.round((isDemoMode ? MOCK_PREDICTIONS : [] as typeof MOCK_PREDICTIONS).reduce((s, p) => s + p.confidence, 0) / (isDemoMode ? MOCK_PREDICTIONS : [] as typeof MOCK_PREDICTIONS).length * 100),
    anomaliesDetected: (isDemoMode ? MOCK_ANOMALIES : [] as typeof MOCK_ANOMALIES).length,
    autoResolved: (isDemoMode ? MOCK_ANOMALIES : [] as typeof MOCK_ANOMALIES).filter(a => a.autoResolved).length,
  }), []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-primary/15 bg-gradient-to-r from-primary/5 via-card to-card p-5"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-foreground font-display">Predictive Analysis Engine</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              ML-driven anomaly detection, failure prediction, and trend forecasting across all agents and services.
              Signals are generated from rolling windows of telemetry data with statistical confidence bounds.
            </p>
          </div>
          <Badge variant="outline" className="text-[9px] border-trust-safe/20 text-trust-safe shrink-0">
            <Radio className="h-2.5 w-2.5 mr-1" />Live
          </Badge>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { label: "Active Predictions", value: stats.totalPredictions, color: "text-foreground" },
          { label: "High Risk", value: stats.highRisk, color: "text-destructive" },
          { label: "Avg Confidence", value: `${stats.avgConfidence}%`, color: "text-primary" },
          { label: "Anomalies (24h)", value: stats.anomaliesDetected, color: "text-accent" },
          { label: "Auto-Resolved", value: stats.autoResolved, color: "text-trust-safe" },
        ].map(m => (
          <div key={m.label} className="rounded-xl border border-border/40 bg-card/40 p-2.5 text-center">
            <p className={cn("font-display text-lg font-bold", m.color)}>{m.value}</p>
            <p className="text-[9px] text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      {/* View Switcher */}
      <div className="flex gap-1.5">
        {([
          { key: "predictions", label: "Failure Predictions", icon: Target },
          { key: "trends", label: "Trend Forecasts", icon: TrendingUp },
          { key: "anomalies", label: "Anomaly Log", icon: Thermometer },
        ] as const).map(v => (
          <button key={v.key} onClick={() => setSelectedView(v.key)}
            className={cn(
              "flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full border transition-all",
              selectedView === v.key
                ? "bg-primary/15 text-primary border-primary/30"
                : "border-border/30 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            <v.icon className="h-3 w-3" />{v.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {selectedView === "predictions" && (
          <motion.div key="predictions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {(isDemoMode ? MOCK_PREDICTIONS : [] as typeof MOCK_PREDICTIONS).sort((a, b) => b.probability - a.probability).map(p => (
              <PredictionCard key={p.id} signal={p} />
            ))}
          </motion.div>
        )}

        {selectedView === "trends" && (
          <motion.div key="trends" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Error Rate Forecast */}
            <div className="rounded-xl border border-border/50 bg-card/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-xs font-bold text-foreground">Error Rate Forecast (24h)</h4>
                  <p className="text-[9px] text-muted-foreground">Actual vs predicted with confidence bounds</p>
                </div>
                <Badge variant="outline" className="text-[8px] border-accent/20 text-accent">
                  <AlertTriangle className="h-2.5 w-2.5 mr-1" />Anomalies detected
                </Badge>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                  <Area type="monotone" dataKey="upperBound" stroke="none" fill="hsl(var(--primary))" fillOpacity={0.05} />
                  <Area type="monotone" dataKey="lowerBound" stroke="none" fill="hsl(var(--background))" fillOpacity={1} />
                  <Line type="monotone" dataKey="predicted" stroke="hsl(var(--primary))" strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--foreground))" strokeWidth={2} dot={(props: any) => {
                    const entry = trendData[props.index];
                    if (!entry?.anomaly) return <circle key={props.index} cx={0} cy={0} r={0} />;
                    return <circle key={props.index} cx={props.cx} cy={props.cy} r={5} fill="hsl(var(--destructive))" stroke="hsl(var(--card))" strokeWidth={2} />;
                  }} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-2 text-[9px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-0.5 w-4 bg-foreground inline-block rounded" />Actual</span>
                <span className="flex items-center gap-1"><span className="h-0.5 w-4 bg-primary inline-block rounded border-dashed" style={{ borderTop: "1px dashed" }} />Predicted</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive inline-block" />Anomaly</span>
                <span className="flex items-center gap-1"><span className="h-2 w-4 bg-primary/10 inline-block rounded" />Confidence Band</span>
              </div>
            </div>

            {/* Capacity Forecast */}
            <div className="rounded-xl border border-border/50 bg-card/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-xs font-bold text-foreground">Capacity Utilization Forecast</h4>
                  <p className="text-[9px] text-muted-foreground">Projected resource usage with threshold markers</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                  <ReferenceLine y={80} stroke="hsl(var(--accent))" strokeDasharray="4 4" label={{ value: "Threshold", fontSize: 9, fill: "hsl(var(--accent))" }} />
                  <ReferenceLine y={95} stroke="hsl(var(--destructive))" strokeDasharray="4 4" label={{ value: "Critical", fontSize: 9, fill: "hsl(var(--destructive))" }} />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {selectedView === "anomalies" && (
          <motion.div key="anomalies" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <div className="rounded-lg border border-border/30 bg-secondary/10 p-3 mb-3">
              <p className="text-[10px] text-muted-foreground">
                <Eye className="h-3 w-3 inline mr-1 -mt-0.5" />
                Anomalies are detected using rolling z-score analysis over 6-hour windows.
                Events with deviation &gt;3σ are flagged. Auto-resolution triggers when metrics return to 1σ within 15 minutes.
              </p>
            </div>
            {(isDemoMode ? MOCK_ANOMALIES : [] as typeof MOCK_ANOMALIES).map(a => <AnomalyRow key={a.id} anomaly={a} />)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
