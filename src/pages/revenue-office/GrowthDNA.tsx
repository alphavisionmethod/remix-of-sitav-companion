import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dna, TrendingUp, Users, Calendar, Star, Megaphone, Repeat, ShoppingBag, Handshake } from "lucide-react";

const growthPatterns = [
  { pattern: "Appointment-Driven", strength: 82, icon: Calendar, color: "text-blue-400", desc: "Most conversions come through booked calls and consultations" },
  { pattern: "Relationship-Led", strength: 74, icon: Handshake, color: "text-emerald-400", desc: "Strong referral and repeat business signals" },
  { pattern: "Reputation-Led", strength: 68, icon: Star, color: "text-amber-400", desc: "Reviews and social proof drive significant inbound" },
  { pattern: "Nurture-Heavy", strength: 61, icon: Repeat, color: "text-purple-400", desc: "Email sequences contribute to most conversions" },
  { pattern: "Founder-Led Sales", strength: 55, icon: Users, color: "text-pink-400", desc: "Personal outreach still drives a meaningful share" },
  { pattern: "Launch-Driven", strength: 38, icon: Megaphone, color: "text-cyan-400", desc: "Periodic launches create revenue spikes" },
  { pattern: "Product-Led", strength: 22, icon: ShoppingBag, color: "text-orange-400", desc: "Self-service product purchases are a small share" },
];

const insights = [
  "Your business grows best through booked appointments and personal relationships — protect calendar utilization",
  "Reputation is a growing driver — invest in review campaigns to accelerate this natural strength",
  "Launch-driven growth is underutilized — consider structured quarterly launches",
  "Product-led growth is weak — self-service checkout may benefit from UX improvements",
];

export default function GrowthDNA() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Growth DNA</h1>
        <p className="text-muted-foreground">Your business's natural growth pattern — what strategies fit, what's out of character</p>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4 flex items-center gap-3">
          <Dna className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Primary Growth Mode: <span className="text-blue-400">Appointment-Driven</span> + <span className="text-emerald-400">Relationship-Led</span></p>
            <p className="text-xs text-muted-foreground">Based on conversion attribution, revenue sources, and behavioral patterns</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />Growth Pattern Strength</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {growthPatterns.map((p) => (
            <div key={p.pattern} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p.icon className={`h-4 w-4 ${p.color}`} />
                  <span className="text-sm font-medium text-foreground">{p.pattern}</span>
                </div>
                <span className="text-xs text-muted-foreground">{p.strength}%</span>
              </div>
              <Progress value={p.strength} className="h-1.5" />
              <p className="text-xs text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="text-sm">Strategic Insights</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              {insight}
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
