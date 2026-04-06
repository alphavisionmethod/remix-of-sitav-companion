import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Network, RefreshCw, User, Link2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

export default function PFA08AccountGraphExplorer() {
  const queryClient = useQueryClient();

  const { data: nodes = [] } = useQuery({
    queryKey: ["account-nodes"],
    queryFn: async () => { const { data } = await supabase.from("unified_account_nodes").select("*").order("created_at"); return data || []; },
  });

  const { data: edges = [] } = useQuery({
    queryKey: ["account-edges"],
    queryFn: async () => { const { data } = await supabase.from("unified_account_edges").select("*, provider_families(name)").order("created_at"); return data || []; },
  });

  const { data: identities = [] } = useQuery({
    queryKey: ["identity-links"],
    queryFn: async () => { const { data } = await supabase.from("identity_provider_links").select("*, provider_families(name, provider_key)").order("created_at"); return data || []; },
  });

  const { data: services = [] } = useQuery({
    queryKey: ["service-links"],
    queryFn: async () => { const { data } = await supabase.from("connected_service_links").select("*, provider_families(name), provider_capabilities(display_name, capability_key)").order("created_at"); return data || []; },
  });

  return (
    <div className="space-y-6 p-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Network className="h-6 w-6" /> Unified Account Graph</h1>
        <p className="text-sm text-muted-foreground mt-1">Identity and connector links per user/entity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Graph Nodes</p>
          <p className="text-2xl font-bold">{nodes.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Graph Edges</p>
          <p className="text-2xl font-bold">{edges.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Identity Links</p>
          <p className="text-2xl font-bold">{identities.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Service Links</p>
          <p className="text-2xl font-bold">{services.length}</p>
        </CardContent></Card>
      </div>

      {identities.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Identity Provider Links</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Provider</TableHead><TableHead>Email</TableHead><TableHead>Method</TableHead><TableHead>Primary</TableHead><TableHead>Active</TableHead></TableRow></TableHeader>
              <TableBody>
                {identities.map((i: any) => (
                  <TableRow key={i.id}>
                    <TableCell>{i.provider_families?.name}</TableCell>
                    <TableCell className="text-xs">{i.email || "—"}</TableCell>
                    <TableCell className="text-xs">{i.auth_method}</TableCell>
                    <TableCell>{i.primary_identity ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                    <TableCell>{i.active ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-red-400" />}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {services.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="flex items-center gap-2"><Link2 className="h-5 w-5" /> Connected Services</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Provider</TableHead><TableHead>Capability</TableHead><TableHead>Status</TableHead><TableHead>Permission</TableHead><TableHead>Health</TableHead><TableHead>Mode</TableHead></TableRow></TableHeader>
              <TableBody>
                {services.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.provider_families?.name}</TableCell>
                    <TableCell className="text-xs">{s.provider_capabilities?.display_name}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{s.connection_status}</Badge></TableCell>
                    <TableCell className="text-xs">{s.permission_level}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{s.health_status}</Badge></TableCell>
                    <TableCell className="text-xs">{s.mode}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {nodes.length === 0 && identities.length === 0 && (
        <Card className="bg-card border-border"><CardContent className="pt-6 text-center text-muted-foreground">No account graph data. Connect providers to populate.</CardContent></Card>
      )}
    </div>
  );
}
