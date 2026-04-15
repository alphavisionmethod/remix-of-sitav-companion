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
  Download, Users, Activity, Wrench, Search, Files
} from "lucide-react";
import { cloudStorageService } from "@/lib/cloud-backbone/cloud-storage-service";
import { cloudDeviceService } from "@/lib/cloud-backbone/cloud-device-service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SyncStatusIndicator } from "@/components/sita/SyncStatusIndicator";
import { SyncActivityJournal } from "@/components/sita/SyncActivityJournal";
import { CloudFileBrowser } from "@/components/cloud/CloudFileBrowser";
import { CloudTrashManager } from "@/components/cloud/CloudTrashManager";
import { CloudActivityTimeline } from "@/components/cloud/CloudActivityTimeline";
import { CloudDeviceSafety } from "@/components/cloud/CloudDeviceSafety";
import { CloudImportExport } from "@/components/cloud/CloudImportExport";
import { CloudNamespaceToggles } from "@/components/cloud/CloudNamespaceToggles";

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

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="files" className="flex items-center gap-1.5 text-xs">
            <Files className="h-3.5 w-3.5" /> Files
          </TabsTrigger>
          <TabsTrigger value="trash" className="flex items-center gap-1.5 text-xs">
            <Trash2 className="h-3.5 w-3.5" /> Trash
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Sync
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1.5 text-xs">
            <Shield className="h-3.5 w-3.5" /> Settings
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

        {/* SETTINGS TAB */}
        <TabsContent value="settings" className="mt-4 space-y-4">
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
      </Tabs>
    </div>
  );
}
