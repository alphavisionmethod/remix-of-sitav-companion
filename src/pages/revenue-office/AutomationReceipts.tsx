import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Receipt, CheckCircle, Users, Mail, Phone, FileText, Clock, Undo2,
  AlertTriangle, Shield, Eye, DollarSign, MessageSquare, Star, UserPlus,
  Heart, Target, RefreshCw, Brain, ArrowRight, BarChart3, Filter, Info
} from "lucide-react";
import { useState } from "react";
import AutomationSubNav from "./AutomationSubNav";
import { DEMO_receipts, DEMO_WHY_SENT } from "@/data/seed/revenue-office";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const categoryIcons: Record<string, typeof Mail> = {
  "Lead Recovery": Users, Sales: FileText, Booking: Phone, Reputation: Star,
  Onboarding: UserPlus, Operations: Target, Retention: Heart, Growth: RefreshCw, Revenue: DollarSign,
};

const IMPACT_SUMMARY = [
  { label: "Revenue Protected", value: "$34,800", color: "text-emerald-400" },
  { label: "Leads Rescued", value: "68", color: "text-blue-400" },
  { label: "Reviews Generated", value: "14", color: "text-amber-400" },
  { label: "Hours Saved", value: "42", color: "text-purple-400" },
];

export default function AutomationReceipts() {
  const [tab, setTab] = useState("all");
  const [timeFilter, setTimeFilter] = useState("48h");
  const [viewMode, setViewMode] = useState<"receipts" | "why">("receipts");
  const categories = ["all", ...Array.from(new Set(([] as typeof DEMO_receipts).map(r => r.category)))];
  const filtered = tab === "all" ? DEMO_receipts : ([] as typeof DEMO_receipts).filter(r => r.category === tab);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
<AutomationSubNav />
      <div className="flex items-center justify-between">
        <div>
          <Typography role="appTitle" className="flex items-center gap-2"><Receipt className="h-6 w-6 text-blue-400" />Automation Receipts & History</Typography>
          <p className="text-muted-foreground">Full audit trail — who created, what happened, which contacts affected, outcomes, and rollback options</p>
        </div>
        <div className="flex gap-1.5">
          {["24h", "48h", "7d", "30d"].map(t => (
            <Button key={t} variant={timeFilter === t ? "default" : "outline"} size="sm" className="text-[10px] h-7" onClick={() => setTimeFilter(t)}>{t}</Button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-foreground">{([] as typeof DEMO_receipts).length}</p><p className="text-[10px] text-muted-foreground">Actions ({timeFilter})</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-emerald-400">{([] as typeof DEMO_receipts).reduce((a, r) => a + r.contacts, 0)}</p><p className="text-[10px] text-muted-foreground">Contacts Affected</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-400">{([] as typeof DEMO_receipts).filter(r => r.rollback).length}</p><p className="text-[10px] text-muted-foreground">Rollback Available</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-amber-400">{([] as typeof DEMO_receipts).filter(r => r.approvedBy.includes("Awaiting")).length}</p><p className="text-[10px] text-muted-foreground">Pending Approval</p></CardContent></Card>
      </div>

      {/* Impact Summary */}
      <Card className="bg-card/50 border-emerald-500/20">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-emerald-400" />Automation Impact Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {IMPACT_SUMMARY.map(s => (
              <div key={s.label} className="text-center">
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2">
        <Button variant={viewMode === "receipts" ? "default" : "outline"} size="sm" className="text-xs" onClick={() => setViewMode("receipts")}>
          <Receipt className="h-3.5 w-3.5 mr-1" />Receipts
        </Button>
        <Button variant={viewMode === "why" ? "default" : "outline"} size="sm" className="text-xs" onClick={() => setViewMode("why")}>
          <Info className="h-3.5 w-3.5 mr-1" />Why This Was Sent
        </Button>
      </div>

      {viewMode === "receipts" ? (
        <>
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button key={cat} onClick={() => setTab(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${tab === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10"}`}>{cat}</button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map((r, i) => {
              const CatIcon = categoryIcons[r.category] || Mail;
              return (
                <Card key={i} className="bg-card/50 border-border/50 hover:border-primary/20 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10"><CatIcon className="h-4 w-4 text-primary" /></div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-medium text-foreground">{r.automation}</p>
                            <Badge variant="secondary" className="text-[10px]">{r.category}</Badge>
                          </div>
                          <p className="text-xs text-foreground">{r.action}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] text-muted-foreground">{r.time}</span>
                        {r.rollback && (
                          <Button variant="outline" size="sm" className="text-[10px] h-6 gap-1"><Undo2 className="h-3 w-3" />Rollback</Button>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-2 mt-2 pt-2 border-t border-border/20">
                      <div className="space-y-1 text-[10px]">
                        <p className="text-muted-foreground">Contacts: <span className="text-foreground font-medium">{r.contacts}</span></p>
                        <p className="text-muted-foreground">Approved by: <span className={`font-medium ${r.approvedBy.includes("Awaiting") ? "text-amber-400" : "text-foreground"}`}>{r.approvedBy}</span></p>
                        <p className="text-muted-foreground">Impact: <span className="text-emerald-400 font-medium">{r.impact}</span></p>
                      </div>
                      <div className="space-y-1 text-[10px]">
                        <p className="text-muted-foreground">Outcome: <span className="text-foreground">{r.outcome}</span></p>
                        {r.details.aiGenerated && <p className="text-purple-400">✦ AI-generated content</p>}
                        {r.details.requiresApproval && <p className="text-amber-400">⏳ Requires your approval</p>}
                        {r.details.decisionTheaterUsed && <p className="text-blue-400">🎭 Decision Theater reviewed</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        /* WHY THIS WAS SENT — TRANSPARENCY VIEW */
        <div className="space-y-4">
          <Card className="bg-card/50 border-primary/20 border">
            <CardContent className="p-4 flex items-start gap-3">
              <Info className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">"Why This Was Sent" Transparency</p>
                <p className="text-xs text-muted-foreground">Every automated message, quote, task, or action includes a full explanation: what triggered it, which facts it used, which workflow and template, which advisor recommendation, and which policy applied.</p>
              </div>
            </CardContent>
          </Card>

          {([] as typeof DEMO_WHY_SENT).map((w) => (
            <Card key={w.id} className="bg-card/50 border-border/50 hover:border-primary/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-foreground">{w.action}</p>
                  <span className="text-[10px] text-muted-foreground">{w.sentAt}</span>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="p-2 rounded bg-background/50 border border-border/20">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Triggered by</p>
                      <p className="text-xs text-foreground">{w.triggeredBy}</p>
                    </div>
                    <div className="p-2 rounded bg-background/50 border border-border/20">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Based on verified facts</p>
                      <ul className="space-y-0.5">
                        {w.basedOnFacts.map((f, i) => (
                          <li key={i} className="text-xs text-foreground flex items-start gap-1">
                            <CheckCircle className="h-3 w-3 text-emerald-400 mt-0.5 flex-shrink-0" />{f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2 rounded bg-background/50 border border-border/20">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Under workflow</p>
                      <p className="text-xs text-foreground">{w.underWorkflow}</p>
                    </div>
                    <div className="p-2 rounded bg-primary/5 border border-primary/10">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Advisor recommendation</p>
                      <p className="text-xs text-foreground flex items-start gap-1"><Brain className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />{w.advisorRecommendation}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Badge variant="outline" className="text-[8px]">{w.templateVersion}</Badge>
                      <Badge variant="outline" className="text-[8px]">{w.policyApplied}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}