// ═══════════════════════════════════════════════════════════════
// SITA OS — Notification/Calm Demo Data
// Extracted from NRC01-06 hardcoded constants
// ═══════════════════════════════════════════════════════════════

export const DEMO_ROUTING_MATRIX = [
  { urg: "silent", normal: "queue", deep: "queue", sleep: "queue", exercise: "queue", travel: "queue" },
  { urg: "low", normal: "queue", deep: "queue", sleep: "queue", exercise: "queue", travel: "queue" },
  { urg: "normal", normal: "desktop banner", deep: "defer", sleep: "defer", exercise: "defer", travel: "phone push" },
  { urg: "high", normal: "phone push", deep: "phone push", sleep: "defer 30min", exercise: "watch nudge", travel: "phone push" },
  { urg: "critical", normal: "urgent escalation", deep: "phone push", sleep: "phone push", exercise: "watch alert", travel: "phone push" },
  { urg: "emergency", normal: "all surfaces", deep: "all surfaces", sleep: "all surfaces", exercise: "all surfaces", travel: "all surfaces" },
];

export const DEMO_CHANNEL_SPECS = [
  { surface: "Desktop/Web", channels: ["In-app banner", "Browser notification", "Work queue item", "Boardroom card", "Inline alert"], maxConcurrent: 3, dndAware: true },
  { surface: "Phone (iOS/Android)", channels: ["Push notification", "Lock screen action", "App inbox", "Bubble/conversation", "Widget update"], maxConcurrent: 5, dndAware: true },
  { surface: "Watch (Apple/Wear OS)", channels: ["Haptic alert", "Glance card", "Micro-action", "Complication update"], maxConcurrent: 2, dndAware: true },
];

export const DEMO_DELIVERY_PRINCIPLES = [
  { principle: "No duplicate delivery", desc: "Never show the same notification on all surfaces simultaneously", severity: "critical" },
  { principle: "Presence-based routing", desc: "Route to the device where user is most active", severity: "high" },
  { principle: "DND/Focus respect", desc: "Honor platform-level focus modes on each device", severity: "high" },
  { principle: "Urgency-based escalation", desc: "Only escalate across surfaces when justified by urgency + time", severity: "medium" },
  { principle: "Delivery receipt tracking", desc: "Track seen/acted per surface for coherent follow-up", severity: "medium" },
  { principle: "Fatigue-aware batching", desc: "Batch repeated categories to prevent overload", severity: "high" },
  { principle: "Summary compression", desc: "Compress multi-item notifications into digest format", severity: "medium" },
];

export const DEMO_ASSISTANT_ROLES = [
  { role: "Chief of Staff", key: "chief_of_staff", tone: "executive", mode: "proactive", escalation: "escalate", domain: "all", desc: "Surfaces what matters, prepares context, orchestrates other roles", priority: "P0" },
  { role: "Operator", key: "operator", tone: "concise", mode: "proactive", escalation: "auto_handle", domain: "operations", desc: "Handles routine tasks, follows up, executes workflows", priority: "P0" },
  { role: "Strategist", key: "strategist", tone: "analytical", mode: "proactive", escalation: "recommend", domain: "strategy", desc: "Analyzes patterns, spots opportunities, recommends actions", priority: "P1" },
  { role: "Money Sentinel", key: "money_sentinel", tone: "precise", mode: "proactive", escalation: "alert", domain: "finance", desc: "Monitors financial health, flags anomalies, tracks cash flow", priority: "P0" },
  { role: "Boardroom Curator", key: "boardroom_curator", tone: "executive", mode: "reactive", escalation: "recommend", domain: "boardroom", desc: "Curates boardroom briefings, enriches data, provides context", priority: "P1" },
  { role: "Follow-Up Guardian", key: "followup_guardian", tone: "professional", mode: "proactive", escalation: "remind", domain: "relationships", desc: "Tracks commitments, reminds on follow-ups, prevents drops", priority: "P1" },
  { role: "Risk Watcher", key: "risk_watcher", tone: "direct", mode: "proactive", escalation: "escalate", domain: "risk", desc: "Monitors risk signals, alerts on thresholds, proposes mitigations", priority: "P0" },
  { role: "Calm Filter", key: "calm_filter", tone: "calm", mode: "proactive", escalation: "suppress", domain: "attention", desc: "Reduces noise, batches updates, protects focus time", priority: "P0" },
];

export const DEMO_CALM_PRINCIPLES = [
  { principle: "Surface what matters", detail: "Don't overwhelm — show the 3 most important things, not 30" },
  { principle: "Prepare what's needed", detail: "Don't wait to be asked — anticipate and prepare context" },
  { principle: "Remind without nagging", detail: "One nudge, not ten — escalate only if truly urgent" },
  { principle: "Escalate only when justified", detail: "Not every low-priority item deserves an interruption" },
  { principle: "Summarize instead of spamming", detail: "Batch and compress — 1 digest beats 15 notifications" },
  { principle: "Premium tone always", detail: "Feel composed, elite, and respectful of the user's time" },
];

export const DEMO_INTERVENTION_SCENARIOS = [
  { scenario: "Cash below threshold", role: "Money Sentinel", intervention: "Alert with context + suggested actions", tone: "precise" },
  { scenario: "Overdue follow-up", role: "Follow-Up Guardian", intervention: "Gentle reminder with last contact info", tone: "professional" },
  { scenario: "10+ notifications in 30min", role: "Calm Filter", intervention: "Batch into digest, suppress low-priority", tone: "calm" },
  { scenario: "Strategic opportunity detected", role: "Strategist", intervention: "Briefing at next ideal window", tone: "analytical" },
  { scenario: "Urgent approval pending", role: "Chief of Staff", intervention: "Escalate with full context + recommendation", tone: "executive" },
  { scenario: "Risk threshold breach", role: "Risk Watcher", intervention: "Immediate alert with mitigation options", tone: "direct" },
];

export const DEMO_FATIGUE_SIGNALS = [
  { signal: "Recent interruption count", threshold: "10+ in 30 min", weight: 0.3, source: "notification_queue" },
  { signal: "Ignored alert rate", threshold: ">60% ignored", weight: 0.25, source: "interaction_log" },
  { signal: "Repeated category frequency", threshold: "3+ same cat in 15 min", weight: 0.15, source: "category_tracker" },
  { signal: "Response time degradation", threshold: "3x baseline", weight: 0.2, source: "response_timer" },
  { signal: "Overload risk (health signal)", threshold: "readiness < low", weight: 0.1, source: "health_signals" },
];

export const DEMO_SUPPRESSION_ACTIONS = [
  { trigger: "Fatigue score > 0.6", action: "Auto-batch repeated categories", duration: "15 min", recovery: "Score drops below 0.4" },
  { trigger: "Fatigue score > 0.7", action: "Extend quiet windows by 50%", duration: "30 min", recovery: "Score drops below 0.5" },
  { trigger: "Fatigue score > 0.8", action: "Convert push → queue for non-critical", duration: "30 min", recovery: "Score drops below 0.6" },
  { trigger: "Fatigue score > 0.9", action: "Summarize instead of individual alerts", duration: "60 min", recovery: "Score drops below 0.7" },
  { trigger: "Overload triggered", action: "Suppress all non-critical for 30 min", duration: "30 min", recovery: "Manual resume or timeout" },
];

export const DEMO_OVERLOAD_TRIGGERS = [
  { trigger: "10+ interruptions in 30 minutes", severity: "high", auto: true, cooldown: "30 min" },
  { trigger: "5+ ignored alerts in sequence", severity: "high", auto: true, cooldown: "15 min" },
  { trigger: "3+ of same category in 15 minutes", severity: "medium", auto: true, cooldown: "15 min" },
  { trigger: "Fatigue score > 0.8", severity: "high", auto: true, cooldown: "30 min" },
  { trigger: "User manually activates quiet mode", severity: "n/a", auto: false, cooldown: "User-defined" },
  { trigger: "Health signal: overload_risk", severity: "high", auto: true, cooldown: "Until readiness improves" },
];

export const DEMO_DELIVERY_TYPES = [
  { type: "Silent queue", cats: "Info updates, system logs, low-priority reports", urgency: "silent/low", volume: "high", userAction: "Pull (check inbox)", retention: "7 days" },
  { type: "Daily digest", cats: "Summary reports, weekly stats, market updates", urgency: "low", volume: "1/day", userAction: "Read summary", retention: "30 days" },
  { type: "Watch nudge", cats: "Gentle reminders, follow-up checks", urgency: "normal", volume: "limited", userAction: "Tap to expand or dismiss", retention: "24 hours" },
  { type: "Phone push", cats: "Approvals, alerts, customer actions", urgency: "high", volume: "moderate", userAction: "Tap to act or snooze", retention: "Until acted" },
  { type: "Desktop work item", cats: "Tasks, workflow steps, document reviews", urgency: "normal/high", volume: "moderate", userAction: "Click to open workspace", retention: "Until completed" },
  { type: "Boardroom escalation", cats: "Risk events, financial alerts, critical incidents", urgency: "critical", volume: "rare", userAction: "Full context + immediate action", retention: "Permanent" },
];

export const DEMO_QUICK_ACTIONS = [
  { action: "Approve", context: "Pending approval items", risk: "medium", surfaces: ["phone", "watch", "desktop"] },
  { action: "Snooze", context: "Any interruptible notification", risk: "none", surfaces: ["phone", "watch", "desktop"] },
  { action: "Route later", context: "Queue for a better time", risk: "none", surfaces: ["phone", "desktop"] },
  { action: "Assign to assistant", context: "Delegate handling to AI role", risk: "low", surfaces: ["phone", "desktop"] },
  { action: "Dismiss", context: "Remove notification", risk: "none", surfaces: ["phone", "watch", "desktop"] },
  { action: "Escalate", context: "Route to higher urgency", risk: "low", surfaces: ["phone", "desktop"] },
  { action: "Open context", context: "View full detail in app", risk: "none", surfaces: ["phone", "desktop"] },
];

export const DEMO_CATEGORY_ROUTING = [
  { category: "approval", defaultDelivery: "phone push", escalation: "boardroom after 2h", priority: "high" },
  { category: "financial_alert", defaultDelivery: "phone push", escalation: "boardroom after 15min", priority: "critical" },
  { category: "follow_up", defaultDelivery: "daily digest", escalation: "phone push after 48h", priority: "normal" },
  { category: "system_update", defaultDelivery: "silent queue", escalation: "none", priority: "low" },
  { category: "customer_action", defaultDelivery: "phone push", escalation: "boardroom after 1h", priority: "high" },
  { category: "risk_event", defaultDelivery: "boardroom escalation", escalation: "all surfaces immediate", priority: "critical" },
  { category: "routine_report", defaultDelivery: "daily digest", escalation: "none", priority: "low" },
];

export const DEMO_CROSS_DEVICE_SURFACES = [
  { surface: "Desktop/Web", channels: ["In-app banner", "Browser notification", "Work queue", "Boardroom card", "Inline alert"], presence: "active_tab", fallback: "phone", dndSignal: "browser_focus" },
  { surface: "Phone (iOS/Android)", channels: ["Push notification", "Lock screen action", "App inbox", "Bubble/conversation", "Widget update"], presence: "app_foreground", fallback: "watch", dndSignal: "os_dnd_mode" },
  { surface: "Watch (Apple/Wear OS)", channels: ["Haptic alert", "Glance card", "Micro-action", "Complication update"], presence: "wrist_detected", fallback: "phone", dndSignal: "theater_mode" },
];

export const DEMO_DELIVERY_RULES = [
  { rule: "No duplicate delivery", desc: "Never show the same notification on all surfaces simultaneously", enforcement: "hard", priority: "P0" },
  { rule: "Presence-based routing", desc: "Route to the most appropriate device based on user presence signals", enforcement: "hard", priority: "P0" },
  { rule: "DND/Focus respect", desc: "Honor platform-level DND and focus modes on each device", enforcement: "hard", priority: "P0" },
  { rule: "Urgency-based escalation", desc: "Escalate across surfaces only when justified by urgency + elapsed time", enforcement: "soft", priority: "P1" },
  { rule: "Delivery receipt tracking", desc: "Track delivery, seen, and acted states per surface per notification", enforcement: "hard", priority: "P1" },
  { rule: "Cross-surface dedup", desc: "If user acts on one surface, dismiss on all others", enforcement: "hard", priority: "P0" },
  { rule: "Fallback chain", desc: "If primary surface is unavailable, try fallback chain", enforcement: "soft", priority: "P1" },
];

export const DEMO_HANDOFF_FLOWS = [
  { from: "Watch", to: "Phone", context: "Approval context, alert detail, full thread", trigger: "User taps 'Open on Phone'", method: "Deep link via push" },
  { from: "Phone", to: "Desktop", context: "Full document, workflow, boardroom", trigger: "User taps 'Continue on Desktop'", method: "URL scheme / Continuity" },
  { from: "Desktop", to: "Phone", context: "Quick approval, mobile task", trigger: "User away from desktop > 5 min", method: "Push notification" },
  { from: "Any", to: "Email", context: "Digest, summary, expired actions", trigger: "No interaction after 24h", method: "Email digest" },
];

export const DEMO_NRC_SUBSYSTEMS = [
  { target: "Attention Routing", key: "nrc_routing", stage: "alpha", readiness: 35, realRouting: true, ruleBased: true, demo: false, blockers: [] as string[], critical: true },
  { target: "Fatigue Engine", key: "nrc_fatigue", stage: "planned", readiness: 10, realRouting: false, ruleBased: false, demo: true, blockers: ["Fatigue tracking implementation", "Signal weighting calibration"], critical: true },
  { target: "Assistant Roles", key: "nrc_roles", stage: "alpha", readiness: 40, realRouting: false, ruleBased: true, demo: true, blockers: ["Role orchestration engine"], critical: false },
  { target: "Queue System", key: "nrc_queue", stage: "planned", readiness: 8, realRouting: false, ruleBased: false, demo: true, blockers: ["Queue persistence", "Digest generation", "Retention policies"], critical: true },
  { target: "Cross-Device Delivery", key: "nrc_cross", stage: "planned", readiness: 5, realRouting: false, ruleBased: false, demo: true, blockers: ["Native push setup", "Multi-device coordination", "Presence detection"], critical: false },
  { target: "Calm Synthesis", key: "nrc_calm", stage: "planned", readiness: 12, realRouting: false, ruleBased: false, demo: true, blockers: ["Tone engine", "Summarization system"], critical: false },
];

export const DEMO_SUPPRESSION_RULES = [
  { readiness: "overload_risk", action: "Suppress all non-critical", urgencyThreshold: "critical", override: true, desc: "User is at risk of overload — only emergencies get through" },
  { readiness: "deep_focus", action: "Defer low + normal urgency", urgencyThreshold: "high", override: true, desc: "Extended focus detected — protect deep work time" },
  { readiness: "recovery_priority", action: "Suppress unless high+", urgencyThreshold: "high", override: false, desc: "Post-exercise/illness — minimize load" },
  { readiness: "low_interruption", action: "Queue for next window", urgencyThreshold: "high", override: false, desc: "User set minimal interruption preference" },
  { readiness: "dnd_recommended", action: "Silent queue only", urgencyThreshold: "critical", override: true, desc: "Device DND or sleep mode detected" },
];

export const DEMO_TIMING_RULES = [
  { readiness: "ideal_strategic_window", action: "Show strategic brief", timing: "Proactive", category: "briefing", desc: "Best time for important planning and review" },
  { readiness: "high", action: "Normal routing, all channels", timing: "Standard", category: "all", desc: "User is alert and available" },
  { readiness: "medium", action: "Prefer summary over push", timing: "Batched", category: "digest", desc: "Normal state — compress where possible" },
  { readiness: "high + morning", action: "Morning strategic brief", timing: "Scheduled", category: "briefing", desc: "Optimal window for strategic content" },
  { readiness: "high + end_of_day", action: "Financial summary", timing: "Scheduled", category: "finance", desc: "Optimal window for financial review" },
];

export const DEMO_OVERRIDE_MATRIX = [
  { urgency: "emergency", alwaysDelivered: true, ignoresReadiness: true, ignoresDND: true },
  { urgency: "critical", alwaysDelivered: true, ignoresReadiness: true, ignoresDND: false },
  { urgency: "high", alwaysDelivered: false, ignoresReadiness: false, ignoresDND: false },
  { urgency: "normal", alwaysDelivered: false, ignoresReadiness: false, ignoresDND: false },
  { urgency: "low", alwaysDelivered: false, ignoresReadiness: false, ignoresDND: false },
  { urgency: "silent", alwaysDelivered: false, ignoresReadiness: false, ignoresDND: false },
];
