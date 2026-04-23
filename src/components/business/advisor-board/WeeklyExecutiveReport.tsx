// ═══════════════════════════════════════════════════════════════
// SITA OS — Weekly Executive Report
// AI-generated comprehensive weekly performance summary
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, TrendingUp, TrendingDown, Target, Shield, Brain, Loader2, RefreshCw, Award, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { AnimatedConfidenceRing } from "./AnimatedConfidenceRing";
import { SparklineChart } from "./SparklineChart";
import type { ProfitabilityBrief } from "@/domains/engines/business-profitability-engine";
import type { ProfitLoopSummary } from "@/domains/engines/continuous-profit-engine";
import type { ReflectionSummary } from "@/domains/engines/advisor-reflection-engine";
import ReactMarkdown from "react-markdown";
import { useDataMode } from "@/contexts/DataModeContext";

interface Props {
  brief: ProfitabilityBrief;
  profitSummary: ProfitLoopSummary;
  reflectionSummary: ReflectionSummary;
}

interface WeeklyReport {
  executiveSummary: string;
  wins: string[];
  losses: string[];
  patterns: string[];
  advisorAccuracy: { advisorId: string; accuracy: number; insight: string }[];
  nextWeekPriorities: string[];
  riskChanges: string[];
}

const REPORT: WeeklyReport = {
  executiveSummary: "This week saw **positive momentum** in pipeline development with 3 new qualified leads, offset by continued aging on the Atlas Corp invoice. Cash position is stable but requires attention on receivables. Client health improved for Nova Inc but Meridian LLC remains at risk. Overall business health: **steady with upside potential** if invoice collection and lead follow-up are prioritized.",
  wins: [
    "Closed $8,400 deal with Nova Inc — fastest close this quarter",
    "Lead response time improved from 18hrs to 4hrs average",
    "Successfully re-engaged Cascade Group after 35 days dormant",
    "Subscription audit identified $720/yr in savings",
  ],
  losses: [
    "Atlas Corp invoice still overdue at 15 days — no resolution",
    "Lost James Morton lead after 45 days without meaningful follow-up",
    "Implementation margin dropped to 40% on project XYZ",
  ],
  patterns: [
    "Leads contacted within 24hrs have 3x higher conversion rate",
    "Tuesday and Thursday are highest productivity days",
    "Client satisfaction dips correlate with > 14 days without contact",
    "Projects scoped under $10K have consistently lower margins",
  ],
  advisorAccuracy: [
    { advisorId: "revenue-advisor", accuracy: 82, insight: "Revenue predictions were 82% accurate. Pipeline estimates slightly optimistic." },
    { advisorId: "client-success-advisor", accuracy: 91, insight: "Churn risk predictions were highly accurate — Meridian flag was correct." },
    { advisorId: "financial-advisor", accuracy: 78, insight: "Cash flow estimates were conservative. Actual runway 10% better than projected." },
    { advisorId: "ops-advisor", accuracy: 85, insight: "Task completion predictions accurate. Blocked workflow resolution slower than expected." },
  ],
  nextWeekPriorities: [
    "Resolve Atlas Corp $12,500 overdue invoice — escalate to decision-maker",
    "Follow up on $24,000 and $8,500 open quotes",
    "Schedule quarterly review with Meridian LLC",
    "Fill 15 hours of open calendar with revenue-generating activities",
  ],
  riskChanges: [
    "⬆️ Client concentration risk increased — Atlas Corp now 35% of revenue",
    "⬇️ Lead flow risk decreased — 3 new qualified leads entered pipeline",
    "→ Cash runway stable at 120 days",
    "⬆️ Operational risk slightly up — 2 blocked workflows unresolved",
  ],
};

export function WeeklyExecutiveReport({ brief, profitSummary, reflectionSummary }: Props) {
  const [report, setReport] = useState<WeeklyReport>(REPORT);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("advisor-weekly-report", {
        body: {
          brief: {
            healthScore: brief.healthScore,
            cashPressure: brief.cashPressure,
            topLeaks: brief.topLeaks.slice(0, 5),
          },
          profitSummary: {
            totalAtRisk: profitSummary.totalAtRisk,
            totalRecovered: profitSummary.totalRecovered,
            unresolvedSignals: profitSummary.unresolvedSignals,
            learnings: profitSummary.learnings,
          },
          reflection: {
            totalEntries: reflectionSummary.totalEntries,
            wins: reflectionSummary.wins,
            misses: reflectionSummary.misses,
            advisorAccuracy: reflectionSummary.advisorAccuracy,
          },
        },
      });
      if (!error && data?.report) {
        setReport(data.report);
      }
    } catch {
      // Keep mock data on error
    } finally {
      setIsGenerating(false);
    }
  };

  // Sparkline mock data
  const revenueSparkline = [38, 41, 39, 42, 40, 44, 42, 45];
  const healthSparkline = [65, 68, 62, 70, 72, 68, 74, brief.healthScore.overall];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[hsl(265_55%_58%)]" />
          <h3 className="text-sm font-display font-bold text-foreground">Weekly Executive Report</h3>
          <Badge variant="outline" className="text-[8px] px-1.5 py-0 border-[hsl(38_85%_58%)] text-[hsl(38_85%_58%)]">
            Week of {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-[10px] h-7"
          onClick={generateReport}
          disabled={isGenerating}
        >
          {isGenerating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <RefreshCw className="h-3 w-3 mr-1" />}
          {isGenerating ? "Generating..." : "Refresh Report"}
        </Button>
      </div>

      {/* Health Overview with Sparklines */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Business Health", value: brief.healthScore.overall, sparkline: healthSparkline, color: "hsl(152 55% 48%)" },
          { label: "Revenue Trend", value: Math.round(profitSummary.totalRecovered / 100), sparkline: revenueSparkline, color: "hsl(265 55% 58%)" },
          { label: "At Risk", value: profitSummary.totalAtRisk, prefix: "$", sparkline: [15, 18, 22, 20, 25, 28, 24, profitSummary.totalAtRisk / 1000], color: "hsl(0 65% 50%)" },
          { label: "Signals", value: profitSummary.unresolvedSignals, sparkline: [3, 4, 5, 4, 6, 5, 7, profitSummary.unresolvedSignals], color: "hsl(38 85% 58%)" },
        ].map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)]">
              <CardContent className="p-3">
                <p className="text-[9px] text-muted-foreground mb-1">{metric.label}</p>
                <div className="flex items-end justify-between">
                  <span className="text-lg font-display font-bold" style={{ color: metric.color }}>
                    {metric.prefix ?? ""}{typeof metric.value === "number" && metric.value > 999 ? `${(metric.value / 1000).toFixed(1)}K` : metric.value}
                  </span>
                  <SparklineChart data={metric.sparkline} width={60} height={20} color={metric.color} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Executive Summary */}
      <Card className="border-[hsl(265_55%_58%/0.12)] bg-gradient-to-br from-[hsl(265_55%_58%/0.04)] to-transparent">
        <CardContent className="p-4">
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Executive Summary</h4>
          <div className="text-[11px] text-foreground/90 leading-relaxed prose prose-sm prose-invert max-w-none [&_strong]:text-foreground">
            <ReactMarkdown>{report.executiveSummary}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Wins & Losses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="border-[hsl(152_55%_48%/0.12)] bg-[hsl(152_55%_48%/0.03)]">
          <CardHeader className="pb-1">
            <div className="flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-[hsl(152_55%_48%)]" />
              <CardTitle className="text-[11px] font-display text-[hsl(152_55%_48%)]">Wins</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {report.wins.map((win, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                className="flex items-start gap-1.5">
                <TrendingUp className="h-3 w-3 text-[hsl(152_55%_48%)] mt-0.5 flex-shrink-0" />
                <span className="text-[10px] text-foreground/80">{win}</span>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-[hsl(0_65%_50%/0.12)] bg-[hsl(0_65%_50%/0.03)]">
          <CardHeader className="pb-1">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-[hsl(0_65%_50%)]" />
              <CardTitle className="text-[11px] font-display text-[hsl(0_65%_50%)]">Losses & Misses</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {report.losses.map((loss, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                className="flex items-start gap-1.5">
                <TrendingDown className="h-3 w-3 text-[hsl(0_65%_50%)] mt-0.5 flex-shrink-0" />
                <span className="text-[10px] text-foreground/80">{loss}</span>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Advisor Accuracy */}
      <Card className="border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)]">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-1.5">
            <Brain className="h-3.5 w-3.5 text-[hsl(265_55%_58%)]" />
            <CardTitle className="text-[11px] font-display">Advisor Accuracy</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {report.advisorAccuracy.map((aa, i) => (
              <motion.div
                key={aa.advisorId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="text-center"
              >
                <AnimatedConfidenceRing value={aa.accuracy} size={56} strokeWidth={4} />
                <p className="text-[9px] font-medium text-foreground mt-1">{aa.advisorId.replace("-advisor", "")}</p>
                <p className="text-[8px] text-muted-foreground mt-0.5 line-clamp-2">{aa.insight}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Patterns & Priorities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)]">
          <CardHeader className="pb-1">
            <CardTitle className="text-[11px] font-display">Patterns Detected</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {report.patterns.map((p, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <div className="w-1 h-1 rounded-full bg-[hsl(265_55%_58%)] mt-1.5 flex-shrink-0" />
                <span className="text-[10px] text-foreground/80">{p}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)]">
          <CardHeader className="pb-1">
            <div className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-[hsl(38_85%_58%)]" />
              <CardTitle className="text-[11px] font-display">Next Week Priorities</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {report.nextWeekPriorities.map((p, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-[9px] font-bold text-[hsl(38_85%_58%)] flex-shrink-0">{i + 1}.</span>
                <span className="text-[10px] text-foreground/80">{p}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
