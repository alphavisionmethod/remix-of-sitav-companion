import { MobileShell } from "@/platform/experience/components/mobile/MobileShell";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Star, Archive, Inbox, Mail, MessageSquare, Bell,
  Sparkles, ChevronRight, Clock, Paperclip, Send, Plus,
  StarOff, ArchiveRestore, Check, Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

type InboxTab = "primary" | "social" | "updates";
type ChannelType = "email" | "sms" | "system";

interface InboxThread {
  id: string;
  from: string;
  avatar: string;
  avatarColor: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
  starred: boolean;
  archived: boolean;
  channel: ChannelType;
  category: InboxTab;
  hasAttachment: boolean;
  messageCount: number;
  aiSuggestion?: string;
}

const channelIcons: Record<ChannelType, { icon: any; label: string }> = {
  email: { icon: Mail, label: "Email" },
  sms: { icon: MessageSquare, label: "SMS" },
  system: { icon: Bell, label: "System" },
};

const threads: InboxThread[] = [
  { id: "i1", from: "Legal Team", avatar: "LT", avatarColor: "bg-violet-500/20 text-violet-400", subject: "Contract review — Q4 vendor agreement", preview: "Please review the attached vendor agreement for Q4. Key changes include revised payment terms and updated liability clauses...", time: "9:14 AM", unread: true, starred: false, archived: false, channel: "email", category: "primary", hasAttachment: true, messageCount: 3, aiSuggestion: "Review and approve contract" },
  { id: "i2", from: "Finance Bot", avatar: "FB", avatarColor: "bg-emerald-500/20 text-emerald-400", subject: "Monthly P&L report ready", preview: "Your monthly profit & loss statement for March 2026 has been generated. Revenue up 12% MoM, expenses down 3%...", time: "8:30 AM", unread: true, starred: true, archived: false, channel: "system", category: "primary", hasAttachment: true, messageCount: 1 },
  { id: "i3", from: "Sarah Chen", avatar: "SC", avatarColor: "bg-blue-500/20 text-blue-400", subject: "Re: Board meeting prep", preview: "I've updated the slide deck with the latest metrics. Slide 14 needs your input on the expansion timeline...", time: "Yesterday", unread: false, starred: false, archived: false, channel: "email", category: "primary", hasAttachment: true, messageCount: 7 },
  { id: "i4", from: "SITA Security", avatar: "SS", avatarColor: "bg-red-500/20 text-red-400", subject: "Weekly security digest", preview: "0 critical alerts, 2 warnings resolved, 1 new policy recommendation. Full report attached...", time: "Yesterday", unread: false, starred: false, archived: false, channel: "system", category: "updates", hasAttachment: false, messageCount: 1 },
  { id: "i5", from: "Marcus Rivera", avatar: "MR", avatarColor: "bg-amber-500/20 text-amber-400", subject: "Lunch Thursday?", preview: "Hey, are you free Thursday for lunch? Want to catch up on the new project scope and timeline...", time: "Yesterday", unread: false, starred: false, archived: false, channel: "sms", category: "social", hasAttachment: false, messageCount: 4 },
  { id: "i6", from: "Sync Service", avatar: "SY", avatarColor: "bg-blue-500/20 text-blue-400", subject: "Sync report — all devices current", preview: "Daily sync report: 4 devices, 847 items synced, 0 conflicts. Next scheduled sync in 6 hours...", time: "2 days ago", unread: false, starred: false, archived: false, channel: "system", category: "updates", hasAttachment: false, messageCount: 1 },
  { id: "i7", from: "Product Team", avatar: "PT", avatarColor: "bg-pink-500/20 text-pink-400", subject: "Sprint retrospective notes", preview: "Here are the action items from yesterday's retro. Please add your feedback by EOD Friday...", time: "2 days ago", unread: false, starred: false, archived: false, channel: "email", category: "social", hasAttachment: false, messageCount: 2 },
];

const MobileInbox = () => {
  const [tab, setTab] = useState<InboxTab>("primary");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState(threads);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAIQueue, setShowAIQueue] = useState(false);

  const filtered = items.filter((t) => {
    if (t.archived) return false;
    if (t.category !== tab) return false;
    if (search && !t.subject.toLowerCase().includes(search.toLowerCase()) && !t.from.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const aiItems = items.filter((t) => t.aiSuggestion && !t.archived);
  const tabCounts = {
    primary: items.filter((t) => t.category === "primary" && !t.archived && t.unread).length,
    social: items.filter((t) => t.category === "social" && !t.archived && t.unread).length,
    updates: items.filter((t) => t.category === "updates" && !t.archived && t.unread).length,
  };

  const toggleStar = (id: string) => setItems((prev) => prev.map((t) => t.id === id ? { ...t, starred: !t.starred } : t));
  const archiveItem = (id: string) => setItems((prev) => prev.map((t) => t.id === id ? { ...t, archived: true } : t));

  const selected = items.find((t) => t.id === selectedId);

  return (
    <MobileShell title="Inbox">
      <div className="mb-2"><PageTruthBanner truthState="partial" /></div>
      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-card px-3 py-2 mb-3">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search messages..."
          className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {(["primary", "social", "updates"] as const).map((t) => (
          <button key={t} onClick={() => { setTab(t); setSelectedId(null); }} className={cn(
            "flex-1 py-1.5 rounded-full text-[11px] font-medium transition-colors capitalize text-center",
            tab === t ? "bg-primary/20 text-primary" : "text-muted-foreground"
          )}>
            {t}{tabCounts[t] > 0 && <span className="ml-1 text-[9px]">({tabCounts[t]})</span>}
          </button>
        ))}
      </div>

      {/* AI Queue Toggle */}
      {aiItems.length > 0 && (
        <button onClick={() => setShowAIQueue(!showAIQueue)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-primary/20 bg-primary/5 mb-3 transition-colors hover:bg-primary/10">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-medium text-primary">AI Action Queue</span>
          <span className="text-[9px] text-primary/70 ml-auto">{aiItems.length} suggestions</span>
          <ChevronRight className={cn("h-3 w-3 text-primary transition-transform", showAIQueue && "rotate-90")} />
        </button>
      )}

      <AnimatePresence>
        {showAIQueue && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-3">
            <div className="space-y-1.5">
              {aiItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/15 bg-card">
                  <Sparkles className="h-3 w-3 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium truncate">{item.subject}</p>
                    <p className="text-[9px] text-primary">{item.aiSuggestion}</p>
                  </div>
                  <button className="px-2 py-0.5 rounded text-[9px] font-medium bg-primary/15 text-primary">Act</button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thread Detail */}
      {selected ? (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <button onClick={() => setSelectedId(null)} className="text-[11px] text-primary mb-3 flex items-center gap-1">
            ← Back to inbox
          </button>
          <div className="rounded-xl border border-border/40 bg-card p-4 mb-3">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold", selected.avatarColor)}>
                {selected.avatar}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{selected.from}</p>
                <p className="text-[10px] text-muted-foreground">{selected.time}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => toggleStar(selected.id)} className="p-1.5 rounded-lg hover:bg-muted/50">
                  <Star className={cn("h-4 w-4", selected.starred ? "text-amber-400 fill-amber-400" : "text-muted-foreground")} />
                </button>
                <button onClick={() => { archiveItem(selected.id); setSelectedId(null); }} className="p-1.5 rounded-lg hover:bg-muted/50">
                  <Archive className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>
            <h3 className="text-sm font-semibold mb-2">{selected.subject}</h3>
            {selected.hasAttachment && (
              <div className="flex items-center gap-1.5 mb-3 px-2 py-1.5 rounded-lg bg-muted/30 w-fit">
                <Paperclip className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">1 attachment</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground leading-relaxed">{selected.preview}</p>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-border/40 bg-card/50 px-3 py-2">
              <input placeholder="Reply..." className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground" />
              <button className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center">
                <Send className="h-3.5 w-3.5 text-primary" />
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Thread List */
        <div className="space-y-1.5">
          <AnimatePresence>
            {filtered.map((thread, i) => {
              const CI = channelIcons[thread.channel].icon;
              return (
                <motion.button
                  key={thread.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedId(thread.id)}
                  className={cn(
                    "w-full flex items-start gap-3 rounded-xl border border-border/40 bg-card p-3 text-left hover:bg-muted/30 transition-colors",
                    thread.unread && "ring-1 ring-primary/15"
                  )}
                >
                  <div className={cn("h-9 w-9 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0", thread.avatarColor)}>
                    {thread.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={cn("text-xs font-medium truncate", thread.unread && "font-semibold")}>{thread.from}</p>
                      {thread.starred && <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400 shrink-0" />}
                      <CI className="h-2.5 w-2.5 text-muted-foreground shrink-0 ml-auto" />
                    </div>
                    <p className={cn("text-[11px] truncate mt-0.5", thread.unread ? "text-foreground" : "text-muted-foreground")}>{thread.subject}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <p className="text-[10px] text-muted-foreground truncate flex-1">{thread.preview.slice(0, 60)}...</p>
                      <span className="text-[9px] text-muted-foreground whitespace-nowrap">{thread.time}</span>
                    </div>
                    {thread.hasAttachment && (
                      <div className="flex items-center gap-1 mt-1">
                        <Paperclip className="h-2.5 w-2.5 text-muted-foreground" />
                        <span className="text-[9px] text-muted-foreground">Attachment</span>
                      </div>
                    )}
                  </div>
                  {thread.unread && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Compose FAB */}
      <button className="fixed bottom-24 right-4 h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-lg z-40">
        <Plus className="h-5 w-5 text-primary-foreground" />
      </button>
    </MobileShell>
  );
};

export default MobileInbox;
