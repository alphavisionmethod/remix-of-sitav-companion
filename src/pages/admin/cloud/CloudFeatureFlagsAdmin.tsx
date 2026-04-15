import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flag, Search, Users, Percent, Monitor, Globe, FlaskConical, Shield } from "lucide-react";
import { fromTable } from "@/lib/supabase-helpers";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FeatureFlag {
  id: string;
  flag_key: string;
  display_name: string;
  description: string | null;
  enabled: boolean;
  scope: string;
  conditions: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

const SCOPE_ICONS: Record<string, typeof Globe> = {
  global: Globe,
  internal: Shield,
  beta: FlaskConical,
  tenant: Users,
  percentage: Percent,
  device: Monitor,
};

const SCOPE_COLORS: Record<string, string> = {
  global: "text-blue-400",
  internal: "text-amber-400",
  beta: "text-purple-400",
  tenant: "text-emerald-400",
  percentage: "text-cyan-400",
  device: "text-rose-400",
};

function getDemoFlags(): FeatureFlag[] {
  return [
    { id: "ff1", flag_key: "delta-sync", display_name: "Delta Sync", description: "Incremental file sync using content-defined chunking", enabled: true, scope: "global", conditions: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "ff2", flag_key: "e2ee-classes", display_name: "E2EE Encryption Classes", description: "End-to-end encryption for sensitive namespaces", enabled: true, scope: "beta", conditions: { percentage: 25 }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "ff3", flag_key: "previews", display_name: "Media Previews", description: "Automatic thumbnail and preview generation", enabled: true, scope: "global", conditions: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "ff4", flag_key: "archive-tiering", display_name: "Archive Tiering", description: "Automatic hot/warm/cold storage tiering", enabled: false, scope: "internal", conditions: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "ff5", flag_key: "sharing", display_name: "File & Folder Sharing", description: "Share files with expiring links and permissions", enabled: false, scope: "beta", conditions: { percentage: 10 }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "ff6", flag_key: "app-cloud-apis", display_name: "App Cloud APIs", description: "Developer SDK for third-party cloud storage access", enabled: false, scope: "internal", conditions: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "ff7", flag_key: "nearby-sync", display_name: "Nearby Sync", description: "Local network peer-to-peer file transfer", enabled: true, scope: "percentage", conditions: { percentage: 50 }, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "ff8", flag_key: "new-conflict-engines", display_name: "New Conflict Resolution", description: "Advanced CRDT-based conflict resolution engine", enabled: false, scope: "internal", conditions: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ];
}

export function CloudFeatureFlagsAdmin() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fromTable("cloud_feature_flags")
      .select("*")
      .order("created_at")
      .then(({ data }: any) => {
        setFlags(data?.length ? data : getDemoFlags());
        setLoading(false);
      })
      .catch(() => { setFlags(getDemoFlags()); setLoading(false); });
  }, []);

  const enabledCount = flags.filter(f => f.enabled).length;
  const filtered = flags.filter(f =>
    f.display_name.toLowerCase().includes(search.toLowerCase()) ||
    f.flag_key.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFlag = (id: string) => {
    setFlags(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
    const flag = flags.find(f => f.id === id);
    toast.success(`${flag?.display_name} ${flag?.enabled ? "disabled" : "enabled"}`);
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Flags", value: flags.length, icon: Flag, color: "text-blue-400" },
          { label: "Enabled", value: enabledCount, icon: Flag, color: "text-emerald-400" },
          { label: "Disabled", value: flags.length - enabledCount, icon: Flag, color: "text-muted-foreground" },
          { label: "Beta Rollouts", value: flags.filter(f => f.scope === "beta").length, icon: FlaskConical, color: "text-purple-400" },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <m.icon className={cn("h-5 w-5", m.color)} />
              <div>
                <p className="text-2xl font-bold">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search flags..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Flags */}
      <div className="space-y-2">
        {filtered.map(flag => {
          const ScopeIcon = SCOPE_ICONS[flag.scope] || Globe;
          return (
            <Card key={flag.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", flag.enabled ? "bg-emerald-500/20" : "bg-muted/30")}>
                      <Flag className={cn("h-4 w-4", flag.enabled ? "text-emerald-400" : "text-muted-foreground")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{flag.display_name}</p>
                        <Badge variant="outline" className={cn("text-xs shrink-0", SCOPE_COLORS[flag.scope])}>
                          <ScopeIcon className="h-3 w-3 mr-1" /> {flag.scope}
                        </Badge>
                        {flag.conditions?.percentage && (
                          <Badge variant="outline" className="text-xs text-cyan-400">
                            <Percent className="h-3 w-3 mr-1" /> {String(flag.conditions.percentage)}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{flag.description}</p>
                      <p className="text-xs text-muted-foreground/60 font-mono mt-0.5">{flag.flag_key}</p>
                    </div>
                  </div>
                  <Switch checked={flag.enabled} onCheckedChange={() => toggleFlag(flag.id)} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
