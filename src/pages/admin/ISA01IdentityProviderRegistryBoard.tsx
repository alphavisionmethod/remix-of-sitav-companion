import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { dbAny as db } from "@/lib/supabase-helpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, CheckCircle, XCircle, Fingerprint, Key, Smartphone, Globe, Monitor } from "lucide-react";
import { getRelation, parseProviderFamilyRef } from "@/lib/types/relation-parsers";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const platformIcons: Record<string, React.ReactNode> = {
  web: <Globe className="h-4 w-4" />,
  mobile_ios: <Smartphone className="h-4 w-4" />,
  mobile_android: <Smartphone className="h-4 w-4" />,
  desktop: <Monitor className="h-4 w-4" />,
};

const authTypeColors: Record<string, string> = {
  oauth2: "bg-blue-500/20 text-blue-400",
  saml: "bg-purple-500/20 text-purple-400",
  magic_link: "bg-cyan-500/20 text-cyan-400",
  password: "bg-muted text-muted-foreground",
  passkey: "bg-green-500/20 text-green-400",
};

export default function ISA01IdentityProviderRegistryBoard() {
  const { data: families = [] } = useQuery({
    queryKey: ["isa01-families"],
    queryFn: async () => {
      const { data } = await db.from("provider_families")
        .select("*")
        .eq("identity_support", true)
        .order("name");
      return data || [];
    },
  });

  const { data: identityLinks = [] } = useQuery({
    queryKey: ["isa01-identity-links"],
    queryFn: async () => {
      const { data } = await db.from("identity_provider_links")
        .select("*, provider_families(name, provider_key)")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: oauthClients = [] } = useQuery({
    queryKey: ["isa01-identity-clients"],
    queryFn: async () => {
      const { data } = await db.from("oauth_client_registry")
        .select("*, provider_families(name)")
        .in("client_purpose", ["identity_web", "identity_mobile_ios", "identity_mobile_android"])
        .order("created_at");
      return data || [];
    },
  });

  const activeProviders = families.filter((f: Record<string, any>) => f.active).length;
  const linkedIdentities = identityLinks.filter((l: Record<string, any>) => l.status === "active").length;

  return (
    <div className="space-y-6 p-6">
<div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Fingerprint className="h-6 w-6 text-primary" /> Identity Provider Registry
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sign-in providers only — who the user IS. This is <strong>not</strong> connector/service access.
        </p>
      </div>

      {/* Separation Callout */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="pt-4 flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-300">Identity ≠ Connector</p>
            <p className="text-xs text-muted-foreground mt-1">
              Signing in with Google does <strong>not</strong> grant Google Drive, Gmail, or Calendar access.
              Those are connector authorizations managed separately in ISA02.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Identity Providers</p>
            <p className="text-2xl font-bold">{activeProviders}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Linked Identities</p>
            <p className="text-2xl font-bold">{linkedIdentities}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Identity OAuth Clients</p>
            <p className="text-2xl font-bold">{oauthClients.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Auth Methods</p>
            <p className="text-2xl font-bold">
              {new Set(families.map((f: Record<string, any>) => f.metadata?.auth_type || "oauth2")).size}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Provider Families with Identity */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Key className="h-5 w-5" /> Identity Provider Families
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Auth Type</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Scopes</TableHead>
                <TableHead>Launch Stage</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {families.map((f: Record<string, any>) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell>
                    <Badge className={authTypeColors[f.metadata?.auth_type || "oauth2"] || "bg-muted text-muted-foreground"}>
                      {f.metadata?.auth_type || "oauth2"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {(f.metadata?.platforms || ["web"]).map((p: string) => (
                        <span key={p} title={p}>{platformIcons[p] || <Globe className="h-4 w-4" />}</span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {(f.metadata?.identity_scopes || ["openid", "email", "profile"]).join(", ")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{f.launch_stage || "live"}</Badge>
                  </TableCell>
                  <TableCell>
                    {f.active
                      ? <CheckCircle className="h-4 w-4 text-green-400" />
                      : <XCircle className="h-4 w-4 text-red-400" />}
                  </TableCell>
                </TableRow>
              ))}
              {families.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No identity providers registered yet. Seed data to populate.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Identity OAuth Clients */}
      {oauthClients.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Identity OAuth Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Family</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {oauthClients.map((c: Record<string, any>) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.client_name}</TableCell>
                    <TableCell>{getRelation(c, "provider_families", parseProviderFamilyRef).name || "—"}</TableCell>
                    <TableCell><Badge className="bg-blue-500/20 text-blue-400">{c.client_purpose}</Badge></TableCell>
                    <TableCell>{c.environment_bindings || "production"}</TableCell>
                    <TableCell>
                      {c.active
                        ? <CheckCircle className="h-4 w-4 text-green-400" />
                        : <XCircle className="h-4 w-4 text-red-400" />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Linked Identity Accounts */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Linked Identity Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {identityLinks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {identityLinks.map((link: Record<string, any>) => (
                <Card key={link.id} className="bg-muted/30 border-border">
                  <CardContent className="pt-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{getRelation(link, "provider_families", parseProviderFamilyRef).name || link.provider_key}</p>
                      <p className="text-xs text-muted-foreground">{link.email || link.external_id || "—"}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Linked: {new Date(link.linked_at || link.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={link.status === "active" ? "default" : "secondary"}>
                        {link.status || "active"}
                      </Badge>
                      {link.is_primary && <Badge variant="outline" className="text-xs">Primary</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6">No linked identity accounts</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
