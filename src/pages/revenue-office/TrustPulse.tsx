import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, Star, Clock, MessageCircle, CheckCircle, AlertTriangle, Heart, TrendingUp } from "lucide-react";

const trustSignals = [
  { label: "Review Sentiment", score: 87, trend: "+3%", icon: Star, color: "text-amber-400" },
  { label: "Follow-up Responsiveness", score: 92, trend: "+1%", icon: Clock, color: "text-blue-400" },
  { label: "Appointment Reliability", score: 95, trend: "stable", icon: CheckCircle, color: "text-emerald-400" },
  { label: "Delivery Consistency", score: 88, trend: "-2%", icon: Heart, color: "text-pink-400" },
  { label: "Onboarding Quality", score: 79, trend: "+5%", icon: TrendingUp, color: "text-purple-400" },
  { label: "Response Time", score: 84, trend: "+4%", icon: MessageCircle, color: "text-cyan-400" },
];

const issues = [
  { signal: "3 unresolved negative reviews (>7 days)", severity: "high", action: "Respond and recover" },
  { signal: "Average response time increased to 18hrs", severity: "medium", action: "Review team capacity" },
  { signal: "2 onboarding sequences have >20% drop-off", severity: "medium", action: "Simplify onboarding flow" },
];

export default function TrustPulse() {
  const overallScore = Math.round(trustSignals.reduce((a, s) => a + s.score, 0) / trustSignals.length);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Trust & Reputation Pulse</h1>
        <p className="text-muted-foreground">Unified commercial trust posture — reviews, responsiveness, reliability, and delivery</p>
      </div>

      {/* Overall Trust Score */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6 flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-emerald-500/30 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{overallScore}</p>
                <p className="text-[10px] text-muted-foreground">/ 100</p>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-5 w-5 text-emerald-400" />
              <span className="text-lg font-semibold text-foreground">Commercial Trust Score</span>
              <Badge className="bg-emerald-500/10 text-emerald-400 text-[10px]">Strong</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Based on 6 real-time trust signals across reviews, delivery, responsiveness, and reliability</p>
          </div>
        </CardContent>
      </Card>

      {/* Trust Signals Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {trustSignals.map((s) => (
          <Card key={s.label} className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                  <span className="text-xs font-medium text-foreground">{s.label}</span>
                </div>
                <Badge variant="secondary" className="text-[10px]">{s.trend}</Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Score</span>
                  <span className="font-medium text-foreground">{s.score}/100</span>
                </div>
                <Progress value={s.score} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trust Issues */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-400" />Trust Issues Requiring Attention</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {issues.map((issue, i) => (
            <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/30 flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">{issue.signal}</p>
                <p className="text-xs text-muted-foreground">Recommended: {issue.action}</p>
              </div>
              <Badge variant={issue.severity === "high" ? "destructive" : "secondary"} className="text-[10px]">{issue.severity}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
