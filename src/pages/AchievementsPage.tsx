// ═══════════════════════════════════════════════════════════════
// SITA OS — Achievement & Gamification Layer
// XP, levels, streaks, trophy room
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Trophy, Star, Flame, Zap, Target, Shield, Crown, Rocket,
  TrendingUp, Award, Medal, Lock, CheckCircle2
} from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import type { LucideIcon } from "lucide-react";

// ─── Demo data ───
const USER_STATS = { xp: 4280, level: 12, streak: 7, totalDecisions: 156, platformsConnected: 8 };
const XP_FOR_NEXT = 5000;

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  xp: number;
  unlocked: boolean;
  unlockedAt?: string;
  category: "milestones" | "mastery" | "streaks" | "social";
  rarity: "common" | "rare" | "epic" | "legendary";
}

const ACHIEVEMENTS: Achievement[] = [
  { id: "a1", title: "First Decision", description: "Made your first approval", icon: CheckCircle2, xp: 50, unlocked: true, unlockedAt: "2025-12-01", category: "milestones", rarity: "common" },
  { id: "a2", title: "Money Master", description: "Connected 3+ financial accounts", icon: TrendingUp, xp: 200, unlocked: true, unlockedAt: "2025-12-15", category: "milestones", rarity: "rare" },
  { id: "a3", title: "Week Warrior", description: "7-day login streak", icon: Flame, xp: 300, unlocked: true, unlockedAt: "2026-01-08", category: "streaks", rarity: "rare" },
  { id: "a4", title: "Boardroom Regular", description: "Completed 10 weekly reviews", icon: Crown, xp: 500, unlocked: true, unlockedAt: "2026-02-20", category: "mastery", rarity: "epic" },
  { id: "a5", title: "Integration Pro", description: "Connected 5+ platforms", icon: Zap, xp: 400, unlocked: true, unlockedAt: "2026-03-01", category: "milestones", rarity: "epic" },
  { id: "a6", title: "Trust Builder", description: "100% advisor accuracy for 30 days", icon: Shield, xp: 1000, unlocked: false, category: "mastery", rarity: "legendary" },
  { id: "a7", title: "Rocket Growth", description: "Revenue grew 50% in one quarter", icon: Rocket, xp: 800, unlocked: false, category: "milestones", rarity: "legendary" },
  { id: "a8", title: "Data Driven", description: "Viewed 50+ proof receipts", icon: Target, xp: 250, unlocked: true, unlockedAt: "2026-03-15", category: "mastery", rarity: "rare" },
  { id: "a9", title: "Month Streak", description: "30-day login streak", icon: Flame, xp: 600, unlocked: false, category: "streaks", rarity: "epic" },
  { id: "a10", title: "Centurion", description: "Made 100 decisions", icon: Medal, xp: 500, unlocked: true, unlockedAt: "2026-04-01", category: "milestones", rarity: "epic" },
];

const rarityColors = {
  common: "from-slate-400 to-slate-500",
  rare: "from-blue-400 to-cyan-400",
  epic: "from-[hsl(var(--sita-purple))] to-[hsl(var(--sita-purple-light))]",
  legendary: "from-[hsl(var(--sita-gold))] to-orange-400",
};

const rarityGlow = {
  common: "transparent",
  rare: "rgba(59,130,246,0.15)",
  epic: "hsl(var(--sita-purple) / 0.15)",
  legendary: "hsl(var(--sita-gold) / 0.2)",
};

const rarityLabel = {
  common: "text-muted-foreground",
  rare: "text-blue-400",
  epic: "text-[hsl(var(--sita-purple-light))]",
  legendary: "text-[hsl(var(--sita-gold))]",
};

// ─── XP Bar ───
function XPBar() {
  const animatedXP = useCountUp(USER_STATS.xp, 1000);
  const pct = (USER_STATS.xp / XP_FOR_NEXT) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/40 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[hsl(var(--sita-gold))] to-orange-400 flex items-center justify-center shadow-lg">
            <Star className="h-6 w-6 text-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Founder Level</p>
            <p className="text-2xl font-bold text-foreground">{USER_STATS.level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total XP</p>
          <p className="text-lg font-mono font-semibold text-foreground">{animatedXP.toLocaleString()}</p>
        </div>
      </div>

      {/* XP progress bar */}
      <div className="relative h-3 bg-muted/30 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[hsl(var(--sita-gold))] to-orange-400"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <motion.div
            className="absolute right-0 top-0 bottom-0 w-6 bg-white/30 rounded-full"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1.5 text-right">
        {USER_STATS.xp.toLocaleString()} / {XP_FOR_NEXT.toLocaleString()} XP to Level {USER_STATS.level + 1}
      </p>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {[
          { icon: Flame, label: "Streak", value: `${USER_STATS.streak} days`, color: "text-orange-400" },
          { icon: Target, label: "Decisions", value: USER_STATS.totalDecisions.toString(), color: "text-[hsl(var(--sita-purple))]" },
          { icon: Zap, label: "Connected", value: `${USER_STATS.platformsConnected} platforms`, color: "text-[hsl(var(--trust-safe))]" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="text-center p-2 rounded-xl bg-muted/20"
          >
            <stat.icon className={cn("h-4 w-4 mx-auto mb-1", stat.color)} />
            <p className="text-xs font-semibold text-foreground">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Achievement Card ───
function AchievementCard({ achievement, index }: { achievement: Achievement; index: number }) {
  const Icon = achievement.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 + index * 0.05 }}
      whileHover={{ scale: achievement.unlocked ? 1.03 : 1 }}
      className={cn(
        "relative rounded-2xl p-4 border transition-all cursor-pointer group overflow-hidden",
        achievement.unlocked
          ? "bg-card/60 backdrop-blur-xl border-border/40 hover:border-[hsl(var(--sita-purple)/0.4)]"
          : "bg-muted/20 border-border/20 opacity-60"
      )}
      style={achievement.unlocked ? { boxShadow: `0 4px 30px ${rarityGlow[achievement.rarity]}` } : {}}
    >
      {/* Rarity glow on hover */}
      {achievement.unlocked && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: `radial-gradient(circle at 50% 50%, ${rarityGlow[achievement.rarity]}, transparent 70%)` }}
        />
      )}

      <div className="relative z-10 flex items-start gap-3">
        <div className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0",
          achievement.unlocked
            ? `bg-gradient-to-br ${rarityColors[achievement.rarity]}`
            : "bg-muted/40"
        )}>
          {achievement.unlocked ? (
            <Icon className="h-5 w-5 text-foreground" />
          ) : (
            <Lock className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={cn("text-sm font-semibold truncate", achievement.unlocked ? "text-foreground" : "text-muted-foreground")}>
              {achievement.title}
            </h4>
            <span className={cn("text-[9px] uppercase tracking-wider font-bold", rarityLabel[achievement.rarity])}>
              {achievement.rarity}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">{achievement.description}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] font-mono text-[hsl(var(--sita-gold))]">+{achievement.xp} XP</span>
            {achievement.unlockedAt && (
              <span className="text-[10px] text-muted-foreground/60">{achievement.unlockedAt}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AchievementsPage() {
  const [filter, setFilter] = useState<"all" | "milestones" | "mastery" | "streaks">("all");
  const filtered = filter === "all" ? ACHIEVEMENTS : ACHIEVEMENTS.filter(a => a.category === filter);
  const unlockedCount = ACHIEVEMENTS.filter(a => a.unlocked).length;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[150px]"
          style={{ background: "hsl(var(--sita-gold) / 0.04)" }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[hsl(var(--sita-gold))] to-orange-400 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Achievements</h1>
            <p className="text-xs text-muted-foreground">{unlockedCount}/{ACHIEVEMENTS.length} unlocked</p>
          </div>
        </motion.div>

        {/* XP Bar */}
        <XPBar />

        {/* Filter tabs */}
        <div className="flex gap-1 bg-muted/30 rounded-xl p-1 w-fit">
          {(["all", "milestones", "mastery", "streaks"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize",
                filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Achievement grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((a, i) => (
            <AchievementCard key={a.id} achievement={a} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
