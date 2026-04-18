// SITA OS — CRM Next Best Action Engine
import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Phone, Mail, FileText, Calendar, DollarSign, AlertTriangle,
  TrendingUp, UserPlus, Send, Sparkles, ArrowRight, Clock,
  Shield, RefreshCw, Heart, MessageSquare
} from "lucide-react";
import { differenceInDays, isPast } from "date-fns";
import type { CRMContact } from "@/data/repositories/crm-data-service";

interface NextBestActionProps {
  contact?: CRMContact | null;
  communications?: any[];
  opportunities?: any[];
  tasks?: any[];
  compact?: boolean;
  onAction?: (action: string, contactId?: string) => void;
}

type ActionSuggestion = {
  id: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  title: string;
  description: string;
  urgency: "critical" | "high" | "medium" | "low";
  actionLabel: string;
  actionType: string;
};

const URGENCY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

export function CRMNextBestAction({ contact, communications = [], opportunities = [], tasks = [], compact = false, onAction }: NextBestActionProps) {
  const suggestions = useMemo(() => {
    if (!contact) return [];
    const actions: ActionSuggestion[] = [];
    const health = contact.health_score ?? 50;
    const daysSince = contact.last_contacted_at ? differenceInDays(new Date(), new Date(contact.last_contacted_at)) : 999;
    const hasOverdueFollowUp = contact.next_follow_up_at ? isPast(new Date(contact.next_follow_up_at)) : false;
    const overdueTasks = tasks.filter(t => t.status !== "completed" && t.due_date && isPast(new Date(t.due_date)));
    const openDeals = opportunities.filter(o => o.status === "open");
    const stalledDeals = openDeals.filter(o => {
      const updated = new Date(o.updated_at);
      return differenceInDays(new Date(), updated) > 7;
    });

    // Critical: at-risk relationship
    if (health < 30) {
      actions.push({
        id: "reengagement", icon: Heart, color: "text-destructive", bg: "bg-destructive/10",
        title: "Re-engage immediately",
        description: `${contact.first_name}'s relationship health is critical (${health}). Personal outreach needed.`,
        urgency: "critical", actionLabel: "Call now", actionType: "call",
      });
    }

    // Overdue follow-up
    if (hasOverdueFollowUp) {
      actions.push({
        id: "follow-up", icon: Clock, color: "text-orange-400", bg: "bg-orange-500/10",
        title: "Overdue follow-up",
        description: `Follow-up was due — reach out before the gap grows.`,
        urgency: "high", actionLabel: "Follow up", actionType: "follow-up",
      });
    }

    // Overdue tasks
    if (overdueTasks.length > 0) {
      actions.push({
        id: "tasks", icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10",
        title: `Complete ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? "s" : ""}`,
        description: "Unresolved commitments erode trust. Address these promptly.",
        urgency: "high", actionLabel: "View tasks", actionType: "tasks",
      });
    }

    // Stalled deals
    if (stalledDeals.length > 0) {
      actions.push({
        id: "stalled-deal", icon: TrendingUp, color: "text-yellow-400", bg: "bg-yellow-500/10",
        title: `Advance stalled deal${stalledDeals.length > 1 ? "s" : ""}`,
        description: `${stalledDeals.length} deal${stalledDeals.length > 1 ? "s haven't" : " hasn't"} moved in 7+ days.`,
        urgency: "medium", actionLabel: "Review deals", actionType: "pipeline",
      });
    }

    // No contact in a while
    if (daysSince > 14 && daysSince < 999 && health >= 30) {
      actions.push({
        id: "reconnect", icon: Phone, color: "text-blue-400", bg: "bg-blue-500/10",
        title: "Reconnect",
        description: `${daysSince} days since last contact — a quick check-in maintains warmth.`,
        urgency: daysSince > 30 ? "high" : "medium", actionLabel: "Send message", actionType: "email",
      });
    }

    // Active deals to advance
    if (openDeals.length > 0 && stalledDeals.length === 0) {
      actions.push({
        id: "advance", icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10",
        title: "Advance active deals",
        description: `${openDeals.length} deal${openDeals.length > 1 ? "s" : ""} in motion — keep momentum.`,
        urgency: "medium", actionLabel: "View pipeline", actionType: "pipeline",
      });
    }

    // Healthy — strategic touchpoint
    if (health >= 80 && actions.length === 0) {
      actions.push({
        id: "deepen", icon: Sparkles, color: "text-primary", bg: "bg-primary/10",
        title: "Deepen relationship",
        description: "Relationship is strong. Consider a strategic touchpoint or value-add.`,",
        urgency: "low", actionLabel: "Plan touchpoint", actionType: "note",
      });
    }

    // Reactivation candidate
    if (contact.lifecycle_stage === "churned" || (daysSince > 90 && health < 40)) {
      actions.push({
        id: "reactivate", icon: RefreshCw, color: "text-purple-400", bg: "bg-purple-500/10",
        title: "Reactivation opportunity",
        description: `${contact.first_name} may be ready for re-engagement with the right offer.`,
        urgency: "medium", actionLabel: "Start reactivation", actionType: "reactivate",
      });
    }

    return actions.sort((a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency]);
  }, [contact, communications, opportunities, tasks]);

  if (suggestions.length === 0) return null;

  if (compact) {
    const top = suggestions[0];
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg ${top.bg}`}>
        <top.icon className={`h-4 w-4 ${top.color} shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground">{top.title}</p>
          <p className="text-[10px] text-muted-foreground truncate">{top.description}</p>
        </div>
        <Button size="sm" variant="ghost" className="h-7 text-xs shrink-0" onClick={() => onAction?.(top.actionType, contact?.id)}>
          {top.actionLabel} <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Recommended Actions</p>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">AI</span>
        </div>
        {suggestions.slice(0, 4).map(s => (
          <div key={s.id} className={`flex items-start gap-3 p-3 rounded-lg ${s.bg} transition-all hover:ring-1 hover:ring-primary/20`}>
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-foreground">{s.title}</p>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                  s.urgency === "critical" ? "bg-destructive/20 text-destructive" :
                  s.urgency === "high" ? "bg-orange-500/20 text-orange-400" :
                  s.urgency === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-muted text-muted-foreground"
                }`}>{s.urgency}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.description}</p>
            </div>
            <Button size="sm" variant="ghost" className="h-7 text-[10px] shrink-0 mt-0.5" onClick={() => onAction?.(s.actionType, contact?.id)}>
              {s.actionLabel}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
