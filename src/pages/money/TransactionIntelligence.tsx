// ═══════════════════════════════════════════════════════════════
// SITA OS — Money Office: Transaction Intelligence
// ═══════════════════════════════════════════════════════════════

import { SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { DomainHeader } from "@/components/sita/primitives/DomainHeader";
import { Receipt, Search, Tag, AlertTriangle, Repeat, ArrowUpDown, Sparkles, Shield, CheckCircle, XCircle, Clock, DollarSign, TrendingDown, Building } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { ModuleAdvisorInsight } from "@/components/sita/domain-shared/ModuleAdvisorInsight";
interface DemoTx {
  id: string; date: string; description: string; merchant: string; amountCents: number; category: string;
  type: "debit" | "credit"; isRecurring: boolean; categorizedBy: "rule" | "ai" | "manual"; confidence: number;
  flags: string[]; classification: "personal" | "business";
}

const TXS: DemoTx[] = [
  { id: "t1", date: "2026-04-09", description: "STRIPE TRANSFER", merchant: "Stripe", amountCents: 450000, category: "Revenue", type: "credit", isRecurring: true, categorizedBy: "rule", confidence: 0.99, flags: [], classification: "business" },
  { id: "t2", date: "2026-04-09", description: "WHOLE FOODS #1234", merchant: "Whole Foods", amountCents: 8542, category: "Groceries", type: "debit", isRecurring: false, categorizedBy: "ai", confidence: 0.95, flags: [], classification: "personal" },
  { id: "t3", date: "2026-04-08", description: "AWS SERVICES", merchant: "Amazon Web Services", amountCents: 34500, category: "Cloud Infrastructure", type: "debit", isRecurring: true, categorizedBy: "rule", confidence: 0.99, flags: [], classification: "business" },
  { id: "t4", date: "2026-04-08", description: "NETFLIX.COM", merchant: "Netflix", amountCents: 1599, category: "Subscriptions", type: "debit", isRecurring: true, categorizedBy: "rule", confidence: 0.99, flags: ["duplicate-subscription"], classification: "personal" },
  { id: "t5", date: "2026-04-07", description: "UBER TRIP", merchant: "Uber", amountCents: 2850, category: "Transportation", type: "debit", isRecurring: false, categorizedBy: "ai", confidence: 0.88, flags: ["possible-business-expense"], classification: "personal" },
  { id: "t6", date: "2026-04-07", description: "OPENAI", merchant: "OpenAI", amountCents: 2000, category: "Software", type: "debit", isRecurring: true, categorizedBy: "rule", confidence: 0.99, flags: [], classification: "business" },
  { id: "t7", date: "2026-04-06", description: "TRANSFER TO SAVINGS", merchant: "Internal", amountCents: 100000, category: "Savings", type: "debit", isRecurring: true, categorizedBy: "rule", confidence: 1.0, flags: [], classification: "personal" },
  { id: "t8", date: "2026-04-06", description: "UNKNOWN VENDOR 8832", merchant: "Unknown", amountCents: 24999, category: "Uncategorized", type: "debit", isRecurring: false, categorizedBy: "ai", confidence: 0.45, flags: ["low-confidence", "anomaly"], classification: "personal" },
  { id: "t9", date: "2026-04-05", description: "CLIENT PAYMENT - ACME", merchant: "Acme Corp", amountCents: 750000, category: "Revenue", type: "credit", isRecurring: false, categorizedBy: "manual", confidence: 1.0, flags: [], classification: "business" },
  { id: "t10", date: "2026-04-05", description: "STARBUCKS #4521", merchant: "Starbucks", amountCents: 685, category: "Dining", type: "debit", isRecurring: false, categorizedBy: "ai", confidence: 0.92, flags: [], classification: "personal" },
];

const TransactionIntelligence = () => {
  const [tab, setTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    let txs = TXS;
    if (tab === "recurring") txs = txs.filter(t => t.isRecurring);
    if (tab === "flagged") txs = txs.filter(t => t.flags.length > 0);
    if (tab === "business") txs = txs.filter(t => t.classification === "business");
    if (tab === "personal") txs = txs.filter(t => t.classification === "personal");
    if (searchTerm) txs = txs.filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()) || t.merchant.toLowerCase().includes(searchTerm.toLowerCase()));
    return txs;
  }, [tab, searchTerm]);

  const stats = useMemo(() => {
    const total = ([] as any[]).length;
    const aiCategorized = ([] as any[]).filter(t => t.categorizedBy === "ai").length;
    const flagged = ([] as any[]).filter(t => t.flags.length > 0).length;
    const recurring = ([] as any[]).filter(t => t.isRecurring).length;
    const avgConfidence = ([] as any[]).reduce((s, t) => s + t.confidence, 0) / total;
    return { total, aiCategorized, flagged, recurring, avgConfidence };
  }, []);

  const fmt = (c: number) => `$${(Math.abs(c) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <DomainHeader domain="money" title="Transaction Intelligence" subtitle="Smart categorization, anomaly detection, business/personal classification" />
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        <KPITile label="Transactions" value={stats.total.toString()} icon={Receipt} />
        <KPITile label="AI Categorized" value={stats.aiCategorized.toString()} icon={Sparkles} />
        <KPITile label="Flagged" value={stats.flagged.toString()} icon={AlertTriangle} />
        <KPITile label="Recurring" value={stats.recurring.toString()} icon={Repeat} />
        <KPITile label="Avg Confidence" value={`${(stats.avgConfidence * 100).toFixed(0)}%`} icon={Shield} />
      </div>

      {/* Filter Tabs */}
      <SitaTabs
        tabs={[
          { key: "all", label: "All" },
          { key: "recurring", label: "Recurring" },
          { key: "flagged", label: "⚠ Flagged" },
          { key: "business", label: "Business" },
          { key: "personal", label: "Personal" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {/* Transaction Feed */}
      <div className="space-y-2">
        {filtered.map(tx => (
          <SitaCard key={tx.id} hover className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === "credit" ? "bg-emerald-500/10 text-trust-verified" : "bg-muted text-muted-foreground"}`}>
                  {tx.type === "credit" ? <TrendingDown className="h-4 w-4 rotate-180" /> : <DollarSign className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-display text-sm font-semibold truncate">{tx.merchant}</p>
                    {tx.isRecurring && <Repeat className="h-3 w-3 text-primary flex-shrink-0" />}
                    {tx.classification === "business" && <Building className="h-3 w-3 text-blue-500 flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{tx.date}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Tag className="h-2.5 w-2.5" />
                      {tx.category}
                    </span>
                    <span>·</span>
                    <span className={`${tx.categorizedBy === "ai" ? "text-purple-500" : tx.categorizedBy === "rule" ? "text-primary" : "text-muted-foreground"}`}>
                      {tx.categorizedBy === "ai" ? "🤖 AI" : tx.categorizedBy === "rule" ? "⚙ Rule" : "✋ Manual"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right ml-3">
                <p className={`font-display text-sm font-bold ${tx.type === "credit" ? "text-trust-verified" : ""}`}>
                  {tx.type === "credit" ? "+" : "-"}{fmt(tx.amountCents)}
                </p>
                <ConfidenceBar value={Math.round(tx.confidence * 100)} size="sm" className="mt-1" />
              </div>
            </div>
            {tx.flags.length > 0 && (
              <div className="flex gap-1.5 mt-2">
                {tx.flags.map(f => (
                  <span key={f} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                    <AlertTriangle className="h-2.5 w-2.5" /> {f.replace(/-/g, " ")}
                  </span>
                ))}
              </div>
            )}
          </SitaCard>
        ))}
      </div>

      <ModuleAdvisorInsight
        advisorName="Transaction Advisor"
        domain="finance"
        insight={`${stats.flagged} transaction(s) flagged for review. ${stats.aiCategorized} auto-categorized with ${(stats.avgConfidence * 100).toFixed(0)}% avg confidence.`}
        confidence={90}
      />
    </motion.div>
  );
};

export default TransactionIntelligence;
