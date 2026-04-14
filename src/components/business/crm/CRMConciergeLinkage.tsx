// SITA OS — CRM Concierge Linkage Component
// Cross-domain integration: CRM ↔ Concierge OS (appointments, obligations, errands)
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar, Clock, MapPin, CheckCircle, AlertTriangle,
  RotateCcw, Bell, User, Sparkles, ExternalLink, Plus,
  ChevronRight, ListTodo, Timer, ArrowRight
} from "lucide-react";
import { format, formatDistanceToNow, isPast, isFuture, differenceInDays } from "date-fns";

interface LinkedAppointment {
  id: string;
  title: string;
  date: string;
  location?: string;
  status: "upcoming" | "completed" | "cancelled" | "rescheduled";
  prep_items: string[];
  category: string;
}

interface LinkedObligation {
  id: string;
  title: string;
  frequency: string;
  next_due: string;
  status: "active" | "overdue" | "completed";
  category: string;
  automatable: boolean;
}

interface LinkedErrand {
  id: string;
  title: string;
  due_date?: string;
  status: "pending" | "in_progress" | "completed";
  priority: string;
  estimated_minutes: number;
}

function generateDemoAppointments(entityName: string): LinkedAppointment[] {
  return [
    { id: "apt-1", title: `Quarterly Review — ${entityName}`, date: "2026-04-22T14:00:00", location: "Virtual — Zoom", status: "upcoming", prep_items: ["Review Q1 metrics", "Prepare renewal proposal", "Check outstanding invoices"], category: "review" },
    { id: "apt-2", title: `Contract Renewal Meeting — ${entityName}`, date: "2026-05-10T10:00:00", location: "Office — Room 3A", status: "upcoming", prep_items: ["Draft new terms", "Competitive analysis"], category: "negotiation" },
    { id: "apt-3", title: `Onboarding Kickoff — ${entityName}`, date: "2026-01-15T09:00:00", location: "Virtual — Teams", status: "completed", prep_items: [], category: "onboarding" },
  ];
}

function generateDemoObligations(entityName: string): LinkedObligation[] {
  return [
    { id: "obl-1", title: `Monthly status report — ${entityName}`, frequency: "monthly", next_due: "2026-04-30", status: "active", category: "reporting", automatable: true },
    { id: "obl-2", title: `Quarterly business review prep`, frequency: "quarterly", next_due: "2026-04-20", status: "active", category: "review", automatable: false },
    { id: "obl-3", title: `License renewal reminder`, frequency: "annually", next_due: "2026-09-15", status: "active", category: "admin", automatable: true },
  ];
}

function generateDemoErrands(entityName: string): LinkedErrand[] {
  return [
    { id: "err-1", title: `Send updated proposal to ${entityName}`, due_date: "2026-04-18", status: "pending", priority: "high", estimated_minutes: 30 },
    { id: "err-2", title: `Follow up on signed NDA`, due_date: "2026-04-20", status: "in_progress", priority: "medium", estimated_minutes: 10 },
  ];
}

const APT_STATUS: Record<string, { icon: React.ReactNode; className: string }> = {
  upcoming: { icon: <Calendar className="h-3 w-3" />, className: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
  completed: { icon: <CheckCircle className="h-3 w-3" />, className: "bg-green-500/15 text-green-400 border-green-500/25" },
  cancelled: { icon: <AlertTriangle className="h-3 w-3" />, className: "bg-red-500/15 text-red-400 border-red-500/25" },
  rescheduled: { icon: <RotateCcw className="h-3 w-3" />, className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25" },
};

interface CRMConciergeLinkageProps {
  entityType: "contact" | "company";
  entityId: string;
  entityName: string;
}

export function CRMConciergeLinkage({ entityType, entityId, entityName }: CRMConciergeLinkageProps) {
  const appointments = useMemo(() => generateDemoAppointments(entityName), [entityName]);
  const obligations = useMemo(() => generateDemoObligations(entityName), [entityName]);
  const errands = useMemo(() => generateDemoErrands(entityName), [entityName]);

  const upcomingApts = appointments.filter(a => a.status === "upcoming");
  const overdueObligations = obligations.filter(o => o.status === "overdue" || (o.next_due && isPast(new Date(o.next_due))));
  const pendingErrands = errands.filter(e => e.status !== "completed");

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
          <p className={`text-lg font-bold ${upcomingApts.length > 0 ? "text-blue-400" : "text-foreground"}`}>{upcomingApts.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Upcoming</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
          <p className={`text-lg font-bold ${overdueObligations.length > 0 ? "text-red-400" : "text-foreground"}`}>{obligations.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Obligations</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-center">
          <p className={`text-lg font-bold ${pendingErrands.length > 0 ? "text-yellow-400" : "text-foreground"}`}>{pendingErrands.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Errands</p>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Appointments
            </CardTitle>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              <Plus className="h-3 w-3" /> Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {appointments.map(apt => {
            const cfg = APT_STATUS[apt.status];
            const aptDate = new Date(apt.date);
            const daysUntil = differenceInDays(aptDate, new Date());
            return (
              <div key={apt.id} className="p-3 rounded-lg bg-muted/10 border border-border/30 hover:border-primary/20 transition-colors cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border flex items-center gap-1 ${cfg.className}`}>
                        {cfg.icon} {apt.status}
                      </span>
                      {apt.status === "upcoming" && daysUntil <= 7 && (
                        <span className="text-[10px] text-orange-400 font-medium">In {daysUntil}d</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground mt-1.5">{apt.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {format(aptDate, "MMM d, h:mm a")}</span>
                      {apt.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {apt.location}</span>}
                    </div>
                  </div>
                </div>
                {/* Prep items for upcoming */}
                {apt.status === "upcoming" && apt.prep_items.length > 0 && (
                  <div className="mt-2 pl-2 border-l-2 border-primary/20 space-y-1">
                    <p className="text-[10px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5" /> Prep Checklist
                    </p>
                    {apt.prep_items.map((item, i) => (
                      <p key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded border border-border/50 shrink-0 flex items-center justify-center text-[8px]">{i + 1}</span>
                        {item}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Obligations */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-primary" /> Recurring Obligations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {obligations.map(obl => {
            const isOverdue = obl.next_due && isPast(new Date(obl.next_due));
            return (
              <div key={obl.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isOverdue ? "bg-red-500/5 border-red-500/20" : "bg-muted/10 border-border/30"}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{obl.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="capitalize">{obl.frequency}</span>
                    <span>·</span>
                    <span className={isOverdue ? "text-red-400 font-semibold" : ""}>
                      {isOverdue ? "Overdue" : `Due ${format(new Date(obl.next_due), "MMM d")}`}
                    </span>
                    {obl.automatable && (
                      <>
                        <span>·</span>
                        <span className="text-primary flex items-center gap-0.5"><Sparkles className="h-2.5 w-2.5" /> Automatable</span>
                      </>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Errands */}
      {pendingErrands.length > 0 && (
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-primary" /> Related Errands
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingErrands.map(err => (
              <div key={err.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/10 border border-border/30">
                <div className={`w-2 h-2 rounded-full shrink-0 ${err.priority === "high" ? "bg-red-400" : err.priority === "medium" ? "bg-yellow-400" : "bg-muted-foreground"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{err.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    {err.due_date && <span>Due {format(new Date(err.due_date), "MMM d")}</span>}
                    <span className="flex items-center gap-0.5"><Timer className="h-2.5 w-2.5" /> ~{err.estimated_minutes}min</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Cross-link action */}
      <Button variant="outline" className="w-full text-xs gap-2 h-9">
        <ExternalLink className="h-3.5 w-3.5" /> Open in Concierge
      </Button>
    </div>
  );
}
