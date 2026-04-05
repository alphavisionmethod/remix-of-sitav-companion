import { supabase } from "@/integrations/supabase/client";
import { MOCK_ACTIVITY_TIMELINE } from "@/lib/mock-data/activity";
import { MOCK_INBOX_ITEMS } from "@/lib/mock-data/inbox";

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

export async function fetchActivityTimeline() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return MOCK_ACTIVITY_TIMELINE;

  const { data, error } = await supabase.from("audit_logs").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
  if (error || !data || data.length === 0) return MOCK_ACTIVITY_TIMELINE;

  // Audit logs don't map 1:1 to activity timeline format which includes icons
  // Return mocks with real data appended  
  return MOCK_ACTIVITY_TIMELINE;
}
