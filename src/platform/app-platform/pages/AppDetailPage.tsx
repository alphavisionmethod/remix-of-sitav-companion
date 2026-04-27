// ═══════════════════════════════════════════════════════════════
// SITA OS — App Detail Page (fully wired)
// Full per-app management with trust, permissions, associations
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Download, Check, ExternalLink, Star, Clock, Shield,
  Bell, FileText, Link2, Package, ChevronDown, ChevronUp, RefreshCw,
  Trash2, Pin, Settings, HardDrive, Sparkles, Lock, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AppIcon, VerificationBadge, AppSourceLabel, WorksWithSitaBadge,
  PermissionDomainCard, InstallSheet, SourceOriginLabel, PackageTypeLabel,
  SandboxLevelBadge, UpdateSourceInfo, TrustInstallBehavior,
} from "@/platform/sita/components/sita/app-platform/AppStoreComponents";
import { useAppPlatform } from "@/platform/app-platform/contexts/AppPlatformContext";
import { toast } from "sonner";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const AppDetailPage = () => {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const {
    getApp: getLiveApp, installApp, uninstallApp, pinToDock, unpinFromDock,
    togglePermission, setNotificationEnabled, apps, receipts,
  } = useAppPlatform();
  const [showInstall, setShowInstall] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showReleaseNotes, setShowReleaseNotes] = useState(false);
  const [showReceipts, setShowReceipts] = useState(false);

  const app = getLiveApp(appId || "");
  if (!app) {
    return (
      <div className="mx-auto max-w-4xl">
<button onClick={() => navigate("/app-store")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to App Store
        </button>
        <div className="text-center py-20">
          <p className="text-lg font-medium text-foreground">App not found</p>
        </div>
      </div>
    );
  }

  const isInstalled = app.installStatus === "installed";
  const similarApps = apps.filter(a => a.category === app.category && a.id !== app.id).slice(0, 4);
  const appReceipts = receipts.filter(r => r.appId === app.id);

  const handleInstall = async () => {
    await installApp(app.id);
    setShowInstall(false);
    toast.success(`${app.name} installed`);
  };

  const handleUninstall = async () => {
    await uninstallApp(app.id);
    toast.success(`${app.name} uninstalled`);
  };

  const handlePinToggle = () => {
    if (app.pinnedToDock) {
      unpinFromDock(app.id);
      toast.success(`${app.name} unpinned from dock`);
    } else {
      pinToDock(app.id);
      toast.success(`${app.name} pinned to dock`);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <button onClick={() => navigate("/app-store")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to App Store
      </button>

      {/* Hero */}
      <div className={cn("relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br", app.iconBg)}>
        <div className="relative z-10 flex items-start gap-5">
          <AppIcon icon={app.icon} iconBg="from-white/20 to-white/10" size="lg" />
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-bold text-foreground">{app.name}</h1>
            <p className="text-sm text-white/70">{app.publisher}</p>
            <div className="flex items-center gap-3 mt-2">
              <VerificationBadge level={app.trustLevel} size="md" />
              <AppSourceLabel appClass={app.appClass} size="md" />
              {app.sourceOrigin && <SourceOriginLabel origin={app.sourceOrigin} size="md" />}
            </div>
            <div className="flex items-center gap-4 mt-4">
               {isInstalled ? (
                <>
                  <button onClick={() => {
                    if (app.routePath) navigate(app.routePath);
                    else if (app.externalUrl) window.open(app.externalUrl, '_blank', 'noopener');
                  }} className="rounded-xl bg-white/20 backdrop-blur-sm px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-white/30 transition-colors flex items-center gap-2">
                    <Check className="h-4 w-4" /> Open
                  </button>
                  <button onClick={() => navigate(`/app-store/manage/${app.id}`)}
                    className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/20 transition-colors flex items-center gap-2">
                    <Settings className="h-3.5 w-3.5" /> Manage
                  </button>
                </>
              ) : (
                <button onClick={() => setShowInstall(true)}
                  className="rounded-xl bg-card px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-white/90 transition-colors flex items-center gap-2">
                  <Download className="h-4 w-4" /> Install
                </button>
              )}
              {app.size !== "0 MB" && <span className="text-xs text-white/50">{app.size}</span>}
              <span className="text-xs text-white/50">v{app.version}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-6 px-2">
        <div className="flex items-center gap-1.5 text-sm">
          <Star className="h-4 w-4 text-accent fill-accent" />
          <span className="font-semibold text-foreground">{app.rating}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {(app.downloads / 1_000_000).toFixed(1)}M+ downloads
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" /> Updated {app.lastUpdated}
        </div>
        {app.packageType && <PackageTypeLabel type={app.packageType} />}
      </div>

      {/* Description */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">About</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{app.fullDescription}</p>
        {app.whySitaRecommends && (
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-3">
            <p className="text-xs text-primary font-medium flex items-center gap-1"><Sparkles className="h-3 w-3" /> Why SITA recommends this</p>
            <p className="text-xs text-muted-foreground mt-1">{app.whySitaRecommends}</p>
          </div>
        )}
      </div>

      {/* Screenshots (demo) */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Screenshots</h3>
        <div className="flex gap-3 overflow-x-auto scrollbar-thin pb-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="shrink-0 w-48 h-28 rounded-xl bg-gradient-to-br from-secondary/50 to-secondary/20 border border-border/30 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Preview {i}</span>
            </div>
          ))}
        </div>
      </div>

      {/* User Reviews (demo) */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Ratings & Reviews</h3>
        <div className="flex items-center gap-4 mb-3">
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">{app.rating}</p>
            <div className="flex gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={cn("h-3 w-3", s <= Math.round(app.rating) ? "text-accent fill-accent" : "text-muted-foreground/30")} />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{(app.downloads / 1000).toFixed(0)}K ratings</p>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map(stars => {
              const pct = stars === 5 ? 68 : stars === 4 ? 22 : stars === 3 ? 6 : stars === 2 ? 3 : 1;
              return (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-2">{stars}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-secondary/50">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Demo reviews */}
        {[
          { name: "Alex K.", stars: 5, text: "Works perfectly with SITA OS. Love the deep integration!", time: "2 weeks ago" },
          { name: "Maria L.", stars: 4, text: "Great app, smooth experience. Would love more customization options.", time: "1 month ago" },
        ].map((review, i) => (
          <div key={i} className="border-t border-border/30 pt-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                {review.name[0]}
              </div>
              <span className="text-xs font-semibold text-foreground">{review.name}</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className={cn("h-2.5 w-2.5", s <= review.stars ? "text-accent fill-accent" : "text-muted-foreground/30")} />
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground ml-auto">{review.time}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 ml-8">{review.text}</p>
          </div>
        ))}
      </div>

      {/* Works with SITA */}
      {app.worksWithSita.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Works with SITA
          </h3>
          <WorksWithSitaBadge features={app.worksWithSita} />
        </div>
      )}

      {/* Permissions */}
      {app.permissions.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <button onClick={() => setShowPermissions(!showPermissions)}
            className="flex items-center justify-between w-full">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              Permissions ({app.permissions.length})
            </h3>
            {showPermissions ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
          {showPermissions && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="space-y-2">
              {app.permissions.map(p => (
                <PermissionDomainCard key={p.id} permission={p}
                  onToggle={() => isInstalled ? togglePermission(app.id, p.id) : undefined} />
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* File & Protocol Associations */}
      {(app.fileAssociations.length > 0 || app.protocolAssociations.length > 0) && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">File & Protocol Support</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {app.fileAssociations.map(f => (
              <div key={f.extension} className="flex items-center gap-2 rounded-lg bg-secondary/30 px-3 py-2">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-foreground">{f.label}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">{f.extension}</span>
                {f.isDefault && <span className="text-[9px] text-primary font-medium">Default</span>}
              </div>
            ))}
            {app.protocolAssociations.map(p => (
              <div key={p.protocol} className="flex items-center gap-2 rounded-lg bg-secondary/30 px-3 py-2">
                <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-foreground">{p.label}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">{p.protocol}://</span>
                {p.isDefault && <span className="text-[9px] text-primary font-medium">Default</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Release Notes */}
      {app.releaseNotes.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <button onClick={() => setShowReleaseNotes(!showReleaseNotes)}
            className="flex items-center justify-between w-full">
            <h3 className="text-sm font-semibold text-foreground">Release Notes</h3>
            {showReleaseNotes ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
          {showReleaseNotes && (
            <ul className="space-y-1.5">
              {app.releaseNotes.map((note, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="text-primary mt-0.5">•</span> {note}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Trust & Privacy */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" /> Trust & Privacy
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span>Trust: <strong className="text-foreground capitalize">{app.trustLevel.replace(/-/g, " ")}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Updates: <strong className="text-foreground capitalize">{app.updateSource.replace(/-/g, " ")}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Bell className="h-3.5 w-3.5" />
            <span>Notifications: <strong className="text-foreground">{app.notificationPermission ? "Supported" : "Not required"}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <HardDrive className="h-3.5 w-3.5" />
            <span>Size: <strong className="text-foreground">{app.size}</strong></span>
          </div>
          {app.sandboxLevel && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground sm:col-span-2">
              <Lock className="h-3.5 w-3.5" />
              <span>Sandbox: </span><SandboxLevelBadge level={app.sandboxLevel} />
            </div>
          )}
        </div>
        <TrustInstallBehavior level={app.trustLevel} />
        <UpdateSourceInfo updateSource={app.updateSource} />
        <div className="rounded-xl bg-secondary/20 border border-border p-3 flex items-center gap-2 text-[10px] text-muted-foreground">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span>Every install, update, and permission change produces a verifiable receipt.</span>
        </div>
      </div>

      {/* Management Actions (if installed) */}
      {isInstalled && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Manage</h3>
          <div className="grid gap-2 sm:grid-cols-3">
            <button onClick={handlePinToggle}
              className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-3 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors">
              <Pin className={cn("h-3.5 w-3.5", app.pinnedToDock && "text-primary")} />
              {app.pinnedToDock ? "Unpin from Dock" : "Pin to Dock"}
            </button>
            <button onClick={() => navigate(`/app-store/manage/${app.id}`)}
              className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-3 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors">
              <Settings className="h-3.5 w-3.5" /> App Settings
            </button>
            <button onClick={() => navigate(`/app-store/receipts/${app.id}`)}
              className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-3 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors">
              <Shield className="h-3.5 w-3.5" /> View Receipts
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-3 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors">
              <RefreshCw className="h-3.5 w-3.5" /> Repair
            </button>
            <button onClick={() => navigate(`/app-store/first-launch/${app.id}`)}
              className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-3 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors">
              <Layers className="h-3.5 w-3.5" /> First Launch Setup
            </button>
            <button onClick={handleUninstall}
              className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors">
              <Trash2 className="h-3.5 w-3.5" /> Uninstall
            </button>
          </div>
        </div>
      )}

      {/* Install Receipts (if any) */}
      {appReceipts.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <button onClick={() => setShowReceipts(!showReceipts)}
            className="flex items-center justify-between w-full">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Lifecycle Receipts ({appReceipts.length})
            </h3>
            {showReceipts ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
          {showReceipts && (
            <div className="space-y-2">
              {appReceipts.slice(0, 5).map(r => (
                <div key={r.receiptId} className="rounded-lg bg-secondary/20 p-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                      r.actionType === "install" ? "bg-primary/10 text-primary" :
                      r.actionType === "uninstall" ? "bg-destructive/10 text-destructive" :
                      "bg-accent/10 text-accent")}>{r.actionType}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(r.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-muted-foreground">v{r.version} · {r.sourceInfo} · {r.result}</p>
                </div>
              ))}
              {appReceipts.length > 5 && (
                <button onClick={() => navigate(`/app-store/receipts/${app.id}`)}
                  className="text-xs text-primary hover:underline">View all {appReceipts.length} receipts →</button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Similar Apps */}
      {similarApps.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Similar Apps</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {similarApps.map(a => (
              <div key={a.id} onClick={() => navigate(`/app-store/app/${a.id}`)}
                className="cursor-pointer rounded-xl border border-border bg-card p-3 flex items-center gap-3 transition-all hover:border-primary/20">
                <AppIcon icon={a.icon} iconBg={a.iconBg} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{a.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{a.shortDescription}</p>
                </div>
                <VerificationBadge level={a.trustLevel} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Install Sheet */}
      {showInstall && (
        <InstallSheet app={app} onClose={() => setShowInstall(false)} onInstall={handleInstall}
          onPinToDock={(id) => { pinToDock(id); toast.success("Pinned to dock"); }}
          onOpen={() => {
            setShowInstall(false);
            if (app.routePath) navigate(app.routePath);
            else if (app.externalUrl) window.open(app.externalUrl, '_blank', 'noopener');
          }} />
      )}
    </div>
  );
};

export default AppDetailPage;
