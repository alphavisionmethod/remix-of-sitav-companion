import { Typography } from "@/components/sita/Typography";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GraduationCap, Users, BookOpen, PlayCircle, Star, TrendingUp, AlertTriangle, Clock, Calendar, BarChart3, Zap } from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
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
  const [tab, setTab] = useState("courses");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
<div>
        <Typography role="appTitle">Membership & Course Office</Typography>
        <p className="text-muted-foreground">Courses, memberships, engagement, retention, and student journey intelligence</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Members", value: "609", icon: Users, color: "text-blue-400" },
          { label: "Total Courses", value: "4", icon: BookOpen, color: "text-emerald-400" },
          { label: "Avg Completion", value: "67%", icon: PlayCircle, color: "text-amber-400" },
          { label: "Monthly Revenue", value: "$12,810", icon: TrendingUp, color: "text-purple-400" },
        ].map(s => (
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

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5">
          <TabsTrigger value="courses" className="text-[10px] h-7 px-2.5 gap-1"><GraduationCap className="h-3 w-3" />Courses</TabsTrigger>
          <TabsTrigger value="memberships" className="text-[10px] h-7 px-2.5 gap-1"><Users className="h-3 w-3" />Memberships</TabsTrigger>
          <TabsTrigger value="drip" className="text-[10px] h-7 px-2.5 gap-1"><Calendar className="h-3 w-3" />Drip Schedule</TabsTrigger>
          <TabsTrigger value="engagement" className="text-[10px] h-7 px-2.5 gap-1"><BarChart3 className="h-3 w-3" />Engagement</TabsTrigger>
          <TabsTrigger value="dropoff" className="text-[10px] h-7 px-2.5 gap-1"><AlertTriangle className="h-3 w-3" />Drop-off</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          {/* Courses */}
          <TabsContent value="courses">
            <Card className="bg-card/50 border-border/50">
              <CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-blue-400" />Course Library</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {([] as any[]).map((c: any) => (
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
          </TabsContent>

          {/* Memberships */}
          <TabsContent value="memberships">
            <Card className="bg-card/50 border-border/50">
              <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-emerald-400" />Membership Tiers</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                {memberships.map(m => (
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
          </TabsContent>

          {/* Drip Schedule */}
          <TabsContent value="drip">
            <Card className="bg-card/50 border-border/50">
              <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" />Content Drip Schedule</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {([] as any[]).map((d, i) => (
                  <div key={d.module} className="p-3 rounded-lg bg-background/50 border border-border/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${d.status === "released" ? "bg-primary/20 text-primary" : "bg-muted/30 text-muted-foreground"}`}>
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{d.module}</p>
                        <p className="text-xs text-muted-foreground">Day {d.releaseDay} · {d.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {d.completionRate > 0 && (
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">{d.completionRate}%</p>
                          <p className="text-[10px] text-muted-foreground">completion</p>
                        </div>
                      )}
                      <Badge variant={d.status === "released" ? "default" : "secondary"} className="text-[10px]">{d.status}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Engagement Heatmap */}
          <TabsContent value="engagement">
            <Card className="bg-card/50 border-border/50">
              <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-purple-400" />Engagement Heatmap</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-muted-foreground">
                        <th className="text-left p-2">Module</th>
                        <th className="p-2 text-center">Week 1</th>
                        <th className="p-2 text-center">Week 2</th>
                        <th className="p-2 text-center">Week 3</th>
                        <th className="p-2 text-center">Week 4</th>
                      </tr>
                    </thead>
                    <tbody>
                      {([] as any[]).map(row => (
                        <tr key={row.module} className="border-t border-border/20">
                          <td className="p-2 text-foreground font-medium">{row.module}</td>
                          {[row.week1, row.week2, row.week3, row.week4].map((val, j) => {
                            const opacity = val / 100;
                            const color = val >= 70 ? "bg-emerald-500" : val >= 50 ? "bg-amber-500" : "bg-red-500";
                            return (
                              <td key={j} className="p-2 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <div className={`w-6 h-6 rounded ${color} flex items-center justify-center text-[10px] font-bold text-foreground`} style={{ opacity: Math.max(0.3, opacity) }}>
                                    {val}
                                  </div>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Advisor recommends adding recap emails at drop-off points between Week 2-3
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Drop-off Detection */}
          <TabsContent value="dropoff">
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
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}
