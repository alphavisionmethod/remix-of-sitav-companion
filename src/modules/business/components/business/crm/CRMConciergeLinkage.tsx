// SITA OS — CRM Concierge Linkage Component (Phase 2: live)
// Cross-domain integration: CRM ↔ Concierge OS via real tables.
// Reads `appointments`, `concierge_recurring_obligations`, `errands`
// filtered by `crm_contact_id` / `crm_company_id`. Uses canonical
// `setLinkedContext` for handoff to concierge surfaces.
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Calendar, Clock, MapPin, CheckCircle, AlertTriangle,
  RotateCcw, Sparkles, ExternalLink, Plus,
  ChevronRight, ListTodo, Timer
} from "lucide-react";
import { format, isPast, differenceInDays } from "date-fns";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { setLinkedContext } from "@/platform/sita/components/sita/CrossAppAction";
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";

interface LinkedAppointment {
  id: string;
  title: string;
  appointment_date: string;
  location: string | null;
  status: string;
  prep_items: string[] | null;
  category: string | null;
}

interface LinkedObligation {
  id: string;
  title: string;
  frequency: string | null;
  next_due: string | null;
  status: string;
  category: string | null;
  automatable: boolean | null;
}

interface LinkedErrand {
  id: string;
  title: string;
  due_date: string | null;
  status: string;
  priority: string | null;
  estimated_minutes: number | null;
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
  const { user } = useAuth();
  const navigate = useNavigate();

  const linkColumn = entityType === "contact" ? "crm_contact_id" : "crm_company_id";

  const apptQuery = useQuery<LinkedAppointment[]>({
    queryKey: ["crm-concierge:appointments", entityType, entityId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await fromTable("appointments")
        .select("id, title, appointment_date, location, status, prep_items, category")
        .eq("user_id", user!.id)
        .eq(linkColumn, entityId)
        .order("appointment_date", { ascending: false })
        .limit(20);
      if (error) throw new Error(error.message);
      return (data ?? []) as LinkedAppointment[];
    },
  });

  const obligationsQuery = useQuery<LinkedObligation[]>({
    queryKey: ["crm-concierge:obligations", entityType, entityId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await fromTable("concierge_recurring_obligations")
        .select("id, title, frequency, next_due, status, category, automatable")
        .eq("user_id", user!.id)
        .eq(linkColumn, entityId)
        .order("next_due", { ascending: true, nullsFirst: false })
        .limit(20);
      if (error) throw new Error(error.message);
      return (data ?? []) as LinkedObligation[];
    },
  });

  const errandsQuery = useQuery<LinkedErrand[]>({
    queryKey: ["crm-concierge:errands", entityType, entityId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await fromTable("errands")
        .select("id, title, due_date, status, priority, estimated_minutes")
        .eq("user_id", user!.id)
        .eq(linkColumn, entityId)
        .order("due_date", { ascending: true, nullsFirst: false })
        .limit(20);
      if (error) throw new Error(error.message);
      return (data ?? []) as LinkedErrand[];
    },
  });

  const appointments = apptQuery.data ?? [];
  const obligations = obligationsQuery.data ?? [];
  const errands = errandsQuery.data ?? [];

  const isLoading = apptQuery.isLoading || obligationsQuery.isLoading || errandsQuery.isLoading;
  const hasAny = appointments.length > 0 || obligations.length > 0 || errands.length > 0;

  const handoff = (target: "/concierge/calendar" | "/concierge/recurring" | "/concierge/errands") => {
    setLinkedContext({
      entityType: entityType,
      entityId,
      entityLabel: entityName,
    });
    navigate(target);
  };

  const upcomingApts = appointments.filter(a => a.status === "upcoming" || a.status === "scheduled" || a.status === "confirmed");
  const overdueObligations = obligations.filter(o => o.status === "overdue" || (o.next_due && isPast(new Date(o.next_due))));
  const pendingErrands = errands.filter(e => e.status !== "completed");

  if (!isLoading && !hasAny) {
    return (
      <PremiumEmptyState
        variant="no-data"
        icon={Calendar}
        title="No concierge links yet"
        description={`No appointments, obligations, or errands are linked to ${entityName}.`}
        actions={[
          { label: "Schedule appointment", onClick: () => handoff("/concierge/calendar") },
          { label: "Add recurring task", onClick: () => handoff("/concierge/recurring") },
        ]}
        domain="business"
      />
    );
  }

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
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => handoff("/concierge/calendar")}>
              <Plus className="h-3 w-3" /> Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {appointments.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-3">No linked appointments.</p>
          )}
          {appointments.map(apt => {
            const cfg = APT_STATUS[apt.status] ?? APT_STATUS.upcoming;
            const aptDate = new Date(apt.appointment_date);
            const daysUntil = differenceInDays(aptDate, new Date());
            return (
              <div
                key={apt.id}
                onClick={() => handoff("/concierge/calendar")}
                className="p-3 rounded-lg bg-muted/10 border border-border/30 hover:border-primary/20 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border flex items-center gap-1 ${cfg.className}`}>
                        {cfg.icon} {apt.status}
                      </span>
                      {(apt.status === "upcoming" || apt.status === "scheduled") && daysUntil >= 0 && daysUntil <= 7 && (
                        <span className="text-[10px] text-urgency-high font-medium">In {daysUntil}d</span>
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
                {(apt.status === "upcoming" || apt.status === "scheduled") && apt.prep_items && apt.prep_items.length > 0 && (
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
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-primary" /> Recurring Obligations
            </CardTitle>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => handoff("/concierge/recurring")}>
              <Plus className="h-3 w-3" /> Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {obligations.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-3">No recurring obligations linked.</p>
          )}
          {obligations.map(obl => {
            const isOverdue = obl.next_due && isPast(new Date(obl.next_due));
            return (
              <div
                key={obl.id}
                onClick={() => handoff("/concierge/recurring")}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${isOverdue ? "bg-urgency-high/5 border-urgency-high/20" : "bg-muted/10 border-border/30"}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{obl.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="capitalize">{obl.frequency}</span>
                    <span>·</span>
                    <span className={isOverdue ? "text-urgency-high font-semibold" : ""}>
                      {isOverdue ? "Overdue" : obl.next_due ? `Due ${format(new Date(obl.next_due), "MMM d")}` : "No due date"}
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-primary" /> Related Errands
              </CardTitle>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => handoff("/concierge/errands")}>
                <ExternalLink className="h-3 w-3" /> Open
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingErrands.map(err => (
              <div
                key={err.id}
                onClick={() => handoff("/concierge/errands")}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/10 border border-border/30 cursor-pointer"
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${err.priority === "high" ? "bg-urgency-high" : err.priority === "medium" ? "bg-trust-review" : "bg-muted-foreground"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{err.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    {err.due_date && <span>Due {format(new Date(err.due_date), "MMM d")}</span>}
                    {err.estimated_minutes != null && (
                      <span className="flex items-center gap-0.5"><Timer className="h-2.5 w-2.5" /> ~{err.estimated_minutes}min</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Cross-link action */}
      <Button variant="outline" className="w-full text-xs gap-2 h-9" onClick={() => handoff("/concierge/calendar")}>
        <ExternalLink className="h-3.5 w-3.5" /> Open in Concierge
      </Button>
    </div>
  );
}
