// SITA OS — CRM Lifecycle Stage Engine
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  UserPlus, Phone, MessageSquare, Target, FileText, Handshake,
  Trophy, Moon, AlertTriangle, HeadphonesIcon, DollarSign,
  XCircle, RefreshCw, ArrowRight, ChevronRight, Sparkles, Users, Zap
} from "lucide-react";
import { motion } from "framer-motion";
import type { CRMContact } from "@/data/repositories/crm-data-service";

export const LIFECYCLE_STAGES = [
  { key: "new", label: "New", icon: UserPlus, color: "hsl(210 80% 60%)", description: "Just entered the system", nextActions: ["Verify contact info", "Assign owner", "Schedule first touch"] },
  { key: "contacted", label: "Contacted", icon: Phone, color: "hsl(200 70% 55%)", description: "Initial outreach made", nextActions: ["Follow up within 48h", "Qualify interest", "Log communication"] },
  { key: "engaged", label: "Engaged", icon: MessageSquare, color: "hsl(180 60% 50%)", description: "Active two-way communication", nextActions: ["Deepen understanding of needs", "Share relevant content", "Schedule discovery call"] },
  { key: "opportunity", label: "Active Opportunity", icon: Target, color: "hsl(265 55% 58%)", description: "Deal in pipeline", nextActions: ["Advance deal stage", "Address objections", "Prepare proposal"] },
  { key: "proposal_sent", label: "Proposal Sent", icon: FileText, color: "hsl(280 50% 55%)", description: "Waiting on proposal response", nextActions: ["Follow up on proposal", "Address questions", "Negotiate terms"] },
  { key: "negotiation", label: "Negotiation", icon: Handshake, color: "hsl(38 85% 58%)", description: "Active negotiation", nextActions: ["Finalize terms", "Get stakeholder buy-in", "Prepare contract"] },
  { key: "won", label: "Won", icon: Trophy, color: "hsl(152 55% 48%)", description: "Deal closed successfully", nextActions: ["Onboard customer", "Set expectations", "Schedule kickoff"] },
  { key: "customer", label: "Active Customer", icon: Users, color: "hsl(152 55% 48%)", description: "Active, paying customer", nextActions: ["Monitor satisfaction", "Identify upsell", "Regular check-ins"] },
  { key: "dormant", label: "Dormant", icon: Moon, color: "hsl(220 15% 55%)", description: "Inactive for extended period", nextActions: ["Send re-engagement campaign", "Personal check-in", "Offer value-add"] },
  { key: "at_risk", label: "At Risk", icon: AlertTriangle, color: "hsl(25 90% 55%)", description: "Engagement declining", nextActions: ["Immediate outreach", "Address concerns", "Escalate if needed"] },
  { key: "support_sensitive", label: "Support Sensitive", icon: HeadphonesIcon, color: "hsl(340 65% 55%)", description: "Active support issues", nextActions: ["Resolve tickets first", "Personal follow-up", "Offer concession if needed"] },
  { key: "collections_sensitive", label: "Collections Sensitive", icon: DollarSign, color: "hsl(0 65% 55%)", description: "Payment issues", nextActions: ["Handle with care", "Discuss payment plan", "Preserve relationship"] },
  { key: "lost", label: "Lost", icon: XCircle, color: "hsl(0 50% 50%)", description: "Deal lost or churned", nextActions: ["Log loss reason", "Maintain relationship", "Set reactivation reminder"] },
  { key: "reactivation", label: "Reactivation Candidate", icon: RefreshCw, color: "hsl(265 40% 55%)", description: "Potential for re-engagement", nextActions: ["Craft personalized outreach", "Offer new value", "Reference history"] },
] as const;

const STAGE_MAP = Object.fromEntries(LIFECYCLE_STAGES.map(s => [s.key, s]));

interface CRMLifecycleEngineProps {
  contacts: CRMContact[];
  onNavigate?: (stage: string) => void;
  compact?: boolean;
}

export function CRMLifecycleEngine({ contacts, onNavigate, compact = false }: CRMLifecycleEngineProps) {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const distribution = useMemo(() => {
    const counts: Record<string, number> = {};
    LIFECYCLE_STAGES.forEach(s => { counts[s.key] = 0; });
    contacts.forEach(c => {
      const stage = c.lifecycle_stage || "lead";
      // Map existing stages to new keys
      const mapped = stage === "lead" ? "new" : stage === "qualified" ? "engaged" : counts[stage] !== undefined ? stage : "new";
      counts[mapped] = (counts[mapped] || 0) + 1;
    });
    return counts;
  }, [contacts]);

  const total = contacts.length || 1;
  const activeStages = LIFECYCLE_STAGES.filter(s => distribution[s.key] > 0);

  if (compact) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> Lifecycle Funnel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {LIFECYCLE_STAGES.slice(0, 8).map(stage => {
            const count = distribution[stage.key] || 0;
            const pct = (count / total) * 100;
            return (
              <div key={stage.key} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-24 truncate">{stage.label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-foreground w-6 text-right">{count}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Visual Funnel */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> Customer Lifecycle
            <span className="text-xs text-muted-foreground font-normal ml-auto">{contacts.length} contacts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Funnel visualization */}
          <div className="space-y-1">
            {LIFECYCLE_STAGES.map((stage, i) => {
              const count = distribution[stage.key] || 0;
              const pct = (count / total) * 100;
              const isSelected = selectedStage === stage.key;
              const StageIcon = stage.icon;
              return (
                <motion.div
                  key={stage.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                    isSelected ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-muted/30"
                  } ${count === 0 ? "opacity-40" : ""}`}
                  onClick={() => setSelectedStage(isSelected ? null : stage.key)}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${stage.color}20` }}>
                    <StageIcon className="h-3.5 w-3.5" style={{ color: stage.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">{stage.label}</span>
                      {count > 0 && <span className="text-[10px] font-bold" style={{ color: stage.color }}>{count}</span>}
                    </div>
                    <div className="h-1 rounded-full bg-muted/30 mt-1 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: stage.color }} />
                    </div>
                  </div>
                  {count > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Stage Detail */}
      {selectedStage && STAGE_MAP[selectedStage] && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${STAGE_MAP[selectedStage].color}20` }}>
                {React.createElement(STAGE_MAP[selectedStage].icon, { className: "h-5 w-5", style: { color: STAGE_MAP[selectedStage].color } })}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{STAGE_MAP[selectedStage].label}</p>
                <p className="text-xs text-muted-foreground">{STAGE_MAP[selectedStage].description}</p>
              </div>
              <Badge className="ml-auto text-xs" style={{ backgroundColor: `${STAGE_MAP[selectedStage].color}20`, color: STAGE_MAP[selectedStage].color }}>
                {distribution[selectedStage]} contacts
              </Badge>
            </div>

            <div>
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Recommended Next Actions
              </p>
              <div className="space-y-1.5">
                {STAGE_MAP[selectedStage].nextActions.map((action, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>

            {onNavigate && (
              <Button size="sm" variant="outline" className="w-full text-xs gap-1.5" onClick={() => onNavigate(selectedStage)}>
                View {STAGE_MAP[selectedStage].label} Contacts <ChevronRight className="h-3 w-3" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
