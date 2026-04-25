import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Activity, Moon, Dumbbell, Brain, Droplets, Apple, TrendingUp, Plus, Smile, Meh, Frown, Sun, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useHealthLogs } from "@/hooks/use-apps-data";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

const moodEmojis = [
  { icon: Frown, label: "Bad", color: "text-red-500" },
  { icon: Meh, label: "Okay", color: "text-amber-500" },
  { icon: Smile, label: "Good", color: "text-emerald-500" },
  { icon: Sun, label: "Great", color: "text-primary" },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export default function HealthApp() {
  const { data: liveData, isLoading } = useHealthLogs();
  const [selectedMood, setSelectedMood] = useState(2);
  const lifeScore = 78;
  const streak = 12;

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-4">
<div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Health & Wellness</h1>
        </div>
        <Badge variant="outline" className="gap-1 text-emerald-500 border-emerald-500/30">
          🔥 {streak} day streak
        </Badge>
      </div>

      {/* Life Score */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="relative h-20 w-20">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--primary))" strokeWidth="8" strokeDasharray={`${lifeScore * 2.51} 251`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-foreground">{lifeScore}</span>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Life Score</h2>
            <p className="text-xs text-muted-foreground">Based on sleep, exercise, mood & nutrition</p>
            <div className="flex items-center gap-1 mt-1 text-emerald-500 text-xs">
              <TrendingUp className="h-3 w-3" /> +3 from last week
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Mood */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">How are you feeling today?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-around">
            {moodEmojis.map((m, i) => (
              <button key={m.label} onClick={() => setSelectedMood(i)} className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${selectedMood === i ? "bg-primary/10 scale-110" : "hover:bg-muted/50"}`}>
                <m.icon className={`h-8 w-8 ${selectedMood === i ? m.color : "text-muted-foreground"}`} />
                <span className={`text-[10px] font-medium ${selectedMood === i ? "text-foreground" : "text-muted-foreground"}`}>{m.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
        <motion.div variants={fadeUp}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="h-4 w-4 text-indigo-500" />
                <span className="text-xs font-medium text-foreground">Sleep</span>
              </div>
              <p className="text-2xl font-bold text-foreground">7.8h</p>
              <p className="text-[10px] text-muted-foreground">Last night</p>
              <div className="flex items-end gap-0.5 h-8 mt-2">
                {([7.2, 6.8, 8.1, 7.5, 6.9, 7.8, 8.0] as number[]).map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className="w-full rounded-sm bg-indigo-500/30" style={{ height: `${(v / 10) * 100}%` }} />
                    <span className="text-[8px] text-muted-foreground">{weekDays[i]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-medium text-foreground">Steps</span>
              </div>
              <p className="text-2xl font-bold text-foreground">9,100</p>
              <p className="text-[10px] text-muted-foreground">Today · Goal: 10K</p>
              <Progress value={91} className="h-1.5 mt-2" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Dumbbell className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-medium text-foreground">Exercise</span>
              </div>
              <p className="text-2xl font-bold text-foreground">45 min</p>
              <p className="text-[10px] text-muted-foreground">Running · 5.2km</p>
              <div className="flex gap-1 mt-2">
                {weekDays.map((d, i) => (
                  <div key={d} className={`flex-1 h-2 rounded-full ${i < 5 ? "bg-amber-500" : "bg-muted"}`} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium text-foreground">Water</span>
              </div>
              <p className="text-2xl font-bold text-foreground">7/8</p>
              <p className="text-[10px] text-muted-foreground">Glasses today</p>
              <Progress value={87} className="h-1.5 mt-2" />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Quick Log */}
      <Card>
        <CardContent className="p-3">
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Dumbbell, label: "Exercise", color: "text-amber-500" },
              { icon: Apple, label: "Meal", color: "text-emerald-500" },
              { icon: Droplets, label: "Water", color: "text-blue-500" },
              { icon: Brain, label: "Mindfulness", color: "text-purple-500" },
            ].map(item => (
              <Button key={item.label} variant="outline" className="flex-col h-16 gap-1">
                <item.icon className={`h-5 w-5 ${item.color}`} />
                <span className="text-[10px]">{item.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
