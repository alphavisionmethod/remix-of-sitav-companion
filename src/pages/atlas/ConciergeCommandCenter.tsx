import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { SitaPageHeader } from "@/components/sita/SitaCard";
import { DurabilityStateBadge } from "@/components/sita/truth/DurabilityStateBadge";
import { StalenessIndicator } from "@/components/sita/truth/StalenessIndicator";
import {
  Briefcase, Home, Plane, CheckCircle, Clock, AlertTriangle, FileCheck,
  Users, Calendar, MapPin, Package, Heart, RotateCcw, Activity, ShoppingCart, Link2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const now = new Date();
const h = (hours: number) => new Date(now.getTime() - hours * 3600000).toISOString();

const tasks = [
  { id: "t1", title: "Renew home insurance by April 30", domain: "household", status: "in-progress", priority: "high", durability: "persisted" as const, assignee: "concierge", dueDate: "2026-04-30", completionPct: 60, receiptId: "rcpt-t1", lastAction: h(2) },
  { id: "t2", title: "Schedule pediatrician appointment", domain: "household", status: "pending", priority: "medium", durability: "persisted" as const, assignee: "user", dueDate: "2026-04-15", completionPct: 0, lastAction: h(24) },
  { id: "t3", title: "Submit school enrollment forms", domain: "household", status: "in-progress", priority: "high", durability: "persisted" as const, assignee: "concierge", dueDate: "2026-04-15", completionPct: 80, receiptId: "rcpt-t3", lastAction: h(4) },
  { id: "t4", title: "Book airport transfer for Hawaii trip", domain: "travel", status: "completed", priority: "medium", durability: "persisted" as const, assignee: "concierge", completionPct: 100, receiptId: "rcpt-t4", lastAction: h(12) },
  { id: "t5", title: "Restock kitchen supplies", domain: "household", status: "pending", priority: "low", durability: "transient" as const, assignee: "user", lastAction: h(48) },
];

const travelItinerary = [
  { day: "Apr 12", items: ["✈️ Flight LAX→OGG 8:15am", "🚗 Airport transfer Maui", "🏨 Check-in Marriott Wailea 3pm"] },
  { day: "Apr 13", items: ["🏄 Surf lesson 9am", "🍽️ Dinner reservation Mama's Fish House 7pm"] },
  { day: "Apr 14", items: ["🚗 Road to Hana day trip", "📸 Black sand beach stop"] },
  { day: "Apr 15-17", items: ["🏖️ Free days", "🧘 Spa appointment Apr 16 2pm"] },
  { day: "Apr 18", items: ["🏨 Check-out 11am", "✈️ Flight OGG→LAX 2:30pm"] },
];

const householdState = [
  { area: "Bills & Payments", items: 3, urgent: 1, lastSync: h(0.5) },
  { area: "Calendar & Deadlines", items: 8, urgent: 2, lastSync: h(0.1) },
  { area: "Health & Medical", items: 2, urgent: 0, lastSync: h(24) },
  { area: "Home Maintenance", items: 4, urgent: 0, lastSync: h(48) },
  { area: "Kids & Education", items: 3, urgent: 1, lastSync: h(4) },
];

const receiptFeed = [
  { action: "Insurance renewal quote requested", time: h(2), domain: "household", type: "action" },
  { action: "Airport transfer booked — Confirmation #MT-4521", time: h(12), domain: "travel", type: "commitment" },
  { action: "School enrollment docs uploaded (3 files)", time: h(4), domain: "household", type: "action" },
  { action: "Reminder set: Insurance deadline April 30", time: h(2), domain: "household", type: "promise" },
  { action: "Hawaii packing checklist generated", time: h(24), domain: "travel", type: "action" },
  { action: "Dinner reservation confirmed — Mama's Fish House Apr 13 7pm", time: h(36), domain: "travel", type: "commitment" },
];

const continuityChecks = [
  { module: "Task Persistence", status: "healthy" as const, verified: true, lastCheck: h(0.1), evidence: "5/5 tasks persisted in DB, 0 orphaned" },
  { module: "Travel Itinerary Sync", status: "healthy" as const, verified: true, lastCheck: h(0.5), evidence: "All bookings confirmed, 0 conflicts" },
  { module: "Calendar Integration", status: "healthy" as const, verified: true, lastCheck: h(0.1), evidence: "8 events synced, bi-directional" },
  { module: "Grocery List Sync", status: "degraded" as const, verified: false, lastCheck: h(24), evidence: "Last sync 24h ago — connector stale" },
  { module: "Appointment Reminders", status: "healthy" as const, verified: true, lastCheck: h(0.2), evidence: "3 upcoming reminders scheduled" },
  { module: "Bill Payment Tracking", status: "healthy" as const, verified: true, lastCheck: h(1), evidence: "3 bills tracked, 1 due soon" },
];

const serviceProviderSLA = [
  { provider: "Airport Transfer Service", slaTarget: "24h confirmation", met: true, lastInteraction: h(12), responseTime: "2h" },
  { provider: "Insurance Broker", slaTarget: "48h quote turnaround", met: true, lastInteraction: h(2), responseTime: "4h" },
  { provider: "Restaurant Reservations", slaTarget: "Instant confirmation", met: true, lastInteraction: h(36), responseTime: "instant" },
  { provider: "Medical Scheduling", slaTarget: "Same-day callback", met: false, lastInteraction: h(24), responseTime: "pending" },
  { provider: "School Admin Office", slaTarget: "3-day processing", met: true, lastInteraction: h(4), responseTime: "2 days" },
];

const crossModuleHealth = [
  { integration: "Calendar ↔ Tasks", status: "healthy" as const, evidence: "Due dates synced for 3 tasks" },
  { integration: "Calendar ↔ Travel", status: "healthy" as const, evidence: "All flights/hotels on calendar" },
  { integration: "Tasks ↔ Receipts", status: "healthy" as const, evidence: "3/5 tasks have receipts" },
  { integration: "Travel ↔ Expenses", status: "healthy" as const, evidence: "Booking costs tracked" },
  { integration: "Grocery ↔ Inventory", status: "degraded" as const, evidence: "Stale sync — no recent update" },
];

export default function ConciergeCommandCenter() {
  const [tab, setTab] = useState("tasks");
  const active = tasks.filter(t => t.status !== "completed").length;
  const urgent = tasks.filter(t => t.priority === "high" && t.status !== "completed").length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl space-y-6 p-6">
<SitaPageHeader title="Concierge Command Center" subtitle="Task continuity, household state, travel execution, SLA tracking, cross-module health, and commitment feed" />

      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Active Tasks", value: active, color: "text-foreground" },
          { label: "Urgent", value: urgent, color: urgent > 0 ? "text-red-400" : "text-green-400" },
          { label: "Completed", value: tasks.filter(t => t.status === "completed").length, color: "text-green-400" },
          { label: "Commitments", value: receiptFeed.filter(r => r.type === "commitment").length, color: "text-blue-400" },
          { label: "Continuity", value: `${continuityChecks.filter(c => c.status === "healthy").length}/${continuityChecks.length}`, color: "text-green-400" },
          { label: "SLA Met", value: `${serviceProviderSLA.filter(s => s.met).length}/${serviceProviderSLA.length}`, color: "text-green-400" },
        ].map((k, i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardContent className="p-3 text-center">
              <p className={cn("text-2xl font-bold", k.color)}>{k.value}</p>
              <p className="text-[9px] text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5 flex-wrap">
          {[
            { value: "tasks", label: "Tasks", icon: CheckCircle },
            { value: "household", label: "Household", icon: Home },
            { value: "travel", label: "Travel", icon: Plane },
            { value: "continuity", label: "Continuity", icon: Activity },
            { value: "sla", label: "SLA Tracking", icon: Clock },
            { value: "crossmod", label: "Cross-Module", icon: Link2 },
            { value: "receipts", label: "Receipts", icon: FileCheck },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-[10px] h-7 px-2.5 gap-1"><t.icon className="h-3 w-3" />{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4 space-y-3">
          <TabsContent value="tasks">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg mb-2">
                <div className="flex items-center gap-3">
                  {task.status === "completed" ? <CheckCircle className="w-4 h-4 text-green-400" /> :
                   task.priority === "high" ? <AlertTriangle className="w-4 h-4 text-red-400" /> :
                   <Clock className="w-4 h-4 text-muted-foreground" />}
                  <div>
                    <p className="text-xs font-medium text-foreground">{task.title}</p>
                    <p className="text-[10px] text-muted-foreground">{task.domain} • {task.assignee}{task.dueDate ? ` • Due ${task.dueDate}` : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {task.completionPct > 0 && task.completionPct < 100 && <Progress value={task.completionPct} className="w-16 h-1.5" />}
                  <DurabilityStateBadge state={task.durability} compact />
                  {task.receiptId && <Badge variant="outline" className="text-[8px]"><FileCheck className="w-2 h-2 mr-0.5" />Receipted</Badge>}
                  <Badge variant={task.status === "completed" ? "default" : task.priority === "high" ? "destructive" : "secondary"} className="text-[9px] capitalize">{task.status}</Badge>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="household">
            {householdState.map(area => (
              <div key={area.area} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg mb-2">
                <div className="flex items-center gap-3">
                  <Home className="w-3.5 h-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium text-foreground">{area.area}</p>
                    <p className="text-[10px] text-muted-foreground">{area.items} items tracked{area.urgent > 0 ? ` • ${area.urgent} urgent` : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {area.urgent > 0 && <Badge variant="destructive" className="text-[9px]">{area.urgent} urgent</Badge>}
                  <StalenessIndicator lastUpdated={area.lastSync} thresholdSeconds={3600} />
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="travel">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-2"><Plane className="w-4 h-4 text-primary" />Hawaii Trip — Apr 12–18</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {travelItinerary.map(day => (
                  <div key={day.day}>
                    <p className="text-[10px] font-semibold text-primary mb-1">{day.day}</p>
                    <div className="space-y-1 pl-3 border-l border-primary/20">
                      {day.items.map((item, i) => (
                        <p key={i} className="text-xs text-foreground">{item}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="continuity">
            <h3 className="text-xs font-semibold mb-3">State Persistence Verification</h3>
            <div className="space-y-1.5">
              {continuityChecks.map(c => (
                <div key={c.module} className="flex items-center justify-between p-2.5 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    {c.status === "healthy" ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                    <div>
                      <p className="text-[10px] font-medium text-foreground">{c.module}</p>
                      <p className="text-[9px] text-muted-foreground">{c.evidence}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={c.status === "healthy" ? "default" : "secondary"} className="text-[9px] capitalize">{c.status}</Badge>
                    <StalenessIndicator lastUpdated={c.lastCheck} thresholdSeconds={3600} />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sla">
            <h3 className="text-xs font-semibold mb-3">Service Provider SLA Compliance</h3>
            <div className="space-y-1.5">
              {serviceProviderSLA.map(s => (
                <div key={s.provider} className="flex items-center justify-between p-2.5 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    {s.met ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                    <div>
                      <p className="text-[10px] font-medium text-foreground">{s.provider}</p>
                      <p className="text-[9px] text-muted-foreground">SLA: {s.slaTarget} • Response: {s.responseTime}</p>
                    </div>
                  </div>
                  <Badge variant={s.met ? "default" : "destructive"} className="text-[9px]">{s.met ? "Met" : "Missed"}</Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="crossmod">
            <h3 className="text-xs font-semibold mb-3">Cross-Module Integration Health</h3>
            <div className="space-y-1.5">
              {crossModuleHealth.map(cm => (
                <div key={cm.integration} className="flex items-center justify-between p-2.5 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    {cm.status === "healthy" ? <Link2 className="w-3.5 h-3.5 text-green-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                    <div>
                      <p className="text-[10px] font-medium text-foreground">{cm.integration}</p>
                      <p className="text-[9px] text-muted-foreground">{cm.evidence}</p>
                    </div>
                  </div>
                  <Badge variant={cm.status === "healthy" ? "default" : "secondary"} className="text-[9px] capitalize">{cm.status}</Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="receipts">
            <div className="relative pl-4 border-l border-border/40 space-y-2">
              {receiptFeed.map((r, i) => (
                <div key={i} className="relative">
                  <div className={cn("absolute -left-[21px] w-2.5 h-2.5 rounded-full border-2",
                    r.type === "commitment" ? "bg-blue-400 border-blue-500" :
                    r.type === "promise" ? "bg-amber-400 border-amber-500" :
                    "bg-primary border-primary/50"
                  )} />
                  <div className="p-2.5 bg-muted/20 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-xs text-foreground">{r.action}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[8px]">{r.domain}</Badge>
                        <Badge variant="outline" className="text-[8px] capitalize">{r.type}</Badge>
                      </div>
                    </div>
                    <StalenessIndicator lastUpdated={r.time} thresholdSeconds={3600} />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}