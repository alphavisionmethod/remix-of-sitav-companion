// ═══════════════════════════════════════════════════════════════
// SITA OS — Integration Streak Panel (Phase 4)
//
// 7-day refresh streak per provider sourced from
// oauth_refresh_probe_results. Each cell renders the canonical
// ConnectorStateBadge (no local color maps).
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectorStateBadge } from "@/components/primitives/status/ConnectorStateBadge";
import { ProvenanceChip } from "@/components/primitives/status/ProvenanceChip";
import { OperatorActionPanel } from "@/components/primitives/actions/OperatorActionPanel";
import { normalizeConnectorState, type ConnectorState } from "@/lib/connectors/connector-state-grammar";

interface ProbeRow {
  provider: string;
  lifecycle_state: string;
  reauth_required: boolean;
  probe_finished_at: string | null;
}

interface DayBucket {
  date: string;        // YYYY-MM-DD
  state: ConnectorState;
  probes: number;
  failures: number;
}

interface ProviderStreak {
  provider: string;
  days: DayBucket[];
  successDays: number;
  totalDays: number;
}

const PROVIDERS = ["google", "microsoft", "slack"];

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function lastSevenDays(): string[] {
  const today = startOfDay(new Date());
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function deriveState(rows: ProbeRow[]): ConnectorState {
  if (rows.length === 0) return "manual";
  if (rows.some((r) => r.reauth_required)) return "reauth_required";
  // Walk worst-of-N
  const worst = rows
    .map((r) => normalizeConnectorState(r.lifecycle_state))
    .reduce((acc, s) => {
      const order: ConnectorState[] = ["connected", "demo_simulated", "degraded", "manual", "reauth_required", "failing"];
      return order.indexOf(s) > order.indexOf(acc) ? s : acc;
    }, "connected" as ConnectorState);
  return worst;
}

export default function IntegrationStreakPanel() {
  const [streaks, setStreaks] = useState<ProviderStreak[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const since = new Date(Date.now() - 7 * 86400000).toISOString();
      const { data } = await supabase
        .from("oauth_refresh_probe_results")
        .select("provider, lifecycle_state, reauth_required, probe_finished_at")
        .gte("probe_started_at", since)
        .order("probe_finished_at", { ascending: false })
        .limit(2000);

      const days = lastSevenDays();
      const result: ProviderStreak[] = PROVIDERS.map((provider) => {
        const provRows = (data ?? []).filter((r: any) => r.provider === provider) as ProbeRow[];
        const buckets: DayBucket[] = days.map((date) => {
          const dayRows = provRows.filter((r) => r.probe_finished_at?.slice(0, 10) === date);
          const state = deriveState(dayRows);
          const failures = dayRows.filter((r) =>
            ["failing", "blocked"].includes(r.lifecycle_state) || r.reauth_required,
          ).length;
          return { date, state, probes: dayRows.length, failures };
        });
        const successDays = buckets.filter((b) => b.state === "connected" && b.probes > 0).length;
        const totalDays = buckets.filter((b) => b.probes > 0).length;
        return { provider, days: buckets, successDays, totalDays };
      });

      if (!cancelled) {
        setStreaks(result);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Worst current state across all providers — drives remediation panel.
  const worstNow: ConnectorState = streaks.reduce<ConnectorState>((acc, s) => {
    const order: ConnectorState[] = ["connected", "demo_simulated", "degraded", "manual", "reauth_required", "failing"];
    const todays = s.days[s.days.length - 1]?.state ?? "manual";
    return order.indexOf(todays) > order.indexOf(acc) ? todays : acc;
  }, "connected");
  const needsRemediation = worstNow === "reauth_required" || worstNow === "failing" || worstNow === "degraded";
  const lastVerifiedAt = streaks
    .flatMap((s) => s.days)
    .filter((d) => d.probes > 0)
    .reduce<string | null>((acc, d) => (d.date > (acc ?? "") ? d.date : acc), null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">7-day refresh streak</CardTitle>
        <p className="text-xs text-muted-foreground">
          Per-provider canonical state (worst-of-day) sourced from token-refresh probes.
        </p>
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <ProvenanceChip
            source="oauth_refresh_probe_results"
            verifiedAt={lastVerifiedAt ? `${lastVerifiedAt}T00:00:00Z` : null}
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-sm text-muted-foreground">Loading streaks…</p>}
        {!loading && streaks.length === 0 && (
          <p className="text-sm text-muted-foreground">No probe data in the last 7 days.</p>
        )}
        {!loading && streaks.length > 0 && (
          <div className="space-y-3">
            {streaks.map((s) => (
              <div key={s.provider} className="flex items-center gap-3">
                <div className="w-24 text-sm font-medium capitalize">{s.provider}</div>
                <div className="flex gap-1 flex-1">
                  {s.days.map((d) => (
                    <div
                      key={d.date}
                      title={`${d.date} · ${d.probes} probes · ${d.failures} failures`}
                      className="flex-1"
                    >
                      <ConnectorStateBadge
                        state={d.probes === 0 ? "manual" : d.state}
                        size="xs"
                        dot={false}
                        label={d.date.slice(5)}
                        className="w-full justify-center"
                      />
                    </div>
                  ))}
                </div>
                <div className="w-20 text-xs text-muted-foreground tabular-nums text-right">
                  {s.successDays}/{s.totalDays} ok
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && needsRemediation && (
          <OperatorActionPanel
            ariaLabel="Connector remediation actions"
            remediation={{
              label: worstNow === "reauth_required" ? "Reauthorize provider" : "Inspect failing provider",
              href: "/admin/integrations",
            }}
            evidence={[
              { label: "Token-refresh probe history", href: "/admin/integrations" },
            ]}
          />
        )}
      </CardContent>
    </Card>
  );
}
