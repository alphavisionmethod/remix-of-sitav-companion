// ═══════════════════════════════════════════════════════════════
// SITA OS — All Provider Families Status
// Multi-provider status cards for Connected Accounts Center
// ═══════════════════════════════════════════════════════════════

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Globe, Smartphone, Monitor, DollarSign, MessageSquare, HardDrive,
  CheckCircle, XCircle, Clock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fromDynamicTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/contexts/DataModeContext";
import {
  PROVIDER_FAMILY_CONFIGS,
  type ProviderFamilyKey,
} from "@/lib/services/provider-family/types";

const ICON_MAP: Record<string, React.ReactNode> = {
  Globe: <Globe className="h-5 w-5" />,
  Smartphone: <Smartphone className="h-5 w-5" />,
  Monitor: <Monitor className="h-5 w-5" />,
  DollarSign: <DollarSign className="h-5 w-5" />,
  MessageSquare: <MessageSquare className="h-5 w-5" />,
  HardDrive: <HardDrive className="h-5 w-5" />,
};

const STAGE_LABELS: Record<string, { label: string; className: string }> = {
  production: { label: "Live", className: "bg-green-500/20 text-green-400" },
  beta: { label: "Beta", className: "bg-blue-500/20 text-blue-400" },
  alpha: { label: "Alpha", className: "bg-purple-500/20 text-purple-400" },
  planned: { label: "Coming Soon", className: "bg-muted text-muted-foreground" },
  deprecated: { label: "Deprecated", className: "bg-red-500/20 text-red-400" },
};

export function AllProviderFamiliesStatus() {
  const { user } = useAuth();
  const { isDemoMode } = useDataMode();

  // Query provider_families from DB to see which are seeded
  const { data: dbFamilies } = useQuery({
    queryKey: ["provider-families-all", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await fromDynamicTable("provider_families")
        .select("id, family_key, display_name, launch_stage, category")
        .eq("user_id", user.id);
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  // Query connected_service_links for connection counts
  const { data: connectedLinks } = useQuery({
    queryKey: ["connected-service-links-all", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await fromDynamicTable("connected_service_links")
        .select("id, provider_family_id, capability_key, connection_status")
        .eq("user_id", user.id);
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  // Build family status map — skip Google (handled by GoogleConnectedAccounts)
  const nonGoogleFamilies = (Object.keys(PROVIDER_FAMILY_CONFIGS) as ProviderFamilyKey[])
    .filter((k) => k !== "google");

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="h-5 w-5" /> Other Provider Families
          <Badge variant="outline" className="text-xs ml-auto">
            {nonGoogleFamilies.length} providers
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {nonGoogleFamilies.map((familyKey) => {
          const config = PROVIDER_FAMILY_CONFIGS[familyKey];
          const dbFamily = dbFamilies?.find((f: any) => f.family_key === familyKey);
          const familyLinks = dbFamily
            ? connectedLinks?.filter((l: any) => l.provider_family_id === dbFamily.id) ?? []
            : [];
          const connectedCount = familyLinks.filter((l: any) => l.connection_status === "connected").length;
          const stage = STAGE_LABELS[config.launchStage] ?? STAGE_LABELS.planned;

          return (
            <div
              key={familyKey}
              className="flex items-center justify-between p-4 rounded-xl bg-muted/10 border border-border"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-muted/20 ${config.color}`}>
                  {ICON_MAP[config.icon] ?? <Globe className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{config.name}</p>
                  <p className="text-xs text-muted-foreground">{config.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {config.identityCapable && (
                      <Badge variant="outline" className="text-[10px]">Identity</Badge>
                    )}
                    <Badge variant="outline" className="text-[10px]">
                      {config.connectorCapabilities.length} services
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {connectedCount > 0 ? (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-green-400">{connectedCount}</span>
                  </div>
                ) : config.launchStage === "planned" ? (
                  <Clock className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <Badge className={`text-xs ${stage.className}`}>{stage.label}</Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
