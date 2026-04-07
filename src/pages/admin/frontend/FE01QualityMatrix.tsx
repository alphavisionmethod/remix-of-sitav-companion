import { BarChart3, Star, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
import { useDataMode } from "@/contexts/DataModeContext";
  ROUTE_FAMILY_QUALITY,
  FLAGSHIP_LOOP_READINESS,
  STATE_MATURITY,
  MISSING_TO_WORLD_CLASS,
  computeFrontendQualityScore,
} from "@/lib/services/frontend/frontend-quality-engine";

const tierBadge = (tier: string) => {
  switch (tier) {
    case 'world_class': return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">World Class</Badge>;
    case 'premium_ready': return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Premium Ready</Badge>;
    case 'needs_polish': return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Needs Polish</Badge>;
    case 'admin_clutter_risk': return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Clutter Risk</Badge>;
    default: return <Badge variant="secondary">{tier.replace(/_/g, ' ')}</Badge>;
  }
};

export default function FE01QualityMatrix() {
  const { isDemoMode } = useDataMode();
  const score = computeFrontendQualityScore();

  return (
    <div className="space-y-6 p-6" data-testid="fe01-quality-matrix">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" /> FE01 — Frontend Quality Matrix
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Route-family UX quality, flagship loop readiness, state maturity, and missing-to-world-class gaps
        </p>
      </div>

      {/* Overall Scores */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {[
          { label: 'Overall', value: score.overall },
          { label: 'Beauty', value: score.beauty },
          { label: 'Clarity', value: score.clarity },
          { label: 'Trust', value: score.trust },
          { label: 'Accessibility', value: score.accessibility },
          { label: 'Responsiveness', value: score.responsiveness },
          { label: 'State Design', value: score.stateDesign },
          { label: 'Copy', value: score.copy },
          { label: 'Premium Feel', value: score.premiumFeel },
          { label: 'State Maturity', value: score.stateMaturity },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
              <Progress value={value} className="mt-1 h-1" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Route Family Quality */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-4 w-4" /> Route Family UX Quality
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ROUTE_FAMILY_QUALITY.map((fam) => (
            <div key={fam.family} className="p-3 rounded-lg bg-card border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{fam.family}</span>
                {tierBadge(fam.overallTier)}
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground mb-2">
                <span>Beauty: {fam.beautyScore}</span>
                <span>Clarity: {fam.clarityScore}</span>
                <span>Trust: {fam.trustScore}</span>
                <span>Premium: {fam.premiumFeel}</span>
              </div>
              {fam.gaps.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {fam.gaps.map((g, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{g}</Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Flagship Loop Readiness */}
      <Card>
        <CardHeader>
          <CardTitle>Flagship Loop Readiness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {FLAGSHIP_LOOP_READINESS.map((loop) => (
            <div key={loop.name} className="p-3 rounded-lg bg-card border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{loop.name}</span>
                {tierBadge(loop.overallReadiness)}
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-2">
                <span>First Impression: {loop.firstImpressionScore}</span>
                <span>Flow Clarity: {loop.flowClarityScore}</span>
                <span>Premium: {loop.premiumFeelScore}</span>
              </div>
              {loop.criticalFixes.length > 0 && (
                <div className="flex items-start gap-1 mt-1">
                  <AlertTriangle className="h-3 w-3 text-yellow-400 mt-0.5 shrink-0" />
                  <span className="text-xs text-yellow-400">{loop.criticalFixes.join(' · ')}</span>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* State Maturity */}
      <Card>
        <CardHeader>
          <CardTitle>State Design Maturity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {STATE_MATURITY.map((s) => (
              <div key={s.stateType} className="flex items-center gap-3">
                <div className="w-20 text-sm font-medium">{s.stateType}</div>
                <Progress value={s.maturityScore} className="flex-1 h-2" />
                <span className="text-xs text-muted-foreground w-20 text-right">
                  {s.implementedCount}/{s.totalNeeded} ({s.maturityScore}%)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Missing to World Class */}
      <Card>
        <CardHeader>
          <CardTitle>Missing-to-World-Class</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {MISSING_TO_WORLD_CLASS.map((entry) => (
            <div key={entry.domain} className="p-3 rounded-lg bg-card border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{entry.domain}</span>
                {tierBadge(entry.currentQuality)}
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground mb-2">
                <span>Beauty: {entry.beautyGap}</span>
                <span>Clarity: {entry.clarityGap}</span>
                <span>Trust: {entry.trustGap}</span>
                <span>A11y: {entry.accessibilityGap}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {entry.exactFixes.map((fix, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{fix}</Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
