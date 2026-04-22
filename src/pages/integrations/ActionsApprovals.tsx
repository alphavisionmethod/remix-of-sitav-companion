import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Shield, CheckCircle, XCircle, AlertTriangle, Clock, ArrowRight, Zap, Eye, Play, Ban } from "lucide-react";
import { DEMO_ACTION_REQUESTS } from "@/data/seed/integrations";
import type { DemoActionRequest } from "@/data/seed/integrations";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";


const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  proposed: { color: "text-blue-400", icon: Clock, label: "Pending Approval" },
  approved: { color: "text-green-400", icon: CheckCircle, label: "Approved" },
  rejected: { color: "text-red-400", icon: XCircle, label: "Rejected" },
  executing: { color: "text-amber-400", icon: Zap, label: "Executing" },
  succeeded: { color: "text-green-400", icon: CheckCircle, label: "Succeeded" },
  failed: { color: "text-red-400", icon: AlertTriangle, label: "Failed" },
};

function ActionCard({ action, onApprove, onReject }: { action: DemoActionRequest; onApprove?: () => void; onReject?: () => void }) {
  const isDemoMode = false;
  const [showDryRun, setShowDryRun] = useState(false);
  const config = statusConfig[action.status];
  const StatusIcon = config.icon;

  return (
    <Card className={`bg-card/50 border-border/50 ${action.riskLevel === "high" ? "border-l-2 border-l-red-500" : action.riskLevel === "medium" ? "border-l-2 border-l-amber-500" : ""}`}>
<CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <StatusIcon className={`w-4 h-4 mt-0.5 ${config.color}`} />
            <div>
              <h3 className="text-sm font-semibold text-foreground">{action.actionName}</h3>
              <p className="text-[10px] text-muted-foreground">{action.providerName} • Requested {new Date(action.requestedAt).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <Badge variant={action.riskLevel === "high" ? "destructive" : action.riskLevel === "medium" ? "default" : "secondary"} className="text-[9px] capitalize">{action.riskLevel} risk</Badge>
            <Badge variant="outline" className="text-[9px]">{config.label}</Badge>
          </div>
        </div>

        {/* Payload summary */}
        <div className="p-2.5 bg-muted/20 rounded-lg">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Action Payload</p>
          {Object.entries(action.payload).map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs">
              <span className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
              <span className="text-foreground font-medium">{typeof v === "object" ? JSON.stringify(v).slice(0, 40) : String(v)}</span>
            </div>
          ))}
        </div>

        {/* Dry Run Preview */}
        {action.dryRunResult && (
          <div>
            <Button variant="ghost" size="sm" className="text-[10px] gap-1 p-0 h-auto" onClick={() => setShowDryRun(!showDryRun)}>
              <Eye className="w-3 h-3" /> {showDryRun ? "Hide" : "Show"} Preview
            </Button>
            {showDryRun && (
              <div className="mt-2 p-3 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
                <p className="text-[10px] font-semibold text-primary uppercase">Dry Run Preview</p>
                {action.dryRunResult.preview.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <Badge variant="outline" className="text-[9px] capitalize">{item.action}</Badge>
                    <span className="text-muted-foreground">{item.field}:</span>
                    {item.currentValue !== "—" && <span className="text-foreground line-through">{item.currentValue}</span>}
                    <ArrowRight className="w-3 h-3 text-primary" />
                    <span className="text-foreground font-medium">{item.newValue}</span>
                  </div>
                ))}
                {action.dryRunResult.warnings?.length > 0 && (
                  <div className="mt-2">
                    {action.dryRunResult.warnings.map((w: string, i: number) => (
                      <div key={i} className="flex items-center gap-1.5 text-[10px] text-amber-400">
                        <AlertTriangle className="w-3 h-3" /> {w}
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground">Impact: {action.dryRunResult.estimatedImpact}</p>
                {action.dryRunResult.estimatedCost && (
                  <p className="text-[10px] text-amber-400 font-medium">Est. cost: ${(action.dryRunResult.estimatedCost.amount / 100).toFixed(0)}/mo {action.dryRunResult.estimatedCost.currency}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Execution result */}
        {action.executionResult && (
          <div className="p-2.5 bg-green-500/5 border border-green-500/20 rounded-lg">
            <p className="text-[10px] font-semibold text-green-400 uppercase mb-1">Execution Result</p>
            <p className="text-xs text-foreground">{JSON.stringify(action.executionResult)}</p>
          </div>
        )}

        {/* Approve/Reject buttons */}
        {action.status === "proposed" && (
          <div className="flex gap-2 pt-1">
            <Button size="sm" className="gap-1.5 flex-1" onClick={onApprove}>
              <CheckCircle className="w-3.5 h-3.5" /> Approve & Execute
            </Button>
            <Button variant="destructive" size="sm" className="gap-1.5 flex-1" onClick={onReject}>
              <Ban className="w-3.5 h-3.5" /> Reject
            </Button>
          </div>
        )}

        {action.status === "approved" && (
          <Button size="sm" className="gap-1.5 w-full">
            <Play className="w-3.5 h-3.5" /> Execute Now
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function ActionsApprovals() {
  const isDemoMode = false;
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const actionRequests = [];
  const filtered = filter === "all" ? actionRequests : actionRequests.filter(a => a.status === filter);

  const pending = actionRequests.filter(a => a.status === "proposed").length;
  const approved = actionRequests.filter(a => a.status === "approved" || a.status === "succeeded").length;
  const rejected = actionRequests.filter(a => a.status === "rejected").length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Actions & Approvals</h1>
        <p className="text-muted-foreground">Review, approve, and track write actions across all integrations</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Pending Review", value: pending.toString(), icon: Clock, color: "text-blue-400" },
          { label: "Approved/Done", value: approved.toString(), icon: CheckCircle, color: "text-green-400" },
          { label: "Rejected", value: rejected.toString(), icon: XCircle, color: "text-red-400" },
          { label: "Total Actions", value: ([] as typeof DEMO_ACTION_REQUESTS).length.toString(), icon: Shield, color: "text-purple-400" },
        ].map(s => (
          <Card key={s.label} className="bg-card/50 border-border/50">
            <CardContent className="p-3 flex items-center gap-3">
              <s.icon className={`w-4 h-4 ${s.color} shrink-0`} />
              <div>
                <p className="text-lg font-bold text-foreground leading-tight">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        {["all", "proposed", "approved", "succeeded", "rejected", "failed"].map(f => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" className="text-xs capitalize" onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(action => (
          <ActionCard key={action.id} action={action} />
        ))}
        {filtered.length === 0 && (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No actions match this filter</p>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
