// ═══════════════════════════════════════════════════════════════
// SITA OS — App Updates Center
// ═══════════════════════════════════════════════════════════════

import { useNavigate } from "react-router-dom";
import { RefreshCw, Check, Shield, Clock, Download, ArrowLeft } from "lucide-react";
import { APP_CATALOG } from "@/lib/app-platform";
import { AppIcon, VerificationBadge } from "@/components/sita/app-platform/AppStoreComponents";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const AppUpdatesPage = () => {
  const navigate = useNavigate();
  const updatable = APP_CATALOG.filter(a => a.installStatus === "update-available");
  const installed = APP_CATALOG.filter(a => a.installStatus === "installed");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <DemoModeBadge />
      <button onClick={() => navigate("/app-store")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to App Store
      </button>

      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Updates</h1>
        <p className="text-sm text-muted-foreground mt-1">{updatable.length} updates available</p>
      </div>

      {updatable.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Available Updates</h3>
            <button className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5">
              <Download className="h-3 w-3" /> Update All
            </button>
          </div>
          {updatable.map(app => (
            <div key={app.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <AppIcon icon={app.icon} iconBg={app.iconBg} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{app.name}</p>
                <p className="text-[10px] text-muted-foreground">{app.releaseNotes[0]}</p>
              </div>
              <VerificationBadge level={app.trustLevel} />
              <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                Update
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Check className="h-10 w-10 text-[hsl(var(--trust-safe))] mx-auto mb-3" />
          <p className="text-lg font-semibold text-foreground">All apps are up to date</p>
          <p className="text-sm text-muted-foreground mt-1">Your installed apps are running the latest versions</p>
        </div>
      )}

      {/* Recently Updated */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Recently Updated</h3>
        {installed.slice(0, 5).map(app => (
          <div key={app.id} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <AppIcon icon={app.icon} iconBg={app.iconBg} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">{app.name}</p>
              <p className="text-[10px] text-muted-foreground">v{app.version}</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" /> {app.lastUpdated}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[hsl(var(--trust-safe))]">
              <Check className="h-3 w-3" /> Up to date
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppUpdatesPage;
