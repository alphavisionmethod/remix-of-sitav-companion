// ════════════════════════════════════════════════════════════
// SITA OS — Action Authority Panel (Phase 2)
// Per-action authority editor. Renders the trust_action_catalog
// grouped by pillar, lets the user override default behavior
// per action (suggest / ask / pre-approved / blocked), and
// reverts to defaults on demand.
// ════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { ShieldCheck, ShieldAlert, ShieldQuestion, ShieldX, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useTrustActionCatalog,
  useMyAuthoritySettings,
  useSetActionAuthority,
  useClearActionAuthority,
  type TrustCatalogRow,
} from "../authority/use-authority";
import type { AuthorityLevel } from "../registry/trust-action-registry";

const LEVEL_META: Record<AuthorityLevel, { label: string; tone: string; icon: typeof ShieldCheck }> = {
  suggest: { label: "Suggest only", tone: "text-muted-foreground", icon: ShieldQuestion },
  ask: { label: "Ask before acting", tone: "text-amber-500", icon: ShieldAlert },
  pre_approved: { label: "Pre-approved", tone: "text-emerald-500", icon: ShieldCheck },
  blocked: { label: "Blocked", tone: "text-destructive", icon: ShieldX },
};

const RISK_TONE: Record<TrustCatalogRow["risk_tier"], string> = {
  low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  high: "bg-orange-500/10 text-orange-600 border-orange-500/30",
  critical: "bg-destructive/10 text-destructive border-destructive/30",
};

const PILLAR_LABEL: Record<string, string> = {
  business: "Business OS",
  finance: "Finance OS",
  concierge: "Concierge OS",
  health: "Health OS",
  shared: "Shared",
};

export function ActionAuthorityPanel() {
  const catalog = useTrustActionCatalog();
  const overrides = useMyAuthoritySettings();
  const setAuthority = useSetActionAuthority();
  const clearAuthority = useClearActionAuthority();

  const overrideMap = useMemo(() => {
    const m = new Map<string, AuthorityLevel>();
    (overrides.data ?? []).forEach((o) => m.set(o.action_key, o.authority_level));
    return m;
  }, [overrides.data]);

  const grouped = useMemo(() => {
    const g = new Map<string, TrustCatalogRow[]>();
    (catalog.data ?? []).forEach((r) => {
      const arr = g.get(r.pillar) ?? [];
      arr.push(r);
      g.set(r.pillar, arr);
    });
    return Array.from(g.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [catalog.data]);

  if (catalog.isLoading) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Loading action catalog…
      </div>
    );
  }
  if (catalog.error) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        Could not load action catalog: {(catalog.error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map(([pillar, rows]) => (
        <section key={pillar}>
          <header className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">{PILLAR_LABEL[pillar] ?? pillar}</h3>
            <span className="text-xs text-muted-foreground">{rows.length} actions</span>
          </header>
          <div className="rounded-lg border bg-card divide-y">
            {rows.map((row) => {
              const override = overrideMap.get(row.action_key);
              const effective = (override ?? row.default_authority_level) as AuthorityLevel;
              const meta = LEVEL_META[effective];
              const Icon = meta.icon;
              return (
                <div key={row.action_key} className="p-3 flex items-start gap-3 flex-wrap md:flex-nowrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">{row.label}</span>
                      <Badge variant="outline" className={`text-[10px] uppercase ${RISK_TONE[row.risk_tier]}`}>
                        {row.risk_tier}
                      </Badge>
                      {!row.reversible && (
                        <Badge variant="outline" className="text-[10px] uppercase bg-muted/50">irreversible</Badge>
                      )}
                      {override && (
                        <Badge variant="outline" className="text-[10px] uppercase bg-primary/10 text-primary border-primary/30">
                          override
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{row.description}</p>
                    <p className="text-[11px] text-muted-foreground/70 mt-1 font-mono">{row.action_key}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Icon className={`h-4 w-4 ${meta.tone}`} aria-hidden />
                    <Select
                      value={effective}
                      onValueChange={(v) =>
                        setAuthority.mutate({ actionKey: row.action_key, level: v as AuthorityLevel })
                      }
                    >
                      <SelectTrigger className="h-8 w-[170px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(LEVEL_META) as AuthorityLevel[]).map((lvl) => (
                          <SelectItem key={lvl} value={lvl} className="text-xs">
                            {LEVEL_META[lvl].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {override && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Revert to system default"
                        onClick={() => clearAuthority.mutate(row.action_key)}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}