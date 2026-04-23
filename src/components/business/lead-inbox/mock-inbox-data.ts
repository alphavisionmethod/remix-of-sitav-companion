import type { LeadSource } from "./LeadSourceBadge";
import type { ScoreableLead } from "@/domains/engines/lead-scoring-engine";

export interface InboxItem extends ScoreableLead {
  user_id: string;
  routed_to: string | null;
  accepted_at: string | null;
  business_profile_mode: string | null;
  duplicate_match_id: string | null;
}

const ago = (h: number) => new Date(Date.now() - h * 3600000).toISOString();

export const FALLBACK_INBOX_ITEMS: InboxItem[] = [
  {
    id: "li-1", user_id: "", contact_name: "Sarah Chen", contact_email: "sarah@techflow.io", contact_phone: "+1-415-555-1234", company: "TechFlow Inc",
    source: "website", inquiry_text: "We're looking for a complete platform migration. Budget approved for Q2. Need proposal by Friday.",
    urgency: "high", quality_score: 92, quality_hints: ["High-intent language", "Budget confirmed", "Deadline mentioned"],
    completeness_score: 95, missing_fields: [], duplicate_status: "none", duplicate_match_id: null,
    suggested_owner: "Maya", suggested_route: "quote", advisor_suggestion: "Exceptional lead — high intent with confirmed budget. Route to proposal workflow immediately.",
    triage_status: "new", routed_to: null, accepted_at: null, business_profile_mode: null, created_at: ago(0.5), updated_at: ago(0.5),
    response_time_minutes: 8, last_activity_at: ago(0.3), engagement_events: 3, appointment_booked: false,
    quote_requested: true, prior_customer: false, owner_assigned: "Maya", owner_last_action_at: ago(0.4),
    estimated_value: 45000, communication_count: 2, replied_to_outreach: true, engagement_quality: "high",
  },
  {
    id: "li-2", user_id: "", contact_name: "James Rodriguez", contact_email: "james.r@greenleaf.com", contact_phone: null, company: "GreenLeaf Solutions",
    source: "referral", inquiry_text: "Referred by David Kim. Interested in consulting engagement for supply chain optimization.",
    urgency: "medium", quality_score: 85, quality_hints: ["Referral source — strong signal", "Clear need identified"],
    completeness_score: 80, missing_fields: ["phone"], duplicate_status: "none", duplicate_match_id: null,
    suggested_owner: "Alex", suggested_route: "consult", advisor_suggestion: "Strong referral lead. Schedule consultation call within 24 hours.",
    triage_status: "new", routed_to: null, accepted_at: null, business_profile_mode: null, created_at: ago(1.5), updated_at: ago(1.5),
    response_time_minutes: null, last_activity_at: ago(1.5), engagement_events: 1, appointment_booked: true,
    quote_requested: false, prior_customer: false, owner_assigned: "Alex", owner_last_action_at: ago(3),
    estimated_value: 25000, communication_count: 1, replied_to_outreach: false, engagement_quality: "medium",
  },
  {
    id: "li-3", user_id: "", contact_name: "Emily Watson", contact_email: "emily.w@stellardesign.co", contact_phone: "+1-323-555-9876", company: "Stellar Design Co",
    source: "website", inquiry_text: "Need urgently someone to help with our annual report design. Deadline in 5 days.",
    urgency: "critical", quality_score: 78, quality_hints: ["Urgency signals detected", "Clear deliverable"],
    completeness_score: 90, missing_fields: [], duplicate_status: "none", duplicate_match_id: null,
    suggested_owner: "Maya", suggested_route: "quote", advisor_suggestion: "Urgent project request. Respond within 2 hours to capture this opportunity.",
    triage_status: "new", routed_to: null, accepted_at: null, business_profile_mode: null, created_at: ago(2), updated_at: ago(2),
    response_time_minutes: null, last_activity_at: ago(1.8), engagement_events: 1, appointment_booked: false,
    quote_requested: true, prior_customer: false, owner_assigned: null, owner_last_action_at: null,
    estimated_value: 8000, communication_count: 1, replied_to_outreach: false, engagement_quality: "high",
  },
  {
    id: "li-4", user_id: "", contact_name: "Michael Park", contact_email: "m.park@novatech.io", contact_phone: null, company: "NovaTech",
    source: "campaign", inquiry_text: "Downloaded enterprise whitepaper. Requested demo.",
    urgency: "medium", quality_score: 65, quality_hints: ["Content engagement", "Demo request"],
    completeness_score: 70, missing_fields: ["phone", "title"], duplicate_status: "possible", duplicate_match_id: "li-existing-1",
    suggested_owner: null, suggested_route: "lead", advisor_suggestion: "Possible duplicate — matches existing CRM contact at NovaTech. Review before accepting.",
    triage_status: "new", routed_to: null, accepted_at: null, business_profile_mode: null, created_at: ago(3), updated_at: ago(3),
    response_time_minutes: null, last_activity_at: ago(3), engagement_events: 2, appointment_booked: false,
    quote_requested: false, prior_customer: false, owner_assigned: null, owner_last_action_at: null,
    estimated_value: 15000, communication_count: 0, replied_to_outreach: false, engagement_quality: "medium",
  },
  {
    id: "li-5", user_id: "", contact_name: "Lisa Chang", contact_email: "l.chang@gmail.com", contact_phone: "+1-650-555-4321", company: null,
    source: "social", inquiry_text: "Saw your LinkedIn post about AI automation. Would love to learn more about pricing.",
    urgency: "low", quality_score: 55, quality_hints: ["Social engagement", "Pricing inquiry"],
    completeness_score: 60, missing_fields: ["company", "title"], duplicate_status: "none", duplicate_match_id: null,
    suggested_owner: null, suggested_route: "lead", advisor_suggestion: "Moderate quality. Needs more qualification before investment.",
    triage_status: "new", routed_to: null, accepted_at: null, business_profile_mode: null, created_at: ago(4), updated_at: ago(4),
    response_time_minutes: null, last_activity_at: ago(4), engagement_events: 1, appointment_booked: false,
    quote_requested: false, prior_customer: false, owner_assigned: null, owner_last_action_at: null,
    estimated_value: 2000, communication_count: 0, replied_to_outreach: false, engagement_quality: "low",
  },
  {
    id: "li-6", user_id: "", contact_name: "Robert Wilson", contact_email: "r.wilson@megacorp.com", contact_phone: "+1-212-555-8765", company: "MegaCorp Industries",
    source: "partner", inquiry_text: "Enterprise partnership inquiry — evaluating vendors for 3-year digital transformation contract. $2M+ budget.",
    urgency: "critical", quality_score: 98, quality_hints: ["Enterprise account", "Multi-year contract", "Large budget confirmed", "Strategic partnership"],
    completeness_score: 100, missing_fields: [], duplicate_status: "none", duplicate_match_id: null,
    suggested_owner: "Founder", suggested_route: "boardroom", advisor_suggestion: "Exceptional strategic opportunity — $2M+ enterprise contract. Route to Boardroom for senior review immediately.",
    triage_status: "new", routed_to: null, accepted_at: null, business_profile_mode: null, created_at: ago(1), updated_at: ago(1),
    response_time_minutes: 3, last_activity_at: ago(0.5), engagement_events: 4, appointment_booked: true,
    quote_requested: true, prior_customer: false, owner_assigned: "Founder", owner_last_action_at: ago(0.8),
    estimated_value: 2000000, communication_count: 3, replied_to_outreach: true, engagement_quality: "high",
  },
  {
    id: "li-7", user_id: "", contact_name: "Anna Martinez", contact_email: "anna@quickserv.com", contact_phone: null, company: "QuickServ",
    source: "website", inquiry_text: "Looking for monthly consulting retainer. Small team, budget ~$2k/mo.",
    urgency: "low", quality_score: 60, quality_hints: ["Clear budget", "Retainer interest"],
    completeness_score: 75, missing_fields: ["phone"], duplicate_status: "none", duplicate_match_id: null,
    suggested_owner: "Alex", suggested_route: "consult", advisor_suggestion: "Good fit for standard consulting package. Schedule discovery call.",
    triage_status: "reviewing", routed_to: null, accepted_at: null, business_profile_mode: null, created_at: ago(6), updated_at: ago(5),
    response_time_minutes: 45, last_activity_at: ago(5), engagement_events: 1, appointment_booked: false,
    quote_requested: false, prior_customer: false, owner_assigned: "Alex", owner_last_action_at: ago(5),
    estimated_value: 24000, communication_count: 1, replied_to_outreach: false, engagement_quality: "medium",
  },
  {
    id: "li-8", user_id: "", contact_name: "buy cheap watches", contact_email: "spam@fake.xyz", contact_phone: null, company: null,
    source: "website", inquiry_text: "Buy cheap watches online discount free shipping click here www.spam-link.com",
    urgency: "low", quality_score: 3, quality_hints: ["Spam pattern detected", "Low-quality form submission"],
    completeness_score: 20, missing_fields: ["phone", "company", "title"], duplicate_status: "none", duplicate_match_id: null,
    suggested_owner: null, suggested_route: "spam", advisor_suggestion: "Mark invalid/spam — low-quality inbound pattern detected.",
    triage_status: "new", routed_to: null, accepted_at: null, business_profile_mode: null, created_at: ago(5), updated_at: ago(5),
    response_time_minutes: null, last_activity_at: null, engagement_events: 0, appointment_booked: false,
    quote_requested: false, prior_customer: false, owner_assigned: null, owner_last_action_at: null,
    estimated_value: 0, communication_count: 0, replied_to_outreach: false, engagement_quality: null,
  },
  {
    id: "li-9", user_id: "", contact_name: "David Torres", contact_email: "d.torres@buildright.co", contact_phone: "+1-408-555-3210", company: "BuildRight Construction",
    source: "referral", inquiry_text: "Need help with project management software evaluation and implementation.",
    urgency: "medium", quality_score: 72, quality_hints: ["Referral source", "Clear project scope"],
    completeness_score: 90, missing_fields: [], duplicate_status: "none", duplicate_match_id: null,
    suggested_owner: "Alex", suggested_route: "lead", advisor_suggestion: "Solid mid-market lead. Accept and assign for standard follow-up.",
    triage_status: "accepted", routed_to: "leads", accepted_at: ago(2), business_profile_mode: null, created_at: ago(8), updated_at: ago(2),
    response_time_minutes: 120, last_activity_at: ago(2), engagement_events: 2, appointment_booked: false,
    quote_requested: false, prior_customer: true, owner_assigned: "Alex", owner_last_action_at: ago(2),
    estimated_value: 12000, communication_count: 3, replied_to_outreach: true, engagement_quality: "medium",
  },
  {
    id: "li-10", user_id: "", contact_name: "Karen Lee", contact_email: "k.lee@import-batch.csv", contact_phone: "+1-555-0000", company: "Import Batch Inc",
    source: "import", inquiry_text: null,
    urgency: "low", quality_score: 40, quality_hints: ["Imported record", "Weak context"],
    completeness_score: 50, missing_fields: ["inquiry_text", "title"], duplicate_status: "possible", duplicate_match_id: null,
    suggested_owner: null, suggested_route: "lead", advisor_suggestion: "Imported record with weak context. Enrich before routing.",
    triage_status: "new", routed_to: null, accepted_at: null, business_profile_mode: null, created_at: ago(3), updated_at: ago(3),
    response_time_minutes: null, last_activity_at: null, engagement_events: 0, appointment_booked: false,
    quote_requested: false, prior_customer: false, owner_assigned: null, owner_last_action_at: null,
    estimated_value: 0, communication_count: 0, replied_to_outreach: false, engagement_quality: null,
  },
  {
    id: "li-11", user_id: "", contact_name: "Tom Blake", contact_email: "tom@fastgrowth.io", contact_phone: null, company: "FastGrowth",
    source: "crm-sync", inquiry_text: "Synced from HubSpot — opened proposal email 3 times this week.",
    urgency: "high", quality_score: 75, quality_hints: ["High email engagement", "Returning interest"],
    completeness_score: 70, missing_fields: ["phone"], duplicate_status: "none", duplicate_match_id: null,
    suggested_owner: "Maya", suggested_route: "lead", advisor_suggestion: "Re-engaged prospect showing strong intent signals. Prioritize outreach.",
    triage_status: "new", routed_to: null, accepted_at: null, business_profile_mode: null, created_at: ago(2.5), updated_at: ago(2.5),
    response_time_minutes: null, last_activity_at: ago(1), engagement_events: 3, appointment_booked: false,
    quote_requested: false, prior_customer: false, owner_assigned: "Maya", owner_last_action_at: ago(6),
    estimated_value: 18000, communication_count: 2, replied_to_outreach: false, engagement_quality: "high",
  },
  {
    id: "li-12", user_id: "", contact_name: "Priya Sharma", contact_email: "priya@zenithcorp.com", contact_phone: "+1-925-555-7890", company: "Zenith Corp",
    source: "message", inquiry_text: "Hi, we spoke at the conference last week. I'd like to schedule a follow-up about your enterprise offering.",
    urgency: "high", quality_score: 82, quality_hints: ["Personal connection", "Follow-up from event", "Enterprise interest"],
    completeness_score: 85, missing_fields: ["title"], duplicate_status: "none", duplicate_match_id: null,
    suggested_owner: "Founder", suggested_route: "consult", advisor_suggestion: "Warm personal connection from conference. Schedule same-day follow-up.",
    triage_status: "new", routed_to: null, accepted_at: null, business_profile_mode: null, created_at: ago(1.2), updated_at: ago(1.2),
    response_time_minutes: 12, last_activity_at: ago(0.8), engagement_events: 2, appointment_booked: false,
    quote_requested: false, prior_customer: false, owner_assigned: "Founder", owner_last_action_at: ago(1),
    estimated_value: 50000, communication_count: 2, replied_to_outreach: true, engagement_quality: "high",
  },
];

export const getInboxStats = (items: InboxItem[]) => {
  const pending = items.filter(i => i.triage_status === "new" || i.triage_status === "reviewing");
  return {
    total: items.length,
    newCount: items.filter(i => i.triage_status === "new").length,
    unassigned: pending.filter(i => !i.suggested_owner).length,
    urgent: pending.filter(i => i.urgency === "high" || i.urgency === "critical").length,
    highQuality: pending.filter(i => i.quality_score >= 75).length,
    duplicates: pending.filter(i => i.duplicate_status !== "none").length,
    incomplete: pending.filter(i => i.completeness_score < 70).length,
    exceptional: pending.filter(i => i.suggested_route === "boardroom").length,
    sources: Object.entries(
      pending.reduce((acc, i) => { acc[i.source] = (acc[i.source] || 0) + 1; return acc; }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1]),
  };
};
