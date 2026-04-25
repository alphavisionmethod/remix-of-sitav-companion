// ═══════════════════════════════════════════════════════════════
// SITA OS — Cloud Sync Window
// Sync status, targets, conflict resolution
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { Cloud, RefreshCw, Check, AlertTriangle, Wifi, WifiOff, FileText, Settings, MonitorSmartphone } from "lucide-react";
import {
  AppLayout, VStack, HStack, Divider,
} from "@/platform/nova-sdk/ui/layout";
import {
  NovaText, NovaButton, NovaCard, NovaSectionLabel,
  NovaToggle, NovaBadge, NovaToolbar,
} from "@/platform/nova-sdk/ui/components";
import { AppStateWrapper } from "@/platform/sita/components/sita/shell/AppStateWrapper";
import { CloudSyncManager, type SyncStatus, type ConflictRecord } from "@/lib/core-services/cloud-sync-manager";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ── Singleton sync manager ────────────────────────────────────

let _syncManager: CloudSyncManager | null = null;
function getSyncManager(): CloudSyncManager {
  if (!_syncManager) {
    _syncManager = new CloudSyncManager();
    _syncManager.start(30_000);
  }
  return _syncManager;
}

// ── Sync Status Section ───────────────────────────────────────

function SyncStatusSection() {
  const [status, setStatus] = useState<SyncStatus | null>(null);

  useEffect(() => {
    const update = () => setStatus(getSyncManager().getSyncStatus());
    update();
    const iv = setInterval(update, 5000);
    return () => clearInterval(iv);
  }, []);

  if (!status) return null;

  const connectionColor = status.connected
    ? status.syncLagMs < 30_000 ? "hsl(var(--trust-safe))" : "hsl(var(--sita-gold))"
    : "hsl(var(--destructive))";

  return (
    <NovaCard>
      <VStack spacing="tight">
        <NovaSectionLabel className="!px-0">Sync Status</NovaSectionLabel>
        <HStack spacing="tight" align="center">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: connectionColor }} />
          <NovaText variant="body">{status.connected ? "Connected" : "Disconnected"}</NovaText>
          {status.connected ? <Wifi className="h-3.5 w-3.5 text-muted-foreground" /> : <WifiOff className="h-3.5 w-3.5 text-destructive" />}
        </HStack>
        <Divider />
        <HStack spacing="tight" justify="between">
          <NovaText variant="label" muted>Last Sync</NovaText>
          <NovaText variant="label" muted>
            {status.lastSyncAt ? new Date(status.lastSyncAt).toLocaleTimeString() : "Never"}
          </NovaText>
        </HStack>
        <HStack spacing="tight" justify="between">
          <NovaText variant="label" muted>Pending</NovaText>
          <NovaBadge variant={status.pendingOutbound > 0 ? "default" : "success"}>
            {status.pendingOutbound} outbound
          </NovaBadge>
        </HStack>
        <HStack spacing="tight" justify="between">
          <NovaText variant="label" muted>Sync Lag</NovaText>
          <NovaText variant="label" muted>{Math.round(status.syncLagMs / 1000)}s</NovaText>
        </HStack>
        <HStack spacing="tight" justify="between">
          <NovaText variant="label" muted>Node ID</NovaText>
          <NovaText variant="label" muted className="font-mono !text-[9px]">{status.nodeId}</NovaText>
        </HStack>
        <HStack spacing="tight" justify="between">
          <NovaText variant="label" muted>Version</NovaText>
          <NovaBadge variant="info">v{status.version}</NovaBadge>
        </HStack>
      </VStack>
    </NovaCard>
  );
}

// ── Sync Targets ──────────────────────────────────────────────

const SYNC_TARGETS = [
  { id: "files", label: "Files", icon: <FileText className="h-4 w-4" />, description: "Documents and media" },
  { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" />, description: "Preferences and config" },
  { id: "sessions", label: "Sessions", icon: <MonitorSmartphone className="h-4 w-4" />, description: "Window state and tabs" },
];

function SyncTargetsSection() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    files: true, settings: true, sessions: false,
  });

  const toggle = useCallback((id: string, val: boolean) => {
    setEnabled(prev => ({ ...prev, [id]: val }));
    if (val) {
      getSyncManager().pushUpdate("cloud", "preference", { syncTarget: id, enabled: true });
      toast.success(`${id} sync enabled`);
    } else {
      toast.info(`${id} sync disabled`);
    }
  }, []);

  return (
    <NovaCard>
      <VStack spacing="tight">
        <NovaSectionLabel className="!px-0">Sync Targets</NovaSectionLabel>
        {SYNC_TARGETS.map((target, i) => (
          <div key={target.id}>
            <HStack spacing="tight" align="center" justify="between">
              <HStack spacing="tight" align="center">
                <span className="text-muted-foreground">{target.icon}</span>
                <VStack spacing="micro">
                  <NovaText variant="body">{target.label}</NovaText>
                  <NovaText variant="label" muted className="!text-[9px]">{target.description}</NovaText>
                </VStack>
              </HStack>
              <NovaToggle checked={enabled[target.id] ?? false} onChange={(v) => toggle(target.id, v)} />
            </HStack>
            {i < SYNC_TARGETS.length - 1 && <Divider />}
          </div>
        ))}
      </VStack>
    </NovaCard>
  );
}

// ── Conflict Resolution ───────────────────────────────────────

function ConflictSection() {
  const [conflicts, setConflicts] = useState<ConflictRecord[]>([]);

  useEffect(() => {
    setConflicts(getSyncManager().getConflicts().filter(c => c.resolution === "unresolved"));
  }, []);

  const resolve = useCallback((id: string, resolution: "local-wins" | "remote-wins") => {
    setConflicts(prev => prev.filter(c => c.id !== id));
    toast.success(`Conflict resolved: ${resolution.replace("-", " ")}`);
  }, []);

  if (conflicts.length === 0) {
    return (
      <NovaCard>
        <HStack spacing="tight" align="center" className="py-2">
          <Check className="h-4 w-4 text-[hsl(var(--trust-safe))]" />
          <NovaText variant="body">No conflicts</NovaText>
        </HStack>
      </NovaCard>
    );
  }

  return (
    <NovaCard>
      <VStack spacing="tight">
        <NovaSectionLabel className="!px-0">Conflicts ({conflicts.length})</NovaSectionLabel>
        {conflicts.map(c => (
          <div key={c.id}>
            <VStack spacing="tight">
              <HStack spacing="tight" align="center">
                <AlertTriangle className="h-3.5 w-3.5 text-[hsl(var(--sita-gold))]" />
                <NovaText variant="body" className="!text-[11px]">{c.details}</NovaText>
              </HStack>
              <HStack spacing="tight">
                <NovaButton variant="secondary" onClick={() => resolve(c.id, "local-wins")} className="!text-[9px] !py-0.5 !px-2 flex-1">
                  Keep Local
                </NovaButton>
                <NovaButton variant="primary" onClick={() => resolve(c.id, "remote-wins")} className="!text-[9px] !py-0.5 !px-2 flex-1">
                  Use Remote
                </NovaButton>
              </HStack>
            </VStack>
            <Divider />
          </div>
        ))}
      </VStack>
    </NovaCard>
  );
}

// ── Main ─────────────────────────────────────────────────────

export function CloudSyncWindow() {
  const [syncing, setSyncing] = useState(false);

  const handleSyncNow = useCallback(() => {
    setSyncing(true);
    getSyncManager().syncState();
    setTimeout(() => { setSyncing(false); toast.success("Sync complete"); }, 1500);
  }, []);

  const toolbar = (
    <NovaToolbar
      title="Cloud Sync"
      leading={<Cloud className="h-4 w-4 text-[hsl(var(--primary))]" />}
      trailing={
        <NovaButton
          variant="ghost"
          onClick={handleSyncNow}
          disabled={syncing}
          icon={<RefreshCw className={cn("h-3.5 w-3.5", syncing && "animate-spin")} />}
          className="!text-[10px] !py-0.5 !px-2"
        >
          Sync Now
        </NovaButton>
      }
    />
  );

  return (
    <AppStateWrapper state="ready" accentGradient="from-[hsl(210_80%_55%)] to-[hsl(265_55%_58%)]">
      <AppLayout toolbar={toolbar} minHeight={340}>
        <VStack spacing="tight">
          <SyncStatusSection />
          <SyncTargetsSection />
          <ConflictSection />
        </VStack>
      </AppLayout>
    </AppStateWrapper>
  );
}
