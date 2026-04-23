// ═══════════════════════════════════════════════════════════════
// SITA OS — APS05 Compare Apps View (fully wired)
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, X, Minus, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppPlatform } from "@/contexts/AppPlatformContext";
import { AppIcon, VerificationBadge, AppSourceLabel, InstallSheet } from "@/components/sita/app-platform/AppStoreComponents";
import type { AppDefinition } from "@/domains/apps/types";
import { toast } from "sonner";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const AppComparePage = () => {
  const navigate = useNavigate();
  const { apps, installApp, pinToDock } = useAppPlatform();
  const [searchParams] = useSearchParams();
  const [installTarget, setInstallTarget] = useState<AppDefinition | null>(null);

  const ids = searchParams.get("apps")?.split(",") || COMPARE_PAIRS[0].ids;
  const compareApps = ids.map(id => apps.find(a => a.id === id)).filter(Boolean) as AppDefinition[];

  if (compareApps.length < 2) {
    return (
      <div className="mx-auto max-w-5xl">
<button onClick={() => navigate("/app-store")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <p className="text-center py-20 text-muted-foreground">Select at least two apps to compare</p>
      </div>
    );
  }

  const allPerms = [...new Set(compareApps.flatMap(a => a.permissions.map(p => p.domain)))];
  const allFeatures = [...new Set(compareApps.flatMap(a => a.worksWithSita))];

  const handleInstall = async () => {
    if (installTarget) {
      await installApp(installTarget.id);
      toast.success(`${installTarget.name} installed`);
      setInstallTarget(null);
    }
  };

  const BoolCell = ({ value }: { value: boolean }) => value
    ? <Check className="h-4 w-4 text-[hsl(var(--trust-safe))]" />
    : <X className="h-4 w-4 text-muted-foreground/30" />;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <button onClick={() => navigate("/app-store")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to App Store
      </button>

      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Compare Apps</h1>
        <p className="text-sm text-muted-foreground mt-1">Side-by-side comparison</p>
      </div>

      {/* Quick Pairs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {([] as any[]).map(p => (
          <button key={p.label} onClick={() => navigate(`/app-store/compare?apps=${p.ids.join(",")}`)}
            className={cn("shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-all",
              JSON.stringify(ids) === JSON.stringify(p.ids) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground")}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Compare Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* App Headers */}
        <div className="grid border-b border-border" style={{ gridTemplateColumns: `200px repeat(${compareApps.length}, 1fr)` }}>
          <div className="p-4 bg-secondary/30" />
          {compareApps.map(app => (
            <div key={app.id} className="p-4 text-center border-l border-border">
              <div className="flex flex-col items-center gap-2">
                <AppIcon icon={app.icon} iconBg={app.iconBg} />
                <div>
                  <p className="text-sm font-semibold text-foreground">{app.name}</p>
                  <p className="text-[10px] text-muted-foreground">{app.publisher}</p>
                </div>
                <VerificationBadge level={app.trustLevel} />
                <button onClick={() => app.installStatus === "installed" ? null : setInstallTarget(app)}
                  className={cn("rounded-lg px-4 py-1.5 text-xs font-medium transition-colors mt-1",
                    app.installStatus === "installed" ? "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]" : "bg-primary text-primary-foreground hover:bg-primary/90")}>
                  {app.installStatus === "installed" ? "Installed" : "Get"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Rows */}
        {[
          { label: "Type", render: (a: AppDefinition) => <AppSourceLabel appClass={a.appClass} size="md" /> },
          { label: "Version", render: (a: AppDefinition) => <span className="text-xs text-foreground">{a.version}</span> },
          { label: "Size", render: (a: AppDefinition) => <span className="text-xs text-foreground">{a.size}</span> },
          { label: "Rating", render: (a: AppDefinition) => <span className="text-xs text-foreground">{a.rating} ★</span> },
          { label: "Updates", render: (a: AppDefinition) => <span className="text-xs text-foreground capitalize">{a.updateSource.replace(/-/g, " ")}</span> },
          { label: "Notifications", render: (a: AppDefinition) => <BoolCell value={a.notificationPermission} /> },
          { label: "Startup", render: (a: AppDefinition) => <span className="text-xs text-foreground capitalize">{a.startupBehavior}</span> },
        ].map((row, i) => (
          <div key={row.label} className={cn("grid", i % 2 === 0 && "bg-secondary/10")}
            style={{ gridTemplateColumns: `200px repeat(${compareApps.length}, 1fr)` }}>
            <div className="p-3 text-xs font-medium text-muted-foreground flex items-center">{row.label}</div>
            {compareApps.map(app => (
              <div key={app.id} className="p-3 border-l border-border flex items-center justify-center">{row.render(app)}</div>
            ))}
          </div>
        ))}

        {/* SITA Integration */}
        <div className="border-t border-border">
          <div className="p-3 bg-primary/5 text-xs font-semibold text-primary">Works with SITA</div>
          {allFeatures.map((feat, i) => (
            <div key={feat} className={cn("grid", i % 2 === 0 && "bg-secondary/10")}
              style={{ gridTemplateColumns: `200px repeat(${compareApps.length}, 1fr)` }}>
              <div className="p-3 text-[11px] text-muted-foreground flex items-center">{feat}</div>
              {compareApps.map(app => (
                <div key={app.id} className="p-3 border-l border-border flex items-center justify-center">
                  <BoolCell value={app.worksWithSita.includes(feat)} />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Permissions */}
        <div className="border-t border-border">
          <div className="p-3 bg-secondary/30 text-xs font-semibold text-foreground">Permissions</div>
          {allPerms.map((perm, i) => (
            <div key={perm} className={cn("grid", i % 2 === 0 && "bg-secondary/10")}
              style={{ gridTemplateColumns: `200px repeat(${compareApps.length}, 1fr)` }}>
              <div className="p-3 text-[11px] text-muted-foreground capitalize flex items-center">{perm}</div>
              {compareApps.map(app => (
                <div key={app.id} className="p-3 border-l border-border flex items-center justify-center">
                  <BoolCell value={app.permissions.some(p => p.domain === perm)} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {installTarget && <InstallSheet app={installTarget} onClose={() => setInstallTarget(null)} onInstall={handleInstall}
        onPinToDock={(id) => { pinToDock(id); toast.success("Pinned to dock"); }}
        onOpen={() => setInstallTarget(null)} />}
    </div>
  );
};

export default AppComparePage;
