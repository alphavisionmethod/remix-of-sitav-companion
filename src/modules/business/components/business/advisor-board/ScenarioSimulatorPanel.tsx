// ═══════════════════════════════════════════════════════════════
// SITA OS — Scenario Simulator Panel
// "What if" analysis with visual impact projections
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, TrendingUp, TrendingDown, AlertTriangle, Zap, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { BUSINESS_ADVISORS } from "@/domains/engines/business-advisor-personas";
import { AnimatedConfidenceRing } from "./AnimatedConfidenceRing";
import { SparklineChart } from "./SparklineChart";

interface ScenarioPreset {
  id: string;
  label: string;
  emoji: string;
  description: string;
  impacts: ScenarioImpact[];
  advisorOpinions: { advisorId: string; stance: "support" | "warn" | "neutral"; reason: string }[];
}

interface ScenarioImpact {
  metric: string;
  currentValue: number;
  projectedValue: number;
  unit: string;
  direction: "up" | "down" | "neutral";
  confidence: number;
}

const PRESETS: ScenarioPreset[] = [
  {
    id: "raise-prices", label: "Raise Prices 15%", emoji: "💰", description: "Increase all service pricing by 15%",
    impacts: [
      { metric: "Monthly Revenue", currentValue: 42000, projectedValue: 48300, unit: "$", direction: "up", confidence: 72 },
      { metric: "Client Retention", currentValue: 92, projectedValue: 85, unit: "%", direction: "down", confidence: 65 },
      { metric: "Profit Margin", currentValue: 38, projectedValue: 48, unit: "%", direction: "up", confidence: 80 },
      { metric: "New Client Rate", currentValue: 4, projectedValue: 3, unit: "/mo", direction: "down", confidence: 55 },
    ],
    advisorOpinions: [
      { advisorId: "revenue-advisor", stance: "support", reason: "Revenue increase outweighs potential churn. Current pricing is below market." },
      { advisorId: "client-success-advisor", stance: "warn", reason: "Risk of losing price-sensitive clients. Recommend grandfather existing clients." },
      { advisorId: "ceo-advisor", stance: "support", reason: "Margin improvement is critical for sustainability. Phase the increase." },
    ],
  },
  {
    id: "lose-top-client", label: "Lose Top Client", emoji: "⚠️", description: "If Atlas Corp ($48K/yr) churns",
    impacts: [
      { metric: "Annual Revenue", currentValue: 504000, projectedValue: 456000, unit: "$", direction: "down", confidence: 95 },
      { metric: "Cash Runway", currentValue: 120, projectedValue: 95, unit: "days", direction: "down", confidence: 85 },
      { metric: "Team Utilization", currentValue: 85, projectedValue: 70, unit: "%", direction: "down", confidence: 75 },
      { metric: "Revenue Concentration", currentValue: 35, projectedValue: 28, unit: "% risk", direction: "up", confidence: 90 },
    ],
    advisorOpinions: [
      { advisorId: "revenue-advisor", stance: "warn", reason: "Must accelerate pipeline to backfill. Need 2-3 new clients within 60 days." },
      { advisorId: "financial-advisor", stance: "warn", reason: "Cash reserves adequate for 3 months but reduce discretionary spending immediately." },
      { advisorId: "strategist-advisor", stance: "neutral", reason: "Reduces concentration risk. Use as catalyst to diversify revenue streams." },
    ],
  },
  {
    id: "hire-employee", label: "Hire New Employee", emoji: "👤", description: "Add a full-time team member at $65K/yr",
    impacts: [
      { metric: "Monthly Burn", currentValue: 18000, projectedValue: 23400, unit: "$", direction: "up", confidence: 95 },
      { metric: "Capacity", currentValue: 100, projectedValue: 133, unit: "%", direction: "up", confidence: 85 },
      { metric: "Revenue Ceiling", currentValue: 42000, projectedValue: 56000, unit: "$/mo", direction: "up", confidence: 60 },
      { metric: "Break-Even", currentValue: 0, projectedValue: 90, unit: "days", direction: "up", confidence: 70 },
    ],
    advisorOpinions: [
      { advisorId: "ops-advisor", stance: "support", reason: "Current capacity is maxed. Hire will unlock $14K/mo in potential revenue." },
      { advisorId: "financial-advisor", stance: "warn", reason: "Need 3 months runway buffer. Wait until pipeline is confirmed." },
      { advisorId: "ceo-advisor", stance: "neutral", reason: "Timing depends on pipeline confidence. Consider contractor first." },
    ],
  },
  {
    id: "cut-marketing", label: "Cut Marketing Budget", emoji: "✂️", description: "Reduce marketing spend by 50%",
    impacts: [
      { metric: "Monthly Costs", currentValue: 18000, projectedValue: 16200, unit: "$", direction: "down", confidence: 95 },
      { metric: "Lead Flow", currentValue: 28, projectedValue: 16, unit: "/mo", direction: "down", confidence: 70 },
      { metric: "Pipeline Value", currentValue: 180000, projectedValue: 110000, unit: "$", direction: "down", confidence: 65 },
      { metric: "Profit Margin", currentValue: 38, projectedValue: 42, unit: "%", direction: "up", confidence: 80 },
    ],
    advisorOpinions: [
      { advisorId: "revenue-advisor", stance: "warn", reason: "Lead flow reduction will compound over 60-90 days. Pipeline will suffer." },
      { advisorId: "financial-advisor", stance: "support", reason: "Short-term savings improve runway. Can restore when revenue stabilizes." },
      { advisorId: "strategist-advisor", stance: "warn", reason: "Cutting growth investment during expansion is risky. Optimize instead of cutting." },
    ],
  },
];

export function ScenarioSimulatorPanel() {
  const [activeScenario, setActiveScenario] = useState<ScenarioPreset | null>(null);
  const [customParam, setCustomParam] = useState(50);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <FlaskConical className="h-4 w-4 text-[hsl(265_55%_58%)]" />
        <h3 className="text-sm font-display font-bold text-foreground">Scenario Simulator</h3>
        <Badge variant="outline" className="text-[8px] px-1.5 py-0 border-[hsl(38_85%_58%)] text-[hsl(38_85%_58%)]">
          What If
        </Badge>
      </div>
      <p className="text-[10px] text-muted-foreground -mt-2">
        Model business decisions before committing. See projected impact and advisor consensus.
      </p>

      {/* Preset Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {PRESETS.map(preset => (
          <motion.div key={preset.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card
              className={`cursor-pointer transition-all duration-200 h-full ${
                activeScenario?.id === preset.id
                  ? "border-[hsl(265_55%_58%)] bg-[hsl(265_55%_58%/0.08)] shadow-[0_0_16px_hsl(265_55%_58%/0.12)]"
                  : "border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] hover:border-[hsl(0_0%_100%/0.12)]"
              }`}
              onClick={() => setActiveScenario(activeScenario?.id === preset.id ? null : preset)}
            >
              <CardContent className="p-3">
                <div className="text-xl mb-1.5">{preset.emoji}</div>
                <h4 className="text-[11px] font-semibold text-foreground mb-0.5">{preset.label}</h4>
                <p className="text-[9px] text-muted-foreground line-clamp-2">{preset.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Scenario Results */}
      <AnimatePresence mode="wait">
        {activeScenario && (
          <motion.div
            key={activeScenario.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {/* Impact Projections */}
            <Card className="border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-display">Impact Projections</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {activeScenario.impacts.map((impact, i) => {
                  const delta = impact.projectedValue - impact.currentValue;
                  const deltaPercent = ((delta / Math.max(impact.currentValue, 1)) * 100).toFixed(1);
                  const isPositive = impact.direction === "up" && delta > 0;
                  const isNegative = impact.direction === "down" || (impact.direction === "up" && delta < 0);
                  const color = isPositive ? "hsl(152 55% 48%)" : isNegative ? "hsl(0 65% 50%)" : "hsl(38 85% 58%)";

                  return (
                    <motion.div
                      key={impact.metric}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="text-center p-2 rounded-lg bg-[hsl(0_0%_100%/0.02)]"
                    >
                      <p className="text-[9px] text-muted-foreground mb-1">{impact.metric}</p>
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <span className="text-[10px] text-muted-foreground line-through">
                          {impact.unit === "$" ? "$" : ""}{impact.currentValue.toLocaleString()}{impact.unit !== "$" ? impact.unit : ""}
                        </span>
                        <span className="text-xs font-bold" style={{ color }}>
                          {impact.unit === "$" ? "$" : ""}{impact.projectedValue.toLocaleString()}{impact.unit !== "$" ? impact.unit : ""}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-0.5">
                        {delta > 0 ? <TrendingUp className="h-2.5 w-2.5" style={{ color }} /> :
                         delta < 0 ? <TrendingDown className="h-2.5 w-2.5" style={{ color }} /> :
                         <Minus className="h-2.5 w-2.5" style={{ color }} />}
                        <span className="text-[8px] font-medium" style={{ color }}>
                          {delta > 0 ? "+" : ""}{deltaPercent}%
                        </span>
                      </div>
                      <div className="mt-1">
                        <AnimatedConfidenceRing value={impact.confidence} size={36} strokeWidth={3} sublabel="" />
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Advisor Consensus */}
            <Card className="border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-display">Advisor Consensus</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {activeScenario.advisorOpinions.map((opinion, i) => {
                  const advisor = BUSINESS_ADVISORS.find(a => a.id === opinion.advisorId);
                  const stanceColors = {
                    support: { bg: "hsl(152 55% 48% / 0.08)", border: "hsl(152 55% 48% / 0.2)", text: "hsl(152 55% 48%)", label: "Supports" },
                    warn: { bg: "hsl(38 85% 58% / 0.08)", border: "hsl(38 85% 58% / 0.2)", text: "hsl(38 85% 58%)", label: "Warns" },
                    neutral: { bg: "hsl(0 0% 100% / 0.03)", border: "hsl(0 0% 100% / 0.08)", text: "hsl(0 0% 60%)", label: "Neutral" },
                  };
                  const style = stanceColors[opinion.stance];

                  return (
                    <motion.div
                      key={opinion.advisorId}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg"
                      style={{ backgroundColor: style.bg, borderColor: style.border, border: "1px solid" }}
                    >
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[hsl(0_0%_100%/0.06)] flex items-center justify-center text-sm">
                        {advisor?.emoji ?? "🤖"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-semibold text-foreground">{advisor?.displayName ?? opinion.advisorId}</span>
                          <Badge variant="outline" className="text-[7px] px-1 py-0" style={{ borderColor: style.text, color: style.text }}>
                            {style.label}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{opinion.reason}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}