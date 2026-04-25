import { useAction } from "@/hooks/use-action";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Globe, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import PFASubNav from "@/platform/admin/components/admin/PFASubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const stageColors: Record<string, string> = {
  production: "bg-green-500/20 text-green-400", alpha: "bg-blue-500/20 text-blue-400",
  beta: "bg-cyan-500/20 text-cyan-400", planned: "bg-muted text-muted-foreground",
};

export default function PFA01ProviderFamilyRegistry() {
  const queryClient = useQueryClient();

  const { data: families = [] } = useQuery({
    queryKey: ["provider-families"],
    queryFn: async () => { const { data } = await fromTable("provider_families").select("*").order("name"); return data || []; },
  });

  const seedMutation = useAction("admin", "seed.run");

  return (
    <div className="space-y-6 p-6">
<PFASubNav />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Globe className="h-6 w-6" /> Provider Family Registry</h1>
          <p className="text-sm text-muted-foreground mt-1">All external provider families, categories, and statuses</p>
        </div>
        <Button onClick={() => seedMutation.mutate({})} disabled={seedMutation.isPending} size="sm" variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${seedMutation.isPending ? "animate-spin" : ""}`} />
          {families.length === 0 ? "Initialize Providers" : "Re-Seed"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Total Families</p>
          <p className="text-2xl font-bold">{families.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Identity Providers</p>
          <p className="text-2xl font-bold">{families.filter((f: Record<string, any>) => f.identity_support).length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Connector Providers</p>
          <p className="text-2xl font-bold">{families.filter((f: Record<string, any>) => f.connector_support).length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="text-2xl font-bold">{families.filter((f: Record<string, any>) => f.active).length}</p>
        </CardContent></Card>
      </div>

      {families.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Provider Families</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Identity</TableHead>
                  <TableHead>Connector</TableHead>
                  <TableHead>Auth Types</TableHead>
                  <TableHead>Stage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {families.map((f: Record<string, any>) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell className="flex gap-1 flex-wrap">{(f.categories || []).map((c: string) => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}</TableCell>
                    <TableCell>{f.identity_support ? <CheckCircle className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}</TableCell>
                    <TableCell>{f.connector_support ? <CheckCircle className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}</TableCell>
                    <TableCell className="text-xs">{(f.auth_types_supported || []).join(", ")}</TableCell>
                    <TableCell><Badge className={stageColors[f.launch_stage] || ""}>{f.launch_stage}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {families.length === 0 && (
        <Card className="bg-card border-border"><CardContent className="pt-6 text-center text-muted-foreground">
          No providers registered. Click "Initialize Providers" to seed.
        </CardContent></Card>
      )}
    </div>
  );
}
