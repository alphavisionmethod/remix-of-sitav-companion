// ═══════════════════════════════════════════════════════════════
// SITA OS — App Store Reusable Components
// Premium, trust-centered, OS-level components
// ═══════════════════════════════════════════════════════════════

import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Shield, ShieldCheck, ShieldAlert, Building, Users, HelpCircle, Star,
  Download, Check, ChevronRight, ExternalLink, Sparkles, Clock, Globe,
  Lock, Smartphone, Monitor, Zap, Bell, FileText, Link2, Package,
  ArrowRight, X, Loader2, AlertTriangle, CheckCircle2, Pin, RefreshCw,
} from "lucide-react";
import type {
  AppDefinition, AppBundle, AppTrustLevel, AppClass, AppInstallStatus,
  AppPermission, AppSourceOrigin, AppSandboxLevel, AppInstallScope, AppPackageType,
} from "@/domains/apps/types";

// ── Trust Badge ──

const TRUST_CONFIG: Record<AppTrustLevel, { label: string; color: string; icon: typeof ShieldCheck }> = {
  "sita-verified": { label: "SITA Verified", color: "text-[hsl(var(--trust-safe))] bg-[hsl(var(--trust-safe))]/10 border-[hsl(var(--trust-safe))]/20", icon: ShieldCheck },
  "publisher-verified": { label: "Publisher Verified", color: "text-primary bg-primary/10 border-primary/20", icon: Shield },
  "enterprise-approved": { label: "Enterprise Approved", color: "text-accent bg-accent/10 border-accent/20", icon: Building },
  "community-reviewed": { label: "Community Reviewed", color: "text-muted-foreground bg-secondary border-border", icon: Users },
  "unknown-source": { label: "Unknown Source", color: "text-[hsl(var(--trust-warn))] bg-[hsl(var(--trust-warn))]/10 border-[hsl(var(--trust-warn))]/20", icon: ShieldAlert },
  "local-unverified": { label: "Local / Unverified", color: "text-muted-foreground bg-secondary border-border", icon: HelpCircle },
};

export function VerificationBadge({ level, size = "sm" }: { level: AppTrustLevel; size?: "sm" | "md" }) {
  const c = TRUST_CONFIG[level];
  const Icon = c.icon;
  return (
    <div className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5", c.color, size === "md" && "px-3 py-1")}>
      <Icon className={cn("shrink-0", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
      <span className={cn("font-medium", size === "sm" ? "text-[10px]" : "text-xs")}>{c.label}</span>
    </div>
  );
}

// ── App Type Label ──

const APP_CLASS_LABELS: Record<AppClass, { label: string; icon: typeof Globe }> = {
  native: { label: "Native App", icon: Monitor },
  "web-app": { label: "Web App", icon: Globe },
  "wrapped-app": { label: "Wrapped App", icon: Smartphone },
  internal: { label: "System App", icon: Zap },
  extension: { label: "Extension", icon: Package },
  external: { label: "External", icon: ExternalLink },
};

export function AppSourceLabel({ appClass, size = "sm" }: { appClass: AppClass; size?: "sm" | "md" }) {
  const c = APP_CLASS_LABELS[appClass];
  const Icon = c.icon;
  return (
    <div className={cn("inline-flex items-center gap-1 text-muted-foreground", size === "md" && "text-sm")}>
      <Icon className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
      <span className={cn(size === "sm" ? "text-[10px]" : "text-xs")}>{c.label}</span>
    </div>
  );
}

// ── Works With SITA Badge ──

export function WorksWithSitaBadge({ features }: { features: string[] }) {
  if (!features.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {features.slice(0, 4).map(f => (
        <span key={f} className="inline-flex items-center gap-1 rounded-md border border-primary/15 bg-primary/5 px-2 py-0.5 text-[10px] text-primary">
          <Sparkles className="h-2.5 w-2.5" /> {f}
        </span>
      ))}
      {features.length > 4 && (
        <span className="text-[10px] text-muted-foreground">+{features.length - 4} more</span>
      )}
    </div>
  );
}

// ── App Icon ──

export function AppIcon({ icon, iconBg, size = "md" }: { icon: string; iconBg: string; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "h-20 w-20 text-3xl rounded-[22px]" : size === "md" ? "h-14 w-14 text-2xl rounded-2xl" : "h-10 w-10 text-lg rounded-xl";
  return (
    <div className={cn("flex items-center justify-center bg-gradient-to-br shadow-lg", sizeClass, iconBg)}>
      <span>{icon}</span>
    </div>
  );
}

// ── App Card ──

export function AppCard({ app, onClick }: { app: AppDefinition; onClick: () => void }) {
  const isInstalled = app.installStatus === "installed";
  return (
    <motion.div whileHover={{ y: -2 }} onClick={onClick}
      className="group cursor-pointer rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-start gap-3">
        <AppIcon icon={app.icon} iconBg={app.iconBg} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground truncate">{app.name}</h3>
            {app.isNew && <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">NEW</span>}
          </div>
          <p className="text-[11px] text-muted-foreground truncate">{app.publisher}</p>
          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{app.shortDescription}</p>
          <div className="flex items-center gap-2 mt-2">
            <VerificationBadge level={app.trustLevel} />
            <AppSourceLabel appClass={app.appClass} />
          </div>
        </div>
        <div className="shrink-0">
          {isInstalled ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-[hsl(var(--trust-safe))]/10 px-3 py-1.5 text-xs font-medium text-[hsl(var(--trust-safe))]">
              <Check className="h-3 w-3" /> Open
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground group-hover:bg-primary/90">
              Get
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Featured App Card (large) ──

export function FeaturedAppCard({ app, onClick }: { app: AppDefinition; onClick: () => void }) {
  return (
    <motion.div whileHover={{ y: -3 }} onClick={onClick}
      className={cn("group cursor-pointer rounded-2xl bg-gradient-to-br p-6 transition-all hover:shadow-2xl", app.iconBg)}>
      <div className="flex items-center gap-4">
        <AppIcon icon={app.icon} iconBg="from-white/20 to-white/10" size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Featured</span>
          </div>
          <h2 className="text-xl font-bold text-white">{app.name}</h2>
          <p className="text-sm text-white/70 mt-1">{app.shortDescription}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1 rounded-lg bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white">
              <Download className="h-3 w-3" /> Get
            </span>
            <VerificationBadge level={app.trustLevel} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── App Lane (horizontal scroll) ──

export function AppLane({ title, subtitle, apps, onAppClick, onSeeAll }: {
  title: string; subtitle?: string; apps: AppDefinition[]; onAppClick: (id: string) => void; onSeeAll?: () => void;
}) {
  if (!apps.length) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {onSeeAll && (
          <button onClick={onSeeAll} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
            See all <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {apps.map(app => (
          <div key={app.id} className="min-w-[280px] max-w-[320px] shrink-0">
            <AppCard app={app} onClick={() => onAppClick(app.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Bundle Card ──

export function BundleCard({ bundle, apps, onClick }: { bundle: AppBundle; apps: AppDefinition[]; onClick: () => void }) {
  return (
    <motion.div whileHover={{ y: -2 }} onClick={onClick}
      className="group cursor-pointer rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/20 hover:shadow-lg">
      <div className="flex items-start gap-4">
        <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl shadow-lg", bundle.iconBg)}>
          {bundle.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{bundle.name}</h3>
          <p className="text-[11px] text-muted-foreground">{bundle.subtitle}</p>
          <div className="flex items-center gap-1 mt-2">
            {apps.slice(0, 5).map(a => (
              <div key={a.id} className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary text-xs" title={a.name}>
                {a.icon}
              </div>
            ))}
            {apps.length > 5 && <span className="text-[10px] text-muted-foreground ml-1">+{apps.length - 5}</span>}
          </div>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
            <span>{apps.length} apps</span>
            <span>{bundle.totalSize}</span>
          </div>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
          Install <ChevronRight className="h-3 w-3" />
        </span>
      </div>
    </motion.div>
  );
}

// ── Category Strip ──

export function CategoryStrip({ categories, active, onSelect }: {
  categories: { id: string; label: string; icon: string }[]; active: string; onSelect: (id: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
      <button onClick={() => onSelect("all")}
        className={cn("shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all",
          active === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground")}>
        All
      </button>
      {categories.map(c => (
        <button key={c.id} onClick={() => onSelect(c.id)}
          className={cn("shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all flex items-center gap-1.5",
            active === c.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground")}>
          <span>{c.icon}</span> {c.label}
        </button>
      ))}
    </div>
  );
}

// ── Install Sheet (Modal Overlay) ──

export function InstallSheet({ app, onClose, onInstall, onPinToDock, onOpen }: {
  app: AppDefinition; onClose: () => void; onInstall: () => void;
  onPinToDock?: (appId: string) => void; onOpen?: () => void;
}) {
  const [status, setStatus] = useState<"review" | "permissions" | "scope" | "installing" | "installed">("review");
  const [progress, setProgress] = useState(0);
  const [installScope, setInstallScope] = useState<AppInstallScope>("user");

  const handleInstall = () => {
    setStatus("installing");
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 100) { p = 100; clearInterval(iv); setTimeout(() => { setStatus("installed"); onInstall(); }, 500); }
      setProgress(Math.min(p, 100));
    }, 300);
  };

  const highRiskPerms = app.permissions.filter(p => p.riskLevel === "high");

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        onClick={onClose}>
        <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10 overflow-hidden"
          onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="p-6 pb-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <AppIcon icon={app.icon} iconBg={app.iconBg} />
                <div>
                  <h2 className="text-lg font-bold text-foreground">{app.name}</h2>
                  <p className="text-xs text-muted-foreground">{app.publisher}</p>
                </div>
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-secondary transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <VerificationBadge level={app.trustLevel} size="md" />
              <AppSourceLabel appClass={app.appClass} size="md" />
              {app.size !== "0 MB" && <span className="text-xs text-muted-foreground">{app.size}</span>}
            </div>
          </div>

          {/* Body */}
          <div className="p-6 pt-2 max-h-[50vh] overflow-y-auto space-y-4">
            {status === "review" && (
              <>
                <p className="text-sm text-muted-foreground">{app.shortDescription}</p>

                {/* Permissions */}
                {app.permissions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Permissions</h4>
                    {app.permissions.map(p => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Lock className={cn("h-3.5 w-3.5", p.riskLevel === "high" ? "text-[hsl(var(--trust-warn))]" : "text-muted-foreground")} />
                          <div>
                            <span className="text-xs font-medium text-foreground">{p.label}</span>
                            <p className="text-[10px] text-muted-foreground">{p.description}</p>
                          </div>
                        </div>
                        {p.required && <span className="text-[9px] text-muted-foreground">Required</span>}
                      </div>
                    ))}
                  </div>
                )}

                {/* File/Protocol associations */}
                {(app.fileAssociations.length > 0 || app.protocolAssociations.length > 0) && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Integrations</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {app.fileAssociations.map(f => (
                        <span key={f.extension} className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-[10px] text-muted-foreground">
                          <FileText className="h-2.5 w-2.5" /> {f.extension}
                        </span>
                      ))}
                      {app.protocolAssociations.map(p => (
                        <span key={p.protocol} className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-[10px] text-muted-foreground">
                          <Link2 className="h-2.5 w-2.5" /> {p.protocol}://
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Works With SITA */}
                {app.worksWithSita.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Works with SITA</h4>
                    <WorksWithSitaBadge features={app.worksWithSita} />
                  </div>
                )}

                {/* Trust */}
                <div className="rounded-xl border border-border bg-secondary/20 p-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Update source: <strong className="text-foreground">{app.updateSource.replace("-", " ")}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Version {app.version} · Updated {app.lastUpdated}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">SITA will create an install receipt for this action.</p>
                </div>

                {highRiskPerms.length > 0 && (
                  <div className="rounded-xl border border-[hsl(var(--trust-warn))]/20 bg-[hsl(var(--trust-warn))]/5 p-3 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-[hsl(var(--trust-warn))] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-foreground">This app requests <strong>{highRiskPerms.length} elevated permission{highRiskPerms.length > 1 ? "s" : ""}</strong>. Review carefully before installing.</p>
                  </div>
                )}

                {/* Install Scope */}
                <InstallScopeSelector scope={installScope} onSelect={setInstallScope}
                  allowedScopes={app.trustLevel === "unknown-source" || app.trustLevel === "local-unverified" ? ["user", "sandbox"] : ["user", "system", "sandbox"]} />

                {/* Sandbox recommendation for untrusted */}
                {(app.trustLevel === "unknown-source" || app.trustLevel === "local-unverified") && (
                  <SandboxRecommendationCard level="restricted" recommended />
                )}
              </>
            )}

            {status === "installing" && (
              <div className="py-8 text-center space-y-4">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                  <Loader2 className="h-10 w-10 text-primary mx-auto" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-foreground">Installing {app.name}…</p>
                  <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}% complete</p>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <motion.div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }} />
                </div>
              </div>
            )}

            {status === "installed" && (
              <div className="py-8 text-center space-y-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 15 }}>
                  <CheckCircle2 className="h-12 w-12 text-[hsl(var(--trust-safe))] mx-auto" />
                </motion.div>
                <div>
                  <p className="text-lg font-bold text-foreground">{app.name} installed</p>
                  <p className="text-xs text-muted-foreground mt-1">Install receipt created · Ready to launch</p>
                </div>
                <div className="flex gap-2 justify-center mt-4">
                  <button onClick={() => { onOpen?.(); onClose(); }}
                    className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                    Open
                  </button>
                  <button onClick={() => onPinToDock?.(app.id)}
                    className="rounded-xl bg-secondary px-5 py-2 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors">
                    Pin to Dock
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {status === "review" && (
            <div className="flex items-center justify-between p-6 pt-4 border-t border-border">
              <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleInstall}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2">
                <Download className="h-3.5 w-3.5" /> Install
              </button>
            </div>
          )}

          {status === "installed" && (
            <div className="flex items-center justify-center p-4 pt-0">
              <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Done</button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Permission Domain Card ──

export function PermissionDomainCard({ permission, onToggle }: { permission: AppPermission; onToggle: (id: string) => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/15">
      <div className="flex items-center gap-3">
        <Lock className={cn("h-4 w-4", permission.riskLevel === "high" ? "text-[hsl(var(--trust-warn))]" : permission.riskLevel === "medium" ? "text-primary" : "text-muted-foreground")} />
        <div>
          <p className="text-sm font-medium text-foreground">{permission.label}</p>
          <p className="text-[11px] text-muted-foreground">{permission.description}</p>
        </div>
      </div>
      <button onClick={() => onToggle(permission.id)}
        className={cn("relative h-6 w-11 rounded-full transition-colors",
          permission.granted ? "bg-[hsl(var(--trust-safe))]" : "bg-muted")}>
        <div className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
          permission.granted ? "translate-x-5" : "translate-x-0.5")} />
      </button>
    </div>
  );
}

// ── Store Hero ──

export function StoreHero({ installedCount, appsAvailable }: { installedCount: number; appsAvailable: number }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-border p-8">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full blur-[80px] bg-primary/8" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full blur-[60px] bg-accent/6" />
      </div>
      <div className="relative z-10">
        <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">App Store</h1>
        <p className="text-sm text-muted-foreground mt-1">Discover, install, and manage applications for your SITA environment</p>
        <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 text-primary" />
            <span><strong className="text-foreground">{appsAvailable}</strong> apps available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" />
            <span><strong className="text-foreground">{installedCount}</strong> installed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Trust-verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Receipt Card ──

export function AppReceiptCard({ receipt }: { receipt: AppDefinition["receipts"][0] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
          receipt.actionType === "install" ? "bg-primary/10 text-primary" :
          receipt.actionType === "uninstall" ? "bg-destructive/10 text-destructive" :
          "bg-accent/10 text-accent"
        )}>{receipt.actionType}</span>
        <span className="text-[10px] text-muted-foreground">{receipt.timestamp}</span>
      </div>
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Version: {receipt.version}</p>
        <p>Source: {receipt.sourceInfo}</p>
        <p>Actor: {receipt.actor}</p>
        <p>Result: <span className={receipt.result === "success" ? "text-[hsl(var(--trust-safe))]" : "text-destructive"}>{receipt.result}</span></p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// RUX — Runtime / Packaging UX Components
// ═══════════════════════════════════════════════════════════════

// ── RUX02: Source Origin Label ──

const SOURCE_ORIGIN_CONFIG: Record<AppSourceOrigin, { label: string; icon: typeof Globe }> = {
  "sita-store": { label: "SITA Store", icon: ShieldCheck },
  "publisher-direct": { label: "Publisher Direct", icon: ExternalLink },
  "web-install": { label: "Web Install", icon: Globe },
  "private-catalog": { label: "Private Catalog", icon: Building },
  "external-file": { label: "External File", icon: Package },
  "external-url": { label: "External URL", icon: ExternalLink },
  "local-sideload": { label: "Local Sideload", icon: Monitor },
  "system-preinstalled": { label: "Preinstalled", icon: Zap },
};

export function SourceOriginLabel({ origin, size = "sm" }: { origin: AppSourceOrigin; size?: "sm" | "md" }) {
  const c = SOURCE_ORIGIN_CONFIG[origin];
  const Icon = c.icon;
  return (
    <div className={cn("inline-flex items-center gap-1 text-muted-foreground", size === "md" && "text-sm")}>
      <Icon className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
      <span className={cn(size === "sm" ? "text-[10px]" : "text-xs")}>{c.label}</span>
    </div>
  );
}

// ── RUX04: Package Type Label ──

const PACKAGE_TYPE_LABELS: Record<AppPackageType, string> = {
  "native-application": "Native application",
  "web-app": "Web app",
  "wrapped-web-app": "Wrapped web app",
  "internal-tool": "Internal tool",
  "capability-pack": "Capability pack",
  "external-package": "External application package",
};

export function PackageTypeLabel({ type }: { type: AppPackageType }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
      <Package className="h-2.5 w-2.5" /> {PACKAGE_TYPE_LABELS[type]}
    </span>
  );
}

// ── RUX03: Trust Install Behavior Card ──

export function TrustInstallBehavior({ level }: { level: AppTrustLevel }) {
  const behaviors: Record<AppTrustLevel, { friction: string; desc: string; color: string }> = {
    "sita-verified": { friction: "Lowest friction", desc: "One-click install with full confidence", color: "border-[hsl(var(--trust-safe))]/20 bg-[hsl(var(--trust-safe))]/5" },
    "publisher-verified": { friction: "Smooth install", desc: "Publisher signature verified, review permissions", color: "border-primary/20 bg-primary/5" },
    "enterprise-approved": { friction: "Policy-managed", desc: "Internal support owner, managed updates", color: "border-accent/20 bg-accent/5" },
    "community-reviewed": { friction: "Extra review", desc: "Community-reviewed, check source and permissions", color: "border-border bg-secondary/30" },
    "unknown-source": { friction: "Caution required", desc: "Unknown publisher, consider restricted install", color: "border-[hsl(var(--trust-warn))]/20 bg-[hsl(var(--trust-warn))]/5" },
    "local-unverified": { friction: "Manual review", desc: "Unverified local package, inspect before installing", color: "border-[hsl(var(--trust-warn))]/20 bg-[hsl(var(--trust-warn))]/5" },
  };
  const b = behaviors[level];
  return (
    <div className={cn("rounded-xl border p-3", b.color)}>
      <div className="flex items-center gap-2">
        <Shield className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-foreground">{b.friction}</span>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">{b.desc}</p>
    </div>
  );
}

// ── RUX05: Install Scope Selector ──

const SCOPE_OPTIONS: { value: AppInstallScope; label: string; desc: string; icon: typeof Monitor }[] = [
  { value: "user", label: "This user only", desc: "Available to your account", icon: Users },
  { value: "system", label: "System-wide", desc: "Available to all users on this device", icon: Monitor },
  { value: "sandbox", label: "Restricted sandbox", desc: "Limited access to files and system", icon: Lock },
  { value: "enterprise-managed", label: "Enterprise managed", desc: "Controlled by organization policy", icon: Building },
];

export function InstallScopeSelector({ scope, onSelect, allowedScopes }: {
  scope: AppInstallScope; onSelect: (s: AppInstallScope) => void; allowedScopes?: AppInstallScope[];
}) {
  const available = allowedScopes || ["user", "sandbox"];
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Install scope</h4>
      {SCOPE_OPTIONS.filter(o => available.includes(o.value)).map(opt => {
        const Icon = opt.icon;
        const selected = scope === opt.value;
        return (
          <button key={opt.value} onClick={() => onSelect(opt.value)}
            className={cn("w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
              selected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/15")}>
            <Icon className={cn("h-4 w-4", selected ? "text-primary" : "text-muted-foreground")} />
            <div className="flex-1">
              <p className="text-xs font-medium text-foreground">{opt.label}</p>
              <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
            </div>
            <div className={cn("h-4 w-4 rounded-full border-2 flex items-center justify-center",
              selected ? "border-primary" : "border-muted-foreground/30")}>
              {selected && <div className="h-2 w-2 rounded-full bg-primary" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── RUX06: Sandbox Recommendation Card ──

const SANDBOX_LABELS: Record<AppSandboxLevel, { label: string; desc: string; icon: typeof Lock }> = {
  standard: { label: "Standard access", desc: "Full access to allowed resources", icon: Check as typeof Lock },
  restricted: { label: "Restricted sandbox", desc: "Limited to its own data and selected files", icon: Lock },
  "limited-files": { label: "Limited file access", desc: "Can open documents you choose", icon: FileText },
  "enterprise-managed": { label: "Managed by your organization", desc: "Policy controls what this app can do", icon: Building },
  "approval-required": { label: "Approval required", desc: "Elevated actions need your approval first", icon: Shield },
};

export function SandboxRecommendationCard({ level, recommended }: { level: AppSandboxLevel; recommended?: boolean }) {
  const s = SANDBOX_LABELS[level];
  const Icon = s.icon;
  return (
    <div className={cn("rounded-xl border p-3 flex items-start gap-3",
      recommended ? "border-primary/20 bg-primary/5" : "border-border bg-secondary/20")}>
      <Icon className={cn("h-4 w-4 mt-0.5", recommended ? "text-primary" : "text-muted-foreground")} />
      <div>
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium text-foreground">{s.label}</p>
          {recommended && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">Recommended</span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>
      </div>
    </div>
  );
}

// ── RUX06: Sandbox Display (inline) ──

export function SandboxLevelBadge({ level }: { level: AppSandboxLevel }) {
  const colors: Record<AppSandboxLevel, string> = {
    standard: "text-[hsl(var(--trust-safe))] bg-[hsl(var(--trust-safe))]/10",
    restricted: "text-[hsl(var(--trust-warn))] bg-[hsl(var(--trust-warn))]/10",
    "limited-files": "text-primary bg-primary/10",
    "enterprise-managed": "text-accent bg-accent/10",
    "approval-required": "text-[hsl(var(--trust-warn))] bg-[hsl(var(--trust-warn))]/10",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", colors[level])}>
      <Lock className="h-2.5 w-2.5" /> {SANDBOX_LABELS[level].label}
    </span>
  );
}

// ── RUX07: Post-Install Integration Prompts ──

export function DockPinPrompt({ appName, onPin, onSkip }: { appName: string; onPin: () => void; onSkip: () => void }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Pin className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">Pin {appName} to Dock?</p>
        <p className="text-[10px] text-muted-foreground">Quick access from the dock bar</p>
      </div>
      <div className="flex gap-1.5 shrink-0">
        <button onClick={onPin} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Pin</button>
        <button onClick={onSkip} className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Skip</button>
      </div>
    </div>
  );
}

export function DefaultAppPrompt({ appName, role, onSet, onSkip }: { appName: string; role: string; onSet: () => void; onSkip: () => void }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
        <Star className="h-5 w-5 text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">Make {appName} your default {role}?</p>
        <p className="text-[10px] text-muted-foreground">Opens {role} files and links with {appName}</p>
      </div>
      <div className="flex gap-1.5 shrink-0">
        <button onClick={onSet} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Set</button>
        <button onClick={onSkip} className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Skip</button>
      </div>
    </div>
  );
}

export function WorkspaceAttachPrompt({ appName, onAttach, onSkip }: { appName: string; onAttach: () => void; onSkip: () => void }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
        <Monitor className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">Add {appName} to workspace?</p>
        <p className="text-[10px] text-muted-foreground">Attach to your current workspace view</p>
      </div>
      <div className="flex gap-1.5 shrink-0">
        <button onClick={onAttach} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Add</button>
        <button onClick={onSkip} className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Skip</button>
      </div>
    </div>
  );
}

// ── RUX04: Runtime Class Card ──

export function RuntimeClassCard({ appClass, packageType }: { appClass: AppClass; packageType?: AppPackageType }) {
  const classInfo = APP_CLASS_LABELS[appClass];
  const Icon = classInfo.icon;
  return (
    <div className="rounded-xl border border-border bg-secondary/20 p-3 flex items-center gap-3">
      <Icon className="h-5 w-5 text-primary" />
      <div>
        <p className="text-xs font-medium text-foreground">{classInfo.label}</p>
        {packageType && <p className="text-[10px] text-muted-foreground">{PACKAGE_TYPE_LABELS[packageType]}</p>}
      </div>
    </div>
  );
}

// ── RUX10: Source Verification Card ──

export function SourceVerificationCard({ trustLevel, publisher, sourceOrigin }: {
  trustLevel: AppTrustLevel; publisher: string; sourceOrigin?: AppSourceOrigin;
}) {
  const trust = TRUST_CONFIG[trustLevel];
  const TrustIcon = trust.icon;
  const isVerified = trustLevel === "sita-verified" || trustLevel === "publisher-verified";
  return (
    <div className={cn("rounded-xl border p-4 space-y-2",
      isVerified ? "border-[hsl(var(--trust-safe))]/20 bg-[hsl(var(--trust-safe))]/5" : "border-[hsl(var(--trust-warn))]/20 bg-[hsl(var(--trust-warn))]/5")}>
      <div className="flex items-center gap-2">
        <TrustIcon className={cn("h-5 w-5", isVerified ? "text-[hsl(var(--trust-safe))]" : "text-[hsl(var(--trust-warn))]")} />
        <span className="text-sm font-semibold text-foreground">{trust.label}</span>
      </div>
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Publisher: <span className="text-foreground">{publisher}</span></p>
        {sourceOrigin && <p>Source: <span className="text-foreground">{SOURCE_ORIGIN_CONFIG[sourceOrigin].label}</span></p>}
        {isVerified ? (
          <p className="flex items-center gap-1 text-[hsl(var(--trust-safe))]"><Check className="h-3 w-3" /> Identity verified</p>
        ) : (
          <p className="flex items-center gap-1 text-[hsl(var(--trust-warn))]"><AlertTriangle className="h-3 w-3" /> Source not verified</p>
        )}
      </div>
    </div>
  );
}

// ── RUX08: Update Source Info ──

export function UpdateSourceInfo({ updateSource, autoUpdate = true }: { updateSource: string; autoUpdate?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/20 p-3 space-y-1.5">
      <div className="flex items-center gap-2 text-xs">
        <RefreshCw className="h-3.5 w-3.5 text-primary" />
        <span className="font-medium text-foreground capitalize">{updateSource.replace(/-/g, " ")}</span>
      </div>
      <p className="text-[10px] text-muted-foreground">
        {autoUpdate ? "Updates automatically when available" : "Manual update required"}
        {updateSource === "publisher-managed" && " · Publisher controls update timing"}
        {updateSource === "enterprise-managed" && " · IT policy controls update channel"}
      </p>
    </div>
  );
}

// ── RUX13: Enterprise App Badge ──

export function EnterpriseAppBadge({ orgName }: { orgName?: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/5 px-2.5 py-1 text-[10px] font-medium text-accent">
      <Building className="h-3 w-3" />
      {orgName || "Enterprise"} managed
    </div>
  );
}

// ── RUX14: Capability Pack Card ──

export function CapabilityPackCard({ name, description, unlocks, icon }: {
  name: string; description: string; unlocks: string[]; icon: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3 hover:border-primary/15 transition-all">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 text-2xl">{icon}</div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground">{name}</h3>
          <p className="text-[11px] text-muted-foreground">{description}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
          <Package className="h-2.5 w-2.5" /> Pack
        </span>
      </div>
      {unlocks.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Unlocks</p>
          <div className="flex flex-wrap gap-1">
            {unlocks.map(u => (
              <span key={u} className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[10px] text-foreground">
                <Sparkles className="h-2.5 w-2.5 text-primary" /> {u}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── RUX15: File Association Prompt (non-modal) ──

export function FileAssociationPrompt({ appName, fileType, onSet, onSkip }: {
  appName: string; fileType: string; onSet: () => void; onSkip: () => void;
}) {
  return (
    <div className="rounded-xl border border-primary/15 bg-primary/5 p-4 flex items-center gap-3">
      <FileText className="h-5 w-5 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">Open {fileType} files with {appName}?</p>
        <p className="text-[10px] text-muted-foreground">Set as default handler for {fileType}</p>
      </div>
      <div className="flex gap-1.5 shrink-0">
        <button onClick={onSet} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Yes</button>
        <button onClick={onSkip} className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">No</button>
      </div>
    </div>
  );
}

// Pin and RefreshCw imported at top
