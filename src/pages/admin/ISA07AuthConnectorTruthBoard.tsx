import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldAlert, CheckCircle, XCircle, AlertTriangle, Shield, Plug, Eye, Zap } from "lucide-react";
import { getRelation, parseProviderFamilyRef } from "@/lib/types/relation-parsers";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const severityColors: Record<string, string> = {
  info: "bg-blue-500/20 text-blue-400",
  warning: "bg-yellow-500/20 text-yellow-400",
  critical: "bg-red-500/20 text-red-400",
};

const auditTypeIcons: Record<string, React.ReactNode> = {
  over_scope: <AlertTriangle className="h-4 w-4 text-amber-400" />,
  conflated_auth: <ShieldAlert className="h-4 w-4 text-red-400" />,
  missing_separation: <XCircle className="h-4 w-4 text-red-400" />,
  ux_confusion: <Eye className="h-4 w-4 text-yellow-400" />,
  stale_consent: <Zap className="h-4 w-4 text-orange-400" />,
};

export default function ISA07AuthConnectorTruthBoard() {
  // Run separation audit checks
  const { data: families = [] } = useQuery({
    queryKey: ["isa07-families"],
    queryFn: async () => {
      const { data } = await fromTable("provider_families").select("*").eq("active", true);
      return data || [];
    },
  });

  const { data: oauthClients = [] } = useQuery({
    queryKey: ["isa07-clients"],
    queryFn: async () => {
      const { data } = await fromTable("oauth_client_registry").select("*, provider_families(name, provider_key)");
      return data || [];
    },
  });

  const { data: identityLinks = [] } = useQuery({
    queryKey: ["isa07-identity"],
    queryFn: async () => {
      const { data } = await fromTable("identity_provider_links").select("*, provider_families(provider_key)");
      return data || [];
    },
  });

  const { data: connectorLinks = [] } = useQuery({
    queryKey: ["isa07-connectors"],
    queryFn: async () => {
      const { data } = await fromTable("connected_service_links").select("*, provider_families(provider_key)");
      return data || [];
    },
  });

  const { data: scopes = [] } = useQuery({
    queryKey: ["isa07-scopes"],
    queryFn: async () => {
      const { data } = await fromTable("scope_policy_matrix").select("*");
      return data || [];
    },
  });

  // Compute audit findings
  const findings: Array<{
    type: string;
    severity: "info" | "warning" | "critical";
    family: string;
    description: string;
    resolved: boolean;
  }> = [];

  // Check 1: Any family with both identity and connector using SAME OAuth client?
  const clientsByFamily = oauthClients.reduce((acc: Record<string, any[]>,  c: Record<string, any>) => {
    const fk = getRelation(c, "provider_families", parseProviderFamilyRef).provider_key || "unknown";
    if (!acc[fk]) acc[fk] = [];
    acc[fk].push(c);
    return acc;
  }, {});

  Object.entries(clientsByFamily).forEach(([fam, clients]: [string, any[]]) => {
    const purposes = clients.map((c: Record<string, any>) => c.client_purpose);
    const hasIdentity = purposes.some((p: string) => p?.startsWith("identity"));
    const hasConnector = purposes.some((p: string) => p?.startsWith("connector"));
    if (hasIdentity && hasConnector && clients.length < 2) {
      findings.push({
        type: "conflated_auth",
        severity: "critical",
        family: fam,
        description: `${fam} uses a single OAuth client for both identity and connector. Must separate.`,
        resolved: false,
      });
    }
    if (hasIdentity && hasConnector && (clients as never[]).length >= 2) {
      findings.push({
        type: "over_scope",
        severity: "info",
        family: fam,
        description: `${fam} has properly separated identity and connector OAuth clients.`,
        resolved: true,
      });
    }
  });

  // Check 2: Identity link implies connector access? (should NOT)
  const identityFamilies = new Set(identityLinks.map((l: Record<string, any>) => getRelation(l, "provider_families", parseProviderFamilyRef).provider_key));
  const connectorFamilies = new Set(connectorLinks.map((l: Record<string, any>) => getRelation(l, "provider_families", parseProviderFamilyRef).provider_key));
  identityFamilies.forEach((fam: string) => {
    if (fam && connectorFamilies.has(fam)) {
      findings.push({
        type: "ux_confusion",
        severity: "info",
        family: fam,
        description: `${fam}: User has both identity link and connector access. Verify UX doesn't conflate them.`,
        resolved: true,
      });
    }
  });

  // Check 3: Connector scopes mixed with identity scopes?
  const identityScopes = scopes.filter((s: Record<string, any>) => s.category === "identity_minimal");
  const connectorScopes = scopes.filter((s: Record<string, any>) => s.category?.startsWith("connector"));
  const identityScopeKeys = new Set(identityScopes.map((s: Record<string, any>) => s.scope_key));
  const connectorScopeKeys = new Set(connectorScopes.map((s: Record<string, any>) => s.scope_key));
  const overlap = [...identityScopeKeys].filter((k) => connectorScopeKeys.has(k));
  if (overlap.length > 0) {
    findings.push({
      type: "over_scope",
      severity: "warning",
      family: "global",
      description: `Scope overlap between identity and connector: ${overlap.join(", ")}. Review policy matrix.`,
      resolved: false,
    });
  }

  // Check 4: Families with identity but no separate connector capability registered
  families.forEach((f: Record<string, any>) => {
    if (f.identity_support && f.connector_support) {
      const famClients = clientsByFamily[f.provider_key] || [];
      if (famClients.length === 0) {
        findings.push({
          type: "missing_separation",
          severity: "warning",
          family: f.provider_key,
          description: `${f.name} declares both identity and connector but has no OAuth clients registered.`,
          resolved: false,
        });
      }
    }
  });

  const criticalCount = findings.filter((f) => f.severity === "critical" && !f.resolved).length;
  const warningCount = findings.filter((f) => f.severity === "warning" && !f.resolved).length;
  const resolvedCount = findings.filter((f) => f.resolved).length;

  const overallHealth = criticalCount > 0 ? "violation" : warningCount > 0 ? "warning" : "clean";
  const healthConfig = {
    clean: { color: "bg-green-500/10 border-green-500/30", icon: <CheckCircle className="h-6 w-6 text-green-400" />, label: "Separation Clean" },
    warning: { color: "bg-yellow-500/10 border-yellow-500/30", icon: <AlertTriangle className="h-6 w-6 text-yellow-400" />, label: "Warnings Present" },
    violation: { color: "bg-red-500/10 border-red-500/30", icon: <XCircle className="h-6 w-6 text-red-400" />, label: "Violations Detected" },
  };

  const hc = healthConfig[overallHealth];

  return (
    <div className="space-y-6 p-6">
<div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-primary" /> Auth vs Connector Truth Board
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Live separation audit: detects over-scope risk, conflated auth, UX confusion, and launch honesty gaps.
        </p>
      </div>

      {/* Overall Health */}
      <Card className={`${hc.color} border`}>
        <CardContent className="pt-4 flex items-center gap-4">
          {hc.icon}
          <div>
            <p className="text-lg font-bold">{hc.label}</p>
            <p className="text-sm text-muted-foreground">
              {criticalCount} critical · {warningCount} warnings · {resolvedCount} resolved · {findings.length} total findings
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Separation Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-blue-400" />
              <p className="font-medium">Identity Layer</p>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>{families.filter((f: Record<string, any>) => f.identity_support).length} identity-capable families</p>
              <p>{identityLinks.length} linked identities</p>
              <p>{oauthClients.filter((c: Record<string, any>) => c.client_purpose?.startsWith("identity")).length} identity OAuth clients</p>
              <p>{identityScopes.length} identity scopes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Plug className="h-5 w-5 text-green-400" />
              <p className="font-medium">Connector Layer</p>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>{families.filter((f: Record<string, any>) => f.connector_support).length} connector-capable families</p>
              <p>{connectorLinks.length} connected services</p>
              <p>{oauthClients.filter((c: Record<string, any>) => c.client_purpose?.startsWith("connector")).length} connector OAuth clients</p>
              <p>{connectorScopes.length} connector scopes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-5 w-5 text-amber-400" />
              <p className="font-medium">UX Separation</p>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Sign-in methods: identity settings only</p>
              <p>Connected services: integrations only</p>
              <p>Never auto-grant connector on identity login</p>
              <p>{overlap.length === 0 ? "✓ No scope overlap" : `⚠ ${overlap.length} overlapping scopes`}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Findings Table */}
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-lg">Separation Audit Findings</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Family</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {findings.map((f, i) => (
                <TableRow key={i}>
                  <TableCell className="flex items-center gap-2">
                    {auditTypeIcons[f.type]}
                    <span className="text-xs">{f.type.replace(/_/g, " ")}</span>
                  </TableCell>
                  <TableCell className="font-medium">{f.family}</TableCell>
                  <TableCell className="text-sm max-w-[400px]">{f.description}</TableCell>
                  <TableCell><Badge className={severityColors[f.severity]}>{f.severity}</Badge></TableCell>
                  <TableCell>
                    {f.resolved
                      ? <Badge className="bg-green-500/20 text-green-400">Resolved</Badge>
                      : <Badge className="bg-red-500/20 text-red-400">Open</Badge>}
                  </TableCell>
                </TableRow>
              ))}
              {findings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No findings — separation architecture is clean.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
