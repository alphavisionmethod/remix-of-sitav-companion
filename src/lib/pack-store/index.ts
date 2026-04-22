// ═══════════════════════════════════════════════════════════════
// SITA OS — Pack Store Data Model + Mock Catalog
// The curated expansion layer of the operating system
// ═══════════════════════════════════════════════════════════════

// ── Pack Manifest Model ─────────────────────────────────────────

export type PackClass = "persona" | "vertical" | "workflow" | "role" | "advisor" | "template" | "connector" | "surface" | "bundle";
export type OwnerType = "first-party" | "curated-partner" | "internal-private";
export type EntitlementTier = "free" | "starter" | "professional" | "premium" | "enterprise";
export type PackStatus = "available" | "installed" | "installing" | "setup-required" | "update-available" | "trial-active" | "trial-ending" | "paused" | "disabled" | "incompatible" | "migrating";

export interface PackManifest {
  pack_id: string;
  name: string;
  subtitle: string;
  description: string;
  long_description: string;
  pack_class: PackClass;
  owner_type: OwnerType;
  icon: string;
  gradient: string;
  target_segments: string[];
  problems_solved: string[];
  outcomes_improved: string[];
  required_domains: string[];
  shell_spaces_added: string[];
  shell_spaces_modified: string[];
  advisors_enabled: string[];
  workflow_families: string[];
  boardroom_views: string[];
  templates: string[];
  connectors_supported: string[];
  connectors_required: string[];
  policy_presets: string[];
  approval_presets: string[];
  permissions_required: string[];
  entitlement_tier: EntitlementTier;
  trial_supported: boolean;
  trial_days: number;
  dependencies: string[];
  version: string;
  changelog: string[];
  migration_rules: string[];
  proof_models_used: string[];
  events_emitted: string[];
  setup_time_minutes: number;
  time_to_first_value: string;
  screenshots: string[];
  pricing?: { monthly: number; annual: number; currency: string };
  rating?: number;
  installs?: number;
  category: StoreCategory;
  featured?: boolean;
  new_release?: boolean;
}

export type StoreCategory = "founders" | "families" | "service-business" | "finance" | "workflows" | "advisors" | "templates" | "connectors" | "surfaces";

export interface InternalApp {
  app_id: string;
  name: string;
  subtitle: string;
  description: string;
  domain: "business" | "finance" | "concierge" | "shared";
  icon: string;
  gradient: string;
  default_enabled: boolean;
  premium: boolean;
  packs_that_affect: string[];
  workflows_included: string[];
  advisors_powering: string[];
  connectors_used: string[];
  proof_implications: string[];
  route: string;
}

export interface InstallState {
  pack_id: string;
  status: PackStatus;
  installed_at?: number;
  updated_at?: number;
  version_installed?: string;
  trial_started_at?: number;
  trial_ends_at?: number;
  setup_completed: boolean;
  connectors_linked: string[];
  proof_receipt_id?: string;
}

export interface PackAnalytics {
  pack_id: string;
  attach_rate: number;
  time_to_first_value_avg: string;
  retention_lift: number;
  arpu_uplift: number;
  activation_speed: string;
  workflow_completion_lift: number;
  install_completion_rate: number;
  uninstall_reasons: string[];
  revenue_generated: number;
}

// ── Mock Internal Apps ──────────────────────────────────────────

export const INTERNAL_APPS: InternalApp[] = [
  {
    app_id: "app-business", name: "Business", subtitle: "CRM, leads, quotes, invoices", description: "Full business operations center with CRM, lead management, quoting, invoicing, and customer intelligence.",
    domain: "business", icon: "Briefcase", gradient: "from-primary to-sita-purple-light", default_enabled: true, premium: false,
    packs_that_affect: ["pack-founder-boardroom", "pack-med-spa", "pack-lead-recovery", "pack-collections"],
    workflows_included: ["lead-follow-up", "quote-to-invoice", "collections-ladder", "customer-reactivation"],
    advisors_powering: ["Business Advisor", "Sales Advisor", "Collections Advisor"],
    connectors_used: ["stripe", "quickbooks", "google-workspace"], proof_implications: ["invoice-delivery", "payment-receipt", "quote-sent"], route: "/business",
  },
  {
    app_id: "app-money", name: "Money", subtitle: "Bills, reserves, cash timing, investments", description: "Complete financial intelligence with bill management, reserve protection, cash flow analysis, and investment office.",
    domain: "finance", icon: "DollarSign", gradient: "from-trust-safe to-emerald-400", default_enabled: true, premium: false,
    packs_that_affect: ["pack-family-office", "pack-investment-office", "pack-revenue-autopilot"],
    workflows_included: ["bill-payment", "reserve-check", "subscription-audit", "cash-timing-forecast"],
    advisors_powering: ["Money Advisor", "Treasury Advisor", "Capital Allocation Advisor"],
    connectors_used: ["plaid", "stripe", "mercury"], proof_implications: ["payment-execution", "reserve-status", "budget-adherence"], route: "/money",
  },
  {
    app_id: "app-concierge", name: "Concierge", subtitle: "Calendar, tasks, travel, household", description: "Household and lifestyle management with calendar intelligence, task tracking, travel planning, and provider coordination.",
    domain: "concierge", icon: "Headphones", gradient: "from-accent to-sita-gold-light", default_enabled: true, premium: false,
    packs_that_affect: ["pack-family-coo", "pack-household-ops", "pack-travel-continuity"],
    workflows_included: ["appointment-prep", "grocery-planning", "travel-booking", "event-management"],
    advisors_powering: ["Concierge Advisor", "Calendar Advisor", "Travel Advisor"],
    connectors_used: ["google-calendar", "instacart-api"], proof_implications: ["booking-confirmation", "task-completion"], route: "/concierge",
  },
  {
    app_id: "app-revenue-autopilot", name: "Revenue Autopilot", subtitle: "Leakage detection, recovery, opportunity ranking", description: "Automated revenue recovery engine that continuously detects leaks, recovers value, and ranks opportunities across your business.",
    domain: "business", icon: "TrendingUp", gradient: "from-trust-safe to-primary", default_enabled: false, premium: true,
    packs_that_affect: ["pack-revenue-autopilot", "pack-collections", "pack-lead-recovery"],
    workflows_included: ["leakage-scan", "auto-recovery", "opportunity-ranking", "recovered-value-ledger"],
    advisors_powering: ["Business Advisor", "Growth Advisor", "Collections Advisor"],
    connectors_used: ["stripe", "quickbooks"], proof_implications: ["revenue-recovered", "leak-detected", "value-ledger"], route: "/business/revenue-autopilot",
  },
  {
    app_id: "app-investment-office", name: "Investment Office", subtitle: "Portfolio, regime, thesis vault, committee", description: "Premium family office and investment intelligence with regime detection, portfolio risk analysis, thesis management, and committee boardroom.",
    domain: "finance", icon: "BarChart3", gradient: "from-sita-purple-dark to-primary", default_enabled: false, premium: true,
    packs_that_affect: ["pack-investment-office", "pack-family-office"],
    workflows_included: ["regime-monitor", "portfolio-review", "thesis-evaluation", "committee-prep"],
    advisors_powering: ["Investment Discipline Advisor", "Capital Allocation Advisor", "Finance Risk Advisor"],
    connectors_used: ["plaid", "alpaca", "coinbase"], proof_implications: ["thesis-review", "allocation-decision", "regime-alert"], route: "/money/investment-office",
  },
  {
    app_id: "app-boardroom", name: "Boardroom", subtitle: "Executive review, advisor synthesis, proof", description: "Multi-perspective boardroom with executive, analyst, and owner views powered by advisor council synthesis.",
    domain: "shared", icon: "BarChart3", gradient: "from-primary to-accent", default_enabled: true, premium: false,
    packs_that_affect: ["pack-founder-boardroom", "pack-family-office"],
    workflows_included: ["weekly-review", "quarterly-reset", "boardroom-packet-generation"],
    advisors_powering: ["Boardroom Meta-Advisor", "Business Boardroom Advisor", "Finance Boardroom Advisor"],
    connectors_used: [], proof_implications: ["boardroom-decision", "review-completion"], route: "/boardroom",
  },
  {
    app_id: "app-files", name: "Files", subtitle: "Documents, OCR, classification, knowledge", description: "Intelligent file management with automatic classification, OCR extraction, deadline detection, and knowledge graph linking.",
    domain: "shared", icon: "FolderOpen", gradient: "from-blue-500 to-blue-400", default_enabled: true, premium: false,
    packs_that_affect: [], workflows_included: ["file-ingestion", "deadline-extraction", "classification"], advisors_powering: [],
    connectors_used: ["google-drive", "dropbox"], proof_implications: ["file-classified", "deadline-detected"], route: "/files",
  },
  {
    app_id: "app-mission-control", name: "Mission Control", subtitle: "AI workforce, system health, governance", description: "Full administrative control over the AI workforce, system health, policy management, and governance review.",
    domain: "shared", icon: "Shield", gradient: "from-muted-foreground to-foreground", default_enabled: true, premium: false,
    packs_that_affect: [], workflows_included: ["system-audit", "policy-review", "incident-triage"], advisors_powering: ["Trust / Policy Advisor"],
    connectors_used: [], proof_implications: ["governance-audit", "policy-change"], route: "/mission-control",
  },
];

// ── Mock Pack Catalog ───────────────────────────────────────────

export const PACK_CATALOG: PackManifest[] = [
  // ── Persona Packs ──
  {
    pack_id: "pack-founder-boardroom", name: "Founder Boardroom", subtitle: "Executive operating layer for founders", description: "Complete founder operating system with weekly reviews, advisor synthesis, decision journals, and strategic planning.",
    long_description: "Transform SITA into a founder's operating cockpit. Get weekly business reviews, cross-domain priority synthesis, advisor disagreement visibility, decision proof journals, and quarterly operating resets — all tailored for operators who run everything.",
    pack_class: "persona", owner_type: "first-party", icon: "Crown", gradient: "from-accent to-sita-gold-dark",
    target_segments: ["founders", "operators", "solopreneurs"], problems_solved: ["No executive review rhythm", "Decisions made without data", "No proof of business reasoning"],
    outcomes_improved: ["Decision quality +40%", "Review time -60%", "Strategic clarity +80%"],
    required_domains: ["business", "finance"], shell_spaces_added: [], shell_spaces_modified: ["boardroom", "daily-pulse"],
    advisors_enabled: ["Business Boardroom Advisor", "Scenario Advisor"], workflow_families: ["weekly-review", "quarterly-reset", "decision-journal"],
    boardroom_views: ["founder-executive", "founder-strategic"], templates: ["Weekly Review Deck", "Board Update Template", "Decision Journal"],
    connectors_supported: ["stripe", "quickbooks", "google-workspace"], connectors_required: [],
    policy_presets: ["founder-autonomy-high"], approval_presets: ["founder-single-approve"],
    permissions_required: ["boardroom.full", "advisor.council"], entitlement_tier: "professional",
    trial_supported: true, trial_days: 14, dependencies: [], version: "2.1.0",
    changelog: ["Added quarterly operating reset", "Improved advisor synthesis view", "New decision journal workflow"],
    migration_rules: [], proof_models_used: ["decision-proof", "review-completion"], events_emitted: ["pack.founder-boardroom.review-started", "pack.founder-boardroom.decision-recorded"],
    setup_time_minutes: 5, time_to_first_value: "First weekly review in < 10 minutes",
    screenshots: [], pricing: { monthly: 29, annual: 290, currency: "USD" }, rating: 4.9, installs: 1240,
    category: "founders", featured: true,
  },
  {
    pack_id: "pack-family-coo", name: "Family COO", subtitle: "Run your household like a calm operator", description: "Household operations intelligence with task delegation, calendar sync, provider management, and family boardroom reviews.",
    long_description: "Your household deserves the same operating discipline as a well-run company. Family COO gives you task tracking, calendar intelligence, provider management, shopping optimization, event planning, and family boardroom reviews — all with the calm precision of a seasoned chief of staff.",
    pack_class: "persona", owner_type: "first-party", icon: "Home", gradient: "from-trust-safe to-emerald-300",
    target_segments: ["families", "parents", "household-managers"], problems_solved: ["Chaotic household management", "No visibility into family obligations", "Provider coordination gaps"],
    outcomes_improved: ["Family task completion +50%", "Missed appointments -80%", "Provider management time -40%"],
    required_domains: ["concierge"], shell_spaces_added: [], shell_spaces_modified: ["concierge", "daily-pulse"],
    advisors_enabled: ["Family / Household Advisor", "Household Operations Advisor", "Concierge Boardroom Advisor"],
    workflow_families: ["household-task-routing", "provider-coordination", "family-calendar-sync"],
    boardroom_views: ["family-weekly", "household-ops"], templates: ["Family Meeting Agenda", "Chore Chart", "Provider Review"],
    connectors_supported: ["google-calendar", "apple-calendar"], connectors_required: [],
    policy_presets: ["family-shared-visibility"], approval_presets: ["family-delegate"],
    permissions_required: ["concierge.full", "household.manage"], entitlement_tier: "starter",
    trial_supported: true, trial_days: 14, dependencies: [], version: "1.8.0",
    changelog: ["Added grocery intelligence", "Improved provider scoring", "Family boardroom view"],
    migration_rules: [], proof_models_used: ["task-completion", "appointment-confirmed"], events_emitted: ["pack.family-coo.task-delegated"],
    setup_time_minutes: 3, time_to_first_value: "Organized household in < 5 minutes",
    screenshots: [], pricing: { monthly: 12, annual: 120, currency: "USD" }, rating: 4.8, installs: 3200,
    category: "families", featured: true,
  },

  // ── Vertical Packs ──
  {
    pack_id: "pack-med-spa", name: "Med Spa Growth", subtitle: "Purpose-built for med spa operators", description: "Lead management, booking continuity, no-show recovery, and upsell intelligence for med spa businesses.",
    long_description: "Built specifically for med spa, wellness, and beauty operators. Includes appointment-based lead management, no-show recovery workflows, rebooking automation, treatment upsell intelligence, and provider-specific boardroom reviews.",
    pack_class: "vertical", owner_type: "first-party", icon: "Sparkles", gradient: "from-pink-500 to-rose-400",
    target_segments: ["med-spas", "wellness", "beauty"], problems_solved: ["High no-show rates", "Poor rebooking conversion", "No treatment upsell visibility"],
    outcomes_improved: ["No-show rate -45%", "Rebooking rate +35%", "Treatment revenue +20%"],
    required_domains: ["business", "concierge"], shell_spaces_added: [], shell_spaces_modified: ["business"],
    advisors_enabled: ["Growth Advisor", "Booking Continuity Advisor"], workflow_families: ["no-show-recovery", "rebooking-automation", "upsell-prompt"],
    boardroom_views: ["spa-ops-review"], templates: ["Treatment Menu", "Follow-Up Sequence", "Rebooking Email"],
    connectors_supported: ["stripe", "square", "mindbody"], connectors_required: [],
    policy_presets: ["appointment-business"], approval_presets: [], permissions_required: ["business.full"],
    entitlement_tier: "professional", trial_supported: true, trial_days: 14, dependencies: [], version: "1.5.0",
    changelog: ["Added treatment upsell intelligence", "Improved no-show prediction"], migration_rules: [],
    proof_models_used: ["booking-confirmed", "no-show-recovered"], events_emitted: ["pack.med-spa.no-show-detected"],
    setup_time_minutes: 8, time_to_first_value: "First no-show recovery in < 24 hours",
    screenshots: [], pricing: { monthly: 39, annual: 390, currency: "USD" }, rating: 4.7, installs: 580,
    category: "service-business", featured: true, new_release: true,
  },
  {
    pack_id: "pack-ecommerce-mission", name: "E-Commerce Mission Control", subtitle: "Orders, fulfillment, returns, revenue pulse", description: "Real-time e-commerce operations with order tracking, fulfillment monitoring, return management, and revenue pulse dashboards.",
    long_description: "Turn SITA into an e-commerce command center. Track orders, monitor fulfillment pipelines, manage returns proactively, and get real-time revenue pulse dashboards — all integrated with your existing e-commerce platform.",
    pack_class: "vertical", owner_type: "first-party", icon: "ShoppingBag", gradient: "from-orange-500 to-amber-400",
    target_segments: ["ecommerce", "dtc-brands", "retail"], problems_solved: ["No unified order view", "Return leakage", "Fulfillment blind spots"],
    outcomes_improved: ["Fulfillment visibility +90%", "Return processing -50%", "Revenue tracking accuracy +60%"],
    required_domains: ["business", "finance"], shell_spaces_added: [], shell_spaces_modified: ["business", "money"],
    advisors_enabled: ["Operations Advisor", "Revenue Autopilot Advisor"], workflow_families: ["order-tracking", "return-processing", "fulfillment-alert"],
    boardroom_views: ["ecommerce-daily"], templates: ["Order Summary", "Return Report"], connectors_supported: ["shopify", "stripe"],
    connectors_required: [], policy_presets: [], approval_presets: [], permissions_required: ["business.full"],
    entitlement_tier: "professional", trial_supported: true, trial_days: 14, dependencies: [], version: "1.2.0",
    changelog: ["Initial release with Shopify integration"], migration_rules: [],
    proof_models_used: ["order-fulfilled", "return-processed"], events_emitted: [],
    setup_time_minutes: 10, time_to_first_value: "Order visibility in < 15 minutes",
    screenshots: [], pricing: { monthly: 49, annual: 490, currency: "USD" }, rating: 4.6, installs: 320,
    category: "service-business",
  },

  // ── Workflow Packs ──
  {
    pack_id: "pack-collections", name: "Collections Command Center", subtitle: "Automated escalation ladders for overdue invoices", description: "Full collections intelligence with aging buckets, escalation ladders, automated chase sequences, and recovered-value tracking.",
    long_description: "Stop leaving money on the table. This pack gives you a complete collections engine with customizable escalation ladders, automated email/SMS chase sequences, aging bucket visualization, and a recovered-value ledger that proves the ROI of every follow-up.",
    pack_class: "workflow", owner_type: "first-party", icon: "Receipt", gradient: "from-urgency-high to-red-400",
    target_segments: ["service-businesses", "freelancers", "agencies"], problems_solved: ["Unpaid invoices", "No escalation process", "Manual follow-up fatigue"],
    outcomes_improved: ["Collection rate +35%", "Days sales outstanding -20 days", "Recovery rate +45%"],
    required_domains: ["business", "finance"], shell_spaces_added: [], shell_spaces_modified: ["business"],
    advisors_enabled: ["Collections Advisor"], workflow_families: ["collections-ladder", "payment-reminder", "escalation-sequence"],
    boardroom_views: ["collections-review"], templates: ["Friendly Reminder", "Firm Follow-Up", "Final Notice", "Collections Summary"],
    connectors_supported: ["stripe", "quickbooks", "xero"], connectors_required: [],
    policy_presets: ["collections-escalation"], approval_presets: ["collections-final-notice-approve"],
    permissions_required: ["business.invoices", "workflows.execute"], entitlement_tier: "professional",
    trial_supported: true, trial_days: 14, dependencies: [], version: "2.0.0",
    changelog: ["Added SMS chase option", "Improved escalation timing intelligence", "New recovered-value dashboard"],
    migration_rules: [], proof_models_used: ["invoice-chased", "payment-recovered"], events_emitted: ["pack.collections.escalation-sent"],
    setup_time_minutes: 5, time_to_first_value: "First automated follow-up in < 1 hour",
    screenshots: [], pricing: { monthly: 19, annual: 190, currency: "USD" }, rating: 4.9, installs: 2100,
    category: "workflows", featured: true,
  },
  {
    pack_id: "pack-lead-recovery", name: "Lead Recovery Engine", subtitle: "Revive cold leads automatically", description: "Automated lead reactivation with cooling detection, revival sequences, and conversion tracking.",
    long_description: "Leads go cold every day. This pack detects cooling patterns, launches personalized revival sequences, and tracks conversion from cold to active — turning your neglected pipeline into recovered revenue.",
    pack_class: "workflow", owner_type: "first-party", icon: "Target", gradient: "from-primary to-sita-purple-light",
    target_segments: ["sales-teams", "founders", "agencies"], problems_solved: ["Cold leads ignored", "No revival process", "Pipeline decay"],
    outcomes_improved: ["Lead revival rate +30%", "Pipeline value +25%", "Response time -60%"],
    required_domains: ["business"], shell_spaces_added: [], shell_spaces_modified: ["business"],
    advisors_enabled: ["Sales Advisor", "Growth Advisor"], workflow_families: ["lead-revival", "cooling-detection", "reactivation-sequence"],
    boardroom_views: [], templates: ["Revival Email", "Check-In Sequence"], connectors_supported: ["google-workspace", "mailgun"],
    connectors_required: [], policy_presets: [], approval_presets: [], permissions_required: ["business.leads"],
    entitlement_tier: "starter", trial_supported: true, trial_days: 7, dependencies: [], version: "1.3.0",
    changelog: ["Improved cooling detection accuracy"], migration_rules: [],
    proof_models_used: ["lead-revived", "sequence-sent"], events_emitted: [],
    setup_time_minutes: 3, time_to_first_value: "First revival in < 2 hours",
    screenshots: [], pricing: { monthly: 15, annual: 150, currency: "USD" }, rating: 4.7, installs: 1800,
    category: "workflows",
  },

  // ── Advisor Packs ──
  {
    pack_id: "pack-pricing-advisor", name: "Pricing Advisor Pro", subtitle: "AI-powered pricing intelligence", description: "Dynamic pricing recommendations, margin analysis, competitive positioning, and price sensitivity modeling.",
    long_description: "Stop guessing on pricing. This pack adds a dedicated Pricing Advisor that analyzes your margins, competitive landscape, customer segments, and historical pricing data to recommend optimal pricing strategies for every product and service.",
    pack_class: "advisor", owner_type: "first-party", icon: "Tag", gradient: "from-emerald-500 to-teal-400",
    target_segments: ["service-businesses", "saas", "agencies"], problems_solved: ["Underpricing services", "No margin visibility", "Pricing inconsistency"],
    outcomes_improved: ["Average deal size +15%", "Margin improvement +10%", "Pricing confidence +90%"],
    required_domains: ["business"], shell_spaces_added: [], shell_spaces_modified: ["business"],
    advisors_enabled: ["Pricing Advisor"], workflow_families: ["price-analysis", "margin-review"],
    boardroom_views: ["pricing-review"], templates: ["Pricing Strategy Doc", "Competitive Analysis"],
    connectors_supported: ["stripe"], connectors_required: [], policy_presets: [], approval_presets: [],
    permissions_required: ["business.pricing"], entitlement_tier: "professional",
    trial_supported: true, trial_days: 14, dependencies: [], version: "1.1.0",
    changelog: ["Added competitive positioning view"], migration_rules: [],
    proof_models_used: ["price-recommendation"], events_emitted: [],
    setup_time_minutes: 5, time_to_first_value: "Pricing insights in < 30 minutes",
    screenshots: [], pricing: { monthly: 25, annual: 250, currency: "USD" }, rating: 4.6, installs: 450,
    category: "advisors",
  },

  // ── Finance Packs ──
  {
    pack_id: "pack-revenue-autopilot", name: "Revenue Autopilot", subtitle: "Continuous revenue recovery and optimization", description: "Full revenue autopilot with leakage detection, recovery engine, opportunity ranking, and recovered-value ledger.",
    long_description: "Revenue Autopilot continuously scans your business for revenue leaks — missed callbacks, abandoned quotes, uncollected invoices, subscription waste, capacity gaps — and automatically launches recovery workflows. Track every dollar recovered in a proof-backed ledger.",
    pack_class: "workflow", owner_type: "first-party", icon: "Zap", gradient: "from-trust-safe to-emerald-300",
    target_segments: ["founders", "service-businesses", "agencies"], problems_solved: ["Revenue leakage invisible", "No automatic recovery", "Opportunity prioritization missing"],
    outcomes_improved: ["Revenue recovered +$2,400/mo avg", "Leakage visibility +90%", "Opportunity conversion +25%"],
    required_domains: ["business", "finance"], shell_spaces_added: ["revenue-autopilot"], shell_spaces_modified: ["business", "daily-pulse"],
    advisors_enabled: ["Revenue Autopilot Advisor", "Collections Advisor"], workflow_families: ["leakage-scan", "auto-recovery", "opportunity-rank"],
    boardroom_views: ["revenue-recovery-review"], templates: ["Recovery Report", "Leakage Summary"],
    connectors_supported: ["stripe", "quickbooks", "xero"], connectors_required: [],
    policy_presets: ["revenue-recovery-auto"], approval_presets: ["recovery-action-approve"],
    permissions_required: ["business.full", "finance.read"], entitlement_tier: "professional",
    trial_supported: true, trial_days: 14, dependencies: [], version: "2.0.0",
    changelog: ["Added subscription waste detection", "Improved opportunity scoring"], migration_rules: [],
    proof_models_used: ["revenue-recovered", "leak-detected", "value-ledger"], events_emitted: ["pack.revenue-autopilot.leak-found"],
    setup_time_minutes: 5, time_to_first_value: "First leak detected in < 1 hour",
    screenshots: [], pricing: { monthly: 39, annual: 390, currency: "USD" }, rating: 4.9, installs: 1650,
    category: "founders", featured: true,
  },
  {
    pack_id: "pack-investment-office", name: "Investment Office", subtitle: "Disciplined capital management for families", description: "Premium investment intelligence with regime detection, portfolio risk, thesis vault, and committee boardroom.",
    long_description: "A software family office. Get capital clarity, regime-aware intelligence, disciplined thesis management, portfolio risk analysis, and a formal investment committee boardroom — all designed for capital preservation first, decision quality second, and controlled opportunity capture third.",
    pack_class: "persona", owner_type: "first-party", icon: "LineChart", gradient: "from-sita-purple-dark to-blue-500",
    target_segments: ["high-net-worth", "family-offices", "sophisticated-investors"], problems_solved: ["No capital clarity", "Undisciplined investing", "No regime awareness"],
    outcomes_improved: ["Decision quality +60%", "Risk awareness +80%", "Thesis discipline +90%"],
    required_domains: ["finance"], shell_spaces_added: ["investment-office"], shell_spaces_modified: ["money", "boardroom"],
    advisors_enabled: ["Investment Discipline Advisor", "Capital Allocation Advisor", "Finance Risk Advisor", "FX Regime Advisor"],
    workflow_families: ["regime-monitor", "portfolio-review", "thesis-evaluate", "committee-prep"],
    boardroom_views: ["investment-committee", "capital-map"], templates: ["Thesis Template", "Committee Packet", "Quarterly Review"],
    connectors_supported: ["plaid", "alpaca", "coinbase", "interactive-brokers"], connectors_required: [],
    policy_presets: ["investment-observe-only"], approval_presets: ["investment-committee-dual-approve"],
    permissions_required: ["finance.full", "investment.manage"], entitlement_tier: "premium",
    trial_supported: true, trial_days: 14, dependencies: [], version: "1.5.0",
    changelog: ["Added crypto regime overlay", "Improved stress test scenarios"], migration_rules: [],
    proof_models_used: ["thesis-review", "allocation-decision", "regime-alert"], events_emitted: ["pack.investment-office.regime-shift"],
    setup_time_minutes: 10, time_to_first_value: "Capital clarity in < 15 minutes",
    screenshots: [], pricing: { monthly: 79, annual: 790, currency: "USD" }, rating: 4.8, installs: 280,
    category: "finance", featured: true,
  },
  {
    pack_id: "pack-family-office", name: "Family Office Strategy", subtitle: "Multi-entity wealth planning and governance", description: "Comprehensive family office intelligence with entity management, estate planning workflows, and governance frameworks.",
    long_description: "For families managing wealth across multiple entities. Includes entity-level capital separation, estate planning integration, tax strategy workflows, generational wealth planning, and family governance boardroom reviews.",
    pack_class: "persona", owner_type: "first-party", icon: "Building", gradient: "from-blue-600 to-indigo-500",
    target_segments: ["family-offices", "hnwi-families", "multi-generational"], problems_solved: ["Entity complexity", "No estate visibility", "Tax planning gaps"],
    outcomes_improved: ["Entity clarity +90%", "Tax efficiency +15%", "Governance structure +80%"],
    required_domains: ["finance"], shell_spaces_added: [], shell_spaces_modified: ["money", "boardroom"],
    advisors_enabled: ["Family Office / Wealth Planning Advisor", "Tax / Reserve Advisor"],
    workflow_families: ["estate-review", "entity-reconciliation", "tax-planning"],
    boardroom_views: ["family-office-review"], templates: ["Entity Summary", "Estate Plan Review", "Tax Strategy Doc"],
    connectors_supported: ["plaid", "quickbooks"], connectors_required: [],
    policy_presets: ["family-office-governance"], approval_presets: ["family-dual-approve"],
    permissions_required: ["finance.full"], entitlement_tier: "premium",
    trial_supported: true, trial_days: 14, dependencies: ["pack-investment-office"], version: "1.2.0",
    changelog: ["Added generational transfer workflow"], migration_rules: [],
    proof_models_used: ["entity-review", "tax-decision"], events_emitted: [],
    setup_time_minutes: 15, time_to_first_value: "Entity clarity in < 20 minutes",
    screenshots: [], pricing: { monthly: 99, annual: 990, currency: "USD" }, rating: 4.7, installs: 120,
    category: "finance",
  },

  // ── More workflow/surface/template packs ──
  {
    pack_id: "pack-travel-continuity", name: "Travel Continuity", subtitle: "Seamless trip management with business awareness", description: "Cross-domain travel intelligence that coordinates bookings, calendar conflicts, business impact, and travel-mode activation.",
    long_description: "Travel shouldn't create chaos. This pack coordinates your trips across business, personal, and household calendars, detects conflicts, activates travel mode in the OS, and ensures nothing falls through the cracks while you're away.",
    pack_class: "workflow", owner_type: "first-party", icon: "Plane", gradient: "from-sky-500 to-blue-400",
    target_segments: ["frequent-travelers", "executives", "consultants"], problems_solved: ["Travel-business conflicts", "No pre-trip checklist", "Delegate gaps during travel"],
    outcomes_improved: ["Travel conflicts -70%", "Pre-trip readiness +90%", "Business continuity during travel +60%"],
    required_domains: ["concierge", "business"], shell_spaces_added: [], shell_spaces_modified: ["concierge"],
    advisors_enabled: ["Travel Advisor", "Time Optimization Advisor"], workflow_families: ["trip-planning", "conflict-detection", "travel-mode"],
    boardroom_views: [], templates: ["Trip Checklist", "Delegation Plan"], connectors_supported: ["google-calendar", "tripit"],
    connectors_required: [], policy_presets: [], approval_presets: [], permissions_required: ["concierge.travel"],
    entitlement_tier: "starter", trial_supported: true, trial_days: 7, dependencies: [], version: "1.4.0",
    changelog: ["Added automatic travel mode activation"], migration_rules: [],
    proof_models_used: ["trip-booked", "conflict-resolved"], events_emitted: [],
    setup_time_minutes: 3, time_to_first_value: "Trip organized in < 5 minutes",
    screenshots: [], pricing: { monthly: 9, annual: 90, currency: "USD" }, rating: 4.5, installs: 920,
    category: "workflows",
  },
  {
    pack_id: "pack-household-ops", name: "Household Ops", subtitle: "Home maintenance, vendors, recurring tasks", description: "Structured household operations with maintenance schedules, vendor management, and recurring task automation.",
    long_description: "Your home is your most important investment. This pack brings operational discipline to household management with maintenance schedules, vendor scorecards, recurring task automation, and seasonal planning — ensuring nothing gets neglected.",
    pack_class: "workflow", owner_type: "first-party", icon: "Wrench", gradient: "from-amber-500 to-orange-400",
    target_segments: ["homeowners", "families", "property-managers"], problems_solved: ["Deferred maintenance", "No vendor tracking", "Recurring task failures"],
    outcomes_improved: ["Maintenance adherence +80%", "Vendor satisfaction +40%", "Home value protection"],
    required_domains: ["concierge"], shell_spaces_added: [], shell_spaces_modified: ["concierge"],
    advisors_enabled: ["Household Operations Advisor", "Service Provider Advisor"],
    workflow_families: ["maintenance-schedule", "vendor-review", "seasonal-prep"],
    boardroom_views: ["household-review"], templates: ["Maintenance Checklist", "Vendor Scorecard"],
    connectors_supported: [], connectors_required: [], policy_presets: [], approval_presets: [],
    permissions_required: ["concierge.household"], entitlement_tier: "starter",
    trial_supported: true, trial_days: 7, dependencies: [], version: "1.1.0",
    changelog: ["Added seasonal planning view"], migration_rules: [],
    proof_models_used: ["task-completion"], events_emitted: [],
    setup_time_minutes: 5, time_to_first_value: "Maintenance schedule in < 10 minutes",
    screenshots: [], pricing: { monthly: 8, annual: 80, currency: "USD" }, rating: 4.4, installs: 1500,
    category: "families",
  },
];

// ── Install State (Demo Fallback) ──────────────────────────────

export const DEMO_INSTALL_STATES: InstallState[] = [
  { pack_id: "pack-founder-boardroom", status: "installed", installed_at: Date.now() - 30 * 86400000, version_installed: "2.1.0", setup_completed: true, connectors_linked: ["stripe"], updated_at: Date.now() - 2 * 86400000 },
  { pack_id: "pack-collections", status: "installed", installed_at: Date.now() - 14 * 86400000, version_installed: "1.9.0", setup_completed: true, connectors_linked: ["stripe", "quickbooks"], updated_at: Date.now() - 7 * 86400000 },
  { pack_id: "pack-family-coo", status: "trial-active", trial_started_at: Date.now() - 3 * 86400000, trial_ends_at: Date.now() + 11 * 86400000, version_installed: "1.8.0", setup_completed: true, connectors_linked: ["google-calendar"] },
  { pack_id: "pack-revenue-autopilot", status: "update-available", installed_at: Date.now() - 20 * 86400000, version_installed: "1.8.0", setup_completed: true, connectors_linked: ["stripe"], updated_at: Date.now() - 5 * 86400000 },
];

// ── Helper functions ────────────────────────────────────────────

export function getPacksByCategory(category: StoreCategory): PackManifest[] {
  return PACK_CATALOG.filter(p => p.category === category);
}

export function getFeaturedPacks(): PackManifest[] {
  return PACK_CATALOG.filter(p => p.featured);
}

export function getInstallState(packId: string): InstallState | undefined {
  return DEMO_INSTALL_STATES.find(s => s.pack_id === packId);
}

export function isInstalled(packId: string): boolean {
  const state = getInstallState(packId);
  return state?.status === "installed" || state?.status === "update-available" || state?.status === "trial-active";
}

export function getInstalledPacks(): (PackManifest & { installState: InstallState })[] {
  return DEMO_INSTALL_STATES
    .map(s => {
      const pack = PACK_CATALOG.find(p => p.pack_id === s.pack_id);
      return pack ? { ...pack, installState: s } : null;
    })
    .filter(Boolean) as (PackManifest & { installState: InstallState })[];
}

export function getPacksWithUpdates(): (PackManifest & { installState: InstallState })[] {
  return getInstalledPacks().filter(p => p.installState.status === "update-available" || p.version !== p.installState.version_installed);
}

export function getRecommendedPacks(installedIds: string[]): PackManifest[] {
  return PACK_CATALOG.filter(p => !installedIds.includes(p.pack_id)).slice(0, 4);
}

export const STORE_CATEGORIES: { id: StoreCategory; label: string; icon: string; description: string }[] = [
  { id: "founders", label: "For Founders", icon: "Crown", description: "Operating intelligence for operators and entrepreneurs" },
  { id: "families", label: "For Families", icon: "Home", description: "Household management and family life organization" },
  { id: "service-business", label: "Service Business", icon: "Briefcase", description: "Vertical packs for service-based businesses" },
  { id: "finance", label: "Finance & Family Office", icon: "Building", description: "Capital management, investing, and wealth planning" },
  { id: "workflows", label: "Workflow Packs", icon: "Workflow", description: "Automated processes and operational workflows" },
  { id: "advisors", label: "Advisor Packs", icon: "Brain", description: "Specialized AI advisor capabilities" },
  { id: "templates", label: "Template Packs", icon: "FileText", description: "Documents, reports, and boardroom templates" },
  { id: "connectors", label: "Connector Packs", icon: "Plug", description: "Integrations with external platforms" },
  { id: "surfaces", label: "Surface Packs", icon: "Layout", description: "Custom dashboards and workspace views" },
];
