// ═══════════════════════════════════════════════════════════════
// SITA OS — Real-Time Business Radar
// Live animated radar with signal tracking and ambient alerts
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio, AlertTriangle, TrendingUp, TrendingDown, Minus, Eye, EyeOff, Bell, ChevronRight,
  Users, DollarSign, Briefcase, Shield, Target, BarChart3, Zap, Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedConfidenceRing } from "./AnimatedConfidenceRing";
import { SparklineChart } from "./SparklineChart";
import type { BusinessSignal, RadarSnapshot, SignalCategory, SignalSeverity } from "@/domains/engines/business-radar-engine";

const CATEGORY_ICONS: Record<SignalCategory, React.ElementType> = {
  lead: Target, client: Users, revenue: DollarSign, cash: DollarSign,
  operations: Briefcase, team: Users, risk: Shield, opportunity: TrendingUp, advisor: Zap,
};

const SEVERITY_COLORS: Record<SignalSeverity, string> = {
  info: "hsl(200 80% 55%)", low: "hsl(152 55% 48%)", medium: "hsl(38 85% 58%)", high: "hsl(0 72% 60%)", critical: "hsl(0 72% 45%)",
};

interface Props {
  snapshot: RadarSnapshot;
  signals: BusinessSignal[];
  onAcknowledge: (signalId: string) => void;
  onAcknowledgeAll: () => void;
  onGenerateSignal: () => void;
}

export function BusinessRadarPanel({ snapshot, signals, onAcknowledge, onAcknowledgeAll, onGenerateSignal }: Props) {
  const [view, setView] = useState<"radar" | "feed">("radar");
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const [pulseActive, setPulseActive] = useState(true);
  const unacknowledged = useMemo(() => signals.filter(s => !s.acknowledged), [signals]);
  const visibleSignals = showAcknowledged ? signals : unacknowledged;

  // Pulse animation cycle
  useEffect(() => {
    const interval = setInterval(() => setPulseActive(p => !p), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {/* ── Header Stats ──────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Overall Health" value={snapshot.overallHealth} unit="%" color="hsl(152 55% 48%)" ring />
        <StatCard label="Active Signals" value={snapshot.totalSignals} color="hsl(265 55% 58%)" />
        <StatCard label="Critical Alerts" value={snapshot.criticalSignals} color="hsl(0 72% 51%)" />
        <StatCard label="Signal Velocity" value={snapshot.signalVelocity} unit="/hr" color="hsl(38 85% 58%)" />
      </div>

      {/* ── View Toggle ───────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant={view === "radar" ? "default" : "ghost"} size="sm" className="text-[10px] h-7" onClick={() => setView("radar")}>
            <Radio className="h-3 w-3 mr-1" /> Radar View
          </Button>
          <Button variant={view === "feed" ? "default" : "ghost"} size="sm" className="text-[10px] h-7" onClick={() => setView("feed")}>
            <Activity className="h-3 w-3 mr-1" /> Signal Feed
            {unacknowledged.length > 0 && <Badge variant="destructive" className="ml-1 text-[8px] h-4 px-1">{unacknowledged.length}</Badge>}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-[10px] h-7" onClick={onGenerateSignal}>
            <Zap className="h-3 w-3 mr-1" /> Simulate Signal
          </Button>
          {unacknowledged.length > 0 && (
            <Button variant="ghost" size="sm" className="text-[10px] h-7" onClick={onAcknowledgeAll}>
              <EyeOff className="h-3 w-3 mr-1" /> Clear All
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === "radar" ? (
          <motion.div key="radar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* ── Animated Radar ─────────────────────────── */}
            <div className="relative mx-auto" style={{ maxWidth: 480, aspectRatio: "1/1" }}>
              <svg viewBox="0 0 480 480" className="w-full h-full">
                {/* Concentric rings */}
                {[180, 140, 100, 60].map((r, i) => (
                  <circle key={r} cx="240" cy="240" r={r} fill="none" stroke="hsl(0 0% 100% / 0.04)" strokeWidth="1" />
                ))}

                {/* Radar sweep */}
                {pulseActive && (
                  <motion.line
                    x1="240" y1="240" x2="240" y2="60"
                    stroke="hsl(265 55% 58% / 0.3)"
                    strokeWidth="2"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: "240px 240px" }}
                  />
                )}

                {/* Sector labels and dots */}
                {snapshot.sectors.map((sector, i) => {
                  const angle = (i / snapshot.sectors.length) * 2 * Math.PI - Math.PI / 2;
                  const labelR = 200;
                  const dotR = 60 + (1 - sector.healthScore / 100) * 120;
                  const x = 240 + Math.cos(angle) * labelR;
                  const y = 240 + Math.sin(angle) * labelR;
                  const dx = 240 + Math.cos(angle) * dotR;
                  const dy = 240 + Math.sin(angle) * dotR;
                  const CatIcon = CATEGORY_ICONS[sector.category];

                  return (
                    <g key={sector.category}>
                      {/* Sector line */}
                      <line x1="240" y1="240" x2={x} y2={y} stroke="hsl(0 0% 100% / 0.06)" strokeWidth="0.5" />
                      
                      {/* Health dot */}
                      <motion.circle
                        cx={dx} cy={dy} r={sector.criticalCount > 0 ? 8 : 5}
                        fill={sector.color}
                        opacity={0.8}
                        animate={{ scale: sector.criticalCount > 0 ? [1, 1.3, 1] : 1 }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />

                      {/* Label */}
                      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill="hsl(0 0% 100% / 0.5)" fontSize="9" fontFamily="Inter">
                        {sector.label}
                      </text>
                      <text x={x} y={y + 12} textAnchor="middle" fill={sector.color} fontSize="10" fontWeight="600" fontFamily="Space Grotesk">
                        {sector.healthScore}%
                      </text>
                    </g>
                  );
                })}

                {/* Center health score */}
                <circle cx="240" cy="240" r="35" fill="hsl(0 0% 5% / 0.8)" stroke="hsl(265 55% 58% / 0.3)" strokeWidth="2" />
                <text x="240" y="236" textAnchor="middle" fill="hsl(152 55% 48%)" fontSize="18" fontWeight="bold" fontFamily="Space Grotesk">
                  {snapshot.overallHealth}
                </text>
                <text x="240" y="252" textAnchor="middle" fill="hsl(0 0% 100% / 0.4)" fontSize="8" fontFamily="Inter">
                  HEALTH
                </text>
              </svg>
            </div>

            {/* Sector cards */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-4">
              {snapshot.sectors.filter(s => s.activeSignals > 0).map(sector => {
                const TrendIcon = sector.trend === "improving" ? TrendingUp : sector.trend === "declining" ? TrendingDown : Minus;
                const CatIcon = CATEGORY_ICONS[sector.category];
                return (
                  <div key={sector.category} className="rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-2 text-center">
                    <CatIcon className="h-3.5 w-3.5 mx-auto mb-1" style={{ color: sector.color }} />
                    <div className="text-[10px] font-medium text-foreground">{sector.label}</div>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <span className="text-[9px]" style={{ color: sector.color }}>{sector.activeSignals}</span>
                      <TrendIcon className="h-2.5 w-2.5" style={{ color: sector.trend === "improving" ? "hsl(152 55% 48%)" : sector.trend === "declining" ? "hsl(0 72% 51%)" : "hsl(0 0% 50%)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" className="text-[10px] h-6" onClick={() => setShowAcknowledged(!showAcknowledged)}>
                {showAcknowledged ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                {showAcknowledged ? "Hide Acknowledged" : "Show All"}
              </Button>
              <span className="text-[9px] text-muted-foreground">{visibleSignals.length} signals</span>
            </div>

            {visibleSignals.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground/50">All signals acknowledged — business is calm</div>
            ) : (
              visibleSignals.slice(0, 30).map(signal => (
                <SignalCard key={signal.id} signal={signal} onAcknowledge={onAcknowledge} />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sub-Components ──────────────────────────────────────────────

function StatCard({ label, value, unit, color, ring }: { label: string; value: number; unit?: string; color: string; ring?: boolean }) {
  return (
    <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3 text-center">
      {ring ? (
        <div className="flex justify-center mb-1">
          <AnimatedConfidenceRing value={value} size={40} strokeWidth={3} />
        </div>
      ) : (
        <div className="text-xl font-display font-bold" style={{ color }}>
          {value}{unit && <span className="text-xs">{unit}</span>}
        </div>
      )}
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

function SignalCard({ signal, onAcknowledge }: { signal: BusinessSignal; onAcknowledge: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const CatIcon = CATEGORY_ICONS[signal.category];
  const DirectionIcon = signal.direction === "positive" ? TrendingUp : signal.direction === "negative" ? TrendingDown : Minus;
  const timeAgo = getTimeAgo(signal.timestamp);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`rounded-xl border p-3 cursor-pointer transition-colors ${
        !signal.acknowledged
          ? "border-[hsl(0_0%_100%/0.1)] bg-[hsl(0_0%_100%/0.03)]"
          : "border-[hsl(0_0%_100%/0.04)] bg-[hsl(0_0%_100%/0.01)] opacity-60"
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${SEVERITY_COLORS[signal.severity]}15` }}>
          <CatIcon className="h-4 w-4" style={{ color: SEVERITY_COLORS[signal.severity] }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground truncate">{signal.title}</span>
            <DirectionIcon className="h-3 w-3 shrink-0" style={{ color: signal.direction === "positive" ? "hsl(152 55% 48%)" : signal.direction === "negative" ? "hsl(0 72% 51%)" : "hsl(0 0% 50%)" }} />
          </div>
          <div className="text-[10px] text-muted-foreground truncate">{signal.description}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {signal.metric && (
            <div className="text-right">
              <div className="text-xs font-display font-bold" style={{ color: SEVERITY_COLORS[signal.severity] }}>
                {signal.metric.unit === "$" ? `$${signal.metric.value.toLocaleString()}` : `${signal.metric.value}${signal.metric.unit}`}
              </div>
              {signal.metric.delta !== undefined && (
                <div className="text-[9px]" style={{ color: signal.metric.delta > 0 ? "hsl(152 55% 48%)" : "hsl(0 72% 51%)" }}>
                  {signal.metric.delta > 0 ? "+" : ""}{signal.metric.delta}{signal.metric.unit}
                </div>
              )}
            </div>
          )}
          <span className="text-[9px] text-muted-foreground/50">{timeAgo}</span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-3 pt-3 border-t border-[hsl(0_0%_100%/0.06)] flex items-center justify-between">
              <div className="text-[10px] text-muted-foreground">
                {signal.suggestedAction && <span className="text-[hsl(265_55%_58%)]">💡 {signal.suggestedAction}</span>}
              </div>
              {!signal.acknowledged && (
                <Button variant="ghost" size="sm" className="text-[10px] h-6" onClick={(e) => { e.stopPropagation(); onAcknowledge(signal.id); }}>
                  <Eye className="h-3 w-3 mr-1" /> Acknowledge
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}
