// ═══════════════════════════════════════════════════════════════
// SITA OS — Onboarding Branching Logic
// Business-type, revenue-engine, bottleneck, and automation branching
// ═══════════════════════════════════════════════════════════════

import type { OnboardingState } from "./types";

export interface BranchQuestion {
  id: string;
  question: string;
  options: { id: string; label: string }[];
  multiSelect?: boolean;
}

// 3.2 Business-type branching
export function getBusinessTypeBranch(state: OnboardingState): BranchQuestion[] {
  const qs: BranchQuestion[] = [];
  const types = state.businessTypes;

  if (types.includes("service")) {
    qs.push({
      id: "service_focus", question: "What matters most in your service business?",
      options: [
        { id: "booking_flow", label: "Booking and scheduling" },
        { id: "proposal_flow", label: "Proposals and quotes" },
        { id: "delivery_milestones", label: "Delivery milestones" },
        { id: "review_collection", label: "Review collection" },
        { id: "renewals", label: "Repeat service / renewals" },
      ], multiSelect: true,
    });
  }

  if (types.includes("agency")) {
    qs.push({
      id: "agency_focus", question: "What's most important for your agency?",
      options: [
        { id: "client_management", label: "Multi-client management" },
        { id: "retainer_tracking", label: "Retainer vs project tracking" },
        { id: "client_reporting", label: "Client reporting" },
        { id: "team_delegation", label: "Team delegation" },
        { id: "reputation_mgmt", label: "Reputation management" },
        { id: "white_label", label: "White-label needs" },
      ], multiSelect: true,
    });
  }

  if (types.includes("coaching")) {
    qs.push({
      id: "coaching_focus", question: "What matters most in your coaching practice?",
      options: [
        { id: "booking_nurture", label: "Booking and nurture" },
        { id: "packages", label: "Packages and programs" },
        { id: "follow_up", label: "Follow-up sequences" },
        { id: "client_onboarding", label: "Client onboarding" },
        { id: "course_addon", label: "Course or membership add-ons" },
        { id: "testimonials", label: "Testimonials and reviews" },
      ], multiSelect: true,
    });
  }

  if (types.includes("creator")) {
    qs.push({
      id: "creator_focus", question: "What's driving your creator business?",
      options: [
        { id: "products", label: "Digital products" },
        { id: "memberships", label: "Memberships" },
        { id: "launches", label: "Launches and campaigns" },
        { id: "email_nurture", label: "Email nurture" },
        { id: "course_engagement", label: "Course engagement" },
        { id: "upsells", label: "Upsells and cross-sells" },
      ], multiSelect: true,
    });
  }

  if (types.includes("ecommerce")) {
    qs.push({
      id: "ecommerce_focus", question: "What's most important for your store?",
      options: [
        { id: "checkout_flow", label: "Checkout optimization" },
        { id: "abandoned_cart", label: "Abandoned cart recovery" },
        { id: "repeat_purchase", label: "Repeat purchase" },
        { id: "reviews", label: "Product reviews" },
        { id: "fulfillment", label: "Fulfillment tracking" },
        { id: "ltv", label: "Customer LTV" },
      ], multiSelect: true,
    });
  }

  if (types.includes("local")) {
    qs.push({
      id: "local_focus", question: "What matters most for your local business?",
      options: [
        { id: "bookings_walkins", label: "Bookings vs walk-ins" },
        { id: "local_discovery", label: "Local discovery" },
        { id: "repeat_visits", label: "Repeat visit patterns" },
        { id: "review_dependence", label: "Review dependence" },
        { id: "staff_handoff", label: "Staff handoff" },
        { id: "local_promotions", label: "Local promotions" },
      ], multiSelect: true,
    });
  }

  return qs;
}

// 3.3 Revenue engine branching
export function getRevenueEngineBranch(state: OnboardingState): BranchQuestion[] {
  const qs: BranchQuestion[] = [];
  const sources = state.revenueSources;

  if (sources.includes("appointments")) {
    qs.push({
      id: "booking_depth", question: "Tell us more about your booking model",
      options: [
        { id: "booking_pct_high", label: "Most revenue starts with a booking" },
        { id: "no_shows_hurt", label: "No-shows hurt revenue materially" },
        { id: "reminder_weak", label: "Reminders and follow-up are weak" },
        { id: "pre_call_prep", label: "Pre-call prep could be better" },
      ], multiSelect: true,
    });
  }

  if (sources.includes("proposals")) {
    qs.push({
      id: "quote_depth", question: "Tell us more about your quoting process",
      options: [
        { id: "quotes_standardized", label: "Quotes are mostly standardized" },
        { id: "quotes_custom", label: "Quotes are highly customized" },
        { id: "quote_slow", label: "Quote creation is slow" },
        { id: "quote_acceptance_low", label: "Quote acceptance rate is low" },
        { id: "discount_approval", label: "Discounts require approval" },
      ], multiSelect: true,
    });
  }

  if (sources.includes("ecommerce")) {
    qs.push({
      id: "checkout_depth", question: "Tell us about your checkout experience",
      options: [
        { id: "abandoned_major", label: "Abandoned checkout is a major issue" },
        { id: "conversion_focus", label: "Conversion rate needs improvement" },
        { id: "post_purchase", label: "Post-purchase actions matter most" },
      ], multiSelect: true,
    });
  }

  if (sources.includes("retainers")) {
    qs.push({
      id: "retainer_depth", question: "How do retainers work in your business?",
      options: [
        { id: "renewal_manual", label: "Renewals are handled manually" },
        { id: "churn_issue", label: "Churn is an issue" },
        { id: "health_tracking", label: "Client health indicators matter" },
      ], multiSelect: true,
    });
  }

  if (sources.includes("memberships")) {
    qs.push({
      id: "membership_depth", question: "How does your membership model work?",
      options: [
        { id: "join_funnel", label: "Members join through a funnel" },
        { id: "dropoff_predict", label: "We need to predict drop-off" },
        { id: "upgrade_path", label: "Upgrades and renewals drive growth" },
      ], multiSelect: true,
    });
  }

  return qs;
}

// 3.4 Growth bottleneck branching
export function getBottleneckBranch(state: OnboardingState): BranchQuestion[] {
  const qs: BranchQuestion[] = [];
  const bn = state.growthBottlenecks;

  if (bn.includes("lead_followup")) {
    qs.push({
      id: "followup_detail", question: "What's happening with follow-up?",
      options: [
        { id: "leads_forgotten", label: "Leads are forgotten" },
        { id: "leads_delayed", label: "Follow-up is too slow" },
        { id: "leads_inconsistent", label: "Follow-up is inconsistent" },
        { id: "want_auto_followup", label: "I need auto-follow-up" },
      ], multiSelect: true,
    });
  }

  if (bn.includes("no_shows")) {
    qs.push({
      id: "noshow_detail", question: "What's happening with no-shows?",
      options: [
        { id: "no_reminders", label: "No reminders exist" },
        { id: "weak_prep", label: "Pre-call prep is weak" },
        { id: "want_rescue", label: "SITA should automate rescue after missed appointments" },
      ], multiSelect: true,
    });
  }

  if (bn.includes("conversion")) {
    qs.push({
      id: "conversion_detail", question: "What's hurting conversion?",
      options: [
        { id: "pricing_unclear", label: "Pricing is unclear" },
        { id: "proposals_slow", label: "Proposals are slow" },
        { id: "followup_weak", label: "Follow-up after quote is weak" },
        { id: "want_quote_auto", label: "Quote automation would help" },
      ], multiSelect: true,
    });
  }

  if (bn.includes("retention_gap")) {
    qs.push({
      id: "retention_detail", question: "What's happening with retention?",
      options: [
        { id: "quiet_disengage", label: "Clients disengage quietly" },
        { id: "no_checkins", label: "No regular check-ins exist" },
        { id: "renewals_slip", label: "Renewals slip through" },
        { id: "want_health_monitor", label: "SITA should monitor client health" },
      ], multiSelect: true,
    });
  }

  if (bn.includes("review_gap")) {
    qs.push({
      id: "review_detail", question: "What's happening with reviews?",
      options: [
        { id: "not_asked", label: "Satisfied customers aren't being asked" },
        { id: "negative_unresolved", label: "Negative experiences go unresolved" },
        { id: "timing_bad", label: "Review timing is inconsistent" },
      ], multiSelect: true,
    });
  }

  return qs;
}

// Compute inferred business signals from state
export function inferBusinessSignals(state: OnboardingState): { type: string; title: string; confidence: number }[] {
  const signals: { type: string; title: string; confidence: number }[] = [];

  if (state.revenueSources.includes("appointments") && state.whatCloses.includes("call")) {
    signals.push({ type: "booking_heavy_business", title: "Business relies heavily on booked consultations", confidence: 92 });
  }
  if (state.revenueSources.includes("proposals")) {
    signals.push({ type: "quote_driven_service_model", title: "Proposal-driven service flow detected", confidence: 88 });
  }
  if (state.revenueSources.includes("retainers")) {
    signals.push({ type: "likely_retainer_business", title: "Recurring retainer model present", confidence: 85 });
  }
  if (state.businessTypes.includes("creator") && state.revenueSources.includes("memberships")) {
    signals.push({ type: "likely_creator_membership_model", title: "Creator + membership hybrid detected", confidence: 80 });
  }
  if (state.uploadedArtifacts.includes("onboarding_docs") || state.uploadedArtifacts.includes("intake_forms")) {
    signals.push({ type: "onboarding_document_heavy", title: "Onboarding appears document-heavy", confidence: 78 });
  }
  if (state.uploadedArtifacts.includes("proposal_templates")) {
    signals.push({ type: "proposal_workflow", title: "Proposal-driven workflow detected", confidence: 82 });
  }
  if (state.uploadedArtifacts.includes("call_scripts")) {
    signals.push({ type: "call_dependent_sales", title: "Call-dependent sales motion", confidence: 80 });
  }
  if (state.uploadedArtifacts.includes("email_sequences")) {
    signals.push({ type: "nurture_funnel", title: "Nurture funnel infrastructure present", confidence: 79 });
  }
  if (state.uploadedArtifacts.includes("price_sheets") || state.uploadedArtifacts.includes("offer_decks")) {
    signals.push({ type: "structured_pricing", title: "Structured pricing model detected", confidence: 81 });
  }
  if (state.uploadedArtifacts.includes("sops")) {
    signals.push({ type: "process_maturity", title: "Process maturity signal — SOP-driven operations", confidence: 77 });
  }
  if (state.pastedUrls.length >= 2) {
    signals.push({ type: "multi_channel_presence", title: `Multi-channel presence: ${state.pastedUrls.length} touchpoints`, confidence: 74 });
  }
  if (state.postSaleSlips.includes("reviews") || state.businessTypes.includes("local")) {
    signals.push({ type: "review_opportunity_high", title: "High review collection opportunity", confidence: 82 });
  }
  if (state.postSaleSlips.includes("retention") || state.growthBottlenecks.includes("retention_gap")) {
    signals.push({ type: "retention_gap_detected", title: "Retention gap likely costing revenue", confidence: 86 });
  }
  if (state.leadSources.includes("referrals") && state.bestSource === "referrals") {
    signals.push({ type: "referral_engine_strong", title: "Strong referral engine detected", confidence: 90 });
  }
  if (state.revenueSources.includes("ecommerce") && state.whatCloses.includes("checkout")) {
    signals.push({ type: "checkout_driven_model", title: "Checkout-driven conversion model", confidence: 87 });
  }
  if (state.businessTypes.includes("local") && state.leadSources.includes("local")) {
    signals.push({ type: "local_discovery_dependent", title: "Local discovery is critical", confidence: 84 });
  }
  if (state.businessTypes.length > 1) {
    signals.push({ type: "hybrid_revenue_model", title: `Hybrid model: ${state.businessTypes.length} types`, confidence: 75 });
  }

  return signals;
}

// Generate recommended advisors based on state
export interface RecommendedAdvisor {
  id: string;
  name: string;
  domain: string;
  reason: string;
  intensity: "low" | "medium" | "high";
  recommended: boolean;
}

export function getRecommendedAdvisors(state: OnboardingState): RecommendedAdvisor[] {
  return [
    {
      id: "chief_revenue", name: "Chief Revenue Strategist", domain: "strategy",
      reason: "Always active — strategic oversight of your revenue engine",
      intensity: "high", recommended: true,
    },
    {
      id: "funnel", name: "Funnel Advisor", domain: "conversion",
      reason: state.journeyTemplate ? "Journey mapped — funnel optimization ready" : "Helps optimize conversion paths",
      intensity: state.journeyPainPoints.length > 2 ? "high" : "medium",
      recommended: !!state.journeyTemplate,
    },
    {
      id: "crm", name: "CRM & Relationship Advisor", domain: "relationships",
      reason: "Manages customer health, segments, and lifecycle",
      intensity: state.leadSources.length > 2 ? "high" : "medium",
      recommended: state.leadSources.length > 0,
    },
    {
      id: "campaign", name: "Campaign Advisor", domain: "marketing",
      reason: state.growthBottlenecks.includes("campaigns") ? "Campaigns flagged as inconsistent" : "Manages campaign strategy and execution",
      intensity: state.growthBottlenecks.includes("campaigns") ? "high" : "low",
      recommended: state.growthBottlenecks.includes("campaigns") || state.leadSources.includes("social") || state.leadSources.includes("ads"),
    },
    {
      id: "offer", name: "Offer Advisor", domain: "offers",
      reason: "Optimizes pricing, packaging, and offer positioning",
      intensity: state.revenueSources.includes("proposals") ? "high" : "medium",
      recommended: state.revenueSources.includes("proposals") || state.uploadedArtifacts.includes("price_sheets"),
    },
    {
      id: "booking", name: "Booking & Conversion Advisor", domain: "booking",
      reason: state.growthBottlenecks.includes("no_shows") ? "No-show problem detected — priority activation" : "Optimizes booking flow and show rates",
      intensity: state.growthBottlenecks.includes("no_shows") ? "high" : "medium",
      recommended: state.revenueSources.includes("appointments") || state.whatCloses.includes("call"),
    },
    {
      id: "retention", name: "Retention Advisor", domain: "retention",
      reason: state.postSaleSlips.includes("retention") ? "Retention gap flagged" : "Monitors churn risk and renewal health",
      intensity: state.postSaleSlips.includes("retention") ? "high" : "medium",
      recommended: state.postSaleSlips.length > 0,
    },
    {
      id: "reputation", name: "Reputation Advisor", domain: "reputation",
      reason: state.postSaleSlips.includes("reviews") ? "Review gap detected" : "Manages review collection and response",
      intensity: state.postSaleSlips.includes("reviews") ? "high" : "low",
      recommended: state.postSaleSlips.includes("reviews") || state.businessTypes.includes("local"),
    },
    {
      id: "ops", name: "Revenue Ops Advisor", domain: "operations",
      reason: "Orchestrates cross-functional revenue operations",
      intensity: state.needsApprovals ? "high" : "medium",
      recommended: state.teamSize !== "solo" || state.needsApprovals,
    },
  ];
}
