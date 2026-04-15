import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Code, FlaskConical, Check } from "lucide-react";
import { environmentConfig, type EnvironmentInfo } from "@/lib/platform-plane";

const ENV_ICONS: Record<string, any> = {
  dev: Code,
  staging: FlaskConical,
  production: Globe,
};

const ENV_COLORS: Record<string, string> = {
  dev: "border-green-500/30 bg-green-500/5",
  staging: "border-amber-500/30 bg-amber-500/5",
  production: "border-red-500/30 bg-red-500/5",
};

export function EnvironmentSwitcher() {
  const [environments, setEnvironments] = useState<EnvironmentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const currentEnv = environmentConfig.getCurrentEnvironment();

  useEffect(() => {
    environmentConfig.getEnvironments().then((envs) => {
      setEnvironments(envs);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="h-48 bg-muted/30 rounded-lg animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Globe className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Environments</h2>
        <Badge variant="outline" className="text-[10px]">{environments.length} configured</Badge>
      </div>

      {/* Current Environment */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Check className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Environment</p>
              <p className="text-sm font-semibold text-foreground capitalize">{currentEnv}</p>
            </div>
            <Badge className="ml-auto text-[10px] bg-primary/20 text-primary border-primary/30">Active</Badge>
          </div>
        </CardContent>
      </Card>

      {/* All Environments */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {environments.map((env) => {
          const Icon = ENV_ICONS[env.envKey] || Globe;
          const isCurrent = env.envKey === currentEnv;
          return (
            <Card key={env.id} className={`${ENV_COLORS[env.envKey]} border ${isCurrent ? "ring-1 ring-primary/50" : ""}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {env.displayName}
                  {isCurrent && <Badge className="text-[9px] bg-green-500/20 text-green-400">Current</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">{env.description}</p>
                {env.apiBaseUrl && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">API</span>
                    <span className="text-[10px] text-foreground font-mono truncate max-w-[180px]">{env.apiBaseUrl}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Status</span>
                  <Badge variant="outline" className="text-[9px]">{env.status}</Badge>
                </div>
                {env.config && Object.keys(env.config).length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-border/30">
                    <span className="text-[10px] text-muted-foreground">Config</span>
                    {Object.entries(env.config).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground font-mono">{k}</span>
                        <span className="text-foreground">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
