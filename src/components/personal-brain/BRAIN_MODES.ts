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

export interface BrainModeMeta {
  id: BrainModeId;
  label: string;
  icon: LucideIcon;
  short: string;
  starters: string[];
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