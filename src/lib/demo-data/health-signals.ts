// ═══════════════════════════════════════════════════════════════
// SITA OS — Health/Signal Intelligence Demo Data
// Extracted from HRS01–HRS06 for clean architecture
// ═══════════════════════════════════════════════════════════════

export const DEMO_CONSENT_CATEGORIES = [
  { cat: "Ingestion", key: "ingestion", desc: "Allow SITA to read this signal from provider", risk: "low" },
  { cat: "Routing Influence", key: "routing", desc: "Allow signal to influence notification routing", risk: "medium" },
  { cat: "Boardroom Visibility", key: "boardroom", desc: "Allow signal summary in boardroom briefings", risk: "medium" },
  { cat: "Assistant Use", key: "assistant", desc: "Allow assistant to reference signal-derived state", risk: "high" },
];

export const DEMO_REVOCATION_ACTIONS = [
  { action: "Revoke ingestion", effect: "Stops all data collection from this signal type", timeline: "Immediate", cascade: "Also revokes routing, boardroom, assistant" },
  { action: "Revoke routing influence", effect: "Signal no longer affects notification decisions", timeline: "Immediate", cascade: "None" },
  { action: "Revoke boardroom visibility", effect: "Signal removed from all briefing summaries", timeline: "Next briefing cycle", cascade: "None" },
  { action: "Revoke assistant use", effect: "Assistant cannot reference signal-derived state", timeline: "Immediate", cascade: "None" },
  { action: "Erase all data", effect: "Complete removal from all stores", timeline: "Within 24 hours", cascade: "All scopes revoked, audit trail preserved" },
];

export const DEMO_SIGNAL_PROVIDERS = [
  { key: "apple_health", name: "Apple Health", api: "HealthKit", native: true, partner: false, stage: "planned", readiness: 10, signals: ["heart_rate", "hrv", "sleep", "steps", "vo2max", "workout"], platform: "iOS" },
  { key: "health_connect", name: "Health Connect", api: "Health Connect API", native: true, partner: false, stage: "planned", readiness: 6, signals: ["heart_rate", "steps", "sleep", "exercise", "blood_glucose"], platform: "Android" },
  { key: "fitbit", name: "Fitbit", api: "REST API", native: false, partner: false, stage: "planned", readiness: 0, signals: ["heart_rate", "sleep", "steps", "activity_zones"], platform: "Cloud" },
  { key: "garmin", name: "Garmin", api: "REST API", native: false, partner: true, stage: "planned", readiness: 0, signals: ["heart_rate", "sleep", "stress", "body_battery"], platform: "Cloud" },
  { key: "oura", name: "Oura Ring", api: "REST API", native: false, partner: false, stage: "planned", readiness: 0, signals: ["sleep", "readiness", "activity", "hrv"], platform: "Cloud" },
  { key: "whoop", name: "Whoop", api: "REST API", native: false, partner: true, stage: "planned", readiness: 0, signals: ["strain", "recovery", "sleep", "hrv"], platform: "Cloud" },
  { key: "polar", name: "Polar", api: "REST API", native: false, partner: true, stage: "planned", readiness: 0, signals: ["heart_rate", "sleep", "training_load"], platform: "Cloud" },
  { key: "manual_input", name: "Manual Input", api: "Manual", native: false, partner: false, stage: "planned", readiness: 15, signals: ["mood", "energy", "pain", "custom"], platform: "All" },
  { key: "device_focus", name: "Device Focus State", api: "SDK", native: true, partner: false, stage: "alpha", readiness: 30, signals: ["focus_mode", "dnd_state", "screen_state"], platform: "iOS/Android" },
];

export const DEMO_READINESS_FACTORS = [
  { level: "high", desc: "User is alert, rested, and available", routing: "All notifications, strategic prompts", color: "text-green-500" },
  { level: "medium", desc: "Normal state, no special considerations", routing: "Standard routing, prefer summary", color: "text-primary" },
  { level: "low", desc: "User is tired or depleted", routing: "Only high+ urgency", color: "text-amber-500" },
  { level: "overload_risk", desc: "Multiple stress signals detected", routing: "Suppress all non-critical", color: "text-destructive" },
  { level: "recovery_priority", desc: "Post-exercise or post-illness", routing: "Suppress unless high+", color: "text-amber-500" },
  { level: "deep_focus", desc: "Extended focus session detected", routing: "Defer low + normal", color: "text-blue-500" },
  { level: "dnd_recommended", desc: "Device DND or sleep mode active", routing: "Queue for next window", color: "text-muted-foreground" },
  { level: "low_interruption", desc: "User preferences indicate minimal interruption", routing: "Queue, digest only", color: "text-muted-foreground" },
  { level: "ideal_strategic_window", desc: "High readiness + available time block", routing: "Strategic brief, planning prompts", color: "text-green-500" },
];

export const DEMO_TIMING_RULES = [
  { rule: "Don't bother during workout", context: "workout_state = active", priority: 0, override: "emergency only", category: "suppression" },
  { rule: "Hold low-value alerts when drained", context: "readiness = low/overload", priority: 1, override: "high+ urgency", category: "suppression" },
  { rule: "Show strategic summary when available", context: "readiness = high + available", priority: 2, override: "n/a", category: "proactive" },
  { rule: "Escalate approval if urgent", context: "despite low readiness", priority: 0, override: "always", category: "escalation" },
  { rule: "Schedule planning prompts", context: "ideal_strategic_window", priority: 3, override: "n/a", category: "proactive" },
  { rule: "Batch low-priority updates", context: "readiness = medium", priority: 4, override: "n/a", category: "optimization" },
  { rule: "Delay financial summaries for focus", context: "deep_focus active", priority: 2, override: "market emergency", category: "suppression" },
];

export const DEMO_SIGNAL_SUBSYSTEMS = [
  { target: "Signal Ingestion", key: "hrs_ingest", stage: "planned", readiness: 12, demo: true, real: false, blockers: ["Provider API integrations", "Native SDK setup", "Rate limiting"], critical: true },
  { target: "Normalization Engine", key: "hrs_norm", stage: "planned", readiness: 8, demo: true, real: false, blockers: ["Signal mapping engine", "Unit conversion system", "Multi-source dedup"], critical: true },
  { target: "Readiness Derivation", key: "hrs_derive", stage: "planned", readiness: 10, demo: true, real: false, blockers: ["Derivation rules engine", "Multi-signal combine", "Confidence scoring"], critical: true },
  { target: "Routing Influence", key: "hrs_route", stage: "planned", readiness: 15, demo: true, real: false, blockers: ["Calm router integration", "Readiness → posture mapping"], critical: true },
  { target: "Assistant Timing", key: "hrs_timing", stage: "planned", readiness: 8, demo: true, real: false, blockers: ["Timing rules engine", "Context awareness", "Window detection"], critical: false },
  { target: "Demo Signals", key: "hrs_demo", stage: "internal", readiness: 80, demo: true, real: false, blockers: [], critical: false },
];

export const DEMO_BRIEFING_WINDOWS = [
  { name: "Morning Strategic Brief", readiness: "high + morning", category: "strategy", content: ["Top priorities", "Key metrics", "Upcoming decisions"], duration: "2-3 min" },
  { name: "Financial Summary", readiness: "high + end of day", category: "finance", content: ["Cash position", "Revenue update", "Outstanding invoices"], duration: "1-2 min" },
  { name: "Weekly Review", readiness: "ideal_strategic_window", category: "review", content: ["Week summary", "Goal progress", "Next week priorities"], duration: "5-7 min" },
  { name: "Quick Decisions", readiness: "medium+ any time", category: "approval", content: ["Pending approvals", "Quick actions", "Time-sensitive items"], duration: "30s-1 min" },
  { name: "Risk Alert", readiness: "any (override)", category: "risk", content: ["Emerging risks", "Threshold breaches", "Urgent items"], duration: "immediate" },
];

export const DEMO_HOLD_VS_ACT = [
  { scenario: "Low readiness + low urgency alert", decision: "HOLD", reason: "Queue for next available window", timing: "Next high readiness window" },
  { scenario: "Low readiness + critical approval", decision: "ACT", reason: "Urgency overrides readiness", timing: "Immediate with minimal context" },
  { scenario: "Deep focus + normal task reminder", decision: "HOLD", reason: "Protect focus time", timing: "Post-focus session" },
  { scenario: "High readiness + strategic opportunity", decision: "ACT", reason: "Ideal window, show strategic content", timing: "Proactive brief" },
  { scenario: "Recovery + financial summary", decision: "HOLD", reason: "Defer cognitive load", timing: "Next high window" },
  { scenario: "Any readiness + emergency", decision: "ACT", reason: "Emergency always overrides", timing: "Immediate full escalation" },
];
