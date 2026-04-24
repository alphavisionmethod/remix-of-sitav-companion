// ═══════════════════════════════════════════════════════════════
// Personal Brain — Effective Mode Behavior resolver
// ═══════════════════════════════════════════════════════════════
// Blends the per-mode default behavior block with the user's
// pb_profile.mode_overrides[modeId] so every consumer (chat
// surface + edge router) gets one consistent shape.
// ═══════════════════════════════════════════════════════════════

import { BRAIN_MODES_BY_ID, type BrainModeBehavior, type BrainModeId } from "@/components/personal-brain/BRAIN_MODES";

export interface PbProfileLike {
  tone?: string | null;
  coaching_style?: string | null;
  format_pref?: string | null;
  personalization_depth?: string | null;
  mode_overrides?: Record<string, Partial<BrainModeBehavior>> | unknown;
  context_sources?: unknown;
  output_formats?: unknown;
}

export interface EffectiveModeBehavior extends BrainModeBehavior {
  modeId: BrainModeId;
  systemPromptHints: string[];
}

function asOverride(profile: PbProfileLike | null | undefined, modeId: BrainModeId): Partial<BrainModeBehavior> {
  const raw = (profile?.mode_overrides ?? {}) as Record<string, unknown>;
  const block = raw[modeId];
  return (block && typeof block === "object" ? block : {}) as Partial<BrainModeBehavior>;
}

export function getEffectiveModeBehavior(
  modeId: BrainModeId,
  profile: PbProfileLike | null | undefined,
): EffectiveModeBehavior {
  const meta = BRAIN_MODES_BY_ID[modeId];
  const base = meta.behavior;
  const override = asOverride(profile, modeId);
  const merged: BrainModeBehavior = {
    tone:              override.tone              ?? profile?.tone              ?? base.tone,
    verbosity:         override.verbosity         ?? base.verbosity,
    output:            override.output            ?? base.output,
    clarifyFirst:      override.clarifyFirst      ?? base.clarifyFirst,
    citeSources:       override.citeSources       ?? base.citeSources,
    useProjectContext: override.useProjectContext ?? base.useProjectContext,
    memoryWeight:      override.memoryWeight      ?? base.memoryWeight,
    voiceFriendly:     override.voiceFriendly     ?? base.voiceFriendly,
  };

  const hints: string[] = [
    `Mode: ${meta.label} — ${meta.short}`,
    `Tone: ${merged.tone}. Verbosity: ${merged.verbosity}.`,
    `Output: ${merged.output}.`,
    merged.clarifyFirst ? "Ask one clarifying question first if the request is ambiguous." : "",
    merged.citeSources ? "Cite sources / files when used." : "",
    merged.useProjectContext ? "Lean on project / workspace context when present." : "",
    `Memory weight: ${merged.memoryWeight}.`,
  ].filter(Boolean);

  return { ...merged, modeId, systemPromptHints: hints };
}
