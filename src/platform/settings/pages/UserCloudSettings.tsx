import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Cloud, HardDrive, Smartphone, RefreshCw, Shield, Clock,
  Trash2, History, CheckCircle, Lock, Wifi, Laptop, TabletSmartphone,
  Folder, FolderOpen, Eye, EyeOff, Zap, Radio, AlertTriangle,
  FileText, Image, Music, Video, Database, Globe, Sparkles,
  Download, Users, Activity, Wrench, Search, Files, Bell, LifeBuoy
} from "lucide-react";
import { cloudStorageService } from "@/platform/cloud/cloud-storage-service";
import { cloudDeviceService } from "@/platform/cloud/cloud-device-service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SyncStatusIndicator } from "@/platform/sita/components/sita/SyncStatusIndicator";
import { SyncActivityJournal } from "@/platform/sita/components/sita/SyncActivityJournal";
import { CloudFileBrowser } from "@/platform/cloud/components/cloud/CloudFileBrowser";
import { CloudTrashManager } from "@/platform/cloud/components/cloud/CloudTrashManager";
import { CloudActivityTimeline } from "@/platform/cloud/components/cloud/CloudActivityTimeline";
import { CloudDeviceSafety } from "@/platform/cloud/components/cloud/CloudDeviceSafety";
import { CloudImportExport } from "@/platform/cloud/components/cloud/CloudImportExport";
import { CloudNamespaceToggles } from "@/platform/cloud/components/cloud/CloudNamespaceToggles";
import { CloudDeviceOwnership } from "@/platform/cloud/components/cloud/CloudDeviceOwnership";
import { UserSupportEscalation } from "@/platform/cloud/components/cloud/UserSupportEscalation";
import { UserNotificationCenter } from "@/platform/cloud/components/cloud/UserNotificationCenter";
import { PlatformDegradedBanner } from "@/platform/cloud/components/cloud/PlatformDegradedBanner";

/* ── Namespace selective sync config ── */
const SYNC_NAMESPACES = [
  { key: "files.documents", label: "Documents", icon: FileText, size: "1.2 GB", enabled: true },
  { key: "files.photos", label: "Photos", icon: Image, size: "4.8 GB", enabled: true },
  { key: "files.music", label: "Music", icon: Music, size: "2.1 GB", enabled: false },
  { key: "files.videos", label: "Videos", icon: Video, size: "8.3 GB", enabled: false },
  { key: "settings.all", label: "Settings & Preferences", icon: Database, size: "12 MB", enabled: true },
  { key: "session.desktop", label: "Session & Continuity", icon: Laptop, size: "48 MB", enabled: true },
];

const ENCRYPTION_NAMESPACES = [
  { namespace: "files.documents", encryption: "encrypted-at-rest", label: "Documents" },
  { namespace: "files.photos", encryption: "standard", label: "Photos" },
  { namespace: "settings.all", encryption: "e2ee", label: "Settings" },
  { namespace: "session.desktop", encryption: "device-bound", label: "Sessions" },
];

const ENCRYPTION_LABELS: Record<string, { label: string; color: string }> = {
  standard: { label: "Standard", color: "text-muted-foreground" },
  "encrypted-at-rest": { label: "Encrypted at Rest", color: "text-blue-400" },
  e2ee: { label: "End-to-End", color: "text-emerald-400" },
  "device-bound": { label: "Device Bound", color: "text-amber-400" },
};

export default function UserCloudSettings() {
  const [selectiveSync, setSelectiveSync] = useState(true);
  const [offlineMode, setOfflineMode] = useState(true);
  const [sessionContinuity, setSessionContinuity] = useState(true);
  const [nearbySync, setNearbySync] = useState(false);
  const [predictiveSync, setPredictiveSync] = useState(true);
  const [namespaceStates, setNamespaceStates] = useState<Record<string, boolean>>(
    Object.fromEntries(SYNC_NAMESPACES.map(ns => [ns.key, ns.enabled]))
  );
  const [repairing, setRepairing] = useState(false);
  const [activeTab, setActiveTab] = useState("files");

  const usedBytes = 3_200_000_000;
  const quotaBytes = 107_374_182_400;
  const usagePct = Math.round((usedBytes / quotaBytes) * 100);
  const devices = cloudDeviceService.getDemoDevices().slice(0, 3);

  const handleRepairSync = async () => {
    setRepairing(true);
    await new Promise(r => setTimeout(r, 2000));
    toast.success("Sync repaired successfully");
    setRepairing(false);
  };

  const toggleNamespace = (key: string) => {
    setNamespaceStates(prev => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success(`${key} sync ${next[key] ? "enabled" : "disabled"}`);
      return next;
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-[900px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Cloud className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cloud & Sync</h1>
            <p className="text-sm text-muted-foreground">Files, storage, devices, sync & privacy</p>
          </div>
        </div>
        <SyncStatusIndicator />
      </div>

      {/* Sync Confidence Banner */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <CheckCircle className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Everything synced</p>
          <p className="text-xs text-muted-foreground">Last synced just now · 3 devices connected · No blockers</p>
        </div>
        <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/30">
          <Shield className="h-3 w-3 mr-1" /> Verified
        </Badge>
      </div>

      {/* Over-Quota Warning (shown when usage > 85%) */}
      {usagePct > 85 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Storage almost full ({usagePct}%)</p>
            <p className="text-xs text-muted-foreground">
              Clean up old files, empty trash, or upgrade your plan to avoid sync pausing.
            </p>
          </div>
          <Button size="sm" variant="outline" className="text-xs" onClick={() => toast.info("Plan upgrade options shown")}>Upgrade</Button>
        </div>
      )}

      {/* Tab Navigation */}
      {/* Degraded Mode Banner */}
      <PlatformDegradedBanner />

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 md:grid-cols-10">
          <TabsTrigger value="files" className="flex items-center gap-1.5 text-xs">
            <Files className="h-3.5 w-3.5" /> Files
          </TabsTrigger>
          <TabsTrigger value="trash" className="flex items-center gap-1.5 text-xs">
            <Trash2 className="h-3.5 w-3.5" /> Trash
          </TabsTrigger>
          <TabsTrigger value="devices" className="flex items-center gap-1.5 text-xs">
            <Smartphone className="h-3.5 w-3.5" /> Devices
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-1.5 text-xs">
            <Activity className="h-3.5 w-3.5" /> Activity
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Sync
          </TabsTrigger>
          <TabsTrigger value="safety" className="flex items-center gap-1.5 text-xs">
            <Shield className="h-3.5 w-3.5" /> Safety
          </TabsTrigger>
          <TabsTrigger value="transfer" className="flex items-center gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Transfer
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-1.5 text-xs">
            <LifeBuoy className="h-3.5 w-3.5" /> Support
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1.5 text-xs">
            <Bell className="h-3.5 w-3.5" /> Alerts
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1.5 text-xs">
            <Lock className="h-3.5 w-3.5" /> Settings
          </TabsTrigger>
        </TabsList>

        {/* FILES TAB */}
        <TabsContent value="files" className="mt-4">
          <CloudFileBrowser />
        </TabsContent>

        {/* TRASH TAB */}
        <TabsContent value="trash" className="mt-4">
          <CloudTrashManager />
        </TabsContent>

        {/* ACTIVITY TAB */}
        <TabsContent value="activity" className="mt-4">
          <CloudActivityTimeline />
        </TabsContent>

        {/* SYNC TAB */}
        <TabsContent value="sync" className="mt-4 space-y-4">
          {/* Storage Usage */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-primary" /> Storage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={usagePct} className="h-3" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{cloudStorageService.formatBytes(usedBytes)} used</span>
                <span className="font-medium">{cloudStorageService.formatBytes(quotaBytes)} total</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Pro Plan</Badge>
                <span className="text-xs text-muted-foreground">$9.99/mo</span>
              </div>
            </CardContent>
          </Card>

          {/* Devices */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-primary" /> Your Devices ({devices.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {devices.map(d => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{cloudDeviceService.getPlatformIcon(d.platform)}</span>
                    <div>
                      <p className="text-sm font-medium">{d.deviceName}</p>
                      <p className="text-xs text-muted-foreground">
                        v{d.clientVersion} · {d.isCurrent ? "This device" : "Last seen recently"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {d.isCurrent && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Online
                      </span>
                    )}
                    <Badge variant={cloudDeviceService.getTrustBadgeVariant(d.trustState)} className="text-xs capitalize">
                      {d.trustState}
                    </Badge>
                    {!d.isCurrent && (
                      <Button size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={() => toast.info("Device removed")}>
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Selective Sync */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-primary" /> Selective Sync
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground mb-3">Choose which data categories sync to this device</p>
              {SYNC_NAMESPACES.map(ns => {
                const Icon = ns.icon;
                const on = namespaceStates[ns.key] ?? false;
                return (
                  <div key={ns.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{ns.label}</p>
                        <p className="text-xs text-muted-foreground">{ns.size}</p>
                      </div>
                    </div>
                    <Switch checked={on} onCheckedChange={() => toggleNamespace(ns.key)} />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Sync Controls */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-primary" /> Sync & Continuity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Session Continuity</p>
                  <p className="text-xs text-muted-foreground">Resume open apps & windows on other devices</p>
                </div>
                <Switch checked={sessionContinuity} onCheckedChange={setSessionContinuity} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Offline Mode</p>
                  <p className="text-xs text-muted-foreground">Cache files locally for offline access</p>
                </div>
                <Switch checked={offlineMode} onCheckedChange={setOfflineMode} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Nearby Sync</p>
                  <p className="text-xs text-muted-foreground">Transfer files to nearby devices over local network</p>
                </div>
                <Switch checked={nearbySync} onCheckedChange={setNearbySync} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Smart Pre-sync
                  </p>
                  <p className="text-xs text-muted-foreground">Preload likely-needed files on active devices</p>
                </div>
                <Switch checked={predictiveSync} onCheckedChange={setPredictiveSync} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm">Sync Status: Up to date</span>
                </div>
                <Button size="sm" variant="outline" className="text-xs" disabled={repairing} onClick={handleRepairSync}>
                  {repairing ? "Repairing..." : "Repair Sync"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Journal */}
          <SyncActivityJournal maxEntries={8} />
        </TabsContent>

        {/* DEVICES TAB */}
        <TabsContent value="devices" className="mt-4">
          <CloudDeviceOwnership />
        </TabsContent>

        {/* SAFETY TAB */}
        <TabsContent value="safety" className="mt-4">
          <CloudDeviceSafety />
        </TabsContent>

        {/* TRANSFER TAB */}
        <TabsContent value="transfer" className="mt-4">
          <CloudImportExport />
        </TabsContent>

        {/* SETTINGS TAB */}
        <TabsContent value="settings" className="mt-4 space-y-4">
          {/* Namespace Governance */}
          <CloudNamespaceToggles />
          {/* Encryption */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Privacy & Encryption
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground mb-2">Encryption class applied per data category</p>
              {ENCRYPTION_NAMESPACES.map(ns => {
                const enc = ENCRYPTION_LABELS[ns.encryption] ?? ENCRYPTION_LABELS.standard;
                return (
                  <div key={ns.namespace} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                    <div className="flex items-center gap-3">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">{ns.label}</p>
                    </div>
                    <Badge variant="outline" className={cn("text-xs", enc.color)}>{enc.label}</Badge>
                  </div>
                );
              })}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <div>
                  <p className="text-sm font-medium">Transfer Security</p>
                  <p className="text-xs text-muted-foreground">TLS 1.3 for all sync connections</p>
                </div>
                <Badge variant="default" className="text-xs">Enforced</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recovery */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <History className="h-4 w-4 text-primary" /> Recovery & History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-sm" onClick={() => setActiveTab("trash")}>
                <Trash2 className="h-4 w-4 mr-2" /> Restore Deleted Files
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm" onClick={() => toast.info("Version history available per file")}>
                <History className="h-4 w-4 mr-2" /> Version History Browser
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm" onClick={() => toast.info("Data export requested")}>
                <Download className="h-4 w-4 mr-2" /> Export All Data
              </Button>
            </CardContent>
          </Card>

          {/* Diagnostics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wrench className="h-4 w-4 text-primary" /> Repair & Diagnostics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Reset Local Cache", desc: "Clear and rebuild sync cache", risk: "safe" },
                { label: "Rebuild Search Index", desc: "Recreate local search index", risk: "safe" },
                { label: "Retry Failed Uploads", desc: "Retry all pending upload jobs", risk: "safe" },
                { label: "Force Re-download", desc: "Re-download all data from cloud", risk: "medium" },
              ].map(action => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="w-full justify-between text-sm"
                  onClick={() => toast.success(`${action.label} completed`)}
                >
                  <span className="flex items-center gap-2">
                    <Wrench className="h-4 w-4" /> {action.label}
                  </span>
                  <Badge variant="outline" className={cn("text-xs", action.risk === "safe" ? "text-emerald-400 border-emerald-400/30" : "text-amber-400 border-amber-400/30")}>
                    {action.risk}
                  </Badge>
                </Button>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SUPPORT TAB */}
        <TabsContent value="support" className="mt-4">
          <UserSupportEscalation />
        </TabsContent>

        {/* NOTIFICATIONS TAB */}
        <TabsContent value="notifications" className="mt-4">
          <UserNotificationCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
}
