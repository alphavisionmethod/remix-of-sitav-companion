import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Cloud, HardDrive, Smartphone, RefreshCw, Shield, Clock,
  Trash2, History, Wifi, WifiOff, CheckCircle, Settings
} from "lucide-react";
import { cloudStorageService } from "@/lib/cloud-backbone/cloud-storage-service";
import { cloudDeviceService } from "@/lib/cloud-backbone/cloud-device-service";
import { cloudQuotaService } from "@/lib/cloud-backbone/cloud-quota-service";
import { toast } from "sonner";

export default function UserCloudSettings() {
  const [selectiveSync, setSelectiveSync] = useState(true);
  const [offlineMode, setOfflineMode] = useState(true);
  const [repairing, setRepairing] = useState(false);

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

  return (
    <div className="p-4 md:p-6 max-w-[900px] mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Cloud className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cloud Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your storage, devices, and sync preferences</p>
        </div>
      </div>

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
                  <p className="text-xs text-muted-foreground">v{d.clientVersion} · {d.isCurrent ? "This device" : "Last seen recently"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={cloudDeviceService.getTrustBadgeVariant(d.trustState)} className="text-xs capitalize">{d.trustState}</Badge>
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

      {/* Sync & Offline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-primary" /> Sync & Offline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Selective Sync</p>
              <p className="text-xs text-muted-foreground">Choose which folders sync to this device</p>
            </div>
            <Switch checked={selectiveSync} onCheckedChange={setSelectiveSync} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Offline Mode</p>
              <p className="text-xs text-muted-foreground">Cache files locally for offline access</p>
            </div>
            <Switch checked={offlineMode} onCheckedChange={setOfflineMode} />
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

      {/* Privacy & Security */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
            <div>
              <p className="text-sm font-medium">Encryption</p>
              <p className="text-xs text-muted-foreground">All files encrypted at rest (AES-256)</p>
            </div>
            <Badge variant="default" className="text-xs">Active</Badge>
          </div>
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
            <History className="h-4 w-4 text-primary" /> Recovery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start text-sm" onClick={() => toast.info("Trash viewer opening...")}>
            <Trash2 className="h-4 w-4 mr-2" /> Restore Deleted Files
          </Button>
          <Button variant="outline" className="w-full justify-start text-sm" onClick={() => toast.info("Version history opening...")}>
            <History className="h-4 w-4 mr-2" /> Version History
          </Button>
          <Button variant="outline" className="w-full justify-start text-sm" onClick={() => toast.info("Activity log opening...")}>
            <Clock className="h-4 w-4 mr-2" /> Recent Activity
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
