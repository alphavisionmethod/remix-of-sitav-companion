import { PageSkeleton } from "@/components/sita/PageSkeleton";
import { useState, useMemo } from "react";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { KPITile, EmptyState, SitaTabs } from "@/components/sita/SitaComponents";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { format, addDays, startOfWeek, startOfMonth, endOfMonth, isSameDay, isToday, isBefore, parseISO, eachDayOfInterval } from "date-fns";
import { Calendar, Clock, AlertTriangle, Users, Briefcase, Home, ChevronLeft, ChevronRight, Plus, MapPin, Video, Phone, Zap, Trash2, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { type CalWorkspaceEvent as CalEvent } from "@/data/seed/calendar-workspace";
import { useRealityProvider } from "@/hooks/useRealityProvider";
import { useCreateCalendarEvent, useUpdateCalendarEvent, useDeleteCalendarEvent } from "@/hooks/use-calendar-mutations";
import { useBookingList, useBookingCreate, useBookingCancel } from "@/hooks/use-backend-actions";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
type CalView = "day" | "week" | "month" | "agenda";

const DOMAIN_COLORS: Record<string, string> = {
  personal: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  business: "bg-primary/20 text-primary border-primary/30",
  household: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  finance: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  meeting: Video,
  task: Zap,
  reminder: Clock,
  appointment: MapPin,
  deadline: AlertTriangle,
  travel: MapPin,
};

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7am-8pm

const CalendarWorkspace = () => {
  const [view, setView] = useState<CalView>("week");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [eventForm, setEventForm] = useState({ title: "", event_date: "", start_time: "", end_time: "", domain: "personal", event_type: "meeting", location: "" });
  const { mode } = useRealityProvider();
  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();
  const { data: bookings = [] } = useBookingList();
  const createBooking = useBookingCreate();
  const cancelBooking = useBookingCancel();

  // DB query for real calendar events
  const { data: dbEvents } = useQuery({
    queryKey: ["calendar-events", mode],
    queryFn: async () => {
      if (mode !== "real") return null;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await fromTable("calendar_events").select("*")
        .eq("user_id", user.id).order("event_date", { ascending: true });
      if (error || !data?.length) return null;
      return data.map((e: Record<string, any>): CalEvent => ({
        id: e.id, title: e.title, date: new Date(e.event_date).toISOString(),
        time: e.start_time, endTime: e.end_time, domain: e.domain,
        type: e.event_type, location: e.location, priority: e.priority,
        overlapWarning: e.overlap_warning,
      }));
    },
  });

  const allEvents: CalEvent[] = dbEvents ?? [];

  const filteredEvents = useMemo(() =>
    allEvents.filter(e => domainFilter === "all" || e.domain === domainFilter),
    [domainFilter, allEvents]
  );

  const todayEvents = filteredEvents.filter(e => isSameDay(parseISO(e.date), new Date()));
  const upcomingConflicts = allEvents.filter(e => e.overlapWarning);
  const urgentDeadlines = allEvents.filter(e => e.priority === "urgent" || e.priority === "high");

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const monthDays = eachDayOfInterval({ start: startOfWeek(monthStart, { weekStartsOn: 1 }), end: addDays(endOfMonth(selectedDate), 6 - endOfMonth(selectedDate).getDay()) });

  return (
    <div className="min-h-screen pb-12">
<SitaPageHeader title="Calendar" subtitle="Your time across life, business, and household" actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 border-border/50 text-muted-foreground hover:bg-accent/50" onClick={() => {
            setEventForm({ title: "", event_date: format(selectedDate, "yyyy-MM-dd"), start_time: "", end_time: "", domain: "personal", event_type: "meeting", location: "" });
            setShowCreateDialog(true);
          }}>
            <Plus className="w-3.5 h-3.5" /> New Event
          </Button>
        </div>
      } />

      {/* Top Summary Strip */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 px-1">
        <motion.div variants={fadeUp}>
          <KPITile label="Today" value={`${todayEvents.length} events`} icon={Calendar} sub={format(new Date(), "EEEE, MMM d")} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <KPITile label="This Week" value={`${filteredEvents.filter(e => { const d = parseISO(e.date); return d >= weekStart && d <= addDays(weekStart, 6); }).length}`} icon={Clock} sub="scheduled items" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <KPITile label="Conflicts" value={upcomingConflicts.length.toString()} icon={AlertTriangle} sub={upcomingConflicts.length > 0 ? "needs attention" : "all clear"} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <KPITile label="Deadlines" value={urgentDeadlines.length.toString()} icon={Zap} sub="high priority" />
        </motion.div>
      </motion.div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4 px-1 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setSelectedDate(d => addDays(d, view === "month" ? -30 : view === "week" ? -7 : -1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-[140px] text-center">
            {view === "month" ? format(selectedDate, "MMMM yyyy") : view === "week" ? `${format(weekStart, "MMM d")} – ${format(addDays(weekStart, 6), "MMM d, yyyy")}` : format(selectedDate, "EEEE, MMMM d, yyyy")}
          </span>
          <Button size="sm" variant="ghost" onClick={() => setSelectedDate(d => addDays(d, view === "month" ? 30 : view === "week" ? 7 : 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" className="ml-2 text-xs" onClick={() => setSelectedDate(new Date())}>Today</Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Domain filter */}
          <div className="flex gap-1">
            {[{ k: "all", l: "All" }, { k: "personal", l: "Personal" }, { k: "business", l: "Business" }, { k: "household", l: "Household" }, { k: "finance", l: "Finance" }].map(d => (
              <button key={d.k} onClick={() => setDomainFilter(d.k)} className={cn("px-2 py-1 text-xs rounded-md transition-colors", domainFilter === d.k ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-accent/30")}>
                {d.l}
              </button>
            ))}
          </div>
          <SitaTabs tabs={[
            { key: "day", label: "Day" }, { key: "week", label: "Week" },
            { key: "month", label: "Month" }, { key: "agenda", label: "Agenda" }
          ]} active={view} onChange={(v) => setView(v as CalView)} />
        </div>
      </div>

      <div className="flex gap-4">
        {/* Main calendar area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {view === "week" && (
              <motion.div key="week" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border border-border/30 rounded-xl overflow-hidden bg-card/30 backdrop-blur-sm">
                {/* Week header */}
                <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border/20">
                  <div className="p-2 text-xs text-muted-foreground" />
                  {weekDays.map(d => (
                    <div key={d.toISOString()} className={cn("p-2 text-center border-l border-border/10", isToday(d) && "bg-primary/5")}>
                      <div className="text-xs text-muted-foreground">{format(d, "EEE")}</div>
                      <div className={cn("text-sm font-medium", isToday(d) ? "text-primary" : "text-foreground")}>{format(d, "d")}</div>
                    </div>
                  ))}
                </div>
                {/* Time grid */}
                <div className="max-h-[520px] overflow-y-auto">
                  {HOURS.map(h => (
                    <div key={h} className="grid grid-cols-[60px_repeat(7,1fr)] min-h-[48px] border-b border-border/10 group hover:bg-accent/5 transition-colors">
                      <div className="p-1 text-[10px] text-muted-foreground/60 text-right pr-2 pt-0.5">{h}:00</div>
                      {weekDays.map(d => {
                        const dayEvents = filteredEvents.filter(e => isSameDay(parseISO(e.date), d) && e.time && parseInt(e.time.split(":")[0]) === h);
                        return (
                          <div key={d.toISOString()} className="border-l border-border/10 p-0.5 relative">
                            {dayEvents.map(ev => {
                              const Icon = TYPE_ICONS[ev.type] || Clock;
                              return (
                                <button key={ev.id} onClick={() => setSelectedEvent(ev)} className={cn("w-full text-left px-1.5 py-0.5 rounded text-[10px] leading-tight border mb-0.5 hover:brightness-110 transition-all cursor-pointer", DOMAIN_COLORS[ev.domain])}>
                                  <div className="flex items-center gap-1">
                                    <Icon className="w-2.5 h-2.5 shrink-0" />
                                    <span className="truncate font-medium">{ev.title}</span>
                                  </div>
                                  {ev.time && <span className="opacity-60">{ev.time}{ev.endTime ? ` – ${ev.endTime}` : ""}</span>}
                                </button>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {view === "day" && (
              <motion.div key="day" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border border-border/30 rounded-xl overflow-hidden bg-card/30 backdrop-blur-sm">
                <div className="max-h-[580px] overflow-y-auto">
                  {HOURS.map(h => {
                    const hourEvents = filteredEvents.filter(e => isSameDay(parseISO(e.date), selectedDate) && e.time && parseInt(e.time.split(":")[0]) === h);
                    return (
                      <div key={h} className="flex border-b border-border/10 min-h-[56px] hover:bg-accent/5 transition-colors">
                        <div className="w-16 p-2 text-xs text-muted-foreground/60 text-right shrink-0">{h}:00</div>
                        <div className="flex-1 p-1 border-l border-border/10">
                          {hourEvents.map(ev => {
                            const Icon = TYPE_ICONS[ev.type] || Clock;
                            return (
                              <button key={ev.id} onClick={() => setSelectedEvent(ev)} className={cn("w-full text-left px-3 py-2 rounded-lg border mb-1 hover:brightness-110 transition-all cursor-pointer", DOMAIN_COLORS[ev.domain])}>
                                <div className="flex items-center gap-2">
                                  <Icon className="w-3.5 h-3.5" />
                                  <span className="font-medium text-sm">{ev.title}</span>
                                  {ev.priority === "urgent" && <Badge variant="destructive" className="text-[9px] px-1 py-0">Urgent</Badge>}
                                  {ev.overlapWarning && <Badge className="text-[9px] px-1 py-0 bg-amber-500/20 text-amber-300">Conflict</Badge>}
                                </div>
                                <div className="text-xs opacity-60 mt-0.5">{ev.time}{ev.endTime ? ` – ${ev.endTime}` : ""}{ev.location ? ` · ${ev.location}` : ""}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {view === "month" && (
              <motion.div key="month" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border border-border/30 rounded-xl overflow-hidden bg-card/30 backdrop-blur-sm">
                <div className="grid grid-cols-7 border-b border-border/20">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                    <div key={d} className="p-2 text-xs text-center text-muted-foreground font-medium">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {monthDays.slice(0, 42).map((d, i) => {
                    const dayEvents = filteredEvents.filter(e => isSameDay(parseISO(e.date), d));
                    const inMonth = d.getMonth() === selectedDate.getMonth();
                    return (
                      <button key={i} onClick={() => { setSelectedDate(d); setView("day"); }} className={cn("min-h-[80px] p-1.5 border-b border-r border-border/10 text-left hover:bg-accent/10 transition-colors", !inMonth && "opacity-30", isToday(d) && "bg-primary/5")}>
                        <div className={cn("text-xs mb-1", isToday(d) ? "text-primary font-bold" : "text-muted-foreground")}>{format(d, "d")}</div>
                        {dayEvents.slice(0, 3).map(ev => (
                          <div key={ev.id} className={cn("text-[9px] px-1 py-0.5 rounded mb-0.5 truncate border", DOMAIN_COLORS[ev.domain])}>{ev.title}</div>
                        ))}
                        {dayEvents.length > 3 && <div className="text-[9px] text-muted-foreground">+{dayEvents.length - 3} more</div>}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {view === "agenda" && (
              <motion.div key="agenda" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                {Array.from(new Set(filteredEvents.map(e => format(parseISO(e.date), "yyyy-MM-dd")))).sort().map(dateStr => (
                  <div key={dateStr}>
                    <div className="text-xs font-medium text-muted-foreground mb-1.5 px-1">{isToday(parseISO(dateStr)) ? "Today" : format(parseISO(dateStr), "EEEE, MMMM d")}</div>
                    <div className="space-y-1.5">
                      {filteredEvents.filter(e => format(parseISO(e.date), "yyyy-MM-dd") === dateStr).map(ev => {
                        const Icon = TYPE_ICONS[ev.type] || Clock;
                        return (
                          <button key={ev.id} onClick={() => setSelectedEvent(ev)} className={cn("w-full text-left flex items-center gap-3 p-3 rounded-xl border hover:brightness-110 transition-all cursor-pointer", DOMAIN_COLORS[ev.domain])}>
                            <Icon className="w-4 h-4 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">{ev.title}</div>
                              <div className="text-xs opacity-60">{ev.time || "All day"}{ev.location ? ` · ${ev.location}` : ""}</div>
                            </div>
                            {ev.priority === "urgent" && <Badge variant="destructive" className="text-[9px]">Urgent</Badge>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right detail panel */}
        <div className="w-72 shrink-0 hidden lg:block">
          <AnimatePresence mode="wait">
            {selectedEvent ? (
              <motion.div key={selectedEvent.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}>
                <SitaCard className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={cn("text-[10px]", DOMAIN_COLORS[selectedEvent.domain])}>{selectedEvent.domain}</Badge>
                    <button onClick={() => setSelectedEvent(null)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
                  </div>
                  <h3 className="text-base font-semibold mb-1">{selectedEvent.title}</h3>
                  <div className="text-xs text-muted-foreground space-y-1.5 mb-4">
                    <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />{format(parseISO(selectedEvent.date), "EEEE, MMM d")}</div>
                    {selectedEvent.time && <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{selectedEvent.time}{selectedEvent.endTime ? ` – ${selectedEvent.endTime}` : ""}</div>}
                    {selectedEvent.location && <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{selectedEvent.location}</div>}
                  </div>
                  {selectedEvent.overlapWarning && (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5" /> Schedule conflict detected
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => {
                      setEventForm({
                        title: selectedEvent.title,
                        event_date: format(parseISO(selectedEvent.date), "yyyy-MM-dd"),
                        start_time: selectedEvent.time || "",
                        end_time: selectedEvent.endTime || "",
                        domain: selectedEvent.domain || "personal",
                        event_type: selectedEvent.type || "meeting",
                        location: selectedEvent.location || "",
                      });
                      setShowEditDialog(true);
                    }}><Pencil className="w-3 h-3 mr-1" />Edit</Button>
                    <Button size="sm" variant="outline" className="text-xs text-destructive" onClick={() => {
                      deleteEvent.mutate(selectedEvent.id);
                      setSelectedEvent(null);
                    }}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </SitaCard>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <SitaCard className="p-4">
                  <div className="text-center text-muted-foreground">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">Select an event to see details</p>
                  </div>
                </SitaCard>
                {/* Overload indicator */}
                <SitaCard className="p-3 mt-3">
                  <SitaCardTitle className="text-xs mb-2">Load This Week</SitaCardTitle>
                  <div className="space-y-1">
                    {weekDays.map(d => {
                      const count = filteredEvents.filter(e => isSameDay(parseISO(e.date), d)).length;
                      const pct = Math.min(count / 5, 1);
                      return (
                        <div key={d.toISOString()} className="flex items-center gap-2">
                          <span className={cn("text-[10px] w-8", isToday(d) ? "text-primary font-bold" : "text-muted-foreground")}>{format(d, "EEE")}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-border/30 overflow-hidden">
                            <div className={cn("h-full rounded-full transition-all", pct > 0.7 ? "bg-red-400" : pct > 0.4 ? "bg-amber-400" : "bg-emerald-400")} style={{ width: `${pct * 100}%` }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground w-3 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </SitaCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bookings Section */}
      <div className="mt-6">
        <SitaCard className="p-4">
          <div className="flex items-center justify-between mb-3">
            <SitaCardTitle>Travel & Bookings</SitaCardTitle>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => {
              createBooking.mutate({
                title: "New Booking",
                booking_type: "travel",
                start_date: format(selectedDate, "yyyy-MM-dd"),
              });
            }} disabled={createBooking.isPending}>
              <Plus className="w-3 h-3" /> Add Booking
            </Button>
          </div>
          {(bookings as never[]).length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No bookings yet. Add your first travel or appointment booking.</p>
          ) : (
            <div className="space-y-2">
              {(bookings as never[]).map((b: Record<string, any>) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-secondary/10">
                  <div>
                    <p className="text-sm font-medium text-foreground">{b.title}</p>
                    <p className="text-xs text-muted-foreground">{b.booking_type} · {b.start_date}{b.end_date ? ` – ${b.end_date}` : ""}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-xs text-muted-foreground hover:text-destructive" onClick={() => cancelBooking.mutate({ booking_id: b.id })}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </SitaCard>
      </div>
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Event</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs font-medium">Title</label><Input value={eventForm.title} onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium">Date</label><Input type="date" value={eventForm.event_date} onChange={e => setEventForm(f => ({ ...f, event_date: e.target.value }))} /></div>
              <div><label className="text-xs font-medium">Domain</label>
                <Select value={eventForm.domain} onValueChange={v => setEventForm(f => ({ ...f, domain: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="household">Household</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium">Start Time</label><Input type="time" value={eventForm.start_time} onChange={e => setEventForm(f => ({ ...f, start_time: e.target.value }))} /></div>
              <div><label className="text-xs font-medium">End Time</label><Input type="time" value={eventForm.end_time} onChange={e => setEventForm(f => ({ ...f, end_time: e.target.value }))} /></div>
            </div>
            <div><label className="text-xs font-medium">Location</label><Input value={eventForm.location} onChange={e => setEventForm(f => ({ ...f, location: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              createEvent.mutate(eventForm);
              setShowCreateDialog(false);
            }} disabled={!eventForm.title || !eventForm.event_date}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Event</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs font-medium">Title</label><Input value={eventForm.title} onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium">Date</label><Input type="date" value={eventForm.event_date} onChange={e => setEventForm(f => ({ ...f, event_date: e.target.value }))} /></div>
              <div><label className="text-xs font-medium">Location</label><Input value={eventForm.location} onChange={e => setEventForm(f => ({ ...f, location: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium">Start Time</label><Input type="time" value={eventForm.start_time} onChange={e => setEventForm(f => ({ ...f, start_time: e.target.value }))} /></div>
              <div><label className="text-xs font-medium">End Time</label><Input type="time" value={eventForm.end_time} onChange={e => setEventForm(f => ({ ...f, end_time: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              if (selectedEvent) {
                updateEvent.mutate({ id: selectedEvent.id, title: eventForm.title, event_date: eventForm.event_date, start_time: eventForm.start_time, end_time: eventForm.end_time, location: eventForm.location });
                setShowEditDialog(false);
              }
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarWorkspace;
