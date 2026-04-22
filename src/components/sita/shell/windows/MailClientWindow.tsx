// ═══════════════════════════════════════════════════════════════
// Nova OS — Mail Client Window App
// Three-column layout: folders, message list, reading pane
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
import { useDataMode } from "@/contexts/DataModeContext";
  Inbox, Send, FileText, Star, Trash2, Archive, Tag,
  Search, Pencil, MoreHorizontal, Paperclip, Reply, Forward,
  ChevronDown, Circle, Mail
} from "lucide-react";

interface Email {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  preview: string;
  body: string;
  date: string;
  read: boolean;
  starred: boolean;
  category: "primary" | "social" | "updates";
  hasAttachment: boolean;
}

const MOCK_EMAILS: Email[] = [
  { id: "1", from: "Sarah Chen", fromEmail: "sarah@acme.co", subject: "Q2 Revenue Report Ready", preview: "Hi, I've compiled the Q2 revenue report with all the projections we discussed...", body: "Hi,\n\nI've compiled the Q2 revenue report with all the projections we discussed in yesterday's boardroom. Key highlights:\n\n• Revenue up 18% vs Q1\n• Customer acquisition cost down 12%\n• Net retention rate at 115%\n\nThe full report is attached. Let me know if you need any adjustments before the board presentation.\n\nBest,\nSarah", date: "10:42 AM", read: false, starred: true, category: "primary", hasAttachment: true },
  { id: "2", from: "David Park", fromEmail: "david@venture.io", subject: "Partnership Proposal - Follow Up", preview: "Following up on our conversation last week about the strategic partnership...", body: "Hi,\n\nFollowing up on our conversation last week about the strategic partnership opportunity. I've reviewed the terms with our legal team and we're aligned on the key points.\n\nWould love to schedule a call this week to finalize details.\n\nCheers,\nDavid", date: "9:15 AM", read: false, starred: false, category: "primary", hasAttachment: false },
  { id: "3", from: "GitHub", fromEmail: "noreply@github.com", subject: "[nova-os] PR #342 merged", preview: "Your pull request 'Fix: window physics snap zones' has been merged into main...", body: "Pull Request #342 has been merged.\n\nFix: window physics snap zones\n\nChanges:\n- Fixed magnetic docking edge detection\n- Added velocity-based snap threshold\n- Updated test coverage to 94%\n\n3 files changed, +127 -34", date: "Yesterday", read: true, starred: false, category: "updates", hasAttachment: false },
  { id: "4", from: "LinkedIn", fromEmail: "notifications@linkedin.com", subject: "12 people viewed your profile", preview: "Your profile was viewed by people from Apple, Google, and 3 other companies...", body: "Your profile was viewed by 12 people this week.\n\nNotable viewers:\n• Senior PM at Apple\n• Engineering Lead at Google\n• CTO at Stripe\n\nVisit LinkedIn to see who's viewed your profile.", date: "Yesterday", read: true, starred: false, category: "social", hasAttachment: false },
  { id: "5", from: "Stripe", fromEmail: "payments@stripe.com", subject: "Monthly Payout: $12,450.00", preview: "Your monthly payout of $12,450.00 has been initiated to your bank account...", body: "Payout Summary\n\nAmount: $12,450.00\nPeriod: March 1-31, 2026\nStatus: Initiated\nEstimated arrival: April 3, 2026\n\nTransactions: 847\nFees: $361.05\n\nView details in your Stripe Dashboard.", date: "Mar 31", read: true, starred: true, category: "updates", hasAttachment: false },
  { id: "6", from: "Alex Rivera", fromEmail: "alex@designstudio.co", subject: "New Brand Assets Ready", preview: "Hey! The new brand assets are ready for review. I've uploaded everything to the shared folder...", body: "Hey!\n\nThe new brand assets are ready for review. I've uploaded everything to the shared folder:\n\n• Updated logo variations (SVG + PNG)\n• Color palette documentation\n• Typography guidelines\n• Icon set (200+ icons)\n\nLet me know your thoughts!\n\nAlex", date: "Mar 30", read: true, starred: false, category: "primary", hasAttachment: true },
];

const FOLDERS = [
  { id: "inbox", label: "Inbox", icon: Inbox, count: 2 },
  { id: "starred", label: "Starred", icon: Star, count: 2 },
  { id: "sent", label: "Sent", icon: Send, count: 0 },
  { id: "drafts", label: "Drafts", icon: FileText, count: 1 },
  { id: "archive", label: "Archive", icon: Archive, count: 0 },
  { id: "trash", label: "Trash", icon: Trash2, count: 0 },
];

const CATEGORIES = [
  { id: "primary", label: "Primary", color: "hsl(265 55% 58%)" },
  { id: "social", label: "Social", color: "hsl(190 60% 50%)" },
  { id: "updates", label: "Updates", color: "hsl(35 80% 55%)" },
];

export function MailClientWindow() {
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [selectedId, setSelectedId] = useState<string | null>("1");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = MOCK_EMAILS.filter(e => activeCategory ? e.category === activeCategory : true);
  const selected = MOCK_EMAILS.find(e => e.id === selectedId);

  return (
    <div className="flex h-[420px] bg-[hsl(0_0%_6%)] text-[hsl(0_0%_85%)] rounded-b-xl overflow-hidden">
      {/* Folder Sidebar */}
      <div className="w-36 border-r border-[hsl(0_0%_12%)] flex flex-col">
        {/* Compose */}
        <div className="p-2">
          <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[hsl(265_55%_55%)] hover:bg-[hsl(265_55%_60%)] text-white text-[11px] font-medium transition-colors">
            <Pencil className="h-3 w-3" /> Compose
          </button>
        </div>

        {/* Folders */}
        <div className="flex-1 p-1 space-y-0.5">
          {FOLDERS.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFolder(f.id)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] transition-colors",
                activeFolder === f.id
                  ? "bg-[hsl(265_55%_55%/0.15)] text-[hsl(0_0%_90%)]"
                  : "text-[hsl(0_0%_50%)] hover:bg-[hsl(0_0%_12%)]"
              )}
            >
              <f.icon className="h-3.5 w-3.5" />
              <span className="flex-1 text-left">{f.label}</span>
              {f.count > 0 && (
                <span className="text-[9px] bg-[hsl(265_55%_55%/0.2)] text-[hsl(265_55%_70%)] px-1.5 rounded-full">{f.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Categories */}
        <div className="p-2 border-t border-[hsl(0_0%_12%)]">
          <p className="text-[9px] text-[hsl(0_0%_35%)] uppercase tracking-wider font-semibold mb-1 px-2">Categories</p>
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(activeCategory === c.id ? null : c.id)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1 rounded text-[10px] transition-colors",
                activeCategory === c.id ? "text-[hsl(0_0%_85%)]" : "text-[hsl(0_0%_45%)] hover:text-[hsl(0_0%_65%)]"
              )}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Message List */}
      <div className="w-52 border-r border-[hsl(0_0%_12%)] flex flex-col">
        {/* Search */}
        <div className="p-2 border-b border-[hsl(0_0%_12%)]">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[hsl(0_0%_10%)] border border-[hsl(0_0%_15%)]">
            <Search className="h-3 w-3 text-[hsl(0_0%_35%)]" />
            <span className="text-[10px] text-[hsl(0_0%_30%)]">Search mail...</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {filtered.map(e => (
            <button
              key={e.id}
              onClick={() => setSelectedId(e.id)}
              className={cn(
                "w-full text-left p-3 border-b border-[hsl(0_0%_10%)] transition-colors",
                selectedId === e.id ? "bg-[hsl(265_55%_55%/0.1)]" : "hover:bg-[hsl(0_0%_8%)]"
              )}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                {!e.read && <Circle className="h-2 w-2 fill-[hsl(265_55%_60%)] text-[hsl(265_55%_60%)]" />}
                <span className={cn("text-[11px] truncate flex-1", !e.read ? "font-semibold text-[hsl(0_0%_90%)]" : "text-[hsl(0_0%_60%)]")}>{e.from}</span>
                <span className="text-[9px] text-[hsl(0_0%_35%)] shrink-0">{e.date}</span>
              </div>
              <p className={cn("text-[11px] truncate", !e.read ? "text-[hsl(0_0%_80%)]" : "text-[hsl(0_0%_50%)]")}>{e.subject}</p>
              <p className="text-[10px] text-[hsl(0_0%_35%)] truncate mt-0.5">{e.preview}</p>
              <div className="flex items-center gap-1.5 mt-1">
                {e.starred && <Star className="h-2.5 w-2.5 fill-[hsl(38_85%_58%)] text-[hsl(38_85%_58%)]" />}
                {e.hasAttachment && <Paperclip className="h-2.5 w-2.5 text-[hsl(0_0%_35%)]" />}
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: CATEGORIES.find(c => c.id === e.category)?.color }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Reading Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {selected ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-[hsl(0_0%_12%)]">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold">{selected.subject}</h3>
                <div className="flex items-center gap-1">
                  <button className="p-1 rounded hover:bg-[hsl(0_0%_15%)]"><Reply className="h-3.5 w-3.5 text-[hsl(0_0%_45%)]" /></button>
                  <button className="p-1 rounded hover:bg-[hsl(0_0%_15%)]"><Forward className="h-3.5 w-3.5 text-[hsl(0_0%_45%)]" /></button>
                  <button className="p-1 rounded hover:bg-[hsl(0_0%_15%)]"><Archive className="h-3.5 w-3.5 text-[hsl(0_0%_45%)]" /></button>
                  <button className="p-1 rounded hover:bg-[hsl(0_0%_15%)]"><Trash2 className="h-3.5 w-3.5 text-[hsl(0_0%_45%)]" /></button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(265_55%_50%)] to-[hsl(280_50%_55%)] flex items-center justify-center text-[11px] font-bold text-white">
                  {selected.from[0]}
                </div>
                <div>
                  <p className="text-[12px] font-medium">{selected.from}</p>
                  <p className="text-[10px] text-[hsl(0_0%_40%)]">{selected.fromEmail} · {selected.date}</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
              <pre className="text-[12px] text-[hsl(0_0%_70%)] whitespace-pre-wrap font-sans leading-relaxed">{selected.body}</pre>
              {selected.hasAttachment && (
                <div className="mt-4 p-3 rounded-lg border border-[hsl(0_0%_15%)] bg-[hsl(0_0%_8%)] inline-flex items-center gap-2">
                  <Paperclip className="h-3.5 w-3.5 text-[hsl(0_0%_40%)]" />
                  <span className="text-[11px] text-[hsl(0_0%_55%)]">report-q2-2026.pdf</span>
                  <span className="text-[9px] text-[hsl(0_0%_30%)]">2.4 MB</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Mail className="h-10 w-10 text-[hsl(0_0%_15%)] mx-auto mb-2" />
              <p className="text-[12px] text-[hsl(0_0%_30%)]">Select a message to read</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
