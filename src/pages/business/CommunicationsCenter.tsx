import { useState, useCallback, useEffect } from "react";
import { useDraftAutosave } from "@/hooks/useDraftAutosave";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MessageSquare, Send, Plus, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { HeroCard, SummaryCard, QueueCard, TimelineCard } from "@/components/sita/cards";
import { ExecutionBadge } from "@/components/sita/badges";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { SplitWorkspace } from "@/components/sita/surfaces/SplitWorkspace";
import { AppSurface } from "@/components/sita/surfaces/AppSurface";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { ModuleAdvisorInsight } from "@/components/sita/domain-shared/ModuleAdvisorInsight";
import { cn } from "@/lib/utils";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getModuleAdaptation } from "@/domains/engines/business-module-adaptations";
import { useCommunications } from "@/hooks/use-sita-data";
import { useAuth } from "@/contexts/AuthContext";
import { useActionFn } from "@/hooks/use-action";
import { useConfirmation } from "@/hooks/use-confirmation";
import { ConfirmationDialog } from "@/components/sita/ConfirmationDialog";


type CommStatus = "draft" | "review" | "approved" | "sent" | "delivered" | "opened" | "replied" | "failed";

interface Communication {
  id: string; type: "email" | "sms" | "message"; subject: string; body: string;
  status: CommStatus; requires_approval: boolean; customer_name: string;
  created_at: string; sent_at: string | null;
}

const fallbackComms: Communication[] = [
  { id: "c1", type: "email", subject: "Quote #1042 — Website Redesign Proposal", body: "Thank you for your interest...", status: "sent", requires_approval: false, customer_name: "Sarah Chen", created_at: new Date(Date.now() - 3600000 * 4).toISOString(), sent_at: new Date(Date.now() - 3600000 * 3).toISOString() },
  { id: "c2", type: "email", subject: "Invoice #1035 — Friendly Payment Reminder", body: "Following up on Invoice #1035...", status: "draft", requires_approval: true, customer_name: "David Kim", created_at: new Date(Date.now() - 3600000 * 2).toISOString(), sent_at: null },
  { id: "c3", type: "sms", subject: "Appointment Confirmation — Tomorrow 2 PM", body: "Confirming our meeting tomorrow at 2:00 PM.", status: "delivered", requires_approval: false, customer_name: "James Rodriguez", created_at: new Date(Date.now() - 3600000 * 8).toISOString(), sent_at: new Date(Date.now() - 3600000 * 7).toISOString() },
];

const CommunicationsCenter = () => {
  const isDemoMode = false;
  const { primaryMode } = useBusinessProfile();
  const { user } = useAuth();
  const moduleConfig = getModuleAdaptation("communications", primaryMode);
  const queryClient = useQueryClient();
  const { data: dbComms = [] } = useCommunications();
  const { confirmation, confirm: confirmAction } = useConfirmation();

  const liveComms: Communication[] = dbComms.map((c: Record<string, unknown>) => {
    const channel = String(c.channel ?? "email");
    const normalizedType: "email" | "sms" | "message" =
      channel === "sms" ? "sms" : channel === "email" ? "email" : "message";
    return {
      id: String(c.id),
      type: normalizedType,
      subject: String(c.subject ?? ""),
      body: String(c.body ?? ""),
      status: ((c.status as CommStatus) ?? "draft"),
      requires_approval: Boolean(c.requires_approval),
      customer_name: String(c.contact_name ?? ""),
      created_at: String(c.created_at ?? ""),
      sent_at: (c.sent_at as string | null) ?? null,
    };
  });

  const communications = liveComms.length > 0 ? liveComms : (isDemoMode ? fallbackComms : []);
  const [tab, setTab] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  type CommForm = { type: "email" | "sms" | "letter"; subject: string; body: string; status: CommStatus; requires_approval: boolean; customer_name: string };
  const EMPTY_COMM_FORM: CommForm = { type: "email", subject: "", body: "", status: "draft", requires_approval: false, customer_name: "" };
  const { draft: commDraft, updateDraft: updateCommDraft, clearDraft: clearCommDraft } =
    useDraftAutosave<CommForm>("business:comm:new", "business");
  const [form, setForm] = useState<CommForm>(() => ({ ...EMPTY_COMM_FORM, ...commDraft }));
  useEffect(() => { updateCommDraft(form); }, [form, updateCommDraft]);

  const resetForm = useCallback(() => { setForm(EMPTY_COMM_FORM); clearCommDraft(); setShowForm(false); }, [clearCommDraft]);

  const executeComm = useActionFn("business", "communication.write", { silent: true });

  const handleSubmit = async () => {
    if (!form.subject.trim() || !user) return;
    await executeComm({ operation: "insert", data: { user_id: user.id, type: form.type, channel: form.type, subject: form.subject, body: form.body, status: form.status, contact_name: form.customer_name, direction: "outbound" } });
    toast.success("Communication created");
    queryClient.invalidateQueries({ queryKey: ["communications"] });
    resetForm();
  };

  const handleSend = async (id: string) => {
    await executeComm({ operation: "update", id, data: { status: "sent", sent_at: new Date().toISOString() } });
    queryClient.invalidateQueries({ queryKey: ["communications"] });
    toast.success("Sent!");
  };

  const handleDelete = async (id: string) => {
    await executeComm({ operation: "delete", id });
    queryClient.invalidateQueries({ queryKey: ["communications"] });
    setSelectedId(null);
    toast.success("Deleted");
  };

  const selected = communications.find(c => c.id === selectedId);
  const filtered = tab === "all" ? communications
    : tab === "drafts" ? communications.filter(c => ["draft", "review"].includes(c.status))
    : tab === "sent" ? communications.filter(c => ["sent", "delivered", "opened", "replied"].includes(c.status))
    : communications.filter(c => c.requires_approval && ["draft", "review"].includes(c.status));

  const queueItems = filtered.map(c => ({
    id: c.id,
    label: c.subject || "(No subject)",
    meta: `${c.customer_name} · ${c.type.toUpperCase()} · ${c.status}`,
    urgency: (c.requires_approval && ["draft", "review"].includes(c.status) ? "high" : c.status === "draft" ? "normal" : "low") as "high" | "normal" | "low",
    badge: <ExecutionBadge state={["sent", "delivered", "opened", "replied"].includes(c.status) ? "complete" : c.status === "review" ? "approved" : "drafted"} />,
  }));

  const timelineEvents = communications.slice(0, 6).map(c => ({
    id: c.id,
    title: `${c.customer_name}: ${c.subject}`,
    timestamp: new Date(c.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    detail: c.status,
    accentColor: ["sent", "delivered"].includes(c.status) ? "hsl(152 55% 48%)" : c.status === "draft" ? "hsl(0 0% 50%)" : "hsl(265 55% 58%)",
  }));

  const listPane = (
    <div className="p-3 space-y-3">
      <PageTruthBanner truthState={isDemoMode ? "demo" : "live"} />
      <ConfirmationDialog state={confirmation} />

      <div className="flex items-center justify-between px-1">
        <h3 className="text-[13px] font-semibold text-[hsl(0_0%_85%)]">Communications</h3>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[hsl(265_55%_58%/0.12)] hover:bg-[hsl(265_55%_58%/0.18)] text-[hsl(265_55%_68%)] text-[11px] font-medium transition-colors micro-press">
          <Plus className="h-3 w-3" /> New Message
        </button>
      </div>

      <SummaryCard
        title="Message Stats"
        kpis={[
          { label: "Review", value: String(communications.filter(c => c.status === "review").length) },
          { label: "Sent", value: String(communications.filter(c => ["sent", "delivered"].includes(c.status)).length), trend: "up" },
          { label: "Opens", value: String(communications.filter(c => c.status === "opened").length) },
          { label: "Drafts", value: String(communications.filter(c => c.status === "draft").length) },
        ]}
      />

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <AppSurface level={2} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[hsl(0_0%_85%)]">New Communication</span>
                <button onClick={resetForm} aria-label="Close" className="text-[hsl(0_0%_50%)] hover:text-[hsl(0_0%_80%)]"><X className="h-4 w-4" /></button>
              </div>
              <input className="w-full rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.04)] px-3 py-2 text-sm text-[hsl(0_0%_85%)] placeholder:text-[hsl(0_0%_40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(265_55%_58%/0.3)]" placeholder="Customer name" value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} />
              <input className="w-full rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.04)] px-3 py-2 text-sm text-[hsl(0_0%_85%)] placeholder:text-[hsl(0_0%_40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(265_55%_58%/0.3)]" placeholder="Subject" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
              <textarea className="w-full rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.04)] px-3 py-2 text-sm text-[hsl(0_0%_85%)] placeholder:text-[hsl(0_0%_40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(265_55%_58%/0.3)]" placeholder="Message body..." rows={4} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
              <div className="flex gap-2">
                <button onClick={handleSubmit} className="px-4 py-2 rounded-lg bg-[hsl(265_55%_58%)] text-foreground text-xs font-medium hover:bg-[hsl(265_55%_50%)] transition-colors micro-press">Create</button>
                <button onClick={resetForm} className="px-4 py-2 rounded-lg border border-[hsl(0_0%_100%/0.06)] text-[hsl(0_0%_60%)] text-xs hover:bg-[hsl(0_0%_100%/0.04)] transition-colors">Cancel</button>
              </div>
            </AppSurface>
          </motion.div>
        )}
      </AnimatePresence>

      <SitaTabs
        tabs={[
          { key: "all", label: "All", count: communications.length },
          { key: "drafts", label: "Drafts", count: communications.filter(c => ["draft", "review"].includes(c.status)).length },
          { key: "sent", label: "Sent", count: communications.filter(c => ["sent", "delivered", "opened", "replied"].includes(c.status)).length },
          { key: "approval", label: "Approval", count: communications.filter(c => c.requires_approval && ["draft", "review"].includes(c.status)).length },
        ]}
        active={tab}
        onChange={setTab}
      />

      <QueueCard
        title="MESSAGE QUEUE"
        items={queueItems}
        maxVisible={10}
        onItemClick={(id) => setSelectedId(id)}
      />
    </div>
  );

  const detailPane = selected ? (
    <div className="p-4 space-y-4">
      <HeroCard
        title={selected.subject || "(No subject)"}
        metric={selected.customer_name}
        subtitle={`${selected.type.toUpperCase()} · ${new Date(selected.created_at).toLocaleDateString()}`}
        accentFrom="hsl(265 55% 58%)"
        accentTo="hsl(285 50% 50%)"
      >
        <ExecutionBadge state={["sent", "delivered"].includes(selected.status) ? "complete" : "drafted"} />
      </HeroCard>

      <AppSurface level={2} className="p-4">
        <p className="text-[12px] text-[hsl(0_0%_70%)] leading-relaxed">{selected.body || "No body content"}</p>
      </AppSurface>

      <AppSurface level={2} className="p-4 space-y-2">
        <div className="flex justify-between text-[12px]">
          <span className="text-[hsl(0_0%_50%)]">Status</span>
          <span className="text-[hsl(0_0%_85%)] capitalize">{selected.status}</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-[hsl(0_0%_50%)]">Approval</span>
          <span className="text-[hsl(0_0%_85%)]">{selected.requires_approval ? "Required" : "Not required"}</span>
        </div>
        {selected.sent_at && (
          <div className="flex justify-between text-[12px]">
            <span className="text-[hsl(0_0%_50%)]">Sent</span>
            <span className="text-[hsl(0_0%_85%)]">{new Date(selected.sent_at).toLocaleString()}</span>
          </div>
        )}
      </AppSurface>

      <div className="flex gap-2">
        {["draft", "review"].includes(selected.status) && (
          <button onClick={() => handleSend(selected.id)} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[hsl(265_55%_58%)] px-3 py-2 text-xs font-medium text-foreground hover:bg-[hsl(265_55%_50%)] transition-colors micro-press">
            <Send className="h-3.5 w-3.5" /> Send
          </button>
        )}
        <button onClick={() => handleDelete(selected.id)} className="rounded-lg border border-[hsl(0_0%_100%/0.06)] px-3 py-2 text-xs text-[hsl(0_0%_50%)] hover:text-[hsl(0_70%_55%)] transition-colors micro-press">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <ModuleAdvisorInsight
        advisorName="Outreach Advisor"
        domain="business"
        insight="Messages sent before 10 AM have 28% higher open rates. Schedule your next draft for morning delivery."
        confidence={72}
        actions={[{ label: "Schedule", onClick: () => toast.info("Scheduling planned — coming in a future update") }]}
      />
    </div>
  ) : (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-2">
        <Mail className="h-8 w-8 mx-auto text-[hsl(0_0%_30%)]" />
        <p className="text-[13px] text-[hsl(0_0%_50%)]">Select a message to view</p>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-200px)] -m-4">
      <SplitWorkspace
        list={listPane}
        detail={detailPane}
        hasSelection={!!selected}
        defaultSplit={42}
      />

      {/* Timeline sidebar — visible only on wide screens */}
      {communications.length > 0 && (
        <div className="hidden xl:block fixed right-4 top-24 w-64 z-10">
          <TimelineCard title="Recent Activity" events={timelineEvents} maxVisible={5} />
        </div>
      )}
    </div>
  );
};

export default CommunicationsCenter;
