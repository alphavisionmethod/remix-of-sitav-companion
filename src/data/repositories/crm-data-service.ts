// SITA OS — CRM Data Service (Full CRUD, Mode-Aware)
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import type { RealityModeKey } from "@/lib/dual-reality/reality-mode-registry";
import { resolveByMode, type ModeAwareResult } from "@/hooks/useRealityProvider";

// ─── Types ───────────────────────────────────────────────────
export interface CRMContact {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  lifecycle_stage: string;
  status: string;
  owner: string | null;
  source: string | null;
  health_score: number | null;
  avatar_url: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  website: string | null;
  tags: string[];
  custom_fields: Record<string, unknown>;
  last_contacted_at: string | null;
  next_follow_up_at: string | null;
  import_source: string | null;
  import_job_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CRMCompany {
  id: string;
  user_id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  size: string | null;
  annual_revenue: number | null;
  health_score: number | null;
  owner: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  website: string | null;
  tags: string[];
  custom_fields: Record<string, unknown>;
  notes: string | null;
  import_source: string | null;
  created_at: string;
  updated_at: string;
}

export interface CRMOpportunity {
  id: string;
  user_id: string;
  title: string;
  value: number;
  stage: string;
  stage_id: string | null;
  probability: number;
  expected_close_date: string | null;
  source: string | null;
  owner: string | null;
  contact_id: string | null;
  company_id: string | null;
  status: string;
  lost_reason: string | null;
  won_at: string | null;
  lost_at: string | null;
  notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CRMCommunication {
  id: string;
  user_id: string;
  contact_id: string | null;
  company_id: string | null;
  opportunity_id: string | null;
  comm_type: string;
  direction: string;
  subject: string | null;
  content: string | null;
  channel: string | null;
  outcome: string | null;
  occurred_at: string;
  created_at: string;
}

export interface CRMTask {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  completed_at: string | null;
  contact_id: string | null;
  company_id: string | null;
  opportunity_id: string | null;
  task_type: string;
  created_at: string;
  updated_at: string;
}

export interface CRMNote {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  note_type: string;
  is_pinned: boolean;
  entity_type: string | null;
  entity_id: string | null;
  contact_id: string | null;
  company_id: string | null;
  opportunity_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CRMPipelineStage {
  id: string;
  user_id: string;
  name: string;
  display_order: number;
  color: string;
  is_won: boolean;
  is_lost: boolean;
}

export interface CRMImportJob {
  id: string;
  user_id: string;
  source: string;
  file_name: string | null;
  status: string;
  total_rows: number;
  created_count: number;
  updated_count: number;
  skipped_count: number;
  error_count: number;
  field_mappings: Record<string, unknown>;
  errors: unknown[];
  stats: Record<string, unknown>;
  completed_at: string | null;
  created_at: string;
}

export interface CRMSegment {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  filter_config: Record<string, unknown>;
  is_system: boolean;
  contact_count: number;
  created_at: string;
}

export interface CRMTag {
  id: string;
  user_id: string;
  name: string;
  color: string;
}

// ─── Demo Data ───────────────────────────────────────────────
const CONTACTS: CRMContact[] = [
  { id: "dc1", user_id: "", first_name: "Sarah", last_name: "Chen", email: "sarah@meridian.vc", phone: "+1-555-0101", title: "Managing Partner", lifecycle_stage: "customer", status: "active", owner: "You", source: "Referral", health_score: 92, avatar_url: null, address: null, city: "San Francisco", state: "CA", country: "US", website: "meridian.vc", tags: ["VIP", "Investor"], custom_fields: {}, last_contacted_at: new Date(Date.now() - 864e5 * 2).toISOString(), next_follow_up_at: new Date(Date.now() + 864e5 * 3).toISOString(), import_source: null, import_job_id: null, created_at: new Date(Date.now() - 864e5 * 365).toISOString(), updated_at: new Date().toISOString() },
  { id: "dc2", user_id: "", first_name: "Marcus", last_name: "Webb", email: "marcus@atlas.co", phone: "+1-555-0102", title: "CTO", lifecycle_stage: "opportunity", status: "active", owner: "You", source: "Website", health_score: 78, avatar_url: null, address: null, city: "Austin", state: "TX", country: "US", website: "atlas.co", tags: ["Enterprise"], custom_fields: {}, last_contacted_at: new Date(Date.now() - 864e5 * 5).toISOString(), next_follow_up_at: new Date(Date.now() + 864e5).toISOString(), import_source: null, import_job_id: null, created_at: new Date(Date.now() - 864e5 * 180).toISOString(), updated_at: new Date().toISOString() },
  { id: "dc3", user_id: "", first_name: "Elena", last_name: "Rossi", email: "elena@vanguard.co", phone: "+1-555-0103", title: "Senior Advisor", lifecycle_stage: "customer", status: "active", owner: "You", source: "Partner", health_score: 95, avatar_url: null, address: null, city: "New York", state: "NY", country: "US", website: "vanguard.co", tags: ["Advisory", "VIP"], custom_fields: {}, last_contacted_at: new Date(Date.now() - 864e5).toISOString(), next_follow_up_at: null, import_source: null, import_job_id: null, created_at: new Date(Date.now() - 864e5 * 400).toISOString(), updated_at: new Date().toISOString() },
  { id: "dc4", user_id: "", first_name: "James", last_name: "Park", email: "james@nordic.io", phone: "+1-555-0104", title: "CEO", lifecycle_stage: "lead", status: "active", owner: null, source: "LinkedIn", health_score: 45, avatar_url: null, address: null, city: "Seattle", state: "WA", country: "US", website: "nordic.io", tags: ["New"], custom_fields: {}, last_contacted_at: new Date(Date.now() - 864e5 * 14).toISOString(), next_follow_up_at: new Date(Date.now() - 864e5 * 2).toISOString(), import_source: null, import_job_id: null, created_at: new Date(Date.now() - 864e5 * 30).toISOString(), updated_at: new Date().toISOString() },
  { id: "dc5", user_id: "", first_name: "Aisha", last_name: "Patel", email: "aisha@brightside.com", phone: "+1-555-0105", title: "VP Sales", lifecycle_stage: "qualified", status: "active", owner: "You", source: "Conference", health_score: 68, avatar_url: null, address: null, city: "Chicago", state: "IL", country: "US", website: "brightside.com", tags: ["Mid-Market"], custom_fields: {}, last_contacted_at: new Date(Date.now() - 864e5 * 7).toISOString(), next_follow_up_at: new Date(Date.now() + 864e5 * 2).toISOString(), import_source: null, import_job_id: null, created_at: new Date(Date.now() - 864e5 * 60).toISOString(), updated_at: new Date().toISOString() },
];

const COMPANIES: CRMCompany[] = [
  { id: "dco1", user_id: "", name: "Meridian Ventures", domain: "meridian.vc", industry: "Finance", size: "50-200", annual_revenue: 12000000, health_score: 92, owner: "You", phone: "+1-555-1001", address: null, city: "San Francisco", state: "CA", country: "US", website: "meridian.vc", tags: ["VIP"], custom_fields: {}, notes: null, import_source: null, created_at: new Date(Date.now() - 864e5 * 365).toISOString(), updated_at: new Date().toISOString() },
  { id: "dco2", user_id: "", name: "Atlas Corp", domain: "atlas.co", industry: "Technology", size: "200-500", annual_revenue: 45000000, health_score: 78, owner: "You", phone: "+1-555-1002", address: null, city: "Austin", state: "TX", country: "US", website: "atlas.co", tags: ["Enterprise"], custom_fields: {}, notes: null, import_source: null, created_at: new Date(Date.now() - 864e5 * 180).toISOString(), updated_at: new Date().toISOString() },
  { id: "dco3", user_id: "", name: "BrightSide Inc", domain: "brightside.com", industry: "Marketing", size: "10-50", annual_revenue: 5000000, health_score: 68, owner: "You", phone: "+1-555-1003", address: null, city: "Chicago", state: "IL", country: "US", website: "brightside.com", tags: ["Mid-Market"], custom_fields: {}, notes: null, import_source: null, created_at: new Date(Date.now() - 864e5 * 60).toISOString(), updated_at: new Date().toISOString() },
];

const OPPORTUNITIES: CRMOpportunity[] = [
  { id: "do1", user_id: "", title: "Atlas Enterprise License", value: 120000, stage: "Proposal", stage_id: null, probability: 65, expected_close_date: new Date(Date.now() + 864e5 * 30).toISOString().split("T")[0], source: "Website", owner: "You", contact_id: "dc2", company_id: "dco2", status: "open", lost_reason: null, won_at: null, lost_at: null, notes: "Waiting on legal review", tags: ["Enterprise"], created_at: new Date(Date.now() - 864e5 * 45).toISOString(), updated_at: new Date().toISOString() },
  { id: "do2", user_id: "", title: "BrightSide Consulting Retainer", value: 36000, stage: "Negotiation", stage_id: null, probability: 80, expected_close_date: new Date(Date.now() + 864e5 * 14).toISOString().split("T")[0], source: "Conference", owner: "You", contact_id: "dc5", company_id: "dco3", status: "open", lost_reason: null, won_at: null, lost_at: null, notes: null, tags: [], created_at: new Date(Date.now() - 864e5 * 20).toISOString(), updated_at: new Date().toISOString() },
  { id: "do3", user_id: "", title: "Nordic Digital Discovery", value: 25000, stage: "Discovery", stage_id: null, probability: 20, expected_close_date: new Date(Date.now() + 864e5 * 60).toISOString().split("T")[0], source: "LinkedIn", owner: null, contact_id: "dc4", company_id: null, status: "open", lost_reason: null, won_at: null, lost_at: null, notes: "Initial call scheduled", tags: ["New"], created_at: new Date(Date.now() - 864e5 * 5).toISOString(), updated_at: new Date().toISOString() },
];

const TASKS: CRMTask[] = [
  { id: "dt1", user_id: "", title: "Follow up with Marcus on contract", description: "Send revised terms", status: "pending", priority: "high", due_date: new Date(Date.now() + 864e5).toISOString(), completed_at: null, contact_id: "dc2", company_id: "dco2", opportunity_id: "do1", task_type: "follow-up", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "dt2", user_id: "", title: "Schedule demo for Aisha", description: null, status: "pending", priority: "medium", due_date: new Date(Date.now() + 864e5 * 3).toISOString(), completed_at: null, contact_id: "dc5", company_id: "dco3", opportunity_id: "do2", task_type: "meeting", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "dt3", user_id: "", title: "Re-engage James Park", description: "No contact in 14 days", status: "overdue", priority: "high", due_date: new Date(Date.now() - 864e5 * 2).toISOString(), completed_at: null, contact_id: "dc4", company_id: null, opportunity_id: "do3", task_type: "follow-up", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const COMMS: CRMCommunication[] = [
  { id: "dcm1", user_id: "", contact_id: "dc1", company_id: "dco1", opportunity_id: null, comm_type: "email", direction: "outbound", subject: "Q2 Strategy Review", content: "Sent quarterly review deck", channel: "email", outcome: "replied", occurred_at: new Date(Date.now() - 864e5 * 2).toISOString(), created_at: new Date().toISOString() },
  { id: "dcm2", user_id: "", contact_id: "dc2", company_id: "dco2", opportunity_id: "do1", comm_type: "call", direction: "outbound", subject: "Contract Discussion", content: "45 min call. Legal review pending.", channel: "phone", outcome: "positive", occurred_at: new Date(Date.now() - 864e5 * 5).toISOString(), created_at: new Date().toISOString() },
  { id: "dcm3", user_id: "", contact_id: "dc5", company_id: "dco3", opportunity_id: "do2", comm_type: "meeting", direction: "outbound", subject: "Demo & Pricing", content: "Presented retainer package", channel: "zoom", outcome: "interested", occurred_at: new Date(Date.now() - 864e5 * 7).toISOString(), created_at: new Date().toISOString() },
];

// ─── Fetch Functions ─────────────────────────────────────────
async function getUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function fetchCRMContacts(mode: RealityModeKey = "real"): Promise<ModeAwareResult<CRMContact[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: CONTACTS, emptyDefault: [] });
  const uid = await getUserId();
  if (!uid) return resolveByMode({ mode, realData: null, demoData: CONTACTS, emptyDefault: [] });
  const { data, error } = await fromTable("crm_contacts").select("*").eq("user_id", uid).order("created_at", { ascending: false });
  return resolveByMode({ mode, realData: !error && data?.length ? data : null, demoData: CONTACTS, emptyDefault: [] });
}

export async function fetchCRMCompanies(mode: RealityModeKey = "real"): Promise<ModeAwareResult<CRMCompany[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: COMPANIES, emptyDefault: [] });
  const uid = await getUserId();
  if (!uid) return resolveByMode({ mode, realData: null, demoData: COMPANIES, emptyDefault: [] });
  const { data, error } = await fromTable("crm_companies").select("*").eq("user_id", uid).order("created_at", { ascending: false });
  return resolveByMode({ mode, realData: !error && data?.length ? data : null, demoData: COMPANIES, emptyDefault: [] });
}

export async function fetchCRMOpportunities(mode: RealityModeKey = "real"): Promise<ModeAwareResult<CRMOpportunity[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: OPPORTUNITIES, emptyDefault: [] });
  const uid = await getUserId();
  if (!uid) return resolveByMode({ mode, realData: null, demoData: OPPORTUNITIES, emptyDefault: [] });
  const { data, error } = await fromTable("crm_opportunities").select("*").eq("user_id", uid).order("created_at", { ascending: false });
  return resolveByMode({ mode, realData: !error && data?.length ? data : null, demoData: OPPORTUNITIES, emptyDefault: [] });
}

export async function fetchCRMTasks(mode: RealityModeKey = "real"): Promise<ModeAwareResult<CRMTask[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: TASKS, emptyDefault: [] });
  const uid = await getUserId();
  if (!uid) return resolveByMode({ mode, realData: null, demoData: TASKS, emptyDefault: [] });
  const { data, error } = await fromTable("crm_tasks").select("*").eq("user_id", uid).order("due_date", { ascending: true });
  return resolveByMode({ mode, realData: !error && data?.length ? data : null, demoData: TASKS, emptyDefault: [] });
}

export async function fetchCRMCommunications(mode: RealityModeKey = "real"): Promise<ModeAwareResult<CRMCommunication[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: COMMS, emptyDefault: [] });
  const uid = await getUserId();
  if (!uid) return resolveByMode({ mode, realData: null, demoData: COMMS, emptyDefault: [] });
  const { data, error } = await fromTable("crm_communications").select("*").eq("user_id", uid).order("occurred_at", { ascending: false });
  return resolveByMode({ mode, realData: !error && data?.length ? data : null, demoData: COMMS, emptyDefault: [] });
}

export async function fetchCRMNotes(mode: RealityModeKey = "real"): Promise<ModeAwareResult<CRMNote[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: [], emptyDefault: [] });
  const uid = await getUserId();
  if (!uid) return resolveByMode({ mode, realData: null, demoData: [], emptyDefault: [] });
  const { data, error } = await fromTable("crm_notes").select("*").eq("user_id", uid).order("created_at", { ascending: false });
  return resolveByMode({ mode, realData: !error && data?.length ? data : null, demoData: [], emptyDefault: [] });
}

export async function fetchCRMPipelineStages(mode: RealityModeKey = "real"): Promise<ModeAwareResult<CRMPipelineStage[]>> {
  const defaultStages: CRMPipelineStage[] = [
    { id: "s1", user_id: "", name: "Discovery", display_order: 0, color: "#6366f1", is_won: false, is_lost: false },
    { id: "s2", user_id: "", name: "Qualification", display_order: 1, color: "#8b5cf6", is_won: false, is_lost: false },
    { id: "s3", user_id: "", name: "Proposal", display_order: 2, color: "#a855f7", is_won: false, is_lost: false },
    { id: "s4", user_id: "", name: "Negotiation", display_order: 3, color: "#d946ef", is_won: false, is_lost: false },
    { id: "s5", user_id: "", name: "Closed Won", display_order: 4, color: "#22c55e", is_won: true, is_lost: false },
    { id: "s6", user_id: "", name: "Closed Lost", display_order: 5, color: "#ef4444", is_won: false, is_lost: true },
  ];
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: defaultStages, emptyDefault: defaultStages });
  const uid = await getUserId();
  if (!uid) return resolveByMode({ mode, realData: null, demoData: defaultStages, emptyDefault: defaultStages });
  const { data, error } = await fromTable("crm_pipeline_stages").select("*").eq("user_id", uid).order("display_order");
  return resolveByMode({ mode, realData: !error && data?.length ? data : null, demoData: defaultStages, emptyDefault: defaultStages });
}

export async function fetchCRMSegments(mode: RealityModeKey = "real"): Promise<ModeAwareResult<CRMSegment[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: [], emptyDefault: [] });
  const uid = await getUserId();
  if (!uid) return resolveByMode({ mode, realData: null, demoData: [], emptyDefault: [] });
  const { data, error } = await fromTable("crm_segments").select("*").eq("user_id", uid).order("created_at", { ascending: false });
  return resolveByMode({ mode, realData: !error && data?.length ? data : null, demoData: [], emptyDefault: [] });
}

export async function fetchCRMImportJobs(mode: RealityModeKey = "real"): Promise<ModeAwareResult<CRMImportJob[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: [], emptyDefault: [] });
  const uid = await getUserId();
  if (!uid) return resolveByMode({ mode, realData: null, demoData: [], emptyDefault: [] });
  const { data, error } = await fromTable("crm_import_jobs").select("*").eq("user_id", uid).order("created_at", { ascending: false });
  return resolveByMode({ mode, realData: !error && data?.length ? data : null, demoData: [], emptyDefault: [] });
}

// ─── Mutations ───────────────────────────────────────────────
export async function createCRMContact(contact: Partial<CRMContact>) {
  const uid = await getUserId();
  if (!uid) throw new Error("Not authenticated");
  const { data, error } = await fromTable("crm_contacts").insert({ ...contact, user_id: uid }).select().single();
  if (error) throw error;
  return data;
}

export async function updateCRMContact(id: string, updates: Partial<CRMContact>) {
  const { data, error } = await fromTable("crm_contacts").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCRMContact(id: string) {
  const { error } = await fromTable("crm_contacts").delete().eq("id", id);
  if (error) throw error;
}

export async function createCRMCompany(company: Partial<CRMCompany>) {
  const uid = await getUserId();
  if (!uid) throw new Error("Not authenticated");
  const { data, error } = await fromTable("crm_companies").insert({ ...company, user_id: uid }).select().single();
  if (error) throw error;
  return data;
}

export async function updateCRMCompany(id: string, updates: Partial<CRMCompany>) {
  const { data, error } = await fromTable("crm_companies").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCRMCompany(id: string) {
  const { error } = await fromTable("crm_companies").delete().eq("id", id);
  if (error) throw error;
}

export async function createCRMOpportunity(opp: Partial<CRMOpportunity>) {
  const uid = await getUserId();
  if (!uid) throw new Error("Not authenticated");
  const { data, error } = await fromTable("crm_opportunities").insert({ ...opp, user_id: uid }).select().single();
  if (error) throw error;
  return data;
}

export async function updateCRMOpportunity(id: string, updates: Partial<CRMOpportunity>) {
  const { data, error } = await fromTable("crm_opportunities").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function createCRMTask(task: Partial<CRMTask>) {
  const uid = await getUserId();
  if (!uid) throw new Error("Not authenticated");
  const { data, error } = await fromTable("crm_tasks").insert({ ...task, user_id: uid }).select().single();
  if (error) throw error;
  return data;
}

export async function updateCRMTask(id: string, updates: Partial<CRMTask>) {
  const { data, error } = await fromTable("crm_tasks").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function createCRMCommunication(comm: Partial<CRMCommunication>) {
  const uid = await getUserId();
  if (!uid) throw new Error("Not authenticated");
  const { data, error } = await fromTable("crm_communications").insert({ ...comm, user_id: uid }).select().single();
  if (error) throw error;
  return data;
}

export async function createCRMNote(note: Partial<CRMNote>) {
  const uid = await getUserId();
  if (!uid) throw new Error("Not authenticated");
  const { data, error } = await fromTable("crm_notes").insert({ ...note, user_id: uid }).select().single();
  if (error) throw error;
  return data;
}

export async function updateCRMNote(id: string, updates: Partial<CRMNote>) {
  const { data, error } = await fromTable("crm_notes").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCRMNote(id: string) {
  const { error } = await fromTable("crm_notes").delete().eq("id", id);
  if (error) throw error;
}

// ─── Missing Entity Mutations ────────────────────────────────
export async function deleteCRMOpportunity(id: string) {
  const { error } = await fromTable("crm_opportunities").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteCRMTask(id: string) {
  const { error } = await fromTable("crm_tasks").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteCRMCommunication(id: string) {
  const { error } = await fromTable("crm_communications").delete().eq("id", id);
  if (error) throw error;
}

// Pipeline Stages
export async function createCRMPipelineStage(stage: Partial<CRMPipelineStage>) {
  const uid = await getUserId();
  if (!uid) throw new Error("Not authenticated");
  const { data, error } = await fromTable("crm_pipeline_stages").insert({ ...stage, user_id: uid }).select().single();
  if (error) throw error;
  return data;
}

export async function updateCRMPipelineStage(id: string, updates: Partial<CRMPipelineStage>) {
  const { data, error } = await fromTable("crm_pipeline_stages").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCRMPipelineStage(id: string) {
  const { error } = await fromTable("crm_pipeline_stages").delete().eq("id", id);
  if (error) throw error;
}

// Segments
export async function createCRMSegment(segment: Partial<CRMSegment>) {
  const uid = await getUserId();
  if (!uid) throw new Error("Not authenticated");
  const { data, error } = await fromTable("crm_segments").insert({ ...segment, user_id: uid }).select().single();
  if (error) throw error;
  return data;
}

export async function updateCRMSegment(id: string, updates: Partial<CRMSegment>) {
  const { data, error } = await fromTable("crm_segments").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCRMSegment(id: string) {
  const { error } = await fromTable("crm_segments").delete().eq("id", id);
  if (error) throw error;
}

// Tags
export async function fetchCRMTags(mode: RealityModeKey = "real"): Promise<ModeAwareResult<CRMTag[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: [], emptyDefault: [] });
  const uid = await getUserId();
  if (!uid) return resolveByMode({ mode, realData: null, demoData: [], emptyDefault: [] });
  const { data, error } = await fromTable("crm_tags").select("*").eq("user_id", uid).order("name");
  return resolveByMode({ mode, realData: !error && data?.length ? data : null, demoData: [], emptyDefault: [] });
}

export async function createCRMTag(tag: Partial<CRMTag>) {
  const uid = await getUserId();
  if (!uid) throw new Error("Not authenticated");
  const { data, error } = await fromTable("crm_tags").insert({ ...tag, user_id: uid }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCRMTag(id: string) {
  const { error } = await fromTable("crm_tags").delete().eq("id", id);
  if (error) throw error;
}

// Import Jobs
export async function createCRMImportJob(job: Partial<CRMImportJob>) {
  const uid = await getUserId();
  if (!uid) throw new Error("Not authenticated");
  const { data, error } = await fromTable("crm_import_jobs").insert({ ...job, user_id: uid }).select().single();
  if (error) throw error;
  return data;
}

export async function updateCRMImportJob(id: string, updates: Partial<CRMImportJob>) {
  const { data, error } = await fromTable("crm_import_jobs").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// Merge Log
export async function createCRMMergeLog(entry: { winner_id: string; loser_id: string; entity_type: string; merge_reason?: string; merged_fields?: Record<string, unknown> }) {
  const uid = await getUserId();
  if (!uid) throw new Error("Not authenticated");
  const { data, error } = await fromTable("crm_merge_log").insert({ ...entry, user_id: uid }).select().single();
  if (error) throw error;
  return data;
}

// Contact-Company linking
export async function createCRMContactCompanyLink(link: { contact_id: string; company_id: string; role?: string; is_primary?: boolean }) {
  const uid = await getUserId();
  if (!uid) throw new Error("Not authenticated");
  const { data, error } = await fromTable("crm_contact_company").insert({ ...link, user_id: uid }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCRMContactCompanyLink(id: string) {
  const { error } = await fromTable("crm_contact_company").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchCRMContactCompanyLinks(mode: RealityModeKey = "real"): Promise<ModeAwareResult<Array<{ id: string; contact_id: string; company_id: string; role: string | null; is_primary: boolean | null }>>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: [], emptyDefault: [] });
  const uid = await getUserId();
  if (!uid) return resolveByMode({ mode, realData: null, demoData: [], emptyDefault: [] });
  const { data, error } = await fromTable("crm_contact_company").select("*").eq("user_id", uid);
  return resolveByMode({ mode, realData: !error && data?.length ? data : null, demoData: [], emptyDefault: [] });
}

// ─── CRM Automations ────────────────────────────────────────
export interface CRMAutomation {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  conditions: unknown[];
  actions: unknown[];
  delay_minutes: number | null;
  trust_gate: string;
  status: string;
  target_entity: string;
  runs: number;
  last_run_at: string | null;
  execution_log: unknown[];
  created_at: string;
  updated_at: string;
}

const AUTOMATIONS: CRMAutomation[] = [
  { id: "da1", user_id: "", title: "New Lead → Assign + Follow-Up", description: "Auto-assign owner and create follow-up task when a new lead is imported or created", trigger_type: "contact_created", trigger_config: { stage: "lead" }, conditions: [], actions: [{ type: "assign_owner", config: { method: "round-robin" } }, { type: "create_task", config: { title: "Follow up with new lead", due_days: 3 } }], delay_minutes: 0, trust_gate: "active", status: "active", target_entity: "contact", runs: 24, last_run_at: new Date(Date.now() - 7200000).toISOString(), execution_log: [], created_at: new Date(Date.now() - 864e5 * 30).toISOString(), updated_at: new Date().toISOString() },
  { id: "da2", user_id: "", title: "14-Day Silence → Follow-Up Reminder", description: "Create a reminder when any contact hasn't been reached in 14 days", trigger_type: "no_contact_days", trigger_config: { days: 14 }, conditions: [], actions: [{ type: "create_task", config: { title: "Follow up — no contact in 14 days", priority: "high" } }, { type: "notify_advisor" }], delay_minutes: 0, trust_gate: "active", status: "active", target_entity: "contact", runs: 18, last_run_at: new Date(Date.now() - 18000000).toISOString(), execution_log: [], created_at: new Date(Date.now() - 864e5 * 60).toISOString(), updated_at: new Date().toISOString() },
  { id: "da3", user_id: "", title: "Quote No Response → Auto Follow-Up", description: "Suggest follow-up when a sent quote goes unanswered for 5 days", trigger_type: "quote_no_reply", trigger_config: { days: 5 }, conditions: [], actions: [{ type: "draft_email", config: { template: "quote_follow_up" } }, { type: "queue_for_review" }], delay_minutes: 0, trust_gate: "approval_required", status: "paused", target_entity: "opportunity", runs: 7, last_run_at: new Date(Date.now() - 864e5 * 2).toISOString(), execution_log: [], created_at: new Date(Date.now() - 864e5 * 45).toISOString(), updated_at: new Date().toISOString() },
  { id: "da4", user_id: "", title: "Invoice Overdue → Collections", description: "Surface collections action when invoice passes due date", trigger_type: "invoice_overdue", trigger_config: { escalate_after_days: 30 }, conditions: [], actions: [{ type: "create_task", config: { title: "Collections follow-up", priority: "critical" } }, { type: "notify_owner" }, { type: "escalate_boardroom", config: { if_days: 30 } }], delay_minutes: 0, trust_gate: "approval_required", status: "active", target_entity: "contact", runs: 3, last_run_at: new Date(Date.now() - 864e5).toISOString(), execution_log: [], created_at: new Date(Date.now() - 864e5 * 20).toISOString(), updated_at: new Date().toISOString() },
  { id: "da5", user_id: "", title: "Health < 30 → Advisor Alert", description: "Alert advisor board when contact health drops to critical level", trigger_type: "health_threshold", trigger_config: { threshold: 30, direction: "below" }, conditions: [], actions: [{ type: "create_advisor_insight" }, { type: "suggest_recovery" }], delay_minutes: 0, trust_gate: "active", status: "active", target_entity: "contact", runs: 1, last_run_at: new Date(Date.now() - 864e5 * 3).toISOString(), execution_log: [], created_at: new Date(Date.now() - 864e5 * 15).toISOString(), updated_at: new Date().toISOString() },
  { id: "da6", user_id: "", title: "Big Deal Stalled → Boardroom", description: "Escalate to Boardroom when high-value deal stalls 14+ days", trigger_type: "opportunity_stalled", trigger_config: { min_value: 50000, stall_days: 14 }, conditions: [], actions: [{ type: "compile_evidence" }, { type: "create_boardroom_item" }], delay_minutes: 0, trust_gate: "approval_required", status: "draft", target_entity: "opportunity", runs: 0, last_run_at: null, execution_log: [], created_at: new Date(Date.now() - 864e5 * 7).toISOString(), updated_at: new Date().toISOString() },
  { id: "da7", user_id: "", title: "Welcome Sequence → New Customer", description: "Trigger onboarding sequence when lead converts to customer", trigger_type: "stage_changed", trigger_config: { to_stage: "customer" }, conditions: [], actions: [{ type: "send_notification", config: { template: "welcome" } }, { type: "create_task", config: { title: "Onboarding check-in", due_days: 7 } }], delay_minutes: 0, trust_gate: "active", status: "active", target_entity: "contact", runs: 12, last_run_at: new Date(Date.now() - 43200000).toISOString(), execution_log: [], created_at: new Date(Date.now() - 864e5 * 90).toISOString(), updated_at: new Date().toISOString() },
  { id: "da8", user_id: "", title: "Churn Risk → Recovery Campaign", description: "Initiate recovery workflow when customer shows churn signals", trigger_type: "health_declining", trigger_config: { drop_percent: 20, period_days: 30 }, conditions: [], actions: [{ type: "calculate_churn_probability" }, { type: "draft_recovery_plan" }, { type: "assign_relationship_owner" }], delay_minutes: 0, trust_gate: "simulation", status: "paused", target_entity: "contact", runs: 5, last_run_at: new Date(Date.now() - 864e5 * 7).toISOString(), execution_log: [], created_at: new Date(Date.now() - 864e5 * 40).toISOString(), updated_at: new Date().toISOString() },
];

export async function fetchCRMAutomations(mode: RealityModeKey = "real"): Promise<ModeAwareResult<CRMAutomation[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: AUTOMATIONS, emptyDefault: [] });
  const uid = await getUserId();
  if (!uid) return resolveByMode({ mode, realData: null, demoData: AUTOMATIONS, emptyDefault: [] });
  const { data, error } = await fromTable("crm_automations").select("*").eq("user_id", uid).order("created_at", { ascending: false });
  return resolveByMode({ mode, realData: !error && data?.length ? (data as unknown as CRMAutomation[]) : null, demoData: AUTOMATIONS, emptyDefault: [] });
}

export async function createCRMAutomation(automation: Omit<CRMAutomation, "id" | "user_id" | "created_at" | "updated_at" | "runs" | "last_run_at" | "execution_log">) {
  const uid = await getUserId();
  if (!uid) throw new Error("Not authenticated");
  const { data, error } = await fromTable("crm_automations").insert({ ...automation, user_id: uid } as any).select().single();
  if (error) throw error;
  return data;
}

export async function updateCRMAutomation(id: string, updates: Partial<CRMAutomation>) {
  const { data, error } = await fromTable("crm_automations").update(updates as any).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCRMAutomation(id: string) {
  const { error } = await fromTable("crm_automations").delete().eq("id", id);
  if (error) throw error;
}
