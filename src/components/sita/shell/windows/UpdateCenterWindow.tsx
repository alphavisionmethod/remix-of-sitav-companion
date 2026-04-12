// ═══════════════════════════════════════════════════════════════
// SITA OS — Update Center Window
// System updates, app updates, rollback support
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { Download, RotateCcw, CheckCircle, AlertTriangle, RefreshCw, ArrowDownToLine, Package } from "lucide-react";
import {
  AppLayout, VStack, HStack, Divider,
} from "@/lib/nova-sdk/ui/layout";
import {
  NovaText, NovaButton, NovaCard, NovaSectionLabel,
  NovaToggle, NovaBadge, NovaToolbar, NovaAvatar,
} from "@/lib/nova-sdk/ui/components";
import { AppStateWrapper } from "@/components/sita/shell/AppStateWrapper";
import { SystemUpdateService, type UpdateLogEntry, type UpdateRelease } from "@/lib/services/system-updates";
import { useAppPlatform } from "@/contexts/AppPlatformContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ── Tabs ─────────────────────────────────────────────────────

type Tab = "system" | "apps" | "rollback";

function SystemUpdatesTab() {
  const [checking, setChecking] = useState(false);
  const [channel, setChannel] = useState<"stable" | "beta" | "canary">("stable");
  const [latest, setLatest] = useState<UpdateRelease | null>(null);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const version = SystemUpdateService.getAppVersion();

  const checkUpdates = useCallback(async () => {
    setChecking(true);
    const release = await SystemUpdateService.checkForUpdates(channel);
    setLatest(release);
    setChecking(false);
    if (!release) toast.info("SITA OS is up to date");
  }, [channel]);

  const handleInstall = useCallback(async () => {
    if (!latest) return;
    setDownloading(true);
    setProgress(0);
    // Simulated download progress
    const iv = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(iv); return 100; }
        return p + Math.random() * 15;
      });
    }, 300);
    setTimeout(async () => {
      clearInterval(iv);
      setProgress(100);
      await SystemUpdateService.logUpdate(latest.version, "success");
      toast.success(`Updated to ${latest.version}`);
      setDownloading(false);
      setLatest(null);
    }, 3000);
  }, [latest]);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="normal" align="center" className="py-3">
          <NovaAvatar icon="▣" size={48} gradient="from-[hsl(265_55%_58%)] to-[hsl(210_80%_55%)]" />
          <NovaText variant="title">SITA OS</NovaText>
          <NovaText variant="label" muted>Version {version}</NovaText>
          <HStack spacing="tight">
            {(["stable", "beta", "canary"] as const).map(ch => (
              <button
                key={ch}
                onClick={() => setChannel(ch)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all",
                  channel === ch
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                )}
              >
                {ch.charAt(0).toUpperCase() + ch.slice(1)}
              </button>
            ))}
          </HStack>
        </VStack>
      </NovaCard>

      {latest && (
        <NovaCard>
          <VStack spacing="tight">
            <HStack spacing="tight" align="center" justify="between">
              <VStack spacing="micro">
                <NovaText variant="body">v{latest.version}</NovaText>
                <NovaText variant="label" muted className="!text-[10px]">
                  {latest.is_critical ? "Critical Update" : "Available"}
                </NovaText>
              </VStack>
              {latest.is_critical && <NovaBadge variant="destructive">Critical</NovaBadge>}
            </HStack>
            {latest.release_notes && (
              <NovaText variant="label" muted className="!text-[10px] whitespace-pre-wrap">{latest.release_notes}</NovaText>
            )}
            {downloading ? (
              <div className="w-full h-2 rounded-full bg-secondary/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-300"
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
            ) : (
              <NovaButton variant="primary" onClick={handleInstall} icon={<Download className="h-3.5 w-3.5" />} className="!text-[11px]">
                Download & Install
              </NovaButton>
            )}
          </VStack>
        </NovaCard>
      )}

      <NovaCard>
        <VStack spacing="tight">
          <HStack spacing="tight" justify="between" align="center">
            <NovaText variant="body">Auto-Update</NovaText>
            <NovaToggle checked={autoUpdate} onChange={setAutoUpdate} />
          </HStack>
          <Divider />
          <NovaButton
            variant="secondary"
            onClick={checkUpdates}
            disabled={checking}
            icon={<RefreshCw className={cn("h-3.5 w-3.5", checking && "animate-spin")} />}
            className="w-full !text-[11px]"
          >
            {checking ? "Checking…" : "Check for Updates"}
          </NovaButton>
        </VStack>
      </NovaCard>
    </VStack>
  );
}

function AppUpdatesTab() {
  const { apps, updateApp } = useAppPlatform();
  const [updating, setUpdating] = useState<Set<string>>(new Set());

  const updatableApps = apps.filter(a => a.installStatus === "installed");

  const handleUpdate = useCallback(async (appId: string) => {
    setUpdating(prev => new Set(prev).add(appId));
    await updateApp(appId);
    setUpdating(prev => { const n = new Set(prev); n.delete(appId); return n; });
    toast.success("App updated");
  }, [updateApp]);

  const handleUpdateAll = useCallback(async () => {
    for (const app of updatableApps) {
      await handleUpdate(app.id);
    }
  }, [updatableApps, handleUpdate]);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <HStack spacing="tight" justify="between" align="center">
          <NovaText variant="body">{updatableApps.length} apps installed</NovaText>
          <NovaButton variant="primary" onClick={handleUpdateAll} icon={<ArrowDownToLine className="h-3.5 w-3.5" />} className="!text-[10px] !py-1 !px-2">
            Update All
          </NovaButton>
        </HStack>
      </NovaCard>

      {updatableApps.map(app => (
        <NovaCard key={app.id}>
          <HStack spacing="tight" align="center" justify="between">
            <HStack spacing="tight" align="center" className="flex-1 min-w-0">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-sm", app.iconBg)}>
                {app.icon}
              </div>
              <VStack spacing="micro" className="min-w-0">
                <NovaText variant="body" className="truncate">{app.name}</NovaText>
                <NovaText variant="label" muted className="!text-[9px]">v{app.version}</NovaText>
              </VStack>
            </HStack>
            <NovaButton
              variant="secondary"
              onClick={() => handleUpdate(app.id)}
              disabled={updating.has(app.id)}
              className="!text-[9px] !py-0.5 !px-2"
            >
              {updating.has(app.id) ? "…" : "Update"}
            </NovaButton>
          </HStack>
        </NovaCard>
      ))}
    </VStack>
  );
}

function RollbackTab() {
  const [history, setHistory] = useState<UpdateLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SystemUpdateService.getUpdateHistory().then(h => { setHistory(h); setLoading(false); });
  }, []);

  const handleRollback = useCallback(async (entry: UpdateLogEntry) => {
    await SystemUpdateService.rollbackUpdate(entry.id);
    toast.success(`Rolled back to v${entry.from_version || "previous"}`);
    const h = await SystemUpdateService.getUpdateHistory();
    setHistory(h);
  }, []);

  const statusIcon = (status: string) => {
    if (status === "success") return <CheckCircle className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" />;
    if (status === "failed") return <AlertTriangle className="h-3.5 w-3.5 text-destructive" />;
    if (status === "rolled-back") return <RotateCcw className="h-3.5 w-3.5 text-[hsl(var(--sita-gold))]" />;
    return <Package className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  if (loading) return <NovaText variant="label" muted>Loading history…</NovaText>;

  return (
    <VStack spacing="tight">
      <NovaCard>
        <NovaSectionLabel className="!px-0">Update History</NovaSectionLabel>
        {history.length === 0 ? (
          <NovaText variant="label" muted>No update history</NovaText>
        ) : (
          <VStack spacing="tight">
            {history.map(entry => (
              <div key={entry.id}>
                <HStack spacing="tight" align="center" justify="between">
                  <HStack spacing="tight" align="center">
                    {statusIcon(entry.status)}
                    <VStack spacing="micro">
                      <NovaText variant="body" className="!text-[11px]">
                        {entry.from_version ? `${entry.from_version} → ${entry.to_version}` : entry.to_version}
                      </NovaText>
                      <NovaText variant="label" muted className="!text-[9px]">
                        {entry.started_at ? new Date(entry.started_at).toLocaleString() : "—"}
                      </NovaText>
                    </VStack>
                  </HStack>
                  <HStack spacing="tight" align="center">
                    <NovaBadge variant={entry.status === "success" ? "success" : entry.status === "failed" ? "destructive" : "default"}>
                      {entry.status}
                    </NovaBadge>
                    {entry.status === "success" && (
                      <NovaButton
                        variant="ghost"
                        onClick={() => handleRollback(entry)}
                        icon={<RotateCcw className="h-3 w-3" />}
                        className="!text-[9px] !py-0.5 !px-1.5"
                      >
                        Rollback
                      </NovaButton>
                    )}
                  </HStack>
                </HStack>
                <Divider />
              </div>
            ))}
          </VStack>
        )}
      </NovaCard>
    </VStack>
  );
}

// ── Main ─────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: "system", label: "System" },
  { id: "apps", label: "Apps" },
  { id: "rollback", label: "Rollback" },
];

export function UpdateCenterWindow() {
  const [tab, setTab] = useState<Tab>("system");

  const toolbar = (
    <NovaToolbar title="Update Center" leading={<Download className="h-4 w-4 text-[hsl(var(--primary))]" />} />
  );

  return (
    <AppStateWrapper state="ready" accentGradient="from-[hsl(210_80%_55%)] to-[hsl(152_55%_48%)]">
      <AppLayout toolbar={toolbar} minHeight={340}>
        <VStack spacing="tight">
          {/* Tab bar */}
          <HStack spacing="tight" className="px-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all",
                  tab === t.id
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                    : "bg-secondary/30 text-muted-foreground hover:bg-secondary/60"
                )}
              >
                {t.label}
              </button>
            ))}
          </HStack>

          {tab === "system" && <SystemUpdatesTab />}
          {tab === "apps" && <AppUpdatesTab />}
          {tab === "rollback" && <RollbackTab />}
        </VStack>
      </AppLayout>
    </AppStateWrapper>
  );
}
