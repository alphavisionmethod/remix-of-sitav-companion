import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, User, Video, MapPin, Plus, Check, X, AlertTriangle, TrendingUp, ArrowRight, CheckSquare, Phone, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useBookings } from "@/hooks/use-revenue-office";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/sita/EmptyState";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import {
  DEMO_REV_SERVICES as DEMO_SERVICES,
  DEMO_REV_STATS as DEMO_STATS,
  DEMO_UPCOMING,
  DEMO_BOOKING_ANALYTICS,
  DEMO_NOSHOW_RECOVERY,
  DEMO_PREP_CHECKLISTS,
} from "@/data/seed/revenue-office";
import { useDataMode } from "@/contexts/DataModeContext";




export default function BookingCenter() {
  const { isDemoMode } = useDataMode();
  const { data: liveBookings, isLoading } = useBookings();
  const [tab, setTab] = useState("upcoming");

  const UPCOMING = (liveBookings?.map((b: Record<string, any>) => ({
    client: b.client_name || "Unknown", type: b.service_type || "Meeting",
    time: new Date(b.start_time).toLocaleString(), duration: `${b.duration_minutes || 30} min`,
    mode: b.mode || "video", status: b.status || "pending",
  })) ?? []);

  if (!isDemoMode && isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-6">
<Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!isDemoMode && UPCOMING.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-6">
<h1 className="text-2xl font-bold text-foreground">Booking Center</h1>
        <EmptyState icon={Calendar} title="No bookings yet" description="Set up your services and start accepting bookings." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Booking & Appointment Office</h1>
            <p className="text-sm text-muted-foreground">Scheduling, prep, no-show recovery, and conversion intelligence</p>
          </div>
          <Button className="gap-2"><Plus className="w-4 h-4" /> New Service</Button>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([] as typeof DEMO_STATS).map(s => (
          <Card key={s.label} className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-xl font-bold text-foreground mt-1">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5">
          <TabsTrigger value="upcoming" className="text-[10px] h-7 px-2.5 gap-1"><Calendar className="h-3 w-3" />Upcoming</TabsTrigger>
          <TabsTrigger value="analytics" className="text-[10px] h-7 px-2.5 gap-1"><TrendingUp className="h-3 w-3" />Analytics</TabsTrigger>
          <TabsTrigger value="noshow" className="text-[10px] h-7 px-2.5 gap-1"><AlertTriangle className="h-3 w-3" />No-Show Recovery</TabsTrigger>
          <TabsTrigger value="prep" className="text-[10px] h-7 px-2.5 gap-1"><CheckSquare className="h-3 w-3" />Prep Checklists</TabsTrigger>
          <TabsTrigger value="services" className="text-[10px] h-7 px-2.5 gap-1"><Clock className="h-3 w-3" />Services</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          {/* Upcoming */}
          <TabsContent value="upcoming">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Upcoming Appointments</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {UPCOMING.map((a: Record<string, any>) => (
                  <div key={`${a.client}-${a.time}`} className="flex items-center justify-between p-3 rounded-lg bg-muted/10 border border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {a.client.split(" ").map((n: string) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{a.client}</p>
                        <p className="text-xs text-muted-foreground">{a.type} · {a.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-foreground">{a.time}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {a.mode === "video" ? <Video className="w-3 h-3 text-muted-foreground" /> : <MapPin className="w-3 h-3 text-muted-foreground" />}
                          <Badge variant={a.status === "confirmed" ? "default" : "secondary"} className="text-xs">{a.status}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {([] as typeof DEMO_BOOKING_ANALYTICS).map(a => (
                <Card key={a.metric} className="bg-card/50 border-border/50">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">{a.metric}</p>
                    <p className="text-2xl font-bold text-foreground">{a.value}</p>
                    <p className={`text-xs mt-1 ${a.status === "improving" || a.status === "strong" ? "text-emerald-400" : "text-amber-400"}`}>
                      {a.trend}
                    </p>
                    <Badge variant={a.status === "watch" ? "secondary" : "default"} className="text-[9px] mt-2">{a.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* No-Show Recovery */}
          <TabsContent value="noshow">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> No-Show Rescue & Rebook
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-[10px] h-7 gap-1">
                    <Zap className="w-3 h-3" />Automate no-show recovery
                  </Button>
                  <Button variant="outline" size="sm" className="text-[10px] h-7 gap-1">
                    <Calendar className="w-3 h-3" />Automate post-appointment follow-up
                  </Button>
                </div>
              </div>
              {([] as typeof DEMO_NOSHOW_RECOVERY).map((n, i) => (
                <Card key={i} className={`border-border/50 ${n.rebooked ? "bg-card/50" : "bg-amber-500/5 border-amber-500/20"}`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {n.client.split(" ").map(c => c[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{n.client}</p>
                        <p className="text-xs text-muted-foreground">{n.type} · {n.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        {n.rescueSent && <Badge className="text-[9px] bg-blue-500/20 text-blue-400 mb-1">Rescue Sent</Badge>}
                        {n.rebooked ? (
                          <div>
                            <Badge className="text-[9px] bg-emerald-500/20 text-emerald-400">Rebooked</Badge>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{n.rebookDate}</p>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" className="text-[10px] h-6 gap-1"><Phone className="w-3 h-3" />Call</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Prep Checklists */}
          <TabsContent value="prep">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-primary" /> Appointment Prep Checklists
              </h3>
              {([] as typeof DEMO_PREP_CHECKLISTS).map((pc, i) => {
                const done = pc.items.filter(it => it.done).length;
                return (
                  <Card key={i} className="bg-card/50 border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{pc.appointment}</p>
                          <p className="text-xs text-muted-foreground">{pc.time}</p>
                        </div>
                        <Badge variant={done === pc.items.length ? "default" : "secondary"} className="text-[10px]">
                          {done}/{pc.items.length} complete
                        </Badge>
                      </div>
                      <Progress value={(done / pc.items.length) * 100} className="h-1.5 mb-3" />
                      <div className="space-y-2">
                        {pc.items.map((item, j) => (
                          <div key={j} className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${item.done ? "bg-primary border-primary" : "border-border"}`}>
                              {item.done && <Check className="w-3 h-3 text-primary-foreground" />}
                            </div>
                            <span className={`text-xs ${item.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{item.task}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Services */}
          <TabsContent value="services">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Service Catalog</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {([] as typeof DEMO_SERVICES).map(s => (
                  <div key={s.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/10 border border-border/30">
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.duration} · {s.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{s.bookings} bookings</p>
                      <p className="text-xs text-muted-foreground">{s.conversionRate} conversion</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
