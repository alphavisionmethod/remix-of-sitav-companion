import { useAction } from "@/hooks/use-action";
import { SitaPageHeader, SitaCard, SitaButton } from "@/components/sita/SitaCard";
import { useInboxItems } from "@/hooks/use-domain-data";
import { KPITile, SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { StateBadge } from "@/components/sita/StateBadge";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGlobalSearch } from "@/platform/search";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Inbox, FileText, Receipt, Camera, Mic, StickyNote, Mail, Clock,
  CheckCircle, ArrowRight, Sparkles, DollarSign, Send
} from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const typeIcons: Record<string, typeof FileText> = {
  note: StickyNote, receipt: Receipt, screenshot: Camera, voice: Mic,
  email: Mail, idea: Sparkles, reminder: Clock, bill: DollarSign,
};

const routeColors: Record<string, string> = {
  Business: "text-primary bg-primary/10", Money: "text-accent bg-accent/10",
  Concierge: "text-trust-safe bg-trust-safe/10",
};

const InboxCapture = () => {
  const { data: inboxData = [] } = useInboxItems();

  const location = useLocation();
  const navigate = useNavigate();
  const { user , isDemo} = useAuth();
  const qc = useQueryClient();
  const [quickInput, setQuickInput] = useState("");
  // Phase T: federated search across all domains for capture matching.
  const { results: federatedMatches, search: searchAll, clearResults: clearFederated } = useGlobalSearch();
  useEffect(() => {
    const t = setTimeout(() => {
      if (quickInput.trim().length >= 2) searchAll(quickInput);
      else clearFederated();
    }, 250);
    return () => clearTimeout(t);
  }, [quickInput, searchAll, clearFederated]);

  const activeTab = (() => {
    if (location.pathname.includes("/processed")) return "processed";
    if (location.pathname.includes("/review")) return "review";
    return "all";
  })();

  // Live file metadata as inbox items
  const { data: liveFiles = [] } = useQuery({
    queryKey: ["inbox_files", user?.id],
    enabled: !!user && !isDemoMode,
    queryFn: async () => {
      const { data, error } = await fromTable("file_metadata").select("*").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
  });

  const captureNote = useAction("system", "inbox.capture");

  const liveItems = liveFiles.map(f => ({
    id: f.id,
    type: f.classification || "file",
    content: f.filename,
    source: f.mime_type || "upload",
    status: f.status === "uploaded" ? "new" : f.status === "processing" ? "processing" : f.status === "classified" ? "classified" : "routed",
    routed_to: f.classification ? f.classification.charAt(0).toUpperCase() + f.classification.slice(1) : undefined,
    time: new Date(f.created_at).toLocaleString(),
    confidence: undefined as number | undefined,
  }));

  const items = isDemoMode ? inboxData : liveItems;
  const filtered = activeTab === "all" ? items
    : activeTab === "processed" ? items.filter(i => ["classified", "routed"].includes(i.status))
    : items.filter(i => i.status === "new" || i.status === "processing");

  return (
    <motion.div className="mx-auto max-w-5xl space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
<SitaPageHeader title="Universal Inbox" subtitle="Capture anything — SITA classifies and routes it automatically" />

      <SitaCard hover={false} glow className="p-4">
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Type a note, paste a receipt, drop an idea..."
            value={quickInput}
            onChange={e => setQuickInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && quickInput.trim()) captureNote.mutate({ content: quickInput, type: "note" }); }}
          />
          <SitaButton variant="primary" onClick={() => { if (quickInput.trim()) captureNote.mutate({ content: quickInput, type: "note" }); }}><Send className="h-4 w-4" /> Capture</SitaButton>
        </div>
        <div className="flex gap-2 mt-3">
          {[
            { icon: Camera, label: "Photo" },
            { icon: Mic, label: "Voice" },
            { icon: Receipt, label: "Receipt" },
            { icon: Mail, label: "Forward" },
            { icon: StickyNote, label: "Note" },
          ].map((a, i) => (
            <button key={i} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
              <a.icon className="h-3.5 w-3.5" /> {a.label}
            </button>
          ))}
        </div>
      </SitaCard>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="New Items" value={items.filter(i => i.status === "new").length} icon={Inbox} />
        <KPITile label="Processing" value={items.filter(i => i.status === "processing").length} icon={Clock} sub="AI classifying" />
        <KPITile label="Routed" value={items.filter(i => i.status === "routed").length} icon={ArrowRight} sub="Auto-sorted" />
        <KPITile label="Total" value={items.length} trend="up" icon={CheckCircle} />
      </div>

      <SitaTabs
        tabs={[
          { key: "all", label: "All", count: items.length },
          { key: "processed", label: "Processed", count: items.filter(i => ["classified", "routed"].includes(i.status)).length },
          { key: "review", label: "Needs Review", count: items.filter(i => i.status === "new" || i.status === "processing").length },
        ]}
        active={activeTab}
        onChange={k => {
          if (k === "all") navigate("/inbox");
          else navigate(`/inbox/${k === "processed" ? "processed" : "review"}`);
        }}
      />

      {filtered.length === 0 ? (
        <EmptyState icon={Inbox} title="No items" description="Capture notes, receipts, voice memos, or emails — SITA will classify and route them." />
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const Icon = typeIcons[item.type] || FileText;
            return (
              <SitaCard key={item.id} className="p-4" lane={item.status === "new" ? "action" : item.routed_to ? "opportunity" : undefined}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="rounded-lg bg-secondary p-2 shrink-0"><Icon className="h-4 w-4 text-foreground" /></div>
                    <div className="min-w-0">
                      <p className="text-sm text-foreground">{item.content}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[11px] text-muted-foreground">{item.source}</span>
                        <span className="text-[11px] text-muted-foreground">· {item.time}</span>
                        {item.routed_to && (
                          <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-px text-[10px] font-medium ${routeColors[item.routed_to] || "text-muted-foreground bg-secondary"}`}>
                            → {item.routed_to}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.confidence && <span className="text-[10px] text-muted-foreground">{item.confidence}%</span>}
                    <StateBadge state={
                      item.status === "new" ? "proposed" :
                      item.status === "processing" ? "executing" :
                      item.status === "classified" ? "completed" :
                      item.status === "routed" ? "verified" : "proposed"
                    } size="sm" />
                  </div>
                </div>
              </SitaCard>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default InboxCapture;
