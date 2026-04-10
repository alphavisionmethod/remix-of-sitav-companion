// ═══════════════════════════════════════════════════════════════
// SITA OS — Experience Signature Layer
// Tone, cadence, trust language, visual calmness — mode-aware
// ═══════════════════════════════════════════════════════════════

export type ToneLevel = "whisper" | "calm" | "neutral" | "assertive" | "urgent";
export type VerbosityLevel = "minimal" | "concise" | "standard" | "detailed" | "exhaustive";
export type VisualDensity = "spacious" | "balanced" | "compact" | "dense";

export interface ExperienceSignature {
  tone: ToneLevel;
  verbosity: VerbosityLevel;
  visualDensity: VisualDensity;
  animationLevel: "none" | "subtle" | "standard" | "rich";
  urgencyStyle: "soft" | "standard" | "firm";
  greetingStyle: "formal" | "warm" | "casual";
  proofStyle: "minimal" | "standard" | "detailed";
  summaryStyle: "headlines" | "narrative" | "structured";
  escalationStyle: "gentle" | "direct" | "assertive";
  trustLanguage: boolean;        // include trust/confidence signals
  celebrationEnabled: boolean;
}

export interface SignatureContext {
  mode: string;
  surface: string;
  urgentItemCount: number;
  timeOfDay: number;
  cognitiveLoad: number;
}

const MODE_SIGNATURES: Record<string, Partial<ExperienceSignature>> = {
  standard: { tone: "neutral", verbosity: "standard", greetingStyle: "warm" },
  focus: { tone: "calm", verbosity: "minimal", animationLevel: "none", visualDensity: "spacious" },
  executive: { tone: "assertive", verbosity: "concise", greetingStyle: "formal", proofStyle: "detailed" },
  stealth: { tone: "whisper", verbosity: "minimal", animationLevel: "none", celebrationEnabled: false },
  family: { tone: "calm", verbosity: "concise", greetingStyle: "casual", celebrationEnabled: true },
  travel: { tone: "neutral", verbosity: "concise", summaryStyle: "headlines" },
  emergency: { tone: "urgent", verbosity: "minimal", urgencyStyle: "firm", escalationStyle: "assertive" },
  recovery: { tone: "whisper", verbosity: "minimal", visualDensity: "spacious", animationLevel: "subtle" },
  founder: { tone: "assertive", verbosity: "standard", proofStyle: "detailed", trustLanguage: true },
  investor_demo: { tone: "assertive", verbosity: "detailed", greetingStyle: "formal", animationLevel: "rich" },
  boardroom: { tone: "assertive", verbosity: "detailed", greetingStyle: "formal", summaryStyle: "structured" },
};

const BASE_SIGNATURE: ExperienceSignature = {
  tone: "neutral", verbosity: "standard", visualDensity: "balanced",
  animationLevel: "standard", urgencyStyle: "standard", greetingStyle: "warm",
  proofStyle: "standard", summaryStyle: "structured", escalationStyle: "gentle",
  trustLanguage: true, celebrationEnabled: true,
};

export class ExperienceSignatureService {
  getSignature(ctx: SignatureContext): ExperienceSignature {
    const sig = { ...BASE_SIGNATURE, ...(MODE_SIGNATURES[ctx.mode] ?? {}) };

    // Surface adjustments
    if (ctx.surface === "watch" || ctx.surface === "wearable") { sig.verbosity = "minimal"; sig.visualDensity = "spacious"; sig.animationLevel = "none"; }

    // Time of day
    if (ctx.timeOfDay >= 21 || ctx.timeOfDay < 6) { sig.tone = sig.tone === "urgent" ? "urgent" : "whisper"; sig.animationLevel = "subtle"; }

    // Cognitive load
    if (ctx.cognitiveLoad > 75) { sig.verbosity = "minimal"; sig.visualDensity = "spacious"; sig.animationLevel = "none"; }

    // Urgency
    if (ctx.urgentItemCount > 5) { sig.urgencyStyle = "firm"; sig.escalationStyle = "direct"; }

    return sig;
  }
}

export const createExperienceSignature = () => new ExperienceSignatureService();
