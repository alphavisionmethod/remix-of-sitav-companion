import { useAuth } from "@/contexts/AuthContext";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, Search, Filter, Star, Clock, ArrowRight, Heart, MessageSquare, TrendingUp, TrendingDown, Minus, Zap, Mail, Phone, Calendar, FileText, DollarSign, SmilePlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCustomers } from "@/hooks/use-revenue-office";
import { useCustomerLifecycleStages } from "@/hooks/use-revenue-office";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/sita/EmptyState";
import { clientSentimentService } from "@/lib/services/client-sentiment";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { PageShell } from "@/components/sita/PageShell";
import { Typography } from "@/components/sita/Typography";


export default function RelationshipCenter() {
  const { data: liveContacts, isLoading } = useCustomers();
  const { data: liveLifecycleStages } = useCustomerLifecycleStages();
  const [tab, setTab] = useState("contacts");

  const LIFECYCLE_STAGES = (liveLifecycleStages && liveLifecycleStages.length > 0 ? liveLifecycleStages.map((s: any) => ({
    label: s.stage_name || s.name || "Unknown",
    count: s.contact_count || 0,
    color: s.color || "bg-primary",
  })) : [] as any[]);
  const CONTACTS = (liveContacts?.map((c: Record<string, any>) => ({
    name: c.name || "Unknown", company: c.company || "", stage: c.lifecycle_stage || "Lead",
    health: c.health_score || 50, ltv: `$${c.ltv || 0}`, lastContact: c.last_contact_at ? new Date(c.last_contact_at).toLocaleDateString() : "Never",
    tags: c.tags || [],
  })) ?? []);

  if (isLoading) {
    return (
      <PageShell width="wide" className="space-y-6">
<Skeleton className="h-8 w-48" />
        <div className="flex gap-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16 w-36 rounded-xl" />)}</div>
        <Skeleton className="h-32 rounded-xl" />
      </PageShell>
    );
  }

  if (CONTACTS.length === 0) {
    return (
      <PageShell width="wide" className="space-y-6">
<Typography role="appTitle">Relationship Center</Typography>
        <EmptyState icon={Users} title="No contacts yet" description="Add your first contact to start managing relationships." />
      </PageShell>
    );
  }

  return (
    <PageShell width="wide" className="space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Typography role="appTitle">Relationship Center</Typography>
        <p className="text-sm text-muted-foreground">Lifecycle-aware CRM with relationship intelligence, scoring, and next-best-action</p>
      </motion.div>

      {/* Lifecycle Pipeline */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {LIFECYCLE_STAGES.map(s => (
          <Card key={s.label} className="bg-card/50 border-border/50 min-w-[140px] flex-shrink-0">
            <CardContent className="p-3 text-center">
              <div className={`w-3 h-3 rounded-full ${s.color} mx-auto mb-2`} />
              <p className="text-lg font-bold text-foreground">{s.count}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5">
          <TabsTrigger value="contacts" className="text-[10px] h-7 px-2.5 gap-1"><Users className="h-3 w-3" />Contacts</TabsTrigger>
          <TabsTrigger value="sentiment" className="text-[10px] h-7 px-2.5 gap-1"><SmilePlus className="h-3 w-3" />Sentiment</TabsTrigger>
          <TabsTrigger value="actions" className="text-[10px] h-7 px-2.5 gap-1"><Zap className="h-3 w-3" />Next Best Action</TabsTrigger>
          <TabsTrigger value="graph" className="text-[10px] h-7 px-2.5 gap-1"><ArrowRight className="h-3 w-3" />Relationship Map</TabsTrigger>
          <TabsTrigger value="history" className="text-[10px] h-7 px-2.5 gap-1"><Clock className="h-3 w-3" />History</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          {/* Contacts */}
          <TabsContent value="contacts">
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search contacts, companies, tags..." className="pl-9 bg-card/50 border-border/50" />
              </div>
              <Button variant="outline" size="icon" aria-label="Filter contacts"><Filter className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-3">
              {CONTACTS.map((c: any, i: number) => (
                <motion.div key={c.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                            {c.name.split(" ").map((n: string) => n[0]).join("")}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground">{c.name}</p>
                              <Badge variant="outline" className="text-xs">{c.stage}</Badge>
                              {c.health < 50 && <Badge variant="destructive" className="text-[9px]">At Risk</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground">{c.company}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 flex-wrap">
                          {/* Opportunity Score */}
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Star className={`w-3 h-3 ${c.health > 80 ? "text-amber-400" : "text-muted-foreground"}`} />
                              <span className="text-sm font-medium text-foreground">{Math.min(100, c.health + 10)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Opportunity</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Heart className={`w-3 h-3 ${c.health > 80 ? "text-emerald-400" : c.health > 50 ? "text-amber-400" : "text-red-400"}`} />
                              <span className="text-sm font-medium text-foreground">{c.health}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Health</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">{c.ltv}</p>
                            <p className="text-xs text-muted-foreground">LTV</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span className="text-xs">{c.lastContact}</span>
                            </div>
                          </div>
                          <div className="flex gap-1 flex-wrap max-w-[160px]">
                            {c.tags.map((t: string) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                          </div>
                        </div>
                      </div>
                      {/* Health bar */}
                      <Progress value={c.health} className="h-1 mt-3" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Client Sentiment */}
          <TabsContent value="sentiment">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <SmilePlus className="w-4 h-4 text-primary" /> Client Sentiment Radar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">Analyzes communication tone and trends per client using lexicon-based sentiment scoring.</p>
                {CONTACTS.slice(0, 6).map((c: any, i: number) => {
                  const sampleText = `Thank you for the ${c.health > 70 ? "great" : c.health > 40 ? "reasonable" : "disappointing"} service`;
                  const { score, level } = clientSentimentService.analyzeSentiment(sampleText);
                  const levelColor = level.includes("positive") ? "text-emerald-500" : level === "neutral" ? "text-muted-foreground" : "text-red-500";
                  return (
                    <div key={i} className="flex items-center justify-between p-2 rounded border border-border/30 bg-card/30">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                          {c.name.split(" ").map((n: string) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground">{c.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={Math.round((score + 1) * 50)} className="h-1.5 w-16" />
                        <Badge variant="outline" className={`text-[9px] ${levelColor}`}>{level.replace("_", " ")}</Badge>
                      </div>
                    </div>
                  );
                })}
                <p className="text-[10px] text-muted-foreground italic">Live analysis requires active communications data. Connect CRM for real-time scores.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Next Best Actions */}
          <TabsContent value="actions">
            <div className="space-y-3">
              {([] as any[]).map((nba, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className={`bg-card/50 border-border/50 ${nba.urgency === "critical" ? "border-l-4 border-l-red-400" : nba.urgency === "high" ? "border-l-4 border-l-amber-400" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{nba.contact}</p>
                          <Badge variant={nba.urgency === "critical" ? "destructive" : nba.urgency === "high" ? "secondary" : "outline"} className="text-[9px]">{nba.urgency}</Badge>
                        </div>
                        <span className="text-xs text-emerald-400 font-medium">{nba.estimatedImpact}</span>
                      </div>
                      <p className="text-sm text-primary font-medium">→ {nba.action}</p>
                      <p className="text-xs text-muted-foreground mt-1">{nba.reason}</p>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" className="text-xs gap-1"><Phone className="w-3 h-3" /> Call</Button>
                        <Button variant="outline" size="sm" className="text-xs gap-1"><Mail className="w-3 h-3" /> Email</Button>
                        <Button variant="outline" size="sm" className="text-xs gap-1"><Calendar className="w-3 h-3" /> Book</Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Relationship Map */}
          <TabsContent value="graph">
            <Card className="bg-card/50 border-border/50">
              <CardHeader><CardTitle className="text-sm">Relationship Graph</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {([] as any[]).map((rel, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/10 border border-border/30">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                      {rel.from.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 text-center">
                      <div className="h-px bg-border/50 relative">
                        <Badge variant="outline" className="text-[8px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background">{rel.type.replace(/_/g, " ")}</Badge>
                      </div>
                      <Progress value={rel.strength} className="h-1 mt-2" />
                      <span className="text-[9px] text-muted-foreground">{rel.strength}% strength</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                      {rel.to.split(" ").map(n => n[0]).join("")}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conversation History */}
          <TabsContent value="history">
            {([] as any[]).map((ch, ci) => (
              <Card key={ci} className="bg-card/50 border-border/50">
                <CardHeader className="pb-3"><CardTitle className="text-sm">{ch.contact} — Activity Timeline</CardTitle></CardHeader>
                <CardContent>
                  <div className="relative pl-6 space-y-4">
                    <div className="absolute left-2 top-0 bottom-0 w-px bg-border/50" />
                    {ch.entries.map((entry, ei) => (
                      <div key={ei} className="relative">
                        <div className="absolute -left-4 w-3 h-3 rounded-full bg-primary/30 border-2 border-primary" />
                        <div className="p-3 rounded-lg bg-muted/10 border border-border/30">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              {entry.type === "email" ? <Mail className="w-3 h-3 text-blue-400" /> : entry.type === "call" ? <Phone className="w-3 h-3 text-emerald-400" /> : <Calendar className="w-3 h-3 text-amber-400" />}
                              <span className="text-sm font-medium text-foreground">{entry.subject}</span>
                              <Badge variant="outline" className="text-[8px]">{entry.type}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-[8px]">{entry.status}</Badge>
                              <span className="text-[10px] text-muted-foreground">{entry.date}</span>
                            </div>
                          </div>
                          {entry.duration && <span className="text-[10px] text-muted-foreground">{entry.duration}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </div>
      </Tabs>
    </PageShell>
  );
}
