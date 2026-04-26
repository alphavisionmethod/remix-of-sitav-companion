// truth-allow: ia-config
import { useNavigate } from "react-router-dom";
import { Brain, Target, AlertTriangle, TrendingUp, TrendingDown, Plus, ChevronRight, Calendar, Heart, Activity } from "lucide-react";
import { SAMPLE_THESES, getInstrument } from "@/hooks/useInvestmentOfficeData";
import { useInvestmentThesisEntries } from "@/hooks/use-investment-office";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
export default function ThesisJournal() {
  const { data: liveData, isLoading } = useInvestmentThesisEntries();
  const navigate = useNavigate();

  const thesisDrivenCount = ([] as any[]).filter(e => e.convictionType === "thesis-driven").length;
  const fomoCount = ([] as any[]).filter(e => e.fomoFlag).length;
  const avgConfidence = (([] as any[]).reduce((s, e) => s + e.confidence, 0) / ([] as any[]).length).toFixed(1);
  const stressCounts = { low: ([] as any[]).filter(e => e.stressLevel === "low").length, moderate: ([] as any[]).filter(e => e.stressLevel === "moderate").length, high: ([] as any[]).filter(e => e.stressLevel === "high").length };
  const dominantStress = Object.entries(stressCounts).sort((a, b) => b[1] - a[1])[0][0];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Brain className="h-6 w-6 text-primary" /> Thesis & Journal</h1>
          <p className="text-sm text-muted-foreground mt-1">Investment ideas, rationale, reviews, and emotional discipline</p>
        </div>
        <button className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Thesis
        </button>
      </div>

      {/* Emotional Patterns Summary */}
      <div className="rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/5 via-card to-card p-5">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <Heart className="h-3.5 w-3.5 text-primary" /> Emotional Trading Patterns
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl bg-card border border-border p-3">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase">Avg Confidence</p>
            <p className="text-xl font-bold text-foreground">{avgConfidence}<span className="text-xs text-muted-foreground">/5</span></p>
          </div>
          <div className="rounded-xl bg-card border border-border p-3">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase">Thesis-Driven</p>
            <p className="text-xl font-bold text-[hsl(var(--trust-safe))]">{thesisDrivenCount}<span className="text-xs text-muted-foreground">/{([] as any[]).length}</span></p>
          </div>
          <div className="rounded-xl bg-card border border-border p-3">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase">FOMO Detections</p>
            <p className="text-xl font-bold text-destructive">{fomoCount}</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-3">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase">Dominant Stress</p>
            <p className={`text-xl font-bold capitalize ${dominantStress === "low" ? "text-[hsl(var(--trust-safe))]" : dominantStress === "moderate" ? "text-[hsl(var(--trust-warn))]" : "text-destructive"}`}>{dominantStress}</p>
          </div>
        </div>
      </div>

      {/* Thesis Cards */}
      <div className="space-y-4">
        {SAMPLE_THESES.map(th => {
          const inst = getInstrument(th.instrumentId);
          const emotionalTag = ([] as any[]).find(e => e.symbol === inst?.symbol);
          return (
            <div key={th.id} className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-start gap-4">
                {inst && <span className="text-3xl">{inst.logoIcon}</span>}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">{th.title}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium capitalize ${
                      th.conviction === "high" ? "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" :
                      th.conviction === "medium" ? "bg-primary/10 text-primary" :
                      "bg-secondary text-muted-foreground"
                    }`}>{th.conviction} conviction</span>
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">{th.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    <Calendar className="h-3 w-3" /> {th.timeHorizon} · Created {th.createdAt} · Updated {th.updatedAt}
                  </p>
                </div>
                {inst && (
                  <button onClick={() => navigate(`/investments/instrument/${inst.id}`)}
                    className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    View {inst.symbol} <ChevronRight className="h-3 w-3 inline" />
                  </button>
                )}
              </div>

              <p className="text-sm text-foreground leading-relaxed">{th.rationale}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Price Levels */}
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Price Levels</p>
                  <div className="space-y-1.5 text-xs">
                    {th.entryPrice && <div className="flex justify-between"><span className="text-muted-foreground">Entry</span><span className="text-foreground">${th.entryPrice}</span></div>}
                    {th.targetPrice && <div className="flex justify-between"><span className="text-muted-foreground">Target</span><span className="text-[hsl(var(--trust-safe))]">${th.targetPrice}</span></div>}
                    {th.stopLoss && <div className="flex justify-between"><span className="text-muted-foreground">Stop Loss</span><span className="text-destructive">${th.stopLoss}</span></div>}
                    {inst && <div className="flex justify-between"><span className="text-muted-foreground">Current</span><span className="font-medium text-foreground">${inst.price}</span></div>}
                  </div>
                </div>

                {/* Assumptions */}
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Key Assumptions</p>
                  <ul className="space-y-1">
                    {th.assumptions.map((a, i) => (
                      <li key={i} className="text-[11px] text-foreground flex items-start gap-1.5">
                        <span className="text-primary mt-0.5">•</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risk Factors */}
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-destructive uppercase tracking-wider flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Risk Factors</p>
                  <ul className="space-y-1">
                    {th.riskFactors.map((r, i) => (
                      <li key={i} className="text-[11px] text-foreground flex items-start gap-1.5">
                        <span className="text-destructive mt-0.5">•</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Catalyst Expectations */}
              {th.catalystExpectations.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <p className="text-[10px] font-semibold text-accent uppercase tracking-wider">Catalyst Expectations</p>
                  <div className="flex flex-wrap gap-2">
                    {th.catalystExpectations.map((c, i) => (
                      <span key={i} className="rounded-lg bg-accent/10 px-2.5 py-1 text-[10px] font-medium text-accent">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Emotional Profile */}
              {emotionalTag && (
                <div className="pt-3 border-t border-border space-y-2">
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
                    <Activity className="h-3 w-3" /> Emotional Profile — {emotionalTag.date}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {/* Confidence bar */}
                    <div className="flex items-center gap-1.5 rounded-lg bg-secondary/30 px-2.5 py-1">
                      <span className="text-[9px] font-semibold text-muted-foreground">Confidence</span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(n => (
                          <div key={n} className={`h-2.5 w-2.5 rounded-sm ${n <= emotionalTag.confidence ? "bg-primary" : "bg-border"}`} />
                        ))}
                      </div>
                    </div>
                    {/* Stress */}
                    <span className={`rounded-lg px-2.5 py-1 text-[10px] font-medium ${
                      emotionalTag.stressLevel === "low" ? "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" :
                      emotionalTag.stressLevel === "moderate" ? "bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))]" :
                      "bg-destructive/10 text-destructive"
                    }`}>Stress: {emotionalTag.stressLevel}</span>
                    {/* Urgency */}
                    <span className={`rounded-lg px-2.5 py-1 text-[10px] font-medium ${
                      emotionalTag.urgency === "patient" ? "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" :
                      emotionalTag.urgency === "moderate" ? "bg-secondary text-muted-foreground" :
                      "bg-destructive/10 text-destructive"
                    }`}>Urgency: {emotionalTag.urgency}</span>
                    {/* Conviction type */}
                    <span className={`rounded-lg px-2.5 py-1 text-[10px] font-medium ${
                      emotionalTag.convictionType === "thesis-driven" ? "bg-primary/10 text-primary" :
                      emotionalTag.convictionType === "reactive" ? "bg-destructive/10 text-destructive" :
                      "bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))]"
                    }`}>{emotionalTag.convictionType}</span>
                    {/* FOMO */}
                    {emotionalTag.fomoFlag && (
                      <span className="rounded-lg bg-destructive/10 px-2.5 py-1 text-[10px] font-bold text-destructive">⚠ FOMO Detected</span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground italic leading-relaxed">"{emotionalTag.emotionNote}"</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
