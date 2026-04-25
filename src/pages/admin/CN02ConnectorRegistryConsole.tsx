import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle } from "lucide-react";
import CNSubNav from "@/platform/admin/components/admin/CNSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



export default function CN02ConnectorRegistryConsole() {
  const { data: registry = [] } = useQuery({
    queryKey: ["connector-registry"],
    queryFn: async () => { const { data } = await fromTable("connector_registry").select("*").order("connector_class"); return data || []; },
  });

  const { data: policies = [] } = useQuery({
    queryKey: ["connector-policies"],
    queryFn: async () => { const { data } = await fromTable("connector_policies").select("*"); return data || []; },
  });

  return (
    <div className="space-y-6 p-6">
      <CNSubNav />
<h1 className="sr-only">Connector Registry Console</h1>
      <Card className="bg-card border-border">
        <CardHeader><CardTitle>Connector Types</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Connector</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Auth</TableHead>
                <TableHead>Read</TableHead>
                <TableHead>Write</TableHead>
                <TableHead>Sync</TableHead>
                <TableHead>Launch Stage</TableHead>
                <TableHead>Policy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registry.map((c: Record<string, any>) => {
                const policy = policies.find((p: Record<string, any>) => p.registry_id === c.id);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.display_name}</TableCell>
                    <TableCell>{c.provider}</TableCell>
                    <TableCell><Badge variant="outline">{c.connector_class}</Badge></TableCell>
                    <TableCell>{c.auth_method}</TableCell>
                    <TableCell>{c.read_supported ? <CheckCircle className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-red-400" />}</TableCell>
                    <TableCell>{c.write_supported ? <CheckCircle className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-red-400" />}</TableCell>
                    <TableCell>{c.sync_supported ? <CheckCircle className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-red-400" />}</TableCell>
                    <TableCell><Badge variant="secondary">{c.launch_stage}</Badge></TableCell>
                    <TableCell>{policy ? (policy.read_only ? "Read-Only" : "Read/Write") : "—"}</TableCell>
                  </TableRow>
                );
              })}
              {registry.length === 0 && <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">No connectors registered</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
