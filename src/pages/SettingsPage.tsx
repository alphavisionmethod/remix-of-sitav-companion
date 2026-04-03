import { useState } from "react";
import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile } from "@/components/sita/SitaComponents";
import { Progress } from "@/components/ui/progress";
import { TrustBadge } from "@/components/sita/TrustBadge";
import {
  User, Shield, Bell, Palette, Eye, Lock, Globe, Sliders, Brain, Heart,
  ToggleLeft, ToggleRight, Zap, DollarSign, Workflow, TrendingUp, FileText,
  ChevronRight, Check, AlertTriangle, Clock, Wifi, Download, Trash2, ShieldAlert
} from "lucide-react";
import { useDemoMode } from "@/hooks/use-brain-core";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GovernanceSimulatorService, type SimulationResult } from "@/lib/core-services/governance-simulator";
import { SitaButton } from "@/components/sita/SitaCard";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

/* ── Toggle Setting ──────────────────────────────── */
const ToggleSetting = ({ label, description, enabled, onChange }: {
  label: string; description: string; enabled: boolean; onChange: () => void;
}) => (
  <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
    <div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <button onClick={onChange} className={cn("relative h-6 w-11 rounded-full transition-colors", enabled ? "bg-primary" : "bg-muted")}>
      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", enabled ? "translate-x-5.5 left-0.5" : "left-0.5")}
        style={{ transform: enabled ? "translateX(20px)" : "translateX(0)" }} />
    </button>
  </div>
);

/* ── Choice Group ────────────────────────────────── */
const ChoiceGroup = ({ label, options, value, onChange }: {
  label: string; options: { key: string; label: string; desc?: string }[]; value: string; onChange: (v: string) => void;
}) => (
  <div className="py-3 border-b border-border last:border-0">
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
    <div className="grid gap-2 sm:grid-cols-3">
      {options.map(opt => (
        <button key={opt.key} onClick={() => onChange(opt.key)} className={cn(
          "rounded-xl border p-3 text-left transition-all",
          value === opt.key ? "border-primary/40 bg-primary/8" : "border-border hover:border-primary/20"
        )}>
          <p className={cn("text-xs font-medium", value === opt.key ? "text-primary" : "text-foreground")}>{opt.label}</p>
          {opt.desc && <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>}
        </button>
      ))}
    </div>
  </div>
);

const SettingsPage = () => {
  const { isDemoMode, isLoading, toggleDemoMode } = useDemoMode();
  const [autonomy, setAutonomy] = useState("simulate-first");
  const [confidence, setConfidence] = useState("70");
  const [budgetMode, setBudgetMode] = useState("standard");
  const [simPref, setSimPref] = useState("smart");
  const [contradictions, setContradictions] = useState("always");
  const [notifFreq, setNotifFreq] = useState("realtime");
  const [docRetention, setDocRetention] = useState("7years");
  const [piiRedaction, setPiiRedaction] = useState(false);
  const [largeFontMode, setLargeFontMode] = useState(false);
  const [dndEnabled, setDndEnabled] = useState(true);
  const [auditResult, setAuditResult] = useState<SimulationResult | null>(null);

  const runAudit = () => {
    const gov = new GovernanceSimulatorService();
    const result = gov.runComplianceAudit([
      { domain: "finance", capabilityId: "finance.transfer", riskTier: "high", amount: 8000 },
      { domain: "finance", capabilityId: "finance.budget.update", riskTier: "medium", amount: 500 },
      { domain: "business", capabilityId: "crm.lead.update", riskTier: "low" },
      { domain: "finance", capabilityId: "finance.transfer", riskTier: "critical", amount: 50000 },
    ]);
    setAuditResult(result);
    toast.success(`Audit complete — ${(result.summary.overallCompliance * 100).toFixed(0)}% compliant`);
  };

  const handleToggle = () => {
    toggleDemoMode();
    toast.success(isDemoMode ? "Switched to Live Mode" : "Switched to Demo Mode");
  };

  return (
    <motion.div className="mx-auto max-w-4xl space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <SitaPageHeader title="Settings" subtitle="Customize your SITA experience, trust preferences, and budget controls" />

      {/* Intelligence Mode Toggle */}
      <SitaCard hover={false} glow className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-primary/8 p-2.5"><Brain className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="font-display text-sm font-semibold text-foreground">Intelligence Mode</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{isDemoMode ? "Demo — sample data" : "Live — real intelligence"}</p>
            </div>
          </div>
          <button onClick={handleToggle} disabled={isLoading}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all hover:scale-[1.02]"
            style={{ background: isDemoMode ? "hsl(var(--muted))" : "hsl(var(--primary))", color: isDemoMode ? "hsl(var(--muted-foreground))" : "hsl(var(--primary-foreground))" }}>
            {isDemoMode ? <><ToggleLeft className="h-4 w-4" /><span>Demo</span></> : <><ToggleRight className="h-4 w-4" /><span>Live</span></>}
          </button>
        </div>
      </SitaCard>

      <div className="grid gap-4 md:grid-cols-2">
        {/* ── AI Behavior ──────────────────────────── */}
        <SitaCard hover={false} className="p-5">
          <SitaCardTitle sub="Control how SITA acts on your behalf">
            <div className="flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> AI Behavior</div>
          </SitaCardTitle>
          <div className="mt-4">
            <ChoiceGroup label="Autonomy Level" value={autonomy} onChange={setAutonomy} options={[
              { key: "always-ask", label: "Always Ask", desc: "Every action needs approval" },
              { key: "simulate-first", label: "Simulate First", desc: "AI simulates, you approve" },
              { key: "trusted", label: "Trusted", desc: "Routine tasks auto-execute" },
            ]} />
            <ChoiceGroup label="Simulation Preference" value={simPref} onChange={setSimPref} options={[
              { key: "always", label: "Always Simulate", desc: "Every recommendation" },
              { key: "smart", label: "Smart", desc: "High-risk only" },
              { key: "never", label: "Skip", desc: "Direct execution" },
            ]} />
            <ChoiceGroup label="Contradiction Display" value={contradictions} onChange={setContradictions} options={[
              { key: "always", label: "Show All" },
              { key: "major", label: "Major Only" },
              { key: "hide", label: "Hide" },
            ]} />
            <div className="py-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Confidence Threshold</p>
              <div className="flex items-center gap-3">
                <input type="range" min="30" max="95" step="5" value={confidence} onChange={e => setConfidence(e.target.value)}
                  className="flex-1 h-1.5 rounded-full bg-secondary accent-primary" />
                <span className="text-sm font-semibold text-foreground w-10 text-right">{confidence}%</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Minimum confidence for advisor recommendations</p>
            </div>
          </div>
        </SitaCard>

        {/* ── Budget & Spend ──────────────────────── */}
        <SitaCard hover={false} className="p-5">
          <SitaCardTitle sub="Monthly AI spend limits and tracking">
            <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-accent" /> Budget & Spend</div>
          </SitaCardTitle>
          <div className="mt-4">
            <ChoiceGroup label="Budget Mode" value={budgetMode} onChange={setBudgetMode} options={[
              { key: "conservative", label: "$10–$20/mo", desc: "Key decisions only" },
              { key: "standard", label: "$50/mo", desc: "Full advisor access" },
              { key: "premium", label: "$200+/mo", desc: "Unlimited queries" },
            ]} />
            <div className="py-3 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Current Spend</p>
              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="font-display text-lg font-bold gradient-sita-text">$4.32</span>
                <span className="text-xs text-muted-foreground">of $50.00 (9%)</span>
              </div>
              <Progress value={9} className="h-1.5" />
              <p className="text-[10px] text-muted-foreground mt-1.5">Forecast: $8.50 by month end</p>
            </div>
            <div className="py-3 space-y-1.5">
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Advising</span><span className="text-foreground">$2.15</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Automations</span><span className="text-foreground">$0.92</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Simulations</span><span className="text-foreground">$0.85</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Document OCR</span><span className="text-foreground">$0.40</span></div>
            </div>
          </div>
        </SitaCard>

        {/* ── Notifications ──────────────────────── */}
        <SitaCard hover={false} className="p-5">
          <SitaCardTitle sub="Alert preferences and timing">
            <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /> Notifications</div>
          </SitaCardTitle>
          <div className="mt-4">
            <ChoiceGroup label="Frequency" value={notifFreq} onChange={setNotifFreq} options={[
              { key: "realtime", label: "Real-time" },
              { key: "daily", label: "Daily Digest" },
              { key: "weekly", label: "Weekly" },
            ]} />
            <ToggleSetting label="Do Not Disturb" description="Silence notifications 10pm–7am" enabled={dndEnabled} onChange={() => setDndEnabled(!dndEnabled)} />
            <div className="py-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Alert Types</p>
              <div className="space-y-1">
                {["Threshold breaches", "Contradictions", "New opportunities", "Automations completed", "Approval requests"].map(a => (
                  <label key={a} className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-border accent-primary" /> {a}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </SitaCard>

        {/* ── Privacy & Security ─────────────────── */}
        <SitaCard hover={false} className="p-5">
          <SitaCardTitle sub="Data access, retention, and controls">
            <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> Privacy & Security</div>
          </SitaCardTitle>
          <div className="mt-4">
            <ChoiceGroup label="Document Retention" value={docRetention} onChange={setDocRetention} options={[
              { key: "1year", label: "1 Year" },
              { key: "7years", label: "7 Years", desc: "Financial default" },
              { key: "forever", label: "Forever" },
            ]} />
            <ToggleSetting label="PII Redaction" description="Strip names from documents before AI processing" enabled={piiRedaction} onChange={() => setPiiRedaction(!piiRedaction)} />
            <div className="py-3 space-y-2">
              <button className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-xs text-foreground hover:bg-secondary/80 transition-colors w-full">
                <Download className="h-3.5 w-3.5 text-muted-foreground" /> Export All Data (JSON)
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive hover:bg-destructive/20 transition-colors w-full">
                <Trash2 className="h-3.5 w-3.5" /> Delete All Data
              </button>
            </div>
          </div>
        </SitaCard>

        {/* ── Appearance ─────────────────────────── */}
        <SitaCard hover={false} className="p-5">
          <SitaCardTitle sub="Theme, density, and display">
            <div className="flex items-center gap-2"><Palette className="h-4 w-4 text-primary" /> Appearance</div>
          </SitaCardTitle>
          <div className="mt-4">
            <ToggleSetting label="Large Font Mode" description="Increase body text to 18px for comfortable reading" enabled={largeFontMode} onChange={() => setLargeFontMode(!largeFontMode)} />
            <div className="py-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Keyboard Shortcuts</p>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between"><span className="text-muted-foreground">Command Palette</span><kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-foreground">⌘K</kbd></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Focus Mode</span><kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-foreground">⌘.</kbd></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Calm Mode</span><kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-foreground">⌘,</kbd></div>
              </div>
            </div>
          </div>
        </SitaCard>

        {/* ── Connections ────────────────────────── */}
        <SitaCard hover={false} className="p-5">
          <SitaCardTitle sub="External integrations and sync">
            <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Connections</div>
          </SitaCardTitle>
          <div className="mt-4 space-y-2">
            {[
              { name: "Gmail", status: "connected", lastSync: "2 min ago" },
              { name: "Stripe", status: "connected", lastSync: "5 min ago" },
              { name: "QuickBooks", status: "disconnected", lastSync: "Never" },
              { name: "Google Calendar", status: "connected", lastSync: "1 min ago" },
            ].map(conn => (
              <div key={conn.name} className="flex items-center justify-between rounded-xl bg-secondary/30 p-3">
                <div className="flex items-center gap-3">
                  <Wifi className={cn("h-4 w-4", conn.status === "connected" ? "text-trust-verified" : "text-muted-foreground")} />
                  <div>
                    <p className="text-xs font-medium text-foreground">{conn.name}</p>
                    <p className="text-[10px] text-muted-foreground">Last sync: {conn.lastSync}</p>
                  </div>
                </div>
                <TrustBadge level={conn.status === "connected" ? "verified" : "degraded"} label={conn.status === "connected" ? "Connected" : "Disconnected"} size="sm" />
              </div>
            ))}
          </div>
        </SitaCard>
      </div>

      {/* Policy Simulator */}
      <SitaCard hover={false} className="p-5">
        <SitaCardTitle sub="Run a compliance audit against your active policies">
          <div className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-primary" /> Policy Simulator</div>
        </SitaCardTitle>
        <div className="mt-4">
          <SitaButton variant="primary" size="sm" onClick={runAudit}>Run Compliance Audit</SitaButton>
          {auditResult && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-border bg-secondary/30 p-3 text-center">
                  <p className={cn("font-display text-xl font-bold", auditResult.summary.overallCompliance >= 0.8 ? "text-trust-safe" : "text-accent")}>{(auditResult.summary.overallCompliance * 100).toFixed(0)}%</p>
                  <p className="text-[10px] text-muted-foreground">Compliance</p>
                </div>
                <div className="rounded-xl border border-border bg-secondary/30 p-3 text-center">
                  <p className="font-display text-xl font-bold text-destructive">{auditResult.summary.blocked}</p>
                  <p className="text-[10px] text-muted-foreground">Blocked</p>
                </div>
                <div className="rounded-xl border border-border bg-secondary/30 p-3 text-center">
                  <p className="font-display text-xl font-bold text-accent">{auditResult.summary.riskBreaches}</p>
                  <p className="text-[10px] text-muted-foreground">Risk Flags</p>
                </div>
              </div>
              {auditResult.summary.recommendations.map((r, i) => (
                <p key={i} className="text-xs text-foreground">• {r}</p>
              ))}
            </div>
          )}
        </div>
      </SitaCard>
    </motion.div>
  );
};

export default SettingsPage;
