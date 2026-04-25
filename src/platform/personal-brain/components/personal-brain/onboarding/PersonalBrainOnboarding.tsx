// ═══════════════════════════════════════════════════════════════
// SITA OS — Personal Brain Onboarding (calibration ceremony)
// ═══════════════════════════════════════════════════════════════
// Premium 11-step calibration with per-step persistence to
// pb_profile / pb_goals / pb_voice_prefs / pb_security_prefs /
// pb_workspaces / pb_notification_prefs. Skip + Save & exit are
// adaptive — required steps gate Next; optional steps allow Skip.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Plus,
  X,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Mic,
  ShieldCheck,
  Briefcase,
  Layers,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  OnboardingShell,
  OnboardingStepHeader,
  OnboardingChoiceCard,
} from "@/components/onboarding";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  STEP_LABELS,
  STEP_ICONS,
  STEP_KEYS,
  USE_CASES,
  CONTEXT_SOURCES,
  GOAL_HORIZONS,
  SUGGESTED_GOALS,
  ROLE_OPTIONS,
  STRENGTHS,
  BIGGEST_NEEDS,
  SKILL_LIBRARY,
  LEARNING_STYLES,
  LEARNING_LEVELS,
  RESPONSE_STYLES,
  COGNITION_STYLES,
  OUTPUT_FORMATS,
  DETAIL_LEVELS,
  WORK_MODES,
  SEPARATION_PREFS,
  DEFAULT_WORKSPACES,
  INFER_PROMPT_MODES,
  VOICE_FREQUENCIES,
  VOICE_INPUT_MODES,
  AUTOREAD_MODES,
  PRIVACY_PRESETS,
  type StepKey,
} from "./onboarding-config";

// Steps that can be skipped without blocking the ceremony.
const OPTIONAL_STEPS: ReadonlySet<StepKey> = new Set([
  "intro",
  "use-cases",
  "learning",
  "scope",
  "projects",
  "memory",
  "voice",
  "summary",
]);

interface DraftGoal {
  title: string;
  horizon_days: number;
}

interface OnboardingDraft {
  // identity
  display_name: string;
  role: string;
  life_context: string;
  timezone: string;
  language: string;
  location: string;
  // use cases
  use_cases: string[];
  strengths: string[];
  biggest_need: string;
  // learning
  learning_topics: string[];
  goals: DraftGoal[];
  goalDraft: string;
  goalHorizon: number;
  learning_style: string[];
  learning_level: "beginner" | "intermediate" | "advanced" | "adaptive";
  // cognition
  response_style: string;
  cognition_styles: string[];
  output_formats: string[];
  detail_level: string;
  // scope
  work_mode: "personal" | "business" | "mixed" | "project";
  separation_pref: "always-separate" | "mostly-separate" | "mixed-ok" | "ask";
  default_workspaces: string[];
  default_workspace_kind: string;
  // projects
  projects: string[];
  projectDraft: string;
  // memory
  personalization_depth: "minimal" | "moderate" | "deep";
  context_sources: string[];
  infer_prompt_mode: "always" | "sometimes" | "never";
  // voice
  voice_frequency: string;
  voice_input_mode: string;
  autoread_mode: string;
  // privacy
  privacy_preset: "standard" | "high" | "sensitive";
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
    language:
      typeof navigator !== "undefined" ? navigator.language?.split("-")[0] || "en" : "en",
    location: "",
    use_cases: [],
    strengths: [],
    biggest_need: "all",
    learning_topics: [],
    goals: [],
    goalDraft: "",
    goalHorizon: 90,
    learning_style: [],
    learning_level: "adaptive",
    response_style: "strategic",
    cognition_styles: [],
    output_formats: ["bullets", "step-plans"],
    detail_level: "balanced",
    work_mode: "mixed",
    separation_pref: "mixed-ok",
    default_workspaces: ["personal"],
    default_workspace_kind: "personal",
    projects: [],
    projectDraft: "",
    personalization_depth: "moderate",
    context_sources: ["chats", "goals"],
    infer_prompt_mode: "sometimes",
    voice_frequency: "sometimes",
    voice_input_mode: "tap",
    autoread_mode: "voice",
    privacy_preset: "standard",
    sensitive_mode: false,
  };
}

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
  const [savingStep, setSavingStep] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  // Hydrate any in-flight progress from pb_profile (resume mid-flow).
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("pb_profile")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled || !data) return;
      setDraft((d) => ({
        ...d,
        display_name: (data.display_name as string) || d.display_name,
        role: (data.role as string) || "",
        life_context: (data.life_context as string) || "",
        timezone: (data.timezone as string) || d.timezone,
        language: (data.language as string) || d.language,
        location: (data.location as string) || "",
        use_cases: Array.isArray(data.use_cases) ? (data.use_cases as string[]) : [],
        strengths: Array.isArray(data.strengths) ? (data.strengths as string[]) : [],
        biggest_need: (data.biggest_need as string) || "all",
        learning_style: Array.isArray(data.learning_style)
          ? (data.learning_style as string[])
          : [],
        learning_level: (data.learning_level as OnboardingDraft["learning_level"]) || "adaptive",
        response_style: (data.tone as string) || d.response_style,
        output_formats: Array.isArray(data.output_formats)
          ? (data.output_formats as string[])
          : d.output_formats,
        work_mode: (data.work_mode as OnboardingDraft["work_mode"]) || "mixed",
        separation_pref:
          (data.separation_pref as OnboardingDraft["separation_pref"]) || "mixed-ok",
        personalization_depth:
          (data.personalization_depth as OnboardingDraft["personalization_depth"]) || "moderate",
        context_sources: Array.isArray(data.context_sources)
          ? (data.context_sources as string[])
          : d.context_sources,
        infer_prompt_mode:
          (data.infer_prompt_mode as OnboardingDraft["infer_prompt_mode"]) || "sometimes",
      }));
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const stepKey: StepKey = STEP_KEYS[stepIdx];
  const StepIcon = STEP_ICONS[stepKey];

  const update = <K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const toggleArr = <K extends keyof OnboardingDraft>(key: K, id: string) =>
    setDraft((d) => {
      const arr = (d[key] as unknown as string[]) ?? [];
      const next = arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
      return { ...d, [key]: next as unknown as OnboardingDraft[K] };
    });

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

  const addProject = () => {
    const t = draft.projectDraft.trim();
    if (!t) return;
    setDraft((d) => ({
      ...d,
      projects: [...d.projects, t].slice(0, 10),
      projectDraft: "",
    }));
  };
  const removeProject = (idx: number) =>
    setDraft((d) => ({ ...d, projects: d.projects.filter((_, i) => i !== idx) }));

  const canAdvance = (() => {
    switch (stepKey) {
      case "identity":
        return (
          draft.display_name.trim().length > 0 &&
          draft.timezone.length > 0 &&
          draft.language.length > 0
        );
      case "cognition":
        return draft.response_style.length > 0;
      case "privacy":
        return draft.privacy_preset.length > 0;
      default:
        return true;
    }
  })();

  const isLast = stepIdx === STEP_KEYS.length - 1;
  const progressPct = Math.round(((stepIdx + 1) / STEP_KEYS.length) * 100);

  // ─── Per-step persistence ────────────────────────────────────────
  async function persistStep(key: StepKey) {
    if (!user?.id) return;
    setSavingStep(true);
    try {
      const profilePatch: Record<string, unknown> = { user_id: user.id };
      switch (key) {
        case "identity":
          Object.assign(profilePatch, {
            display_name: draft.display_name.trim() || null,
            role: draft.role.trim() || null,
            life_context: draft.life_context.trim() || null,
            timezone: draft.timezone,
            language: draft.language,
            location: draft.location.trim() || null,
          });
          break;
        case "use-cases":
          Object.assign(profilePatch, {
            use_cases: draft.use_cases,
            strengths: draft.strengths,
            biggest_need: draft.biggest_need,
          });
          break;
        case "learning":
          Object.assign(profilePatch, {
            learning_style: draft.learning_style,
            learning_level: draft.learning_level,
          });
          // Insert any newly drafted goals not yet persisted.
          if (draft.goals.length > 0) {
            const rows = draft.goals.map((g) => ({
              user_id: user.id,
              title: g.title,
              horizon_days: g.horizon_days,
              kind: "skill",
              status: "active",
              progress_pct: 0,
            }));
            // Avoid duplicate inserts on re-visit.
            const { data: existing } = await supabase
              .from("pb_goals")
              .select("title")
              .eq("user_id", user.id);
            const have = new Set((existing ?? []).map((r) => (r as { title: string }).title));
            const fresh = rows.filter((r) => !have.has(r.title));
            if (fresh.length) await supabase.from("pb_goals").insert(fresh);
          }
          break;
        case "cognition":
          Object.assign(profilePatch, {
            tone: draft.response_style,
            coaching_style: draft.cognition_styles[0] ?? draft.response_style,
            output_formats: draft.output_formats,
            depth: draft.detail_level,
          });
          break;
        case "scope":
          Object.assign(profilePatch, {
            work_mode: draft.work_mode,
            separation_pref: draft.separation_pref,
          });
          break;
        case "memory":
          Object.assign(profilePatch, {
            personalization_depth: draft.personalization_depth,
            context_sources: draft.context_sources,
            infer_prompt_mode: draft.infer_prompt_mode,
          });
          break;
        case "voice": {
          const voicePayload = {
            user_id: user.id,
            autoread: draft.autoread_mode === "always",
            input_mode: draft.voice_input_mode,
            transcript_retention: draft.sensitive_mode ? "none" : "session",
          } as const;
          await supabase
            .from("pb_voice_prefs")
            .upsert(voicePayload, { onConflict: "user_id" });
          return;
        }
        case "privacy": {
          const sensitive =
            draft.privacy_preset === "sensitive" || draft.sensitive_mode;
          const secPayload = {
            user_id: user.id,
            sensitive_mode: sensitive,
            autolearn_enabled: !sensitive,
            learn_from_chats: !sensitive,
            learn_from_files: !sensitive,
            retention_days:
              draft.privacy_preset === "high"
                ? 90
                : sensitive
                  ? 7
                  : 365,
            voice_transcript_retention: sensitive ? "none" : "session",
          } as const;
          await supabase
            .from("pb_security_prefs")
            .upsert(secPayload, { onConflict: "user_id" });
          return;
        }
        default:
          // intro / projects / summary persist via finalize()
          break;
      }
      if (Object.keys(profilePatch).length > 1) {
        await supabase
          .from("pb_profile")
          .upsert(profilePatch as never, { onConflict: "user_id" });
      }
    } catch (e) {
      console.error("persistStep error", e);
    } finally {
      setSavingStep(false);
    }
  }

  async function finalize() {
    if (!user?.id) {
      toast.error("You need to be signed in to personalize your Brain.");
      return;
    }
    setFinalizing(true);
    try {
      // Create selected default workspaces (skip duplicates by name).
      let primaryWorkspaceId: string | null = null;
      if (draft.default_workspaces.length > 0) {
        const { data: existing } = await supabase
          .from("pb_workspaces")
          .select("id, name, kind")
          .eq("user_id", user.id);
        const have = new Set((existing ?? []).map((w) => (w as { name: string }).name));
        const wsRows = DEFAULT_WORKSPACES.filter(
          (w) => draft.default_workspaces.includes(w.id) && !have.has(w.name),
        ).map((w) => ({
          user_id: user.id,
          name: w.name,
          kind: w.id,
          default_mode: w.default_mode,
          color: "primary",
        }));
        if (wsRows.length) {
          const { data: created } = await supabase
            .from("pb_workspaces")
            .insert(wsRows)
            .select("id, kind");
          primaryWorkspaceId =
            (created ?? []).find(
              (w) => (w as { kind: string }).kind === draft.default_workspace_kind,
            )?.id ?? (created?.[0]?.id ?? null);
        } else if (existing?.length) {
          const match = existing.find(
            (w) => (w as { kind: string }).kind === draft.default_workspace_kind,
          );
          primaryWorkspaceId = (match?.id as string) ?? null;
        }
      }

      // Create a custom workspace per project entry.
      if (draft.projects.length > 0) {
        const projRows = draft.projects.map((name) => ({
          user_id: user.id,
          name,
          kind: "custom",
          default_mode: "build",
          color: "primary",
        }));
        await supabase.from("pb_workspaces").insert(projRows);
      }

      // Final profile write — flips onboarded_at + default workspace.
      await supabase.from("pb_profile").upsert(
        {
          user_id: user.id,
          onboarded_at: new Date().toISOString(),
          default_workspace_id: primaryWorkspaceId,
          // Carry-through final state so resume reads are accurate.
          display_name: draft.display_name.trim() || null,
          use_cases: draft.use_cases,
          context_sources: draft.context_sources,
          tone: draft.response_style,
          personalization_depth: draft.personalization_depth,
          depth: draft.detail_level,
          work_mode: draft.work_mode,
          separation_pref: draft.separation_pref,
          infer_prompt_mode: draft.infer_prompt_mode,
        },
        { onConflict: "user_id" },
      );

      toast.success("Your Brain is ready.");
      onComplete();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to finalize";
      toast.error(msg);
    } finally {
      setFinalizing(false);
    }
  }

  const goNext = async () => {
    if (isLast) {
      await finalize();
      return;
    }
    await persistStep(stepKey);
    setStepIdx((i) => Math.min(STEP_KEYS.length - 1, i + 1));
  };

  const goBack = () => setStepIdx((i) => Math.max(0, i - 1));

  const skip = async () => {
    if (isLast) return;
    setStepIdx((i) => Math.min(STEP_KEYS.length - 1, i + 1));
  };

  const saveAndExit = async () => {
    await persistStep(stepKey);
    toast.success("Progress saved. Resume any time.");
  };

  return (
    <div
      data-testid="brain-onboarding-shell"
      data-step={stepKey}
      data-step-index={stepIdx}
      className="min-h-[calc(100vh-4rem)] w-full bg-gradient-to-b from-background via-background to-primary/5 py-10 px-4"
    >
      <div className="max-w-3xl mx-auto">
        {/* ─── Premium header w/ progress bar + chip strip ─── */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Personal Brain · Calibration
              </p>
              <h1 className="text-lg font-semibold text-foreground">
                Let's shape your Brain
              </h1>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Step
              </p>
              <p className="text-sm font-semibold tabular-nums">
                {stepIdx + 1}{" "}
                <span className="text-muted-foreground font-normal">/ {STEP_KEYS.length}</span>
              </p>
            </div>
          </div>
          <Progress
            data-testid="brain-onboarding-progress"
            aria-valuenow={Math.round(progressPct)}
            value={progressPct}
            className="h-1.5"
          />
          <div className="hidden sm:flex flex-wrap gap-1.5">
            {STEP_KEYS.map((k, i) => (
              <button
                key={k}
                type="button"
                disabled={i > stepIdx}
                onClick={() => i <= stepIdx && setStepIdx(i)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                  i === stepIdx
                    ? "bg-primary text-primary-foreground"
                    : i < stepIdx
                      ? "bg-primary/15 text-foreground hover:bg-primary/25 cursor-pointer"
                      : "bg-muted/50 text-muted-foreground cursor-not-allowed"
                }`}
              >
                {STEP_LABELS[k]}
              </button>
            ))}
          </div>
        </div>

        <OnboardingShell density="comfortable">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepKey}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
              className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-6 shadow-sm"
            >
              {stepKey !== "intro" && stepKey !== "summary" && (
                <OnboardingStepHeader
                  chapter={`Step ${stepIdx + 1} of ${STEP_KEYS.length}`}
                  icon={StepIcon}
                  title={titleFor(stepKey)}
                  subtitle={subtitleFor(stepKey)}
                />
              )}

              {stepKey === "intro" && <IntroStep />}

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
                    <div className="flex flex-wrap gap-1.5">
                      {ROLE_OPTIONS.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => update("role", r === draft.role ? "" : r)}
                          className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
                            draft.role === r
                              ? "bg-primary/15 border-primary/40 text-foreground"
                              : "border-border/50 text-muted-foreground hover:border-primary/30"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
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
                  <div className="space-y-1.5">
                    <Label htmlFor="pb-loc">Location (optional)</Label>
                    <Input
                      id="pb-loc"
                      value={draft.location}
                      onChange={(e) => update("location", e.target.value)}
                      placeholder="City, region — helps with local context"
                    />
                  </div>
                </div>
              )}

              {stepKey === "use-cases" && (
                <div className="space-y-5">
                  <div>
                    <Label className="text-xs">What should your Brain help with?</Label>
                    <div className="grid sm:grid-cols-2 gap-2.5 mt-2">
                      {USE_CASES.map((opt) => (
                        <OnboardingChoiceCard
                          key={opt.id}
                          label={opt.label}
                          description={opt.description}
                          icon={opt.icon}
                          selected={draft.use_cases.includes(opt.id)}
                          onSelect={() => toggleArr("use_cases", opt.id)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Pick up to 3 strengths to lean on</Label>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {STRENGTHS.map((s) => {
                        const selected = draft.strengths.includes(s.id);
                        const cap = !selected && draft.strengths.length >= 3;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            disabled={cap}
                            onClick={() => toggleArr("strengths", s.id)}
                            className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
                              selected
                                ? "bg-primary/15 border-primary/40 text-foreground"
                                : cap
                                  ? "border-border/30 text-muted-foreground/40 cursor-not-allowed"
                                  : "border-border/50 text-muted-foreground hover:border-primary/30"
                            }`}
                          >
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Biggest area to support right now</Label>
                    <div className="grid sm:grid-cols-2 gap-2 mt-2">
                      {BIGGEST_NEEDS.map((n) => (
                        <OnboardingChoiceCard
                          key={n.id}
                          label={n.label}
                          selected={draft.biggest_need === n.id}
                          onSelect={() => update("biggest_need", n.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {stepKey === "learning" && (
                <div className="space-y-5 max-w-xl mx-auto">
                  <div>
                    <Label className="text-xs">Topics or skills you're working on</Label>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {SKILL_LIBRARY.map((s) => {
                        const sel = draft.learning_topics.includes(s);
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleArr("learning_topics", s)}
                            className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
                              sel
                                ? "bg-primary/15 border-primary/40 text-foreground"
                                : "border-border/50 text-muted-foreground hover:border-primary/30"
                            }`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Suggested goals</Label>
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
                    <Label className="text-xs">Add your own goal</Label>
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
                  <div>
                    <Label className="text-xs">How do you learn best?</Label>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {LEARNING_STYLES.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleArr("learning_style", s.id)}
                          className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
                            draft.learning_style.includes(s.id)
                              ? "bg-primary/15 border-primary/40 text-foreground"
                              : "border-border/50 text-muted-foreground hover:border-primary/30"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Starting level</Label>
                    <div className="grid sm:grid-cols-2 gap-2 mt-2">
                      {LEARNING_LEVELS.map((l) => (
                        <OnboardingChoiceCard
                          key={l.id}
                          label={l.label}
                          description={l.description}
                          selected={draft.learning_level === l.id}
                          onSelect={() =>
                            update(
                              "learning_level",
                              l.id as OnboardingDraft["learning_level"],
                            )
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {stepKey === "cognition" && (
                <div className="space-y-5">
                  <div>
                    <Label className="text-xs">Default response style</Label>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {RESPONSE_STYLES.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => update("response_style", s.id)}
                          className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
                            draft.response_style === s.id
                              ? "bg-primary/15 border-primary/40 text-foreground"
                              : "border-border/50 text-muted-foreground hover:border-primary/30"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">How should it think with you? (top 2)</Label>
                    <div className="grid sm:grid-cols-2 gap-2 mt-2">
                      {COGNITION_STYLES.map((s) => {
                        const sel = draft.cognition_styles.includes(s.id);
                        const cap = !sel && draft.cognition_styles.length >= 2;
                        return (
                          <OnboardingChoiceCard
                            key={s.id}
                            label={s.label}
                            selected={sel}
                            onSelect={() => !cap && toggleArr("cognition_styles", s.id)}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Preferred output formats</Label>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {OUTPUT_FORMATS.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => toggleArr("output_formats", f.id)}
                          className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
                            draft.output_formats.includes(f.id)
                              ? "bg-primary/15 border-primary/40 text-foreground"
                              : "border-border/50 text-muted-foreground hover:border-primary/30"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Default depth</Label>
                    <div className="grid sm:grid-cols-2 gap-2 mt-2">
                      {DETAIL_LEVELS.map((l) => (
                        <OnboardingChoiceCard
                          key={l.id}
                          label={l.label}
                          description={l.description}
                          selected={draft.detail_level === l.id}
                          onSelect={() => update("detail_level", l.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {stepKey === "scope" && (
                <div className="space-y-5">
                  <div>
                    <Label className="text-xs">How will you use the Brain most?</Label>
                    <div className="grid sm:grid-cols-2 gap-2.5 mt-2">
                      {WORK_MODES.map((m) => (
                        <OnboardingChoiceCard
                          key={m.id}
                          label={m.label}
                          description={m.description}
                          icon={m.icon}
                          selected={draft.work_mode === m.id}
                          onSelect={() =>
                            update("work_mode", m.id as OnboardingDraft["work_mode"])
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Keep contexts separate?</Label>
                    <div className="grid sm:grid-cols-2 gap-2 mt-2">
                      {SEPARATION_PREFS.map((p) => (
                        <OnboardingChoiceCard
                          key={p.id}
                          label={p.label}
                          description={p.description}
                          selected={draft.separation_pref === p.id}
                          onSelect={() =>
                            update(
                              "separation_pref",
                              p.id as OnboardingDraft["separation_pref"],
                            )
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Workspaces to set up</Label>
                    <div className="grid sm:grid-cols-2 gap-2.5 mt-2">
                      {DEFAULT_WORKSPACES.map((w) => (
                        <OnboardingChoiceCard
                          key={w.id}
                          label={w.name}
                          description={w.description}
                          icon={w.icon}
                          selected={draft.default_workspaces.includes(w.id)}
                          onSelect={() => toggleArr("default_workspaces", w.id)}
                        />
                      ))}
                    </div>
                  </div>
                  {draft.default_workspaces.length > 1 && (
                    <div>
                      <Label className="text-xs">Default workspace on open</Label>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {DEFAULT_WORKSPACES.filter((w) =>
                          draft.default_workspaces.includes(w.id),
                        ).map((w) => (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => update("default_workspace_kind", w.id)}
                            className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
                              draft.default_workspace_kind === w.id
                                ? "bg-primary/15 border-primary/40 text-foreground"
                                : "border-border/50 text-muted-foreground hover:border-primary/30"
                            }`}
                          >
                            {w.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {stepKey === "projects" && (
                <div className="space-y-4 max-w-xl mx-auto">
                  <p className="text-sm text-muted-foreground">
                    Add anything you're actively working on. Each becomes a workspace with its own
                    memory.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={draft.projectDraft}
                      onChange={(e) => update("projectDraft", e.target.value)}
                      placeholder="e.g. Q1 launch plan, novel draft, marathon training"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addProject();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={addProject}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {draft.projects.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {draft.projects.map((p, i) => (
                        <Badge
                          key={`${p}-${i}`}
                          variant="outline"
                          className="gap-1.5 pl-2 pr-1 py-1 text-[11px] bg-primary/5 border-primary/20"
                        >
                          <span>{p}</span>
                          <button
                            type="button"
                            onClick={() => removeProject(i)}
                            className="ml-1 rounded-full p-0.5 hover:bg-destructive/10"
                            aria-label={`Remove ${p}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {stepKey === "memory" && (
                <div className="space-y-5 max-w-xl mx-auto">
                  <div>
                    <Label className="text-xs">Personalization depth</Label>
                    <div className="space-y-2.5 mt-2">
                      {(["minimal", "moderate", "deep"] as const).map((id) => (
                        <OnboardingChoiceCard
                          key={id}
                          label={
                            id === "minimal"
                              ? "Minimal"
                              : id === "moderate"
                                ? "Moderate"
                                : "Deep"
                          }
                          description={
                            id === "minimal"
                              ? "Almost no memory. Each chat starts fresh."
                              : id === "moderate"
                                ? "Remembers preferences and active projects."
                                : "Adaptive — learns your patterns over time."
                          }
                          selected={draft.personalization_depth === id}
                          onSelect={() => update("personalization_depth", id)}
                          recommended={id === "moderate"}
                        />
                      ))}
                    </div>
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
                          onSelect={() => toggleArr("context_sources", src.id)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Should I remember this?</Label>
                    <div className="grid sm:grid-cols-3 gap-2 mt-2">
                      {INFER_PROMPT_MODES.map((m) => (
                        <OnboardingChoiceCard
                          key={m.id}
                          label={m.label}
                          description={m.description}
                          selected={draft.infer_prompt_mode === m.id}
                          onSelect={() =>
                            update(
                              "infer_prompt_mode",
                              m.id as OnboardingDraft["infer_prompt_mode"],
                            )
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {stepKey === "voice" && (
                <div className="space-y-5 max-w-xl mx-auto">
                  <div>
                    <Label className="text-xs">How often will you talk to your Brain?</Label>
                    <div className="grid sm:grid-cols-2 gap-2 mt-2">
                      {VOICE_FREQUENCIES.map((f) => (
                        <OnboardingChoiceCard
                          key={f.id}
                          label={f.label}
                          selected={draft.voice_frequency === f.id}
                          onSelect={() => update("voice_frequency", f.id)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Default voice input</Label>
                    <div className="grid sm:grid-cols-2 gap-2 mt-2">
                      {VOICE_INPUT_MODES.map((m) => (
                        <OnboardingChoiceCard
                          key={m.id}
                          label={m.label}
                          description={m.description}
                          selected={draft.voice_input_mode === m.id}
                          onSelect={() => update("voice_input_mode", m.id)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Read replies aloud?</Label>
                    <div className="grid sm:grid-cols-2 gap-2 mt-2">
                      {AUTOREAD_MODES.map((m) => (
                        <OnboardingChoiceCard
                          key={m.id}
                          label={m.label}
                          selected={draft.autoread_mode === m.id}
                          onSelect={() => update("autoread_mode", m.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {stepKey === "privacy" && (
                <div className="space-y-5 max-w-xl mx-auto">
                  <div>
                    <Label className="text-xs">Privacy preset</Label>
                    <div className="space-y-2.5 mt-2">
                      {PRIVACY_PRESETS.map((p) => (
                        <OnboardingChoiceCard
                          key={p.id}
                          label={p.label}
                          description={p.description}
                          selected={draft.privacy_preset === p.id}
                          onSelect={() => {
                            update(
                              "privacy_preset",
                              p.id as OnboardingDraft["privacy_preset"],
                            );
                            if (p.id === "sensitive") update("sensitive_mode", true);
                            if (p.id === "standard") update("sensitive_mode", false);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <ToggleRow
                    label="Sensitive mode override"
                    description="No auto-learn, 7-day retention, no transcript persistence."
                    checked={draft.sensitive_mode}
                    onChange={(v) => update("sensitive_mode", v)}
                  />
                  <p className="text-[11px] text-muted-foreground pt-1">
                    You can change every one of these later in{" "}
                    <span className="text-foreground">Brain Settings</span>.
                  </p>
                </div>
              )}

              {stepKey === "summary" && (
                <SummaryStep draft={draft} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* ─── Adaptive footer ─── */}
          <div className="flex flex-wrap items-center gap-2 pt-4">
            {stepIdx > 0 && (
              <button
                type="button"
                onClick={goBack}
                className="px-3 py-2 rounded-xl bg-card/50 border border-border/50 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card/80 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}
            {stepIdx > 0 && !isLast && OPTIONAL_STEPS.has(stepKey) && (
              <button
                type="button"
                onClick={skip}
                className="px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip this step
              </button>
            )}
            {stepIdx > 1 && !isLast && (
              <button
                type="button"
                onClick={saveAndExit}
                className="px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Save &amp; exit
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              data-testid="brain-onboarding-continue"
              onClick={() => void goNext()}
              disabled={!canAdvance || savingStep || finalizing}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {finalizing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Activating your Brain…
                </>
              ) : isLast ? (
                <>
                  Activate my Brain
                  <Sparkles className="h-4 w-4" />
                </>
              ) : stepKey === "intro" ? (
                <>
                  Begin calibration
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </OnboardingShell>
      </div>
    </div>
  );
}

// ─── Step content helpers ────────────────────────────────────────

function IntroStep() {
  return (
    <div className="text-center max-w-lg mx-auto py-6 space-y-5">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="inline-flex p-4 rounded-2xl bg-primary/10 border border-primary/20"
      >
        <Brain className="h-10 w-10 text-primary" />
      </motion.div>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Let's shape your Brain
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Eleven calibration steps. Most take seconds. Each one teaches your Brain how to think
          with you — and you can change every one later.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 pt-2 max-w-md mx-auto">
        {[
          { icon: Briefcase, label: "Your context" },
          { icon: GraduationCap, label: "Your goals" },
          { icon: Layers, label: "Your style" },
          { icon: Brain, label: "Your memory" },
          { icon: Mic, label: "Your voice" },
          { icon: ShieldCheck, label: "Your privacy" },
        ].map((it, i) => {
          const Icon = it.icon;
          return (
            <motion.div
              key={it.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="rounded-xl border border-border/50 bg-card/40 p-3 flex flex-col items-center gap-1.5"
            >
              <Icon className="h-4 w-4 text-primary" />
              <span className="text-[10px] text-muted-foreground">{it.label}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryStep({ draft }: { draft: OnboardingDraft }) {
  const items = [
    { label: "Identity", value: `${draft.display_name || "—"}${draft.role ? ` · ${draft.role}` : ""}` },
    { label: "Use cases", value: draft.use_cases.length ? `${draft.use_cases.length} selected` : "Skipped" },
    { label: "Goals", value: draft.goals.length ? `${draft.goals.length} active` : "None yet" },
    { label: "Style", value: draft.response_style },
    { label: "Scope", value: draft.work_mode },
    { label: "Workspaces", value: `${draft.default_workspaces.length + draft.projects.length}` },
    { label: "Memory", value: draft.personalization_depth },
    { label: "Privacy", value: draft.privacy_preset },
  ];
  return (
    <div className="text-center max-w-lg mx-auto py-4 space-y-5">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="inline-flex p-4 rounded-2xl bg-primary/10 border border-primary/20"
      >
        <CheckCircle2 className="h-10 w-10 text-primary" />
      </motion.div>
      <div className="space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight">Your Brain is calibrated</h2>
        <p className="text-sm text-muted-foreground">
          Here's how it will start. Everything is editable in Brain Settings.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-left">
        {items.map((it) => (
          <div
            key={it.label}
            className="rounded-lg border border-border/50 bg-card/40 px-3 py-2"
          >
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {it.label}
            </p>
            <p className="text-sm font-medium text-foreground capitalize truncate">
              {it.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function titleFor(key: StepKey): string {
  switch (key) {
    case "identity":  return "Let's start with you";
    case "use-cases": return "What should your Brain help with?";
    case "learning":  return "What are you trying to learn or build?";
    case "cognition": return "How do you want it to think with you?";
    case "scope":     return "Personal, business, or a mix?";
    case "projects":  return "Anything in motion right now?";
    case "memory":    return "How deeply should it adapt to you?";
    case "voice":     return "Voice — your second interface";
    case "privacy":   return "Privacy & data controls";
    default:          return "Personalize your Brain";
  }
}

function subtitleFor(key: StepKey): string {
  switch (key) {
    case "identity":  return "A few basics so the Brain speaks to you, not at you.";
    case "use-cases": return "Pick anything that fits — you can change this any time.";
    case "learning":  return "Optional. Adding goals helps the Brain suggest the right next move.";
    case "cognition": return "We'll match the cadence and shape of every reply to this.";
    case "scope":     return "Decides default routing, separation, and which workspaces seed.";
    case "projects":  return "Each becomes its own workspace with project-specific memory.";
    case "memory":    return "How much of you the Brain remembers between sessions.";
    case "voice":     return "Pick voice defaults — adjust per session at any time.";
    case "privacy":   return "Set the floor — full control lives in settings.";
    default:          return "";
  }
}

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
