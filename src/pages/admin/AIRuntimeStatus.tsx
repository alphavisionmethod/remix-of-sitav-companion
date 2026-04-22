import { useAIHealth, getAIStatusMessage, isAIFeatureAvailable } from "@/hooks/use-ai-health";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, CheckCircle2, XCircle, AlertTriangle, Loader2, Activity, Zap, Shield, DollarSign, Clock, Server, Inbox } from "lucide-react";
import { DEMO_AI_FEATURES } from "@/data/seed/admin-platform";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { EmptyState } from "@/components/sita/EmptyState";
const statusColors = {
  healthy: "bg-green-500/20 text-green-400 border-green-500/30",
  degraded: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  unavailable: "bg-red-500/20 text-red-400 border-red-500/30",
  unknown: "bg-muted text-muted-foreground border-border",
};

const statusIcons = {
  healthy: <CheckCircle2 className="h-5 w-5 text-green-400" />,
  degraded: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
  unavailable: <XCircle className="h-5 w-5 text-red-400" />,
  unknown: <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />,
};

function CheckRow({ label, ok, detail }: { label: string; ok: boolean | null; detail?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
<span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        {detail && <span className="text-xs text-muted-foreground">{detail}</span>}
        {ok === null ? (
          <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
        ) : ok ? (
          <CheckCircle2 className="h-4 w-4 text-green-400" />
        ) : (
          <XCircle className="h-4 w-4 text-red-400" />
        )}
      </div>
    </div>
  );
}

export default function AIRuntimeStatus() {
  const { data: health, isLoading, refetch, isFetching } = useAIHealth();

  const status = health?.status || "unknown";
  const available = isAIFeatureAvailable(health);
  const message = getAIStatusMessage(health);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Runtime Status</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time health monitoring for SITA's AI infrastructure</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Status Banner */}
      <Card className={`border ${statusColors[status]}`}>
        <CardContent className="flex items-center gap-4 py-4">
          {statusIcons[status]}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground capitalize">{status}</span>
              <Badge variant="outline" className="text-xs">{health?.active_provider || "lovable-ai-gateway"}</Badge>
              <Badge variant="outline" className="text-xs">{health?.active_model || "—"}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{message}</p>
          </div>
          {health?.checks.provider_latency_ms && (
            <div className="text-right">
              <div className="text-lg font-mono text-foreground">{health.checks.provider_latency_ms}ms</div>
              <div className="text-xs text-muted-foreground">latency</div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Infrastructure Checks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="h-4 w-4" />
              Infrastructure Checks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div>
                <CheckRow label="API Key Present" ok={health?.checks.api_key_present ?? null} />
                <CheckRow label="Provider Reachable" ok={health?.checks.provider_reachable ?? null} />
                <CheckRow label="Model Invocation" ok={health?.checks.model_invocation_ok ?? null} />
                <CheckRow label="Structured Output (Tool Calling)" ok={health?.checks.structured_output_ok ?? null} />
                <CheckRow label="Rate Limit OK" ok={health?.checks.rate_limit_ok ?? null} />
                <CheckRow label="Budget OK" ok={health?.checks.budget_ok ?? null} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edge Function Health */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Edge Function Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div>
                {Object.entries(health?.checks.edge_functions_healthy || {}).map(([fn, ok]) => (
                  <CheckRow key={fn} label={fn} ok={ok} />
                ))}
                {!health?.checks.edge_functions_healthy || Object.keys(health.checks.edge_functions_healthy).length === 0 ? (
                  <EmptyState
                    icon={<Inbox className="h-5 w-5" />}
                    title="No edge function health data"
                    description="Run a health check to populate per-function readiness signals."
                  />
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Feature Activation Board */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              AI Feature Activation Board
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 pr-4 text-muted-foreground font-medium">Feature</th>
                    <th className="py-2 pr-4 text-muted-foreground font-medium">Edge Function</th>
                    <th className="py-2 pr-4 text-muted-foreground font-medium">Frontend Surface</th>
                    <th className="py-2 pr-4 text-muted-foreground font-medium">Uses AI Provider</th>
                    <th className="py-2 pr-4 text-muted-foreground font-medium">Runtime Status</th>
                  </tr>
                </thead>
                <tbody>
                  {([] as typeof DEMO_AI_FEATURES).map((feature) => {
                    const fnHealthy = health?.checks.edge_functions_healthy?.[feature.fn];
                    const usesAI = feature.fn === "chat-advisor" || feature.fn === "brain-core" || feature.fn === "personal-brain";
                    const featureStatus = usesAI
                      ? (available ? "operational" : health?.status === "degraded" ? "degraded" : "blocked")
                      : "operational"; // non-AI functions are always operational

                    return (
                      <tr key={feature.fn} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 pr-4">
                          <div className="font-medium text-foreground">{feature.name}</div>
                          <div className="text-xs text-muted-foreground">{feature.description}</div>
                        </td>
                        <td className="py-2.5 pr-4 font-mono text-xs">{feature.fn}</td>
                        <td className="py-2.5 pr-4 text-xs text-muted-foreground">{feature.surface}</td>
                        <td className="py-2.5 pr-4">
                          {usesAI ? (
                            <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">AI-Powered</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">No AI</Badge>
                          )}
                        </td>
                        <td className="py-2.5 pr-4">
                          <Badge className={`text-xs ${
                            featureStatus === "operational" ? "bg-green-500/20 text-green-400" :
                            featureStatus === "degraded" ? "bg-yellow-500/20 text-yellow-400" :
                            "bg-red-500/20 text-red-400"
                          }`}>
                            {featureStatus}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Timing & History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last Successful AI Call</span>
              <span className="text-foreground font-mono text-xs">
                {health?.last_successful_call
                  ? new Date(health.last_successful_call).toLocaleString()
                  : "No calls recorded"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Health Check Time</span>
              <span className="text-foreground font-mono text-xs">
                {health?.timestamp ? new Date(health.timestamp).toLocaleString() : "—"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Error Details */}
        {health?.error_details && (
          <Card className="border-red-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-red-400">
                <Shield className="h-4 w-4" />
                Error Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-300 bg-red-500/10 rounded p-3 font-mono">
                {health.error_details}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
