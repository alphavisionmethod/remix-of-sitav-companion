import { useState } from "react";
import { motion } from "framer-motion";
import { Star, ThumbsUp, MessageCircle, TrendingUp, AlertTriangle, ExternalLink, Send, Globe, CheckCircle, Clock, Filter, Eye, BarChart3, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { PageShell } from "@/platform/sita/components/sita/PageShell";
import { Typography } from "@/platform/sita/components/sita/Typography";
const RATING_DIST: any[] = [];
const REVIEWS: any[] = [];
const CAMPAIGNS: any[] = [];
const PLATFORMS: any[] = [];
const STATS: any[] = [];
const TESTIMONIALS: any[] = [];
const SENTIMENT_TREND: any[] = [];


export default function ReputationEngine() {
  const [tab, setTab] = useState("reviews");

  return (
    <PageShell width="wide" className="space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <Typography role="appTitle">Reputation Engine</Typography>
            <p className="text-sm text-muted-foreground">Reviews, testimonials, NPS, sentiment trends, platform monitoring, and review campaigns</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5 text-[10px]"><Zap className="w-3.5 h-3.5" />Automate Review Requests</Button>
            <Button size="sm" className="gap-1.5"><Send className="w-3.5 h-3.5" />Request Reviews</Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([] as any[]).map(s => (
          <Card key={s.label} className="bg-card/50 border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><s.icon className={cn("w-5 h-5", s.color)} /></div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
                <p className="text-[9px] text-emerald-400">{s.trend}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5">
          {[
            { value: "reviews", label: "Reviews", icon: MessageCircle },
            { value: "platforms", label: "Platforms", icon: Globe },
            { value: "campaigns", label: "Campaigns", icon: Send },
            { value: "testimonials", label: "Testimonials", icon: Star },
            { value: "sentiment", label: "Sentiment", icon: TrendingUp },
            { value: "analytics", label: "Analytics", icon: BarChart3 },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-[10px] h-7 px-2.5 gap-1"><t.icon className="h-3 w-3" />{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3"><CardTitle className="text-sm">Rating Distribution</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {([] as any[]).map(r => (
                    <div key={r.stars} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-8">{r.stars}★</span>
                      <Progress value={r.pct} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground w-8 text-right">{r.count}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50 lg:col-span-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Recent Reviews</CardTitle>
                    <div className="flex gap-1.5">
                      <Badge variant="outline" className="text-[9px] cursor-pointer">All</Badge>
                      <Badge variant="outline" className="text-[9px] cursor-pointer text-red-400">Needs Reply</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {([] as any[]).map(r => (
                    <div key={r.id} className={cn("p-3 rounded-lg border border-border/30", r.sentiment === "negative" ? "bg-red-500/5" : "bg-muted/10")}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{r.author}</span>
                          <div className="flex">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}</div>
                          <Badge variant="outline" className="text-[9px]">{r.platform}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">{r.date}</span>
                          {r.responded ? (
                            <Badge className="text-[9px] bg-green-500/20 text-green-400">Responded</Badge>
                          ) : (
                            <Button variant="outline" size="sm" className="text-[10px] h-6">Reply</Button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{r.text}</p>
                      <div className="flex items-center gap-2 mt-2 text-[9px] text-muted-foreground">
                        <ThumbsUp className="w-3 h-3" />{r.helpfulCount} found helpful
                        <Badge variant="secondary" className="text-[8px] capitalize">{r.sentiment}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Platforms Tab */}
          <TabsContent value="platforms">
            <h3 className="text-sm font-semibold mb-4">Connected Platforms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {([] as any[]).map(p => (
                <Card key={p.name} className="bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">{p.name}</span>
                      </div>
                      {p.linked ? (
                        <Badge className="text-[9px] bg-green-500/20 text-green-400">Connected</Badge>
                      ) : (
                        <Button variant="outline" size="sm" className="text-[10px] h-6">Connect</Button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div><p className="text-lg font-bold text-foreground">{p.reviews}</p><p className="text-[9px] text-muted-foreground">Reviews</p></div>
                      <div><p className="text-lg font-bold text-amber-400">{p.rating}</p><p className="text-[9px] text-muted-foreground">Rating</p></div>
                      <div><p className="text-xs text-muted-foreground">{p.lastSync}</p><p className="text-[9px] text-muted-foreground">Last Sync</p></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns">
            <h3 className="text-sm font-semibold mb-4">Review Request Campaigns</h3>
            <div className="space-y-3">
              {([] as any[]).map(c => (
                <Card key={c.name} className="bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">{c.name}</span>
                        <Badge variant={c.status === "active" ? "default" : "secondary"} className="text-[9px]">{c.status}</Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="text-[10px] h-6">{c.status === "active" ? "Pause" : "Resume"}</Button>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-center text-xs">
                      <div><p className="font-bold text-foreground">{c.sent}</p><p className="text-muted-foreground">Sent</p></div>
                      <div><p className="font-bold text-foreground">{c.responses}</p><p className="text-muted-foreground">Responses</p></div>
                      <div><p className="font-bold text-emerald-400">{c.convRate}</p><p className="text-muted-foreground">Response Rate</p></div>
                      <div><p className="text-muted-foreground">{c.lastSent}</p><p className="text-muted-foreground">Last Sent</p></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Testimonials Tab */}
          <TabsContent value="testimonials">
            <h3 className="text-sm font-semibold mb-4">Testimonial Library</h3>
            <div className="space-y-3">
              {([] as any[]).map((t, i) => (
                <Card key={i} className="bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">{t.author}</span>
                          <div className="flex">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}</div>
                          {t.featured && <Badge className="text-[8px] bg-primary/20 text-primary">Featured</Badge>}
                          {t.approved ? <Badge className="text-[8px] bg-green-500/20 text-green-400">Approved</Badge> : <Badge variant="secondary" className="text-[8px]">Pending</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground italic">"{t.text}"</p>
                        {t.usedOn.length > 0 && (
                          <div className="flex gap-1 mt-1.5">{t.usedOn.map(u => <Badge key={u} variant="outline" className="text-[8px]">{u}</Badge>)}</div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-6 text-[10px]"><Eye className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px]"><Zap className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Sentiment Trend Tab — NEW */}
          <TabsContent value="sentiment">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Sentiment Trend (Monthly)</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {([] as any[]).map(s => (
                    <div key={s.month} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-foreground font-medium w-8">{s.month}</span>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="text-emerald-400">{s.positive}% positive</span>
                          <span>{s.neutral}% neutral</span>
                          <span className="text-red-400">{s.negative}% negative</span>
                        </div>
                      </div>
                      <div className="flex h-3 rounded-full overflow-hidden">
                        <div className="bg-emerald-500/70 h-full" style={{ width: `${s.positive}%` }} />
                        <div className="bg-muted/40 h-full" style={{ width: `${s.neutral}%` }} />
                        <div className="bg-red-500/70 h-full" style={{ width: `${s.negative}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Zap className="w-3 h-3 text-emerald-400" />
                    Reputation Advisor: Positive sentiment increased from 78% to 85% over 4 months. Negative reviews trending down to 4% — strong trust signal. Continue requesting reviews post-service.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2"><CardTitle className="text-xs">Reviews by Month</CardTitle></CardHeader>
                <CardContent className="space-y-1.5">
                  {["Jan", "Feb", "Mar", "Apr"].map((m, i) => {
                    const counts = [8, 11, 14, 12];
                    return (
                      <div key={m} className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground w-6">{m}</span>
                        <div className="flex-1 h-3 bg-muted/20 rounded-full overflow-hidden"><div className="h-full bg-primary/60 rounded-full" style={{ width: `${(counts[i] / 14) * 100}%` }} /></div>
                        <span className="text-[10px] text-foreground w-4 text-right">{counts[i]}</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2"><CardTitle className="text-xs">Sentiment Breakdown</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { label: "Positive", pct: 82, color: "bg-emerald-400" },
                    { label: "Mixed", pct: 13, color: "bg-amber-400" },
                    { label: "Negative", pct: 5, color: "bg-red-400" },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-16">{s.label}</span>
                      <div className="flex-1 h-2 bg-muted/20 rounded-full overflow-hidden"><div className={cn("h-full rounded-full", s.color)} style={{ width: `${s.pct}%` }} /></div>
                      <span className="text-[10px] text-foreground w-6 text-right">{s.pct}%</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </PageShell>
  );
}
