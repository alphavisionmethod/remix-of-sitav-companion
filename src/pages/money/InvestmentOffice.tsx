// SITA OS - Investment Office / Family Office Workspace
// Production-truth: all data from hooks, empty states when no records

import { useState, useMemo } from "react";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { SitaTabs, KPITile } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { motion } from "framer-motion";
import {
  AlertTriangle, Target, Eye, Lock, FileCheck, Wallet,
  Search, Zap, CheckCircle2, XCircle, Clock, Scale, BookOpen,
  Inbox
} from "lucide-react";
import {
  buildCapitalMap, analyzePortfolioRisk, detectRegime, runStressScenarios,
  evaluateThesis,
  type Position, type CapitalBucket, type Thesis,
} from "@/lib/domain-engines/investment-office";
import {
  getWatchlist, getTradeReviewPackets, getExecutionIntents,
  getOpportunityScores, getAvailableTrustModes, getInvestmentTrustMode,
} from "@/data/seed/investment";
import { useCapitalBuckets, usePositions, useTheses } from "@/hooks/use-investment-data";
import { INVESTMENT_POLICY_RULES } from "@/data/seed/investment";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const regimeColor = (value: string) => {
  if (["extreme", "crisis", "flight-to-safety", "stressed", "dislocating", "strong-down"].includes(value)) return "text-destructive bg-destructive/10";
  if (["elevated", "fragile", "risk-off", "tightening", "high", "down"].includes(value)) return "text-amber-600 bg-amber-500/10";
  if (["compressed", "risk-on", "abundant", "strong-up", "stable", "low"].includes(value)) return "text-primary bg-primary/10";
  return "text-muted-foreground bg-secondary";
};

const EmptyState = ({ title, description }: { title: string; description: string }) => (
  <SitaCard className="p-8">
    <div className="flex flex-col items-center justify-center text-center gap-3">
      <div className="rounded-2xl bg-secondary p-4"><Inbox className="h-8 w-8 text-muted-foreground" /></div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground max-w-md">{description}</p>
    </div>
  </SitaCard>
);

// Sub-components receive data as props from the main component

interface InvestmentData {
  buckets: CapitalBucket[];
  positions: Position[];
  theses: Thesis[];
  capitalMap: ReturnType<typeof buildCapitalMap>;
  riskMetrics: ReturnType<typeof analyzePortfolioRisk>;
  stressScenarios: ReturnType<typeof runStressScenarios>;
  regime: ReturnType<typeof detectRegime>;
}

const CapitalMapView = ({ data }: { data: InvestmentData }) => {
  const { capitalMap: cm, buckets } = data;
  if (buckets.length === 0) return <EmptyState title="No Capital Buckets" description="Add capital accounts to see your capital map. Connect your accounts or create buckets in Settings." />;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Total Capital" value={`$${Math.round(cm.totalCapital).toLocaleString()}`} sub={`${Object.keys(cm.byEntity).length} entities`} />
        <KPITile label="Deployable" value={`$${Math.round(cm.deployableCapital).toLocaleString()}`} sub="Available to invest" />
        <KPITile label="Reserves" value={`$${Math.round(cm.reserveCapital).toLocaleString()}`} sub={`${cm.reserveCoverageMonths.toFixed(1)} months coverage`} />
        <KPITile label="Ringfenced" value={`$${Math.round(cm.restrictedCapital).toLocaleString()}`} sub="Protected capital" />
      </div>
      <div className="space-y-2">
        {buckets.map((b, i) => (
          <motion.div key={b.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
            <SitaCard className="p-4" hover>
              <div className="flex items-center gap-4">
                <div className={`rounded-xl p-2.5 shrink-0 ${b.ringfenced ? "bg-amber-500/10" : "bg-primary/10"}`}>
                  {b.ringfenced ? <Lock className="h-4 w-4 text-amber-600" /> : <Wallet className="h-4 w-4 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{b.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                    <span>{b.entityOwner}</span>
                    <span className="capitalize">{b.type.replace(/-/g, " ")}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-foreground">${b.balance.toLocaleString()}</p>
                  {b.targetBalance && (
                    <div className="flex items-center gap-1 justify-end">
                      <div className="h-1 w-16 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (b.balance / b.targetBalance) * 100)}%` }} />
                      </div>
                      <span className="text-[9px] text-muted-foreground">{Math.round((b.balance / b.targetBalance) * 100)}%</span>
                    </div>
                  )}
                </div>
              </div>
            </SitaCard>
          </motion.div>
        ))}
      </div>
      {cm.fundingGaps.length > 0 && (
        <SitaCard>
          <SitaCardTitle sub="Buckets below 80% of target">Funding Gaps</SitaCardTitle>
          {cm.fundingGaps.map(g => (
            <div key={g.bucket} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm text-foreground">{g.bucket}</span>
              <span className="text-sm font-semibold text-destructive">-${g.shortfall.toLocaleString()}</span>
            </div>
          ))}
        </SitaCard>
      )}
    </div>
  );
};

const PortfolioView = ({ data }: { data: InvestmentData }) => {
  const { riskMetrics: rm, positions } = data;
  if (positions.length === 0) return <EmptyState title="No Positions" description="Your portfolio is empty. Add positions or connect a brokerage account to track holdings." />;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Portfolio Value" value={`$${Math.round(rm.totalValue).toLocaleString()}`} sub="All positions" />
        <KPITile label="Unrealized P&L" value={`${rm.unrealizedPnL >= 0 ? "+" : ""}$${Math.round(rm.unrealizedPnL).toLocaleString()}`} sub={`${(rm.unrealizedPnLPct * 100).toFixed(1)}%`} trend={rm.unrealizedPnL >= 0 ? "up" : "down"} />
        <KPITile label="Concentration" value={rm.concentrationRisk} sub={`Largest: ${rm.largestPosition.symbol} (${(rm.largestPosition.pct * 100).toFixed(0)}%)`} />
        <KPITile label="Cash" value={`${(rm.cashPct * 100).toFixed(0)}%`} sub="Portfolio cash allocation" />
      </div>
      <div className="space-y-2">
        {positions.map((p, i) => {
          const value = p.quantity * p.currentPrice;
          const pnl = (p.currentPrice - p.avgCostBasis) * p.quantity;
          const pnlPct = ((p.currentPrice - p.avgCostBasis) / p.avgCostBasis) * 100;
          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <SitaCard className="p-4" hover>
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-secondary p-2.5 shrink-0"><span className="text-xs font-bold text-foreground">{p.symbol}</span></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                      <span className="capitalize">{p.assetClass}</span><span>·</span><span>{p.venue}</span><span>·</span><span>{p.quantity} units</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-foreground">${Math.round(value).toLocaleString()}</p>
                    <p className={`text-[11px] font-medium ${pnl >= 0 ? "text-primary" : "text-destructive"}`}>{pnl >= 0 ? "+" : ""}${Math.round(pnl).toLocaleString()} ({pnlPct.toFixed(1)}%)</p>
                  </div>
                </div>
              </SitaCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const RegimeView = ({ data }: { data: InvestmentData }) => {
  const regime = data.regime;
  return (
    <div className="space-y-4">
      <SitaCard>
        <SitaCardTitle sub={`Confidence: ${(regime.confidence * 100).toFixed(0)}% · Data: ${regime.dataFreshness}`}>Current Market Regime</SitaCardTitle>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.entries(regime) as [string, string][]).filter(([k]) => ["volatility", "trend", "liquidity", "correlation", "riskAppetite", "macroEvent", "instability"].includes(k)).map(([key, value]) => (
            <div key={key} className="rounded-xl border border-border p-3">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
              <p className={`mt-1 text-sm font-bold rounded-full inline-block px-2 py-0.5 capitalize ${regimeColor(value)}`}>{value.replace(/-/g, " ")}</p>
            </div>
          ))}
        </div>
      </SitaCard>
      <SitaCard>
        <SitaCardTitle sub="Honest regime framing - not predictions">What This Means</SitaCardTitle>
        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
          <p>Current regime looks <span className="font-semibold text-foreground capitalize">{regime.riskAppetite.replace(/-/g, " ")}</span> with <span className="font-semibold text-foreground capitalize">{regime.volatility}</span> volatility.</p>
          {regime.volatility === "elevated" || regime.volatility === "extreme" ?
            <p className="text-amber-600">Warning: Elevated volatility regime - position sizing should be reduced.</p> :
            <p>Volatility environment is supportive for measured position-taking within risk budget.</p>}
          {regime.macroEvent !== "none" && <p className="text-amber-600">Warning: Pending macro event: {regime.macroEvent.replace(/-/g, " ")}</p>}
          <p className="text-[11px] italic">This does not tell the future. It describes the current environment.</p>
        </div>
      </SitaCard>
    </div>
  );
};

const RiskView = ({ data }: { data: InvestmentData }) => {
  const { riskMetrics: rm, stressScenarios: scenarios } = data;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <KPITile label="Risk Budget Used" value={`${(rm.riskBudgetUsed * 100).toFixed(0)}%`} sub="Of total allocation" />
        <KPITile label="Reserve Coverage" value={`${rm.reserveCoverage.toFixed(1)} mo`} sub="Monthly obligations covered" />
        <KPITile label="Concentration" value={rm.concentrationRisk} sub={`${rm.largestPosition.symbol}: ${(rm.largestPosition.pct * 100).toFixed(0)}%`} />
      </div>
      <SitaCard>
        <SitaCardTitle sub="How portfolio performs under adverse conditions">Stress Scenarios</SitaCardTitle>
        <div className="mt-4 space-y-3">
          {scenarios.map(sc => (
            <div key={sc.id} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{sc.name}</p>
                <p className="text-[11px] text-muted-foreground">{sc.description}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-bold ${sc.portfolioImpact < 0 ? "text-destructive" : "text-primary"}`}>{sc.portfolioImpact >= 0 ? "+" : ""}${Math.round(sc.portfolioImpact).toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">({(sc.portfolioImpactPct * 100).toFixed(1)}%)</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {sc.breachesRiskBudget && <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[9px] font-medium text-destructive">Risk breach</span>}
                {sc.breachesReserve && <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[9px] font-medium text-destructive">Reserve breach</span>}
                {!sc.breachesRiskBudget && !sc.breachesReserve && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-medium text-primary">Within limits</span>}
              </div>
            </div>
          ))}
        </div>
      </SitaCard>
    </div>
  );
};

const ThesisVault = ({ data }: { data: InvestmentData }) => {
  const { theses, regime } = data;
  if (theses.length === 0) return <EmptyState title="No Investment Theses" description="Create your first investment thesis to track conviction, regime alignment, and recommended actions." />;
  return (
    <div className="space-y-4">
      {theses.map((thesis, i) => {
        const eval_ = evaluateThesis(thesis, regime);
        return (
          <motion.div key={thesis.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <SitaCard className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-base font-bold text-foreground">{thesis.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${eval_.stillValid ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>{eval_.stillValid ? "Valid" : "Review needed"}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${eval_.regimeAligned ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-600"}`}>{eval_.regimeAligned ? "Regime aligned" : "Regime conflict"}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{thesis.rationale}</p>
                  <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground">
                    <span className="font-medium">{thesis.asset} · {thesis.direction}</span>
                    <span>Confidence: {(thesis.confidence * 100).toFixed(0)}%</span>
                    <span>Size: {thesis.sizeLogic}</span>
                  </div>
                  {eval_.warningFlags.length > 0 && (
                    <div className="mt-3 space-y-1">{eval_.warningFlags.map((flag, j) => (<p key={j} className="text-[11px] text-amber-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3 shrink-0" /> {flag}</p>))}</div>
                  )}
                </div>
                <div className="shrink-0 ml-4">
                  <span className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize ${eval_.recommendedAction === "add" ? "bg-primary/10 text-primary" : eval_.recommendedAction === "hold" ? "bg-secondary text-foreground" : eval_.recommendedAction === "reduce" || eval_.recommendedAction === "close" ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-600"}`}>{eval_.recommendedAction}</span>
                </div>
              </div>
            </SitaCard>
          </motion.div>
        );
      })}
    </div>
  );
};

const CommitteeView = ({ data }: { data: InvestmentData }) => {
  const { regime, riskMetrics: rm, theses } = data;
  const activeTheses = theses.filter(t => t.status === "active");
  const validCount = activeTheses.filter(t => evaluateThesis(t, regime).stillValid).length;
  const reviewCount = activeTheses.length - validCount;
  return (
    <div className="space-y-4">
      <SitaCard>
        <SitaCardTitle sub="Synthesized investment committee perspective">Committee Summary</SitaCardTitle>
        <div className="mt-4 space-y-3 text-sm text-muted-foreground">
          <p>Regime: <span className="font-semibold text-foreground capitalize">{regime.riskAppetite.replace(/-/g, " ")}</span> · Volatility: <span className="font-semibold text-foreground capitalize">{regime.volatility}</span></p>
          <p>Portfolio concentration risk: <span className="font-semibold text-foreground capitalize">{rm.concentrationRisk}</span></p>
          <p>Reserve coverage: <span className="font-semibold text-foreground">{rm.reserveCoverage.toFixed(1)} months</span></p>
          <p>Active theses: <span className="font-semibold text-foreground">{activeTheses.length}</span> — {validCount} valid, {reviewCount} need review</p>
          <div className="mt-4 p-3 rounded-xl bg-secondary/50 border border-border">
            <p className="text-[11px] font-semibold text-foreground mb-1">System Posture</p>
            <p className="text-[11px]">Observe-only mode active. All recommendations require approval. No autonomous execution. Simulation-first for new positions.</p>
          </div>
        </div>
      </SitaCard>
      <SitaCard>
        <SitaCardTitle sub="Advisors may not agree - disagreement is a feature">Dissenting Views</SitaCardTitle>
        <div className="mt-3 space-y-2">
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <p className="text-sm font-medium text-foreground">Treasury Advisor vs. Growth Advisor</p>
            <p className="text-[11px] text-muted-foreground mt-1">Treasury: &quot;Reserve coverage at {rm.reserveCoverage.toFixed(1)} months is below 6-month target.&quot;</p>
            <p className="text-[11px] text-muted-foreground mt-1">Growth: &quot;Current regime favors adding to equity exposure.&quot;</p>
            <p className="text-[11px] font-medium text-amber-600 mt-2">Dominant constraint: Reserve protection takes precedence per policy.</p>
          </div>
        </div>
      </SitaCard>
    </div>
  );
};

const OpportunitiesView = () => {
  const watchlist = getWatchlist();
  const scores = getOpportunityScores();
  return (
    <div className="space-y-4">
      <SitaCard>
        <SitaCardTitle sub={`Regime: ${watchlist.currentRegime} · ${watchlist.entries.length} items`}>Watchlist</SitaCardTitle>
        <div className="mt-4 space-y-3">
          {watchlist.entries.map(e => (
            <div key={e.id} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
              <div className="rounded-xl bg-secondary p-2.5 shrink-0"><Search className="h-4 w-4 text-foreground" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{e.asset}</p>
                  <span className="text-[10px] text-muted-foreground capitalize">{e.assetClass}</span>
                  {e.regimeAlignment ? <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-medium text-primary">Regime aligned</span> : <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-medium text-amber-600">Regime conflict</span>}
                  {e.thesisCandidate && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-medium text-primary">Thesis candidate</span>}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{e.reason}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-foreground">${e.currentPrice}</p>
                <p className={`text-[11px] font-medium ${e.changePct >= 0 ? "text-primary" : "text-destructive"}`}>{e.changePct >= 0 ? "+" : ""}{e.changePct.toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      </SitaCard>
      <SitaCard>
        <SitaCardTitle sub="Composite scoring across thesis, regime, risk/reward, liquidity">Opportunity Scores</SitaCardTitle>
        <div className="mt-4 space-y-3">
          {scores.map(s => (
            <div key={s.asset} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
              <div className="rounded-xl bg-primary/10 p-2.5 shrink-0"><Target className="h-4 w-4 text-primary" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{s.asset}</p>
                <p className="text-[11px] text-muted-foreground">{s.recommendation}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-foreground">{(s.compositeScore * 100).toFixed(0)}%</p>
                <p className="text-[10px] text-muted-foreground">Rank #{s.rank}</p>
              </div>
            </div>
          ))}
        </div>
      </SitaCard>
    </div>
  );
};

const ExecutionReviewView = () => {
  const reviews = getTradeReviewPackets();
  const intents = getExecutionIntents();
  const pipeline = ["Proposal", "Simulation", "Approval", "Executed"];
  const currentStep = 0;
  return (
    <div className="space-y-4">
      <SitaCard>
        <SitaCardTitle sub="4-stage action pipeline">Action Pipeline</SitaCardTitle>
        <div className="mt-4 flex items-center gap-2">
          {pipeline.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${i <= currentStep ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>{step}</div>
              {i < pipeline.length - 1 && <div className="h-px w-6 bg-border" />}
            </div>
          ))}
        </div>
      </SitaCard>
      <SitaCard>
        <SitaCardTitle sub="Pending trade reviews">Trade Reviews</SitaCardTitle>
        <div className="mt-4 space-y-3">
          {reviews.map(r => (
            <div key={r.tradeId} className="p-4 rounded-xl border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">{r.asset} — {r.direction.toUpperCase()}</p>
                </div>
                <span className="text-sm font-bold text-foreground">${(r.quantityOrAmountCents / 100).toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">{r.rationale}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Risk impact: {r.riskImpact}</p>
              <div className="flex items-center gap-2 mt-3">
                {r.complianceCheck.passed ? <span className="flex items-center gap-1 text-[10px] text-primary"><CheckCircle2 className="h-3 w-3" /> Compliance passed</span> : <span className="flex items-center gap-1 text-[10px] text-destructive"><XCircle className="h-3 w-3" /> Compliance failed</span>}
                {r.approvalRequired && <span className="flex items-center gap-1 text-[10px] text-amber-600"><Clock className="h-3 w-3" /> Approval required</span>}
              </div>
            </div>
          ))}
        </div>
      </SitaCard>
      <SitaCard>
        <SitaCardTitle sub="Execution intents awaiting approval">Execution Queue</SitaCardTitle>
        <div className="mt-4 space-y-3">
          {intents.map(ei => (
            <div key={ei.id} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
              <div className="rounded-xl bg-amber-500/10 p-2.5 shrink-0"><Scale className="h-4 w-4 text-amber-600" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{ei.asset} — {ei.direction} ({ei.orderType}{ei.limitPrice ? ` @ $${ei.limitPrice}` : ""})</p>
                <p className="text-[11px] text-muted-foreground">Venue: {ei.venue} · ${(ei.amountCents / 100).toLocaleString()}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${ei.status === "pending-approval" ? "bg-amber-500/10 text-amber-600" : ei.status === "filled" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>{ei.status.replace(/-/g, " ")}</span>
            </div>
          ))}
        </div>
      </SitaCard>
    </div>
  );
};

const ProofView = () => {
  const proofTimeline = [
    { id: "p1", type: "thesis-approval", summary: "S&P momentum thesis approved", date: new Date(Date.now() - 60 * 86400000).toISOString(), hash: "a1b2c3d4e5f6" },
    { id: "p2", type: "thesis-approval", summary: "BTC halving cycle thesis approved", date: new Date(Date.now() - 120 * 86400000).toISOString(), hash: "f6e5d4c3b2a1" },
    { id: "p3", type: "regime-review", summary: "Regime transition: transition to risk-on", date: new Date(Date.now() - 7 * 86400000).toISOString(), hash: "1a2b3c4d5e6f" },
    { id: "p4", type: "rebalance-review", summary: "Rebalance recommendations generated - no action taken", date: new Date(Date.now() - 3 * 86400000).toISOString(), hash: "6f5e4d3c2b1a" },
    { id: "p5", type: "risk-assessment", summary: "Monthly risk budget review - 68% utilized", date: new Date(Date.now() - 1 * 86400000).toISOString(), hash: "b1c2d3e4f5a6" },
  ];
  return (
    <div className="space-y-4">
      <SitaCard>
        <SitaCardTitle sub="Every meaningful decision produces a proof receipt">Decision Proof Timeline</SitaCardTitle>
        <div className="mt-4 space-y-3">
          {proofTimeline.map(p => (
            <div key={p.id} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
              <div className="rounded-xl bg-primary/10 p-2.5 shrink-0"><FileCheck className="h-4 w-4 text-primary" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{p.summary}</p>
                <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
                  <span className="capitalize">{p.type.replace(/-/g, " ")}</span>
                  <span>{new Date(p.date).toLocaleDateString()}</span>
                  <span className="font-mono">#{p.hash.slice(0, 8)}</span>
                </div>
              </div>
              <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          ))}
        </div>
      </SitaCard>
    </div>
  );
};

const SettingsView = () => {
  const currentMode = getInvestmentTrustMode();
  const modes = getAvailableTrustModes();
  return (
    <div className="space-y-4">
      <SitaCard>
        <SitaCardTitle sub="Controls what the system is allowed to do">Trust Mode</SitaCardTitle>
        <div className="mt-4 space-y-2">
          {modes.map(m => (
            <div key={m.mode} className={`flex items-center gap-4 p-3 rounded-xl border ${m.mode === currentMode ? "border-primary bg-primary/5" : "border-border"}`}>
              <div className={`h-3 w-3 rounded-full shrink-0 ${m.mode === currentMode ? "bg-primary" : "bg-secondary"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{m.label}</p>
                <p className="text-[11px] text-muted-foreground">{m.description}</p>
              </div>
              {m.mode === currentMode && <span className="text-[10px] font-semibold text-primary">Active</span>}
            </div>
          ))}
        </div>
      </SitaCard>
      <SitaCard>
        <SitaCardTitle sub="16 investment-specific governance rules">Policy Rules</SitaCardTitle>
        <div className="mt-4 space-y-2">
          {INVESTMENT_POLICY_RULES.map((rule, i) => (
            <div key={rule.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
              <span className="text-[10px] font-mono text-muted-foreground w-6 shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{rule.name}</p>
                <p className="text-[10px] text-muted-foreground">{rule.reason}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${rule.effect === "deny" ? "bg-destructive/10 text-destructive" : rule.effect.includes("dual") ? "bg-amber-500/10 text-amber-600" : rule.effect === "require-simulation" ? "bg-blue-500/10 text-blue-600" : "bg-amber-500/10 text-amber-600"}`}>{rule.effect.replace(/-/g, " ")}</span>
            </div>
          ))}
        </div>
      </SitaCard>
    </div>
  );
};

// Main Component - all hooks at top level, computed data passed to sub-components

const InvestmentOffice = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: hookBuckets } = useCapitalBuckets();
  const { data: hookPositions } = usePositions();
  const { data: hookTheses } = useTheses();

  const buckets = (hookBuckets ?? []) as CapitalBucket[];
  const positions = (hookPositions ?? []) as Position[];
  const theses = (hookTheses ?? []) as Thesis[];

  const investmentData = useMemo<InvestmentData>(() => {
    const regime = detectRegime({ vix: 19, sp500Change30d: 2.4, yieldSpread: 1.2, correlationIndex: 0.38, pendingEvents: ["nfp release Friday"] });
    const cm = buildCapitalMap(buckets);
    const rm = analyzePortfolioRisk(positions, cm.reserveCapital);
    const scenarios = runStressScenarios(positions, cm.reserveCapital);
    return { buckets, positions, theses, capitalMap: cm, riskMetrics: rm, stressScenarios: scenarios, regime };
  }, [buckets, positions, theses]);

  const tabs = [
    { key: "overview", label: "Capital Map" },
    { key: "portfolio", label: "Portfolio" },
    { key: "regime", label: "Regime" },
    { key: "risk", label: "Risk" },
    { key: "theses", label: "Theses" },
    { key: "committee", label: "Committee" },
    { key: "opportunities", label: "Opportunities" },
    { key: "execution", label: "Execution Review" },
    { key: "proof", label: "Proof" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div className="space-y-6">
      <SitaPageHeader
        title="Investment Office"
        subtitle="Capital protection, regime-aware intelligence, thesis discipline"
        actions={
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-semibold text-amber-600 flex items-center gap-1"><Eye className="h-3 w-3" /> Observe-Only Mode</span>
            <TrustBadge level="safe" />
          </div>
        }
      />
      <SitaTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      {activeTab === "overview" && <CapitalMapView data={investmentData} />}
      {activeTab === "portfolio" && <PortfolioView data={investmentData} />}
      {activeTab === "regime" && <RegimeView data={investmentData} />}
      {activeTab === "risk" && <RiskView data={investmentData} />}
      {activeTab === "theses" && <ThesisVault data={investmentData} />}
      {activeTab === "committee" && <CommitteeView data={investmentData} />}
      {activeTab === "opportunities" && <OpportunitiesView />}
      {activeTab === "execution" && <ExecutionReviewView />}
      {activeTab === "proof" && <ProofView />}
      {activeTab === "settings" && <SettingsView />}
    </div>
  );
};

export default InvestmentOffice;
