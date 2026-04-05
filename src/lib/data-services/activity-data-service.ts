import { supabase } from "@/integrations/supabase/client";
import { MOCK_INBOX_ITEMS } from "@/lib/mock-data/inbox";
import { MOCK_ACTIVITY_FEED } from "@/lib/mock-data/activity";

export async function fetchInboxItems() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return MOCK_INBOX_ITEMS;

  const { data, error } = await supabase.from("notifications_queue").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30);
  if (error || !data || data.length === 0) return MOCK_INBOX_ITEMS;

  return data.map((n: any) => ({
    id: n.id, type: n.category || "notification", title: n.title,
    preview: n.body || "", domain: n.category || "general",
    timestamp: n.created_at, read: n.status === "read",
    urgency: n.urgency || "normal", actionUrl: n.action_url,
  }));
}

export async function fetchActivityFeed() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return MOCK_ACTIVITY_FEED;

  const { data, error } = await supabase.from("audit_logs").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30);
  if (error || !data || data.length === 0) return MOCK_ACTIVITY_FEED;

  return data.map((a: any) => ({
    id: a.id, action: a.action, actor: a.actor, category: a.category,
    timestamp: a.created_at, details: a.details,
  }));
}
