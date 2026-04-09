// ═══════════════════════════════════════════════════════
// SITA OS — V01: Surface Inventory Board
// Full inventory of every route, action, button, form
// ═══════════════════════════════════════════════════════

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useVerificationSurfaces, useSeedSurfaces } from "@/lib/verification/verification-hooks";
import { SURFACE_REGISTRY, getVerificationStats } from "@/lib/verification/surface-registry";
import { Database, Layers, Search, Loader2, Download, RefreshCw } from "lucide-react";
import { useDataMode } from "@/contexts/DataModeContext";


interface V01SurfaceInventoryBoardRow {
  actionLabel?: unknown;
  action_label?: unknown;
  launchHonestyClass?: unknown;
  routeKey?: unknown;
  route_key?: unknown;
  shell?: unknown;
  surfaceClass?: unknown;
  testPriority?: unknown;
  test_priority?: unknown;
}

const priorityColors: Record<string, string> = { P0: "bg-destructive text-destructive-foreground", P1: "bg-orange-500/20 text-orange-400", P2: "bg-muted text-muted-foreground" };
const statusColors: Record<string, string> = { untested: "bg-muted text-muted-foreground", pass: "bg-green-500/20 text-green-400", fail: "bg-destructive/20 text-destructive", blocked: "bg-orange-500/20 text-orange-400" };

export default function SurfaceInventoryBoard() {
  const { isDemoMode } = useDataMode();
  const { data: dbSurfaces, isLoading } = useVerificationSurfaces();
  const seedMutation = useSeedSurfaces();
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [shellFilter, setShellFilter] = useState("all");
  const stats = getVerificationStats();

  const surfaces = dbSurfaces && dbSurfaces.length > 0 ? dbSurfaces : SURFACE_REGISTRY.map((s) => ({ ...s, id: s.routeKey, verification_status: "untested", route_key: s.routeKey, route_path: s.routePath, test_priority: s.testPriority, action_type: s.actionType, action_label: s.actionLabel, surface_class: s.surfaceClass, launch_honesty_class: s.launchHonestyClass }));

  const filtered = surfaces.filter((s: V01SurfaceInventoryBoardRow) => {
    const key = s.route_key || s.routeKey || "";
    const label = s.action_label || s.actionLabel || "";
    const matchSearch = !search || key.toLowerCase().includes(search.toLowerCase()) || label.toLowerCase().includes(search.toLowerCase());
    const prio = s.test_priority || s.testPriority;
    const matchPriority = priorityFilter === "all" || prio === priorityFilter;
    const sh = s.shell;
    const matchShell = shellFilter === "all" || sh === shellFilter;
    return matchSearch && matchPriority && matchShell;
  });

  return (
    <div className="space-y-6 p-6" data-testid="verification-surface-inventory">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            V01 — Surface Inventory Board
          </h1>
          <p className="text-muted-foreground mt-1">Complete inventory of {stats.total} surfaces across {stats.domains.length} domains</p>
        </div>
        <Button onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending} variant="outline">
          {seedMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
          Seed Surfaces to DB
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">{stats.total}</div><div className="text-xs text-muted-foreground">Total</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-destructive">{stats.p0}</div><div className="text-xs text-muted-foreground">P0 Critical</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-orange-400">{stats.p1}</div><div className="text-xs text-muted-foreground">P1 Important</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">{stats.p2}</div><div className="text-xs text-muted-foreground">P2 Useful</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">{stats.domains.length}</div><div className="text-xs text-muted-foreground">Domains</div></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search surfaces..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="P0">P0</SelectItem>
            <SelectItem value="P1">P1</SelectItem>
            <SelectItem value="P2">P2</SelectItem>
          </SelectContent>
        </Select>
        <Select value={shellFilter} onValueChange={setShellFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Shells</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="mobile">Mobile</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route Key</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Shell</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Honesty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s: any, i: number) => (
                <TableRow key={s.id || i}>
                  <TableCell className="font-mono text-xs">{s.route_key || s.routeKey}</TableCell>
                  <TableCell className="font-mono text-xs">{s.route_path || s.routePath}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{s.shell}</Badge></TableCell>
                  <TableCell className="text-xs">{s.surface_class || s.surfaceClass}</TableCell>
                  <TableCell className="text-sm">{s.action_label || s.actionLabel}</TableCell>
                  <TableCell><Badge className={priorityColors[s.test_priority || s.testPriority] || ""}>{s.test_priority || s.testPriority}</Badge></TableCell>
                  <TableCell><Badge className={statusColors[s.verification_status || "untested"] || ""}>{s.verification_status || "untested"}</Badge></TableCell>
                  <TableCell className="text-xs">{s.launch_honesty_class || s.launchHonestyClass}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
