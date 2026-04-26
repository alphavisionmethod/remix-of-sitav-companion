// truth-allow: ia-config
// ═══════════════════════════════════════════════════════════════
// SITA OS — Money Office: Financial Trust Graph
// ═══════════════════════════════════════════════════════════════

import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { KPITile } from "@/platform/sita/components/sita/SitaComponents";
import { DomainHeader } from "@/platform/sita/components/sita/primitives/DomainHeader";
import { TrustBadge } from "@/platform/sita/components/sita/TrustBadge";
import { Link2, Wallet, CreditCard, PiggyBank, Receipt, Building, AlertTriangle, DollarSign, Target, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { FinancialTrustNode, FinancialTrustEdge, TrustEdgeHealth } from "@/packages/finance-contracts/advanced-intelligence";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const healthColors: Record<TrustEdgeHealth, string> = {
  healthy: "border-trust-verified text-trust-verified bg-trust-verified/10",
  stressed: "border-[hsl(var(--sita-gold))] text-[hsl(var(--sita-gold))] bg-[hsl(var(--sita-gold))]/10",
  broken: "border-destructive text-destructive bg-destructive/10",
  unknown: "border-muted-foreground text-muted-foreground bg-secondary/40",
};

const healthBadge: Record<TrustEdgeHealth, "verified" | "review" | "degraded" | "low-confidence"> = {
  healthy: "verified", stressed: "review", broken: "degraded", unknown: "low-confidence",
};

const nodeIcons: Record<string, typeof Wallet> = {
  account: Wallet, bill: Receipt, debt: CreditCard, reserve: PiggyBank,
  income: DollarSign, tax: Building, payroll: DollarSign, card: CreditCard, goal: Target,
};

const demoNodes: FinancialTrustNode[] = [
  { id: "checking", type: "account", label: "Primary Checking", valueCents: 1240000, health: "healthy" },
  { id: "savings", type: "reserve", label: "Emergency Fund", valueCents: 225000, health: "stressed" },
  { id: "visa", type: "card", label: "Visa Platinum", valueCents: -380000, health: "stressed" },
  { id: "income-w2", type: "income", label: "W-2 Salary", valueCents: 650000, health: "healthy" },
  { id: "income-free", type: "income", label: "Freelance", valueCents: 200000, health: "stressed" },
  { id: "rent", type: "bill", label: "Rent", valueCents: -250000, health: "healthy" },
  { id: "car-loan", type: "debt", label: "Auto Loan", valueCents: -1800000, health: "healthy" },
  { id: "tax-reserve", type: "reserve", label: "Tax Reserve", valueCents: 95000, health: "stressed" },
  { id: "tax-q2", type: "tax", label: "Q2 Tax Estimate", valueCents: -165000, health: "stressed" },
  { id: "home-goal", type: "goal", label: "Home Down Payment", valueCents: 350000, health: "healthy" },
];

const demoEdges: FinancialTrustEdge[] = [
  { from: "income-w2", to: "checking", relationship: "funds", health: "healthy", description: "Salary deposits to checking" },
  { from: "income-free", to: "checking", relationship: "funds", health: "stressed", description: "Freelance income — irregular timing" },
  { from: "checking", to: "rent", relationship: "pays", health: "healthy", description: "Auto-pay covers rent" },
  { from: "checking", to: "visa", relationship: "pays", health: "stressed", description: "Credit card payment — utilization high" },
  { from: "checking", to: "savings", relationship: "funds", health: "stressed", description: "Reserve contributions below target" },
  { from: "checking", to: "car-loan", relationship: "pays", health: "healthy", description: "Auto-pay active on loan" },
  { from: "savings", to: "home-goal", relationship: "supports", health: "healthy", description: "Savings contribute to home goal" },
  { from: "tax-reserve", to: "tax-q2", relationship: "covers", health: "stressed", description: "Tax reserve only 58% of Q2 obligation" },
  { from: "visa", to: "checking", relationship: "drains", health: "stressed", description: "Interest charges consume cash" },
  { from: "income-w2", to: "tax-q2", relationship: "creates obligation", health: "healthy", description: "Income generates tax liability" },
];

const TrustGraph = () => {
  const integrity = Math.round(
    (demoEdges.filter(e => e.health === "healthy").length / demoEdges.length) * 100
  );
  const stressedCount = demoEdges.filter(e => e.health === "stressed" || e.health === "broken").length;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <DomainHeader domain="money" title="Financial Trust Graph" subtitle="Visualize dependencies between your financial obligations" />
      <PageTruthBanner truthState="partial" />
<div className="grid gap-3 sm:grid-cols-3">
        <KPITile label="Graph Integrity" value={`${integrity}%`} icon={Link2} sub={`${demoNodes.length} nodes`} />
        <KPITile label="Dependencies" value={demoEdges.length} icon={ArrowRight} sub="Financial links" />
        <KPITile label="Stressed Links" value={stressedCount} icon={AlertTriangle} sub="Need attention" />
      </div>

      {/* Node Grid */}
      <SitaSectionHeader title="Financial Nodes" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {demoNodes.map(node => {
          const Icon = nodeIcons[node.type] || Wallet;
          const colors = healthColors[node.health];
          return (
            <SitaCard key={node.id} hover className={`p-3 border ${colors.split(" ").slice(0, 1).join(" ")}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`rounded-lg p-1.5 ${colors.split(" ").slice(2).join(" ")}`}>
                  <Icon className={`h-3.5 w-3.5 ${colors.split(" ").slice(1, 2).join(" ")}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{node.label}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{node.type}</p>
                </div>
              </div>
              <p className={`text-sm font-bold ${node.valueCents >= 0 ? "text-foreground" : "text-destructive"}`}>
                {node.valueCents >= 0 ? "" : "-"}${Math.abs(node.valueCents / 100).toLocaleString()}
              </p>
              <TrustBadge level={healthBadge[node.health]} size="sm" className="mt-1" />
            </SitaCard>
          );
        })}
      </div>

      {/* Dependency Edges */}
      <SitaSectionHeader title="Financial Dependencies" />
      <div className="space-y-2">
        {demoEdges.map((edge, i) => {
          const fromNode = demoNodes.find(n => n.id === edge.from);
          const toNode = demoNodes.find(n => n.id === edge.to);
          const colors = healthColors[edge.health];
          return (
            <SitaCard key={i} hover className="p-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <span className="text-xs font-semibold text-foreground truncate">{fromNode?.label}</span>
                  <ArrowRight className={`h-3 w-3 shrink-0 ${colors.split(" ").slice(1, 2).join(" ")}`} />
                  <span className="text-xs font-semibold text-foreground truncate">{toNode?.label}</span>
                </div>
                <span className="text-[10px] text-muted-foreground capitalize shrink-0">{edge.relationship}</span>
                <TrustBadge level={healthBadge[edge.health]} size="sm" />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 ml-0.5">{edge.description}</p>
            </SitaCard>
          );
        })}
      </div>
    </motion.div>
  );
};

export default TrustGraph;
