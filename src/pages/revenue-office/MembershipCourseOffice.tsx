import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, Users, BookOpen, PlayCircle, Star, TrendingUp, AlertTriangle, Clock } from "lucide-react";

const courses = [
  { name: "Business Growth Masterclass", members: 342, completion: 67, modules: 12, rating: 4.8, status: "live", revenue: 28400, churnRisk: 8 },
  { name: "Marketing Foundations", members: 189, completion: 54, modules: 8, rating: 4.6, status: "live", revenue: 12600, churnRisk: 15 },
  { name: "Leadership Accelerator", members: 78, completion: 82, modules: 6, rating: 4.9, status: "live", revenue: 15600, churnRisk: 3 },
  { name: "Sales Playbook Pro", members: 0, completion: 0, modules: 10, rating: 0, status: "draft", revenue: 0, churnRisk: 0 },
];

const memberships = [
  { tier: "Premium", members: 156, mrr: 7800, churn: 3.2, retention: 96.8, trend: "up" },
  { tier: "Professional", members: 89, mrr: 2670, churn: 5.1, retention: 94.9, trend: "stable" },
  { tier: "Starter", members: 234, mrr: 2340, churn: 8.4, retention: 91.6, trend: "down" },
];

const dropOffPoints = [
  { course: "Marketing Foundations", module: "Module 4: Email Strategy", dropRate: 23, members: 43 },
  { course: "Business Growth Masterclass", module: "Module 8: Scaling Ops", dropRate: 18, members: 62 },
  { course: "Leadership Accelerator", module: "Module 3: Delegation", dropRate: 12, members: 9 },
];

export default function MembershipCourseOffice() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Membership & Course Office</h1>
        <p className="text-muted-foreground">Courses, memberships, engagement, retention, and student journey intelligence</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Members", value: "609", icon: Users, color: "text-blue-400" },
          { label: "Total Courses", value: "4", icon: BookOpen, color: "text-emerald-400" },
          { label: "Avg Completion", value: "67%", icon: PlayCircle, color: "text-amber-400" },
          { label: "Monthly Revenue", value: "$12,810", icon: TrendingUp, color: "text-purple-400" },
        ].map((s) => (
          <Card key={s.label} className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Courses */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-blue-400" />Course Library</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {courses.map((c) => (
            <div key={c.name} className="p-3 rounded-lg bg-background/50 border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground text-sm">{c.name}</span>
                  <Badge variant={c.status === "live" ? "default" : "secondary"} className="text-[10px]">{c.status}</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{c.members} members</span>
                  <span>{c.modules} modules</span>
                  {c.rating > 0 && <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-400" />{c.rating}</span>}
                </div>
              </div>
              {c.status === "live" && (
                <div className="flex items-center gap-3">
                  <Progress value={c.completion} className="flex-1 h-1.5" />
                  <span className="text-xs text-muted-foreground">{c.completion}% avg completion</span>
                  {c.churnRisk > 10 && <Badge variant="destructive" className="text-[10px]"><AlertTriangle className="h-3 w-3 mr-1" />{c.churnRisk}% drop-off risk</Badge>}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Memberships */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-emerald-400" />Membership Tiers</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          {memberships.map((m) => (
            <div key={m.tier} className="p-4 rounded-lg bg-background/50 border border-border/30">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-foreground">{m.tier}</span>
                <Badge variant={m.trend === "up" ? "default" : m.trend === "down" ? "destructive" : "secondary"} className="text-[10px]">{m.trend}</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Members</span><span className="text-foreground">{m.members}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">MRR</span><span className="text-foreground">${m.mrr.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Retention</span><span className="text-foreground">{m.retention}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Churn</span><span className={m.churn > 5 ? "text-red-400" : "text-foreground"}>{m.churn}%</span></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Drop-off Detection */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-400" />Student Drop-off Detection</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {dropOffPoints.map((d, i) => (
            <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/30 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{d.module}</p>
                <p className="text-xs text-muted-foreground">{d.course} · {d.members} students stalled</p>
              </div>
              <Badge variant="destructive" className="text-xs">{d.dropRate}% drop rate</Badge>
            </div>
          ))}
          <p className="text-xs text-muted-foreground italic flex items-center gap-1"><Clock className="h-3 w-3" />Advisor recommends adding recap emails at these checkpoints</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
