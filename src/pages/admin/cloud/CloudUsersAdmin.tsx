import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ChevronRight, Ban, UserCheck, Download, Trash2, X } from "lucide-react";
import { cloudQuotaService, type UserPlanAssignment } from "@/lib/cloud-backbone/cloud-quota-service";
import { cloudDeviceService } from "@/lib/cloud-backbone/cloud-device-service";
import { cloudStorageService } from "@/lib/cloud-backbone/cloud-storage-service";
import { toast } from "sonner";

export function CloudUsersAdmin() {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserPlanAssignment | null>(null);
  const users = cloudQuotaService.getUserAssignments();
  const devices = cloudDeviceService.getDemoDevices();

  const filtered = users.filter(u => {
    const matchSearch = u.userName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === "all" || u.planKey === planFilter;
    return matchSearch && matchPlan;
  });

  const userDevices = selectedUser ? devices.filter(d => d.userName === selectedUser.userName) : [];

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        {["all", "free", "pro", "enterprise"].map(f => (
          <Button key={f} size="sm" variant={planFilter === f ? "default" : "outline"} onClick={() => setPlanFilter(f)} className="capitalize">
            {f === "all" ? "All Plans" : f}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* User Table */}
        <Card className={selectedUser ? "lg:col-span-2" : "lg:col-span-3"}>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Storage</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(user => (
                  <TableRow key={user.userId} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedUser(user)}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{user.userName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.planKey === "enterprise" ? "default" : user.planKey === "pro" ? "secondary" : "outline"} className="text-xs">
                        {user.planName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "active" ? "default" : user.status === "suspended" ? "destructive" : "secondary"} className="text-xs capitalize">
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 min-w-[100px]">
                        <Progress value={user.usagePct} className="h-1.5" />
                        <p className="text-[10px] text-muted-foreground">{user.usagePct}% · {cloudStorageService.formatBytes(user.usedBytes)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* User Detail Panel */}
        {selectedUser && (
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{selectedUser.userName}</CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedUser(null)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quota Panel */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Quota</p>
                <Progress value={selectedUser.usagePct} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{cloudStorageService.formatBytes(selectedUser.usedBytes)}</span>
                  <span>{cloudStorageService.formatBytes(selectedUser.quotaBytes)}</span>
                </div>
                <div className="flex gap-2 text-xs">
                  <Badge variant="outline">{selectedUser.planName}</Badge>
                  {selectedUser.bonusStorageBytes > 0 && (
                    <Badge variant="secondary">+{cloudStorageService.formatBytes(selectedUser.bonusStorageBytes)} bonus</Badge>
                  )}
                </div>
              </div>

              {/* Devices */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Devices ({userDevices.length})</p>
                {userDevices.map(d => (
                  <div key={d.id} className="flex items-center gap-2 p-2 rounded bg-muted/30 text-xs">
                    <span>{cloudDeviceService.getPlatformIcon(d.platform)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{d.deviceName}</p>
                      <p className="text-muted-foreground">v{d.clientVersion}</p>
                    </div>
                    <Badge variant={cloudDeviceService.getTrustBadgeVariant(d.trustState)} className="text-[10px] capitalize">
                      {d.trustState}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2 border-t border-border/50">
                <p className="text-xs font-medium text-muted-foreground uppercase">Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => toast.success("Export triggered")}>
                    <Download className="h-3 w-3 mr-1" /> Export
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => toast.success("Plan upgraded")}>
                    <UserCheck className="h-3 w-3 mr-1" /> Upgrade
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs text-amber-400" onClick={() => toast.warning("User suspended")}>
                    <Ban className="h-3 w-3 mr-1" /> Suspend
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs text-red-400" onClick={() => toast.error("Delete requires confirmation")}>
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
