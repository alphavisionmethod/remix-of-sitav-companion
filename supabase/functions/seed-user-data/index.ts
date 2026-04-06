import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { EdgeLogger } from "../_shared/logger.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "No auth" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const uid = user.id;
    const now = new Date();
    const iso = now.toISOString();
    const d = (offsetDays: number) => new Date(now.getTime() + offsetDays * 86400000).toISOString();
    const dh = (offsetDays: number, hours: number) => new Date(now.getTime() + offsetDays * 86400000 + hours * 3600000).toISOString();

    // Check if already seeded
    const { count } = await admin.from("leads").select("id", { count: "exact", head: true }).eq("user_id", uid);
    if (count && count > 0) {
      return new Response(JSON.stringify({ message: "Already seeded", skipped: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Leads ──
    await admin.from("leads").insert([
      { user_id: uid, name: "Sarah Chen", email: "sarah@designworks.co", phone: "+1-415-555-0101", status: "qualified", source: "referral", notes: "Interested in premium package — $4,500 website redesign", created_at: d(-3) },
      { user_id: uid, name: "Marcus Rivera", email: "marcus@greenleaf.io", phone: "+1-512-555-0202", status: "new", source: "website", notes: "Filled out contact form — needs brand identity", created_at: d(-1) },
      { user_id: uid, name: "Priya Patel", email: "priya@luxeinteriors.com", phone: "+1-310-555-0303", status: "contacted", source: "linkedin", notes: "Met at design conference, follow up next week", created_at: d(-5) },
      { user_id: uid, name: "David Kim", email: "david@techvault.com", phone: "+1-206-555-0404", status: "qualified", source: "referral", notes: "Referred by Acme Corp — wants app prototype", created_at: d(-7) },
      { user_id: uid, name: "Emily Watson", email: "emily@sunrisecafe.com", phone: "+1-503-555-0505", status: "new", source: "instagram", notes: "Saw portfolio — needs menu redesign", created_at: d(-2) },
      { user_id: uid, name: "Alex Thompson", email: "alex@urbanfit.co", phone: "+1-720-555-0606", status: "contacted", source: "cold-outreach", notes: "Fitness brand needing full rebrand", created_at: d(-10) },
      { user_id: uid, name: "Lisa Nguyen", email: "lisa@brightpath.edu", phone: "+1-617-555-0707", status: "lost", source: "website", notes: "Budget constraints — revisit Q3", created_at: d(-30) },
    ]);

    // ── Customers ──
    await admin.from("customers").insert([
      { user_id: uid, name: "Acme Corp", email: "billing@acmecorp.com", status: "active", tier: "premium", lifetime_value: 18500, notes: "Long-term client since 2024 — quarterly retainer", created_at: d(-180) },
      { user_id: uid, name: "Bloom Studio", email: "hello@bloomstudio.co", status: "active", tier: "standard", lifetime_value: 7200, notes: "Monthly social media management", created_at: d(-90) },
      { user_id: uid, name: "Vertex Labs", email: "ops@vertexlabs.io", status: "active", tier: "premium", lifetime_value: 24000, notes: "Product design + dev — ongoing engagement", created_at: d(-120) },
      { user_id: uid, name: "Harbor Real Estate", email: "admin@harborgroup.com", status: "churned", tier: "standard", lifetime_value: 3600, notes: "Completed project — may reactivate for new listings", created_at: d(-200) },
      { user_id: uid, name: "Nourish Kitchen", email: "chef@nourishkitchen.com", status: "active", tier: "basic", lifetime_value: 2400, notes: "Website maintenance + seasonal menu updates", created_at: d(-60) },
    ]);

    // ── Events ──
    await admin.from("events").insert([
      { user_id: uid, title: "Weekly Business Review", description: "Revenue, pipeline, and priority review", start_time: dh(2, 10), end_time: dh(2, 11), event_type: "boardroom", created_at: iso },
      { user_id: uid, title: "Client Check-in — Acme Corp", description: "Q2 retainer review and scope discussion", start_time: dh(3, 14), end_time: dh(3, 14.5), event_type: "meeting", created_at: iso },
      { user_id: uid, title: "Monthly Money Review", description: "Cash flow, bills, and reserve health", start_time: dh(7, 9), end_time: dh(7, 10), event_type: "boardroom", created_at: iso },
      { user_id: uid, title: "Sarah Chen — Quote Follow-up", description: "Discuss $4,500 proposal revisions", start_time: dh(1, 10.5), end_time: dh(1, 11), event_type: "call", created_at: iso },
      { user_id: uid, title: "Family Weekly Planning", description: "Household sync — school, meals, activities", start_time: dh(5, 18), end_time: dh(5, 18.5), event_type: "household", created_at: iso },
      { user_id: uid, title: "Grocery Run", description: "Weekly shopping — list auto-generated", start_time: dh(4, 11), end_time: dh(4, 12), event_type: "errand", created_at: iso },
    ]);

    // ── Bills ──
    await admin.from("bills").insert([
      { user_id: uid, name: "Office Rent", amount: 2800, currency: "USD", due_date: d(5), status: "upcoming", category: "rent", recurring: true, vendor: "Maple Street Properties", created_at: iso },
      { user_id: uid, name: "Internet — Fiber", amount: 89.99, currency: "USD", due_date: d(12), status: "upcoming", category: "utilities", recurring: true, vendor: "Spectrum Business", created_at: iso },
      { user_id: uid, name: "Adobe Creative Cloud", amount: 54.99, currency: "USD", due_date: d(8), status: "upcoming", category: "software", recurring: true, vendor: "Adobe", created_at: iso },
      { user_id: uid, name: "Insurance Premium", amount: 420, currency: "USD", due_date: d(-2), status: "overdue", category: "insurance", recurring: true, vendor: "StateFarm", created_at: iso },
      { user_id: uid, name: "Accountant Retainer", amount: 350, currency: "USD", due_date: d(15), status: "upcoming", category: "professional", recurring: true, vendor: "Chen & Associates", created_at: iso },
    ]);

    // ── Invoices ──
    await admin.from("invoices").insert([
      { user_id: uid, invoice_number: "INV-1042", customer_name: "Acme Corp", amount: 4500, currency: "USD", status: "paid", due_date: d(-10), paid_date: d(-8), description: "Q1 Retainer — Design Services", created_at: d(-30) },
      { user_id: uid, invoice_number: "INV-1043", customer_name: "Bloom Studio", amount: 1200, currency: "USD", status: "sent", due_date: d(5), description: "March social media management", created_at: d(-5) },
      { user_id: uid, invoice_number: "INV-1044", customer_name: "Vertex Labs", amount: 8000, currency: "USD", status: "paid", due_date: d(-20), paid_date: d(-18), description: "Product design sprint — Phase 2", created_at: d(-40) },
      { user_id: uid, invoice_number: "INV-1045", customer_name: "David Kim", amount: 1800, currency: "USD", status: "overdue", due_date: d(-7), description: "App prototype — initial deposit", created_at: d(-14) },
      { user_id: uid, invoice_number: "INV-1046", customer_name: "Nourish Kitchen", amount: 600, currency: "USD", status: "draft", due_date: d(15), description: "Spring menu redesign", created_at: d(-1) },
    ]);

    // ── Subscriptions ──
    await admin.from("subscriptions").insert([
      { user_id: uid, name: "Figma Professional", amount: 15, currency: "USD", billing_cycle: "monthly", status: "active", category: "design", provider: "Figma", next_billing_date: d(18), created_at: d(-90) },
      { user_id: uid, name: "Slack Business+", amount: 12.50, currency: "USD", billing_cycle: "monthly", status: "active", category: "communication", provider: "Slack", next_billing_date: d(22), created_at: d(-120) },
      { user_id: uid, name: "GitHub Team", amount: 4, currency: "USD", billing_cycle: "monthly", status: "active", category: "development", provider: "GitHub", next_billing_date: d(25), created_at: d(-200) },
      { user_id: uid, name: "Notion Plus", amount: 10, currency: "USD", billing_cycle: "monthly", status: "active", category: "productivity", provider: "Notion", next_billing_date: d(15), created_at: d(-60) },
      { user_id: uid, name: "Grammarly Premium", amount: 12, currency: "USD", billing_cycle: "monthly", status: "cancelled", category: "writing", provider: "Grammarly", next_billing_date: d(30), created_at: d(-180) },
      { user_id: uid, name: "Canva Pro", amount: 13, currency: "USD", billing_cycle: "monthly", status: "active", category: "design", provider: "Canva", next_billing_date: d(20), created_at: d(-150) },
    ]);

    // ── Reserves ──
    await admin.from("reserves").insert([
      { user_id: uid, name: "Emergency Fund", target_amount: 15000, current_amount: 8200, currency: "USD", category: "safety", status: "active", created_at: d(-90) },
      { user_id: uid, name: "Tax Reserve", target_amount: 6000, current_amount: 4100, currency: "USD", category: "tax", status: "active", created_at: d(-60) },
      { user_id: uid, name: "Equipment Upgrade", target_amount: 3000, current_amount: 1850, currency: "USD", category: "investment", status: "active", created_at: d(-30) },
    ]);

    // ── Quotes ──
    await admin.from("quotes").insert([
      { user_id: uid, quote_number: "QT-2024-018", customer_name: "Sarah Chen", amount: 4500, currency: "USD", status: "sent", valid_until: d(14), description: "Website redesign — full scope", created_at: d(-3) },
      { user_id: uid, quote_number: "QT-2024-019", customer_name: "David Kim", amount: 6200, currency: "USD", status: "draft", valid_until: d(21), description: "Mobile app prototype + UI kit", created_at: d(-1) },
      { user_id: uid, quote_number: "QT-2024-020", customer_name: "Alex Thompson", amount: 12000, currency: "USD", status: "accepted", valid_until: d(7), description: "Full brand identity + collateral", created_at: d(-10) },
    ]);

    // ── Deals ──
    await admin.from("deals").insert([
      { user_id: uid, name: "Acme Corp Q2 Retainer", value: 13500, currency: "USD", stage: "negotiation", probability: 85, expected_close_date: d(14), created_at: d(-7) },
      { user_id: uid, name: "UrbanFit Brand Package", value: 12000, currency: "USD", stage: "proposal", probability: 60, expected_close_date: d(21), created_at: d(-5) },
      { user_id: uid, name: "TechVault Mobile App", value: 28000, currency: "USD", stage: "discovery", probability: 35, expected_close_date: d(45), created_at: d(-2) },
    ]);

    // ── Opportunities ──
    await admin.from("opportunities").insert([
      { user_id: uid, title: "Stale Lead Recovery — Emily Watson", description: "No contact in 48h, menu redesign inquiry worth $800+", category: "lead-recovery", priority: "high", status: "open", estimated_value: 800, created_at: d(-1) },
      { user_id: uid, title: "Upsell Bloom Studio to Premium", description: "Current standard tier, consistent engagement — ready for premium pitch", category: "upsell", priority: "medium", status: "open", estimated_value: 3600, created_at: d(-3) },
      { user_id: uid, title: "Reactivate Harbor Real Estate", description: "New listing season approaching — previously churned client", category: "reactivation", priority: "medium", status: "open", estimated_value: 2400, created_at: d(-5) },
    ]);

    // ── Tasks ──
    await admin.from("tasks").insert([
      { user_id: uid, title: "Follow up with Sarah Chen on quote", description: "She requested revisions to the $4,500 proposal", status: "pending", priority: "high", due_date: d(1), category: "business", created_at: iso },
      { user_id: uid, title: "Prepare weekly boardroom summary", description: "Revenue, pipeline, and risk analysis for Thursday review", status: "pending", priority: "medium", due_date: d(2), category: "business", created_at: iso },
      { user_id: uid, title: "Pay insurance premium", description: "StateFarm — 2 days overdue", status: "overdue", priority: "high", due_date: d(-2), category: "money", created_at: d(-5) },
      { user_id: uid, title: "Review subscription overlap", description: "Figma + Canva — potential duplicate design tools", status: "pending", priority: "low", due_date: d(7), category: "money", created_at: iso },
      { user_id: uid, title: "Update grocery list", description: "Weekly shopping — add items from family chat", status: "pending", priority: "medium", due_date: d(4), category: "household", created_at: iso },
      { user_id: uid, title: "Schedule parent-teacher meeting", description: "End-of-term conference — coordinate with partner", status: "pending", priority: "medium", due_date: d(10), category: "household", created_at: iso },
    ]);

    // ── Household Tasks ──
    await admin.from("household_tasks").insert([
      { user_id: uid, title: "Weekly laundry", assigned_to: "Self", status: "pending", priority: "medium", due_date: d(2), category: "chores", created_at: iso },
      { user_id: uid, title: "Clean out garage", assigned_to: "Self", status: "pending", priority: "low", due_date: d(14), category: "organization", created_at: iso },
      { user_id: uid, title: "Meal prep for school week", assigned_to: "Partner", status: "pending", priority: "high", due_date: d(5), category: "food", created_at: iso },
    ]);

    // ── Policies ──
    await admin.from("policies").insert([
      { user_id: uid, name: "Spending Approval Threshold", description: "Require approval for any automated payment above $500", category: "financial", status: "active", rules: { threshold: 500, currency: "USD", requires: "explicit-approval" }, created_at: iso },
      { user_id: uid, name: "Lead Response SLA", description: "New leads must receive first contact within 4 hours", category: "business", status: "active", rules: { sla_hours: 4, escalation: "advisor-alert" }, created_at: iso },
      { user_id: uid, name: "Outbound Communication Guard", description: "No external emails sent without user review", category: "communication", status: "active", rules: { mode: "review-required", exceptions: [] }, created_at: iso },
    ]);

    // ── Workflows ──
    const { data: wfData } = await admin.from("workflows").insert([
      { user_id: uid, name: "Lead Follow-Up Sequence", description: "Automated check-in cadence for new leads", status: "active", trigger_type: "event", category: "business", created_at: iso },
      { user_id: uid, name: "Invoice Overdue Escalation", description: "Notify → Remind → Escalate for overdue invoices", status: "active", trigger_type: "schedule", category: "finance", created_at: iso },
      { user_id: uid, name: "Weekly Boardroom Prep", description: "Auto-compile KPIs and summaries before Thursday boardroom", status: "active", trigger_type: "schedule", category: "operations", created_at: iso },
    ]).select("id");

    // ── Notifications ──
    await admin.from("notifications").insert([
      { user_id: uid, title: "Invoice #1045 is 7 days overdue", message: "David Kim owes $1,800 — consider sending a reminder", type: "warning", read: false, created_at: d(-1) },
      { user_id: uid, title: "New lead: Marcus Rivera", message: "Website form submission — brand identity inquiry", type: "info", read: false, created_at: d(-1) },
      { user_id: uid, title: "Insurance premium due today", message: "StateFarm — $420 auto-pay scheduled", type: "action", read: false, created_at: d(-2) },
      { user_id: uid, title: "Boardroom ready for Thursday", message: "Weekly business review materials compiled", type: "info", read: true, created_at: d(-3) },
      { user_id: uid, title: "Acme Corp retainer renewing", message: "Q2 retainer up for renewal — $4,500/quarter", type: "info", read: true, created_at: d(-5) },
    ]);

    // ── Bookings ──
    await admin.from("bookings").insert([
      { user_id: uid, title: "Sarah Chen — Design Consultation", start_time: dh(1, 10), end_time: dh(1, 11), status: "confirmed", customer_name: "Sarah Chen", notes: "Discuss website redesign scope", created_at: iso },
      { user_id: uid, title: "Alex Thompson — Brand Discovery", start_time: dh(3, 14), end_time: dh(3, 15.5), status: "confirmed", customer_name: "Alex Thompson", notes: "Initial discovery session for full rebrand", created_at: iso },
    ]);

    // ── Goals ──
    await admin.from("goals").insert([
      { user_id: uid, title: "Reach $10K MRR", description: "Monthly recurring revenue target", target_value: 10000, current_value: 6800, unit: "USD", status: "in-progress", due_date: d(60), category: "revenue", created_at: d(-30) },
      { user_id: uid, title: "Close 5 new clients this quarter", description: "New client acquisition target", target_value: 5, current_value: 2, unit: "clients", status: "in-progress", due_date: d(45), category: "growth", created_at: d(-30) },
      { user_id: uid, title: "Build 3-month emergency fund", description: "Financial safety net", target_value: 15000, current_value: 8200, unit: "USD", status: "in-progress", due_date: d(90), category: "financial", created_at: d(-60) },
    ]);

    // ── Approval Queue ──
    await admin.from("approval_queue").insert([
      { user_id: uid, title: "Auto-send follow-up to Emily Watson", description: "SITA drafted a check-in email — review before sending", type: "communication", status: "pending", priority: "medium", metadata: { advisor: "business", action: "send-email", entity: "lead-emily" }, created_at: iso },
      { user_id: uid, title: "Schedule payment — Insurance $420", description: "Overdue bill — authorize immediate payment", type: "financial", status: "pending", priority: "high", metadata: { advisor: "money", action: "pay-bill", amount: 420 }, created_at: d(-1) },
    ]);

    // ── Audit Logs ──
    await admin.from("audit_logs").insert([
      { user_id: uid, action: "invoice.paid", entity_type: "invoice", entity_id: "INV-1042", details: { amount: 4500, customer: "Acme Corp" }, created_at: d(-8) },
      { user_id: uid, action: "lead.created", entity_type: "lead", entity_id: "lead-marcus", details: { name: "Marcus Rivera", source: "website" }, created_at: d(-1) },
      { user_id: uid, action: "quote.sent", entity_type: "quote", entity_id: "QT-2024-018", details: { amount: 4500, customer: "Sarah Chen" }, created_at: d(-3) },
      { user_id: uid, action: "policy.activated", entity_type: "policy", entity_id: "spending-guard", details: { name: "Spending Approval Threshold" }, created_at: d(-14) },
    ]);

    // ── Connector Configs (catalog) ──
    await admin.from("connector_configs").insert([
      { user_id: uid, connector_id: "google-calendar", connector_name: "Google Calendar", category: "calendar", status: "available", capabilities: ["calendar-sync", "event-management"], auth_type: "oauth", created_at: iso },
      { user_id: uid, connector_id: "stripe", connector_name: "Stripe", category: "finance", status: "available", capabilities: ["payment-processing", "invoice-sync"], auth_type: "api-key", created_at: iso },
      { user_id: uid, connector_id: "plaid", connector_name: "Plaid", category: "finance", status: "available", capabilities: ["account-aggregation", "transaction-sync"], auth_type: "oauth", created_at: iso },
      { user_id: uid, connector_id: "gmail", connector_name: "Gmail", category: "communication", status: "available", capabilities: ["email-sync", "inbox-capture"], auth_type: "oauth", created_at: iso },
    ]);

    // ── Communications ──
    await admin.from("communications").insert([
      { user_id: uid, type: "email", direction: "outbound", subject: "Follow-up: Website Redesign Proposal", contact_name: "Sarah Chen", contact_email: "sarah@designworks.co", status: "delivered", created_at: d(-2) },
      { user_id: uid, type: "email", direction: "inbound", subject: "Re: Brand Identity Project", contact_name: "Alex Thompson", contact_email: "alex@urbanfit.co", status: "read", created_at: d(-1) },
      { user_id: uid, type: "call", direction: "outbound", subject: "Quarterly check-in", contact_name: "Acme Corp — James", contact_email: "james@acmecorp.com", status: "completed", created_at: d(-4) },
    ]);

    // ── Budgets ──
    await admin.from("budgets").insert([
      { user_id: uid, name: "Operating Expenses", amount: 5000, spent: 3240, currency: "USD", period: "monthly", category: "operations", status: "active", created_at: iso },
      { user_id: uid, name: "Marketing", amount: 1500, spent: 680, currency: "USD", period: "monthly", category: "marketing", status: "active", created_at: iso },
      { user_id: uid, name: "Software & Tools", amount: 300, spent: 167, currency: "USD", period: "monthly", category: "software", status: "active", created_at: iso },
    ]);

    return new Response(JSON.stringify({
      success: true,
      seeded: {
        leads: 7, customers: 5, events: 6, bills: 5, invoices: 5,
        subscriptions: 6, reserves: 3, quotes: 3, deals: 3,
        opportunities: 3, tasks: 6, household_tasks: 3, policies: 3,
        workflows: 3, notifications: 5, bookings: 2, goals: 3,
        approval_queue: 2, audit_logs: 4, connector_configs: 4,
        communications: 3, budgets: 3,
      }
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Seed error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
