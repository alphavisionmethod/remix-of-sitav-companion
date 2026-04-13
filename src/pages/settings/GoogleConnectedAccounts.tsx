// ═══════════════════════════════════════════════════════════════
// SITA OS — Google Connected Accounts (User App Page)
// Shows identity vs connector status clearly separated
// ═══════════════════════════════════════════════════════════════

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield, Link2, CheckCircle, XCircle, AlertTriangle,
  ArrowUpCircle, RefreshCw, HardDrive, Mail, Calendar,
} from "lucide-react";
import { useGoogleProviderFamily } from "@/hooks/use-google-provider-family";
import { PermissionUpgradeDialog } from "@/components/sita/PermissionUpgradeDialog";
import type { GoogleConnectorState } from "@/lib/services/google-provider-family/types";
import type { GenericScopeTier } from "@/lib/services/provider-family/types";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const CAPABILITY_ICONS: Record<string, React.ReactNode> = {
  google_drive: <HardDrive className="h-5 w-5" />,
  google_gmail: <Mail className="h-5 w-5" />,
  google_calendar: <Calendar className="h-5 w-5" />,
};

const STATUS_COLORS: Record<string, string> = {
  connected: "bg-green-500/20 text-green-400",
  disconnected: "bg-muted text-muted-foreground",
  error: "bg-red-500/20 text-red-400",
  reauth_needed: "bg-yellow-500/20 text-yellow-400",
  pending: "bg-blue-500/20 text-blue-400",
};

const HEALTH_ICONS: Record<string, React.ReactNode> = {
  healthy: <CheckCircle className="h-4 w-4 text-green-400" />,
  degraded: <AlertTriangle className="h-4 w-4 text-yellow-400" />,
  error: <XCircle className="h-4 w-4 text-red-400" />,
  unknown: <div className="h-4 w-4 rounded-full bg-muted-foreground/30" />,
};

function ConnectorCard({ connector, onUpgrade }: { connector: GoogleConnectorState; onUpgrade?: (c: GoogleConnectorState) => void }) {
  const icon = CAPABILITY_ICONS[connector.capabilityKey] ?? <Link2 className="h-5 w-5" />;
  const isConnected = connector.connectionStatus === "connected";
  const isPlanned = connector.launchStage === "planned";

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/10 border border-border">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isConnected ? "bg-green-500/10 text-green-400" : "bg-muted/20 text-muted-foreground"}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium">{connector.displayName}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="outline" className="text-xs capitalize">{connector.permissionLevel}</Badge>
            {connector.mode !== "real" && (
              <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">{connector.mode}</Badge>
            )}
            {isPlanned && <Badge variant="outline" className="text-xs text-muted-foreground">Planned</Badge>}
          </div>
          {isConnected && connector.grantedScopes.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">{connector.grantedScopes.length} scopes granted</p>
          )}
          {isConnected && connector.lastSyncAt && (
            <p className="text-xs text-muted-foreground">Last sync: {new Date(connector.lastSyncAt).toLocaleString()}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {HEALTH_ICONS[connector.healthStatus]}
        <Badge className={STATUS_COLORS[connector.connectionStatus] ?? ""}>{connector.connectionStatus}</Badge>
        {connector.reauthNeeded && <AlertTriangle className="h-4 w-4 text-yellow-400" />}
        {connector.upgradeAvailable && isConnected && (
          <button
            onClick={() => onUpgrade?.(connector)}
            className="hover:opacity-80 transition-opacity"
            title="Request permission upgrade"
          >
            <ArrowUpCircle className="h-4 w-4 text-primary" />
          </button>
        )}
      </div>
    </div>
  );
}

// Next tier lookup for upgrades
const NEXT_TIER: Record<string, GenericScopeTier> = {
  minimal: "read_only",
  read_only: "read_write",
  read_write: "elevated",
  elevated: "full",
};

export default function GoogleConnectedAccounts() {
  const {
    isLoading, identity, connectors, summary,
    launchHonesty, realityMode, loaded,
  } = useGoogleProviderFamily();

  const [upgradeTarget, setUpgradeTarget] = useState<GoogleConnectorState | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
<div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <svg className="h-6 w-6" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google Services
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your Google sign-in and connected services. Signing in with Google does <strong>not</strong> grant access to Drive, Gmail, or Calendar.
        </p>
      </div>

      {/* ── Google Identity Section ── */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-5 w-5" /> Sign-In Identity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {identity?.signedInWithGoogle ? (
            <div className="flex items-center justify-between p-4 rounded-xl bg-green-500/5 border border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Signed in with Google</p>
                  <p className="text-xs text-muted-foreground">{identity.email}</p>
                  {identity.primaryIdentity && (
                    <Badge className="bg-primary/20 text-primary text-xs mt-1">Primary Identity</Badge>
                  )}
                </div>
              </div>
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/10 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Google sign-in not linked</p>
                  <p className="text-xs text-muted-foreground">You can sign in with Google in your account settings</p>
                </div>
              </div>
              <XCircle className="h-5 w-5 text-muted-foreground" />
            </div>
          )}

          {/* Explicit separation notice */}
          <div className="mt-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
            <p className="text-xs text-blue-400">
              <strong>Important:</strong> Signing in with Google only verifies your identity. It does not grant SITA access to your Google Drive, Gmail, or Calendar. Each service must be connected separately.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Connected Services Section ── */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Link2 className="h-5 w-5" /> Google Services
            <Badge variant="outline" className="text-xs ml-auto">{summary.totalConnected}/{summary.totalAvailable} connected</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {connectors.length > 0 ? (
            connectors.map((c) => <ConnectorCard key={c.capabilityKey} connector={c} onUpgrade={setUpgradeTarget} />)
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No Google services available. Seed provider data in Admin OS.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Status Summary ── */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Connection Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatusTile
              label="Google Sign-In"
              connected={summary.signedInWithGoogle}
            />
            <StatusTile
              label="Google Drive"
              connected={summary.driveConnected ?? false}
            />
            <StatusTile
              label="Gmail"
              connected={summary.gmailConnected ?? false}
            />
            <StatusTile
              label="Calendar"
              connected={summary.calendarConnected ?? false}
            />
          </div>

          {summary.anyReauthNeeded && (
            <div className="mt-3 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <p className="text-xs text-yellow-400">One or more services need re-authentication</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Launch Honesty ── */}
      {launchHonesty.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Launch Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {launchHonesty.map((h) => (
                <div key={h.capabilityKey} className="flex items-center justify-between p-2 rounded-lg bg-muted/5 border border-border">
                  <div>
                    <p className="text-sm font-medium">{h.displayName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{h.launchLabel.replace(/_/g, " ")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {h.publicClaimSafe ? (
                      <Badge className="bg-green-500/20 text-green-400 text-xs">Safe to claim</Badge>
                    ) : (
                      <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">Qualifier needed</Badge>
                    )}
                    {h.blockers.length > 0 && (
                      <Badge variant="outline" className="text-xs">{h.blockers.length} blockers</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
       )}

      {/* ── Permission Upgrade Dialog ── */}
      {upgradeTarget && (
        <PermissionUpgradeDialog
          open={!!upgradeTarget}
          onOpenChange={(open) => { if (!open) setUpgradeTarget(null); }}
          capabilityKey={upgradeTarget.capabilityKey}
          displayName={upgradeTarget.displayName}
          currentTier={upgradeTarget.permissionLevel as GenericScopeTier}
          requestedTier={(NEXT_TIER[upgradeTarget.permissionLevel] ?? "read_write") as GenericScopeTier}
          currentScopes={upgradeTarget.grantedScopes}
          additionalScopes={[]}
          providerFamilyId={null}
        />
      )}
    </div>
  );
}

function StatusTile({ label, connected }: { label: string; connected: boolean }) {
  return (
    <div className={`p-3 rounded-lg border text-center ${connected ? "bg-green-500/5 border-green-500/20" : "bg-muted/5 border-border"}`}>
      <div className="flex justify-center mb-1">
        {connected ? <CheckCircle className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
      </div>
      <p className="text-xs font-medium">{label}</p>
      <p className={`text-xs ${connected ? "text-green-400" : "text-muted-foreground"}`}>
        {connected ? "Connected" : "Not connected"}
      </p>
    </div>
  );
}
