import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Key, CheckCircle, XCircle } from "lucide-react";
import PFASubNav from "@/platform/admin/components/admin/PFASubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const purposeColors: Record<string, string> = {
  identity_web: "bg-blue-500/20 text-blue-400", connector_web: "bg-green-500/20 text-green-400",
  mobile_ios: "bg-purple-500/20 text-purple-400", mobile_android: "bg-orange-500/20 text-orange-400",
  internal_test: "bg-yellow-500/20 text-yellow-400",
};

export default function PFA03OAuthClientRegistry() {
  const { data: clients = [] } = useQuery({
    queryKey: ["oauth-clients"],
    queryFn: async () => { const { data } = await fromTable("oauth_client_registry").select("*, provider_families(name)").order("created_at"); return data || []; },
  });

  return (
    <div className="space-y-6 p-6">
<PFASubNav />
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Key className="h-6 w-6" /> OAuth Client Registry</h1>
        <p className="text-sm text-muted-foreground mt-1">Auth clients by purpose, environment, and provider family</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {["identity_web", "connector_web", "mobile_ios", "mobile_android"].map(purpose => (
          <Card key={purpose} className="bg-card border-border"><CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">{purpose.replace(/_/g, " ").toUpperCase()}</p>
            <p className="text-2xl font-bold">{clients.filter((c: Record<string, any>) => c.client_purpose === purpose).length}</p>
          </CardContent></Card>
        ))}
      </div>

      {clients.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>OAuth Clients</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Capabilities</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Stage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((c: Record<string, any>) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.client_name}</TableCell>
                    <TableCell>{c.provider_families?.name}</TableCell>
                    <TableCell><Badge className={purposeColors[c.client_purpose] || ""}>{c.client_purpose}</Badge></TableCell>
                    <TableCell className="text-xs">{(c.allowed_capabilities || []).join(", ")}</TableCell>
                    <TableCell className="text-xs">{c.environment}</TableCell>
                    <TableCell>{c.active ? <CheckCircle className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-red-400" />}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{c.launch_stage}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {clients.length === 0 && (
        <Card className="bg-card border-border"><CardContent className="pt-6 text-center text-muted-foreground">No OAuth clients. Seed Google family first.</CardContent></Card>
      )}
    </div>
  );
}
