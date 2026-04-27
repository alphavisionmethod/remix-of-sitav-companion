import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, Shield, AlertTriangle } from "lucide-react";
import type { AdvisorAction } from "@/platform/advisors/hooks/use-advisor-agents";

const STATUS_COLORS: Record<string, string> = {
  proposed: "bg-amber-500/20 text-amber-300",
  approved: "bg-emerald-500/20 text-emerald-300",
  executed: "bg-blue-500/20 text-blue-300",
  rejected: "bg-red-500/20 text-red-300",
  verified: "bg-purple-500/20 text-purple-300",
};

interface Props {
  actions: AdvisorAction[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function AdvisorActionQueue({ actions, onApprove, onReject }: Props) {
  if (actions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Shield className="h-8 w-8 mb-2 opacity-50" />
          <p className="text-sm">No actions in queue</p>
          <p className="text-xs">Advisor agents will propose actions here after scanning</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {actions.map((action) => (
        <Card key={action.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">{action.advisor_id}</Badge>
                  <Badge className={`text-xs ${STATUS_COLORS[action.status] || ""}`}>
                    {action.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">{action.action_type}</Badge>
                </div>
                <p className="text-sm font-medium truncate">{action.summary || "No summary"}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Confidence: {(Number(action.confidence) * 100).toFixed(0)}%
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(action.created_at).toLocaleString()}
                  </span>
                  {action.receipt_hash && (
                    <span className="font-mono text-[10px] opacity-50">{action.receipt_hash}</span>
                  )}
                </div>
              </div>
              {action.status === "proposed" && (
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-primary hover:text-primary/80" onClick={() => onApprove(action.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive/80" onClick={() => onReject(action.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
