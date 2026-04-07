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
  Users, Calendar, MapPin, Package, Heart, RotateCcw, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

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

export default function ConciergeCommandCenter() {
  const { isDemoMode } = useDataMode();
  const [tab, setTab] = useState("tasks");
  const active = tasks.filter(t => t.status !== "completed").length;
  const urgent = tasks.filter(t => t.priority === "high" && t.status !== "completed").length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl space-y-6 p-6">
      <DemoModeBadge />
      <SitaPageHeader title="Concierge Command Center" subtitle="Task continuity, household state, travel execution, commitment tracking, and receipt/promise feed" />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Active Tasks", value: active, color: "text-foreground" },
          { label: "Urgent", value: urgent, color: urgent > 0 ? "text-red-400" : "text-green-400" },
          { label: "Completed", value: tasks.filter(t => t.status === "completed").length, color: "text-green-400" },
          { label: "Commitments", value: receiptFeed.filter(r => r.type === "commitment").length, color: "text-blue-400" },
          { label: "Household Areas", value: householdState.length, color: "text-foreground" },
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
            { value: "tasks", label: "Task Tracker", icon: CheckCircle },
            { value: "household", label: "Household", icon: Home },
            { value: "travel", label: "Travel", icon: Plane },
            { value: "receipts", label: "Receipt Feed", icon: FileCheck },
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
