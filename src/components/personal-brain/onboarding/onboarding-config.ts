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
  User,
  Briefcase,
  Layers,
  ListChecks,
  Volume2,
  Lock,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

// ─── 11-step calibration ceremony ────────────────────────────────
export const STEP_KEYS = [
  "intro",          // 0
  "identity",       // 1
  "use-cases",      // 2
  "learning",       // 3
  "cognition",      // 4
  "scope",          // 5  (personal vs business vs mixed + workspaces)
  "projects",       // 6  (current projects)
  "memory",         // 7  (depth + sources + infer mode)
  "voice",          // 8
  "privacy",        // 9
  "summary",        // 10
] as const;

export type StepKey = (typeof STEP_KEYS)[number];

export const STEP_LABELS: Record<StepKey, string> = {
  intro: "Intro",
  identity: "Identity",
  "use-cases": "Use cases",
  learning: "Learning",
  cognition: "Style",
  scope: "Scope",
  projects: "Projects",
  memory: "Memory",
  voice: "Voice",
  privacy: "Privacy",
  summary: "Ready",
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
  { id: "writing-style", label: "Writing style", description: "Match your voice and cadence" },
  { id: "business", label: "Business context", description: "Operating model, offers, customers" },
  { id: "personal", label: "Personal context", description: "Routines, preferences, life context" },
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
  intro: Brain,
  identity: Brain,
  "use-cases": Compass,
  learning: GraduationCap,
  cognition: Sparkles,
  scope: Briefcase,
  projects: Layers,
  memory: Brain,
  voice: Mic,
  privacy: ShieldCheck,
  summary: CheckCircle2,
};

// ─── New domain-specific option lists ────────────────────────────

export const ROLE_OPTIONS = [
  "Founder",
  "Business owner",
  "Executive",
  "Operator",
  "Freelancer",
  "Creator",
  "Student",
  "Parent",
  "Consultant",
  "Developer",
  "Designer",
  "Just exploring",
  "Other",
] as const;

export interface LifeContextOption {
  id: "personal" | "business" | "mixed" | "project";
  label: string;
  description: string;
  icon: LucideIcon;
}

export const LIFE_CONTEXTS: LifeContextOption[] = [
  { id: "personal", label: "Mostly personal", description: "Life, learning, reflection", icon: User },
  { id: "business", label: "Mostly business", description: "Strategy, execution, operations", icon: Briefcase },
  { id: "mixed",    label: "A mix of both",   description: "Personal and business often", icon: Layers },
  { id: "project",  label: "Project-based",   description: "Initiatives that change often", icon: ListChecks },
];

export interface StrengthOption { id: string; label: string }
export const STRENGTHS: StrengthOption[] = [
  { id: "clarity",       label: "Clarity" },
  { id: "learning",      label: "Learning" },
  { id: "strategy",      label: "Strategy" },
  { id: "creativity",    label: "Creativity" },
  { id: "planning",      label: "Planning" },
  { id: "execution",     label: "Execution support" },
  { id: "research",      label: "Research" },
  { id: "writing",       label: "Writing" },
  { id: "decisions",     label: "Decision support" },
  { id: "organization",  label: "Personal organization" },
];

export const BIGGEST_NEEDS = [
  { id: "business",  label: "My business" },
  { id: "personal",  label: "My personal life" },
  { id: "learning",  label: "My learning" },
  { id: "ideas",     label: "My ideas and creativity" },
  { id: "planning",  label: "My planning and decisions" },
  { id: "all",       label: "All of the above" },
] as const;

export const SKILL_LIBRARY = [
  "Writing","Public speaking","Communication","Design","Coding","Finance","Investing",
  "Operations","Leadership","Entrepreneurship","Productivity","Negotiation","Marketing",
  "Sales","Parenting","Language learning","Health literacy",
] as const;

export interface LearningStyleOption { id: string; label: string }
export const LEARNING_STYLES: LearningStyleOption[] = [
  { id: "step-by-step",   label: "Step-by-step breakdowns" },
  { id: "visual",         label: "Visual explanations" },
  { id: "frameworks",     label: "Frameworks and models" },
  { id: "examples",       label: "Examples" },
  { id: "summary-first",  label: "Short summaries first" },
  { id: "deep-dives",     label: "Deep dives" },
  { id: "quizzes",        label: "Quizzes" },
  { id: "practice",       label: "Practice exercises" },
  { id: "guided-plans",   label: "Guided plans" },
  { id: "socratic",       label: "Socratic questioning" },
];

export const LEARNING_LEVELS = [
  { id: "beginner",     label: "Beginner",     description: "Start with fundamentals" },
  { id: "intermediate", label: "Intermediate", description: "Build on what I know" },
  { id: "advanced",     label: "Advanced",     description: "Skip basics, go deep" },
  { id: "adaptive",     label: "Adapt dynamically", description: "Match the topic to me" },
] as const;

export const RESPONSE_STYLES = [
  { id: "concise",     label: "Concise" },
  { id: "strategic",   label: "Strategic" },
  { id: "analytical",  label: "Analytical" },
  { id: "creative",    label: "Creative" },
  { id: "coach",       label: "Coach-like" },
  { id: "step",        label: "Step-by-step" },
  { id: "direct",      label: "Direct" },
  { id: "socratic",    label: "Socratic" },
  { id: "warm",        label: "Warm" },
  { id: "formal",      label: "Formal" },
  { id: "high-then-detail", label: "High-level first, then detail" },
] as const;

export const COGNITION_STYLES = [
  { id: "challenge",   label: "Challenge my thinking" },
  { id: "organize",    label: "Organize my thoughts" },
  { id: "options",     label: "Give me options" },
  { id: "best-path",   label: "Recommend one best path" },
  { id: "teach",       label: "Teach me as it goes" },
  { id: "clarify",     label: "Ask clarifying questions first" },
] as const;

export const OUTPUT_FORMATS = [
  { id: "bullets",     label: "Bullet points" },
  { id: "tables",      label: "Tables" },
  { id: "step-plans",  label: "Step-by-step plans" },
  { id: "memos",       label: "Memos" },
  { id: "frameworks",  label: "Frameworks" },
  { id: "checklists",  label: "Checklists" },
  { id: "timelines",   label: "Timelines" },
  { id: "scripts",     label: "Scripts" },
  { id: "structured",  label: "Visual-structured text" },
  { id: "short-then-long", label: "Short answer first, expand after" },
] as const;

export const DETAIL_LEVELS = [
  { id: "concise",  label: "Very concise",  description: "Tight, no filler" },
  { id: "balanced", label: "Balanced",      description: "Just enough detail" },
  { id: "deep",     label: "Deep & thorough", description: "Full reasoning + sources" },
  { id: "context",  label: "Depends on context", description: "Adapt per request" },
] as const;

export const WORK_MODES = [
  { id: "personal", label: "Personal",        description: "Life, learning, reflection",   icon: User },
  { id: "business", label: "Business",        description: "Strategy, ops, execution",     icon: Briefcase },
  { id: "mixed",    label: "Mixed",           description: "Both, often together",         icon: Layers },
  { id: "project",  label: "Project-specific",description: "Focused around initiatives",   icon: ListChecks },
] as const;

export const SEPARATION_PREFS = [
  { id: "always-separate",  label: "Yes, always",       description: "Strict separation between contexts" },
  { id: "mostly-separate",  label: "Mostly separate",   description: "With some overlap" },
  { id: "mixed-ok",         label: "Mixed is fine",     description: "Blend freely" },
  { id: "ask",              label: "Ask me when relevant", description: "Confirm before crossing context" },
] as const;

export interface DefaultWorkspaceOption {
  id: string;       // becomes pb_workspaces.kind
  name: string;     // becomes pb_workspaces.name
  description: string;
  default_mode: string;
  icon: LucideIcon;
}
export const DEFAULT_WORKSPACES: DefaultWorkspaceOption[] = [
  { id: "personal", name: "Personal Brain",  description: "Life, routines, reflection",  default_mode: "reflect",   icon: User },
  { id: "business", name: "Business Brain",  description: "Strategy and execution",      default_mode: "strategize",icon: Briefcase },
  { id: "skill",    name: "Learning Brain",  description: "Skills and study plans",      default_mode: "learn",     icon: GraduationCap },
  { id: "writing",  name: "Writing Brain",   description: "Drafts, edits, ideas",        default_mode: "create",    icon: Palette },
  { id: "finance",  name: "Finance Brain",   description: "Money, investing, planning",  default_mode: "decide",    icon: Scale },
  { id: "custom",   name: "Travel Brain",    description: "Trips, concierge, itineraries", default_mode: "research", icon: Telescope },
];

export const INFER_PROMPT_MODES = [
  { id: "always",    label: "Always",    description: "Confirm every important inference" },
  { id: "sometimes", label: "Sometimes", description: "Only the high-impact ones" },
  { id: "never",     label: "Never",     description: "Quietly learn in the background" },
] as const;

export const VOICE_FREQUENCIES = [
  { id: "often",     label: "Yes, often" },
  { id: "sometimes", label: "Sometimes" },
  { id: "rarely",    label: "Rarely" },
  { id: "never",     label: "Not now" },
] as const;

export const VOICE_INPUT_MODES = [
  { id: "tap",       label: "Tap to speak",        description: "Tap once to start, again to send" },
  { id: "push",      label: "Push to talk",        description: "Hold the button while speaking" },
  { id: "continuous",label: "Continuous",          description: "Wake-word + always-listening" },
  { id: "ask",       label: "I'll choose each time", description: "Pick a mode per session" },
] as const;

export const AUTOREAD_MODES = [
  { id: "always",    label: "Always read replies aloud" },
  { id: "sometimes", label: "Only longer replies" },
  { id: "voice",     label: "Only when in voice mode" },
  { id: "never",     label: "Never" },
] as const;

export const PRIVACY_PRESETS = [
  { id: "standard",  label: "Standard",           description: "Sensible defaults" },
  { id: "high",      label: "High privacy",       description: "Reduced retention, fewer inferences" },
  { id: "sensitive", label: "Sensitive / protected", description: "Strict — minimal memory, no transcripts" },
] as const;

export const SENSITIVE_OPTIONS = [
  { id: "ask-before-save",     label: "Ask before saving any memory" },
  { id: "no-voice-transcripts",label: "No voice transcript retention" },
  { id: "reduced-retention",   label: "Reduced retention (7 days)" },
  { id: "protected-spaces",    label: "Protected workspaces only" },
  { id: "stricter-timeout",    label: "Stricter session timeout" },
] as const;