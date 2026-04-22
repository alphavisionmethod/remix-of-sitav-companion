// ═══════════════════════════════════════════════════════════════
// SITA OS — App Permissions Center (fully wired)
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppPlatform } from "@/contexts/AppPlatformContext";
import { AppIcon } from "@/components/sita/app-platform/AppStoreComponents";
import { DEMO_PERMISSION_DOMAINS } from "@/data/seed/core-pages";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

const AppPermissionsCenterPage = () => {
  const { isDemoMode } = useDataMode();
  const { apps, togglePermission } = useAppPlatform();
  const navigate = useNavigate();
  const [activeDomain, setActiveDomain] = useState("files");

  const appsWithPermission = apps.filter(app =>
    app.permissions.some(p => p.domain === activeDomain)
  );

  const activeDomainInfo = DEMO_PERMISSION_DOMAINS.find(d => d.id === activeDomain)!;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
<button onClick={() => navigate("/app-store")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to App Store
      </button>

      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Permissions Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and control what apps can access</p>
      </div>

      {/* Permission Domain Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {DEMO_PERMISSION_DOMAINS.map(d => {
          const Icon = d.icon;
          const count = apps.filter(a => a.permissions.some(p => p.domain === d.id)).length;
          return (
            <button key={d.id} onClick={() => setActiveDomain(d.id)}
              className={cn("shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                activeDomain === d.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground")}>
              <Icon className="h-3.5 w-3.5" /> {d.label}
              {count > 0 && <span className="ml-1 text-[9px] opacity-70">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Domain Info */}
      <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
        {(() => { const Icon = activeDomainInfo.icon; return <Icon className="h-5 w-5 text-primary" />; })()}
        <div>
          <p className="text-sm font-semibold text-foreground">{activeDomainInfo.label}</p>
          <p className="text-xs text-muted-foreground">{activeDomainInfo.description}</p>
        </div>
        <span className="ml-auto text-xs text-muted-foreground">{appsWithPermission.length} apps</span>
      </div>

      {/* Apps */}
      <div className="space-y-2">
        {appsWithPermission.map(app => {
          const perm = app.permissions.find(p => p.domain === activeDomain)!;
          return (
            <div key={app.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/15">
              <AppIcon icon={app.icon} iconBg={app.iconBg} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{app.name}</p>
                <p className="text-[10px] text-muted-foreground">{perm.description}</p>
              </div>
              {perm.required && <span className="text-[9px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Required</span>}
              <button onClick={() => togglePermission(app.id, perm.id)}
                className={cn("relative h-6 w-11 rounded-full cursor-pointer transition-colors",
                  perm.granted ? "bg-[hsl(var(--trust-safe))]" : "bg-muted")}>
                <div className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                  perm.granted ? "translate-x-5" : "translate-x-0.5")} />
              </button>
            </div>
          );
        })}
        {appsWithPermission.length === 0 && (
          <p className="text-center py-12 text-sm text-muted-foreground">No apps request this permission</p>
        )}
      </div>
    </div>
  );
};

export default AppPermissionsCenterPage;
