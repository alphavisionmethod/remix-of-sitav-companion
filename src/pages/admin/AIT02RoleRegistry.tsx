// ═══════════════════════════════════════════════════════════════
// SITA OS — AIT02: Role Registry Board (Full Spec)
// Inspect each AI role, its governance, cost, and usage
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import type { WorkforceRole } from "@/lib/core-services/ai-workforce/workforce-orchestrator";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AITSubNav from "@/platform/admin/components/admin/AITSubNav";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { getWorkforceRoles, getRecentInvocations } from "@/lib/core-services/ai-workforce/workforce-orchestrator";
import { Users, X, ChevronRight, TrendingUp, TrendingDown, Filter } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

type SortKey = "cost" | "invocations" | "name" | "stage";

export default function AIT02RoleRegistry() {
  const [selectedRole, setSelectedRole] = useState<WorkforceRole | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: roles = [] } = useQuery({ queryKey: ["ai-workforce-roles"], queryFn: getWorkforceRoles });
  const { data: invocations = [] } = useQuery({ queryKey: ["ai-workforce-invocations-all"], queryFn: () => getRecentInvocations(500) });

  const filtered = roles.filter(r => filterStatus === "all" || r.launch_stage === filterStatus);
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "cost") return b.total_cost_cents - a.total_cost_cents;
    if (sortBy === "invocations") return b.total_invocations - a.total_invocations;
    if (sortBy === "stage") return a.launch_stage.localeCompare(b.launch_stage);
    return a.display_name.localeCompare(b.display_name);
  });

  const roleInvocations = selectedRole ? invocations.filter(i => i.role_key === selectedRole.role_key) : [];
  const roleSuccessRate = roleInvocations.length > 0
    ? Math.round((roleInvocations.filter(i => i.status === "completed").length / roleInvocations.length) * 100) : 0;
  const roleFallbackRate = roleInvocations.length > 0
    ? Math.round((roleInvocations.filter(i => i.fallback_occurred).length / roleInvocations.length) * 100) : 0;
  const roleAvgCost = roleInvocations.length > 0
    ? roleInvocations.reduce((s, i) => s + (i.cost_cents ?? 0), 0) / roleInvocations.length : 0;

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
      <AITSubNav />
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-primary" /> AIT02 — Role Registry</h1>
          <p className="text-muted-foreground mt-1">All AI workforce roles, their governance, cost profile, and usage</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] h-8 text-xs"><Filter className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="internal">Internal</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={v => setSortBy(v as SortKey)}>
            <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort: Name</SelectItem>
              <SelectItem value="cost">Sort: Cost ↓</SelectItem>
              <SelectItem value="invocations">Sort: Usage ↓</SelectItem>
              <SelectItem value="stage">Sort: Stage</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Registered Roles ({sorted.length})</CardTitle></CardHeader>
        <CardContent>
          {sorted.length === 0 ? (
            <p className="text-sm text-muted-foreground">No workforce roles registered.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Model Tier</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Autonomy</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead className="text-right">Tasks</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map(r => (
                  <TableRow key={r.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelectedRole(r)}>
                    <TableCell className="font-medium text-xs">{r.display_name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">{r.purpose}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{r.default_model_tier}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{r.budget_class}</Badge></TableCell>
                    <TableCell><Badge variant="secondary" className="text-[10px]">{r.max_autonomy}</Badge></TableCell>
                    <TableCell><Badge variant={r.launch_stage === "production" ? "default" : "secondary"} className="text-[10px]">{r.launch_stage}</Badge></TableCell>
                    <TableCell className="text-right font-mono text-xs">{r.total_invocations}</TableCell>
                    <TableCell className="text-right font-mono text-xs">${(r.total_cost_cents / 100).toFixed(2)}</TableCell>
                    <TableCell><ChevronRight className="h-3 w-3 text-muted-foreground" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Role Detail Drawer (AIT09) */}
      <Sheet open={!!selectedRole} onOpenChange={() => setSelectedRole(null)}>
        <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto">
          {selectedRole && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between">
                  <span>{selectedRole.display_name}</span>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedRole(null)}><X className="h-4 w-4" /></Button>
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-4">
                <div className="p-3 rounded border bg-muted/20">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Purpose</div>
                  <p className="text-sm">{selectedRole.purpose}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded border text-center">
                    <div className="text-lg font-bold">{roleSuccessRate}%</div>
                    <div className="text-[10px] text-muted-foreground">Success Rate</div>
                    <Progress value={roleSuccessRate} className="h-1 mt-1" />
                  </div>
                  <div className="p-3 rounded border text-center">
                    <div className="text-lg font-bold flex items-center justify-center gap-1">
                      {roleFallbackRate}%
                      {roleFallbackRate > 20 ? <TrendingUp className="h-3 w-3 text-destructive" /> : <TrendingDown className="h-3 w-3 text-emerald-500" />}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Fallback Rate</div>
                  </div>
                  <div className="p-3 rounded border text-center">
                    <div className="text-lg font-bold font-mono">${(roleAvgCost / 100).toFixed(3)}</div>
                    <div className="text-[10px] text-muted-foreground">Avg Cost/Task</div>
                  </div>
                  <div className="p-3 rounded border text-center">
                    <div className="text-lg font-bold">{roleInvocations.length}</div>
                    <div className="text-[10px] text-muted-foreground">Total Invocations</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium">Configuration</div>
                  {[
                    { label: "Role Key", value: selectedRole.role_key },
                    { label: "Default Model", value: selectedRole.default_model_tier },
                    { label: "Budget Class", value: selectedRole.budget_class },
                    { label: "Max Autonomy", value: selectedRole.max_autonomy },
                    { label: "Launch Stage", value: selectedRole.launch_stage },
                    { label: "Approval Required", value: selectedRole.approval_required ? "Yes" : "No" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between p-2 rounded border text-xs">
                      <span className="text-muted-foreground">{item.label}</span>
                      <Badge variant="outline" className="text-[10px]">{item.value}</Badge>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium">Recent Invocations</div>
                  {roleInvocations.slice(0, 5).map(inv => (
                    <div key={inv.id} className="p-2 rounded border text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{inv.task_type}</span>
                        <Badge variant={inv.status === "completed" ? "default" : "destructive"} className="text-[10px]">{inv.status}</Badge>
                      </div>
                      <p className="text-muted-foreground truncate mt-0.5">{inv.output_summary?.slice(0, 60) ?? "..."}</p>
                      <div className="flex gap-2 mt-1 text-muted-foreground">
                        <span>${(inv.cost_cents / 100).toFixed(3)}</span>
                        {inv.latency_ms && <span>{inv.latency_ms}ms</span>}
                      </div>
                    </div>
                  ))}
                  {roleInvocations.length === 0 && <p className="text-xs text-muted-foreground">No invocations for this role yet.</p>}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
