// ═══════════════════════════════════════════════════════════════
// SITA OS — Personal Brain Onboarding Config
// ═══════════════════════════════════════════════════════════════
// Static option lists for the 6-step intake. Kept in a single file
// so settings screens can reuse the same canonical labels later.
// ═══════════════════════════════════════════════════════════════

import {
  Brain,
  Compass,
  Target,
  Sparkles,
  ShieldCheck,
  Mic,
  Lightbulb,
  GraduationCap,
  Hammer,
  Palette,
  Search,
  Map,
  HeartHandshake,
  Telescope,
  Scale,
  type LucideIcon,
} from "lucide-react";

export const STEP_KEYS = [
  "identity",
  "use-cases",
  "goals",
  "thinking-style",
  "depth",
  "voice-privacy",
] as const;

export type StepKey = (typeof STEP_KEYS)[number];

export const STEP_LABELS: Record<StepKey, string> = {
  identity: "Identity",
  "use-cases": "Use cases",
  goals: "Goals",
  "thinking-style": "Style",
  depth: "Depth",
  "voice-privacy": "Voice & privacy",
};

export interface UseCaseOption {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const USE_CASES: UseCaseOption[] = [
  { id: "learn", label: "Learn new skills", description: "Curated paths and explanations", icon: GraduationCap },
  { id: "research", label: "Research", description: "Deep-dive any topic with sources", icon: Search },
  { id: "write", label: "Writing", description: "Drafts, edits, voice-matched prose", icon: Palette },
  { id: "plan", label: "Plan & organize", description: "Personal & business planning", icon: Map },
  { id: "build", label: "Build a project", description: "From idea to shipped", icon: Hammer },
  { id: "decide", label: "Decide", description: "Compare options, weigh tradeoffs", icon: Scale },
  { id: "create", label: "Create", description: "Ideas, content, design briefs", icon: Sparkles },
  { id: "reflect", label: "Reflect", description: "Journaling, retros, growth", icon: Lightbulb },
  { id: "coach", label: "Coach me", description: "Socratic prompts that push you", icon: HeartHandshake },
  { id: "explore", label: "Explore", description: "Curiosity-led wandering", icon: Telescope },
];

export interface ThinkingStyleOption {
  id: string;
  label: string;
  description: string;
}

export const THINKING_STYLES: ThinkingStyleOption[] = [
  { id: "concise", label: "Concise", description: "Tight, no filler" },
  { id: "strategic", label: "Strategic", description: "Frameworks and tradeoffs first" },
  { id: "coach", label: "Coach-like", description: "Asks back, builds your thinking" },
  { id: "analytical", label: "Analytical", description: "Structured, evidence-led" },
  { id: "creative", label: "Creative", description: "Wide ideation, surprising angles" },
  { id: "step-by-step", label: "Step-by-step", description: "Walk me through it" },
  { id: "socratic", label: "Socratic", description: "Questions over answers" },
  { id: "direct", label: "Direct", description: "Tell me the call" },
];

export interface DepthOption {
  id: "minimal" | "moderate" | "deep";
  label: string;
  description: string;
  icon: LucideIcon;
}

export const DEPTH_OPTIONS: DepthOption[] = [
  { id: "minimal", label: "Minimal", description: "Almost no memory. Each chat starts fresh.", icon: ShieldCheck },
  { id: "moderate", label: "Moderate", description: "Remembers your preferences and active projects.", icon: Compass },
  { id: "deep", label: "Deep", description: "Adaptive intelligence. Learns your patterns over time.", icon: Brain },
];

export interface ContextSourceOption {
  id: string;
  label: string;
  description: string;
}

export const CONTEXT_SOURCES: ContextSourceOption[] = [
  { id: "chats", label: "Past chats", description: "Use prior conversations as context" },
  { id: "files", label: "Uploaded files", description: "Index your documents into the Brain" },
  { id: "advisors", label: "Advisor context", description: "Borrow signal from your boardroom" },
  { id: "projects", label: "Projects", description: "Workspace-specific memory" },
  { id: "goals", label: "Goals", description: "Learning goals shape suggestions" },
];

export interface GoalHorizonOption {
  days: number;
  label: string;
}

export const GOAL_HORIZONS: GoalHorizonOption[] = [
  { days: 90, label: "3 months" },
  { days: 180, label: "6 months" },
  { days: 365, label: "12 months" },
];

export const SUGGESTED_GOALS = [
  "Public speaking",
  "Negotiation",
  "Strategic writing",
  "Design fundamentals",
  "Personal finance",
  "Coding",
  "Product thinking",
  "Operations",
  "Health & longevity",
  "Language learning",
  "Parenting",
  "Leadership",
] as const;

export const STEP_ICONS: Record<StepKey, LucideIcon> = {
  identity: Brain,
  "use-cases": Compass,
  goals: Target,
  "thinking-style": Sparkles,
  depth: Brain,
  "voice-privacy": Mic,
};