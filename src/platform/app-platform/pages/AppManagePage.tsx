// ═══════════════════════════════════════════════════════════════
// SITA OS — APS08 App Manage Detail (fully wired)
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Pin, Bell, HardDrive, RefreshCw, Trash2, Settings, Play,
  Shield, Clock, FileText, Link2, Lock, ChevronDown, ChevronUp,
  Download, Check, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppPlatform } from "@/contexts/AppPlatformContext";
import { AppIcon, VerificationBadge, AppSourceLabel, PermissionDomainCard } from "@/platform/sita/components/sita/app-platform/AppStoreComponents";
import { toast } from "sonner";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const AppManagePage = () => {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const {
    getApp, togglePermission, pinToDock, unpinFromDock,
    setNotificationEnabled, setStartupBehavior, uninstallApp, installApp,
  } = useAppPlatform();

  const [showPerms, setShowPerms] = useState(true);
  const [showAssoc, setShowAssoc] = useState(false);

  const app = getApp(appId || "");
  if (!app) return (
    <div className="mx-auto max-w-4xl">
<button onClick={() => navigate("/app-store/library")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <p className="text-center py-20 text-foreground font-medium">App not found</p>
    </div>
  );

  const isInstalled = app.installStatus === "installed";

  const handleUninstall = async () => {
    await uninstallApp(app.id);
    toast.success(`${app.name} uninstalled`);
    navigate("/app-store/library");
  };

  const handleReinstall = async () => {
    await uninstallApp(app.id);
    await installApp(app.id);
    toast.success(`${app.name} reinstalled`);
  };

  const Section = ({ title, icon: Icon, children, collapsible, open, onToggle }: any) => (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button onClick={onToggle} className={cn("w-full flex items-center gap-3 p-4", collapsible && "cursor-pointer hover:bg-secondary/20 transition-colors")}>
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground flex-1 text-left">{title}</h3>
        {collapsible && (open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />)}
      </button>
      {(!collapsible || open) && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );

  const Toggle = ({ label, desc, value, onChange }: { label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm text-foreground">{label}</p>
        {desc && <p className="text-[10px] text-muted-foreground">{desc}</p>}
      </div>
      <button onClick={() => onChange(!value)}
        className={cn("relative h-6 w-11 rounded-full transition-colors", value ? "bg-[hsl(var(--trust-safe))]" : "bg-muted")}>
        <div className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform", value ? "translate-x-5" : "translate-x-0.5")} />
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <button onClick={() => navigate("/app-store/library")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Library
      </button>

      {/* Hero */}
      <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
        <AppIcon icon={app.icon} iconBg={app.iconBg} size="lg" />
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">{app.name}</h1>
          <p className="text-xs text-muted-foreground">{app.publisher} · v{app.version}</p>
          <div className="flex items-center gap-2 mt-2">
            <VerificationBadge level={app.trustLevel} size="md" />
            <AppSourceLabel appClass={app.appClass} size="md" />
          </div>
        </div>
        {isInstalled ? (
          <button className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Play className="h-3.5 w-3.5" /> Open
          </button>
        ) : (
          <button onClick={() => installApp(app.id)}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Download className="h-3.5 w-3.5" /> Install
          </button>
        )}
      </div>

      {/* Launch & Dock */}
      <Section title="Launch & Dock" icon={Settings}>
        <Toggle label="Pin to Dock" desc="Keep in the dock for quick access"
          value={app.pinnedToDock}
          onChange={v => v ? pinToDock(app.id) : unpinFromDock(app.id)} />
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm text-foreground">Startup behavior</p>
            <p className="text-[10px] text-muted-foreground">How app launches on login</p>
          </div>
          <select value={app.startupBehavior}
            onChange={e => setStartupBehavior(app.id, e.target.value as "none" | "background" | "visible")}
            className="rounded-lg bg-secondary px-3 py-1.5 text-xs text-foreground border border-border">
            <option value="none">None</option>
            <option value="background">Background</option>
            <option value="visible">Visible</option>
          </select>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        <Toggle label="Allow notifications" desc="Receive alerts from this app"
          value={app.notificationPermission}
          onChange={v => setNotificationEnabled(app.id, v)} />
      </Section>

      {/* Permissions */}
      <Section title={`Permissions (${app.permissions.length})`} icon={Lock} collapsible open={showPerms} onToggle={() => setShowPerms(!showPerms)}>
        {app.permissions.length > 0 ? app.permissions.map(p => (
          <PermissionDomainCard key={p.id} permission={p} onToggle={() => togglePermission(app.id, p.id)} />
        )) : <p className="text-xs text-muted-foreground">No special permissions required</p>}
      </Section>

      {/* File & Protocol Associations */}
      <Section title="File & Protocol Associations" icon={FileText} collapsible open={showAssoc} onToggle={() => setShowAssoc(!showAssoc)}>
        {app.fileAssociations.length > 0 ? (
          <div className="space-y-2">
            {app.fileAssociations.map(f => (
              <div key={f.extension} className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-foreground">{f.label}</span>
                  <span className="text-[10px] text-muted-foreground">{f.extension}</span>
                </div>
                {f.isDefault && <span className="text-[9px] text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">Default</span>}
              </div>
            ))}
          </div>
        ) : <p className="text-xs text-muted-foreground">No file associations</p>}
        {app.protocolAssociations.length > 0 && (
          <div className="space-y-2 mt-2">
            {app.protocolAssociations.map(p => (
              <div key={p.protocol} className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
                <div className="flex items-center gap-2">
                  <Link2 className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-foreground">{p.label}</span>
                  <span className="text-[10px] text-muted-foreground">{p.protocol}://</span>
                </div>
                {p.isDefault && <span className="text-[9px] text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">Default</span>}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Storage & Data */}
      <Section title="Storage & Data" icon={HardDrive}>
        <div className="flex items-center justify-between py-2">
          <p className="text-sm text-foreground">App size</p>
          <span className="text-xs text-muted-foreground">{app.size}</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <p className="text-sm text-foreground">Local data</p>
          <span className="text-xs text-muted-foreground">0 MB</span>
        </div>
        <button className="rounded-lg bg-secondary px-4 py-2 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors w-full">
          Clear Local Data
        </button>
      </Section>

      {/* Updates */}
      <Section title="Updates" icon={RefreshCw}>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm text-foreground">Current version</p>
            <p className="text-[10px] text-muted-foreground">Updated {app.lastUpdated}</p>
          </div>
          <span className="text-xs text-foreground">v{app.version}</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <p className="text-sm text-foreground">Update source</p>
          <span className="text-xs text-muted-foreground capitalize">{app.updateSource.replace(/-/g, " ")}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--trust-safe))]">
          <Check className="h-3.5 w-3.5" /> Up to date
        </div>
      </Section>

      {/* Lifecycle Actions */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Actions</h3>
        <div className="grid gap-2 sm:grid-cols-3">
          <button className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-3 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors">
            <RefreshCw className="h-3.5 w-3.5" /> Repair
          </button>
          <button onClick={handleReinstall}
            className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-3 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors">
            <Download className="h-3.5 w-3.5" /> Reinstall
          </button>
          <button onClick={() => navigate(`/app-store/receipts/${app.id}`)}
            className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-3 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors">
            <Shield className="h-3.5 w-3.5" /> View Receipts
          </button>
          {isInstalled && (
            <button onClick={handleUninstall}
              className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors sm:col-span-3">
              <Trash2 className="h-3.5 w-3.5" /> Uninstall {app.name}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppManagePage;
