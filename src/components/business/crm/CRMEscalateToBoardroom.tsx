// SITA OS — CRM Boardroom Escalation Dialog
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AlertTriangle, Shield, Sparkles, Send } from "lucide-react";
import { fromTable } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";

interface EscalationContext {
  entityType: "contact" | "company" | "deal";
  entityId: string;
  entityName: string;
  healthScore?: number;
  pipelineValue?: number;
  advisorSummary?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: EscalationContext;
}

const SEVERITY_OPTIONS = [
  { key: "critical", label: "Critical", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  { key: "high", label: "High", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { key: "medium", label: "Medium", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
];

export function CRMEscalateToBoardroom({ open, onOpenChange, context }: Props) {
  const [title, setTitle] = useState(`${context.entityType === "deal" ? "Deal" : context.entityType === "company" ? "Account" : "Relationship"} Review: ${context.entityName}`);
  const [reason, setReason] = useState("");
  const [severity, setSeverity] = useState("high");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !reason.trim()) {
      toast.error("Please provide a title and reason");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in"); setSubmitting(false); return; }

      const evidenceRefs = [
        { type: `crm_${context.entityType}`, id: context.entityId, name: context.entityName },
        ...(context.healthScore != null ? [{ type: "health_score", value: context.healthScore }] : []),
        ...(context.pipelineValue != null ? [{ type: "pipeline_value", value: context.pipelineValue }] : []),
      ];

      await fromTable("boardroom_items").insert({
        user_id: user.id,
        title,
        description: reason,
        domain: "business",
        severity,
        escalation_reason: `CRM ${context.entityType} escalation: ${reason}`,
        source_signals: [{ source: "crm", entity_type: context.entityType, entity_id: context.entityId }],
        evidence_refs: evidenceRefs,
        advisor_summaries: context.advisorSummary ? { crm_advisor: context.advisorSummary } : {},
        status: "new",
      });

      toast.success("Escalated to Boardroom successfully");
      onOpenChange(false);
    } catch {
      toast.error("Failed to escalate");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Escalate to Boardroom
          </DialogTitle>
          <DialogDescription>
            This will create a formal agenda item in the Business Boardroom for strategic review.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Context preview */}
          <div className="rounded-lg bg-muted/30 border border-border/50 p-3 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="capitalize font-medium text-foreground">{context.entityType}</span>
              <span>·</span>
              <span className="font-semibold text-foreground">{context.entityName}</span>
            </div>
            {context.healthScore != null && (
              <div className="text-xs text-muted-foreground">
                Health: <span className={`font-bold ${context.healthScore >= 60 ? "text-green-400" : context.healthScore >= 40 ? "text-yellow-400" : "text-red-400"}`}>{context.healthScore}</span>
              </div>
            )}
            {context.pipelineValue != null && (
              <div className="text-xs text-muted-foreground">
                Pipeline Value: <span className="font-bold text-foreground">${context.pipelineValue.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Title</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} className="text-sm" />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Severity</label>
            <div className="flex gap-2">
              {SEVERITY_OPTIONS.map(s => (
                <button
                  key={s.key}
                  onClick={() => setSeverity(s.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    severity === s.key ? s.color : "border-border/50 text-muted-foreground hover:border-border"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Reason for Escalation</label>
            <textarea
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Describe why this requires Boardroom attention..."
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>

          {context.advisorSummary && (
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-foreground">Advisor Context</p>
                <p className="text-xs text-muted-foreground mt-0.5">{context.advisorSummary}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="gap-1.5" onClick={handleSubmit} disabled={submitting || !title.trim() || !reason.trim()}>
            <Send className="h-3.5 w-3.5" />
            {submitting ? "Escalating..." : "Escalate to Boardroom"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
