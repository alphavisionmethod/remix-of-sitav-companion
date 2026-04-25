// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 7 EmbeddingBudgetPanel
// Reads `embedding_budget_overview` for the active user and shows
// daily / 30-day rollups of token consumption + estimated cost
// from the embedding pipeline. Class: SURFACE.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins, AlertTriangle, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BudgetRow {
  user_id: string;
  day: string;
  month: string;
  invocations: number;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  estimated_cost_usd: number;
  succeeded: number;
  failed: number;
}

interface BudgetSummary {
  today: { invocations: number; tokens: number; cost: number; failed: number };
  last30d: { invocations: number; tokens: number; cost: number; failed: number };
  byDay: Array<{ day: string; tokens: number; cost: number }>;
}

function isoDay(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

async function fetchBudget(): Promise<BudgetSummary> {
  const sb = supabase as unknown as {
    auth: { getUser: () => Promise<{ data: { user: { id: string } | null } }> };
    from: (t: string) => any;
  };
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return { today: { invocations: 0, tokens: 0, cost: 0, failed: 0 }, last30d: { invocations: 0, tokens: 0, cost: 0, failed: 0 }, byDay: [] };
  }
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const { data, error } = await sb
    .from("embedding_budget_overview")
    .select("*")
    .gte("day", since.toISOString().slice(0, 10))
    .order("day", { ascending: false })
    .limit(60);
  if (error) throw error;
  const rows = (data ?? []) as BudgetRow[];
  const today = isoDay();
  const todayRow = rows.find((r) => r.day === today);
  const sum = rows.reduce(
    (acc, r) => ({
      invocations: acc.invocations + Number(r.invocations || 0),
      tokens: acc.tokens + Number(r.total_tokens || 0),
      cost: acc.cost + Number(r.estimated_cost_usd || 0),
      failed: acc.failed + Number(r.failed || 0),
    }),
    { invocations: 0, tokens: 0, cost: 0, failed: 0 },
  );
  return {
    today: {
      invocations: Number(todayRow?.invocations ?? 0),
      tokens: Number(todayRow?.total_tokens ?? 0),
      cost: Number(todayRow?.estimated_cost_usd ?? 0),
      failed: Number(todayRow?.failed ?? 0),
    },
    last30d: sum,
    byDay: rows.slice(0, 14).map((r) => ({
      day: r.day,
      tokens: Number(r.total_tokens || 0),
      cost: Number(r.estimated_cost_usd || 0),
    })),
  };
}

function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function EmbeddingBudgetPanel() {
  const [data, setData] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchBudget()
      .then((d) => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e?.message ?? "Failed"); setLoading(false); } });
    const id = setInterval(() => {
      fetchBudget().then((d) => { if (!cancelled) setData(d); }).catch(() => {});
    }, 60_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Embedding budget</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-32 w-full" /></CardContent>
      </Card>
    );
  }
  if (error || !data) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Embedding budget</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error ?? "No data"}</p>
        </CardContent>
      </Card>
    );
  }

  const peak = Math.max(1, ...data.byDay.map((d) => d.tokens));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Coins className="h-4 w-4" /> Embedding budget
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Tile label="Today" tokens={data.today.tokens} cost={data.today.cost} invocations={data.today.invocations} />
          <Tile label="Last 30d" tokens={data.last30d.tokens} cost={data.last30d.cost} invocations={data.last30d.invocations} />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Tokens / day (last 14)</span>
            <span>peak {fmtTokens(peak)}</span>
          </div>
          <div className="flex items-end gap-0.5 h-12">
            {data.byDay.slice().reverse().map((d) => {
              const h = Math.max(2, Math.round((d.tokens / peak) * 100));
              return (
                <div
                  key={d.day}
                  title={`${d.day} · ${fmtTokens(d.tokens)} tokens · $${d.cost.toFixed(4)}`}
                  className="flex-1 bg-primary/60 rounded-sm"
                  style={{ height: `${h}%` }}
                />
              );
            })}
            {data.byDay.length === 0 && (
              <p className="text-[11px] text-muted-foreground">No embedding activity yet.</p>
            )}
          </div>
        </div>
        {data.last30d.failed > 0 && (
          <Badge variant="destructive" className="gap-1 text-[10px]">
            <AlertTriangle className="h-3 w-3" /> {data.last30d.failed} failed embeddings (30d)
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

function Tile({ label, tokens, cost, invocations }: { label: string; tokens: number; cost: number; invocations: number }) {
  return (
    <div className="rounded-md border bg-muted/40 p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold leading-tight">{fmtTokens(tokens)}</p>
      <p className="text-[11px] text-muted-foreground">
        ${cost.toFixed(4)} · {invocations} call{invocations === 1 ? "" : "s"}
      </p>
    </div>
  );
}