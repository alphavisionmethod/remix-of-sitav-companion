// ═══════════════════════════════════════════════════════════════
// SITA OS — Bundle Detail Page
// Curated app collections
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Check, Package, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBundleById, APP_CATALOG } from "@/lib/app-platform";
import { AppIcon, VerificationBadge, AppSourceLabel, InstallSheet } from "@/components/sita/app-platform/AppStoreComponents";
import type { AppDefinition } from "@/lib/app-platform/types";

const BundleDetailPage = () => {
  const { bundleId } = useParams<{ bundleId: string }>();
  const navigate = useNavigate();
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [installTarget, setInstallTarget] = useState<AppDefinition | null>(null);

  const bundle = getBundleById(bundleId || "");
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

  const bundleApps = bundle.appIds.map(id => APP_CATALOG.find(a => a.id === id)).filter(Boolean) as AppDefinition[];

  // Initialize all selected
  if (selectedApps.size === 0 && bundleApps.length > 0) {
    const all = new Set(bundleApps.map(a => a.id));
    // Can't set state during render, so use a ref pattern
  }

  const toggleApp = (id: string) => {
    setSelectedApps(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedApps(new Set(bundleApps.map(a => a.id)));
  const allSelected = selectedApps.size === bundleApps.length;

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
              <h1 className="font-display text-2xl font-bold text-white">{bundle.name}</h1>
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
          {bundleApps.map(app => (
            <div key={app.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/15">
              <button onClick={() => toggleApp(app.id)}
                className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                  selectedApps.has(app.id) ? "bg-primary border-primary" : "border-muted-foreground/30")}>
                {selectedApps.has(app.id) && <Check className="h-3 w-3 text-primary-foreground" />}
              </button>
              <AppIcon icon={app.icon} iconBg={app.iconBg} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{app.name}</p>
                <p className="text-[10px] text-muted-foreground">{app.shortDescription}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <VerificationBadge level={app.trustLevel} />
                <span className="text-[10px] text-muted-foreground">{app.size}</span>
              </div>
              <button onClick={() => navigate(`/app-store/app/${app.id}`)}
                className="text-[10px] text-primary hover:underline shrink-0">Details</button>
            </div>
          ))}
        </div>
      </div>

      {/* Install Action */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-6">
        <div>
          <p className="text-sm font-semibold text-foreground">{selectedApps.size} of {bundleApps.length} apps selected</p>
          <p className="text-xs text-muted-foreground">Install receipts will be created for each app</p>
        </div>
        <button disabled={selectedApps.size === 0}
          className={cn("rounded-xl px-6 py-2.5 text-sm font-semibold flex items-center gap-2 transition-colors",
            selectedApps.size > 0 ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed")}>
          <Download className="h-4 w-4" /> Install Selected
        </button>
      </div>

      {installTarget && (
        <InstallSheet app={installTarget} onClose={() => setInstallTarget(null)} onInstall={() => setInstallTarget(null)} />
      )}
    </div>
  );
};

export default BundleDetailPage;
