// ═══════════════════════════════════════════════════════════════
// SITA OS — Personal Brain Onboarding (Phase 1 ceremony)
// ═══════════════════════════════════════════════════════════════
// 6-step intake that personalizes the Brain from day one.
// Persists to pb_profile, pb_goals, pb_security_prefs, pb_voice_prefs.
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Plus, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  OnboardingShell,
  OnboardingProgress,
  OnboardingStepHeader,
  OnboardingChoiceCard,
  OnboardingFooterNav,
} from "@/components/onboarding";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  STEP_KEYS,
  STEP_LABELS,
  STEP_ICONS,
  USE_CASES,
  THINKING_STYLES,
  DEPTH_OPTIONS,
  CONTEXT_SOURCES,
  GOAL_HORIZONS,
  SUGGESTED_GOALS,
} from "./onboarding-config";

// ─── Types ─────────────────────────────────────────────────────

interface DraftGoal {
  title: string;
  horizon_days: number;
}

interface OnboardingDraft {
  // Step 1 — identity
  display_name: string;
  role: string;
  life_context: string;
  timezone: string;
  language: string;
  // Step 2 — use cases
  use_cases: string[];
  // Step 3 — goals
  goals: DraftGoal[];
  goalDraft: string;
  goalHorizon: number;
  // Step 4 — thinking style
  thinking_style: string;
  // Step 5 — depth
  personalization_depth: "minimal" | "moderate" | "deep";
  context_sources: string[];
  // Step 6 — voice & privacy
  voice_enabled: boolean;
  autolearn_enabled: boolean;
  sensitive_mode: boolean;
}

function defaultDraft(displayName: string): OnboardingDraft {
  let tz = "UTC";
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    /* ignore */
  }
  return {
    display_name: displayName,
    role: "",
    life_context: "",
    timezone: tz,
    language: typeof navigator !== "undefined" ? navigator.language?.split("-")[0] || "en" : "en",
    use_cases: [],
    goals: [],
    goalDraft: "",
    goalHorizon: 90,
    thinking_style: "strategic",
    personalization_depth: "moderate",
    context_sources: ["chats", "goals"],
    voice_enabled: true,
    autolearn_enabled: true,
    sensitive_mode: false,
  };
}

// ─── Component ─────────────────────────────────────────────────

export interface PersonalBrainOnboardingProps {
  onComplete: () => void;
}

export function PersonalBrainOnboarding({ onComplete }: PersonalBrainOnboardingProps) {
  const { user } = useAuth();
  const initialName = useMemo(() => {
    const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
    const fromMeta = (meta.display_name || meta.full_name || meta.name) as string | undefined;
    return fromMeta?.trim() || (user?.email ? user.email.split("@")[0] : "");
  }, [user]);

  const [stepIdx, setStepIdx] = useState(0);
  const [draft, setDraft] = useState<OnboardingDraft>(() => defaultDraft(initialName));
  const [submitting, setSubmitting] = useState(false);

  const stepKey = STEP_KEYS[stepIdx];
  const StepIcon = STEP_ICONS[stepKey];

  const update = <K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const toggleUseCase = (id: string) =>
    setDraft((d) => ({
      ...d,
      use_cases: d.use_cases.includes(id) ? d.use_cases.filter((x) => x !== id) : [...d.use_cases, id],
    }));

  const toggleSource = (id: string) =>
    setDraft((d) => ({
      ...d,
      context_sources: d.context_sources.includes(id)
        ? d.context_sources.filter((x) => x !== id)
        : [...d.context_sources, id],
    }));

  const addGoal = (title?: string) => {
    const t = (title ?? draft.goalDraft).trim();
    if (!t) return;
    setDraft((d) => ({
      ...d,
      goals: [...d.goals, { title: t, horizon_days: d.goalHorizon }].slice(0, 8),
      goalDraft: title ? d.goalDraft : "",
    }));
  };

  const removeGoal = (idx: number) =>
    setDraft((d) => ({ ...d, goals: d.goals.filter((_, i) => i !== idx) }));

  // ─── Validation per step ─────────────────────────────────────
  const canAdvance = (() => {
    switch (stepKey) {
      case "identity":
        return draft.display_name.trim().length > 0 && draft.timezone.length > 0 && draft.language.length > 0;
      case "use-cases":
        return draft.use_cases.length > 0;
      case "goals":
        return true; // optional
      case "thinking-style":
        return draft.thinking_style.length > 0;
      case "depth":
        return !!draft.personalization_depth;
      case "voice-privacy":
        return true;
      default:
        return true;
    }
  })();

  const isLast = stepIdx === STEP_KEYS.length - 1;

  const handleNext = () => {
    if (isLast) {
      void submit();
      return;
    }
    setStepIdx((i) => Math.min(STEP_KEYS.length - 1, i + 1));
  };
  const handleBack = () => setStepIdx((i) => Math.max(0, i - 1));

  // ─── Persist ─────────────────────────────────────────────────
  async function submit() {
    if (!user?.id) {
      toast.error("You need to be signed in to personalize your Brain.");
      return;
    }
    setSubmitting(true);
    try {
      // pb_profile upsert
      const profilePayload = {
        user_id: user.id,
        display_name: draft.display_name.trim() || null,
        role: draft.role.trim() || null,
        life_context: draft.life_context.trim() || null,
        timezone: draft.timezone,
        language: draft.language,
        use_cases: draft.use_cases,
        context_sources: draft.context_sources,
        coaching_style: draft.thinking_style,
        tone: draft.thinking_style,
        personalization_depth: draft.personalization_depth,
        depth: draft.personalization_depth,
        onboarded_at: new Date().toISOString(),
      };
      const { error: pErr } = await supabase
        .from("pb_profile")
        .upsert(profilePayload, { onConflict: "user_id" });
      if (pErr) throw pErr;

      // pb_goals: insert any drafted goals
      if (draft.goals.length > 0) {
        const rows = draft.goals.map((g) => ({
          user_id: user.id,
          title: g.title,
          horizon_days: g.horizon_days,
          kind: "skill",
          status: "active",
          progress_pct: 0,
        }));
        const { error: gErr } = await supabase.from("pb_goals").insert(rows);
        if (gErr) throw gErr;
      }

      // pb_security_prefs upsert (sensitive mode forces autolearn off)
      const secPayload = {
        user_id: user.id,
        autolearn_enabled: draft.sensitive_mode ? false : draft.autolearn_enabled,
        sensitive_mode: draft.sensitive_mode,
        learn_from_chats: !draft.sensitive_mode,
        learn_from_files: !draft.sensitive_mode,
        retention_days: draft.sensitive_mode ? 7 : 365,
        voice_transcript_retention: draft.sensitive_mode ? "none" : draft.voice_enabled ? "session" : "none",
      };
      const { error: sErr } = await supabase
        .from("pb_security_prefs")
        .upsert(secPayload, { onConflict: "user_id" });
      if (sErr) throw sErr;

      // pb_voice_prefs upsert (only if voice enabled)
      if (draft.voice_enabled) {
        const voicePayload = {
          user_id: user.id,
          autoread: false,
          input_mode: "tap",
          transcript_retention: draft.sensitive_mode ? "none" : "session",
        };
        const { error: vErr } = await supabase
          .from("pb_voice_prefs")
          .upsert(voicePayload, { onConflict: "user_id" });
        if (vErr) throw vErr;
      }

      toast.success("Your Brain is ready.");
      onComplete();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save preferences";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-gradient-to-b from-background via-background to-primary/5 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Personal Brain · Setup</p>
            <h1 className="text-lg font-semibold text-foreground">Personalize your adaptive intelligence</h1>
          </div>
          <OnboardingProgress steps={STEP_KEYS.map((k) => STEP_LABELS[k])} currentIndex={stepIdx} />
        </div>

        <OnboardingShell density="comfortable">
          <motion.div
            key={stepKey}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-6 shadow-sm"
          >
            <OnboardingStepHeader
              chapter={`Step ${stepIdx + 1} of ${STEP_KEYS.length}`}
              icon={StepIcon}
              title={titleFor(stepKey)}
              subtitle={subtitleFor(stepKey)}
            />

            {/* ─── Step content ───────────────────────────────── */}
            {stepKey === "identity" && (
              <div className="space-y-4 max-w-xl mx-auto">
                <div className="space-y-1.5">
                  <Label htmlFor="pb-name">Preferred name</Label>
                  <Input
                    id="pb-name"
                    value={draft.display_name}
                    onChange={(e) => update("display_name", e.target.value)}
                    placeholder="What should the Brain call you?"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pb-role">Role / what you do</Label>
                  <Input
                    id="pb-role"
                    value={draft.role}
                    onChange={(e) => update("role", e.target.value)}
                    placeholder="Founder, operator, creator, student…"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pb-life">Life context (optional)</Label>
                  <Textarea
                    id="pb-life"
                    value={draft.life_context}
                    onChange={(e) => update("life_context", e.target.value)}
                    placeholder="A sentence or two about your situation, focus, or constraints."
                    className="min-h-[72px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="pb-tz">Timezone</Label>
                    <Input
                      id="pb-tz"
                      value={draft.timezone}
                      onChange={(e) => update("timezone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pb-lang">Preferred language</Label>
                    <Input
                      id="pb-lang"
                      value={draft.language}
                      onChange={(e) => update("language", e.target.value)}
                      placeholder="en, fr, es…"
                    />
                  </div>
                </div>
              </div>
            )}

            {stepKey === "use-cases" && (
              <div className="grid sm:grid-cols-2 gap-2.5">
                {USE_CASES.map((opt) => (
                  <OnboardingChoiceCard
                    key={opt.id}
                    label={opt.label}
                    description={opt.description}
                    icon={opt.icon}
                    selected={draft.use_cases.includes(opt.id)}
                    onSelect={() => toggleUseCase(opt.id)}
                  />
                ))}
              </div>
            )}

            {stepKey === "goals" && (
              <div className="space-y-5 max-w-xl mx-auto">
                <div>
                  <Label className="text-xs">Suggested</Label>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {SUGGESTED_GOALS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => addGoal(g)}
                        disabled={draft.goals.some((x) => x.title === g)}
                        className="px-2.5 py-1 rounded-full text-[11px] border border-border/60 text-foreground/80 hover:border-primary/40 hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        + {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Add your own</Label>
                  <div className="flex gap-2">
                    <Input
                      value={draft.goalDraft}
                      onChange={(e) => update("goalDraft", e.target.value)}
                      placeholder="e.g. Get fluent in French"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addGoal();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => addGoal()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Label className="text-[11px] text-muted-foreground">Horizon</Label>
                    {GOAL_HORIZONS.map((h) => (
                      <button
                        key={h.days}
                        type="button"
                        onClick={() => update("goalHorizon", h.days)}
                        className={`px-2 py-1 rounded-md text-[11px] border transition-colors ${
                          draft.goalHorizon === h.days
                            ? "bg-primary/10 border-primary/40 text-foreground"
                            : "border-border/50 text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        {h.label}
                      </button>
                    ))}
                  </div>
                </div>

                {draft.goals.length > 0 && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Your goals ({draft.goals.length})</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {draft.goals.map((g, i) => (
                        <Badge
                          key={`${g.title}-${i}`}
                          variant="outline"
                          className="gap-1.5 pl-2 pr-1 py-1 text-[11px] bg-primary/5 border-primary/20"
                        >
                          <span>{g.title}</span>
                          <span className="text-muted-foreground">· {g.horizon_days}d</span>
                          <button
                            type="button"
                            onClick={() => removeGoal(i)}
                            className="ml-1 rounded-full p-0.5 hover:bg-destructive/10"
                            aria-label={`Remove ${g.title}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {stepKey === "thinking-style" && (
              <div className="grid sm:grid-cols-2 gap-2.5">
                {THINKING_STYLES.map((opt) => (
                  <OnboardingChoiceCard
                    key={opt.id}
                    label={opt.label}
                    description={opt.description}
                    selected={draft.thinking_style === opt.id}
                    onSelect={() => update("thinking_style", opt.id)}
                  />
                ))}
              </div>
            )}

            {stepKey === "depth" && (
              <div className="space-y-5 max-w-xl mx-auto">
                <div className="space-y-2.5">
                  {DEPTH_OPTIONS.map((opt) => (
                    <OnboardingChoiceCard
                      key={opt.id}
                      label={opt.label}
                      description={opt.description}
                      icon={opt.icon}
                      selected={draft.personalization_depth === opt.id}
                      onSelect={() => update("personalization_depth", opt.id)}
                      recommended={opt.id === "moderate"}
                    />
                  ))}
                </div>

                <div>
                  <Label className="text-xs">What can the Brain learn from?</Label>
                  <div className="grid sm:grid-cols-2 gap-2 mt-2">
                    {CONTEXT_SOURCES.map((src) => (
                      <OnboardingChoiceCard
                        key={src.id}
                        label={src.label}
                        description={src.description}
                        selected={draft.context_sources.includes(src.id)}
                        onSelect={() => toggleSource(src.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {stepKey === "voice-privacy" && (
              <div className="space-y-3 max-w-xl mx-auto">
                <ToggleRow
                  label="Enable voice"
                  description="Talk to your Brain on desktop and mobile."
                  checked={draft.voice_enabled}
                  onChange={(v) => update("voice_enabled", v)}
                />
                <ToggleRow
                  label="Auto-learn from my use"
                  description="The Brain quietly notices patterns. You can review every memory."
                  checked={draft.autolearn_enabled}
                  onChange={(v) => update("autolearn_enabled", v)}
                  disabled={draft.sensitive_mode}
                />
                <ToggleRow
                  label="Sensitive mode"
                  description="No auto-learn, 7-day retention, no voice transcript persistence."
                  checked={draft.sensitive_mode}
                  onChange={(v) => {
                    update("sensitive_mode", v);
                    if (v) update("autolearn_enabled", false);
                  }}
                />
                <p className="text-[11px] text-muted-foreground pt-2">
                  You can change every one of these later in <span className="text-foreground">Brain Settings</span>.
                </p>
              </div>
            )}
          </motion.div>

          <OnboardingFooterNav
            onBack={stepIdx > 0 ? handleBack : undefined}
            onNext={handleNext}
            nextLabel={isLast ? (submitting ? "Personalizing…" : "Activate my Brain") : "Continue"}
            nextDisabled={!canAdvance || submitting}
          />
        </OnboardingShell>
      </div>
    </div>
  );
}

function titleFor(key: (typeof STEP_KEYS)[number]): string {
  switch (key) {
    case "identity":
      return "Let's start with you";
    case "use-cases":
      return "What should your Brain help with?";
    case "goals":
      return "What are you trying to learn or build?";
    case "thinking-style":
      return "How do you want it to think with you?";
    case "depth":
      return "How deeply should it adapt to you?";
    case "voice-privacy":
      return "Voice & privacy";
  }
}

function subtitleFor(key: (typeof STEP_KEYS)[number]): string {
  switch (key) {
    case "identity":
      return "A few basics so the Brain speaks to you, not at you.";
    case "use-cases":
      return "Pick anything that fits — you can change this any time.";
    case "goals":
      return "Optional. Adding goals helps the Brain suggest the right next move.";
    case "thinking-style":
      return "We'll match the cadence and shape of every reply to this.";
    case "depth":
      return "Choose how much of you the Brain remembers between sessions.";
    case "voice-privacy":
      return "Set your defaults — full control lives in settings.";
  }
}

// ─── Local primitive ───────────────────────────────────────────

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

function ToggleRow({ label, description, checked, onChange, disabled }: ToggleRowProps) {
  return (
    <div
      className={`flex items-start justify-between gap-4 p-3.5 rounded-xl border ${
        checked ? "bg-primary/5 border-primary/30" : "bg-card/40 border-border/50"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}

export default PersonalBrainOnboarding;