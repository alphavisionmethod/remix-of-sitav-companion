import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings2 } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const statusColors: Record<string, string> = {
  active: "bg-green-500/20 text-green-400", in_development: "bg-blue-500/20 text-blue-400",
  planned: "bg-muted text-muted-foreground", deprecated: "bg-red-500/20 text-red-400",
};

export default function MSA04SurfaceAdapterRegistry() {
  const { data: adapters = [] } = useQuery({
    queryKey: ["surface-adapters"],
    queryFn: async () => { const { data } = await fromTable("surface_adapters").select("*"); return data || []; },
  });

  const { data: surfaces = [] } = useQuery({
    queryKey: ["surface-types"],
    queryFn: async () => { const { data } = await fromTable("surface_types").select("*"); return data || []; },
  });

  const getSurface = (id: string) => surfaces.find((s: Record<string, any>) => s.id === id);

  return (
    <div className="space-y-6 p-6">
<div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Settings2 className="h-6 w-6" /> Surface Adapter Registry</h1>
        <p className="text-sm text-muted-foreground mt-1">All planned and implemented surface adapters with grammars and profiles</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle>Adapter Inventory</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Adapter</TableHead>
                <TableHead>Surface</TableHead>
                <TableHead>Shell</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Navigation</TableHead>
                <TableHead>Primary Input</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adapters.map((a: Record<string, any>) => {
                const surface = getSurface(a.surface_id);
                const navGrammar = a.navigation_grammar as Record<string, any> || {};
                const interGrammar = a.interaction_grammar as Record<string, any> || {};
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.adapter_name}</TableCell>
                    <TableCell>{surface?.display_name || "—"}</TableCell>
                    <TableCell><Badge variant="outline">{a.shell_type}</Badge></TableCell>
                    <TableCell><Badge className={statusColors[a.status] || ""}>{a.status}</Badge></TableCell>
                    <TableCell className="text-xs">{navGrammar.type || "—"}</TableCell>
                    <TableCell className="text-xs">{interGrammar.primary || "—"}</TableCell>
                  </TableRow>
                );
              })}
              {adapters.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No adapters registered</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detailed Adapter Cards */}
      {adapters.map((a: Record<string, any>) => {
        const surface = getSurface(a.surface_id);
        return (
          <Card key={a.id} className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{a.adapter_name}</CardTitle>
                <Badge className={statusColors[a.status] || ""}>{a.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium mb-1">Navigation Grammar</p>
                <pre className="text-xs bg-muted/30 p-2 rounded overflow-auto max-h-32">{JSON.stringify(a.navigation_grammar, null, 2)}</pre>
              </div>
              <div>
                <p className="text-xs font-medium mb-1">Interaction Grammar</p>
                <pre className="text-xs bg-muted/30 p-2 rounded overflow-auto max-h-32">{JSON.stringify(a.interaction_grammar, null, 2)}</pre>
              </div>
              <div>
                <p className="text-xs font-medium mb-1">Notification Grammar</p>
                <pre className="text-xs bg-muted/30 p-2 rounded overflow-auto max-h-32">{JSON.stringify(a.notification_grammar, null, 2)}</pre>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
