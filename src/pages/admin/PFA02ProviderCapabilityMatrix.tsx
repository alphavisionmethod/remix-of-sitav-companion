import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Layers, CheckCircle, XCircle } from "lucide-react";
import PFASubNav from "@/platform/admin/components/admin/PFASubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



export default function PFA02ProviderCapabilityMatrix() {
  const { data: capabilities = [] } = useQuery({
    queryKey: ["provider-capabilities"],
    queryFn: async () => { const { data } = await fromTable("provider_capabilities").select("*, provider_families(name, provider_key)").order("capability_key"); return data || []; },
  });

  const grouped = capabilities.reduce((acc: any,  c: Record<string, any>) => {
    const family = c.provider_families?.name || "Unknown";
    if (!acc[family]) acc[family] = [];
    acc[family].push(c);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6 p-6">
<PFASubNav />
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Layers className="h-6 w-6" /> Provider Capability Matrix</h1>
        <p className="text-sm text-muted-foreground mt-1">Sub-capabilities under each provider family</p>
      </div>

      {Object.entries(grouped).map(([family, caps]: [string, any[]]) => (
        <Card key={family} className="bg-card border-border">
          <CardHeader><CardTitle>{family} — {caps.length} capabilities</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Capability</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>R/W</TableHead>
                  <TableHead>Sync</TableHead>
                  <TableHead>Upgrade</TableHead>
                  <TableHead>Min Scopes</TableHead>
                  <TableHead>Stage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {caps.map((c: Record<string, any>) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.capability_key}</TableCell>
                    <TableCell><Badge variant="outline">{c.category}</Badge></TableCell>
                    <TableCell className="text-xs">{c.read_write}</TableCell>
                    <TableCell>{c.sync_support ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{c.upgrade_path_support ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate">{(c.minimum_scopes || []).join(", ") || "—"}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{c.launch_stage}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {capabilities.length === 0 && (
        <Card className="bg-card border-border"><CardContent className="pt-6 text-center text-muted-foreground">No capabilities. Seed provider families first.</CardContent></Card>
      )}
    </div>
  );
}
