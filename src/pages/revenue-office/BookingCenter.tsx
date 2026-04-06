import { motion } from "framer-motion";
import { Calendar, Clock, User, Video, MapPin, Plus, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const UPCOMING = [
  { client: "Sarah Mitchell", type: "Strategy Call", time: "Today, 2:00 PM", duration: "45 min", mode: "video", status: "confirmed" },
  { client: "James Chen", type: "Discovery Call", time: "Today, 4:30 PM", duration: "30 min", mode: "video", status: "confirmed" },
  { client: "Emily Rodriguez", type: "Coaching Session", time: "Tomorrow, 10:00 AM", duration: "60 min", mode: "video", status: "pending" },
  { client: "Michael Park", type: "Quarterly Review", time: "Apr 8, 1:00 PM", duration: "45 min", mode: "in-person", status: "confirmed" },
];

const SERVICES = [
  { name: "Discovery Call", duration: "30 min", price: "Free", bookings: 24, conversionRate: "33%" },
  { name: "Strategy Session", duration: "45 min", price: "$150", bookings: 18, conversionRate: "67%" },
  { name: "Coaching Hour", duration: "60 min", price: "$250", bookings: 12, conversionRate: "83%" },
  { name: "VIP Day", duration: "4 hours", price: "$2,000", bookings: 3, conversionRate: "100%" },
];

const STATS = [
  { label: "This Week", value: "8 bookings", sub: "+2 from last week" },
  { label: "Show Rate", value: "94%", sub: "Excellent" },
  { label: "Revenue from Bookings", value: "$4,350", sub: "This month" },
  { label: "Avg. Lead Time", value: "3.2 days", sub: "Booking to appointment" },
];

export default function BookingCenter() {
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
        {/* Upcoming */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Upcoming Appointments</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {UPCOMING.map(a => (
              <div key={`${a.client}-${a.time}`} className="flex items-center justify-between p-3 rounded-lg bg-muted/10 border border-border/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {a.client.split(" ").map(n => n[0]).join("")}
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

        {/* Service Catalog */}
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
