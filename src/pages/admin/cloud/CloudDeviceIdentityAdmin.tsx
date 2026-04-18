import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Smartphone, Monitor, Tablet, Globe, ShieldCheck, ShieldOff, KeyRound, Eye, RotateCcw, Laptop } from "lucide-react";
import { deviceIdentity, type DeviceIdentity as DevIdentity, type DeviceTrustLevel } from "@/platform/sync-engine/security/device-identity";
import { toast } from "sonner";

const trustColors: Record<DeviceTrustLevel, string> = {
  trusted: "bg-emerald-500/20 text-emerald-400",
  "semi-trusted": "bg-amber-500/20 text-amber-400",
  pending: "bg-blue-500/20 text-blue-400",
  revoked: "bg-red-500/20 text-red-400",
  quarantined: "bg-orange-500/20 text-orange-400",
};

const platformIcons: Record<string, React.ElementType> = {
  "sita-os": Monitor, windows: Monitor, macos: Laptop, linux: Monitor,
  ios: Smartphone, android: Smartphone, web: Globe, chromeos: Laptop,
};

function timeSince(dateStr: string) {
  const ms = Date.now() - new Date(dateStr).getTime();
  if (ms < 60000) return "Just now";
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ago`;
  return `${Math.floor(ms / 86400000)}d ago`;
}

// Seed some demo devices
function ensureDemoDevices() {
  const existing = deviceIdentity.getUserDevices("demo-user");
  if (existing.length > 0) return;

  const d1 = deviceIdentity.registerDevice("demo-user", { name: "Kaelyn's MacBook Pro", type: "laptop", platform: "macos", osVersion: "14.5", appVersion: "2.1.0", capabilities: { supportsE2EE: true, hasTPM: true, hasBiometrics: true } });
  deviceIdentity.approveDevice(d1.deviceId);
  deviceIdentity.setCurrentDevice(d1.deviceId);

  const d2 = deviceIdentity.registerDevice("demo-user", { name: "Kaelyn's iPhone 15", type: "phone", platform: "ios", osVersion: "18.1", appVersion: "2.1.0", capabilities: { supportsE2EE: true, hasBiometrics: true, supportsNearbySync: true } });
  deviceIdentity.approveDevice(d2.deviceId);

  const d3 = deviceIdentity.registerDevice("demo-user", { name: "Office Desktop", type: "desktop", platform: "sita-os", osVersion: "1.0.0", appVersion: "2.1.0", capabilities: { supportsE2EE: true, hasTPM: true, maxStorageBytes: 50 * 1024 * 1024 * 1024 } });
  deviceIdentity.approveDevice(d3.deviceId);

  const d4 = deviceIdentity.registerDevice("demo-user", { name: "Web Browser", type: "web", platform: "web", osVersion: "Chrome 124", appVersion: "2.1.0", capabilities: { supportsE2EE: false, hasSecureStorage: false, supportsBackgroundSync: false, supportsNearbySync: false } });
  deviceIdentity.setTrustLevel(d4.deviceId, "semi-trusted", "Web clients have limited trust", "system");
}

export function CloudDeviceIdentityAdmin() {
  const [search, setSearch] = useState("");
  const [trustFilter, setTrustFilter] = useState<"all" | DeviceTrustLevel>("all");
  const [selectedDevice, setSelectedDevice] = useState<DevIdentity | null>(null);

  ensureDemoDevices();
  const devices = deviceIdentity.getUserDevices("demo-user");
  const fleet = deviceIdentity.getFleetSummary("demo-user");

  const filtered = devices.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.platform.includes(search.toLowerCase());
    const matchTrust = trustFilter === "all" || d.trustLevel === trustFilter;
    return matchSearch && matchTrust;
  });

  const handleRevoke = (deviceId: string) => {
    deviceIdentity.revokeDevice(deviceId);
    toast.success("Device revoked");
    setSelectedDevice(null);
  };

  const handleForceReauth = (deviceId: string) => {
    deviceIdentity.forceReauth(deviceId);
    toast.info("Re-authentication required for device");
  };

  return (
    <div className="space-y-4">
      {/* Fleet Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Devices", value: fleet.totalDevices, color: "bg-primary/10" },
          { label: "Trusted", value: fleet.trustedDevices, color: "bg-emerald-500/10" },
          { label: "Pending", value: fleet.pendingDevices, color: "bg-blue-500/10" },
          { label: "Revoked", value: fleet.revokedDevices, color: "bg-red-500/10" },
          { label: "Platforms", value: Object.keys(fleet.devicesByPlatform).length, color: "bg-purple-500/10" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-lg p-3 ${color}`}>
            <p className="text-xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search devices..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1">
          {(["all", "trusted", "semi-trusted", "pending", "revoked"] as const).map(t => (
            <Button key={t} variant={trustFilter === t ? "default" : "outline"} size="sm" className="text-xs" onClick={() => setTrustFilter(t)}>
              {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Devices Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-primary" /> Device Fleet ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Trust</TableHead>
                <TableHead>E2EE</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead className="w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(dev => {
                const PIcon = platformIcons[dev.platform] || Globe;
                return (
                  <TableRow key={dev.deviceId} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelectedDevice(dev)}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <PIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{dev.name}</p>
                          <p className="text-xs text-muted-foreground">{dev.isCurrent ? "This device" : dev.type}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><span className="text-xs">{dev.platform} · {dev.osVersion}</span></TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${trustColors[dev.trustLevel]}`}>{dev.trustLevel}</Badge>
                    </TableCell>
                    <TableCell>
                      {dev.capabilities.supportsE2EE
                        ? <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        : <ShieldOff className="h-4 w-4 text-muted-foreground/40" />}
                    </TableCell>
                    <TableCell><span className="text-xs text-muted-foreground">{timeSince(dev.lastSeenAt)}</span></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); handleForceReauth(dev.deviceId); }}>
                          <KeyRound className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={(e) => { e.stopPropagation(); handleRevoke(dev.deviceId); }}>
                          <ShieldOff className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Panel */}
      {selectedDevice && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" /> {selectedDevice.name}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedDevice(null)}>×</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground">Device ID</p><p className="font-mono text-xs">{selectedDevice.deviceId.slice(0, 16)}…</p></div>
              <div><p className="text-xs text-muted-foreground">Type</p><p>{selectedDevice.type}</p></div>
              <div><p className="text-xs text-muted-foreground">Registered</p><p>{new Date(selectedDevice.registeredAt).toLocaleDateString()}</p></div>
              <div><p className="text-xs text-muted-foreground">App Version</p><p>v{selectedDevice.appVersion}</p></div>
            </div>

            {/* Capabilities */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Capabilities</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(selectedDevice.capabilities).filter(([, v]) => typeof v === "boolean").map(([k, v]) => (
                  <Badge key={k} variant={v ? "default" : "outline"} className="text-[10px]">
                    {v ? "✓" : "✗"} {k.replace(/([A-Z])/g, " $1").trim()}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Trust History */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Trust History</p>
              <div className="space-y-1.5">
                {selectedDevice.trustHistory.map((th, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">{new Date(th.changedAt).toLocaleString()}</span>
                    <Badge variant="outline" className="text-[10px]">{th.from} → {th.to}</Badge>
                    <span className="text-muted-foreground">{th.reason}</span>
                    <span className="text-muted-foreground/60">by {th.changedBy}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
