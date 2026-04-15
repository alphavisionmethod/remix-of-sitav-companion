import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Database, Eye, Clock, FileText, Settings, Layout, Smartphone, Bell, Folder, GitBranch } from "lucide-react";
import { syncd } from "@/lib/sync-engine/syncd";
import { namespaceRegistry } from "@/lib/sync-engine/sync-namespaces";
import { conflictResolver } from "@/lib/sync-engine/conflict-resolver";
import type { SyncObject } from "@/lib/sync-engine/sync-object-model";

const typeIcons: Record<string, React.ElementType> = {
  file: FileText, folder: Folder, setting: Settings, app_setting: Settings,
  app_state: Database, session: Layout, window_layout: Layout,
  notification_state: Bell, device_preference: Smartphone,
};

function timeSince(dateStr: string) {
  const ms = Date.now() - new Date(dateStr).getTime();
  if (ms < 60000) return "Just now";
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ago`;
  if (ms < 86400000) return `${Math.floor(ms / 3600000)}h ago`;
  return `${Math.floor(ms / 86400000)}d ago`;
}

export function CloudSyncObjectsAdmin() {
  const [search, setSearch] = useState("");
  const [nsFilter, setNsFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedObject, setSelectedObject] = useState<SyncObject | null>(null);

  const allObjects = syncd.queryObjects({});
  const conflicts = conflictResolver.getPendingConflicts();
  const namespaces = namespaceRegistry.getAll();

  const filtered = useMemo(() => allObjects.filter(o => {
    const matchSearch = o.id.includes(search) || o.namespace.includes(search.toLowerCase());
    const matchNs = nsFilter === "all" || o.namespace === nsFilter;
    const matchType = typeFilter === "all" || o.type === typeFilter;
    return matchSearch && matchNs && matchType;
  }), [allObjects, search, nsFilter, typeFilter]);

  const tombstones = allObjects.filter(o => o.deleted);
  const types = [...new Set(allObjects.map(o => o.type))];

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Objects", value: allObjects.length, color: "bg-primary/10" },
          { label: "Namespaces", value: namespaces.length, color: "bg-blue-500/10" },
          { label: "Active", value: allObjects.length - tombstones.length, color: "bg-emerald-500/10" },
          { label: "Tombstones", value: tombstones.length, color: "bg-amber-500/10" },
          { label: "Conflicts", value: conflicts.length, color: "bg-red-500/10" },
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
          <Input placeholder="Search by ID or namespace..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select className="px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground" value={nsFilter} onChange={e => setNsFilter(e.target.value)}>
          <option value="all">All Namespaces</option>
          {namespaces.map(ns => <option key={ns.id} value={ns.id}>{ns.id}</option>)}
        </select>
        <select className="px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Object Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" /> Sync Objects ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Database className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No sync objects yet. Objects appear as the sync engine processes changes.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Namespace</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Encryption</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 50).map(obj => {
                  const Icon = typeIcons[obj.type] || FileText;
                  return (
                    <TableRow key={obj.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelectedObject(obj)}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium">{obj.type}</span>
                        </div>
                      </TableCell>
                      <TableCell><span className="text-xs font-mono text-muted-foreground">{obj.namespace}</span></TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">v{obj.version}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={obj.deleted ? "destructive" : "default"} className="text-xs">
                          {obj.deleted ? "Deleted" : obj.state}
                        </Badge>
                      </TableCell>
                      <TableCell><span className="text-xs text-muted-foreground">{obj.encryptionClass}</span></TableCell>
                      <TableCell><span className="text-xs text-muted-foreground">{timeSince(obj.updatedAt)}</span></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Eye className="h-3.5 w-3.5" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Panel */}
      {selectedObject && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-primary" /> Object Detail
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedObject(null)}>×</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground">ID</p><p className="font-mono text-xs">{selectedObject.id}</p></div>
              <div><p className="text-xs text-muted-foreground">Type</p><p>{selectedObject.type}</p></div>
              <div><p className="text-xs text-muted-foreground">Namespace</p><p className="font-mono text-xs">{selectedObject.namespace}</p></div>
              <div><p className="text-xs text-muted-foreground">Version</p><p>{selectedObject.version}</p></div>
              <div><p className="text-xs text-muted-foreground">State</p><p>{selectedObject.state}</p></div>
              <div><p className="text-xs text-muted-foreground">Encryption</p><p>{selectedObject.encryptionClass}</p></div>
              <div><p className="text-xs text-muted-foreground">Origin Device</p><p className="font-mono text-xs">{selectedObject.originDeviceId}</p></div>
              <div><p className="text-xs text-muted-foreground">Created</p><p>{new Date(selectedObject.createdAt).toLocaleString()}</p></div>
              <div><p className="text-xs text-muted-foreground">Updated</p><p>{new Date(selectedObject.updatedAt).toLocaleString()}</p></div>
              <div><p className="text-xs text-muted-foreground">Object Hash</p><p className="font-mono text-xs">{selectedObject.objectHash || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Tombstone</p><p>{selectedObject.deleted ? "Yes" : "No"}</p></div>
              <div>
                <p className="text-xs text-muted-foreground">Version Vector</p>
                <div className="flex gap-1 flex-wrap mt-1">
                  {selectedObject.versionVector.map(v => (
                    <Badge key={v.deviceId} variant="outline" className="text-[10px]">{v.deviceId.slice(0, 8)}:c{v.counter}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
