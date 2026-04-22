import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Mail, MessageSquare, Phone, Clock, ArrowRight, AlertCircle, CheckCircle2,
  Search, Star, Archive, Trash2, Bell, Send, Paperclip, MoreHorizontal,
  Reply, Forward, ChevronDown, Filter, Inbox, Tag, CalendarClock,
  StarOff, MailOpen, Users, ShoppingBag, Megaphone, ArrowLeft
} from "lucide-react";

interface Message {
  id: string;
  from: string;
  email: string;
  avatar: string;
  subject: string;
  preview: string;
  body: string;
  channel: 'email' | 'message' | 'call' | 'system';
  category: 'primary' | 'social' | 'updates' | 'promotions';
  time: string;
  date: string;
  priority: 'high' | 'normal' | 'low';
  starred: boolean;
  read: boolean;
  hasAttachment: boolean;
  attachments?: { name: string; size: string; type: string }[];
  threadCount?: number;
  labels?: string[];
  needsFollowUp: boolean;
  followUpDate?: string;
}

const MESSAGES: Message[] = [
  { id: '1', from: 'Sarah Chen', email: 'sarah@techflow.io', avatar: 'SC', subject: 'Q3 Proposal — Final Revisions Needed', preview: 'Hi, I\'ve reviewed the latest draft and have a few critical changes...', body: 'Hi,\n\nI\'ve reviewed the latest draft of the Q3 proposal and have a few critical changes that need to be addressed before we can submit to the board.\n\n1. Revenue projections need to be updated with the new partnership numbers\n2. The competitive analysis section should include the recent market entrants\n3. Timeline on page 12 needs to reflect the revised launch date\n\nCan you have these ready by Thursday? The board meeting is next Monday.\n\nBest,\nSarah', channel: 'email', category: 'primary', time: '10 min ago', date: '2026-04-14', priority: 'high', starred: true, read: false, hasAttachment: true, attachments: [{ name: 'Q3_Proposal_v3.pdf', size: '2.4 MB', type: 'pdf' }, { name: 'Revenue_Model.xlsx', size: '840 KB', type: 'xlsx' }], threadCount: 4, labels: ['Business', 'Urgent'], needsFollowUp: true, followUpDate: '2026-04-17' },
  { id: '2', from: 'Mike Torres', email: 'mike@acmecorp.com', avatar: 'MT', subject: 'Meeting Rescheduled to Thursday 2pm', preview: 'Hey, I need to move our sync to Thursday at 2pm EST...', body: 'Hey,\n\nI need to move our sync to Thursday at 2pm EST instead of Wednesday. Something came up with the product launch timeline.\n\nSame agenda — we\'ll cover the integration milestones and API contract review.\n\nLet me know if that works for you.\n\nCheers,\nMike', channel: 'email', category: 'primary', time: '1 hr ago', date: '2026-04-14', priority: 'normal', starred: false, read: true, hasAttachment: false, threadCount: 2, labels: ['Business'], needsFollowUp: false },
  { id: '3', from: 'Family Group', email: '', avatar: 'FG', subject: 'Weekend Plans 🏕️', preview: 'Mom: How about we do the lake house this weekend?', body: 'Mom: How about we do the lake house this weekend? The weather looks perfect!\n\nDad: I\'m in. Should I bring the grill?\n\nSister: Yes! Can we also do kayaking this time?\n\nMom: Absolutely. Everyone bring sunscreen. Leaving Saturday at 9am.', channel: 'message', category: 'social', time: '2 hrs ago', date: '2026-04-14', priority: 'normal', starred: false, read: false, hasAttachment: false, threadCount: 8, labels: ['Family'], needsFollowUp: false },
  { id: '4', from: 'Acme Corp Billing', email: 'billing@acmecorp.com', avatar: 'AC', subject: 'Invoice #4521 — Payment Confirmed', preview: 'Your payment of $12,450.00 has been received and processed...', body: 'Dear Valued Customer,\n\nWe\'re writing to confirm that your payment for Invoice #4521 has been successfully processed.\n\nAmount: $12,450.00\nDate: April 14, 2026\nMethod: ACH Transfer\nReference: TXN-8847-QR21\n\nA receipt has been attached for your records.\n\nThank you for your prompt payment.\n\nAccounts Receivable\nAcme Corporation', channel: 'email', category: 'updates', time: '3 hrs ago', date: '2026-04-14', priority: 'normal', starred: false, read: true, hasAttachment: true, attachments: [{ name: 'Receipt_4521.pdf', size: '120 KB', type: 'pdf' }], needsFollowUp: false },
  { id: '5', from: 'Dr. Williams Office', email: 'office@drwilliams.com', avatar: 'DW', subject: 'Appointment Reminder — April 18', preview: 'This is a reminder of your upcoming appointment on April 18...', body: 'Dear Patient,\n\nThis is a friendly reminder of your upcoming appointment:\n\nDate: April 18, 2026\nTime: 10:30 AM\nDoctor: Dr. Emily Williams\nLocation: 425 Medical Center Dr, Suite 200\n\nPlease arrive 15 minutes early and bring your insurance card.\n\nTo reschedule, please call (555) 234-5678.\n\nThank you,\nDr. Williams\' Office', channel: 'email', category: 'updates', time: 'Yesterday', date: '2026-04-13', priority: 'normal', starred: false, read: true, hasAttachment: false, labels: ['Health'], needsFollowUp: true, followUpDate: '2026-04-18' },
  { id: '6', from: 'GitHub', email: 'notifications@github.com', avatar: 'GH', subject: '[sita-os/core] PR #847 merged', preview: 'Your pull request "feat: add crashd daemon" has been merged...', body: 'Pull Request #847 has been merged into main.\n\nTitle: feat: add crashd daemon\nAuthor: @yourusername\nReviewers: @reviewer1, @reviewer2\nFiles changed: 8\nAdditions: +420\nDeletions: -12\n\nCI/CD pipeline triggered. Deployment expected in ~5 minutes.', channel: 'system', category: 'updates', time: 'Yesterday', date: '2026-04-13', priority: 'low', starred: false, read: true, hasAttachment: false, needsFollowUp: false },
  { id: '7', from: 'AWS Billing', email: 'billing@aws.amazon.com', avatar: 'AW', subject: 'Your April bill is ready — $520.14', preview: 'Your AWS bill for the current billing period is now available...', body: 'Your AWS bill for April 2026 is now available.\n\nTotal: $520.14\nPrevious month: $380.22\nChange: +$139.92 (+36.8%)\n\nTop services:\n• EC2: $210.40\n• RDS: $142.30\n• S3: $85.20\n• Lambda: $42.10\n• Other: $40.14\n\nView detailed breakdown in your AWS Console.', channel: 'email', category: 'updates', time: '2 days ago', date: '2026-04-12', priority: 'high', starred: true, read: false, hasAttachment: false, labels: ['Finance', 'Alert'], needsFollowUp: true },
  { id: '8', from: 'LinkedIn', email: 'notifications@linkedin.com', avatar: 'LI', subject: '5 people viewed your profile this week', preview: 'See who\'s been looking at your profile and new job recommendations...', body: 'Weekly Profile Update\n\nProfile views: 5 this week (+2 from last week)\nSearch appearances: 12\n\nPeople who viewed your profile:\n• VP Engineering at TechCorp\n• CTO at StartupXYZ\n• Recruiter at BigTech\n\nJobs you might be interested in:\n• Senior Architect at CloudCo\n• Principal Engineer at ScaleTech', channel: 'email', category: 'social', time: '2 days ago', date: '2026-04-12', priority: 'low', starred: false, read: true, hasAttachment: false, needsFollowUp: false },
  { id: '9', from: 'Stripe', email: 'notifications@stripe.com', avatar: 'ST', subject: 'New subscription: Pro Plan — $49/mo', preview: 'A new customer has subscribed to your Pro Plan...', body: 'New Subscription\n\nCustomer: TechFlow Inc.\nPlan: Pro Plan\nAmount: $49.00/month\nStart date: April 14, 2026\nPayment method: Visa ending 4242\n\nMRR impact: +$49.00\nTotal active subscriptions: 127', channel: 'system', category: 'updates', time: '3 days ago', date: '2026-04-11', priority: 'normal', starred: false, read: true, hasAttachment: false, labels: ['Revenue'], needsFollowUp: false },
  { id: '10', from: 'ProductHunt', email: 'digest@producthunt.com', avatar: 'PH', subject: 'Today\'s top products you might like', preview: 'Check out the hottest launches: AI Code Review, DataViz Pro...', body: 'Today\'s Top Products:\n\n🥇 AI Code Review — Automated PR reviews with GPT-5\n🥈 DataViz Pro — Beautiful charts in seconds\n🥉 DesignOS — AI-powered design system builder\n\nTrending in Developer Tools:\n• APIForge — Generate SDKs from OpenAPI specs\n• TestPilot — AI-powered test generation', channel: 'email', category: 'promotions', time: '3 days ago', date: '2026-04-11', priority: 'low', starred: false, read: true, hasAttachment: false, needsFollowUp: false },
];

const channelIcon = (ch: string) => {
  if (ch === 'message') return <MessageSquare className="h-4 w-4 text-blue-500" />;
  if (ch === 'call') return <Phone className="h-4 w-4 text-emerald-500" />;
  if (ch === 'system') return <Bell className="h-4 w-4 text-purple-500" />;
  return <Mail className="h-4 w-4 text-muted-foreground" />;
};

const categoryIcon = (cat: string) => {
  if (cat === 'social') return <Users className="h-3 w-3" />;
  if (cat === 'updates') return <Bell className="h-3 w-3" />;
  if (cat === 'promotions') return <Megaphone className="h-3 w-3" />;
  return <Inbox className="h-3 w-3" />;
};

const categoryColor = (cat: string) => {
  if (cat === 'social') return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  if (cat === 'updates') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  if (cat === 'promotions') return 'text-pink-400 bg-pink-500/10 border-pink-500/20';
  return 'text-foreground bg-primary/10 border-primary/20';
};

const avatarColors = ['bg-gradient-to-br from-purple-500 to-pink-500', 'bg-gradient-to-br from-blue-500 to-cyan-500', 'bg-gradient-to-br from-emerald-500 to-teal-500', 'bg-gradient-to-br from-amber-500 to-orange-500', 'bg-gradient-to-br from-red-500 to-rose-500'];

const CommunicationInbox = () => {
  const [messages, setMessages] = useState(MESSAGES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const selected = messages.find(m => m.id === selectedId);
  const followUps = messages.filter(m => m.needsFollowUp);
  const unreadCount = messages.filter(m => !m.read).length;

  const filtered = messages.filter(m => {
    if (tab === 'starred') return m.starred;
    if (tab === 'follow-up') return m.needsFollowUp;
    if (tab === 'unread') return !m.read;
    if (categoryFilter) return m.category === categoryFilter;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return m.from.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q) || m.preview.toLowerCase().includes(q);
    }
    return true;
  });

  const toggleStar = (id: string) => setMessages(msgs => msgs.map(m => m.id === id ? { ...m, starred: !m.starred } : m));
  const markRead = (id: string) => setMessages(msgs => msgs.map(m => m.id === id ? { ...m, read: true } : m));
  const archiveMsg = (id: string) => { setMessages(msgs => msgs.filter(m => m.id !== id)); if (selectedId === id) setSelectedId(null); };

  const handleSelect = (id: string) => { setSelectedId(id); markRead(id); };

  const channelCounts = { email: messages.filter(m => m.channel === 'email').length, message: messages.filter(m => m.channel === 'message').length, system: messages.filter(m => m.channel === 'system').length };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border/30 bg-card/30 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">Inbox</h1>
              <p className="text-[11px] text-muted-foreground">{unreadCount} unread · {followUps.length} follow-ups</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {['email', 'message', 'system'].map(ch => (
              <div key={ch} className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50 text-[10px] text-muted-foreground">
                {channelIcon(ch)}
                <span>{channelCounts[ch as keyof typeof channelCounts]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search messages, contacts, or topics..." className="pl-9 h-8 text-xs bg-muted/30 border-border/30" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>

        {/* Category pills */}
        <div className="flex gap-1.5 mb-2">
          {[null, 'primary', 'social', 'updates', 'promotions'].map(cat => (
            <button key={cat || 'all'} onClick={() => setCategoryFilter(cat)} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors border ${categoryFilter === cat ? 'bg-primary/20 text-primary border-primary/30' : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50'}`}>
              {cat ? categoryIcon(cat) : <Inbox className="h-3 w-3" />}
              {cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : 'All'}
            </button>
          ))}
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-7 bg-muted/30 p-0.5">
            <TabsTrigger value="all" className="text-[10px] h-6 px-2.5">All</TabsTrigger>
            <TabsTrigger value="unread" className="text-[10px] h-6 px-2.5">Unread {unreadCount > 0 && <Badge className="ml-1 h-4 px-1 text-[8px] bg-primary/20 text-primary">{unreadCount}</Badge>}</TabsTrigger>
            <TabsTrigger value="starred" className="text-[10px] h-6 px-2.5">Starred</TabsTrigger>
            <TabsTrigger value="follow-up" className="text-[10px] h-6 px-2.5">Follow-Up</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content area */}
      <div className="flex-1 flex min-h-0">
        {/* Message list */}
        <div className={`${selected ? 'hidden md:flex' : 'flex'} flex-col flex-1 md:max-w-md md:border-r border-border/20 overflow-y-auto`}>
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="p-4 rounded-2xl bg-muted/30 mb-3"><Inbox className="h-8 w-8 text-muted-foreground/50" /></div>
                <p className="text-sm font-medium text-muted-foreground">No messages</p>
                <p className="text-[11px] text-muted-foreground/60 mt-1">Messages matching your filter will appear here</p>
              </div>
            ) : filtered.map((msg, i) => (
              <motion.div key={msg.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -50 }} transition={{ delay: i * 0.02 }}>
                <div onClick={() => handleSelect(msg.id)} className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-border/10 ${selectedId === msg.id ? 'bg-primary/5' : msg.read ? 'hover:bg-muted/20' : 'bg-muted/10 hover:bg-muted/30'}`}>
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-full ${avatarColors[msg.from.charCodeAt(0) % avatarColors.length]} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-[11px] font-bold text-foreground">{msg.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className={`text-xs truncate ${msg.read ? 'text-foreground' : 'text-foreground font-semibold'}`}>{msg.from}</p>
                        {msg.priority === 'high' && <AlertCircle className="h-3 w-3 text-amber-500 flex-shrink-0" />}
                      </div>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">{msg.time}</span>
                    </div>
                    <p className={`text-[11px] truncate mt-0.5 ${msg.read ? 'text-foreground/80' : 'text-foreground font-medium'}`}>{msg.subject}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <p className="text-[10px] text-muted-foreground truncate flex-1">{msg.preview}</p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {msg.hasAttachment && <Paperclip className="h-2.5 w-2.5 text-muted-foreground" />}
                        {msg.threadCount && msg.threadCount > 1 && <span className="text-[9px] text-muted-foreground bg-muted/50 px-1 rounded">{msg.threadCount}</span>}
                        {msg.labels?.map(l => <span key={l} className="text-[8px] px-1 py-0.5 rounded bg-primary/10 text-primary">{l}</span>)}
                      </div>
                    </div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); toggleStar(msg.id); }} className="flex-shrink-0 mt-0.5">
                    <Star className={`h-3.5 w-3.5 ${msg.starred ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30 hover:text-muted-foreground'}`} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Detail pane */}
        <div className={`${selected ? 'flex' : 'hidden md:flex'} flex-col flex-1 min-w-0`}>
          {selected ? (
            <div className="flex flex-col h-full">
              {/* Detail header */}
              <div className="px-4 py-3 border-b border-border/20 bg-card/20">
                <div className="flex items-center gap-2 mb-2">
                  <Button variant="ghost" size="icon" className="h-7 w-7 md:hidden" onClick={() => setSelectedId(null)}><ArrowLeft className="h-4 w-4" /></Button>
                  <div className={`w-8 h-8 rounded-full ${avatarColors[selected.from.charCodeAt(0) % avatarColors.length]} flex items-center justify-center`}>
                    <span className="text-[10px] font-bold text-foreground">{selected.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{selected.from}</p>
                    <p className="text-[10px] text-muted-foreground">{selected.email || 'Group message'}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge className={`text-[9px] ${categoryColor(selected.category)}`}>{selected.category}</Badge>
                    {channelIcon(selected.channel)}
                  </div>
                </div>
                <h2 className="text-sm font-semibold text-foreground">{selected.subject}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{selected.date} · {selected.time}</span>
                  {selected.needsFollowUp && <Badge variant="outline" className="text-[9px] border-amber-500/30 text-amber-400"><CalendarClock className="h-2.5 w-2.5 mr-1" />Follow-up {selected.followUpDate}</Badge>}
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="bg-muted/10 rounded-xl p-4 border border-border/10">
                  <pre className="text-xs text-foreground/90 whitespace-pre-wrap font-sans leading-relaxed">{selected.body}</pre>
                </div>

                {/* Attachments */}
                {selected.attachments && selected.attachments.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Attachments ({selected.attachments.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.attachments.map(att => (
                        <div key={att.name} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/20 border border-border/20 hover:bg-muted/30 transition-colors cursor-pointer">
                          <Paperclip className="h-3.5 w-3.5 text-primary" />
                          <div>
                            <p className="text-[11px] font-medium text-foreground">{att.name}</p>
                            <p className="text-[9px] text-muted-foreground">{att.size}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action bar */}
              <div className="px-4 py-3 border-t border-border/20 bg-card/20">
                <div className="flex items-center gap-2">
                  <Button size="sm" className="text-xs flex-1 md:flex-none"><Reply className="h-3.5 w-3.5 mr-1" />Reply</Button>
                  <Button variant="outline" size="sm" className="text-xs"><Forward className="h-3.5 w-3.5 mr-1" />Forward</Button>
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => archiveMsg(selected.id)}><Archive className="h-3.5 w-3.5 mr-1" />Archive</Button>
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => toggleStar(selected.id)}>
                    {selected.starred ? <StarOff className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => archiveMsg(selected.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="relative mb-4">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-border/20">
                  <Mail className="h-12 w-12 text-primary/40" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-primary">{unreadCount}</span>
                </div>
              </div>
              <p className="text-sm font-medium text-foreground">Select a message</p>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">Click on a conversation to read the full message and take action</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunicationInbox;
