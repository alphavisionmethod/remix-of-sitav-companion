// SITA OS — CRM Meeting/Call Prep Cards
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Phone, Mail, Video, Calendar, FileText, AlertTriangle,
  TrendingUp, DollarSign, Clock, Sparkles, CheckSquare,
  MessageSquare, Heart, Shield
} from "lucide-react";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import type { CRMContact, CRMCompany } from "@/data/repositories/crm-data-service";

interface MeetingPrepProps {
  contact?: CRMContact | null;
  company?: CRMCompany | null;
  communications?: any[];
  opportunities?: any[];
  tasks?: any[];
  notes?: any[];
  prepType?: "call" | "meeting" | "email";
}

const healthColor = (s: number) => s >= 80 ? "text-green-400" : s >= 60 ? "text-yellow-400" : s >= 40 ? "text-orange-400" : "text-red-400";

export function CRMMeetingPrep({ contact, company, communications = [], opportunities = [], tasks = [], notes = [], prepType = "meeting" }: MeetingPrepProps) {
  const daysSinceContact = contact?.last_contacted_at
    ? differenceInDays(new Date(), new Date(contact.last_contacted_at))
    : null;

  const health = contact?.health_score ?? company?.health_score ?? 50;
  const openDeals = opportunities.filter(o => o.status === "open");
  const totalDealValue = openDeals.reduce((s, o) => s + (o.value || 0), 0);
  const overdueTasks = tasks.filter(t => t.status !== "completed" && t.due_date && new Date(t.due_date) < new Date());
  const recentComms = communications.slice(0, 3);
  const pinnedNotes = notes.filter(n => n.is_pinned);

  const talkingPoints = useMemo(() => {
    const points: string[] = [];
    if (health < 40) points.push("Relationship needs attention — address concerns directly and listen actively");
    if (openDeals.length > 0) points.push(`${openDeals.length} active deal${openDeals.length > 1 ? "s" : ""} worth $${(totalDealValue / 1000).toFixed(0)}K — review status and blockers`);
    if (overdueTasks.length > 0) points.push(`${overdueTasks.length} overdue task${overdueTasks.length > 1 ? "s" : ""} — acknowledge and provide timeline`);
    if (daysSinceContact && daysSinceContact > 30) points.push(`Haven't connected in ${daysSinceContact} days — re-establish rapport before business`);
    if (recentComms.length > 0) points.push(`Last interaction: ${recentComms[0].subject || recentComms[0].comm_type} — reference it`);
    if (pinnedNotes.length > 0) points.push(`Review pinned notes before the ${prepType}`);
    if (points.length === 0) points.push("Relationship is healthy — focus on growth and deepening");
    return points;
  }, [health, openDeals, overdueTasks, daysSinceContact, recentComms, pinnedNotes, prepType, totalDealValue]);

  const riskFlags = useMemo(() => {
    const flags: { text: string; severity: "high" | "medium" }[] = [];
    if (health < 30) flags.push({ text: "Critical health — high churn risk", severity: "high" });
    if (overdueTasks.length > 2) flags.push({ text: "Multiple overdue commitments", severity: "high" });
    if (daysSinceContact && daysSinceContact > 60) flags.push({ text: "No contact in 60+ days", severity: "medium" });
    return flags;
  }, [health, overdueTasks, daysSinceContact]);

  const entity = contact ? `${contact.first_name} ${contact.last_name}` : company?.name || "Contact";
  const PrepIcon = prepType === "call" ? Phone : prepType === "email" ? Mail : Video;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <PrepIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="text-foreground capitalize">{prepType} Prep</span>
              <p className="text-[10px] text-muted-foreground font-normal">{entity}</p>
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-[10px] ${healthColor(health)}`}>
              <Heart className="h-2.5 w-2.5 mr-0.5" />{health}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Context Summary */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-lg bg-muted/20 text-center">
            <p className="text-lg font-bold text-foreground">{communications.length}</p>
            <p className="text-[10px] text-muted-foreground">Interactions</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/20 text-center">
            <p className="text-lg font-bold text-foreground">{openDeals.length}</p>
            <p className="text-[10px] text-muted-foreground">Open Deals</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/20 text-center">
            <p className="text-lg font-bold text-foreground">
              {daysSinceContact !== null ? `${daysSinceContact}d` : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground">Since Contact</p>
          </div>
        </div>

        {/* Risk Flags */}
        {riskFlags.length > 0 && (
          <div className="space-y-1.5">
            {riskFlags.map((f, i) => (
              <div key={i} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${f.severity === "high" ? "bg-destructive/10 text-destructive" : "bg-orange-500/10 text-orange-400"}`}>
                <AlertTriangle className="h-3 w-3 shrink-0" />
                {f.text}
              </div>
            ))}
          </div>
        )}

        {/* Talking Points */}
        <div>
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Key Talking Points
          </p>
          <div className="space-y-1.5">
            {talkingPoints.map((p, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="text-primary font-bold mt-px">{i + 1}.</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent History */}
        {recentComms.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Recent History
            </p>
            <div className="space-y-1">
              {recentComms.map(c => (
                <div key={c.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3 shrink-0" />
                  <span className="truncate flex-1">{c.subject || c.comm_type}</span>
                  <span className="shrink-0">{formatDistanceToNow(new Date(c.occurred_at), { addSuffix: true })}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deals Context */}
        {openDeals.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
              <DollarSign className="h-3.5 w-3.5 text-green-400" /> Active Deals
            </p>
            <div className="space-y-1">
              {openDeals.slice(0, 3).map(d => (
                <div key={d.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-muted/20">
                  <span className="text-foreground truncate">{d.title}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-muted-foreground">{d.stage}</span>
                    <span className="font-semibold text-foreground">${d.value?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
