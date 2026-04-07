import { motion } from "framer-motion";
import { Calendar, Clock, User, Video, MapPin, Plus, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useBookings } from "@/hooks/use-revenue-office";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/sita/EmptyState";

const DEMO_UPCOMING = [
  { client: "Sarah Mitchell", type: "Strategy Call", time: "Today, 2:00 PM", duration: "45 min", mode: "video", status: "confirmed" },
  { client: "James Chen", type: "Discovery Call", time: "Today, 4:30 PM", duration: "30 min", mode: "video", status: "confirmed" },
  { client: "Emily Rodriguez", type: "Coaching Session", time: "Tomorrow, 10:00 AM", duration: "60 min", mode: "video", status: "pending" },
  { client: "Michael Park", type: "Quarterly Review", time: "Apr 8, 1:00 PM", duration: "45 min", mode: "in-person", status: "confirmed" },
];

const DEMO_SERVICES = [
  { name: "Discovery Call", duration: "30 min", price: "Free", bookings: 24, conversionRate: "33%" },
  { name: "Strategy Session", duration: "45 min", price: "$150", bookings: 18, conversionRate: "67%" },
  { name: "Coaching Hour", duration: "60 min", price: "$250", bookings: 12, conversionRate: "83%" },
  { name: "VIP Day", duration: "4 hours", price: "$2,000", bookings: 3, conversionRate: "100%" },
];

const DEMO_STATS = [
  { label: "This Week", value: "8 bookings", sub: "+2 from last week" },
  { label: "Show Rate", value: "94%", sub: "Excellent" },
  { label: "Revenue from Bookings", value: "$4,350", sub: "This month" },
  { label: "Avg. Lead Time", value: "3.2 days", sub: "Booking to appointment" },
];

export default function BookingCenter() {
  const { isDemoMode } = useDataMode();
  const { data: liveBookings, isLoading } = useBookings();

  const UPCOMING = isDemoMode ? DEMO_UPCOMING : (liveBookings?.map((b: any) => ({
    client: b.client_name || "Unknown", type: b.service_type || "Meeting",
    time: new Date(b.start_time).toLocaleString(), duration: `${b.duration_minutes || 30} min`,
    mode: b.mode || "video", status: b.status || "pending",
  })) ?? DEMO_UPCOMING);

  const SERVICES = isDemoMode ? DEMO_SERVICES : DEMO_SERVICES;
  const STATS = isDemoMode ? DEMO_STATS : DEMO_STATS;

  if (!isDemoMode && isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-6">
        <DemoModeBadge />
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!isDemoMode && UPCOMING.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-6">
        <DemoModeBadge />
        <h1 className="text-2xl font-bold text-foreground">Booking Center</h1>
        <EmptyState icon={Calendar} title="No bookings yet" description="Set up your services and start accepting bookings." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Booking Center</h1>
            <p className="text-sm text-muted-foreground">Appointments, services, and scheduling intelligence</p>
          </div>
          <Button className="gap-2"><Plus className="w-4 h-4" /> New Service</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(s => (
          <Card key={s.label} className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-xl font-bold text-foreground mt-1">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Upcoming Appointments</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {UPCOMING.map((a: any) => (
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

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Service Catalog</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {SERVICES.map(s => (
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
      </div>
    </div>
  );
}
