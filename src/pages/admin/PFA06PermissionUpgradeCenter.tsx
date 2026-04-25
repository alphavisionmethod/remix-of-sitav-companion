import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpCircle, CheckCircle, XCircle } from "lucide-react";
import PFASubNav from "@/platform/admin/components/admin/PFASubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



export default function PFA06PermissionUpgradeCenter() {
  const { data: levels = [] } = useQuery({
    queryKey: ["permission-levels"],
    queryFn: async () => { const { data } = await fromTable("permission_levels").select("*, provider_capabilities(capability_key, display_name)").order("created_at"); return data || []; },
  });

  const { data: upgrades = [] } = useQuery({
    queryKey: ["consent-upgrades"],
    queryFn: async () => { const { data } = await fromTable("consent_upgrades").select("*").order("created_at", { ascending: false }).limit(50); return data || []; },
  });

  const { data: policies = [] } = useQuery({
    queryKey: ["scope-policies-upgrade"],
    queryFn: async () => { const { data } = await fromTable("scope_policy_matrix").select("*, provider_capabilities(capability_key, display_name)").eq("upgrade_path_available", true); return data || []; },
  });

  return (
    <div className="space-y-6 p-6">
<PFASubNav />
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><ArrowUpCircle className="h-6 w-6" /> Permission Upgrade Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Upgradeable connectors and permission ladders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Upgradeable Capabilities</p>
          <p className="text-2xl font-bold">{policies.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Pending Upgrades</p>
          <p className="text-2xl font-bold">{levels.filter((l: Record<string, any>) => l.upgrade_available).length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Completed Upgrades</p>
          <p className="text-2xl font-bold">{upgrades.length}</p>
        </CardContent></Card>
      </div>

      {policies.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Upgrade-Eligible Capabilities</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Capability</TableHead>
                  <TableHead>Default Profile</TableHead>
                  <TableHead>Min Scopes</TableHead>
                  <TableHead>Optional Scopes</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((p: Record<string, any>) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.provider_capabilities?.capability_key}</TableCell>
                    <TableCell><Badge variant="outline">{p.default_grant_profile}</Badge></TableCell>
                    <TableCell className="text-xs">{(p.minimum_scopes || []).length} scopes</TableCell>
                    <TableCell className="text-xs">{(p.optional_scopes || []).length} scopes</TableCell>
                    <TableCell>{p.approval_required_for_upgrade ? <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">Required</Badge> : <span className="text-xs">Auto</span>}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{p.launch_safety_notes || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {policies.length === 0 && (
        <Card className="bg-card border-border"><CardContent className="pt-6 text-center text-muted-foreground">No upgrade-eligible capabilities found.</CardContent></Card>
      )}
    </div>
  );
}
