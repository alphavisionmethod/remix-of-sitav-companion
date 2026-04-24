import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { Clock, TrendingUp, TrendingDown, ArrowRight, Calendar, DollarSign, Users, Target, BarChart3, BookOpen, GitCompare, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const ti = (t: string) => t === "up" ? <TrendingUp className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" /> : t === "down" ? <TrendingDown className="h-3.5 w-3.5 text-destructive" /> : <span className="text-muted-foreground">—</span>;

const ADVISOR_SNAPSHOTS = [
  { period: "Apr 2025", advisor: "Funnel Advisor", thenStance: "Landing page conversion at 4.2% — acceptable but room for growth", nowStance: "Landing page conversion improved to 6.8% after redesign — strong", confidence: { then: 68, now: 84 } },
  { period: "Mar 2025", advisor: "Retention Advisor", thenStance: "Churn risk moderate — 3 clients showing disengagement signals", nowStance: "1 client churned, 2 stabilized after outreach. Onboarding improvements working", confidence: { then: 55, now: 76 } },
  { period: "Feb 2025", advisor: "Campaign Advisor", thenStance: "Email open rates declining — fatigue suspected", nowStance: "Segmentation fix lifted open rates from 18% to 28%", confidence: { then: 42, now: 81 } },
];

const LESSONS_CAPTURED = [
  { date: "Mar 15", lesson: "Pricing increase on new clients had zero churn impact — safe to repeat", category: "pricing", applied: true },
  { date: "Feb 28", lesson: "Post-call follow-up automation recovered $12k/mo — automate everything post-touch", category: "automation", applied: true },
  { date: "Jan 20", lesson: "Launching 3 campaigns same week caused fatigue — stagger by 5+ days", category: "campaigns", applied: false },
];

const PERIODS: any[] = [{ revenue: 0 }];
const BusinessTimeMachine = () => {
  const [tab, setTab] = useState("timeline");
  const [lessonInput, setLessonInput] = useState("");
  const [savedLessons, setSavedLessons] = useState<string[]>([]);
  const cur = PERIODS[0]?.revenue ?? 0;
  const old = PERIODS[PERIODS.length - 1]?.revenue ?? 0;
  const yoy = old > 0 ? Math.round(((cur - old) / old) * 100) : 0;

  const saveLesson = () => {
    if (lessonInput.trim()) {
      setSavedLessons(prev => [...prev, lessonInput.trim()]);
      setLessonInput("");
    }
  };

  return (
    <div className="space-y-6 p-6">
<SitaPageHeader icon={<Clock className="h-5 w-5" />} title="Business Time Machine" subtitle="Replay decisions, compare advisor stances then vs now, and capture lessons" />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { l: "Current Revenue", v: `$${(cur / 1000).toFixed(1)}k/mo`, c: "text-[hsl(var(--trust-safe))]" },
          { l: "YoY Growth", v: `+${yoy}%`, c: "text-primary" },
          { l: "Key Decisions", v: ([] as never[]).length, c: "text-foreground" },
          { l: "Lessons Captured", v: LESSONS_CAPTURED.length + savedLessons.length, c: "text-amber-400" },
          { l: "Synthesis History", v: ([] as never[]).length, c: "text-purple-400" },
        ].map(m => (
          <div key={m.l} className="rounded-xl border border-border/40 bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">{m.l}</p>
            <p className={`text-xl font-bold ${m.c}`}>{m.v}</p>
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="timeline"><Calendar className="h-3.5 w-3.5 mr-1" />Periods</TabsTrigger>
          <TabsTrigger value="decisions"><Target className="h-3.5 w-3.5 mr-1" />Decisions</TabsTrigger>
          <TabsTrigger value="advisor-snapshots"><GitCompare className="h-3.5 w-3.5 mr-1" />Then vs Now</TabsTrigger>
          <TabsTrigger value="lessons"><BookOpen className="h-3.5 w-3.5 mr-1" />Lessons</TabsTrigger>
          <TabsTrigger value="whatif"><BarChart3 className="h-3.5 w-3.5 mr-1" />What-If</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-4">
          <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-border/40 bg-muted/30"><th className="text-left p-3">Period</th><th className="text-right p-3">Revenue</th><th className="text-right p-3">Clients</th><th className="text-right p-3">Deals</th><th className="text-right p-3">Conv %</th><th className="text-center p-3">Trend</th></tr></thead>
              <tbody>{([] as never[]).map(p => <tr key={p.period} className="border-b border-border/20"><td className="p-3 font-medium">{p.period}</td><td className="p-3 text-right">${p.revenue.toLocaleString()}</td><td className="p-3 text-right">{p.clients}</td><td className="p-3 text-right">{p.deals}</td><td className="p-3 text-right">{p.conversion}%</td><td className="p-3 text-center">{ti(p.trend)}</td></tr>)}</tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="decisions" className="space-y-0 mt-4">
          {([] as never[]).map((d, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`h-3 w-3 rounded-full border-2 ${d.impact === "positive" ? "border-[hsl(var(--trust-safe))] bg-[hsl(var(--trust-safe))]/20" : d.impact === "negative" ? "border-destructive bg-destructive/20" : "border-muted-foreground bg-muted"}`} />
                {i < ([] as never[]).length - 1 && <div className="w-px flex-1 bg-border/40" />}
              </div>
              <div className="pb-4 flex-1">
                <div className="flex items-center gap-2 mb-1"><span className="text-[10px] text-muted-foreground">{d.date}</span><Badge variant={d.impact === "positive" ? "default" : d.impact === "negative" ? "destructive" : "outline"} className="text-[10px]">{d.metric}</Badge></div>
                <p className="text-sm font-medium">{d.decision}</p>
                <p className="text-xs text-muted-foreground">{d.detail}</p>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Advisor Then vs Now */}
        <TabsContent value="advisor-snapshots" className="space-y-3 mt-4">
          {ADVISOR_SNAPSHOTS.map((snap, i) => (
            <Card key={i} className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{snap.period}</Badge>
                    <span className="text-sm font-bold text-foreground">{snap.advisor}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-muted-foreground">Confidence:</span>
                    <span className="text-orange-400">{snap.confidence.then}%</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[hsl(var(--trust-safe))]">{snap.confidence.now}%</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/10 border border-border/30">
                    <p className="text-[10px] text-muted-foreground uppercase mb-1">Then</p>
                    <p className="text-xs text-foreground">{snap.thenStance}</p>
                    <Progress value={snap.confidence.then} className="h-1 mt-2" />
                  </div>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-[10px] text-primary uppercase mb-1">Now</p>
                    <p className="text-xs text-foreground">{snap.nowStance}</p>
                    <Progress value={snap.confidence.now} className="h-1 mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Historical Synthesis */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Lightbulb className="h-4 w-4 text-purple-400" /> Historical Chief Synthesis</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {([] as never[]).map((h, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/10 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">{h.date}</span>
                    <Badge variant="outline" className="text-[10px]">Score: {h.score}</Badge>
                  </div>
                  <p className="text-xs text-foreground">{h.synthesis}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lessons */}
        <TabsContent value="lessons" className="space-y-3 mt-4">
          {LESSONS_CAPTURED.map((l, i) => (
            <div key={i} className={`rounded-xl border p-4 ${l.applied ? "border-[hsl(var(--trust-safe))]/30 bg-[hsl(var(--trust-safe))]/5" : "border-border/40 bg-card"}`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{l.date}</span>
                  <Badge variant="outline" className="text-[10px]">{l.category}</Badge>
                  {l.applied && <Badge variant="default" className="text-[10px]">Applied</Badge>}
                </div>
              </div>
              <p className="text-xs text-foreground">{l.lesson}</p>
            </div>
          ))}

          {savedLessons.map((l, i) => (
            <div key={`saved-${i}`} className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center gap-2 mb-1"><Badge variant="default" className="text-[10px]">New</Badge></div>
              <p className="text-xs text-foreground">{l}</p>
            </div>
          ))}

          {/* Lesson Capture Form */}
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">Capture New Lesson</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={lessonInput}
                  onChange={e => setLessonInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && saveLesson()}
                  placeholder="What did you learn from this period?"
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-border/40 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button size="sm" onClick={saveLesson} disabled={!lessonInput.trim()} className="text-xs">Save Lesson</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatif" className="space-y-3 mt-4">
          {([] as never[]).map((s, i) => (
            <div key={i} className="rounded-xl border border-border/40 bg-card p-4">
              <div className="flex items-center justify-between mb-2"><span className="text-sm font-semibold">{s.q}</span><Badge variant="outline">{s.conf}% confidence</Badge></div>
              <div className="rounded-lg bg-muted/30 p-3 mb-2"><p className="text-xs font-mono">{s.proj}</p></div>
              <div className="flex items-start gap-1.5 text-xs text-primary"><ArrowRight className="h-3 w-3 mt-0.5 shrink-0" /><span>{s.rec}</span></div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default BusinessTimeMachine;
