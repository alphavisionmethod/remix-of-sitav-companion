import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GitBranch, CheckCircle, Circle, AlertTriangle, ArrowDown, RotateCcw } from "lucide-react";

interface OrchestrationStep {
  id: string;
  label: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  detail?: string;
  policyDecision?: string;
  duration?: number;
}

interface OrchestrationFlowViewerProps {
  steps: OrchestrationStep[];
  title?: string;
  intentRaw?: string;
}

const STATUS_CONFIG = {
  pending: { icon: Circle, color: "text-muted-foreground", bg: "bg-white/[0.04]" },
  running: { icon: Circle, color: "text-sita-purple animate-pulse", bg: "bg-sita-purple/10" },
  completed: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  failed: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-400/10" },
  skipped: { icon: Circle, color: "text-muted-foreground/50", bg: "bg-white/[0.02]" },
};

export default function OrchestrationFlowViewer({ steps, title = "Action Pipeline", intentRaw }: OrchestrationFlowViewerProps) {
  const completedCount = steps.filter(s => s.status === "completed").length;
  const failedCount = steps.filter(s => s.status === "failed").length;

  return (
    <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-foreground flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-sita-purple" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-400/30">
              {completedCount}/{steps.length}
            </Badge>
            {failedCount > 0 && (
              <Badge variant="outline" className="text-xs text-red-400 border-red-400/30">
                {failedCount} failed
              </Badge>
            )}
          </div>
        </div>
        {intentRaw && (
          <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
            Intent: "{intentRaw}"
          </p>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-1">
            {steps.map((step, index) => {
              const config = STATUS_CONFIG[step.status];
              const Icon = config.icon;
              const isLast = index === steps.length - 1;

              return (
                <div key={step.id}>
                  <div className={`flex items-start gap-3 p-3 rounded-lg ${config.bg} transition-colors`}>
                    <div className="flex flex-col items-center">
                      <Icon className={`h-4 w-4 ${config.color} mt-0.5`} />
                      {!isLast && (
                        <div className="w-px h-4 bg-white/[0.08] mt-1" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${step.status === "skipped" ? "text-muted-foreground line-through" : "text-foreground"}`}>
                          {step.label}
                        </p>
                        {step.duration != null && (
                          <span className="text-xs text-muted-foreground">{step.duration}ms</span>
                        )}
                      </div>
                      {step.detail && (
                        <p className="text-xs text-muted-foreground mt-0.5">{step.detail}</p>
                      )}
                      {step.policyDecision && (
                        <Badge variant="outline" className="text-xs mt-1 border-sita-gold/30 text-sita-gold">
                          Policy: {step.policyDecision}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Helper to create a standard intent pipeline
export function createIntentPipelineSteps(status: "idle" | "processing" | "completed" | "failed"): OrchestrationStep[] {
  const stages: Array<{ id: string; label: string }> = [
    { id: "parse", label: "Parse Intent" },
    { id: "plan", label: "Build Execution Plan" },
    { id: "safety", label: "Safety Classification" },
    { id: "trust", label: "Trust Verification" },
    { id: "policy", label: "Policy Check" },
    { id: "execute", label: "Execute Actions" },
    { id: "verify", label: "Verify Result" },
    { id: "receipt", label: "Generate Receipt" },
  ];

  if (status === "idle") {
    return stages.map(s => ({ ...s, status: "pending" as const }));
  }
  if (status === "completed") {
    return stages.map(s => ({ ...s, status: "completed" as const, duration: Math.floor(Math.random() * 50 + 10) }));
  }
  if (status === "failed") {
    const failAt = Math.floor(Math.random() * 5 + 2);
    return stages.map((s, i) => ({
      ...s,
      status: i < failAt ? ("completed" as const) : i === failAt ? ("failed" as const) : ("skipped" as const),
      duration: i <= failAt ? Math.floor(Math.random() * 50 + 10) : undefined,
      detail: i === failAt ? "Policy violation: insufficient trust" : undefined,
    }));
  }
  // processing
  const currentStep = Math.floor(Math.random() * stages.length);
  return stages.map((s, i) => ({
    ...s,
    status: i < currentStep ? ("completed" as const) : i === currentStep ? ("running" as const) : ("pending" as const),
    duration: i < currentStep ? Math.floor(Math.random() * 50 + 10) : undefined,
  }));
}
