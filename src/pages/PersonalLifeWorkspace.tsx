import { useState } from "react";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart, Sun, Moon, Target, RotateCcw, ListChecks, BookOpen,
  Calendar, Flame, CheckCircle2, Clock, AlertTriangle, Sparkles,
  TrendingUp, Battery, BatteryLow,
} from "lucide-react";

// ── Mock Data ──────────────────────────────────────────────
const mockRoutines = [
  { id: "1", name: "Morning meditation", time: "6:30 AM", streak: 14, active: true },
  { id: "2", name: "Exercise", time: "7:00 AM", streak: 7, active: true },
  { id: "3", name: "Journal", time: "9:00 PM", streak: 3, active: true },
  { id: "4", name: "Read 30 min", time: "8:30 PM", streak: 0, active: false },
];

const mockGoals = [
  { id: "1", title: "Run a half marathon", progress: 65, deadline: "2026-09-01", domain: "health" },
  { id: "2", title: "Learn Spanish B1", progress: 40, deadline: "2026-12-31", domain: "growth" },
  { id: "3", title: "Save €10k emergency fund", progress: 82, deadline: "2026-06-30", domain: "finance" },
];

const mockSlipping = [
  { id: "1", item: "Dentist appointment — overdue by 2 weeks", severity: "medium" as const },
  { id: "2", item: "Car insurance renewal — 5 days left", severity: "high" as const },
  { id: "3", item: "Read 30 min habit — broken streak", severity: "low" as const },
];

export default function PersonalLifeWorkspace() {
  const [activeTab, setActiveTab] = useState("daily");
  const [energyLevel] = useState<"high" | "medium" | "low">("medium");

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <SitaPageHeader
        icon={<Heart className="h-6 w-6" />}
        title="Personal Life"
        subtitle="Your routines, goals, habits, and personal wellbeing"
      >
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            {energyLevel === "high" ? <Battery className="h-3.5 w-3.5" /> : <BatteryLow className="h-3.5 w-3.5" />}
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

        <TabsContent value="daily" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sun className="h-4 w-4 text-amber-500" /> Today's Focus
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">3 routines scheduled</p>
                <p className="text-sm text-muted-foreground">1 goal milestone approaching</p>
                <p className="text-sm text-muted-foreground">2 personal tasks due</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Slipping Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {mockSlipping.map((item) => (
                  <div key={item.id} className="flex items-start gap-2 text-sm">
                    <Badge variant={item.severity === "high" ? "destructive" : "secondary"} className="text-xs shrink-0">
                      {item.severity}
                    </Badge>
                    <span className="text-muted-foreground">{item.item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Energy & Focus
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Current energy</span>
                  <Badge variant="outline">{energyLevel}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Focus mode</span>
                  <Badge variant="outline">Normal</Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  <Moon className="h-3.5 w-3.5 mr-1.5" /> Enter Calm Mode
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Weekly Planning</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Plan your week ahead — review upcoming commitments, set priorities, and allocate energy across personal, family, and professional domains.
              </p>
              <div className="grid grid-cols-7 gap-2 mt-4">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <div key={day} className="text-center p-3 rounded-lg border border-border/40 bg-muted/20">
                    <p className="text-xs font-medium text-muted-foreground">{day}</p>
                    <p className="text-lg font-semibold mt-1">—</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockGoals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{goal.title}</CardTitle>
                    <Badge variant="outline">{goal.domain}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Deadline: {new Date(goal.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="routines" className="space-y-4 mt-4">
          <div className="space-y-3">
            {mockRoutines.map((routine) => (
              <Card key={routine.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className={`h-5 w-5 ${routine.active ? "text-emerald-500" : "text-muted-foreground"}`} />
                    <div>
                      <p className="text-sm font-medium">{routine.name}</p>
                      <p className="text-xs text-muted-foreground">{routine.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {routine.streak > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        <Flame className="h-3 w-3" /> {routine.streak}d
                      </Badge>
                    )}
                    <Badge variant={routine.active ? "default" : "outline"}>
                      {routine.active ? "Active" : "Paused"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="habits" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Habit Tracker</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track daily habits with streak counting, gentle nudges for broken streaks, and weekly/monthly progress views.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {["Meditate", "Exercise", "Read", "Hydrate"].map((habit) => (
                  <div key={habit} className="text-center p-4 rounded-lg border border-border/40">
                    <TrendingUp className="h-5 w-5 mx-auto text-primary mb-2" />
                    <p className="text-sm font-medium">{habit}</p>
                    <p className="text-xs text-muted-foreground mt-1">0/1 today</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backlog" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Personal Backlog</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Items you want to get to eventually — not urgent, but important for long-term wellbeing.
              </p>
              <div className="space-y-2 mt-4">
                {["Learn to cook Thai food", "Organize photo library", "Plan summer vacation", "Update will/estate docs"].map((item) => (
                  <div key={item} className="flex items-center gap-2 p-2 rounded border border-border/30">
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reflection" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Weekly Reflection</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Take a moment to reflect on your week — what went well, what could improve, and what you're grateful for.
              </p>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-xs font-medium text-muted-foreground mb-2">What went well this week?</p>
                  <p className="text-sm italic text-muted-foreground">No reflection recorded yet</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-xs font-medium text-muted-foreground mb-2">What could improve?</p>
                  <p className="text-sm italic text-muted-foreground">No reflection recorded yet</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Gratitude</p>
                  <p className="text-sm italic text-muted-foreground">No reflection recorded yet</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
