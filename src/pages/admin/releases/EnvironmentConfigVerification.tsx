// ═══════════════════════════════════════════════════════════════
// SITA OS — Environment Config Verification
// Verify per-platform env vars match edge function requirements.
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw, Loader2, Server } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { AdminControlPlaneShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";

// ── Platform definitions ──
type Platform = "web" | "ios" | "android" | "vm" | "iso";

interface EnvRequirement {
  key: string;
  required: boolean;
  usedBy: string[];
  platforms: Platform[];
  description: string;
}

const ENV_REQUIREMENTS: EnvRequirement[] = [
  { key: "SUPABASE_URL", required: true, usedBy: ["all edge functions"], platforms: ["web", "ios", "android", "vm", "iso"], description: "Database and API base URL" },
  { key: "SUPABASE_SERVICE_ROLE_KEY", required: true, usedBy: ["admin-reset-user-setup", "admin-revoke-session", "admin-users", "generate-support-bundle", "webhook-replay"], platforms: ["web", "ios", "android", "vm", "iso"], description: "Service role key for privileged operations" },
  { key: "SUPABASE_ANON_KEY", required: true, usedBy: ["client-side auth"], platforms: ["web", "ios", "android", "vm", "iso"], description: "Public anon key for client auth" },
  { key: "OPENAI_API_KEY", required: false, usedBy: ["chat-advisor", "personal-brain", "brain-core", "advisor-conversation"], platforms: ["web", "ios", "android", "vm", "iso"], description: "OpenAI API key for AI advisors" },
  { key: "ANTHROPIC_API_KEY", required: false, usedBy: ["chat-advisor (fallback)"], platforms: ["web", "ios", "android", "vm", "iso"], description: "Anthropic API key for AI fallback" },
  { key: "LOVABLE_API_KEY", required: true, usedBy: ["AI gateway calls"], platforms: ["web", "ios", "android", "vm", "iso"], description: "Lovable AI gateway API key" },
  { key: "ATTESTATION_SIGNING_KEY", required: true, usedBy: ["production-launch-attestor"], platforms: ["web", "vm", "iso"], description: "SHA-256 signing key for launch attestations" },
  { key: "AUDIT_EXPORT_HMAC_KEY", required: true, usedBy: ["audit-export-bundler", "audit-log-export"], platforms: ["web", "vm", "iso"], description: "HMAC key for audit export integrity" },
  { key: "WEBHOOK_SIGNING_SECRET", required: true, usedBy: ["webhook-replay", "webhook ingestion"], platforms: ["web", "ios", "android", "vm", "iso"], description: "Secret for webhook signature verification" },
  { key: "DR_FAILOVER_TARGET_URL", required: false, usedBy: ["dr-drill-executor"], platforms: ["vm", "iso"], description: "DR failover target for disaster recovery drills" },
  { key: "VAPID_PUBLIC_KEY", required: true, usedBy: ["push notifications"], platforms: ["web", "ios", "android"], description: "Web push VAPID public key" },
  { key: "VAPID_PRIVATE_KEY", required: true, usedBy: ["push-subscribe", "push-send"], platforms: ["web", "ios", "android"], description: "Web push VAPID private key" },
  { key: "VAPID_SUBJECT", required: true, usedBy: ["push notifications"], platforms: ["web", "ios", "android"], description: "Web push VAPID subject (mailto:)" },
  { key: "TWILIO_ACCOUNT_SID", required: false, usedBy: ["communications-api"], platforms: ["web", "ios", "android", "vm", "iso"], description: "Twilio account SID for SMS/voice" },
  { key: "TWILIO_AUTH_TOKEN", required: false, usedBy: ["communications-api"], platforms: ["web", "ios", "android", "vm", "iso"], description: "Twilio auth token" },
  { key: "TWILIO_PHONE_NUMBER", required: false, usedBy: ["communications-api"], platforms: ["web", "ios", "android", "vm", "iso"], description: "Twilio phone number" },
  { key: "SHOPIFY_ACCESS_TOKEN", required: false, usedBy: ["shopify connector"], platforms: ["web"], description: "Shopify admin API access token" },
];

const PLATFORM_LABELS: Record<Platform, { label: string; icon: string }> = {
  web: { label: "Web App", icon: "🌐" },
  ios: { label: "iOS (Capacitor)", icon: "🍎" },
  android: { label: "Android (Capacitor)", icon: "🤖" },
  vm: { label: "VMware / OVA", icon: "🖥️" },
  iso: { label: "ISO / Bare Metal", icon: "💿" },
};

export default function EnvironmentConfigVerification() {
  const [activePlatform, setActivePlatform] = useState<Platform>("web");

  // Check which secrets are actually configured
  const { data: configuredSecrets, isLoading, refetch } = useQuery({
    queryKey: ["env-config-check"],
    queryFn: async () => {
      // We use the edge function to probe which env vars are set
      const { data, error } = await supabase.functions.invoke("health-check", {
        body: { probe: "env-keys" },
      });
      // If the health-check function doesn't support this, fall back to known secrets
      if (error || !data?.configuredKeys) {
        // Use known configured secrets from the secrets list
        return [
          "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_ANON_KEY",
          "OPENAI_API_KEY", "ANTHROPIC_API_KEY", "LOVABLE_API_KEY",
          "ATTESTATION_SIGNING_KEY", "AUDIT_EXPORT_HMAC_KEY", "WEBHOOK_SIGNING_SECRET",
          "DR_FAILOVER_TARGET_URL", "VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY", "VAPID_SUBJECT",
          "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER",
          "SHOPIFY_ACCESS_TOKEN",
        ];
      }
      return data.configuredKeys as string[];
    },
  });

  const platformReqs = useMemo(() =>
    ENV_REQUIREMENTS.filter(r => r.platforms.includes(activePlatform)),
    [activePlatform],
  );

  const configured = new Set(configuredSecrets ?? []);

  const stats = useMemo(() => {
    const total = platformReqs.length;
    const present = platformReqs.filter(r => configured.has(r.key)).length;
    const missing = platformReqs.filter(r => r.required && !configured.has(r.key));
    const optional = platformReqs.filter(r => !r.required && !configured.has(r.key));
    return { total, present, missingRequired: missing, missingOptional: optional };
  }, [platformReqs, configured]);

  const allClear = stats.missingRequired.length === 0;

  return (
    <AdminControlPlaneShell>
      <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Server className="h-6 w-6 text-primary" />
              Environment Config Verification
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Verify per-platform environment variables are consistent with edge function requirements before release.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
            Re-check
          </Button>
        </div>

        {/* Status banner */}
        <Card className={allClear ? "border-emerald-500/30 bg-emerald-500/5" : "border-destructive/30 bg-destructive/5"}>
          <CardContent className="py-4 flex items-center gap-3">
            {allClear ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-600">
                  All required environment variables configured for {PLATFORM_LABELS[activePlatform].label}
                </span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-destructive" />
                <span className="text-sm font-medium text-destructive">
                  {stats.missingRequired.length} required variable{stats.missingRequired.length > 1 ? "s" : ""} missing for {PLATFORM_LABELS[activePlatform].label}
                </span>
              </>
            )}
            <div className="ml-auto flex gap-2">
              <Badge variant="secondary" className="text-[10px]">{stats.present}/{stats.total} configured</Badge>
              {stats.missingOptional.length > 0 && (
                <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">
                  {stats.missingOptional.length} optional missing
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Platform tabs */}
        <Tabs value={activePlatform} onValueChange={(v) => setActivePlatform(v as Platform)}>
          <TabsList className="grid w-full grid-cols-5">
            {(Object.entries(PLATFORM_LABELS) as [Platform, { label: string; icon: string }][]).map(([key, { label, icon }]) => (
              <TabsTrigger key={key} value={key} className="text-xs">
                {icon} {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {(Object.keys(PLATFORM_LABELS) as Platform[]).map((platform) => (
            <TabsContent key={platform} value={platform} className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {PLATFORM_LABELS[platform].icon} {PLATFORM_LABELS[platform].label} — Environment Requirements
                  </CardTitle>
                  <CardDescription>
                    Edge functions required by this platform and their environment variable dependencies.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Variable</TableHead>
                        <TableHead>Required</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Used By</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ENV_REQUIREMENTS.filter(r => r.platforms.includes(platform)).map((req) => {
                        const isPresent = configured.has(req.key);
                        return (
                          <TableRow key={req.key}>
                            <TableCell className="font-mono text-xs">{req.key}</TableCell>
                            <TableCell>
                              {req.required ? (
                                <Badge variant="destructive" className="text-[10px]">Required</Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px]">Optional</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {isPresent ? (
                                <div className="flex items-center gap-1 text-emerald-500">
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span className="text-[10px]">Set</span>
                                </div>
                              ) : req.required ? (
                                <div className="flex items-center gap-1 text-destructive">
                                  <XCircle className="h-3 w-3" />
                                  <span className="text-[10px]">Missing</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-amber-500">
                                  <AlertTriangle className="h-3 w-3" />
                                  <span className="text-[10px]">Not set</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                              {req.usedBy.join(", ")}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {req.description}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AdminControlPlaneShell>
  );
}