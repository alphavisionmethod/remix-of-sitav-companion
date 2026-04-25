import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, DollarSign, Briefcase, Home, AlertTriangle, CheckCircle, Clock, ArrowRight, BellOff, Trash2, Filter, Search, Shield, Bot, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: string;
  domain: string;
  urgency: string;
  title: string;
  body: string | null;
  read: boolean;
  snoozedUntil?: number | null;
  action_url: string | null;
  created_at: string;
}

type TabFilter = "all" | "unread" | "agent" | "financial" | "system" | "compliance";

const DOMAIN_META: Record<string, { label: string; icon: typeof Bell; color: string }> = {
  business: { label: "Business", icon: Briefcase, color: "text-primary" },
  finance: { label: "Finance", icon: DollarSign, color: "text-accent" },
  concierge: { label: "Life", icon: Home, color: "text-trust-safe" },
  platform: { label: "System", icon: Shield, color: "text-muted-foreground" },
  agent: { label: "Agent", icon: Bot, color: "text-primary" },
  compliance: { label: "Compliance", icon: Shield, color: "text-trust-verified" },
};

const URGENCY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

const TAB_FILTERS: { key: TabFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "agent", label: "Agent" },
  { key: "financial", label: "Financial" },
  { key: "system", label: "System" },
  { key: "compliance", label: "Compliance" },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const DEEP_LINKS: Record<string, { label: string; path: string }> = {
  "audit-log": { label: "View in Audit Log", path: "/mission-control?tab=audit-log" },
  "predictive": { label: "Open Predictive", path: "/mission-control?tab=predictive" },
  "compliance": { label: "View Compliance", path: "/mission-control?tab=compliance" },
  "control-panel": { label: "Control Panel", path: "/mission-control?tab=control-panel" },
};

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel = ({ isOpen, onClose }: NotificationPanelProps) => {
  const { user, isDemo } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  useEffect(() => {
    if (!user || isDemo || !isOpen) return;
    fromTable("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }: any) => { if (data) setNotifications(data); });
  }, [user, isDemo, isOpen]);

  useEffect(() => {
    if (!user || isDemo) return;
    const channel = supabase
      .channel("notifications-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, (payload: any) => {
        setNotifications((prev) => [payload.new as Notification, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, isDemo]);

  const markRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (user && !isDemo) {
      await fromTable("notifications").update({ read: true }).eq("id", id).eq("user_id", user.id);
    }
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const snoozeNotification = (id: string, minutes: number) => {
    const until = Date.now() + minutes * 60000;
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, snoozedUntil: until } : n)));
    toast.success(`Snoozed for ${minutes} minutes`);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const bulkDismiss = () => {
    setNotifications((prev) => prev.filter((n) => !selectedIds.has(n.id)));
    toast.success(`Dismissed ${selectedIds.size} notification(s)`);
    setSelectedIds(new Set());
    setBulkMode(false);
  };

  const bulkMarkRead = () => {
    setNotifications((prev) => prev.map((n) => selectedIds.has(n.id) ? { ...n, read: true } : n));
    toast.success(`Marked ${selectedIds.size} as read`);
    setSelectedIds(new Set());
    setBulkMode(false);
  };

  const handleAction = (url: string) => {
    navigate(url);
    onClose();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Demo fallback
  const items: Notification[] = isDemo || notifications.length === 0
    ? [
        { id: "1", type: "system", domain: "finance", urgency: "critical", title: "Insurance premium overdue", body: "$890 — 3 days past due. Late fee may apply.", read: false, action_url: "/money/bills", created_at: new Date(Date.now() - 7200000).toISOString() },
        { id: "2", type: "advisor", domain: "agent", urgency: "high", title: "Agent quarantined: Connector Health", body: "Auto-immune triggered after 5 false positives.", read: false, action_url: null, created_at: new Date(Date.now() - 10800000).toISOString() },
        { id: "3", type: "advisor", domain: "business", urgency: "high", title: "Stale lead: James Morton", body: "No contact in 5 days. Re-engagement recommended.", read: false, action_url: "/business/leads", created_at: new Date(Date.now() - 14400000).toISOString() },
        { id: "4", type: "system", domain: "compliance", urgency: "medium", title: "SOC 2 control review due", body: "CC6.1 Access Controls quarterly audit due in 3 days.", read: false, action_url: null, created_at: new Date(Date.now() - 18000000).toISOString() },
        { id: "5", type: "system", domain: "finance", urgency: "medium", title: "Subscription waste detected", body: "3 unused subscriptions totaling $127/mo identified.", read: false, action_url: "/money/subscriptions", created_at: new Date(Date.now() - 21600000).toISOString() },
        { id: "6", type: "system", domain: "platform", urgency: "low", title: "Self-healing resolved 2 issues", body: "Model Routing and Cache Compression agents auto-recovered.", read: true, action_url: null, created_at: new Date(Date.now() - 25200000).toISOString() },
        { id: "7", type: "system", domain: "concierge", urgency: "medium", title: "HVAC maintenance due", body: "Scheduled service with ServicePro pending confirmation.", read: true, action_url: null, created_at: new Date(Date.now() - 28800000).toISOString() },
        { id: "8", type: "advisor", domain: "agent", urgency: "low", title: "3 agents eligible for promotion", body: "Release Safety, Incident Response, and Workflow Recovery exceed 92% success.", read: true, action_url: null, created_at: new Date(Date.now() - 36000000).toISOString() },
        { id: "9", type: "advisor", domain: "business", urgency: "low", title: "Quote accepted: Bloom Design", body: "$14,400 retainer — invoice ready to send.", read: true, action_url: "/business/invoices", created_at: new Date(Date.now() - 43200000).toISOString() },
      ]
    : notifications;

  // Filter out snoozed
  const activItems = items.filter(n => !n.snoozedUntil || n.snoozedUntil < Date.now());

  const filtered = useMemo(() => {
    let result = activItems;
    if (activeTab === "unread") result = result.filter(n => !n.read);
    else if (activeTab === "agent") result = result.filter(n => n.domain === "agent");
    else if (activeTab === "financial") result = result.filter(n => n.domain === "finance");
    else if (activeTab === "system") result = result.filter(n => n.domain === "platform");
    else if (activeTab === "compliance") result = result.filter(n => n.domain === "compliance");

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n => n.title.toLowerCase().includes(q) || n.body?.toLowerCase().includes(q));
    }

    return result;
  }, [activItems, activeTab, searchQuery]);

  const unreadCount = activItems.filter((n) => !n.read).length;
  const sorted = [...filtered].sort((a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency]);
  const grouped = Object.entries(
    sorted.reduce<Record<string, Notification[]>>((acc, n) => {
      (acc[n.domain] ??= []).push(n);
      return acc;
    }, {})
  );

  // Deep-link suggestions based on notification type
  const getDeepLinks = (n: Notification) => {
    const links: { label: string; path: string }[] = [];
    if (n.action_url) links.push({ label: "View", path: n.action_url });
    if (n.domain === "agent") links.push(DEEP_LINKS["control-panel"]);
    if (n.domain === "compliance") links.push(DEEP_LINKS["compliance"]);
    if (n.type === "system" && n.domain === "platform") links.push(DEEP_LINKS["audit-log"]);
    return links;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md border-l border-border bg-background shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Notifications</span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{unreadCount}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="rounded-lg px-2 py-1 text-[10px] text-primary hover:bg-primary/10 transition-colors">
                    Mark all read
                  </button>
                )}
                <button onClick={() => setBulkMode(!bulkMode)} className={cn("rounded-lg p-1.5 transition-colors", bulkMode ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>
                  <Filter className="h-3.5 w-3.5" />
                </button>
                <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="px-4 py-2 border-b border-border/50">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search notifications..."
                  className="w-full h-7 pl-7 pr-3 text-[11px] rounded-lg border border-border/40 bg-card/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-1 px-4 py-2 border-b border-border/50 overflow-x-auto scrollbar-thin">
              {TAB_FILTERS.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "text-[10px] px-2.5 py-1 rounded-full border whitespace-nowrap transition-all",
                    activeTab === tab.key ? "bg-primary/15 text-primary border-primary/30 font-semibold" : "border-border/30 text-muted-foreground hover:text-foreground"
                  )}
                >{tab.label}{tab.key === "unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}</button>
              ))}
            </div>

            {/* Bulk Actions Bar */}
            <AnimatePresence>
              {bulkMode && selectedIds.size > 0 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="border-b border-border/50 bg-primary/5 px-4 py-2 flex items-center gap-2"
                >
                  <span className="text-[10px] text-primary font-semibold">{selectedIds.size} selected</span>
                  <button onClick={bulkMarkRead} className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20">Mark Read</button>
                  <button onClick={bulkDismiss} className="text-[10px] px-2 py-0.5 rounded bg-destructive/10 text-destructive hover:bg-destructive/20">Dismiss</button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-5">
              {grouped.length === 0 ? (
                <div className="text-center py-12">
                  <BellOff className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No notifications</p>
                </div>
              ) : (
                grouped.map(([domain, domainItems]) => {
                  const meta = DOMAIN_META[domain] || DOMAIN_META.platform;
                  const DomainIcon = meta.icon;
                  return (
                    <div key={domain}>
                      <div className="flex items-center gap-2 mb-2">
                        <DomainIcon className={cn("h-3.5 w-3.5", meta.color)} />
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{meta.label}</span>
                        <span className="text-[9px] text-muted-foreground/50">({domainItems.length})</span>
                      </div>
                      <div className="space-y-2">
                        {domainItems.map((n) => {
                          const deepLinks = getDeepLinks(n);
                          return (
                            <motion.div
                              key={n.id}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={cn(
                                "rounded-xl border bg-card p-3 transition-all hover:shadow-card-hover group",
                                n.read && "opacity-60",
                                n.urgency === "critical" ? "border-destructive/20 bg-destructive/5" :
                                n.urgency === "high" ? "border-amber-500/15" : "border-border"
                              )}
                            >
                              <div className="flex items-start gap-2.5">
                                {bulkMode && (
                                  <input type="checkbox" checked={selectedIds.has(n.id)} onChange={() => toggleSelect(n.id)}
                                    className="mt-1 rounded border-border accent-primary" />
                                )}
                                {n.urgency === "critical" ? <AlertTriangle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" /> :
                                 n.urgency === "high" ? <Clock className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" /> :
                                 <CheckCircle className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-xs font-medium text-foreground">{n.title}</p>
                                    {!n.read && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                                  </div>
                                  {n.body && <p className="text-[11px] text-muted-foreground mt-0.5">{n.body}</p>}
                                  
                                  {/* Deep-link Actions + Time */}
                                  <div className="flex items-center justify-between mt-2 flex-wrap gap-1">
                                    <span className="text-[10px] text-muted-foreground/60">{timeAgo(n.created_at)}</span>
                                    <div className="flex items-center gap-1">
                                      {deepLinks.map((link, i) => (
                                        <button key={i} onClick={() => handleAction(link.path)}
                                          className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary hover:bg-primary/20 transition-colors">
                                          {link.label} <ArrowRight className="h-2.5 w-2.5" />
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Quick Actions (visible on hover) */}
                                  <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!n.read && (
                                      <button onClick={() => markRead(n.id)} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground">
                                        Mark read
                                      </button>
                                    )}
                                    <button onClick={() => snoozeNotification(n.id, 30)} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground">
                                      Snooze 30m
                                    </button>
                                    <button onClick={() => snoozeNotification(n.id, 60)} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground">
                                      1h
                                    </button>
                                    <button onClick={() => dismissNotification(n.id)} className="text-[9px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive hover:bg-destructive/20">
                                      Dismiss
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/** Returns the count of unread notifications for badge display */
export function useUnreadCount() {
  const { user, isDemo } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user || isDemo) { setCount(3); return; }
    fromTable("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false)
      .then(({ count: c }: any) => { if (typeof c === "number") setCount(c); });
  }, [user, isDemo]);

  useEffect(() => {
    if (!user || isDemo) return;
    const channel = supabase
      .channel("notif-count")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => {
        fromTable("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("read", false)
          .then(({ count: c }: any) => { if (typeof c === "number") setCount(c); });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, isDemo]);

  return count;
}
