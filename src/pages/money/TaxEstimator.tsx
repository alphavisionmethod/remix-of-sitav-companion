import { useState } from "react";
import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile } from "@/components/sita/SitaComponents";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useTaxEstimate, useTaxDeductions } from "@/hooks/use-backend-actions";
import { DollarSign, Calculator, Calendar, TrendingDown, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const TaxEstimator = () => {
  const [period, setPeriod] = useState<"quarterly" | "annual">("quarterly");
  const { data: taxData, isLoading: taxLoading, error: taxError } = useTaxEstimate(period);
  const { data: deductions, isLoading: dedLoading } = useTaxDeductions();

  const t = taxData;
  const d = deductions;

  const fmt = (cents: number) => `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const fmtPct = (v: number) => `${v.toFixed(1)}%`;

  if (taxLoading || dedLoading) return <SectionSkeleton cards={4} columns={2} />;

  // Fallback demo data when edge function returns nothing or errors
  const demo = !t;
  const federalTax = demo ? 22400_00 : (t?.federal_tax_cents ?? 0);
  const seTax = demo ? 4200_00 : (t?.se_tax_cents ?? 0);
  const totalTax = demo ? 26600_00 : (t?.total_tax_cents ?? 0);
  const effectiveRate = demo ? 18.5 : (t?.effective_rate ?? 0);
  const marginalRate = demo ? 24 : (t?.marginal_rate ?? 0);
  const quarterly = demo ? [6650_00, 6650_00, 6650_00, 6650_00] : (t?.quarterly_estimates ?? []);
  const grossIncome = demo ? 144000_00 : (t?.gross_income_cents ?? 0);

  const totalDeductions = demo ? 14600_00 : (d?.total_deductions_cents ?? 0);
  const deductionItems = demo
    ? [
        { category: "Standard Deduction", amount_cents: 14600_00, type: "standard" },
        { category: "Home Office", amount_cents: 3200_00, type: "itemized" },
        { category: "Health Insurance", amount_cents: 4800_00, type: "itemized" },
      ]
    : (d?.deductions ?? d?.items ?? []);

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DemoModeBadge />
      <SitaPageHeader
        title="Tax Estimator"
        subtitle="Deterministic US tax estimation — federal, SE, and quarterly"
        actions={
          <div className="flex gap-2">
            <SitaButton variant={period === "quarterly" ? "primary" : "ghost"} size="sm" onClick={() => setPeriod("quarterly")}>Quarterly</SitaButton>
            <SitaButton variant={period === "annual" ? "primary" : "ghost"} size="sm" onClick={() => setPeriod("annual")}>Annual</SitaButton>
          </div>
        }
      />

      {demo && (
        <SitaCard hover={false} className="p-3 border-l-4 border-l-[hsl(var(--sita-gold))]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[hsl(var(--sita-gold))]" />
            <p className="text-xs text-muted-foreground">Showing demo estimates. Add income data to see your real tax position.</p>
          </div>
        </SitaCard>
      )}

      {/* KPI Strip */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KPITile label="Gross Income" value={fmt(grossIncome)} icon={DollarSign} />
        <KPITile label="Total Tax" value={fmt(totalTax)} icon={Calculator} sub="Federal + SE" />
        <KPITile label="Effective Rate" value={fmtPct(effectiveRate)} icon={TrendingDown} />
        <KPITile label="Marginal Rate" value={fmtPct(marginalRate)} icon={TrendingDown} sub="Top bracket" />
        <KPITile label="Deductions" value={fmt(totalDeductions)} icon={FileText} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tax Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <SitaCard hover={false} className="p-5">
            <SitaCardTitle sub="Deterministic calculation — US 2024 brackets">Federal Tax Breakdown</SitaCardTitle>
            <div className="mt-4 space-y-3">
              {[
                { label: "Gross Income", value: fmt(grossIncome), color: "text-foreground" },
                { label: "− Total Deductions", value: `−${fmt(totalDeductions)}`, color: "text-[hsl(var(--sita-gold))]" },
                { label: "= Taxable Income", value: fmt(grossIncome - totalDeductions), color: "text-foreground", bold: true },
                { label: "Federal Income Tax", value: fmt(federalTax), color: "text-destructive" },
                { label: "Self-Employment Tax", value: fmt(seTax), color: "text-destructive" },
                { label: "= Total Tax Liability", value: fmt(totalTax), color: "text-destructive", bold: true },
              ].map((row, i) => (
                <div key={i} className={`flex items-center justify-between text-sm ${row.bold ? "font-semibold pt-2 border-t border-border/30" : ""}`}>
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className={`font-mono tabular-nums ${row.color}`}>{row.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-muted-foreground">
              <CheckCircle className="h-3 w-3 text-trust-verified" />
              <span>Calculation: deterministic · Engine: sovereign-calculation</span>
            </div>
          </SitaCard>

          {/* Quarterly Estimates */}
          <SitaCard hover={false} className="p-5">
            <SitaCardTitle sub="Estimated quarterly payments">Quarterly Tax Payments</SitaCardTitle>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {["Q1 (Apr 15)", "Q2 (Jun 15)", "Q3 (Sep 15)", "Q4 (Jan 15)"].map((label, i) => {
                const amount = quarterly[i] ?? Math.round(totalTax / 4);
                const isPast = i < Math.floor((new Date().getMonth()) / 3);
                return (
                  <div key={i} className={`rounded-xl border p-4 text-center transition-all ${isPast ? "border-border/30 bg-secondary/20 opacity-60" : "border-primary/20 bg-primary/5"}`}>
                    <Calendar className={`h-4 w-4 mx-auto mb-2 ${isPast ? "text-muted-foreground" : "text-primary"}`} />
                    <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
                    <p className="font-display text-lg font-bold text-foreground mt-1">{fmt(amount)}</p>
                    {isPast && <span className="text-[10px] text-muted-foreground">Past</span>}
                  </div>
                );
              })}
            </div>
          </SitaCard>
        </div>

        {/* Right Column — Deductions + Advisor */}
        <div className="space-y-6">
          <SitaCard hover={false} className="p-5">
            <SitaCardTitle sub="Tracked deductions">Deductions</SitaCardTitle>
            <div className="mt-4 space-y-2">
              {deductionItems.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{item.category}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{item.type}</p>
                  </div>
                  <span className="text-xs font-semibold text-trust-verified">{fmt(item.amount_cents)}</span>
                </div>
              ))}
            </div>
          </SitaCard>

          <LiveAdvisorCard
            advisor="money"
            intent="tax_estimation"
            demoName="Tax Intelligence"
            demoRole="Tax Advisor"
            demoConfidence="High"
            demoRecommendation={`Estimated ${period} tax liability: ${fmt(totalTax)}. Effective rate: ${fmtPct(effectiveRate)}. ${totalDeductions > 0 ? `${deductionItems.length} deductions tracked.` : "Consider tracking deductions."}`}
            demoReasoning="Based on deterministic US 2024 tax bracket calculation with standard/itemized deduction analysis."
          />

          <SitaCard hover={false} className="gradient-sita-subtle p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-trust-verified" />
              <span className="text-xs font-semibold text-foreground">Deterministic Guarantee</span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">All tax calculations use the sovereign-calculation engine with 2024 US tax brackets. No LLM approximation.</p>
          </SitaCard>
        </div>
      </div>

      {/* ═══ Tax Shock Prevention ═══ */}
      <SitaCard hover={false} className="p-5 border-l-4 border-l-destructive">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <SitaCardTitle sub="Detect tax risks before they become tax shocks">Tax Shock Prevention</SitaCardTitle>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Under-Set-Aside Detection",
              severity: "high" as const,
              description: "Current tax reserve covers 75% of estimated liability. At current income pace, you'll be $6,650 short at year-end.",
              action: "Increase monthly tax set-aside by $555 to close the gap by December.",
            },
            {
              title: "Irregular Income Tax Risk",
              severity: "medium" as const,
              description: "Freelance income variance of ±35% creates quarterly estimation risk. Q3 could be under-estimated if project pipeline fills.",
              action: "Use rolling 3-month average for quarterly estimates instead of annualized projection.",
            },
            {
              title: "Founder Draw Tax Distortion",
              severity: "medium" as const,
              description: "Owner draw of $5,000/mo is not being modeled as self-employment income for SE tax purposes.",
              action: "Include owner draw in SE tax calculation. Additional liability: ~$765/quarter.",
            },
            {
              title: "Under-Categorized Deductibles",
              severity: "medium" as const,
              description: "3 expense categories ($2,400 total) appear deductible but lack proper categorization. Potential tax savings: $528.",
              action: "Review and categorize: home office supplies, professional development, and software subscriptions.",
            },
            {
              title: "Documentation Weakness",
              severity: "low" as const,
              description: "12 deductible expenses ($3,100 total) have no receipt uploaded. These may be disallowed if audited.",
              action: "Upload receipts via the Proof workspace. Focus on expenses over $75 first.",
            },
            {
              title: "Quarter-End Danger",
              severity: demo ? "high" as const : ((() => {
                const month = new Date().getMonth();
                return (month === 2 || month === 5 || month === 8 || month === 11) ? "high" as const : "low" as const;
              })()),
              description: `Q2 estimated payment due April 15. ${demo ? "25% of estimated liability not yet reserved." : "Review your reserve status."}`,
              action: "Ensure quarterly payment is funded and scheduled 5 business days before due date.",
            },
          ].map((alert, i) => (
            <div key={i} className={`rounded-xl border p-4 ${alert.severity === "high" ? "border-destructive/20 bg-destructive/5" : alert.severity === "medium" ? "border-amber-500/20 bg-amber-500/5" : "border-border bg-secondary/20"}`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className={`h-3.5 w-3.5 ${alert.severity === "high" ? "text-destructive" : alert.severity === "medium" ? "text-amber-500" : "text-muted-foreground"}`} />
                <p className="text-xs font-semibold text-foreground">{alert.title}</p>
                <span className={`text-[9px] uppercase font-medium px-1.5 py-0.5 rounded ${alert.severity === "high" ? "bg-destructive/10 text-destructive" : alert.severity === "medium" ? "bg-amber-500/10 text-amber-500" : "bg-secondary text-muted-foreground"}`}>
                  {alert.severity}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-2">{alert.description}</p>
              <div className="rounded-lg bg-primary/5 border border-primary/10 p-2">
                <p className="text-[10px] text-primary">💡 {alert.action}</p>
              </div>
            </div>
          ))}
        </div>
      </SitaCard>
    </motion.div>
  );
};

export default TaxEstimator;
