// ═══════════════════════════════════════════════════════════════
// SITA OS — Appointment Lineage Panel (Phase 6)
// Drop-in panel for CRM contact / company / opportunity detail
// surfaces. Shows the upcoming + recent appointments linked to
// that entity (via crm_contact_id / crm_company_id / opportunity_id),
// plus a "Schedule appointment" CTA that hands off to the
// AppointmentsScheduling page with the link pre-applied.
// ═══════════════════════════════════════════════════════════════

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarDays, Clock, Plus, AlertTriangle, CheckCircle2,
  XCircle, RefreshCw, ArrowRight,
} from "lucide-react";
import { useScheduledAppointments } from "@/hooks/use-scheduled-appointments";
import { setLinkedContext } from "@/platform/sita/components/sita/CrossAppAction";
import type { ScheduledAppointmentVM } from "@/modules/business/domain/scheduling/types";

export interface AppointmentLineagePanelProps {
  /** What is being viewed. Exactly one id should be supplied. */
  scope: "contact" | "company" | "opportunity";
  entityId: string;
  /** Display name for the linked entity (used in the empty CTA). */
  entityLabel: string;
  /** Optional cap on how many rows to show. Defaults to 5. */
  limit?: number;
}

const STATUS_CHIP: Record<
  ScheduledAppointmentVM["status"],
  { label: string; cls: string; icon: React.ReactNode }
> = {
  confirmed:    { label: "Confirmed",   cls: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30", icon: <CheckCircle2 className="h-3 w-3" /> },
  pending:      { label: "Pending",     cls: "bg-amber-500/15 text-amber-600 border-amber-500/30",       icon: <Clock className="h-3 w-3" /> },
  unconfirmed:  { label: "Unconfirmed", cls: "bg-orange-500/15 text-orange-600 border-orange-500/30",     icon: <AlertTriangle className="h-3 w-3" /> },
  cancelled:    { label: "Cancelled",   cls: "bg-muted text-muted-foreground border-border",              icon: <XCircle className="h-3 w-3" /> },
  "no-show":    { label: "No-show",     cls: "bg-destructive/15 text-destructive border-destructive/30", icon: <XCircle className="h-3 w-3" /> },
};

export function AppointmentLineagePanel({
  scope,
  entityId,
  entityLabel,
  limit = 5,
}: AppointmentLineagePanelProps) {
  const navigate = useNavigate();

  const fetchOptions =
    scope === "contact"     ? { crmContactId: entityId } :
    scope === "company"     ? { crmCompanyId: entityId } :
    /* opportunity */         { opportunityId: entityId };

  const { appointments, isLoading, isUnauthenticated } =
    useScheduledAppointments(fetchOptions);

  const sorted = useMemo(() => {
    const now = Date.now();
    return [...appointments].sort((a, b) => {
      // Upcoming first, then by closest absolute distance to now.
      const aT = new Date(a.startsAt).getTime();
      const bT = new Date(b.startsAt).getTime();
      const aFut = aT >= now;
      const bFut = bT >= now;
      if (aFut !== bFut) return aFut ? -1 : 1;
      return Math.abs(aT - now) - Math.abs(bT - now);
    }).slice(0, limit);
  }, [appointments, limit]);

  const upcomingCount = appointments.filter(a => new Date(a.startsAt).getTime() >= Date.now()
    && a.status !== "cancelled" && a.status !== "no-show").length;
  const recentNoShows = appointments.filter(a => a.status === "no-show").length;

  const handleSchedule = () => {
    setLinkedContext({
      entityType: scope,
      entityId,
      entityLabel,
    });
    navigate("/business/appointments");
  };

  const handleOpenAppointment = (apt: ScheduledAppointmentVM) => {
    setLinkedContext({
      entityType: "appointment",
      entityId: apt.id,
      entityLabel: apt.service,
    });
    navigate("/business/appointments");
  };

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          Appointments
          {upcomingCount > 0 && (
            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
              {upcomingCount} upcoming
            </Badge>
          )}
          {recentNoShows > 0 && (
            <Badge variant="outline" className="text-[10px] bg-destructive/15 text-destructive border-destructive/30">
              {recentNoShows} no-show
            </Badge>
          )}
        </CardTitle>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={handleSchedule}
          disabled={isUnauthenticated}
        >
          <Plus className="h-3 w-3 mr-1" /> Schedule
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {isUnauthenticated ? (
          <p className="text-[11px] text-muted-foreground py-2">
            Sign in to view linked appointments.
          </p>
        ) : isLoading ? (
          <p className="text-[11px] text-muted-foreground py-2">Loading…</p>
        ) : sorted.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 p-4 text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              No appointments linked to <span className="font-medium text-foreground">{entityLabel}</span> yet.
            </p>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={handleSchedule}>
              <Plus className="h-3 w-3 mr-1" /> Schedule first appointment
            </Button>
          </div>
        ) : (
          sorted.map((apt) => {
            const chip = STATUS_CHIP[apt.status];
            return (
              <button
                key={apt.id}
                onClick={() => handleOpenAppointment(apt)}
                className="w-full text-left rounded-lg border border-border/40 hover:border-primary/30 bg-card/60 p-2.5 transition-colors group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{apt.service}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {apt.date} · {apt.time} · {apt.duration}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className={`text-[10px] ${chip.cls}`}>
                      {chip.icon}<span className="ml-1">{chip.label}</span>
                    </Badge>
                    {apt.status === "no-show" && (
                      <RefreshCw className="h-3 w-3 text-muted-foreground" />
                    )}
                    <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </button>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

export default AppointmentLineagePanel;