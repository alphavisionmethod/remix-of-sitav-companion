// ═══════════════════════════════════════════════════════════════
// SITA OS — Cost Spotlight Board
// Canonical empty-state at /admin/health/cost-spotlight.
// Adopts PremiumEmptyState primitive. Preview chart is rendered
// for shape education ONLY and is unmistakably labeled non-live.
// ═══════════════════════════════════════════════════════════════
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  DollarSign,
  ArrowRight,
  Activity,
  Wallet,
  Receipt,
  Eye,
  Sparkles,
} from "lucide-react";

const SAMPLE_PREVIEW = [
  { day: "Mon", cost: 3.2 },
  { day: "Tue", cost: 4.1 },
  { day: "Wed", cost: 3.8 },
  { day: "Thu", cost: 5.4 },
  { day: "Fri", cost: 4.7 },
  { day: "Sat", cost: 2.9 },
  { day: "Sun", cost: 3.5 },
];

const LIVE_DESTINATIONS: Array<{ label: string; path: string; reason: string }> = [
  {
    label: "Budget Center",
    path: "/admin/ai-runtime?tab=budget",
    reason: "Live caps, current daily spend, alert state",
  },
  {
    label: "Usage Ledger",
    path: "/admin/aig/usage-ledger",
    reason: "Per-invocation token + cost ledger (live)",
  },
  {
    label: "Cost Efficiency",
    path: "/admin/ai-runtime?tab=cost",
    reason: "Cost-to-value scoreboard (live)",
  },
  {
    label: "System Health",
    path: "/admin/health",
    reason: "Live runtime health context",
  },
];

export default function CostSpotlight() {
  const navigate = useNavigate();
  // Honest collection counter — current implementation has no historical
  // 7-day cost rollup yet, so we report 0 of 7 explicitly.
  const daysCollected = 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4 text-primary" />
              Cost Spotlight
              <Badge variant="secondary" className="text-[10px]">
                Preview · Non-live
              </Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground max-w-2xl">
              7-day cost trend board. Historical aggregation is still accumulating — current
              window has {daysCollected} of 7 days collected. Live cost telemetry is fully
              available now via the canonical destinations below.
            </p>
          </div>
          <Badge variant="outline" className="text-[10px]">
            window · {daysCollected}/7 days
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <PremiumEmptyState
            variant="demo-preview"
            icon={Activity}
            domain="business"
            title="7-day cost history is still accumulating"
            description="Live cost data already exists in Budget Center, Usage Ledger, and Cost Efficiency. This board becomes useful after multiple days of cost rollups have been collected."
            tip="Budget Center and Usage Ledger contain live cost data right now."
            actions={[
              {
                label: "Open Budget Center",
                icon: Wallet,
                onClick: () => navigate("/admin/ai-runtime?tab=budget"),
              },
              {
                label: "Open Usage Ledger",
                icon: Receipt,
                variant: "secondary",
                onClick: () => navigate("/admin/aig/usage-ledger"),
              },
            ]}
          />

          {/* Preview-shape education chart — explicitly labeled non-live, sample data only */}
          <div className="relative rounded-lg border border-dashed border-muted-foreground/40 bg-muted/30 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  Preview · sample data · non-live
                </span>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                shape only — not real spend
              </Badge>
            </div>
            <p className="mb-3 text-[11px] text-muted-foreground">
              The chart below illustrates how this board will render once historical cost rollups
              accumulate. Numbers are illustrative — they do not reflect actual spend.
            </p>
            <div className="h-40 w-full opacity-70">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SAMPLE_PREVIEW}>
                  <defs>
                    <linearGradient id="costPreview" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      fontSize: 11,
                    }}
                    formatter={(v: number) => [`$${v.toFixed(2)} (preview)`, "Sample"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="cost"
                    stroke="hsl(var(--primary))"
                    fill="url(#costPreview)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              Once {7 - daysCollected} more days of rollups land, this preview is replaced with
              live cost evidence — no UI change required.
            </div>
          </div>

          <div className="rounded-lg border bg-card/40 p-4">
            <div className="mb-3 text-xs font-medium uppercase text-muted-foreground">
              Live cost destinations (fully populated right now)
            </div>
            <div className="flex flex-wrap gap-2">
              {LIVE_DESTINATIONS.map((d) => (
                <Link key={d.path} to={d.path} title={d.reason}>
                  <Button type="button" size="sm" variant="outline">
                    <ArrowRight className="mr-1 h-3 w-3" />
                    {d.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
