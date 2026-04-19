// ═══════════════════════════════════════════════════════════════
// SITA OS — Economic Governance + UX Trust + Future-Surface Truth Panel
// Mounted on AI Engineer hub. Displays per-user ceilings, calm-mode,
// agency microcopy compliance, and future-surface containment status.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Wallet, Sparkles, Archive } from "lucide-react";

interface CeilingRow {
  user_id: string;
  daily_cost_cents_cap: number;
  monthly_cost_cents_cap: number;
}

interface DecisionAggregate {
  decision: string;
  count: number;
}

export default function EconomicTrustFutureTruthPanel() {
  const [ceilings, setCeilings] = useState<CeilingRow[]>([]);
  const [decisions, setDecisions] = useState<DecisionAggregate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [{ data: c }, { data: d }] = await Promise.all([
          supabase.from("ai_user_hard_ceilings").select("user_id, daily_cost_cents_cap, monthly_cost_cents_cap").limit(50),
          supabase.from("ai_budget_decision_receipts").select("decision").limit(500),
        ]);
        if (!mounted) return;
        setCeilings((c as CeilingRow[]) ?? []);
        const counts: Record<string, number> = {};
        for (const row of (d as { decision: string }[]) ?? []) {
          counts[row.decision] = (counts[row.decision] ?? 0) + 1;
        }
        setDecisions(Object.entries(counts).map(([decision, count]) => ({ decision, count })));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Wallet className="size-4 text-primary" />
            Per-user AI budget ceilings
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{loading ? "…" : ceilings.length} users with explicit ceilings</Badge>
            <Badge variant="outline">RPC: check_user_hard_ceiling</Badge>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {decisions.map((d) => (
              <Badge key={d.decision} variant={d.decision === "block" ? "destructive" : d.decision === "degrade" ? "secondary" : "default"}>
                {d.decision}: {d.count}
              </Badge>
            ))}
            {decisions.length === 0 && !loading && (
              <span className="text-muted-foreground">No decision receipts yet</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="size-4 text-primary" />
            UX trust posture
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="default" className="gap-1">
              <ShieldCheck className="size-3" /> Calm mode = default
            </Badge>
            <Badge variant="outline">Agency microcopy canonicalized</Badge>
            <Badge variant="outline">Forbidden-phrase scan active</Badge>
          </div>
          <p className="text-muted-foreground">
            AppearanceContext, FirstBootSetup, and personalization-engine all default to <code>calm</code>.
            Forbidden phrases (e.g. "AI autonomously", "workforce is acting") are gated by validator.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Archive className="size-4 text-primary" />
            Future-surface containment
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">demo_only</Badge>
            <Badge variant="outline">future_vision</Badge>
            <Badge variant="outline">archived</Badge>
            <Badge variant="secondary">excludedFromLaunchScoring</Badge>
          </div>
          <p className="text-muted-foreground">
            Mobile-native, wearable, ambient, and continuity surfaces are explicitly excluded from launch scoring.
            All entries render <code>DemoOnlyBanner</code> or <code>FutureVisionBadge</code> at runtime.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
