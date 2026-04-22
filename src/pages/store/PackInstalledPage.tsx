// ═══════════════════════════════════════════════════════════════
// SITA OS — Installed Packs Management Page
// ═══════════════════════════════════════════════════════════════

import { useNavigate } from "react-router-dom";
import { SitaSectionHeader } from "@/components/sita/SitaCard";
import { PackStatusBadge, TierBadge, resolveIcon } from "@/components/sita/PackStoreComponents";
import { getInstalledPacks, getPacksWithUpdates } from "@/lib/pack-store";
import { ArrowLeft, Settings, RefreshCw, Pause, Trash2, Shield, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const PackInstalledPage = () => {
  const navigate = useNavigate();
  const installed = getInstalledPacks();
  const withUpdates = getPacksWithUpdates();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
<button onClick={() => navigate("/store")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Store
      </button>

      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Installed Packs</h1>
        <p className="text-sm text-muted-foreground mt-1">{installed.length} packs active in your OS</p>
      </div>

      {/* Updates */}
      {withUpdates.length > 0 && (
        <div className="space-y-3">
          <SitaSectionHeader title="Updates Available" />
          {withUpdates.map(pack => {
            const Icon = resolveIcon(pack.icon);
            return (
              <div key={pack.pack_id} className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br", pack.gradient)}>
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{pack.name}</p>
                    <p className="text-xs text-muted-foreground">{pack.installState.version_installed} → {pack.version}</p>
                  </div>
                </div>
                <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
                  Update
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* All Installed */}
      <div className="space-y-3">
        <SitaSectionHeader title="All Installed" />
        {installed.map(pack => {
          const Icon = resolveIcon(pack.icon);
          const installedDate = pack.installState.installed_at
            ? new Date(pack.installState.installed_at).toLocaleDateString()
            : "—";

          return (
            <div key={pack.pack_id} className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-card-hover">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br", pack.gradient)}>
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{pack.name}</p>
                      <PackStatusBadge status={pack.installState.status} />
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">v{pack.installState.version_installed}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" /> {installedDate}
                      </span>
                      <TierBadge tier={pack.entitlement_tier} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => navigate(`/store/packs/${pack.pack_id}`)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors" title="Settings">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors" title="Pause">
                    <Pause className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Pack details */}
              <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-4 text-[10px] text-muted-foreground">
                <span>{pack.workflow_families.length} workflows</span>
                <span>{pack.advisors_enabled.length} advisors</span>
                <span>{pack.boardroom_views.length} boardroom views</span>
                <span>{pack.templates.length} templates</span>
                <span className="flex items-center gap-0.5">
                  <Shield className="h-2.5 w-2.5" /> {pack.permissions_required.length} permissions
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PackInstalledPage;
