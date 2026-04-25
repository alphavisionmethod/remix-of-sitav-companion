// ═══════════════════════════════════════════════════════════════
// SITA OS — APS21 Enterprise / Private Catalog (fully wired)
// ═══════════════════════════════════════════════════════════════

import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building, Shield, Lock, Check, Users, AlertTriangle, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppPlatform } from "@/contexts/AppPlatformContext";
import { AppIcon, VerificationBadge } from "@/components/sita/app-platform/AppStoreComponents";
import { toast } from "sonner";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const statusConfig: Record<string, { label: string; color: string; icon: typeof Check }> = {
  available: { label: "Install", color: "bg-primary text-primary-foreground hover:bg-primary/90", icon: Download },
  installed: { label: "Installed", color: "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]", icon: Check },
  required: { label: "Required", color: "bg-[hsl(var(--trust-warn))]/10 text-[hsl(var(--trust-warn))]", icon: AlertTriangle },
  restricted: { label: "Restricted", color: "bg-secondary text-muted-foreground", icon: Lock },
};

const EnterpriseCatalogPage = () => {
  const navigate = useNavigate();
  const { installApp } = useAppPlatform();

  const handleInstall = async (appId: string, name: string) => {
    await installApp(appId, { sourceOrigin: "private-catalog" });
    toast.success(`${name} installed from enterprise catalog`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
<button onClick={() => navigate("/app-store")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to App Store
      </button>

      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-secondary via-card to-secondary/50 border border-border p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Building className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Enterprise Catalog</h1>
            <p className="text-sm text-muted-foreground">Organization-managed applications</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-primary" /> Enterprise approved</span>
          <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> Policy managed</span>
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Role-based access</span>
        </div>
      </div>

      {/* Apps */}
      <div className="space-y-3">
        {([] as any[]).map(app => {
          const st = statusConfig[app.status];
          const Icon = st.icon;
          return (
            <div key={app.id} className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/15">
              <div className="flex items-start gap-4">
                <AppIcon icon={app.icon} iconBg={app.iconBg} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{app.name}</h3>
                    <VerificationBadge level="enterprise-approved" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">{app.publisher} · v{app.version}</p>
                  <p className="text-xs text-muted-foreground mt-1">{app.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Users className="h-3 w-3" /> {app.roles.join(", ")}
                    </div>
                    {app.managed && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" /> Managed</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={app.status === "available" ? () => handleInstall(app.id, app.name) : undefined}
                  className={cn("shrink-0 rounded-lg px-4 py-2 text-xs font-medium flex items-center gap-1.5 transition-colors", st.color)}>
                  <Icon className="h-3 w-3" /> {st.label}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Policy Notice */}
      <div className="rounded-xl bg-secondary/30 border border-border p-4 flex items-start gap-3">
        <Shield className="h-4 w-4 text-primary mt-0.5" />
        <div>
          <p className="text-xs font-medium text-foreground">Enterprise policy active</p>
          <p className="text-[10px] text-muted-foreground">Apps in this catalog are managed by your organization. Updates, permissions, and availability are controlled by IT policy.</p>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseCatalogPage;
