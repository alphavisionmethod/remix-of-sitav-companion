// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge Domain Manifest
// ═══════════════════════════════════════════════════════════════

import type { DomainManifest } from "../domain-manifest";

export const conciergeManifest: DomainManifest = {
  id: "concierge",
  name: "Concierge OS",
  description: "Life management: errands, travel, household, school, family coordination, and personal logistics",
  owner: "concierge-os-service",
  version: "1.0.0",

  entities: [
    { id: "schedule", name: "Schedule", description: "Personal/family calendar and time blocks", dbTable: "schedules", statusStates: ["active", "paused", "archived"], permissions: { create: "concierge.schedule.create", read: "concierge.schedule.read", update: "concierge.schedule.update", delete: "concierge.schedule.delete" }, searchable: true, fileAttachable: false },
    { id: "errand", name: "Errand", description: "Task to be completed at a location or online", dbTable: "errands", statusStates: ["pending", "in-progress", "completed", "deferred", "cancelled"], permissions: { create: "concierge.errand.create", read: "concierge.errand.read", update: "concierge.errand.update", delete: "concierge.errand.delete" }, searchable: true, fileAttachable: false },
    { id: "trip", name: "Trip", description: "Travel plan with itinerary", dbTable: "trips", statusStates: ["planning", "booked", "in-progress", "completed", "cancelled"], permissions: { create: "concierge.trip.create", read: "concierge.trip.read", update: "concierge.trip.update", delete: "concierge.trip.delete" }, searchable: true, fileAttachable: true },
    { id: "reservation", name: "Reservation", description: "Restaurant, venue, or service booking", dbTable: "reservations", statusStates: ["requested", "confirmed", "cancelled", "completed", "no-show"], permissions: { create: "concierge.reservation.create", read: "concierge.reservation.read", update: "concierge.reservation.update", delete: "concierge.reservation.delete" }, searchable: true, fileAttachable: false },
    { id: "household-task", name: "Household Task", description: "Recurring or one-time home task", dbTable: "household_tasks", statusStates: ["pending", "in-progress", "completed", "overdue", "skipped"], permissions: { create: "concierge.household.create", read: "concierge.household.read", update: "concierge.household.update", delete: "concierge.household.delete" }, searchable: true, fileAttachable: false },
    { id: "grocery-list", name: "Grocery List", description: "Shopping list with preferences", dbTable: "grocery_lists", statusStates: ["draft", "active", "ordered", "delivered", "completed"], permissions: { create: "concierge.grocery.create", read: "concierge.grocery.read", update: "concierge.grocery.update", delete: "concierge.grocery.delete" }, searchable: true, fileAttachable: false },
    { id: "event-plan", name: "Event Plan", description: "Party, gathering, or celebration plan", dbTable: "event_plans", statusStates: ["idea", "planning", "confirmed", "in-progress", "completed", "cancelled"], permissions: { create: "concierge.event.create", read: "concierge.event.read", update: "concierge.event.update", delete: "concierge.event.delete" }, searchable: true, fileAttachable: true },
    { id: "gift-plan", name: "Gift Plan", description: "Gift ideas and purchase tracking", dbTable: "gift_plans", statusStates: ["idea", "selected", "purchased", "wrapped", "given"], permissions: { create: "concierge.gift.create", read: "concierge.gift.read", update: "concierge.gift.update", delete: "concierge.gift.delete" }, searchable: true, fileAttachable: false },
    { id: "school-activity", name: "School Activity", description: "School event, assignment, or activity", dbTable: "school_activities", statusStates: ["upcoming", "in-progress", "completed", "missed"], permissions: { create: "concierge.school.create", read: "concierge.school.read", update: "concierge.school.update", delete: "concierge.school.delete" }, searchable: true, fileAttachable: true },
    { id: "provider", name: "Provider", description: "Service provider contact (plumber, tutor, etc.)", dbTable: "providers", statusStates: ["active", "inactive", "blocked"], permissions: { create: "concierge.provider.create", read: "concierge.provider.read", update: "concierge.provider.update", delete: "concierge.provider.delete" }, searchable: true, fileAttachable: false },
    { id: "family-member", name: "Family Member", description: "Household member with preferences and needs", dbTable: "family_members", statusStates: ["active", "inactive"], permissions: { create: "concierge.family.create", read: "concierge.family.read", update: "concierge.family.update", delete: "concierge.family.delete" }, searchable: true, fileAttachable: false },
    { id: "packing-plan", name: "Packing Plan", description: "Travel packing checklist", dbTable: null, statusStates: ["draft", "in-progress", "packed", "verified"], permissions: { create: "concierge.packing.create", read: "concierge.packing.read", update: "concierge.packing.update", delete: "concierge.packing.delete" }, searchable: false, fileAttachable: false },
    { id: "prep-sequence", name: "Prep Sequence", description: "Multi-step preparation for an event or trip", dbTable: null, statusStates: ["not-started", "in-progress", "completed"], permissions: { create: "concierge.prep.create", read: "concierge.prep.read", update: "concierge.prep.update", delete: "concierge.prep.delete" }, searchable: false, fileAttachable: false },
    { id: "maintenance-item", name: "Maintenance Item", description: "Home/vehicle maintenance tracking", dbTable: "maintenance_items", statusStates: ["upcoming", "due", "overdue", "completed", "skipped"], permissions: { create: "concierge.maintenance.create", read: "concierge.maintenance.read", update: "concierge.maintenance.update", delete: "concierge.maintenance.delete" }, searchable: true, fileAttachable: true },
    { id: "responsibility", name: "Responsibility", description: "Assigned family chore or duty", dbTable: "responsibilities", statusStates: ["assigned", "in-progress", "completed", "reassigned"], permissions: { create: "concierge.responsibility.create", read: "concierge.responsibility.read", update: "concierge.responsibility.update", delete: "concierge.responsibility.delete" }, searchable: true, fileAttachable: false },
  ],

  workflows: [
    {
      id: "trip-planning", name: "Trip Planning", description: "End-to-end travel planning from idea to confirmation",
      trigger: "booking.search-requested", requiresApproval: true, emitsReceipt: true,
      notificationTriggers: ["booking.confirmed", "booking.scored"],
      steps: [
        { id: "search", name: "Search Options", type: "ai-assisted", description: "AI searches for flights, hotels, activities", canFail: true, rollbackCapable: false },
        { id: "score", name: "Score Options", type: "ai-assisted", description: "Rank options by preference and budget", canFail: true, rollbackCapable: false },
        { id: "present", name: "Present to Owner", type: "human", description: "Show top options for selection", canFail: false, rollbackCapable: true },
        { id: "approve", name: "Approve Booking", type: "approval", description: "Owner approves selections", canFail: false, rollbackCapable: true },
        { id: "book", name: "Book", type: "automated", description: "Execute bookings", canFail: true, rollbackCapable: true },
        { id: "confirm", name: "Confirm", type: "verification", description: "Verify all confirmations received", canFail: true, rollbackCapable: false },
        { id: "prep", name: "Generate Prep", type: "ai-assisted", description: "Create packing list and prep sequence", canFail: true, rollbackCapable: false },
      ],
    },
    {
      id: "errand-bundling", name: "Errand Bundling", description: "Group and optimize errand execution",
      trigger: "errand.batch-ready", requiresApproval: false, emitsReceipt: true,
      notificationTriggers: ["errand.completed"],
      steps: [
        { id: "collect", name: "Collect Errands", type: "automated", description: "Gather pending errands", canFail: false, rollbackCapable: false },
        { id: "optimize", name: "Optimize Route", type: "ai-assisted", description: "AI suggests optimal order and grouping", canFail: true, rollbackCapable: false },
        { id: "assign", name: "Assign", type: "human", description: "Assign to family member or self", canFail: false, rollbackCapable: true },
        { id: "track", name: "Track Completion", type: "automated", description: "Monitor errand completion", canFail: false, rollbackCapable: false },
      ],
    },
    {
      id: "event-coordination", name: "Event Coordination", description: "Plan and execute a family or social event",
      trigger: "event.created", requiresApproval: true, emitsReceipt: true,
      notificationTriggers: ["event.confirmed"],
      steps: [
        { id: "plan", name: "Create Plan", type: "ai-assisted", description: "AI helps plan event details", canFail: true, rollbackCapable: true },
        { id: "invite", name: "Send Invitations", type: "automated", description: "Send invites to guests", canFail: true, rollbackCapable: false },
        { id: "coordinate", name: "Coordinate Logistics", type: "human", description: "Handle venue, catering, supplies", canFail: false, rollbackCapable: true },
        { id: "approve", name: "Final Approval", type: "approval", description: "Owner confirms all arrangements", canFail: false, rollbackCapable: true },
        { id: "execute", name: "Event Day", type: "human", description: "Execute event with prep checklist", canFail: false, rollbackCapable: false },
      ],
    },
    {
      id: "household-maintenance", name: "Household Maintenance", description: "Track and schedule recurring home maintenance",
      trigger: "maintenance.due", requiresApproval: false, emitsReceipt: true,
      notificationTriggers: ["maintenance.overdue"],
      steps: [
        { id: "detect", name: "Detect Due Items", type: "automated", description: "Check maintenance schedules", canFail: false, rollbackCapable: false },
        { id: "notify", name: "Notify Owner", type: "automated", description: "Send reminder", canFail: true, rollbackCapable: false },
        { id: "schedule", name: "Schedule Service", type: "human", description: "Book provider or self-schedule", canFail: false, rollbackCapable: true },
        { id: "complete", name: "Mark Complete", type: "human", description: "Confirm maintenance done", canFail: false, rollbackCapable: false },
      ],
    },
    {
      id: "school-prep", name: "School Preparation", description: "Prepare for school events and activities",
      trigger: "school.event-upcoming", requiresApproval: false, emitsReceipt: true,
      notificationTriggers: ["school.event-tomorrow"],
      steps: [
        { id: "identify", name: "Identify Requirements", type: "automated", description: "Parse event requirements", canFail: false, rollbackCapable: false },
        { id: "checklist", name: "Generate Checklist", type: "ai-assisted", description: "Create prep checklist", canFail: true, rollbackCapable: false },
        { id: "assign", name: "Assign Tasks", type: "human", description: "Assign to family members", canFail: false, rollbackCapable: true },
        { id: "track", name: "Track Completion", type: "automated", description: "Monitor prep progress", canFail: false, rollbackCapable: false },
      ],
    },
    {
      id: "provider-booking", name: "Provider Booking", description: "Find and book a service provider",
      trigger: "provider.booking-requested", requiresApproval: true, emitsReceipt: true,
      notificationTriggers: ["provider.booked"],
      steps: [
        { id: "search", name: "Search Providers", type: "ai-assisted", description: "Find matching providers", canFail: true, rollbackCapable: false },
        { id: "compare", name: "Compare Options", type: "ai-assisted", description: "Rank by reviews, price, availability", canFail: true, rollbackCapable: false },
        { id: "select", name: "Select Provider", type: "human", description: "Owner selects provider", canFail: false, rollbackCapable: true },
        { id: "book", name: "Book Service", type: "automated", description: "Schedule service appointment", canFail: true, rollbackCapable: true },
      ],
    },
    {
      id: "gift-coordination", name: "Gift Coordination", description: "Plan and track gift giving",
      trigger: "gift.occasion-approaching", requiresApproval: false, emitsReceipt: true,
      notificationTriggers: ["gift.occasion-soon"],
      steps: [
        { id: "suggest", name: "Suggest Gifts", type: "ai-assisted", description: "AI suggests based on recipient preferences", canFail: true, rollbackCapable: false },
        { id: "select", name: "Select Gift", type: "human", description: "Owner chooses gift", canFail: false, rollbackCapable: true },
        { id: "purchase", name: "Purchase", type: "human", description: "Buy or order gift", canFail: false, rollbackCapable: false },
        { id: "track", name: "Track Delivery", type: "automated", description: "Monitor shipping/delivery", canFail: true, rollbackCapable: false },
      ],
    },
  ],

  shellIntegration: {
    launcher: {
      appId: "concierge-os", displayName: "Concierge", icon: "Home", category: "Core",
      badgeSource: "concierge.errands.overdue-count", description: "Errands, travel, household, family & life management",
      keywords: ["home", "errand", "travel", "family", "school", "grocery", "maintenance"],
    },
    commandPalette: [
      { id: "con-new-errand", label: "New Errand", keywords: ["errand", "task", "todo"], action: "/concierge/errands/new", icon: "ListTodo" },
      { id: "con-plan-trip", label: "Plan a Trip", keywords: ["trip", "travel", "vacation", "flight"], action: "/concierge/trips/new", icon: "Plane" },
      { id: "con-grocery", label: "Grocery List", keywords: ["grocery", "shopping", "food"], action: "/concierge/grocery", icon: "ShoppingCart" },
      { id: "con-maintenance", label: "Home Maintenance", keywords: ["maintenance", "repair", "home"], action: "/concierge/maintenance", icon: "Wrench" },
      { id: "con-schedule", label: "Family Schedule", keywords: ["schedule", "calendar", "family"], action: "/concierge/schedule", icon: "Calendar" },
    ],
    searchProviders: [
      { id: "search-errands", name: "Errands", entityType: "errand", searchFields: ["title", "description", "location"], resultRoute: "/concierge/errands/:id", icon: "ListTodo" },
      { id: "search-trips", name: "Trips", entityType: "trip", searchFields: ["destination", "name"], resultRoute: "/concierge/trips/:id", icon: "Plane" },
      { id: "search-providers", name: "Providers", entityType: "provider", searchFields: ["name", "service", "phone"], resultRoute: "/concierge/providers/:id", icon: "Users" },
    ],
    notificationTriggers: [
      { eventSubject: "errand.overdue", title: "Errand overdue", priority: "medium", actionRoute: "/concierge/errands/:id", groupKey: "concierge-errands" },
      { eventSubject: "maintenance.overdue", title: "Maintenance overdue", priority: "high", actionRoute: "/concierge/maintenance/:id", groupKey: "concierge-maintenance" },
      { eventSubject: "school.event-tomorrow", title: "School event tomorrow", priority: "high", actionRoute: "/concierge/school/:id", groupKey: "concierge-school" },
      { eventSubject: "booking.confirmed", title: "Booking confirmed", priority: "low", actionRoute: "/concierge/trips/:id", groupKey: "concierge-travel" },
    ],
  },

  crossDomainEvents: [
    { id: "con-fin-travel", sourceEvent: "travel.booked", sourceDomain: "concierge", targetDomain: "finance", targetAction: "projection.update", description: "Update finance projections when travel is booked", direction: "emit" },
    { id: "con-biz-calendar", sourceEvent: "travel.booked", sourceDomain: "concierge", targetDomain: "business", targetAction: "calendar.block", description: "Block business calendar during travel", direction: "emit" },
    { id: "con-fin-grocery", sourceEvent: "grocery.ordered", sourceDomain: "concierge", targetDomain: "finance", targetAction: "transaction.categorize", description: "Auto-categorize grocery transaction", direction: "emit" },
  ],

  truthModel: {
    freshnessThresholds: { schedule: 1800, errand: 14400, trip: 86400, reservation: 3600, household: 14400, grocery: 14400, maintenance: 86400 },
    simulatedSurfaces: ["trip-search", "provider-search", "gift-suggestions"],
    dataSourceClassification: { schedule: "synced", errand: "manual", trip: "manual", reservation: "manual", household: "manual", grocery: "manual", maintenance: "manual", provider: "manual" },
    deterministic: [],
  },

  aiIntegration: {
    advisorIds: ["concierge-advisor", "household-advisor"],
    capabilityKeys: ["trip-planning", "errand-optimization", "gift-suggestion", "meal-planning", "maintenance-scheduling"],
    allowedModels: ["google/gemini-2.5-flash", "openai/gpt-5-mini"],
    budgetClass: "economy",
  },

  fileIntegration: {
    acceptedTypes: ["application/pdf", "image/*"],
    storageBucket: "concierge-files",
    maxFileSizeMB: 10,
    autoClassify: false,
  },

  boardroomEscalation: {
    manualEscalationEnabled: true,
    autoEscalateRules: [
      { id: "high-cost-trip", condition: "trip.estimated_cost > 5000", description: "Travel plans exceeding $5k", severity: "warning", minConfidence: 0.7 },
    ],
  },
};
