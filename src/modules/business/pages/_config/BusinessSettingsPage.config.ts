// ═══════════════════════════════════════════════════════════════
// SITA OS — BusinessSettingsPage option-list configuration
// Pure UI option lists — not data fixtures.
// ═══════════════════════════════════════════════════════════════
import {
  Briefcase, Users, GraduationCap, PenTool, ShoppingCart, MapPin,
  Heart, Layers, Sparkles, RefreshCw, FileText, Globe, TrendingUp,
  MessageSquare, Phone, Settings, Truck, Target, AlertTriangle,
  DollarSign, Check, Zap,
} from "lucide-react";
import type React from "react";

export interface OptionWithIcon {
  id: string;
  label: string;
  desc?: string;
  icon?: React.ElementType;
}

export const BUSINESS_TYPES: OptionWithIcon[] = [
  { id: "service", label: "Service Business", desc: "Appointments, proposals, delivery milestones, reviews", icon: Briefcase },
  { id: "agency", label: "Agency", desc: "Multi-client, retainers, reporting, white-label", icon: Users },
  { id: "coaching", label: "Coach / Consultant", desc: "Personal brand, bookings, packages, memberships", icon: GraduationCap },
  { id: "creator", label: "Creator / Education", desc: "Products, courses, memberships, launches, content funnels", icon: PenTool },
  { id: "ecommerce", label: "Online Store", desc: "Products, carts, checkout, fulfillment, repeat purchase", icon: ShoppingCart },
  { id: "local", label: "Local / Brick & Mortar", desc: "Visits, bookings, reputation, local campaigns, scheduling", icon: MapPin },
  { id: "membership", label: "Membership Business", desc: "Subscriptions, access tiers, renewal, retention", icon: Heart },
  { id: "hybrid", label: "Hybrid / Mixed Model", desc: "Multiple revenue streams, mixed delivery", icon: Layers },
  { id: "evolving", label: "Still Evolving", desc: "Exploring models, testing ideas, early stage", icon: Sparkles },
];

export const REVENUE_SOURCES: OptionWithIcon[] = [
  { id: "products", label: "Product Sales", icon: ShoppingCart },
  { id: "services", label: "Service Fees", icon: Briefcase },
  { id: "subscriptions", label: "Subscriptions / Recurring", icon: RefreshCw },
  { id: "retainers", label: "Retainers", icon: FileText },
  { id: "proposals", label: "Proposals / Projects", icon: FileText },
  { id: "advertising", label: "Advertising", icon: Globe },
  { id: "commissions", label: "Commissions / Referrals", icon: Users },
  { id: "courses", label: "Courses / Digital", icon: GraduationCap },
];

export const LEAD_SOURCES: OptionWithIcon[] = [
  { id: "referrals", label: "Referrals / Word of mouth", icon: Users },
  { id: "organic", label: "Organic search (SEO)", icon: Globe },
  { id: "paid_ads", label: "Paid ads (Google, Meta)", icon: TrendingUp },
  { id: "social", label: "Social media", icon: MessageSquare },
  { id: "cold_outreach", label: "Cold outreach", icon: Phone },
  { id: "partnerships", label: "Partnerships", icon: Briefcase },
  { id: "events", label: "Events / Networking", icon: Users },
  { id: "content", label: "Content marketing", icon: FileText },
];

export const CONVERSION_CLOSERS: OptionWithIcon[] = [
  { id: "demo_call", label: "Demo / discovery call", icon: Phone },
  { id: "proposal", label: "Detailed proposal", icon: FileText },
  { id: "free_trial", label: "Free trial / sample", icon: ShoppingCart },
  { id: "case_study", label: "Case studies / proof", icon: TrendingUp },
  { id: "pricing_page", label: "Clear pricing page", icon: DollarSign },
  { id: "testimonials", label: "Testimonials / reviews", icon: MessageSquare },
  { id: "urgency", label: "Urgency / limited offer", icon: AlertTriangle },
  { id: "guarantee", label: "Money-back guarantee", icon: Check },
];

export const POST_SALE_STEPS: OptionWithIcon[] = [
  { id: "onboarding_email", label: "Onboarding email sequence", icon: MessageSquare },
  { id: "kickoff_call", label: "Kickoff call", icon: Phone },
  { id: "setup_wizard", label: "Setup wizard / guide", icon: Settings },
  { id: "fulfillment", label: "Fulfillment & delivery", icon: Truck },
  { id: "check_in", label: "Check-in follow-up", icon: RefreshCw },
  { id: "review_request", label: "Review / feedback request", icon: Heart },
  { id: "upsell", label: "Upsell / cross-sell", icon: TrendingUp },
  { id: "renewal", label: "Renewal reminder", icon: RefreshCw },
];

export const GROWTH_GOALS: OptionWithIcon[] = [
  { id: "more_clients", label: "Get more clients", icon: Users },
  { id: "increase_revenue", label: "Increase revenue per client", icon: DollarSign },
  { id: "retain_clients", label: "Retain existing clients", icon: Heart },
  { id: "automate", label: "Automate operations", icon: Zap },
  { id: "expand_channels", label: "Expand to new channels", icon: Globe },
  { id: "improve_conversion", label: "Improve conversion rate", icon: Target },
  { id: "reduce_churn", label: "Reduce churn", icon: RefreshCw },
  { id: "scale_team", label: "Scale the team", icon: Users },
];

export const TEAM_SIZES = [
  { id: "solo", label: "Solo / founder" },
  { id: "small", label: "Small team (2-10)" },
  { id: "growing", label: "Growing team (10+)" },
  { id: "multi", label: "Multi-location / agency" },
];

export const STAGES = [
  { id: "starting", label: "Just starting" },
  { id: "growing", label: "Growing" },
  { id: "established", label: "Established" },
  { id: "scaling", label: "Scaling / optimizing" },
];

export const AUTOMATION_LEVELS = [
  { id: "manual", label: "Manual — I approve everything" },
  { id: "draft_review", label: "Draft & Review — AI drafts, I approve" },
  { id: "auto_low", label: "Auto Low-Risk — Auto for small tasks" },
  { id: "full_auto", label: "Full Auto — Trust the system" },
];

export const JOURNEY_TEMPLATES = [
  { id: "service", label: "Service — Inquiry → Consult → Propose → Close → Deliver" },
  { id: "coaching", label: "Coaching — Nurture → Book → Enroll → Deliver → Renew" },
  { id: "ecommerce", label: "E-commerce — Traffic → Cart → Checkout → Fulfill → Repeat" },
  { id: "local", label: "Local — Discovery → Visit → Service → Review → Repeat" },
  { id: "agency", label: "Agency — Referral → Proposal → Retainer → Deliver → Renew" },
  { id: "creator", label: "Creator — Content → Lead → Launch → Enroll → Upsell" },
  { id: "membership", label: "Membership — Trial → Enroll → Engage → Retain → Upsell" },
  { id: "custom", label: "Custom Journey" },
];