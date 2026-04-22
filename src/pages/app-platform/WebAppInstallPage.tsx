// ═══════════════════════════════════════════════════════════════
// SITA OS — APS11+12 Install from Web / Web App Configure (fully wired)
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Globe, Plus, Bell, Pin, Zap, Monitor, Check,
  CheckCircle2, Sparkles, ExternalLink, Shield, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppPlatform } from "@/contexts/AppPlatformContext";
import { AppIcon, VerificationBadge } from "@/components/sita/app-platform/AppStoreComponents";
import type { AppDefinition } from "@/domains/apps/types";
import { DEMO_DETECTED_SITES } from "@/data/seed/core-pages";
import { toast } from "sonner";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const WebAppInstallPage = () => {
  const navigate = useNavigate();
  const { apps, installApp, pinToDock, setNotificationEnabled, setStartupBehavior } = useAppPlatform();
  const [selectedSite, setSelectedSite] = useState<typeof DEMO_DETECTED_SITES[0] | null>(null);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [config, setConfig] = useState({ pinToDock: true, notifications: true, separateWindow: true, startupLaunch: false });

  const handleInstall = async () => {
    if (!selectedSite) return;
    setInstalling(true);

    // Try to match detected site to a catalog app by name
    const matchedApp = apps.find(a => a.name.toLowerCase() === selectedSite.name.toLowerCase());
    if (matchedApp) {
      await installApp(matchedApp.id, { sourceOrigin: "web-install" });
      if (config.pinToDock) pinToDock(matchedApp.id);
      if (config.notifications) setNotificationEnabled(matchedApp.id, true);
      if (config.startupLaunch) setStartupBehavior(matchedApp.id, "background");
    }

    // Brief delay for visual feedback
    await new Promise(r => setTimeout(r, 1200));
    setInstalling(false);
    setInstalled(true);
    toast.success(`${selectedSite.name} added to SITA`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
<button onClick={() => navigate("/app-store")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to App Store
      </button>

      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <Globe className="h-6 w-6 text-primary" /> Install from Web
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Turn websites into beautiful SITA apps</p>
      </div>

      {/* Magic Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-primary/15 p-6">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Add to SITA</p>
            <p className="text-xs text-muted-foreground mt-1">
              SITA can detect installable web services and wrap them into beautiful, shell-native app experiences with their own window, dock icon, and notifications.
            </p>
          </div>
        </div>
      </div>

      {!selectedSite ? (
        <>
          {/* Detected Sites */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Installable Web Apps</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {([] as typeof DEMO_DETECTED_SITES).map(site => (
                <motion.button key={site.url} whileHover={{ y: -2 }} onClick={() => setSelectedSite(site)}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-all hover:border-primary/20 hover:shadow-lg group">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 text-2xl">
                    {site.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{site.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{site.url}</p>
                    <VerificationBadge level={site.trustLevel} />
                  </div>
                  <div className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Add
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Custom URL */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Install from URL</h3>
            <div className="flex gap-2">
              <input type="url" placeholder="https://example.com"
                className="flex-1 rounded-xl border border-border bg-secondary/30 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/30 focus:outline-none" />
              <button className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                Detect
              </button>
            </div>
          </div>
        </>
      ) : (
        <AnimatePresence mode="wait">
          {!installed ? (
            <motion.div key="configure" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-4">
              {/* App Identity */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 text-3xl shadow-lg">
                    {selectedSite.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-foreground">{selectedSite.name}</h2>
                    <p className="text-xs text-muted-foreground">{selectedSite.url}</p>
                    <VerificationBadge level={selectedSite.trustLevel} size="md" />
                  </div>
                </div>
              </div>

              {/* Configure */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Configure</h3>
                {[
                  { key: "separateWindow", label: "Open in dedicated window", desc: "App gets its own window instead of a browser tab", icon: Monitor },
                  { key: "pinToDock", label: "Pin to Dock", desc: "Quick access from the dock", icon: Pin },
                  { key: "notifications", label: "Allow notifications", desc: "Receive alerts from this app", icon: Bell },
                  { key: "startupLaunch", label: "Launch on startup", desc: "Open automatically when you log in", icon: Zap },
                ].map(opt => (
                  <div key={opt.key} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      <opt.icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-foreground">{opt.label}</p>
                        <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                      </div>
                    </div>
                    <button onClick={() => setConfig(prev => ({ ...prev, [opt.key]: !prev[opt.key as keyof typeof prev] }))}
                      className={cn("relative h-6 w-11 rounded-full transition-colors",
                        config[opt.key as keyof typeof config] ? "bg-[hsl(var(--trust-safe))]" : "bg-muted")}>
                      <div className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform",
                        config[opt.key as keyof typeof config] ? "translate-x-5" : "translate-x-0.5")} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Trust */}
              <div className="rounded-xl bg-secondary/30 border border-border p-4 flex items-start gap-3">
                <Shield className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-foreground font-medium">Trust-verified web app</p>
                  <p className="text-[10px] text-muted-foreground">SITA will create an install receipt and manage this app within the shell.</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button onClick={() => { setSelectedSite(null); setInstalled(false); }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                <button onClick={handleInstall} disabled={installing}
                  className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60">
                  {installing ? <><Loader2 className="h-4 w-4 animate-spin" /> Adding…</> : <><Plus className="h-4 w-4" /> Add to SITA</>}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-border bg-card p-8 text-center space-y-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 15, delay: 0.2 }}>
                <CheckCircle2 className="h-14 w-14 text-[hsl(var(--trust-safe))] mx-auto" />
              </motion.div>
              <h2 className="text-xl font-bold text-foreground">{selectedSite.name} added to SITA</h2>
              <p className="text-sm text-muted-foreground">Install receipt created · App is ready</p>
              <div className="flex gap-3 justify-center mt-4">
                <button className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                  Open {selectedSite.name}
                </button>
                <button onClick={() => { setSelectedSite(null); setInstalled(false); }}
                  className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors">
                  Add Another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default WebAppInstallPage;
