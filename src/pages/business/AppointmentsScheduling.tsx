import { useState } from "react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getModuleAdaptation } from "@/domains/engines/business-module-adaptations";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
import { useDataMode } from "@/contexts/DataModeContext";
  CalendarDays, Clock, CheckCircle2, AlertTriangle, Phone,
  MessageSquare, User, MapPin, RefreshCw, Sparkles,
  ChevronRight, UserCheck, XCircle, Send, Bell
} from "lucide-react";

type ConfirmationStatus = "confirmed" | "pending" | "unconfirmed" | "cancelled" | "no-show";

interface Appointment {
  id: string;
  customer: string;
  service: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  status: ConfirmationStatus;
  staff: string;
  noShowRisk: "low" | "medium" | "high";
  notes?: string;
  lastContact?: string;
  isFollowUp?: boolean;
}

const DEMO_APPOINTMENTS: Appointment[] = [
  { id: "APT-301", customer: "Marcus Chen", service: "Strategy Consultation", date: "Today", time: "2:00 PM", duration: "60 min", location: "Office — Room A", status: "confirmed", staff: "You", noShowRisk: "low", lastContact: "Confirmed via SMS 2h ago" },
  { id: "APT-302", customer: "Sarah Park", service: "Project Review", date: "Today", time: "4:30 PM", duration: "30 min", location: "Video Call", status: "pending", staff: "You", noShowRisk: "medium", notes: "Hasn't confirmed. 2 prior reschedules." },
  { id: "APT-303", customer: "David Liu", service: "Onboarding Session", date: "Tomorrow", time: "10:00 AM", duration: "90 min", location: "Office — Room B", status: "unconfirmed", staff: "Alex M.", noShowRisk: "high", notes: "No response to 2 reminders. History of missed appointments." },
  { id: "APT-304", customer: "Elena Torres", service: "Follow-Up Check-in", date: "Tomorrow", time: "1:00 PM", duration: "30 min", location: "Phone Call", status: "confirmed", staff: "You", noShowRisk: "low", lastContact: "Confirmed yesterday", isFollowUp: true },
  { id: "APT-305", customer: "James Wright", service: "Proposal Walkthrough", date: "Wed", time: "9:30 AM", duration: "45 min", location: "Office — Room A", status: "pending", staff: "You", noShowRisk: "medium" },
  { id: "APT-306", customer: "Amy Nguyen", service: "Annual Review", date: "Wed", time: "3:00 PM", duration: "60 min", location: "Video Call", status: "confirmed", staff: "Alex M.", noShowRisk: "low", lastContact: "Auto-confirmed" },
  { id: "APT-307", customer: "Robert Kim", service: "Initial Consultation", date: "Yesterday", time: "11:00 AM", duration: "45 min", location: "Office — Room A", status: "no-show", staff: "You", noShowRisk: "high", notes: "Did not show. No cancellation notice." },
  { id: "APT-308", customer: "Lisa Chang", service: "Service Review", date: "2 days ago", time: "2:00 PM", duration: "30 min", location: "Phone Call", status: "confirmed", staff: "You", noShowRisk: "low", isFollowUp: true, notes: "Completed — follow-up action needed" },
];

const statusConfig: Record<ConfirmationStatus, { color: string; label: string; icon: React.ReactNode }> = {
  confirmed: { color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30", label: "Confirmed", icon: <CheckCircle2 className="h-3 w-3" /> },
  pending: { color: "bg-amber-500/15 text-amber-600 border-amber-500/30", label: "Pending", icon: <Clock className="h-3 w-3" /> },
  unconfirmed: { color: "bg-orange-500/15 text-orange-600 border-orange-500/30", label: "Unconfirmed", icon: <AlertTriangle className="h-3 w-3" /> },
  cancelled: { color: "bg-muted text-muted-foreground border-border", label: "Cancelled", icon: <XCircle className="h-3 w-3" /> },
  "no-show": { color: "bg-destructive/15 text-destructive border-destructive/30", label: "No-Show", icon: <XCircle className="h-3 w-3" /> },
};

const riskConfig: Record<string, string> = {
  low: "text-emerald-600",
  medium: "text-amber-600",
  high: "text-destructive",
};

const KPIStrip = () => {
  const { isDemoMode } = useDataMode();
  const upcoming = DEMO_APPOINTMENTS.filter(a => ["Today", "Tomorrow", "Wed"].includes(a.date) && a.status !== "no-show" && a.status !== "cancelled").length;
  const needsConfirm = DEMO_APPOINTMENTS.filter(a => a.status === "pending" || a.status === "unconfirmed").length;
  const highRisk = DEMO_APPOINTMENTS.filter(a => a.noShowRisk === "high" && a.status !== "no-show" && a.status !== "cancelled").length;
  const noShows = DEMO_APPOINTMENTS.filter(a => a.status === "no-show").length;

  const kpis = [
    { label: "Upcoming", value: upcoming, icon: <CalendarDays className="h-4 w-4" />, accent: "text-primary" },
    { label: "Needs Confirmation", value: needsConfirm, icon: <Bell className="h-4 w-4" />, accent: "text-amber-500" },
    { label: "High No-Show Risk", value: highRisk, icon: <AlertTriangle className="h-4 w-4" />, accent: "text-orange-500" },
    { label: "Recent No-Shows", value: noShows, icon: <XCircle className="h-4 w-4" />, accent: "text-destructive" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {kpis.map((k) => (
        <Card key={k.label} className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`rounded-lg bg-muted p-2 ${k.accent}`}>{k.icon}</div>
            <div>
              <p className="text-2xl font-bold text-foreground">{k.value}</p>
              <p className="text-xs text-muted-foreground">{k.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const AppointmentCard = ({ apt }: { apt: Appointment }) => {
  const st = statusConfig[apt.status];
  const isNoShow = apt.status === "no-show";

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="group">
      <Card className={`border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-all cursor-pointer ${isNoShow ? "opacity-75" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-muted-foreground">{apt.id}</span>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${st.color}`}>
                  {st.icon}<span className="ml-1">{st.label}</span>
                </Badge>
                {apt.noShowRisk !== "low" && apt.status !== "no-show" && apt.status !== "cancelled" && (
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 bg-muted border-border ${riskConfig[apt.noShowRisk]}`}>
                    <AlertTriangle className="h-3 w-3 mr-0.5" /> {apt.noShowRisk} risk
                  </Badge>
                )}
                {apt.isFollowUp && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-primary/5 text-primary/70 border-primary/20">
                    <RefreshCw className="h-3 w-3 mr-0.5" /> Follow-Up
                  </Badge>
                )}
              </div>
              <h4 className="text-sm font-semibold text-foreground">{apt.service}</h4>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1"><User className="h-3 w-3" />{apt.customer}</span>
                <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{apt.date} · {apt.time}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{apt.duration}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{apt.location}</span>
              </div>
              {apt.notes && <p className="text-[11px] text-muted-foreground/80 italic">{apt.notes}</p>}
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1"><UserCheck className="h-3 w-3" />{apt.staff}</span>
              {(apt.status === "pending" || apt.status === "unconfirmed") && (
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="h-6 text-[10px] px-2"><Send className="h-3 w-3" /></Button>
                  <Button size="sm" variant="outline" className="h-6 text-[10px] px-2"><Phone className="h-3 w-3" /></Button>
                </div>
              )}
              {apt.status === "no-show" && (
                <Button size="sm" variant="outline" className="h-6 text-[10px] px-2">
                  <RefreshCw className="h-3 w-3 mr-1" /> Recover
                </Button>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const AppointmentsScheduling = () => {
  const { primaryMode } = useBusinessProfile();
  const moduleConfig = getModuleAdaptation("appointments", primaryMode);
  const [activeTab, setActiveTab] = useState("upcoming");

  const filterApts = (tab: string) => {
    if (tab === "upcoming") return DEMO_APPOINTMENTS.filter(a => ["Today", "Tomorrow", "Wed"].includes(a.date) && a.status !== "no-show" && a.status !== "cancelled");
    if (tab === "needs-confirm") return DEMO_APPOINTMENTS.filter(a => a.status === "pending" || a.status === "unconfirmed");
    if (tab === "no-show") return DEMO_APPOINTMENTS.filter(a => a.status === "no-show");
    if (tab === "follow-up") return DEMO_APPOINTMENTS.filter(a => a.isFollowUp || a.status === "no-show");
    return DEMO_APPOINTMENTS;
  };

  const filtered = filterApts(activeTab);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">{moduleConfig.title}</h2>
          <p className="text-xs text-muted-foreground">{moduleConfig.subtitle}</p>
        </div>
      </div>

      <KPIStrip />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted/50 h-9">
              <TabsTrigger value="upcoming" className="text-xs">Upcoming</TabsTrigger>
              <TabsTrigger value="needs-confirm" className="text-xs">Needs Confirmation</TabsTrigger>
              <TabsTrigger value="no-show" className="text-xs">No-Shows</TabsTrigger>
              <TabsTrigger value="follow-up" className="text-xs">Follow-Up</TabsTrigger>
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <Card className="border-border/30 bg-card/60">
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="h-8 w-8 text-primary/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No appointments in this view</p>
                </CardContent>
              </Card>
            ) : (
              filtered.map((apt) => <AppointmentCard key={apt.id} apt={apt} />)
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Scheduling Advisor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg bg-muted/50 p-3 space-y-1.5">
                <p className="text-xs font-medium text-foreground">1 high no-show risk tomorrow</p>
                <p className="text-[11px] text-muted-foreground">David Liu (APT-303) hasn't responded to 2 reminders. Consider a direct call or preparing a backup slot.</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 space-y-1.5">
                <p className="text-xs font-medium text-foreground">Recovery opportunity</p>
                <p className="text-[11px] text-muted-foreground">Robert Kim (no-show yesterday) — SITA prepared a rescheduling message with two time options.</p>
              </div>
              <Button size="sm" variant="outline" className="w-full text-xs h-7">
                <MessageSquare className="h-3 w-3 mr-1" /> View Prepared Messages
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {DEMO_APPOINTMENTS.filter(a => a.date === "Today").map(a => (
                <div key={a.id} className="flex items-center justify-between text-xs py-1.5 border-b border-border/30 last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{a.time}</p>
                    <p className="text-muted-foreground">{a.customer}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${statusConfig[a.status].color}`}>
                    {statusConfig[a.status].label}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8">
                <Send className="h-3 w-3 mr-2" /> Send All Reminders
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8">
                <Phone className="h-3 w-3 mr-2" /> Call Unconfirmed
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8">
                <RefreshCw className="h-3 w-3 mr-2" /> Recover No-Shows
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsScheduling;
