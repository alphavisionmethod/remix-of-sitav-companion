// SITA OS — Activity / Inbox Data Service (Mode-Aware)
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import type { RealityModeKey } from "@/lib/dual-reality/reality-mode-registry";
import { resolveByMode, type ModeAwareResult } from "@/hooks/useRealityProvider";

export interface InboxItem {
  id: string; type: string; title: string; preview: string; domain: string;
  timestamp: string; read: boolean; urgency: string; actionUrl?: string;
}
export interface ActivityItem {
  id: string; action: string; domain: string; timestamp: string; actor: string;
}

const INBOX: InboxItem[] = [
  { id: "in1", type: "alert", title: "Portfolio rebalance recommended", preview: "Tech allocation exceeds target by 7pp.", domain: "investment", timestamp: new Date(Date.now() - 1800000).toISOString(), read: false, urgency: "high" },
  { id: "in2", type: "notification", title: "Bill payment scheduled", preview: "Mortgage $3,200 due Apr 15", domain: "money", timestamp: new Date(Date.now() - 86400000).toISOString(), read: true, urgency: "normal" },
  { id: "in3", type: "action", title: "Partnership agreement ready", preview: "Atlas Corp terms need your signature", domain: "business", timestamp: new Date(Date.now() - 43200000).toISOString(), read: false, urgency: "high" },
];
const ACTIVITY: ActivityItem[] = [
  { id: "ac1", action: "Approved Q2 budget allocation", domain: "money", timestamp: new Date(Date.now() - 3600000).toISOString(), actor: "You" },
  { id: "ac2", action: "AI completed portfolio risk assessment", domain: "investment", timestamp: new Date(Date.now() - 7200000).toISOString(), actor: "SITA" },
  { id: "ac3", action: "New deal created: Nordic Digital Consulting", domain: "business", timestamp: new Date(Date.now() - 86400000).toISOString(), actor: "You" },
];

export async function fetchInboxItems(mode: RealityModeKey = "real"): Promise<ModeAwareResult<InboxItem[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: INBOX, emptyDefault: [] });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return resolveByMode({ mode, realData: null, demoData: INBOX, emptyDefault: [] });
  const { data, error } = await fromTable("notifications_queue").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30);
  const mapped = (!error && data && data.length > 0) ? data.map((n: any): InboxItem => ({
    id: n.id, type: n.category || "notification", title: n.title, preview: n.body || "",
    domain: n.category || "general", timestamp: n.created_at, read: n.status === "read",
    urgency: n.urgency || "normal", actionUrl: n.action_url,
  })) : null;
  return resolveByMode({ mode, realData: mapped, demoData: INBOX, emptyDefault: [] });
}

export async function fetchActivityTimeline(mode: RealityModeKey = "real"): Promise<ModeAwareResult<ActivityItem[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: ACTIVITY, emptyDefault: [] });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return resolveByMode({ mode, realData: null, demoData: ACTIVITY, emptyDefault: [] });
  const { data, error } = await fromTable("audit_logs").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
  const mapped = (!error && data && data.length > 0) ? data.map((l: any): ActivityItem => ({
    id: l.id, action: l.action, domain: l.category || "system", timestamp: l.created_at, actor: l.actor || "System",
  })) : null;
  return resolveByMode({ mode, realData: mapped, demoData: ACTIVITY, emptyDefault: [] });
}
