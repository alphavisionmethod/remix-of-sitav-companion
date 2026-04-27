// ════════════════════════════════════════════════════════════
// Trust Center — Coverage (Phase 6)
// Static visualization of the trust action registry, rendered
// as the owner-facing counterpart to the CI coverage script.
// Read-only by design: this page documents *what* the Trust
// layer enforces, not where it currently has gaps.
// ════════════════════════════════════════════════════════════

import { ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { TRUST_ACTION_LIST, type TrustActionPreset } from "@/platform/trust";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const RISK_ORDER: Record<TrustActionPreset["riskTier"], number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const riskStyles: Record<TrustActionPreset["riskTier"], string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/30",
  high: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  medium: "bg-primary/10 text-primary border-primary/30",
  low: "bg-muted text-muted-foreground border-border",
};

export default function TrustCoverage() {
  const sorted = [...TRUST_ACTION_LIST].sort(
    (a, b) => RISK_ORDER[a.riskTier] - RISK_ORDER[b.riskTier],
  );

  const byPillar = sorted.reduce<Record<string, TrustActionPreset[]>>((acc, a) => {
    (acc[a.pillar] ??= []).push(a);
    return acc;
  }, {});

  const totalApprovalGated = sorted.filter((a) => a.requireApproval).length;
  const totalIrreversible = sorted.filter((a) => !a.reversible).length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="flex items-start justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-semibold">Trust Coverage</h1>
            <p className="text-muted-foreground">
              Every mutation registered with the Trust layer, grouped by pillar.
            </p>
          </div>
        </div>
        <PageTruthBanner truthState="partial" />
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Registered actions</div>
          <div className="text-2xl font-semibold mt-1">{sorted.length}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Approval-gated</div>
          <div className="text-2xl font-semibold mt-1">{totalApprovalGated}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Irreversible</div>
          <div className="text-2xl font-semibold mt-1">{totalIrreversible}</div>
        </div>
      </div>

      {Object.entries(byPillar).map(([pillar, actions]) => (
        <section key={pillar} className="mb-6">
          <h2 className="text-lg font-semibold capitalize mb-2">{pillar}</h2>
          <div className="rounded-lg border bg-card divide-y">
            {actions.map((a) => (
              <div key={a.key} className="p-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="text-xs font-mono">{a.key}</code>
                    <span
                      className={`text-[10px] uppercase px-2 py-0.5 rounded-full border ${riskStyles[a.riskTier]}`}
                    >
                      risk: {a.riskTier}
                    </span>
                    {a.requireApproval ? (
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 inline-flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> approval
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> auto
                      </span>
                    )}
                    {!a.reversible && (
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                        irreversible
                      </span>
                    )}
                  </div>
                  <div className="text-sm mt-1">{a.label}</div>
                  <div className="text-xs text-muted-foreground">{a.description}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <footer className="text-xs text-muted-foreground">
        Source of truth: <code>src/modules/_trust/registry/trust-action-registry.ts</code>
      </footer>
    </div>
  );
}