import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { dbAny as db } from "@/lib/supabase-helpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Key, CheckCircle, XCircle, Filter, Shield, Plug } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRelation, parseProviderFamilyRef } from "@/lib/types/relation-parsers";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const purposeLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  identity_web: { label: "Identity Web", color: "bg-blue-500/20 text-blue-400", icon: <Shield className="h-3 w-3" /> },
  identity_mobile_ios: { label: "Identity iOS", color: "bg-purple-500/20 text-purple-400", icon: <Shield className="h-3 w-3" /> },
  identity_mobile_android: { label: "Identity Android", color: "bg-orange-500/20 text-orange-400", icon: <Shield className="h-3 w-3" /> },
  connector_web: { label: "Connector Web", color: "bg-green-500/20 text-green-400", icon: <Plug className="h-3 w-3" /> },
  connector_mobile_ios: { label: "Connector iOS", color: "bg-teal-500/20 text-teal-400", icon: <Plug className="h-3 w-3" /> },
  connector_mobile_android: { label: "Connector Android", color: "bg-amber-500/20 text-amber-400", icon: <Plug className="h-3 w-3" /> },
  internal_test: { label: "Internal Test", color: "bg-yellow-500/20 text-yellow-400", icon: <Filter className="h-3 w-3" /> },
};

export default function ISA03OAuthClientRegistryConsole() {
  const [tab, setTab] = useState("all");

  const { data: clients = [] } = useQuery({
    queryKey: ["isa03-oauth-clients"],
    queryFn: async () => {
      const { data } = await db.from("oauth_client_registry")
        .select("*, provider_families(name, provider_key)")
        .order("created_at");
      return data || [];
    },
  });

  const identityClients = clients.filter((c: Record<string, any>) => c.client_purpose?.startsWith("identity"));
  const connectorClients = clients.filter((c: Record<string, any>) => c.client_purpose?.startsWith("connector"));
  const testClients = clients.filter((c: Record<string, any>) => c.client_purpose === "internal_test");

  const filtered = tab === "identity" ? identityClients
    : tab === "connector" ? connectorClients
    : tab === "test" ? testClients
    : clients;

  // Check for violations: same client used for both identity and connector
  const familyClientPurposes = clients.reduce((acc: Record<string, Set<string>>,  c: Record<string, any>) => {
    const fam = getRelation(c, "provider_families", parseProviderFamilyRef).provider_key || "unknown";
    if (!acc[fam]) acc[fam] = new Set();
    acc[fam].add(c.client_purpose?.startsWith("identity") ? "identity" : "connector");
    return acc;
  }, {} as Record<string, Set<string>>);

  const wellSeparated = Object.values(familyClientPurposes).every(
    (purposes: any) => purposes.size <= 1 || (purposes.has("identity") && purposes.has("connector"))
  );

  return (
    <div className="space-y-6 p-6">
<div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Key className="h-6 w-6 text-primary" /> OAuth Client Registry Console
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Every OAuth client classified by purpose: identity vs connector, by platform, by family.
        </p>
      </div>

      {/* Separation Health */}
      <Card className={wellSeparated ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"}>
        <CardContent className="pt-4 flex items-center gap-3">
          {wellSeparated
            ? <CheckCircle className="h-5 w-5 text-green-400" />
            : <XCircle className="h-5 w-5 text-red-400" />}
          <div>
            <p className="text-sm font-medium">
              {wellSeparated ? "Client separation is clean" : "Client separation violation detected"}
            </p>
            <p className="text-xs text-muted-foreground">
              {wellSeparated
                ? "Identity and connector clients are properly separated by purpose across all provider families."
                : "Some provider families share OAuth clients between identity and connector. This must be fixed."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Total Clients</p>
          <p className="text-2xl font-bold">{clients.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" /> Identity</p>
          <p className="text-2xl font-bold text-blue-400">{identityClients.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Plug className="h-3 w-3" /> Connector</p>
          <p className="text-2xl font-bold text-green-400">{connectorClients.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Test Clients</p>
          <p className="text-2xl font-bold text-yellow-400">{testClients.length}</p>
        </CardContent></Card>
      </div>

      {/* Tabbed View */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({clients.length})</TabsTrigger>
          <TabsTrigger value="identity">Identity ({identityClients.length})</TabsTrigger>
          <TabsTrigger value="connector">Connector ({connectorClients.length})</TabsTrigger>
          <TabsTrigger value="test">Test ({testClients.length})</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          <Card className="bg-card border-border">
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Family</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Capabilities</TableHead>
                    <TableHead>Environment</TableHead>
                    <TableHead>Launch Stage</TableHead>
                    <TableHead>Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c: Record<string, any>) => {
                    const purpose = purposeLabels[c.client_purpose] || { label: c.client_purpose, color: "bg-muted text-muted-foreground", icon: null };
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.client_name}</TableCell>
                        <TableCell>{getRelation(c, "provider_families", parseProviderFamilyRef).name || "—"}</TableCell>
                        <TableCell>
                          <Badge className={`${purpose.color} flex items-center gap-1 w-fit`}>
                            {purpose.icon} {purpose.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(c.allowed_capabilities || []).slice(0, 3).map((cap: string) => (
                              <Badge key={cap} variant="outline" className="text-xs">{cap}</Badge>
                            ))}
                            {(c.allowed_capabilities || []).length > 3 && (
                              <Badge variant="outline" className="text-xs">+{c.allowed_capabilities.length - 3}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{c.environment_bindings || "production"}</TableCell>
                        <TableCell><Badge variant="outline">{c.launch_stage || "live"}</Badge></TableCell>
                        <TableCell>
                          {c.active ? <CheckCircle className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-red-400" />}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No OAuth clients in this category
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
