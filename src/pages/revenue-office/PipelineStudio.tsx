import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Target, DollarSign, Clock, TrendingUp, AlertTriangle, ArrowRight, Filter, Plus, MoreHorizontal, User, Calendar, Phone, Mail, Eye, Zap, BarChart3, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Deal = { id: string; name: string; value: number; probability: number; age: number; owner: string; contact: string; nextAction?: string; nextActionDate?: string; source: string; tags: string[] };

const STAGES: { name: string; color: string; deals: Deal[] }[] = [
  {
    name: "Prospecting", color: "border-l-blue-400",
    deals: [
      { id: "d1", name: "Apex Digital — Website Redesign", value: 15000, probability: 20, age: 3, owner: "You", contact: "Sarah Mitchell", nextAction: "Discovery call", nextActionDate: "Tomorrow", source: "Referral", tags: ["design", "high-value"] },
      { id: "d2", name: "Nova Labs — Consulting Package", value: 8500, probability: 15, age: 7, owner: "You", contact: "James Chen", nextAction: "Send proposal", nextActionDate: "Apr 8", source: "Website", tags: ["consulting"] },
      { id: "d3", name: "Clarity Inc — Strategy Sprint", value: 6000, probability: 10, age: 2, owner: "You", contact: "Anna Lee", source: "Cold outreach", tags: ["strategy"] },
    ],
  },
  {
    name: "Qualification", color: "border-l-amber-400",
    deals: [
      { id: "d4", name: "Summit Group — Annual Retainer", value: 36000, probability: 40, age: 12, owner: "You", contact: "Michael Park", nextAction: "Budget discussion", nextActionDate: "Apr 9", source: "Conference", tags: ["retainer", "enterprise"] },
      { id: "d5", name: "Bright Path — Coaching Program", value: 4800, probability: 35, age: 5, owner: "You", contact: "Emily Rodriguez", source: "Funnel", tags: ["coaching"] },
    ],
  },
  {
    name: "Proposal", color: "border-l-purple-400",
    deals: [
      { id: "d6", name: "Craft Studios — Brand Package", value: 22000, probability: 65, age: 18, owner: "You", contact: "Lisa Wang", nextAction: "Follow up on proposal", nextActionDate: "Today", source: "Referral", tags: ["branding", "high-value"] },
      { id: "d7", name: "Pinnacle Health — Digital Strategy", value: 14000, probability: 55, age: 10, owner: "You", contact: "David Chen", source: "Website", tags: ["strategy", "healthcare"] },
    ],
  },
  {
    name: "Negotiation", color: "border-l-emerald-400",
    deals: [
      { id: "d8", name: "Atlas Corp — Platform License", value: 48000, probability: 80, age: 25, owner: "You", contact: "Robert Kim", nextAction: "Contract review", nextActionDate: "Apr 7", source: "Inbound", tags: ["enterprise", "recurring"] },
      { id: "d9", name: "Green Valley — Implementation", value: 18500, probability: 75, age: 14, owner: "You", contact: "Kate Adams", source: "Upsell", tags: ["implementation"] },
    ],
  },
  {
    name: "Closed Won", color: "border-l-green-400",
    deals: [
      { id: "d10", name: "Mitchell Co — Q2 Services", value: 12400, probability: 100, age: 0, owner: "You", contact: "Tom Mitchell", source: "Repeat", tags: ["services"] },
    ],
  },
];

const LEAKS = [
  { deal: "Craft Studios — Brand Package", issue: "Proposal sent 18 days ago, no follow-up scheduled", severity: "high", lostRevenue: 22000 },
  { deal: "Atlas Corp — Platform License", issue: "In negotiation 25 days — above avg 15 days", severity: "medium", lostRevenue: 0 },
  { deal: "Nova Labs — Consulting Package", issue: "No next action defined", severity: "medium", lostRevenue: 8500 },
];

const VELOCITY = [
  { stage: "Prospecting → Qualification", avgDays: 8, target: 7, deals: 12 },
  { stage: "Qualification → Proposal", avgDays: 10, target: 10, deals: 8 },
  { stage: "Proposal → Negotiation", avgDays: 14, target: 12, deals: 5 },
  { stage: "Negotiation → Closed", avgDays: 18, target: 15, deals: 4 },
];

export default function PipelineStudio() {
  const [tab, setTab] = useState("kanban");
  const [filter, setFilter] = useState<string | null>(null);

  const allDeals = STAGES.flatMap(s => s.deals.map(d => ({ ...d, stage: s.name })));
  const totalPipeline = allDeals.reduce((sum, d) => sum + d.value, 0);
  const weightedPipeline = allDeals.reduce((sum, d) => sum + d.value * d.probability / 100, 0);
  const avgAge = Math.round(allDeals.filter(d => d.age > 0).reduce((sum, d) => sum + d.age, 0) / allDeals.filter(d => d.age > 0).length);
  const atRisk = allDeals.filter(d => d.age > 15 && d.probability < 100).length;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pipeline Studio</h1>
            <p className="text-sm text-muted-foreground">Visual deal flow with conversion intelligence, velocity tracking, and leak detection</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5"><Filter className="w-3.5 h-3.5" />Filter</Button>
            <Button size="sm" className="gap-1.5"><Plus className="w-3.5 h-3.5" />New Deal</Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Total Pipeline", value: `$${totalPipeline.toLocaleString()}`, color: "text-foreground" },
          { label: "Weighted", value: `$${Math.round(weightedPipeline).toLocaleString()}`, color: "text-primary" },
          { label: "Active Deals", value: allDeals.length, color: "text-foreground" },
          { label: "Avg. Age", value: `${avgAge}d`, color: "text-foreground" },
          { label: "At Risk", value: atRisk, color: atRisk > 0 ? "text-amber-400" : "text-green-400" },
        ].map((k, i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardContent className="p-3 text-center">
              <p className={cn("text-xl font-bold", k.color)}>{k.value}</p>
              <p className="text-[9px] text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5">
          {[
            { value: "kanban", label: "Kanban", icon: Target },
            { value: "list", label: "Deal List", icon: BarChart3 },
            { value: "velocity", label: "Velocity", icon: TrendingUp },
            { value: "leaks", label: "Leak Detection", icon: AlertTriangle },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-[10px] h-7 px-2.5 gap-1"><t.icon className="h-3 w-3" />{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          <TabsContent value="kanban">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {STAGES.map((stage, si) => (
                <motion.div key={stage.name} className="min-w-[280px] flex-shrink-0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.06 }}>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1 h-4 rounded-full", stage.color.replace("border-l-", "bg-"))} />
                      <h3 className="text-sm font-medium text-foreground">{stage.name}</h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="text-[10px]">{stage.deals.length}</Badge>
                      <span className="text-[10px] text-muted-foreground">${stage.deals.reduce((s, d) => s + d.value, 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {stage.deals.map(deal => (
                      <Card key={deal.id} className={cn("bg-card/60 border-l-2 border-border/40 hover:border-primary/30 transition-all cursor-pointer group", stage.color)}>
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-start justify-between">
                            <p className="text-xs font-medium text-foreground leading-tight pr-2">{deal.name}</p>
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"><MoreHorizontal className="w-3 h-3" /></Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-primary">${deal.value.toLocaleString()}</span>
                            <span className="text-[10px] text-muted-foreground">{deal.probability}%</span>
                          </div>
                          <Progress value={deal.probability} className="h-1" />
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <User className="w-3 h-3" />{deal.contact}
                          </div>
                          {deal.nextAction && (
                            <div className="flex items-center gap-1.5 text-[10px]">
                              <Zap className="w-3 h-3 text-primary" />
                              <span className="text-foreground">{deal.nextAction}</span>
                              {deal.nextActionDate && <span className="text-muted-foreground">• {deal.nextActionDate}</span>}
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1">{deal.tags.map(t => <Badge key={t} variant="outline" className="text-[8px] px-1">{t}</Badge>)}</div>
                            <div className="flex items-center gap-1">
                              <Clock className={cn("w-3 h-3", deal.age > 15 ? "text-amber-400" : "text-muted-foreground")} />
                              <span className={cn("text-[10px]", deal.age > 15 ? "text-amber-400" : "text-muted-foreground")}>{deal.age}d</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="list">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-muted-foreground border-b border-border/30">
                  <th className="text-left py-2 px-2">Deal</th>
                  <th className="text-left py-2">Contact</th>
                  <th className="text-left py-2">Stage</th>
                  <th className="text-right py-2">Value</th>
                  <th className="text-center py-2">Probability</th>
                  <th className="text-center py-2">Age</th>
                  <th className="text-left py-2">Next Action</th>
                  <th className="text-left py-2">Source</th>
                </tr></thead>
                <tbody>
                  {allDeals.map(d => (
                    <tr key={d.id} className="border-t border-border/20 hover:bg-muted/10 cursor-pointer">
                      <td className="py-2 px-2 font-medium text-foreground">{d.name}</td>
                      <td className="py-2 text-muted-foreground">{d.contact}</td>
                      <td className="py-2"><Badge variant="secondary" className="text-[9px]">{d.stage}</Badge></td>
                      <td className="py-2 text-right font-medium text-primary">${d.value.toLocaleString()}</td>
                      <td className="py-2 text-center">{d.probability}%</td>
                      <td className={cn("py-2 text-center", d.age > 15 ? "text-amber-400" : "")}>{d.age}d</td>
                      <td className="py-2 text-muted-foreground">{d.nextAction || "—"}</td>
                      <td className="py-2 text-muted-foreground">{d.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="velocity">
            <h3 className="text-sm font-semibold mb-4">Stage Velocity — Average Days to Progress</h3>
            <div className="space-y-3">
              {VELOCITY.map(v => (
                <Card key={v.stage} className="bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs font-medium text-foreground">{v.stage}</p>
                        <p className="text-[10px] text-muted-foreground">{v.deals} deals measured</p>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-lg font-bold", v.avgDays > v.target ? "text-amber-400" : "text-green-400")}>{v.avgDays}d</p>
                        <p className="text-[10px] text-muted-foreground">Target: {v.target}d</p>
                      </div>
                    </div>
                    <Progress value={Math.min((v.target / v.avgDays) * 100, 100)} className="h-1.5" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaks">
            <h3 className="text-sm font-semibold mb-4">Pipeline Leak Detection — {LEAKS.length} issues found</h3>
            <div className="space-y-3">
              {LEAKS.map((leak, i) => (
                <Card key={i} className={cn("border-border/50", leak.severity === "high" ? "bg-red-500/5 border-red-500/20" : "bg-amber-500/5 border-amber-500/20")}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{leak.deal}</p>
                        <p className="text-xs text-muted-foreground mt-1">{leak.issue}</p>
                        {leak.lostRevenue > 0 && <p className="text-xs text-red-400 mt-1">Revenue at risk: ${leak.lostRevenue.toLocaleString()}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={leak.severity === "high" ? "destructive" : "secondary"} className="text-[10px]">{leak.severity}</Badge>
                        <Button variant="outline" size="sm" className="text-[10px] h-6">Fix</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
