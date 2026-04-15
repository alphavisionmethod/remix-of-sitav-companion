import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Settings2, Flag, Shield, HardDrive, RefreshCw, DollarSign, Lock } from "lucide-react";
import { cloudQuotaService, type CloudPlan } from "@/lib/cloud-backbone/cloud-quota-service";
import { cloudStorageService } from "@/lib/cloud-backbone/cloud-storage-service";
import { toast } from "sonner";

interface FeatureFlag {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  scope: string;
}

interface PolicySetting {
  key: string;
  label: string;
  category: string;
  value: string;
  description: string;
  enforced: boolean;
  icon: React.ElementType;
}

export function CloudPolicyAdmin() {
  const plans = cloudQuotaService.getPlans();

  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([
    { key: "beta_collab", label: "Collaborative Editing", description: "Enable real-time collaborative file editing", enabled: false, scope: "global" },
    { key: "beta_e2ee", label: "End-to-End Encryption", description: "Enable E2EE for file storage and sync", enabled: false, scope: "global" },
    { key: "link_sharing", label: "Link Sharing", description: "Allow users to create shareable file links", enabled: true, scope: "global" },
    { key: "version_history", label: "Extended Version History", description: "Keep file versions for 90 days instead of 30", enabled: false, scope: "pro+" },
    { key: "selective_sync", label: "Selective Sync", description: "Let users choose which folders to sync per device", enabled: true, scope: "global" },
    { key: "offline_mode", label: "Offline Mode", description: "Full offline file access with local cache", enabled: true, scope: "global" },
    { key: "ai_search", label: "AI-Powered Search", description: "Use AI to search across file contents", enabled: false, scope: "enterprise" },
  ]);

  const [policies] = useState<PolicySetting[]>([
    { key: "retention_days", label: "Trash Retention", category: "Storage", value: "30 days", description: "How long deleted files are kept in trash", enforced: true, icon: HardDrive },
    { key: "max_upload_mb", label: "Max Upload Size", category: "Storage", value: "Varies by plan", description: "Maximum file size for uploads (Free: 100MB, Pro: 1GB, Enterprise: 5GB)", enforced: true, icon: HardDrive },
    { key: "sync_interval", label: "Sync Interval", category: "Sync", value: "Real-time", description: "How frequently changes are synced to cloud", enforced: true, icon: RefreshCw },
    { key: "secure_sync", label: "Secure-Only Sync", category: "Security", value: "Enabled", description: "Only allow sync over encrypted connections (TLS 1.3+)", enforced: true, icon: Lock },
    { key: "device_limit", label: "Device Limit", category: "Security", value: "Varies by plan", description: "Maximum devices per user account", enforced: true, icon: Shield },
    { key: "session_timeout", label: "Session Timeout", category: "Security", value: "30 days", description: "Inactive sessions are automatically revoked", enforced: true, icon: Shield },
  ]);

  const toggleFlag = (key: string) => {
    setFeatureFlags(prev => prev.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f));
    toast.success("Feature flag updated");
  };

  return (
    <div className="space-y-4">
      {/* Plans */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Plans & Quotas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map(plan => (
              <div key={plan.id} className={`rounded-lg border p-4 space-y-3 ${plan.planKey === "pro" ? "border-primary/50 bg-primary/5" : "border-border/50"}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{plan.displayName}</h3>
                  <span className="text-lg font-bold text-foreground">{cloudQuotaService.formatPrice(plan.priceCents)}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Storage</span>
                    <span className="font-medium">{cloudStorageService.formatBytes(plan.storageLimitBytes)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Devices</span>
                    <span className="font-medium">{plan.maxDevices}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Max File</span>
                    <span className="font-medium">{cloudStorageService.formatBytes(plan.maxFileSizeBytes)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {plan.features.map(f => (
                    <Badge key={f} variant="secondary" className="text-[10px]">{f}</Badge>
                  ))}
                </div>
                <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => toast.info(`Editing plan: ${plan.name}`)}>
                  Edit Plan
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Feature Flags */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Flag className="h-4 w-4 text-primary" />
              Feature Flags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {featureFlags.map(flag => (
              <div key={flag.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex-1 mr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{flag.label}</span>
                    <Badge variant="outline" className="text-[10px]">{flag.scope}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{flag.description}</p>
                </div>
                <Switch checked={flag.enabled} onCheckedChange={() => toggleFlag(flag.key)} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Policies */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-primary" />
              Platform Policies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {policies.map(policy => {
              const Icon = policy.icon;
              return (
                <div key={policy.key} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{policy.label}</span>
                      {policy.enforced && <Badge variant="default" className="text-[10px]">Enforced</Badge>}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{policy.description}</p>
                    <p className="text-xs font-mono text-primary mt-1">{policy.value}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
