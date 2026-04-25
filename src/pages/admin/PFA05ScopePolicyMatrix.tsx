import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, CheckCircle, XCircle } from "lucide-react";
import PFASubNav from "@/platform/admin/components/admin/PFASubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



export default function PFA05ScopePolicyMatrix() {
  const { data: policies = [] } = useQuery({
    queryKey: ["scope-policies"],
    queryFn: async () => { const { data } = await fromTable("scope_policy_matrix").select("*, provider_capabilities(capability_key, display_name, provider_families(name))").order("created_at"); return data || []; },
  });

  return (
    <div className="space-y-6 p-6">
<PFASubNav />
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6" /> Scope Policy Matrix</h1>
        <p className="text-sm text-muted-foreground mt-1">Minimum, optional, and restricted scopes by connector</p>
      </div>

      {policies.length > 0 && (
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Capability</TableHead>
                  <TableHead>Min Scopes</TableHead>
                  <TableHead>Optional</TableHead>
                  <TableHead>Disallowed</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead>Upgrade</TableHead>
                  <TableHead>Approval</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((p: Record<string, any>) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm">{p.provider_capabilities?.provider_families?.name || "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{p.provider_capabilities?.capability_key || "—"}</TableCell>
                    <TableCell className="text-xs">{(p.minimum_scopes || []).length}</TableCell>
                    <TableCell className="text-xs">{(p.optional_scopes || []).length}</TableCell>
                    <TableCell className="text-xs text-destructive">{(p.disallowed_scopes || []).length}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{p.default_grant_profile}</Badge></TableCell>
                    <TableCell>{p.upgrade_path_available ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{p.approval_required_for_upgrade ? <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">Required</Badge> : <span className="text-xs text-muted-foreground">No</span>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {policies.length === 0 && (
        <Card className="bg-card border-border"><CardContent className="pt-6 text-center text-muted-foreground">No scope policies. Seed providers first.</CardContent></Card>
      )}
    </div>
  );
}
