// ═══════════════════════════════════════════════════════════════
// SITA OS — Autopilot Setup Wizard
// Beginner-friendly onboarding for automation configuration
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SitaCard } from "@/platform/sita/components/sita/SitaCard";
import {
  Zap, ChevronRight, ChevronLeft, Check, Shield, Clock, Bell,
  Sparkles, Target, ArrowRight, Settings, Mail, MessageSquare, Phone
} from "lucide-react";
import type { AutopilotConfig, PlaybookId } from "@/lib/domain-engines/autopilot-engine";
import { getPlaybooks } from "@/lib/domain-engines/autopilot-engine";

interface AutopilotWizardProps {
  onComplete: (config: AutopilotConfig) => void;
  onSkip: () => void;
}

const STEPS = ["Welcome", "Playbooks", "Approvals", "Notifications", "Launch"];

const AutopilotWizard = ({ onComplete, onSkip }: AutopilotWizardProps) => {
  const [step, setStep] = useState(0);
  const [selectedPlaybooks, setSelectedPlaybooks] = useState<PlaybookId[]>([]);
  const [approvalMode, setApprovalMode] = useState<"all" | "high-risk-only" | "none">("high-risk-only");
  const [notifications, setNotifications] = useState<("in-app" | "email" | "sms")[]>(["in-app"]);
  const [maxActions, setMaxActions] = useState(50);
  const [businessHoursOnly, setBusinessHoursOnly] = useState(true);

  const playbooks = getPlaybooks();

  const togglePlaybook = (id: PlaybookId) => {
    setSelectedPlaybooks(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const toggleNotification = (ch: "in-app" | "email" | "sms") => {
    setNotifications(prev => prev.includes(ch) ? prev.filter(n => n !== ch) : [...prev, ch]);
  };

  const handleComplete = () => {
    onComplete({
      isOnboarded: true,
      approvalMode,
      activePlaybooks: selectedPlaybooks,
      notificationChannels: notifications,
      maxAutoActionsPerDay: maxActions,
      businessHoursOnly,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  };

  const canProceed = step === 0 || step === 1 && selectedPlaybooks.length > 0 || step >= 2;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i < step ? "bg-primary text-primary-foreground" :
              i === step ? "bg-primary/20 text-primary ring-2 ring-primary" :
              "bg-secondary text-muted-foreground"
            }`}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 rounded ${i < step ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          {step === 0 && (
            <div className="text-center space-y-6 py-8">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl gradient-sita">
                <Zap className="h-10 w-10 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Welcome to Revenue Autopilot</h2>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  Set up automated workflows that find revenue leaks, chase receivables, re-engage cold customers, and execute the highest-ROI actions — all while you sleep.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                {[
                  { icon: Target, label: "Detect", desc: "Revenue leaks found automatically" },
                  { icon: Zap, label: "Act", desc: "Smart actions executed for you" },
                  { icon: Sparkles, label: "Grow", desc: "Revenue compounds over time" },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="text-center p-4 rounded-xl bg-secondary/50">
                    <Icon className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="text-[10px] text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">Choose Your Playbooks</h2>
                <p className="text-sm text-muted-foreground mt-1">Each playbook is a pre-built automation sequence. Activate what fits your business.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {playbooks.map((pb) => {
                  const selected = selectedPlaybooks.includes(pb.id);
                  return (
                    <SitaCard key={pb.id} className={`p-4 ${selected ? "border-primary/40 ring-1 ring-primary/20" : ""}`} onClick={() => togglePlaybook(pb.id)}>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{pb.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">{pb.name}</p>
                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                              pb.difficulty === "beginner" ? "bg-trust-safe/10 text-trust-safe" :
                              pb.difficulty === "intermediate" ? "bg-accent/10 text-accent" :
                              "bg-urgency-high/10 text-urgency-high"
                            }`}>{pb.difficulty}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1">{pb.description}</p>
                          <p className="text-[10px] text-primary font-medium mt-2">
                            Est. +${pb.estimatedRevenueLift.toLocaleString()}/mo revenue lift
                          </p>
                        </div>
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          selected ? "border-primary bg-primary" : "border-muted-foreground/30"
                        }`}>
                          {selected && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                      </div>
                    </SitaCard>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Selected: {selectedPlaybooks.length} playbooks · Est. +${playbooks.filter(p => selectedPlaybooks.includes(p.id)).reduce((s, p) => s + p.estimatedRevenueLift, 0).toLocaleString()}/mo
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">Approval & Safety Settings</h2>
                <p className="text-sm text-muted-foreground mt-1">Control how much autonomy the autopilot has</p>
              </div>
              <div className="space-y-3">
                {([
                  { mode: "all" as const, icon: Shield, title: "Approve Everything", desc: "Every automated action needs your OK before executing. Maximum control." },
                  { mode: "high-risk-only" as const, icon: Settings, title: "Smart Approvals (Recommended)", desc: "Low-risk actions auto-execute. Discounts, escalations, and high-value actions need approval." },
                  { mode: "none" as const, icon: Zap, title: "Full Autopilot", desc: "All actions execute automatically. You'll get notifications but no approval gates." },
                ]).map(({ mode, icon: Icon, title, desc }) => (
                  <SitaCard key={mode} className={`p-4 ${approvalMode === mode ? "border-primary/40 ring-1 ring-primary/20" : ""}`} onClick={() => setApprovalMode(mode)}>
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${approvalMode === mode ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{title}</p>
                        <p className="text-[11px] text-muted-foreground">{desc}</p>
                      </div>
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${approvalMode === mode ? "border-primary bg-primary" : "border-muted-foreground/30"}`}>
                        {approvalMode === mode && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                    </div>
                  </SitaCard>
                ))}
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Business Hours Only</p>
                  <p className="text-[11px] text-muted-foreground">Only execute automations during business hours (9 AM – 6 PM)</p>
                </div>
                <button onClick={() => setBusinessHoursOnly(!businessHoursOnly)}
                  className={`relative h-6 w-11 rounded-full transition-all ${businessHoursOnly ? "bg-primary" : "bg-muted"}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${businessHoursOnly ? "left-5.5" : "left-0.5"}`} />
                </button>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">Max Auto-Actions Per Day</p>
                  <span className="text-sm font-bold text-primary">{maxActions}</span>
                </div>
                <input type="range" min={10} max={200} step={10} value={maxActions} onChange={e => setMaxActions(+e.target.value)}
                  className="w-full accent-primary" />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>Conservative (10)</span><span>Aggressive (200)</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">Notification Preferences</h2>
                <p className="text-sm text-muted-foreground mt-1">How should we keep you in the loop?</p>
              </div>
              <div className="space-y-3">
                {([
                  { ch: "in-app" as const, icon: Bell, title: "In-App Notifications", desc: "See activity and approvals inside the dashboard" },
                  { ch: "email" as const, icon: Mail, title: "Email Digests", desc: "Daily summary of actions taken and revenue recovered" },
                  { ch: "sms" as const, icon: MessageSquare, title: "SMS Alerts", desc: "Urgent approvals and critical action alerts via text" },
                ]).map(({ ch, icon: Icon, title, desc }) => {
                  const selected = notifications.includes(ch);
                  return (
                    <SitaCard key={ch} className={`p-4 ${selected ? "border-primary/40 ring-1 ring-primary/20" : ""}`} onClick={() => toggleNotification(ch)}>
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${selected ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">{title}</p>
                          <p className="text-[11px] text-muted-foreground">{desc}</p>
                        </div>
                        <div className={`h-5 w-5 rounded border-2 flex items-center justify-center ${selected ? "border-primary bg-primary" : "border-muted-foreground/30"}`}>
                          {selected && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                      </div>
                    </SitaCard>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center space-y-6 py-6">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-trust-safe/15">
                <Check className="h-10 w-10 text-trust-safe" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Ready to Launch!</h2>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  Your autopilot is configured. Here's what will happen:
                </p>
              </div>
              <div className="max-w-md mx-auto space-y-3 text-left">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50">
                  <Zap className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{selectedPlaybooks.length} Playbook{selectedPlaybooks.length !== 1 ? "s" : ""} Activating</p>
                    <p className="text-[11px] text-muted-foreground">{playbooks.filter(p => selectedPlaybooks.includes(p.id)).map(p => p.name).join(", ")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50">
                  <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Approval Mode: {approvalMode === "all" ? "Everything" : approvalMode === "high-risk-only" ? "Smart" : "Full Auto"}</p>
                    <p className="text-[11px] text-muted-foreground">Max {maxActions} actions/day · {businessHoursOnly ? "Business hours" : "24/7"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50">
                  <Bell className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Notifications: {notifications.join(", ")}</p>
                    <p className="text-[11px] text-muted-foreground">You'll see everything in your activity feed</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-primary font-medium">
                Est. revenue lift: +${playbooks.filter(p => selectedPlaybooks.includes(p.id)).reduce((s, p) => s + p.estimatedRevenueLift, 0).toLocaleString()}/mo
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <div>
          {step === 0 ? (
            <button onClick={onSkip} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Skip setup →
            </button>
          ) : (
            <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
          )}
        </div>
        <button
          onClick={() => step < 4 ? setStep(s => s + 1) : handleComplete()}
          disabled={step === 1 && selectedPlaybooks.length === 0}
          className="flex items-center gap-2 rounded-xl gradient-sita px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-all"
        >
          {step < 4 ? <>Continue <ChevronRight className="h-4 w-4" /></> : <>Launch Autopilot <Zap className="h-4 w-4" /></>}
        </button>
      </div>
    </div>
  );
};

export default AutopilotWizard;
