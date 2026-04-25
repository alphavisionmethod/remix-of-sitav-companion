import {
  Lightbulb,
  GraduationCap,
  Hammer,
  Palette,
  Search,
  Target,
  HeartHandshake,
  Sparkles,
  Scale,
  type LucideIcon,
} from "lucide-react";

export type BrainModeId =
  | "think"
  | "learn"
  | "build"
  | "create"
  | "research"
  | "strategize"
  | "coach"
  | "reflect"
  | "decide";

/**
 * Per-mode behavior block — drives system-prompt assembly in
 * `getEffectiveModeBehavior` and the `personal-brain` edge router.
 */
export interface BrainModeBehavior {
  /** Default tone keyword blended with the user's tone preference. */
  tone: string;
  /** Verbosity bias: concise | balanced | deep. */
  verbosity: "concise" | "balanced" | "deep";
  /** Output structure hint passed to the model. */
  output: string;
  /** Ask clarifying questions before answering. */
  clarifyFirst: boolean;
  /** Cite sources / files when used. */
  citeSources: boolean;
  /** Use project context aggressively (when in a workspace). */
  useProjectContext: boolean;
  /** Memory weight: how much to lean on prior memories. */
  memoryWeight: "low" | "medium" | "high";
  /** Voice compatibility — whether voice is a first-class fit. */
  voiceFriendly: boolean;
}

export interface BrainModeMeta {
  id: BrainModeId;
  label: string;
  icon: LucideIcon;
  short: string;
  starters: string[];
  behavior: BrainModeBehavior;
}

export const BRAIN_MODES: BrainModeMeta[] = [
  {
    id: "think",
    label: "Think",
    icon: Lightbulb,
    short: "Brainstorm, reflect, reason from multiple angles.",
    starters: [
      "Help me think through a decision I'm stuck on…",
      "What are 3 angles I'm missing on this problem?",
      "Play devil's advocate against my current plan.",
    ],
    behavior: {
      tone: "exploratory",
      verbosity: "balanced",
      output: "structured paragraphs with 2-3 angles",
      clarifyFirst: true,
      citeSources: false,
      useProjectContext: true,
      memoryWeight: "medium",
      voiceFriendly: true,
    },
  },
  {
    id: "learn",
    label: "Learn",
    icon: GraduationCap,
    short: "Master a new skill or topic, step by step.",
    starters: [
      "Teach me the fundamentals of …",
      "Quiz me on what I learned this week.",
      "Build me a 30-day learning plan for …",
    ],
    behavior: {
      tone: "encouraging",
      verbosity: "deep",
      output: "step-by-step with examples",
      clarifyFirst: false,
      citeSources: true,
      useProjectContext: false,
      memoryWeight: "high",
      voiceFriendly: true,
    },
  },
  {
    id: "build",
    label: "Build",
    icon: Hammer,
    short: "Plan and ship a project, product, or business.",
    starters: [
      "Help me scope an MVP for …",
      "What's the smallest next step I can ship today?",
      "Stress-test my product idea.",
    ],
    behavior: {
      tone: "execution-oriented",
      verbosity: "concise",
      output: "action plan with next-step checklist",
      clarifyFirst: true,
      citeSources: false,
      useProjectContext: true,
      memoryWeight: "high",
      voiceFriendly: false,
    },
  },
  {
    id: "create",
    label: "Create",
    icon: Palette,
    short: "Write, design, compose, or invent something new.",
    starters: [
      "Help me draft …",
      "Give me 5 creative directions for …",
      "Rewrite this in a sharper voice.",
    ],
    behavior: {
      tone: "warm",
      verbosity: "balanced",
      output: "drafts and creative directions",
      clarifyFirst: false,
      citeSources: false,
      useProjectContext: true,
      memoryWeight: "medium",
      voiceFriendly: true,
    },
  },
  {
    id: "research",
    label: "Research",
    icon: Search,
    short: "Investigate, synthesize, and surface unknowns.",
    starters: [
      "Research the landscape of …",
      "What are the open questions about …?",
      "Compare options A vs B vs C with trade-offs.",
    ],
    behavior: {
      tone: "analytical",
      verbosity: "deep",
      output: "structured synthesis with sources",
      clarifyFirst: false,
      citeSources: true,
      useProjectContext: true,
      memoryWeight: "low",
      voiceFriendly: false,
    },
  },
  {
    id: "strategize",
    label: "Strategize",
    icon: Target,
    short: "Frame trade-offs and propose decisions.",
    starters: [
      "Help me build a 90-day strategy for …",
      "What's my best leverage point right now?",
      "Map second-order effects of this move.",
    ],
    behavior: {
      tone: "strategic",
      verbosity: "balanced",
      output: "tight memo with options + recommendation",
      clarifyFirst: false,
      citeSources: false,
      useProjectContext: true,
      memoryWeight: "high",
      voiceFriendly: false,
    },
  },
  {
    id: "coach",
    label: "Coach",
    icon: HeartHandshake,
    short: "Hold me accountable, ask powerful questions.",
    starters: [
      "Coach me through a tough week.",
      "Help me reset my energy and priorities.",
      "What am I avoiding right now?",
    ],
    behavior: {
      tone: "supportive",
      verbosity: "concise",
      output: "questions back + one clear action",
      clarifyFirst: true,
      citeSources: false,
      useProjectContext: false,
      memoryWeight: "high",
      voiceFriendly: true,
    },
  },
  {
    id: "reflect",
    label: "Reflect",
    icon: Sparkles,
    short: "Process events and surface one clear insight.",
    starters: [
      "Help me reflect on today.",
      "What patterns do you see in my last 10 chats?",
      "Turn this rough journal entry into one insight.",
    ],
    behavior: {
      tone: "warm",
      verbosity: "concise",
      output: "one paragraph insight + a question",
      clarifyFirst: false,
      citeSources: false,
      useProjectContext: false,
      memoryWeight: "high",
      voiceFriendly: true,
    },
  },
  {
    id: "decide",
    label: "Decide",
    icon: Scale,
    short: "Lay out options, criteria, and recommend.",
    starters: [
      "Help me decide between …",
      "What criteria should I weigh here?",
      "Make a recommendation with rationale.",
    ],
    behavior: {
      tone: "direct",
      verbosity: "concise",
      output: "options table + recommendation with rationale",
      clarifyFirst: true,
      citeSources: false,
      useProjectContext: true,
      memoryWeight: "medium",
      voiceFriendly: false,
    },
  },
];

export const BRAIN_MODES_BY_ID: Record<BrainModeId, BrainModeMeta> =
  BRAIN_MODES.reduce((acc, m) => {
    acc[m.id] = m;
    return acc;
  }, {} as Record<BrainModeId, BrainModeMeta>);

export function isBrainModeId(value: unknown): value is BrainModeId {
  return typeof value === "string" && value in BRAIN_MODES_BY_ID;
}