// ═══════════════════════════════════════════════════════════════
// SITA OS — Pack Detail Page
// Premium persuasive pack presentation with install flow
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SitaSectionHeader } from "@/components/sita/SitaCard";
import {
  resolveIcon, PackStatusBadge, TierBadge, OutcomeCard, WorkflowIncludedCard,
  ConnectorCard, PricingCard, InstallStep,
} from "@/components/sita/PackStoreComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { PACK_CATALOG, getInstallState, isInstalled } from "@/lib/pack-store";
import {
  ArrowLeft, Check, Shield, Brain, BarChart3, FileText, Workflow, Star, Download,
  Clock, Play, AlertTriangle, ChevronRight, Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const PackDetailPage = () => {
  const { packId } = useParams<{ packId: string }>();
  const navigate = useNavigate();
  const [installing, setInstalling] = useState(false);
  const [installStep, setInstallStep] = useState(0);

  const pack = PACK_CATALOG.find(p => p.pack_id === packId);
  if (!pack) {
    return (
      <div className="mx-auto max-w-4xl">
<button onClick={() => navigate("/store")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Store
        </button>
        <div className="text-center py-20">
          <p className="text-lg font-medium text-foreground">Pack not found</p>
          <p className="text-sm text-muted-foreground mt-1">This pack may have been removed or the URL is incorrect.</p>
        </div>
      </div>
    );
  }

  const Icon = resolveIcon(pack.icon);
  const state = getInstallState(pack.pack_id);
  const installed = isInstalled(pack.pack_id);

  const handleInstall = () => {
    setInstalling(true);
    setInstallStep(1);
    // Simulate install steps
    let step = 1;
    const interval = setInterval(() => {
      step++;
      setInstallStep(step);
      if (step >= 5) {
        clearInterval(interval);
        setTimeout(() => setInstalling(false), 1000);
      }
    }, 800);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Back */}
      <button onClick={() => navigate("/store")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Store
      </button>

      {/* Hero */}
      <div className={cn("relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br", pack.gradient)}>
        <div className="relative z-10 flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <Icon className="h-7 w-7 text-foreground" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">{pack.name}</h1>
                <p className="text-sm text-white/70">{pack.subtitle}</p>
              </div>
            </div>
            <p className="text-sm text-white/80 max-w-lg leading-relaxed">{pack.long_description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <TierBadge tier={pack.entitlement_tier} />
              <span className="text-[10px] text-white/50 capitalize">{pack.pack_class} pack</span>
              <span className="text-[10px] text-white/50">•</span>
              <span className="text-[10px] text-white/50">v{pack.version}</span>
              {pack.rating && (
                <>
                  <span className="text-[10px] text-white/50">•</span>
                  <div className="flex items-center gap-0.5 text-xs text-white/80">
                    <Star className="h-3 w-3 fill-white/80" /> {pack.rating}
                  </div>
                </>
              )}
              {pack.installs && <span className="text-[10px] text-white/50">{pack.installs.toLocaleString()} installs</span>}
            </div>
          </div>

          {/* Install CTA */}
          <div className="shrink-0">
            {installed ? (
              <div className="flex flex-col items-end gap-2">
                <PackStatusBadge status={state!.status} />
                <button className="text-xs text-white/70 hover:text-foreground">Manage</button>
              </div>
            ) : installing ? (
              <div className="rounded-lg bg-white/15 backdrop-blur-sm px-4 py-2 text-xs font-medium text-foreground animate-pulse">
                Installing…
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button onClick={handleInstall} className="flex items-center gap-2 rounded-lg bg-card px-5 py-2.5 text-sm font-bold text-foreground hover:bg-white/90 transition-colors shadow-lg">
                  <Download className="h-4 w-4" /> Install Pack
                </button>
                {pack.trial_supported && (
                  <button className="text-xs text-white/70 hover:text-foreground text-center">
                    or start {pack.trial_days}-day free trial
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
      </div>

      {/* Install Flow */}
      {installing && (
        <div className="space-y-3">
          <SitaSectionHeader title="Installing Pack" subtitle="Setting up your new operating intelligence" />
          <div className="space-y-2">
            <InstallStep step={1} current={installStep} total={5} completed={installStep > 1} title="Verify compatibility" description="Checking dependencies and domain requirements" />
            <InstallStep step={2} current={installStep} total={5} completed={installStep > 2} title="Enable workflows & advisors" description={`Activating ${pack.workflow_families.length} workflows and ${pack.advisors_enabled.length} advisors`} />
            <InstallStep step={3} current={installStep} total={5} completed={installStep > 3} title="Configure trust & policy" description="Applying policy and approval presets" />
            <InstallStep step={4} current={installStep} total={5} completed={installStep > 4} title="Setup shell integration" description="Updating navigation, command palette, and boardroom" />
            <InstallStep step={5} current={installStep} total={5} completed={installStep >= 5} title="Generate proof receipt" description="Creating install verification and audit trail" />
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Problems Solved */}
          <div className="space-y-3">
            <SitaSectionHeader title="Problems This Pack Solves" />
            <div className="space-y-2">
              {pack.problems_solved.map((p, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-destructive/5 border border-destructive/10 px-3 py-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                  <span className="text-xs text-foreground">{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Outcomes */}
          <div className="space-y-3">
            <SitaSectionHeader title="Outcomes Improved" />
            <div className="grid gap-2 sm:grid-cols-2">
              {pack.outcomes_improved.map((o, i) => <OutcomeCard key={i} outcome={o} />)}
            </div>
          </div>

          {/* Workflows Included */}
          {pack.workflow_families.length > 0 && (
            <div className="space-y-3">
              <SitaSectionHeader title="Workflows Included" subtitle={`${pack.workflow_families.length} automated processes`} />
              <div className="grid gap-2 sm:grid-cols-2">
                {pack.workflow_families.map((w, i) => <WorkflowIncludedCard key={i} name={w} />)}
              </div>
            </div>
          )}

          {/* Advisors Enabled */}
          {pack.advisors_enabled.length > 0 && (
            <div className="space-y-3">
              <SitaSectionHeader title="Advisors Enabled" subtitle={`${pack.advisors_enabled.length} AI advisors activated`} />
              <div className="space-y-2">
                {pack.advisors_enabled.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/10 px-3 py-2">
                    <Brain className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-xs font-medium text-foreground">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Boardroom Views */}
          {pack.boardroom_views.length > 0 && (
            <div className="space-y-3">
              <SitaSectionHeader title="Boardroom Views" />
              <div className="space-y-2">
                {pack.boardroom_views.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-accent/5 border border-accent/10 px-3 py-2">
                    <BarChart3 className="h-3.5 w-3.5 text-accent shrink-0" />
                    <span className="text-xs text-foreground capitalize">{v.replace(/-/g, " ")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Templates */}
          {pack.templates.length > 0 && (
            <div className="space-y-3">
              <SitaSectionHeader title="Templates Included" />
              <div className="grid gap-2 sm:grid-cols-2">
                {pack.templates.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-foreground">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Changelog */}
          {pack.changelog.length > 0 && (
            <div className="space-y-3">
              <SitaSectionHeader title="What's New" subtitle={`v${pack.version}`} />
              <div className="space-y-1.5">
                {pack.changelog.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-trust-safe shrink-0 mt-0.5" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Pricing */}
          <PricingCard pricing={pack.pricing} tier={pack.entitlement_tier} trialDays={pack.trial_days} />

          {/* Quick Facts */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Facts</h4>
            <div className="space-y-2">
              <Fact label="Setup time" value={`~${pack.setup_time_minutes} min`} />
              <Fact label="Time to first value" value={pack.time_to_first_value} />
              <Fact label="Target users" value={pack.target_segments.map(s => s.replace(/-/g, " ")).join(", ")} />
              <Fact label="Required domains" value={pack.required_domains.join(", ")} />
              <Fact label="Owner" value={pack.owner_type.replace(/-/g, " ")} />
            </div>
          </div>

          {/* Connectors */}
          {(pack.connectors_required.length > 0 || pack.connectors_supported.length > 0) && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Connectors</h4>
              <div className="space-y-2">
                {pack.connectors_required.map(c => <ConnectorCard key={c} name={c} required />)}
                {pack.connectors_supported.map(c => <ConnectorCard key={c} name={c} required={false} />)}
              </div>
            </div>
          )}

          {/* Trust & Permissions */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" /> Trust & Permissions
            </h4>
            <div className="space-y-2">
              {pack.permissions_required.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <Lock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-foreground font-mono text-[11px]">{p}</span>
                </div>
              ))}
            </div>
            {pack.policy_presets.length > 0 && (
              <div className="pt-2 border-t border-border space-y-1">
                <p className="text-[10px] text-muted-foreground font-medium">Policy presets applied:</p>
                {pack.policy_presets.map((p, i) => (
                  <p key={i} className="text-[11px] text-foreground font-mono">{p}</p>
                ))}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground">All install/update actions generate proof receipts.</p>
          </div>

          {/* Dependencies */}
          {pack.dependencies.length > 0 && (
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 space-y-2">
              <h4 className="text-xs font-semibold text-accent flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Dependencies
              </h4>
              {pack.dependencies.map((d, i) => {
                const dep = PACK_CATALOG.find(p => p.pack_id === d);
                return (
                  <p key={i} className="text-xs text-foreground">
                    Requires: <span className="font-medium">{dep?.name || d}</span>
                    {isInstalled(d) ? (
                      <span className="ml-1 text-trust-safe text-[10px]">✓ Installed</span>
                    ) : (
                      <span className="ml-1 text-accent text-[10px]">Not installed</span>
                    )}
                  </p>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Fact = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between text-xs">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-foreground font-medium text-right max-w-[60%] capitalize">{value}</span>
  </div>
);

export default PackDetailPage;
