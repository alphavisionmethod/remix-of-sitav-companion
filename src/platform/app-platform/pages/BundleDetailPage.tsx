// ═══════════════════════════════════════════════════════════════
// SITA OS — Bundle Detail Page (fully wired)
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Check, Shield, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBundleById } from "@/lib/app-platform";
import { useAppPlatform } from "@/contexts/AppPlatformContext";
import { AppIcon, VerificationBadge, AppSourceLabel } from "@/components/sita/app-platform/AppStoreComponents";
import type { AppDefinition } from "@/domains/apps/types";
import { toast } from "sonner";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const BundleDetailPage = () => {
  const { bundleId } = useParams<{ bundleId: string }>();
  const navigate = useNavigate();
  const { apps, installApp } = useAppPlatform();
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [installing, setInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);

  const bundle = getBundleById(bundleId || "");

  const bundleApps = bundle
    ? bundle.appIds.map(id => apps.find(a => a.id === id)).filter(Boolean) as AppDefinition[]
    : [];

  // Initialize all selected on mount
  useEffect(() => {
    if (bundleApps.length > 0 && selectedApps.size === 0) {
      setSelectedApps(new Set(bundleApps.map(a => a.id)));
    }
  }, [bundleApps.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleApp = (id: string) => {
    setSelectedApps(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedApps(new Set(bundleApps.map(a => a.id)));
  const allSelected = selectedApps.size === bundleApps.length;

  const handleBatchInstall = useCallback(async () => {
    const toInstall = bundleApps.filter(a =>
      selectedApps.has(a.id) && a.installStatus !== "installed"
    );
    if (toInstall.length === 0) {
      toast.info("All selected apps are already installed");
      return;
    }

    setInstalling(true);
    setInstallProgress(0);

    for (let i = 0; i < toInstall.length; i++) {
      await installApp(toInstall[i].id);
      setInstallProgress(((i + 1) / toInstall.length) * 100);
      // Brief pause for visual feedback
      await new Promise(r => setTimeout(r, 400));
    }

    setInstalling(false);
    toast.success(`${toInstall.length} apps installed from ${bundle?.name}`);
  }, [bundleApps, selectedApps, installApp, bundle?.name]);

  if (!bundle) {
    return (
      <div className="mx-auto max-w-4xl">
<button onClick={() => navigate("/app-store")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <p className="text-center py-20 text-lg font-medium text-foreground">Bundle not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <button onClick={() => navigate("/app-store")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to App Store
      </button>

      {/* Hero */}
      <div className={cn("relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br", bundle.iconBg)}>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-3xl shadow-lg">
              {bundle.icon}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Starter Pack</span>
              <h1 className="font-display text-2xl font-bold text-foreground">{bundle.name}</h1>
              <p className="text-sm text-white/70">{bundle.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/50">
            <span>{bundleApps.length} apps</span>
            <span>{bundle.totalSize} total</span>
            <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> All verified</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">{bundle.description}</p>
      </div>

      {/* App Selection */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Included Apps</h3>
          <button onClick={allSelected ? () => setSelectedApps(new Set()) : selectAll}
            className="text-xs text-primary hover:text-primary/80 transition-colors">
            {allSelected ? "Deselect all" : "Select all"}
          </button>
        </div>
        <div className="space-y-2">
          {bundleApps.map(app => {
            const isInstalled = app.installStatus === "installed";
            return (
              <div key={app.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/15">
                <button onClick={() => toggleApp(app.id)}
                  className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                    selectedApps.has(app.id) ? "bg-primary border-primary" : "border-muted-foreground/30")}>
                  {selectedApps.has(app.id) && <Check className="h-3 w-3 text-primary-foreground" />}
                </button>
                <AppIcon icon={app.icon} iconBg={app.iconBg} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{app.name}</p>
                    {isInstalled && (
                      <span className="text-[9px] text-[hsl(var(--trust-safe))] font-medium bg-[hsl(var(--trust-safe))]/10 px-1.5 py-0.5 rounded-full">Installed</span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{app.shortDescription}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <VerificationBadge level={app.trustLevel} />
                  <span className="text-[10px] text-muted-foreground">{app.size}</span>
                </div>
                <button onClick={() => navigate(`/app-store/app/${app.id}`)}
                  className="text-[10px] text-primary hover:underline shrink-0">Details</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Install Action */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">{selectedApps.size} of {bundleApps.length} apps selected</p>
            <p className="text-xs text-muted-foreground">Install receipts will be created for each app</p>
          </div>
          <button onClick={handleBatchInstall}
            disabled={selectedApps.size === 0 || installing}
            className={cn("rounded-xl px-6 py-2.5 text-sm font-semibold flex items-center gap-2 transition-colors",
              selectedApps.size > 0 && !installing ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed")}>
            {installing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {installing ? "Installing…" : "Install Selected"}
          </button>
        </div>

        {installing && (
          <div className="space-y-2">
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${installProgress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground text-center">{Math.round(installProgress)}% complete</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BundleDetailPage;
