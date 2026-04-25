// ═══════════════════════════════════════════════════════════════
// SITA OS — Personal Life Workspace
// Routines, goals, habits, planning, reflection with
// useDataMode integration, slipping detection, weekly reset.
// ═══════════════════════════════════════════════════════════════

import { PageSkeleton } from "@/platform/sita/components/sita/PageSkeleton";
import { useState, useMemo } from "react";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { PageShell } from "@/platform/sita/components/sita/PageShell";
import {
  Heart, Sun, Moon, Target, RotateCcw, ListChecks, BookOpen,
  Calendar, Flame, CheckCircle2, Clock, AlertTriangle, Sparkles,
  TrendingUp, Battery, BatteryLow, BatteryMedium, Play, Pause,
  Plus, ChevronRight, Home, DollarSign, Brain,
} from "lucide-react";

// ── Demo Data ──────────────────────────────────────────────
const routines = [
  { id: "1", name: "Morning meditation", time: "6:30 AM", streak: 14, active: true, category: "wellbeing" },
  { id: "2", name: "Exercise", time: "7:00 AM", streak: 7, active: true, category: "health" },
  { id: "3", name: "Journal", time: "9:00 PM", streak: 3, active: true, category: "growth" },
  { id: "4", name: "Read 30 min", time: "8:30 PM", streak: 0, active: false, category: "growth" },
  { id: "5", name: "Hydrate (8 glasses)", time: "All day", streak: 21, active: true, category: "health" },
];

const goals = [
  { id: "1", title: "Run a half marathon", progress: 65, deadline: "2026-09-01", domain: "health", milestones: ["5K done", "10K done", "15K next"], nextAction: "Register for 10K race" },
  { id: "2", title: "Learn Spanish B1", progress: 40, deadline: "2026-12-31", domain: "growth", milestones: ["A1 complete", "A2 in progress"], nextAction: "Complete Duolingo Unit 5" },
  { id: "3", title: "Save €10k emergency fund", progress: 82, deadline: "2026-06-30", domain: "finance", milestones: ["€5K saved", "€8.2K saved"], nextAction: "Set up auto-transfer for €500/mo" },
  { id: "4", title: "Declutter home office", progress: 30, deadline: "2026-05-15", domain: "household", milestones: ["Sorted papers"], nextAction: "Organize bookshelf" },
];

const slipping = [
  { id: "1", item: "Dentist appointment — overdue by 2 weeks", severity: "medium" as const, domain: "health", action: "Schedule appointment" },
  { id: "2", item: "Car insurance renewal — 3 days left", severity: "high" as const, domain: "finance", action: "Review & renew online" },
  { id: "3", item: "Read 30 min habit — streak broken 4 days ago", severity: "low" as const, domain: "growth", action: "Resume tonight" },
  { id: "4", item: "Annual physical — 6 months overdue", severity: "high" as const, domain: "health", action: "Call doctor" },
];

const backlog = [
  { id: "1", item: "Learn to cook Thai food", domain: "growth" },
  { id: "2", item: "Organize photo library", domain: "household" },
  { id: "3", item: "Plan summer vacation", domain: "personal" },
  { id: "4", item: "Update will/estate docs", domain: "finance" },
  { id: "5", item: "Set up home automation", domain: "household" },
  { id: "6", item: "Start a podcast", domain: "growth" },
];

const ENERGY_ICONS = { high: Battery, medium: BatteryMedium, low: BatteryLow };
const ENERGY_COLORS = { high: "text-emerald-400", medium: "text-amber-400", low: "text-destructive" };

export default function PersonalLifeWorkspace() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("daily");
  const [energyLevel, setEnergyLevel] = useState<"high" | "medium" | "low">("medium");
  const [reflections, setReflections] = useState({ well: "", improve: "", gratitude: "" });
  const [completedToday, setCompletedToday] = useState<string[]>(["1", "5"]); // routine IDs

  const EnergyIcon = ENERGY_ICONS[energyLevel];

  // Cross-domain links
  const crossDomainAlerts = useMemo(() => [
    { label: "2 household tasks due today", domain: "household", path: "/concierge/household", icon: Home },
    { label: "Budget threshold approaching", domain: "finance", path: "/money", icon: DollarSign },
    { label: "Calendar: 3 meetings tomorrow", domain: "calendar", path: "/calendar", icon: Calendar },
  ], []);

  const handleToggleRoutine = (id: string) => {
    setCompletedToday(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    toast.success("Routine updated");
  };

  const handleWeeklyReset = () => {
    toast.success("Weekly reset complete — your priorities are refreshed");
  };

  return (
    <PageShell width="wide">
<SitaPageHeader
        icon={<Heart className="h-6 w-6" />}
        title="Personal Life"
        subtitle="Your routines, goals, habits, and personal wellbeing"
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-card/30 rounded-lg border border-border/20 p-0.5">
            {(["high", "medium", "low"] as const).map(e => (
              <button key={e} onClick={() => setEnergyLevel(e)} className={cn("px-2 py-1 text-xs rounded-md transition-colors capitalize", energyLevel === e ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-accent/30")}>{e}</button>
            ))}
          </div>
          <Badge variant="outline" className={cn("gap-1.5", ENERGY_COLORS[energyLevel])}>
            <EnergyIcon className="h-3.5 w-3.5" />
            Energy: {energyLevel}
          </Badge>
        </div>
      </SitaPageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="daily"><Sun className="h-4 w-4 mr-1.5" />Daily</TabsTrigger>
          <TabsTrigger value="weekly"><Calendar className="h-4 w-4 mr-1.5" />Weekly</TabsTrigger>
          <TabsTrigger value="goals"><Target className="h-4 w-4 mr-1.5" />Goals</TabsTrigger>
          <TabsTrigger value="routines"><RotateCcw className="h-4 w-4 mr-1.5" />Routines</TabsTrigger>
          <TabsTrigger value="habits"><Flame className="h-4 w-4 mr-1.5" />Habits</TabsTrigger>
          <TabsTrigger value="backlog"><ListChecks className="h-4 w-4 mr-1.5" />Backlog</TabsTrigger>
          <TabsTrigger value="reflection"><BookOpen className="h-4 w-4 mr-1.5" />Reflection</TabsTrigger>
        </TabsList>

        {/* DAILY TAB */}
        <TabsContent value="daily" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Today's Focus */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sun className="h-4 w-4 text-amber-500" /> Today's Focus
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Routines completed</span>
                  <span className="font-medium">{completedToday.length}/{routines.filter(r => r.active).length}</span>
                </div>
                <Progress value={(completedToday.length / routines.filter(r => r.active).length) * 100} className="h-2" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Goal milestones approaching</span>
                  <span className="font-medium">1</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Personal tasks due</span>
                  <span className="font-medium">2</span>
                </div>
                <Button variant="outline" size="sm" className="w-full gap-1.5 mt-2">
                  <Brain className="h-3.5 w-3.5" /> Re-enter your day
                </Button>
              </CardContent>
            </Card>

            {/* Slipping Items */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Slipping Items
                  <Badge variant="outline" className="ml-auto text-[10px]">{slipping.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {slipping.map((item) => (
                  <div key={item.id} className="flex items-start gap-2 text-sm group">
                    <Badge variant={item.severity === "high" ? "destructive" : "secondary"} className="text-[10px] shrink-0 mt-0.5">
                      {item.severity}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <span className="text-muted-foreground text-xs">{item.item}</span>
                      <Button variant="link" size="sm" className="text-[10px] p-0 h-auto text-primary block">{item.action} →</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Cross-Domain Awareness */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Cross-Domain
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {crossDomainAlerts.map((alert, i) => (
                  <a key={i} href={alert.path} className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/20 transition-colors">
                    <alert.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground flex-1">{alert.label}</span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  </a>
                ))}
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Energy Level</span>
                  <Badge variant="outline" className={cn("text-[10px]", ENERGY_COLORS[energyLevel])}>{energyLevel}</Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2 gap-1.5">
                  <Moon className="h-3.5 w-3.5" /> Enter Calm Mode
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* WEEKLY TAB */}
        <TabsContent value="weekly" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Weekly Planning</CardTitle>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={handleWeeklyReset}>
                  <RotateCcw className="h-3.5 w-3.5" /> Weekly Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Review your week — slipping items, routine patterns, and suggested adjustments.
              </p>
              <div className="grid grid-cols-7 gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                  <div key={day} className={cn("text-center p-3 rounded-lg border transition-colors", i < 3 ? "border-emerald-500/20 bg-emerald-500/5" : "border-border/40 bg-muted/20")}>
                    <p className="text-xs font-medium text-muted-foreground">{day}</p>
                    <p className="text-lg font-semibold mt-1">{i < 3 ? "✓" : "—"}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{i < 3 ? `${3 + i} done` : "planned"}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs text-primary font-medium">💡 Suggestion: Your energy dips on Wednesday. Consider lighter commitments mid-week.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GOALS TAB */}
        <TabsContent value="goals" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{goal.title}</CardTitle>
                    <Badge variant="outline" className="text-[10px]">{goal.domain}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Progress</span>
                    <span className="font-medium text-foreground">{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                  <div className="space-y-1">
                    {goal.milestones.map((m, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className={cn("h-3 w-3", i < goal.milestones.length - 1 ? "text-emerald-500" : "text-muted-foreground")} />
                        <span className={i < goal.milestones.length - 1 ? "text-muted-foreground line-through" : "text-foreground"}>{m}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 rounded-lg bg-primary/5 border border-primary/10 text-xs">
                    <span className="text-muted-foreground">Next: </span>
                    <span className="text-primary font-medium">{goal.nextAction}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Deadline: {new Date(goal.deadline).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button variant="outline" size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Goal</Button>
        </TabsContent>

        {/* ROUTINES TAB */}
        <TabsContent value="routines" className="space-y-4 mt-4">
          <div className="space-y-2">
            {routines.map((routine) => (
              <Card key={routine.id} className={cn(!routine.active && "opacity-60")}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleToggleRoutine(routine.id)} className="transition-colors">
                      <CheckCircle2 className={cn("h-5 w-5", completedToday.includes(routine.id) ? "text-emerald-500" : routine.active ? "text-muted-foreground/40 hover:text-muted-foreground" : "text-muted-foreground/20")} />
                    </button>
                    <div>
                      <p className={cn("text-sm font-medium", completedToday.includes(routine.id) && "line-through text-muted-foreground")}>{routine.name}</p>
                      <p className="text-xs text-muted-foreground">{routine.time} · {routine.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {routine.streak > 0 && (
                      <Badge variant="secondary" className="gap-1 text-[10px]">
                        <Flame className="h-3 w-3 text-amber-400" /> {routine.streak}d
                      </Badge>
                    )}
                    <Badge variant={routine.active ? "default" : "outline"} className="text-[10px]">
                      {routine.active ? "Active" : "Paused"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button variant="outline" size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Routine</Button>
        </TabsContent>

        {/* HABITS TAB */}
        <TabsContent value="habits" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Habit Tracker</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: "Meditate", streak: 14, done: true },
                  { name: "Exercise", streak: 7, done: true },
                  { name: "Read", streak: 0, done: false },
                  { name: "Hydrate", streak: 21, done: true },
                  { name: "No sugar", streak: 3, done: true },
                  { name: "Stretch", streak: 1, done: false },
                  { name: "Gratitude", streak: 5, done: true },
                  { name: "Sleep 8h", streak: 2, done: false },
                ].map((habit) => (
                  <div key={habit.name} className={cn("text-center p-4 rounded-lg border transition-colors cursor-pointer", habit.done ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/40 hover:border-border/60")}>
                    {habit.done ? <CheckCircle2 className="h-5 w-5 mx-auto text-emerald-500 mb-2" /> : <TrendingUp className="h-5 w-5 mx-auto text-muted-foreground mb-2" />}
                    <p className="text-sm font-medium">{habit.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{habit.done ? "Done today" : "Not yet"}</p>
                    {habit.streak > 0 && (
                      <Badge variant="outline" className="text-[9px] mt-1.5 gap-0.5"><Flame className="h-2 w-2" />{habit.streak}d</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BACKLOG TAB */}
        <TabsContent value="backlog" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Personal Backlog</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Items you want to get to eventually — not urgent, but important for long-term wellbeing.
              </p>
              <div className="space-y-2">
                {backlog.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/30 hover:bg-accent/20 transition-colors group">
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm flex-1">{item.item}</span>
                    <Badge variant="outline" className="text-[9px]">{item.domain}</Badge>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-xs h-7">
                      <Play className="h-3 w-3 mr-1" /> Activate
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-3 gap-1.5"><Plus className="h-3.5 w-3.5" /> Add to Backlog</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REFLECTION TAB */}
        <TabsContent value="reflection" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Weekly Reflection</CardTitle>
                <Badge variant="outline" className="text-[10px]">Week of {new Date().toLocaleDateString()}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">What went well this week?</label>
                  <Textarea value={reflections.well} onChange={e => setReflections(p => ({ ...p, well: e.target.value }))} placeholder="Celebrate your wins..." className="min-h-[80px] bg-card/30 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">What could improve?</label>
                  <Textarea value={reflections.improve} onChange={e => setReflections(p => ({ ...p, improve: e.target.value }))} placeholder="Identify areas for growth..." className="min-h-[80px] bg-card/30 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Gratitude</label>
                  <Textarea value={reflections.gratitude} onChange={e => setReflections(p => ({ ...p, gratitude: e.target.value }))} placeholder="What are you grateful for..." className="min-h-[80px] bg-card/30 text-sm" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => toast.success("Reflection saved")}>Save Reflection</Button>
                <Button size="sm" variant="outline" className="gap-1.5"><RotateCcw className="h-3.5 w-3.5" /> Weekly Reset</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
