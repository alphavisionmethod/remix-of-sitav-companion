// SITA OS — CRM Boardroom Escalation Dialog (Enhanced)
// Full evidence packaging, auto-assessment, decision receipt display
import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  AlertTriangle, Shield, Sparkles, Send, CheckCircle, Clock,
  DollarSign, Heart, TrendingDown, Users, FileText, BarChart3,
  ChevronRight, ArrowUpRight, Eye, Zap, Target, Scale
} from "lucide-react";
import { fromTable } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";
import { useTrustEmit } from "@/platform/trust/hooks/use-trust-emit";

interface EscalationContext {
  entityType: "contact" | "company" | "deal";
  entityId: string;
  entityName: string;
  healthScore?: number;
  pipelineValue?: number;
  advisorSummary?: string;
  // Extended evidence
  overdueInvoices?: number;
  overdueAmount?: number;
  stalledDays?: number;
  communicationGap?: number; // days since last contact
  openDeals?: number;
  lifetimeRevenue?: number;
  contactCount?: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: EscalationContext;
}

const SEVERITY_OPTIONS = [
  { key: "critical", label: "Critical", color: "bg-red-500/20 text-red-400 border-red-500/30", description: "Immediate action needed — revenue or relationship at serious risk" },
  { key: "high", label: "High", color: "bg-orange-500/20 text-orange-400 border-orange-500/30", description: "Requires attention within 24-48 hours" },
  { key: "medium", label: "Medium", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", description: "Should be reviewed in next board session" },
];

const DOMAIN_TAGS = [
  { key: "revenue_risk", label: "Revenue Risk", icon: <DollarSign className="h-3 w-3" /> },
  { key: "relationship_decay", label: "Relationship Decay", icon: <Heart className="h-3 w-3" /> },
  { key: "strategic_opportunity", label: "Strategic Opportunity", icon: <Target className="h-3 w-3" /> },
  { key: "collection_concern", label: "Collection Concern", icon: <AlertTriangle className="h-3 w-3" /> },
  { key: "churn_signal", label: "Churn Signal", icon: <TrendingDown className="h-3 w-3" /> },
  { key: "competitive_threat", label: "Competitive Threat", icon: <Shield className="h-3 w-3" /> },
];

function computeBoardroomScore(ctx: EscalationContext): { score: number; factors: string[] } {
  let score = 0.3;
  const factors: string[] = [];

  if (ctx.healthScore != null && ctx.healthScore < 40) { score += 0.25; factors.push("Health score critically low"); }
  else if (ctx.healthScore != null && ctx.healthScore < 60) { score += 0.1; factors.push("Health score declining"); }

  if (ctx.pipelineValue && ctx.pipelineValue > 50000) { score += 0.15; factors.push("High-value pipeline at stake"); }
  if (ctx.overdueInvoices && ctx.overdueInvoices > 0) { score += 0.1; factors.push(`${ctx.overdueInvoices} overdue invoice(s)`); }
  if (ctx.stalledDays && ctx.stalledDays > 14) { score += 0.1; factors.push(`Stalled for ${ctx.stalledDays} days`); }
  if (ctx.communicationGap && ctx.communicationGap > 21) { score += 0.1; factors.push(`No contact for ${ctx.communicationGap} days`); }
  if (ctx.lifetimeRevenue && ctx.lifetimeRevenue > 100000) { score += 0.05; factors.push("High-value relationship"); }

  return { score: Math.min(score, 1), factors };
}

export function CRMEscalateToBoardroom({ open, onOpenChange, context }: Props) {
  const [title, setTitle] = useState(`${context.entityType === "deal" ? "Deal" : context.entityType === "company" ? "Account" : "Relationship"} Review: ${context.entityName}`);
  const [reason, setReason] = useState("");
  const [severity, setSeverity] = useState("high");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [requestedActions, setRequestedActions] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { receipt: emitTrustReceipt } = useTrustEmit();

  const boardroomAssessment = useMemo(() => computeBoardroomScore(context), [context]);

  const toggleTag = (key: string) => {
    setSelectedTags(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const evidenceItems = useMemo(() => {
    const items: { label: string; value: string; severity: "info" | "warning" | "critical" }[] = [];
    if (context.healthScore != null) {
      items.push({ label: "Health Score", value: `${context.healthScore}/100`, severity: context.healthScore < 40 ? "critical" : context.healthScore < 60 ? "warning" : "info" });
    }
    if (context.pipelineValue != null) {
      items.push({ label: "Pipeline Value", value: `$${context.pipelineValue.toLocaleString()}`, severity: context.pipelineValue > 50000 ? "warning" : "info" });
    }
    if (context.overdueInvoices != null && context.overdueInvoices > 0) {
      items.push({ label: "Overdue Invoices", value: `${context.overdueInvoices} ($${(context.overdueAmount || 0).toLocaleString()})`, severity: "critical" });
    }
    if (context.communicationGap != null) {
      items.push({ label: "Communication Gap", value: `${context.communicationGap} days`, severity: context.communicationGap > 21 ? "critical" : context.communicationGap > 14 ? "warning" : "info" });
    }
    if (context.lifetimeRevenue != null) {
      items.push({ label: "Lifetime Revenue", value: `$${context.lifetimeRevenue.toLocaleString()}`, severity: "info" });
    }
    if (context.openDeals != null) {
      items.push({ label: "Open Deals", value: `${context.openDeals}`, severity: "info" });
    }
    return items;
  }, [context]);

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
        ...(context.overdueInvoices ? [{ type: "overdue_invoices", count: context.overdueInvoices, amount: context.overdueAmount }] : []),
        ...(context.communicationGap ? [{ type: "communication_gap", days: context.communicationGap }] : []),
        ...(context.lifetimeRevenue ? [{ type: "lifetime_revenue", value: context.lifetimeRevenue }] : []),
      ];

      const sourceSignals = [
        { source: "crm", entity_type: context.entityType, entity_id: context.entityId },
        ...selectedTags.map(t => ({ source: "crm_tag", tag: t })),
      ];

      await fromTable("boardroom_items").insert({
        user_id: user.id,
        title,
        description: reason + (requestedActions ? `\n\nRequested Actions: ${requestedActions}` : ""),
        domain: "business",
        severity,
        escalation_reason: `CRM ${context.entityType} escalation: ${reason}`,
        source_signals: sourceSignals,
        evidence_refs: evidenceRefs,
        advisor_summaries: {
          crm_advisor: context.advisorSummary || "",
          boardroom_relevance: boardroomAssessment.score,
          assessment_factors: boardroomAssessment.factors,
          domain_tags: selectedTags,
        },
        confidence_state: { score: boardroomAssessment.score, source: "crm_escalation" },
        status: "new",
      });

      // Trust Layer — emit a signed receipt for the escalation so the
      // Trust Center surfaces this Business OS action alongside all others.
      await emitTrustReceipt({
        actionKey: "business.crm.escalate-to-boardroom",
        pillar: "business",
        riskTier: severity === "critical" ? "critical" : severity === "high" ? "high" : "medium",
        reversible: true,
        payload: {
          entityType: context.entityType,
          entityId: context.entityId,
          entityName: context.entityName,
          severity,
          relevanceScore: boardroomAssessment.score,
          tags: selectedTags,
        },
      });

      setSubmitted(true);
      toast.success("Escalated to Boardroom successfully");
    } catch {
      toast.error("Failed to escalate");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={(v) => { if (!v) { setSubmitted(false); } onOpenChange(v); }}>
        <DialogContent className="sm:max-w-lg">
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Escalation Submitted</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              A Boardroom agenda item has been created for <span className="font-semibold text-foreground">{context.entityName}</span>.
              It will be reviewed in the next strategic session.
            </p>

            {/* Decision Receipt Preview */}
            <Card className="w-full mt-6 border-primary/20 bg-primary/5 text-left">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <p className="text-xs font-semibold text-foreground">Escalation Receipt</p>
                </div>
                <Separator className="bg-border/30" />
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Entity:</span> <span className="text-foreground font-medium">{context.entityName}</span></div>
                  <div><span className="text-muted-foreground">Severity:</span> <span className="text-foreground font-medium capitalize">{severity}</span></div>
                  <div><span className="text-muted-foreground">Relevance:</span> <span className="text-foreground font-medium">{(boardroomAssessment.score * 100).toFixed(0)}%</span></div>
                  <div><span className="text-muted-foreground">Evidence:</span> <span className="text-foreground font-medium">{evidenceItems.length} items</span></div>
                </div>
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedTags.map(t => {
                      const tag = DOMAIN_TAGS.find(d => d.key === t);
                      return tag ? (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{tag.label}</span>
                      ) : null;
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-2 mt-6">
              <Button variant="outline" size="sm" onClick={() => { setSubmitted(false); onOpenChange(false); }}>Close</Button>
              <Button size="sm" className="gap-1.5">
                <ArrowUpRight className="h-3.5 w-3.5" /> View in Boardroom
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Escalate to Boardroom
          </DialogTitle>
          <DialogDescription>
            Package evidence and create a formal agenda item for strategic review.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Auto-assessment */}
          <Card className={`border ${boardroomAssessment.score > 0.65 ? "border-red-500/30 bg-red-500/5" : boardroomAssessment.score > 0.4 ? "border-yellow-500/30 bg-yellow-500/5" : "border-border/50 bg-muted/20"}`}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Boardroom Relevance Assessment</span>
                </div>
                <span className={`text-sm font-bold ${boardroomAssessment.score > 0.65 ? "text-red-400" : boardroomAssessment.score > 0.4 ? "text-yellow-400" : "text-muted-foreground"}`}>
                  {(boardroomAssessment.score * 100).toFixed(0)}%
                </span>
              </div>
              {boardroomAssessment.factors.length > 0 && (
                <div className="mt-2 space-y-1">
                  {boardroomAssessment.factors.map((f, i) => (
                    <p key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />{f}
                    </p>
                  ))}
                </div>
              )}
              {boardroomAssessment.score > 0.65 && (
                <p className="text-[10px] text-red-400 mt-2 flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Auto-escalation threshold exceeded — recommend immediate review
                </p>
              )}
            </CardContent>
          </Card>

          {/* Evidence Package */}
          {evidenceItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-primary" /> Evidence Package ({evidenceItems.length} items)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {evidenceItems.map((item, i) => (
                  <div key={i} className={`p-2.5 rounded-lg border text-center ${
                    item.severity === "critical" ? "bg-red-500/5 border-red-500/20" :
                    item.severity === "warning" ? "bg-yellow-500/5 border-yellow-500/20" :
                    "bg-muted/20 border-border/30"
                  }`}>
                    <p className={`text-sm font-bold ${
                      item.severity === "critical" ? "text-red-400" :
                      item.severity === "warning" ? "text-yellow-400" :
                      "text-foreground"
                    }`}>{item.value}</p>
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Domain Tags */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">Domain Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {DOMAIN_TAGS.map(tag => (
                <button
                  key={tag.key}
                  onClick={() => toggleTag(tag.key)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all ${
                    selectedTags.includes(tag.key)
                      ? "bg-primary/15 text-primary border-primary/30"
                      : "bg-muted/30 text-muted-foreground border-border/50 hover:border-border"
                  }`}
                >
                  {tag.icon} {tag.label}
                </button>
              ))}
            </div>
          </div>

          <Separator className="bg-border/30" />

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
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-all text-center ${
                    severity === s.key ? s.color : "border-border/50 text-muted-foreground hover:border-border"
                  }`}
                >
                  <span className="block">{s.label}</span>
                  {severity === s.key && <span className="block text-[9px] mt-0.5 opacity-70">{s.description}</span>}
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

          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Requested Actions (optional)</label>
            <textarea
              className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="What specific decisions or actions do you want the Boardroom to take?"
              value={requestedActions}
              onChange={e => setRequestedActions(e.target.value)}
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
