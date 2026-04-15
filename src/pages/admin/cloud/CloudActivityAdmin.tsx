import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Clock, FileText, Upload, Download, Trash2,
  Edit, FolderPlus, Share2, Smartphone, RotateCcw,
  Filter, RefreshCw, History
} from "lucide-react";

interface ActivityEntry {
  id: string;
  timestamp: string;
  userName: string;
  deviceName: string;
  platform: string;
  action: string;
  actionType: "upload" | "download" | "edit" | "delete" | "share" | "create" | "restore" | "sync";
  objectPath: string;
  details?: string;
}

interface RestorePoint {
  id: string;
  timestamp: string;
  description: string;
  deviceName: string;
  fileCount: number;
  sizeBytes: number;
  type: "auto" | "manual";
}

const actionIcons: Record<string, React.ElementType> = {
  upload: Upload, download: Download, edit: Edit, delete: Trash2,
  share: Share2, create: FolderPlus, restore: RotateCcw, sync: RefreshCw,
};

const actionColors: Record<string, string> = {
  upload: "text-blue-400 bg-blue-500/10",
  download: "text-cyan-400 bg-cyan-500/10",
  edit: "text-amber-400 bg-amber-500/10",
  delete: "text-red-400 bg-red-500/10",
  share: "text-purple-400 bg-purple-500/10",
  create: "text-emerald-400 bg-emerald-500/10",
  restore: "text-orange-400 bg-orange-500/10",
  sync: "text-primary bg-primary/10",
};

function timeSince(dateStr: string) {
  const ms = Date.now() - new Date(dateStr).getTime();
  if (ms < 60000) return "Just now";
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ago`;
  if (ms < 86400000) return `${Math.floor(ms / 3600000)}h ago`;
  return `${Math.floor(ms / 86400000)}d ago`;
}

function formatBytes(b: number) {
  if (b === 0) return "0 B";
  const k = 1024;
  const s = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / Math.pow(k, i)).toFixed(1)} ${s[i]}`;
}

const demoActivity: ActivityEntry[] = [
  { id: "a1", timestamp: new Date(Date.now() - 120000).toISOString(), userName: "Alice Chen", deviceName: "MacBook Pro", platform: "macos", action: "Uploaded quarterly-report.pdf", actionType: "upload", objectPath: "/documents/reports/quarterly-report.pdf", details: "24.3 MB" },
  { id: "a2", timestamp: new Date(Date.now() - 300000).toISOString(), userName: "Bob Martinez", deviceName: "iPhone 15", platform: "ios", action: "Downloaded project-assets.zip", actionType: "download", objectPath: "/projects/2024/project-assets.zip", details: "156 MB" },
  { id: "a3", timestamp: new Date(Date.now() - 600000).toISOString(), userName: "Alice Chen", deviceName: "MacBook Pro", platform: "macos", action: "Edited budget-2024.xlsx", actionType: "edit", objectPath: "/finance/budget-2024.xlsx", details: "Version 7 → 8" },
  { id: "a4", timestamp: new Date(Date.now() - 900000).toISOString(), userName: "Carol Singh", deviceName: "Windows Desktop", platform: "windows", action: "Deleted old-backups folder", actionType: "delete", objectPath: "/backups/old-backups/", details: "347 files, 2.1 GB" },
  { id: "a5", timestamp: new Date(Date.now() - 1200000).toISOString(), userName: "Dave Kim", deviceName: "Pixel 8", platform: "android", action: "Shared presentation.pptx", actionType: "share", objectPath: "/presentations/presentation.pptx", details: "Link expires in 7 days" },
  { id: "a6", timestamp: new Date(Date.now() - 1800000).toISOString(), userName: "Eve Johnson", deviceName: "Chrome Browser", platform: "web", action: "Created new folder", actionType: "create", objectPath: "/projects/2025-q1/", details: "Empty folder" },
  { id: "a7", timestamp: new Date(Date.now() - 3600000).toISOString(), userName: "Alice Chen", deviceName: "MacBook Pro", platform: "macos", action: "Restored deleted file", actionType: "restore", objectPath: "/documents/contract-final.docx", details: "From trash (deleted 2d ago)" },
  { id: "a8", timestamp: new Date(Date.now() - 5400000).toISOString(), userName: "Frank Li", deviceName: "iPad Air", platform: "ios", action: "Sync completed", actionType: "sync", objectPath: "/", details: "142 files synced, 0 conflicts" },
  { id: "a9", timestamp: new Date(Date.now() - 7200000).toISOString(), userName: "Bob Martinez", deviceName: "iPhone 15", platform: "ios", action: "Uploaded photo-batch", actionType: "upload", objectPath: "/photos/2024-march/", details: "23 photos, 89 MB" },
  { id: "a10", timestamp: new Date(Date.now() - 10800000).toISOString(), userName: "Grace Okafor", deviceName: "Linux Workstation", platform: "linux", action: "Edited config.yaml", actionType: "edit", objectPath: "/settings/config.yaml", details: "Version 3 → 4" },
  { id: "a11", timestamp: new Date(Date.now() - 14400000).toISOString(), userName: "Hiro Tanaka", deviceName: "MacBook Air", platform: "macos", action: "Downloaded archive.tar.gz", actionType: "download", objectPath: "/archives/archive.tar.gz", details: "1.2 GB" },
  { id: "a12", timestamp: new Date(Date.now() - 18000000).toISOString(), userName: "Carol Singh", deviceName: "Windows Desktop", platform: "windows", action: "Shared team folder", actionType: "share", objectPath: "/team/shared-assets/", details: "Shared with 5 users" },
];

const demoRestorePoints: RestorePoint[] = [
  { id: "rp1", timestamp: new Date(Date.now() - 3600000).toISOString(), description: "Auto-snapshot before bulk delete", deviceName: "System", fileCount: 347, sizeBytes: 2_147_483_648, type: "auto" },
  { id: "rp2", timestamp: new Date(Date.now() - 86400000).toISOString(), description: "Daily backup checkpoint", deviceName: "System", fileCount: 12450, sizeBytes: 45_000_000_000, type: "auto" },
  { id: "rp3", timestamp: new Date(Date.now() - 172800000).toISOString(), description: "Manual snapshot by admin", deviceName: "Admin", fileCount: 12380, sizeBytes: 44_200_000_000, type: "manual" },
  { id: "rp4", timestamp: new Date(Date.now() - 259200000).toISOString(), description: "Pre-migration backup", deviceName: "System", fileCount: 12100, sizeBytes: 43_000_000_000, type: "manual" },
  { id: "rp5", timestamp: new Date(Date.now() - 604800000).toISOString(), description: "Weekly full backup", deviceName: "System", fileCount: 11900, sizeBytes: 42_000_000_000, type: "auto" },
];

export function CloudActivityAdmin() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [deviceFilter, setDeviceFilter] = useState<string>("all");

  const filteredActivity = demoActivity.filter(a => {
    const matchSearch = search === "" ||
      a.userName.toLowerCase().includes(search.toLowerCase()) ||
      a.objectPath.toLowerCase().includes(search.toLowerCase()) ||
      a.action.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === "all" || a.actionType === actionFilter;
    const matchDevice = deviceFilter === "all" || a.deviceName.toLowerCase().includes(deviceFilter.toLowerCase());
    return matchSearch && matchAction && matchDevice;
  });

  const uniqueDevices = [...new Set(demoActivity.map(a => a.deviceName))];
  const recentlyChanged = demoActivity.filter(a => a.actionType === "edit" || a.actionType === "upload");
  const deviceGroups = demoActivity.reduce((acc, a) => {
    acc[a.deviceName] = (acc[a.deviceName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Events</p>
            <p className="text-2xl font-bold text-foreground mt-1">{demoActivity.length}</p>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Active Devices</p>
            <p className="text-2xl font-bold text-foreground mt-1">{uniqueDevices.length}</p>
            <p className="text-xs text-muted-foreground">Contributing changes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Recently Changed</p>
            <p className="text-2xl font-bold text-foreground mt-1">{recentlyChanged.length}</p>
            <p className="text-xs text-muted-foreground">Edits & uploads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Restore Points</p>
            <p className="text-2xl font-bold text-foreground mt-1">{demoRestorePoints.length}</p>
            <p className="text-xs text-muted-foreground">Available snapshots</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search files, users, or actions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {["all", "upload", "download", "edit", "delete", "share", "sync"].map(t => (
            <Button key={t} size="sm" variant={actionFilter === t ? "default" : "outline"} onClick={() => setActionFilter(t)} className="capitalize text-xs">
              {t === "all" ? "All Actions" : t}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity Journal */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Activity Journal
              <Badge variant="secondary" className="text-xs ml-auto">{filteredActivity.length} events</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 max-h-[600px] overflow-auto">
            {filteredActivity.map(entry => {
              const Icon = actionIcons[entry.actionType] || FileText;
              const colorClass = actionColors[entry.actionType] || "text-muted-foreground bg-muted";
              return (
                <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/20 transition-colors group">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{entry.userName}</span>
                      <span className="text-xs text-muted-foreground">on {entry.deviceName}</span>
                    </div>
                    <p className="text-xs text-foreground/80 mt-0.5">{entry.action}</p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">{entry.objectPath}</p>
                    {entry.details && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">{entry.details}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">{timeSince(entry.timestamp)}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Device Activity Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-primary" />
                Activity by Device
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(deviceGroups).sort((a, b) => b[1] - a[1]).map(([device, count]) => (
                <div key={device} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() => setDeviceFilter(deviceFilter === device ? "all" : device)}>
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium">{device}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={deviceFilter === device ? "default" : "secondary"} className="text-[10px]">{count} events</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Restore Points */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Restore Points
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {demoRestorePoints.map(rp => (
                <div key={rp.id} className="p-3 rounded-lg bg-muted/20 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">{rp.description}</span>
                    <Badge variant={rp.type === "auto" ? "outline" : "secondary"} className="text-[10px] capitalize">{rp.type}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>{timeSince(rp.timestamp)}</span>
                    <span>{rp.fileCount.toLocaleString()} files</span>
                    <span>{formatBytes(rp.sizeBytes)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}