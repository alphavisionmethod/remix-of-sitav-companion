// ═══════════════════════════════════════════════════════════════
// SITA OS — Google Provider Family Admin Overview (G01)
// Complete governance dashboard for Google provider family
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Shield, Link2, CheckCircle, XCircle, AlertTriangle,
  Key, Lock, Eye, HardDrive, Mail, Calendar, Layers,
} from "lucide-react";
import { useGoogleProviderFamily } from "@/hooks/use-google-provider-family";
import type { GoogleCapabilityKey } from "@/lib/core-services/google-provider-family/types";
import { GOOGLE_API_REQUIREMENTS, GOOGLE_OAUTH_CLIENT_TEMPLATES } from "@/lib/core-services/google-provider-family/types";
import PFASubNav from "@/platform/admin/components/admin/PFASubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const STAGE_COLORS: Record<string, string> = {
  production: "bg-green-500/20 text-green-400",
  beta: "bg-blue-500/20 text-blue-400",
  alpha: "bg-yellow-500/20 text-yellow-400",
  planned: "bg-muted text-muted-foreground",
  deprecated: "bg-red-500/20 text-red-400",
};

const CAPABILITY_ICONS: Record<string, React.ReactNode> = {
  google_identity: <Shield className="h-4 w-4" />,
  google_drive: <HardDrive className="h-4 w-4" />,
  google_gmail: <Mail className="h-4 w-4" />,
  google_calendar: <Calendar className="h-4 w-4" />,
};

export default function GoogleProviderFamilyDashboard() {
  const {
    isLoading, state, identity, connectors,
    oauthClients, scopePolicies, launchHonesty,
    summary, realityMode,
  } = useGoogleProviderFamily();

  if (isLoading) {
    return <div className="p-6 text-center text-muted-foreground">Loading Google Provider Family…</div>;
  }

  return (
    <div className="space-y-6 p-6">
<PFASubNav />

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Layers className="h-6 w-6" /> Google Provider Family — Master Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Identity auth, connector auth, OAuth clients, scope policies, launch honesty — all in one view
        </p>
      </div>

      {/* ── Overview Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Family Stage" value={state?.launchStage ?? "—"} />
        <StatCard label="Identity" value={summary.signedInWithGoogle ? "Active" : "Not linked"} positive={summary.signedInWithGoogle} />
        <StatCard label="Connected" value={`${summary.totalConnected}/${summary.totalAvailable}`} />
        <StatCard label="OAuth Clients" value={String(oauthClients.length)} />
        <StatCard label="Reality Mode" value={realityMode} />
      </div>

      {/* ── Architecture Rule ── */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="pt-4">
          <p className="text-sm text-blue-400 font-medium">
            🏛 Core Architecture Rule: Google Sign-In ≠ Google Connector Access
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Signing in with Google provides identity authentication only. Google Drive, Gmail, and Calendar each require explicit connector authorization with their own OAuth client, scopes, and consent.
          </p>
        </CardContent>
      </Card>

      {/* ── G01: Capabilities Overview ── */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="h-5 w-5" /> G01 — Capability Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Capability</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>Scopes</TableHead>
                <TableHead>Launch</TableHead>
                <TableHead>Mode</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Identity row */}
              <TableRow>
                <TableCell className="flex items-center gap-2 font-medium">
                  {CAPABILITY_ICONS.google_identity} Google Sign-In
                </TableCell>
                <TableCell><Badge className="bg-purple-500/20 text-purple-400 text-xs">Identity</Badge></TableCell>
                <TableCell>
                  {identity?.signedInWithGoogle
                    ? <CheckCircle className="h-4 w-4 text-green-400" />
                    : <XCircle className="h-4 w-4 text-muted-foreground" />}
                </TableCell>
                <TableCell>—</TableCell>
                <TableCell className="text-xs">openid, email, profile</TableCell>
                <TableCell><Badge className={STAGE_COLORS[identity?.launchStage ?? "alpha"] ?? ""} >{identity?.launchStage ?? "alpha"}</Badge></TableCell>
                <TableCell className="text-xs">{realityMode}</TableCell>
              </TableRow>
              {/* Connector rows */}
              {connectors.map((c) => (
                <TableRow key={c.capabilityKey}>
                  <TableCell className="flex items-center gap-2 font-medium">
                    {CAPABILITY_ICONS[c.capabilityKey] ?? <Link2 className="h-4 w-4" />} {c.displayName}
                  </TableCell>
                  <TableCell><Badge className="bg-green-500/20 text-green-400 text-xs">Connector</Badge></TableCell>
                  <TableCell>
                    {c.connectionStatus === "connected"
                      ? <CheckCircle className="h-4 w-4 text-green-400" />
                      : <XCircle className="h-4 w-4 text-muted-foreground" />}
                  </TableCell>
                  <TableCell>
                    {c.connectionStatus === "connected" ? (
                      c.healthStatus === "healthy" ? <CheckCircle className="h-4 w-4 text-green-400" /> :
                      c.healthStatus === "degraded" ? <AlertTriangle className="h-4 w-4 text-yellow-400" /> :
                      <XCircle className="h-4 w-4 text-red-400" />
                    ) : "—"}
                  </TableCell>
                  <TableCell className="text-xs">{c.grantedScopes.length > 0 ? `${c.grantedScopes.length} granted` : "None"}</TableCell>
                  <TableCell><Badge className={STAGE_COLORS[c.launchStage] ?? ""}>{c.launchStage}</Badge></TableCell>
                  <TableCell className="text-xs">{c.mode}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── G02: OAuth Client Registry ── */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="h-5 w-5" /> G02 — OAuth Client Registry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Capabilities</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Stage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {oauthClients.map((cl) => (
                <TableRow key={cl.id}>
                  <TableCell className="font-medium">{cl.clientName}</TableCell>
                  <TableCell>
                    <Badge className={cl.purpose.startsWith("identity") ? "bg-purple-500/20 text-purple-400" : "bg-green-500/20 text-green-400"}>
                      {cl.purpose}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{cl.allowedCapabilities.join(", ")}</TableCell>
                  <TableCell className="text-xs">{cl.environment}</TableCell>
                  <TableCell>{cl.active ? <CheckCircle className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}</TableCell>
                  <TableCell><Badge className={STAGE_COLORS[cl.launchStage] ?? ""}>{cl.launchStage}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── G03: Scope Policy Matrix ── */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-5 w-5" /> G03 — Scope Policy Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
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
              {scopePolicies.map((p) => (
                <TableRow key={p.capabilityKey}>
                  <TableCell className="font-medium">{p.displayName}</TableCell>
                  <TableCell className="text-xs">{p.minimumScopes.length}</TableCell>
                  <TableCell className="text-xs">{p.optionalScopes.length}</TableCell>
                  <TableCell className="text-xs text-destructive">{p.disallowedScopes.length}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{p.defaultGrantProfile}</Badge></TableCell>
                  <TableCell>{p.upgradePathAvailable ? <CheckCircle className="h-3 w-3 text-green-400" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}</TableCell>
                  <TableCell>{p.approvalRequired ? <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">Required</Badge> : <span className="text-xs text-muted-foreground">No</span>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── G04: API Requirements ── */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="h-5 w-5" /> G04 — Google API Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(Object.entries(GOOGLE_API_REQUIREMENTS) as [GoogleCapabilityKey, any][])
              .filter(([, apis]) => apis.length > 0)
              .map(([key, apis]) => (
                <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-muted/5 border border-border">
                  <div className="flex items-center gap-2">
                    {CAPABILITY_ICONS[key]} <span className="text-sm font-medium">{key.replace(/_/g, " ").replace("google ", "Google ")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {apis.map((api: Record<string, any>) => (
                      <Badge key={api.apiName} variant="outline" className="text-xs">{api.apiDisplayName}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/5 border border-border">
              <div className="flex items-center gap-2">
                {CAPABILITY_ICONS.google_identity} <span className="text-sm font-medium">Google Sign-In</span>
              </div>
              <Badge variant="outline" className="text-xs text-muted-foreground">No additional APIs needed</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── G05: Launch Honesty ── */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="h-5 w-5" /> G05 — Launch Honesty
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Capability</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Blockers</TableHead>
                <TableHead>Safe to Claim</TableHead>
                <TableHead>Qualifier</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {launchHonesty.map((h) => (
                <TableRow key={h.capabilityKey}>
                  <TableCell className="font-medium">{h.displayName}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs capitalize">{h.launchLabel.replace(/_/g, " ")}</Badge></TableCell>
                  <TableCell className="text-xs">{h.blockers.length > 0 ? h.blockers.join("; ") : "None"}</TableCell>
                  <TableCell>{h.publicClaimSafe ? <CheckCircle className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-red-400" />}</TableCell>
                  <TableCell>{h.qualifierRequired ? <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">Yes</Badge> : <span className="text-xs text-muted-foreground">No</span>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── OAuth Client Templates (Implementation Guide) ── */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Implementation Guide — OAuth Client Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(GOOGLE_OAUTH_CLIENT_TEMPLATES).map(([key, tmpl]) => (
            <div key={key} className="p-3 rounded-lg bg-muted/5 border border-border">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">{tmpl.name}</p>
                <Badge className={tmpl.purpose.startsWith("identity") ? "bg-purple-500/20 text-purple-400" : tmpl.purpose.startsWith("connector") ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"}>
                  {tmpl.purpose}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Type: {tmpl.applicationType} · Caps: {tmpl.capabilities.join(", ")}</p>
              <p className="text-xs text-muted-foreground mt-1">{tmpl.notes}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-4 text-center">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-lg font-bold capitalize ${positive === true ? "text-green-400" : positive === false ? "text-muted-foreground" : ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
