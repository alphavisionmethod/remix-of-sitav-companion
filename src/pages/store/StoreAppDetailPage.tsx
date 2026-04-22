// ═══════════════════════════════════════════════════════════════
// SITA OS — Internal App Detail Page
// ═══════════════════════════════════════════════════════════════

import { useParams, useNavigate } from "react-router-dom";
import { SitaSectionHeader } from "@/components/sita/SitaCard";
import { resolveIcon, TierBadge, PackCard } from "@/components/sita/PackStoreComponents";
import { INTERNAL_APPS, PACK_CATALOG } from "@/lib/pack-store";
import { ArrowLeft, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const AppDetailPage = () => {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();

  const app = INTERNAL_APPS.find(a => a.app_id === appId);
  if (!app) {
    return (
      <div className="mx-auto max-w-4xl">
<button onClick={() => navigate("/store")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Store
        </button>
        <div className="text-center py-20">
          <p className="text-lg font-medium text-foreground">App not found</p>
        </div>
      </div>
    );
  }

  const Icon = resolveIcon(app.icon);
  const relatedPacks = PACK_CATALOG.filter(p => app.packs_that_affect.includes(p.pack_id));

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <button onClick={() => navigate("/store")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Store
      </button>

      {/* Hero */}
      <div className={cn("relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br", app.gradient)}>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <Icon className="h-8 w-8 text-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">{app.name}</h1>
              <p className="text-sm text-white/70">{app.subtitle}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-white/50 capitalize">{app.domain} domain</span>
                {app.premium && <TierBadge tier="premium" />}
                <span className={cn("text-[10px] font-medium rounded-full px-2 py-0.5", app.default_enabled ? "bg-trust-safe/20 text-trust-safe" : "bg-white/15 text-white/70")}>
                  {app.default_enabled ? "Default" : "Optional"}
                </span>
              </div>
            </div>
          </div>
          <p className="text-sm text-white/80 max-w-lg leading-relaxed">{app.description}</p>
        </div>
        <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Workflows */}
          {app.workflows_included.length > 0 && (
            <div className="space-y-3">
              <SitaSectionHeader title="Workflows Included" />
              <div className="grid gap-2 sm:grid-cols-2">
                {app.workflows_included.map((w, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                    <Check className="h-3.5 w-3.5 text-trust-safe" />
                    <span className="text-xs text-foreground capitalize">{w.replace(/-/g, " ")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advisors */}
          {app.advisors_powering.length > 0 && (
            <div className="space-y-3">
              <SitaSectionHeader title="Powered by Advisors" />
              <div className="space-y-2">
                {app.advisors_powering.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/10 px-3 py-2">
                    <span className="text-xs font-medium text-foreground">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Proof */}
          {app.proof_implications.length > 0 && (
            <div className="space-y-3">
              <SitaSectionHeader title="Proof & Trust" />
              <div className="space-y-2">
                {app.proof_implications.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-trust-safe" />
                    <span className="capitalize">{p.replace(/-/g, " ")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Open App */}
          <button onClick={() => navigate(app.route)} className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            Open {app.name} <ArrowRight className="h-4 w-4" />
          </button>

          {/* Connectors */}
          {app.connectors_used.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Connectors Used</h4>
              {app.connectors_used.map((c, i) => (
                <p key={i} className="text-xs text-foreground capitalize">{c.replace(/-/g, " ")}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Packs */}
      {relatedPacks.length > 0 && (
        <div className="space-y-3">
          <SitaSectionHeader title="Packs That Enhance This App" subtitle="Install packs to unlock more capabilities" />
          <div className="grid gap-3 sm:grid-cols-2">
            {relatedPacks.map(p => (
              <PackCard key={p.pack_id} pack={p} onClick={() => navigate(`/store/packs/${p.pack_id}`)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppDetailPage;
