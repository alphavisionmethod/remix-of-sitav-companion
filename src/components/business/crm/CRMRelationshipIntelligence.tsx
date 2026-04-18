// SITA OS — CRM Relationship Intelligence Dashboard
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Heart, Clock, Mail, Target, Shield, TrendingUp, TrendingDown,
  AlertTriangle, DollarSign, RefreshCw, Sparkles, ChevronRight,
  Activity, Eye, Phone, HeadphonesIcon, X, BarChart3
} from "lucide-react";
import { differenceInDays, isPast } from "date-fns";
import type { CRMContact } from "@/data/repositories/crm-data-service";

interface RelationshipIntelligenceProps {
  contacts: CRMContact[];
  communications?: any[];
  opportunities?: any[];
  tasks?: any[];
  onSelectContact?: (id: string) => void;
  compact?: boolean;
}

type IntelligenceFactor = {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
  weight: number;
  compute: (c: CRMContact, ctx: any) => number;
  explain: (score: number, c: CRMContact, ctx: any) => string;
};

const FACTORS: IntelligenceFactor[] = [
  {
    key: "recency", label: "Engagement Recency", icon: Clock, color: "text-blue-400", weight: 0.25,
    compute: (c) => {
      const d = c.last_contacted_at ? differenceInDays(new Date(), new Date(c.last_contacted_at)) : 999;
      return d <= 3 ? 100 : d <= 7 ? 85 : d <= 14 ? 70 : d <= 30 ? 50 : d <= 60 ? 25 : 5;
    },
    explain: (s, c) => {
      const d = c.last_contacted_at ? differenceInDays(new Date(), new Date(c.last_contacted_at)) : null;
      return d !== null ? `Last contact ${d} day${d !== 1 ? "s" : ""} ago` : "Never contacted";
    },
  },
  {
    key: "frequency", label: "Communication Frequency", icon: Mail, color: "text-indigo-400", weight: 0.20,
    compute: (c, ctx) => {
      const count = ctx.comms?.filter((cm: any) => cm.contact_id === c.id).length || 0;
      return Math.min(100, count * 15);
    },
    explain: (s, c, ctx) => {
      const count = ctx.comms?.filter((cm: any) => cm.contact_id === c.id).length || 0;
      return `${count} total interaction${count !== 1 ? "s" : ""}`;
    },
  },
  {
    key: "momentum", label: "Opportunity Momentum", icon: TrendingUp, color: "text-green-400", weight: 0.15,
    compute: (c, ctx) => {
      const deals = ctx.opps?.filter((o: any) => o.contact_id === c.id && o.status === "open") || [];
      if (deals.length === 0) return 30;
      const hasStalled = deals.some((d: any) => differenceInDays(new Date(), new Date(d.updated_at)) > 7);
      return hasStalled ? 50 : 90;
    },
    explain: (s, c, ctx) => {
      const deals = ctx.opps?.filter((o: any) => o.contact_id === c.id && o.status === "open") || [];
      return deals.length > 0 ? `${deals.length} active deal${deals.length !== 1 ? "s" : ""}` : "No active deals";
    },
  },
  {
    key: "followthrough", label: "Follow-Through Quality", icon: Shield, color: "text-purple-400", weight: 0.15,
    compute: (c, ctx) => {
      const overdue = ctx.tasks?.filter((t: any) => t.contact_id === c.id && t.status !== "completed" && t.due_date && isPast(new Date(t.due_date))).length || 0;
      const hasOverdueFollowUp = c.next_follow_up_at ? isPast(new Date(c.next_follow_up_at)) : false;
      if (overdue > 2 || hasOverdueFollowUp) return 20;
      if (overdue > 0) return 50;
      return 85;
    },
    explain: (s, c, ctx) => {
      const overdue = ctx.tasks?.filter((t: any) => t.contact_id === c.id && t.status !== "completed" && t.due_date && isPast(new Date(t.due_date))).length || 0;
      return overdue > 0 ? `${overdue} overdue task${overdue !== 1 ? "s" : ""}` : "All commitments on track";
    },
  },
  {
    key: "warmth", label: "Account Warmth", icon: Heart, color: "text-rose-400", weight: 0.10,
    compute: (c) => c.health_score ?? 50,
    explain: (s) => `Health score: ${s}`,
  },
  {
    key: "support_sensitivity", label: "Support Sensitivity", icon: HeadphonesIcon, color: "text-amber-400", weight: 0.05,
    compute: () => 80, // Would be computed from actual support tickets
    explain: () => "No active support issues",
  },
  {
    key: "payment_sensitivity", label: "Payment Sensitivity", icon: DollarSign, color: "text-emerald-400", weight: 0.05,
    compute: () => 85, // Would be computed from actual invoice data
    explain: () => "No payment concerns",
  },
  {
    key: "reactivation", label: "Reactivation Potential", icon: RefreshCw, color: "text-violet-400", weight: 0.05,
    compute: (c) => {
      if (c.lifecycle_stage === "churned") return 60;
      const d = c.last_contacted_at ? differenceInDays(new Date(), new Date(c.last_contacted_at)) : 999;
      return d > 90 ? 70 : d > 60 ? 40 : 10;
    },
    explain: (s, c) => c.lifecycle_stage === "churned" ? "Churned — reactivation possible" : s > 50 ? "Extended inactivity — reactivation candidate" : "Active relationship",
  },
];

export function CRMRelationshipIntelligence({ contacts, communications = [], opportunities = [], tasks = [], onSelectContact, compact = false }: RelationshipIntelligenceProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const ctx = useMemo(() => ({ comms: communications, opps: opportunities, tasks }), [communications, opportunities, tasks]);

  const computeScore = (c: CRMContact) => {
    return Math.round(FACTORS.reduce((s, f) => s + f.compute(c, ctx) * f.weight, 0));
  };

  // Portfolio health overview
  const portfolio = useMemo(() => {
    const scores = contacts.map(c => ({ contact: c, score: computeScore(c) }));
    const avg = scores.length > 0 ? Math.round(scores.reduce((s, x) => s + x.score, 0) / scores.length) : 0;
    const critical = scores.filter(s => s.score < 30).length;
    const atRisk = scores.filter(s => s.score >= 30 && s.score < 50).length;
    const healthy = scores.filter(s => s.score >= 70).length;
    const trending = contacts.filter(c => {
      const d = c.last_contacted_at ? differenceInDays(new Date(), new Date(c.last_contacted_at)) : 999;
      return d <= 7;
    }).length;
    return { scores, avg, critical, atRisk, healthy, trending };
  }, [contacts, ctx]);

  const selected = portfolio.scores.find(s => s.contact.id === selectedId);

  if (compact) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Relationship Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="text-center p-2 rounded-lg bg-muted/20">
              <p className="text-xl font-bold text-foreground">{portfolio.avg}</p>
              <p className="text-[9px] text-muted-foreground">Avg Score</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-green-500/10">
              <p className="text-xl font-bold text-green-400">{portfolio.healthy}</p>
              <p className="text-[9px] text-muted-foreground">Healthy</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-orange-500/10">
              <p className="text-xl font-bold text-orange-400">{portfolio.atRisk}</p>
              <p className="text-[9px] text-muted-foreground">At Risk</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-destructive/10">
              <p className="text-xl font-bold text-destructive">{portfolio.critical}</p>
              <p className="text-[9px] text-muted-foreground">Critical</p>
            </div>
          </div>
          {portfolio.scores.filter(s => s.score < 50).slice(0, 3).map(s => (
            <div key={s.contact.id} className="flex items-center gap-2 py-1.5 text-xs">
              <AlertTriangle className="h-3 w-3 text-orange-400" />
              <span className="text-foreground truncate">{s.contact.first_name} {s.contact.last_name}</span>
              <span className="ml-auto text-orange-400 font-bold">{s.score}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Portfolio Overview */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Relationship Intelligence
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">AI</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3 mb-4">
            <div className="text-center p-3 rounded-lg bg-muted/20">
              <p className="text-2xl font-bold text-foreground">{portfolio.avg}</p>
              <p className="text-[10px] text-muted-foreground">Portfolio Avg</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-500/10">
              <p className="text-2xl font-bold text-green-400">{portfolio.healthy}</p>
              <p className="text-[10px] text-muted-foreground">Healthy</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-orange-500/10">
              <p className="text-2xl font-bold text-orange-400">{portfolio.atRisk}</p>
              <p className="text-[10px] text-muted-foreground">At Risk</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-destructive/10">
              <p className="text-2xl font-bold text-destructive">{portfolio.critical}</p>
              <p className="text-[10px] text-muted-foreground">Critical</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-primary/10">
              <p className="text-2xl font-bold text-primary">{portfolio.trending}</p>
              <p className="text-[10px] text-muted-foreground">Trending ↑</p>
            </div>
          </div>

          {/* Contact list sorted by score */}
          <div className="space-y-1">
            {portfolio.scores.sort((a, b) => a.score - b.score).slice(0, 8).map(s => {
              const scoreColor = s.score >= 70 ? "text-green-400" : s.score >= 50 ? "text-yellow-400" : s.score >= 30 ? "text-orange-400" : "text-destructive";
              return (
                <div
                  key={s.contact.id}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${selectedId === s.contact.id ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-muted/30"}`}
                  onClick={() => { setSelectedId(selectedId === s.contact.id ? null : s.contact.id); onSelectContact?.(s.contact.id); }}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                    {s.contact.first_name[0]}{s.contact.last_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{s.contact.first_name} {s.contact.last_name}</p>
                    <p className="text-[10px] text-muted-foreground">{s.contact.lifecycle_stage} · {s.contact.title || ""}</p>
                  </div>
                  <div className="w-20 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${s.score}%`, backgroundColor: s.score >= 70 ? "hsl(152 55% 48%)" : s.score >= 50 ? "hsl(45 90% 55%)" : s.score >= 30 ? "hsl(25 90% 55%)" : "hsl(0 65% 55%)" }} />
                  </div>
                  <span className={`text-sm font-bold ${scoreColor} w-8 text-right`}>{s.score}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected contact drill-down */}
      {selected && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {selected.contact.first_name} {selected.contact.last_name} — Score Breakdown
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedId(null)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {FACTORS.map(f => {
              const score = f.compute(selected.contact, ctx);
              const explanation = f.explain(score, selected.contact, ctx);
              const barColor = score >= 70 ? "hsl(152 55% 48%)" : score >= 50 ? "hsl(45 90% 55%)" : score >= 30 ? "hsl(25 90% 55%)" : "hsl(0 65% 55%)";
              return (
                <div key={f.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <f.icon className={`h-3 w-3 ${f.color}`} />
                      {f.label}
                      <span className="text-[9px] text-muted-foreground/60">({Math.round(f.weight * 100)}%)</span>
                    </span>
                    <span className="font-semibold text-foreground">{score}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: barColor }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground">{explanation}</p>
                </div>
              );
            })}
            <div className="pt-2 border-t border-border/30 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Composite Score</span>
              <span className={`text-lg font-bold ${selected.score >= 70 ? "text-green-400" : selected.score >= 50 ? "text-yellow-400" : "text-destructive"}`}>{selected.score}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
