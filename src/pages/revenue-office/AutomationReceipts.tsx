import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Receipt, CheckCircle, Users, Mail, Phone, FileText, Clock, Undo2,
  AlertTriangle, Shield, Eye, DollarSign, MessageSquare, Star, UserPlus,
  Heart, Target, RefreshCw, Brain, ArrowRight
} from "lucide-react";
import { useState } from "react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { DEMO_receipts } from "@/lib/demo-data/revenue-office";

const categoryIcons: Record<string, typeof Mail> = {
  "Lead Recovery": Users, Sales: FileText, Booking: Phone, Reputation: Star,
  Onboarding: UserPlus, Operations: Target, Retention: Heart, Growth: RefreshCw, Revenue: DollarSign,
};

export default function AutomationReceipts() {
  const { isDemoMode } = useDataMode();
  const [tab, setTab] = useState("all");
  const categories = ["all", ...Array.from(new Set(DEMO_receipts.map(r => r.category)))];

  const filtered = tab === "all" ? DEMO_receipts : DEMO_receipts.filter(r => r.category === tab);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Receipt className="h-6 w-6 text-blue-400" />Automation Receipts & History</h1>
        <p className="text-muted-foreground">Full audit trail — who created, what happened, which contacts affected, outcomes, approvals, and rollback options</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-foreground">{DEMO_receipts.length}</p><p className="text-[10px] text-muted-foreground">Actions (48hrs)</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-emerald-400">{DEMO_receipts.reduce((a, r) => a + r.contacts, 0)}</p><p className="text-[10px] text-muted-foreground">Contacts Affected</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-400">{DEMO_receipts.filter(r => r.rollback).length}</p><p className="text-[10px] text-muted-foreground">Rollback Available</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-amber-400">{DEMO_receipts.filter(r => r.approvedBy.includes("Awaiting")).length}</p><p className="text-[10px] text-muted-foreground">Pending Approval</p></CardContent></Card>
      </div>

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
                      <button className="px-2 py-1 rounded text-[10px] bg-secondary text-secondary-foreground flex items-center gap-1 hover:bg-secondary/80"><Undo2 className="h-3 w-3" />Rollback</button>
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
    </motion.div>
  );
}
