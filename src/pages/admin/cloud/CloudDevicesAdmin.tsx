import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ShieldOff, KeyRound, Smartphone, Monitor, Globe, Laptop } from "lucide-react";
import { cloudDeviceService, type CloudDevice, type TrustState } from "@/lib/cloud-backbone/cloud-device-service";
import { toast } from "sonner";

function timeSince(dateStr: string) {
  const ms = Date.now() - new Date(dateStr).getTime();
  if (ms < 60000) return "Just now";
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ago`;
  if (ms < 86400000) return `${Math.floor(ms / 3600000)}h ago`;
  return `${Math.floor(ms / 86400000)}d ago`;
}

const platformIcons: Record<string, React.ElementType> = {
  ios: Smartphone, android: Smartphone, macos: Laptop, windows: Monitor, linux: Monitor, web: Globe,
};

export function CloudDevicesAdmin() {
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [trustFilter, setTrustFilter] = useState<"all" | TrustState>("all");
  const fleet = cloudDeviceService.getFleetReport();
  const devices = cloudDeviceService.getDemoDevices();

  const filtered = devices.filter(d => {
    const matchSearch = d.deviceName.toLowerCase().includes(search.toLowerCase()) || d.userName.toLowerCase().includes(search.toLowerCase());
    const matchPlatform = platformFilter === "all" || d.platform === platformFilter;
    const matchTrust = trustFilter === "all" || d.trustState === trustFilter;
    return matchSearch && matchPlatform && matchTrust;
  });

  return (
    <div className="space-y-4">
      {/* Fleet Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total", value: fleet.totalDevices, color: "bg-primary/10" },
          { label: "Trusted", value: fleet.trustedDevices, color: "bg-emerald-500/10" },
          { label: "Suspicious", value: fleet.suspiciousDevices, color: "bg-amber-500/10" },
          { label: "Revoked", value: fleet.revokedDevices, color: "bg-red-500/10" },
          { label: "Need Reauth", value: fleet.devicesNeedingReauth, color: "bg-blue-500/10" },
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
          <Input placeholder="Search devices or users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1">
          {["all", "macos", "windows", "ios", "android", "web", "linux"].map(p => (
            <Button key={p} size="sm" variant={platformFilter === p ? "default" : "outline"} onClick={() => setPlatformFilter(p)} className="capitalize text-xs">
              {p === "all" ? "All" : p}
            </Button>
          ))}
        </div>
        <div className="flex gap-1">
          {(["all", "trusted", "suspicious", "revoked", "pending"] as const).map(t => (
            <Button key={t} size="sm" variant={trustFilter === t ? "default" : "outline"} onClick={() => setTrustFilter(t)} className="capitalize text-xs">
              {t}
            </Button>
          ))}
        </div>
      </div>

      {/* Devices Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Trust</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(device => {
                const PlatIcon = platformIcons[device.platform] || Globe;
                return (
                  <TableRow key={device.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <PlatIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{device.deviceName}</span>
                        {device.isCurrent && <Badge variant="outline" className="text-[10px]">Current</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{device.userName}</TableCell>
                    <TableCell>
                      <span className="text-xs capitalize">{device.platform}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-mono ${device.clientVersion < "2.0.0" ? "text-amber-400" : "text-muted-foreground"}`}>
                        v{device.clientVersion}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={cloudDeviceService.getTrustBadgeVariant(device.trustState)} className="text-xs capitalize">
                        {device.trustState}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{timeSince(device.lastSeenAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        {device.trustState !== "revoked" && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-red-400 hover:text-red-300"
                            onClick={() => { cloudDeviceService.revokeDevice(device.id); toast.warning(`Revoked: ${device.deviceName}`); }}>
                            <ShieldOff className="h-3 w-3 mr-1" /> Revoke
                          </Button>
                        )}
                        {device.requiresReauth && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-amber-400"
                            onClick={() => { cloudDeviceService.forceReauth(device.id); toast.info("Re-auth required sent"); }}>
                            <KeyRound className="h-3 w-3 mr-1" /> Reauth
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
