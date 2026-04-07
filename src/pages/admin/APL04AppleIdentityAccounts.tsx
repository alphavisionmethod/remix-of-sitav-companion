import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KeyRound, Link, User, Shield, ArrowRight, CheckCircle2, AlertTriangle, Lock, Mail, Fingerprint } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const DEMO_IDENTITY_ARCHITECTURE = [
  { field: "Provider", value: "apple_sign_in", badge: "primary" },
  { field: "Protocol", value: "OAuth 2.0 + OIDC", badge: "outline" },
  { field: "Session model", value: "JWT (httpOnly cookie)", badge: "outline" },
  { field: "Email relay", value: "Private relay supported", badge: "outline" },
  { field: "Device-bound trust", value: "Linkable via DCAppAttest", badge: "outline" },
  { field: "Identity graph", value: "Unified across providers", badge: "outline" },
  { field: "Token refresh", value: "Silent refresh via refresh_token", badge: "outline" },
  { field: "Revocation", value: "Supported (user-initiated + admin)", badge: "outline" },
];

const DEMO_LINK_FLOW_STEPS = [
  { step: 1, icon: User, label: "User taps Sign in with Apple", detail: "Native AuthenticationServices dialog presented" },
  { step: 2, icon: Shield, label: "Apple verifies identity", detail: "Face ID / Touch ID + Apple ID password" },
  { step: 3, icon: Mail, label: "Email decision", detail: "User chooses real email or Apple private relay" },
  { step: 4, icon: KeyRound, label: "Authorization code issued", detail: "One-time auth code sent to SITA backend" },
  { step: 5, icon: Lock, label: "Backend validates + creates session", detail: "Exchange code for ID token, create/link profile" },
  { step: 6, icon: Link, label: "Apple ID linked to identity graph", detail: "Unified identity with device trust context" },
  { step: 7, icon: Fingerprint, label: "Device trust registered", detail: "Current device added to trusted devices list" },
];

const DEMO_SECURITY_POLICIES = [
  { policy: "Token lifetime", value: "15 minutes (access) / 7 days (refresh)", severity: "medium" },
  { policy: "Concurrent sessions", value: "Max 5 devices", severity: "medium" },
  { policy: "Session revocation", value: "Immediate on user request", severity: "high" },
  { policy: "Credential rotation", value: "Automatic on Apple-side changes", severity: "high" },
  { policy: "MFA requirement", value: "Apple's built-in 2FA", severity: "critical" },
  { policy: "Account deletion", value: "Full data erasure within 30 days", severity: "critical" },
  { policy: "Cross-provider linking", value: "Manual confirmation required", severity: "high" },
];

const APL04AppleIdentityAccounts = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
    <DemoModeBadge />
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10"><KeyRound className="h-8 w-8 text-primary" /></div>
      <div>
        <h1 className="text-2xl font-bold">Apple Identity & Linked Accounts</h1>
        <p className="text-muted-foreground">Sign in with Apple architecture, identity graph, session semantics, and security policies</p>
      </div>
    </div>

    <Tabs defaultValue="architecture" className="space-y-4">
      <TabsList>
        <TabsTrigger value="architecture">Architecture</TabsTrigger>
        <TabsTrigger value="flow">Link Flow</TabsTrigger>
        <TabsTrigger value="security">Security Policies</TabsTrigger>
        <TabsTrigger value="graph">Identity Graph</TabsTrigger>
      </TabsList>

      <TabsContent value="architecture">
        <Card>
          <CardHeader><CardTitle className="text-sm">Sign in with Apple — Architecture</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DEMO_IDENTITY_ARCHITECTURE.map((item) => (
                <div key={item.field} className="flex items-center justify-between p-3 rounded border text-xs">
                  <span className="font-medium">{item.field}</span>
                  <Badge variant={item.badge === "primary" ? "default" : "outline"}>{item.value}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="flow">
        <Card>
          <CardHeader><CardTitle className="text-sm">Identity Link Flow</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {DEMO_LINK_FLOW_STEPS.map((s, i) => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <s.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 pb-3 border-b last:border-0">
                  <div className="text-xs font-medium">Step {s.step}: {s.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.detail}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security">
        <Card>
          <CardHeader><CardTitle className="text-sm">Security Policies</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b">
                  <th className="text-left p-2">Policy</th>
                  <th className="text-left p-2">Value</th>
                  <th className="p-2">Severity</th>
                </tr></thead>
                <tbody>
                  {DEMO_SECURITY_POLICIES.map((p) => (
                    <tr key={p.policy} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-medium">{p.policy}</td>
                      <td className="p-2 text-muted-foreground">{p.value}</td>
                      <td className="p-2 text-center"><Badge variant={p.severity === "critical" ? "destructive" : p.severity === "high" ? "default" : "secondary"}>{p.severity}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="graph">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Unified Identity Graph</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2">
              <p>SITA maintains a single identity graph per user, linking multiple providers:</p>
              {["Apple ID (Sign in with Apple)", "Google Account (OAuth)", "Email/Password (Supabase Auth)", "Connected services (via connectors)"].map((p) => (
                <div key={p} className="flex items-center gap-2 p-2 rounded border"><CheckCircle2 className="h-3 w-3 text-green-500" />{p}</div>
              ))}
              <p className="text-muted-foreground mt-2">Each provider maps to the same internal user_id. Cross-linking requires explicit user confirmation.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Revocation & Unlinking</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2">
              {[
                { action: "Unlink Apple ID", effect: "Removes Apple auth, keeps account via other providers", risk: "medium" },
                { action: "Revoke in Apple Settings", effect: "SITA receives server-to-server notification, disables provider", risk: "high" },
                { action: "Delete Account", effect: "Full GDPR erasure — all data removed within 30 days", risk: "critical" },
              ].map((a) => (
                <div key={a.action} className="p-3 rounded border space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{a.action}</span>
                    <Badge variant={a.risk === "critical" ? "destructive" : a.risk === "high" ? "default" : "secondary"}>{a.risk}</Badge>
                  </div>
                  <p className="text-muted-foreground">{a.effect}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  </div>
);

export default APL04AppleIdentityAccounts;
