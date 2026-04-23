// ═══════════════════════════════════════════════════════════════
// SITA OS — Integration Concierge Page
// Use-case-first connector wizard with guided setup
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wifi, Zap, DollarSign, Calendar, Users, Package, CheckCircle2,
  ArrowRight, Shield, Search, Star, ChevronRight, Sparkles,
  RefreshCw, HeartPulse, BarChart3, Clock, Eye, Lock,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useOSRuntime } from "@/hooks/useOSRuntime";
import type { ConnectorUseCase } from "@/domains/engines/connector-concierge";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const CATEGORIES: any[] = [];

// Production fallback — seed data removed
const BUNDLES: any[] = [];

// ── Category Config ────────────────────────────────────────────
// ── Use Case Card ──────────────────────────────────────────────
function UseCaseCard({ useCase, onSelect }: { useCase: ConnectorUseCase; onSelect: () => void }) {
  const difficultyColor = { easy: "text-trust-safe", moderate: "text-accent", advanced: "text-destructive" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="group rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-5 cursor-pointer hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all"
      onClick={onSelect}
    >
<div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {useCase.connectors.map(c => (
            <span key={c.connectorId} className="text-lg">{c.icon}</span>
          ))}
        </div>
        <Badge variant="outline" className={cn("text-[9px]", difficultyColor[useCase.difficulty])}>
          {useCase.difficulty} · {useCase.estimatedSetupMinutes}m
        </Badge>
      </div>

      <h3 className="text-sm font-bold text-foreground font-display mb-1 group-hover:text-primary transition-colors">
        {useCase.title}
      </h3>
      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{useCase.description}</p>

      <div className="flex items-center gap-1.5 mb-3">
        <Star className="h-3 w-3 text-sita-gold" />
        <span className="text-[10px] text-sita-gold font-medium">{useCase.valueProposition}</span>
      </div>

      <div className="space-y-1 mb-4">
        {useCase.previewWorkflows.slice(0, 3).map((wf, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 text-trust-safe shrink-0" />
            <span>{wf}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/30">
        <div className="flex gap-1">
          {useCase.connectors.map(c => (
            <span key={c.connectorId} className="text-[9px] px-1.5 py-0.5 rounded-md bg-secondary/50 text-muted-foreground">
              {c.name}
            </span>
          ))}
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </motion.div>
  );
}

// ── Setup Wizard ───────────────────────────────────────────────
function SetupWizard({ useCase, onClose }: { useCase: ConnectorUseCase; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const steps = ["Permissions", "Preview", "Connect", "First Workflow"];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl rounded-2xl border border-border/50 bg-card shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-foreground font-display">{useCase.title}</h2>
            <p className="text-xs text-muted-foreground">{useCase.description}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold transition-all",
                i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {i < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={cn("text-[10px]", i <= step ? "text-foreground" : "text-muted-foreground")}>{s}</span>
              {i < steps.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground/50" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[280px] mb-6">
          {step === 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">What SITA needs access to</h3>
              {useCase.connectors.map(c => (
                <div key={c.connectorId} className="rounded-xl border border-border/40 bg-secondary/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{c.icon}</span>
                    <span className="text-sm font-semibold text-foreground">{c.name}</span>
                    <Lock className="h-3 w-3 text-trust-safe ml-auto" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{c.permissionExplanation}</p>
                  <div className="flex flex-wrap gap-1">
                    {c.requiredScopes.map(s => (
                      <Badge key={s} variant="outline" className="text-[9px] border-primary/30 text-primary">{s}</Badge>
                    ))}
                    {c.optionalScopes.map(s => (
                      <Badge key={s} variant="outline" className="text-[9px] border-muted text-muted-foreground">optional: {s}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Data SITA will import</h3>
              {useCase.connectors.map(c => (
                <div key={c.connectorId} className="space-y-2">
                  <p className="text-xs font-semibold text-foreground">{c.name}</p>
                  {c.dataPreview.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-secondary/30 px-3 py-2 text-xs text-foreground">
                      <Eye className="h-3 w-3 text-primary shrink-0" />
                      {d}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center justify-center h-full py-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Wifi className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-1">Ready to Connect</h3>
              <p className="text-xs text-muted-foreground text-center max-w-sm mb-4">
                Click connect to authorize SITA. You'll be redirected to sign in with each service. Estimated time: {useCase.estimatedSetupMinutes} minutes.
              </p>
              <div className="flex gap-3">
                {useCase.connectors.map(c => (
                  <div key={c.connectorId} className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-xs text-primary font-medium">
                    <span>{c.icon}</span> {c.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl bg-trust-verified/10 border border-trust-verified/20 p-4">
                <CheckCircle2 className="h-6 w-6 text-trust-safe" />
                <div>
                  <p className="text-sm font-bold text-foreground">Connected Successfully</p>
                  <p className="text-xs text-muted-foreground">Your first workflows are being set up</p>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-foreground">Active Workflows</h3>
              {useCase.previewWorkflows.map((wf, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-secondary/20 px-3 py-2.5">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                    <Zap className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-xs text-foreground flex-1">{wf}</span>
                  <Badge variant="outline" className="text-[9px] text-trust-safe border-trust-safe/30">active</Badge>
                </div>
              ))}
              <div className="rounded-xl border border-sita-gold/20 bg-sita-gold/5 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-3.5 w-3.5 text-sita-gold" />
                  <span className="text-xs font-semibold text-sita-gold">Estimated Value</span>
                </div>
                <p className="text-xs text-muted-foreground">{useCase.valueProposition}</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-border/30">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : onClose()}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {step === 0 ? "Cancel" : "Back"}
          </button>
          <button
            onClick={() => step < steps.length - 1 ? setStep(step + 1) : onClose()}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {step === steps.length - 1 ? "Done" : step === 2 ? "Connect" : "Next"}
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Bundle Card ────────────────────────────────────────────────
function BundleCard({ bundle, onSelect }: { bundle: typeof BUNDLES[0]; onSelect: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card p-5 cursor-pointer hover:border-primary/30 transition-all"
      onClick={onSelect}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{bundle.icon}</span>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-foreground font-display">{bundle.name}</h3>
          <p className="text-[10px] text-muted-foreground">{bundle.description}</p>
        </div>
        <Badge className="bg-sita-gold/10 text-sita-gold border-sita-gold/20 text-[9px]">{bundle.savings}</Badge>
      </div>
      <div className="flex items-center gap-1.5">
        <Package className="h-3 w-3 text-primary" />
        <span className="text-[10px] text-muted-foreground">{bundle.useCases.length} integrations included</span>
        <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto" />
      </div>
    </motion.div>
  );
}

// ── Connected Status Panel ─────────────────────────────────────
function ConnectedPanel() {
  const connected = [
    { name: "Gmail", icon: "📧", health: 98, lastSync: "2m ago", records: 1420 },
    { name: "Google Calendar", icon: "📅", health: 100, lastSync: "5m ago", records: 89 },
    { name: "Stripe", icon: "💳", health: 95, lastSync: "10m ago", records: 342 },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <HeartPulse className="h-4 w-4 text-trust-safe" />
        <h3 className="text-sm font-bold text-foreground font-display">Connected Integrations</h3>
      </div>
      {connected.map(c => (
        <div key={c.name} className="flex items-center gap-3 rounded-xl border border-border/30 bg-card/60 p-3">
          <span className="text-lg">{c.icon}</span>
          <div className="flex-1">
            <p className="text-xs font-semibold text-foreground">{c.name}</p>
            <p className="text-[10px] text-muted-foreground">{c.records} records · synced {c.lastSync}</p>
          </div>
          <div className="text-right">
            <p className={cn("text-sm font-bold font-display", c.health >= 90 ? "text-trust-safe" : "text-accent")}>{c.health}%</p>
            <p className="text-[9px] text-muted-foreground">health</p>
          </div>
        </div>
      ))}
      <div className="rounded-xl border border-border/30 bg-secondary/20 p-3 text-center">
        <p className="text-[10px] text-muted-foreground mb-1">Next recommended integration</p>
        <p className="text-xs font-semibold text-primary">QuickBooks — Unlock cash flow forecasting →</p>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function IntegrationConcierge() {
  const { engines } = useOSRuntime();
  const [category, setCategory] = useState("all");
  const [activeUseCase, setActiveUseCase] = useState<ConnectorUseCase | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const useCases = useMemo(() => {
    let list = category === "all"
      ? engines.integrations.getUseCases()
      : engines.integrations.getUseCases(category);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(u => u.title.toLowerCase().includes(q) || u.description.toLowerCase().includes(q));
    }
    return list;
  }, [category, searchQuery, engines.integrations]);

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto space-y-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-card to-card p-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
            <Wifi className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground font-display">Integration Concierge</h1>
            <p className="text-sm text-muted-foreground">Tell SITA what you want to do — we'll handle the technical setup</p>
          </div>
          <div className="hidden md:flex items-center gap-2 rounded-xl bg-secondary/40 px-3 py-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search integrations..."
              className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-40"
            />
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="use-cases">
        <TabsList className="bg-muted/30 border border-border/40 h-9 p-0.5">
          <TabsTrigger value="use-cases" className="text-[11px] h-8 px-3 data-[state=active]:bg-card">
            <Sparkles className="h-3 w-3 mr-1.5" />Use Cases
          </TabsTrigger>
          <TabsTrigger value="bundles" className="text-[11px] h-8 px-3 data-[state=active]:bg-card">
            <Package className="h-3 w-3 mr-1.5" />Bundles
          </TabsTrigger>
          <TabsTrigger value="connected" className="text-[11px] h-8 px-3 data-[state=active]:bg-card">
            <HeartPulse className="h-3 w-3 mr-1.5" />Connected
          </TabsTrigger>
        </TabsList>

        <TabsContent value="use-cases" className="mt-5">
          {/* Category Filter */}
          <div className="flex gap-1.5 mb-5 flex-wrap">
            {([] as any[]).map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] transition-all border",
                  category === cat.id
                    ? "bg-primary/10 text-primary border-primary/30 font-medium"
                    : "bg-card/60 text-muted-foreground border-border/30 hover:text-foreground hover:border-border"
                )}
              >
                <cat.icon className="h-3 w-3" />
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map(uc => (
              <UseCaseCard key={uc.id} useCase={uc} onSelect={() => setActiveUseCase(uc)} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bundles" className="mt-5 space-y-4">
          {([] as any[]).map(b => (
            <BundleCard key={b.id} bundle={b} onSelect={() => {
              const firstUc = engines.integrations.getUseCase(b.useCases[0]);
              if (firstUc) setActiveUseCase(firstUc);
            }} />
          ))}
        </TabsContent>

        <TabsContent value="connected" className="mt-5">
          <ConnectedPanel />
        </TabsContent>
      </Tabs>

      {/* Wizard Modal */}
      <AnimatePresence>
        {activeUseCase && (
          <SetupWizard useCase={activeUseCase} onClose={() => setActiveUseCase(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
