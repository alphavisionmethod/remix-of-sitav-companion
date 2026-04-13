import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MessageSquare, Send, Eye, Edit, Plus, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { HeroCard, ActionCard, TimelineCard, SummaryCard } from "@/components/sita/cards";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { SitaCard, SitaCardTitle, SitaButton } from "@/components/sita/SitaCard";
import { SITA_TYPE } from "@/lib/design-system/sita-design-tokens";
import { cn } from "@/lib/utils";
import { useCommunications } from "@/hooks/use-sita-data";
import { useDataMode } from "@/contexts/DataModeContext";
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
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: dbComms = [] } = useCommunications();
  const { confirmation, confirm: confirmAction } = useConfirmation();

  const liveComms: Communication[] = dbComms.map((c: Record<string, any>) => ({
    id: c.id, type: (c.channel || "email") as any, subject: c.subject || "",
    body: c.body || "", status: (c.status || "draft") as CommStatus,
    requires_approval: c.requires_approval || false,
    customer_name: c.contact_name || "", created_at: c.created_at, sent_at: c.sent_at || null,
  }));

  const communications = liveComms.length > 0 ? liveComms : (isDemoMode ? fallbackComms : []);
  const [tab, setTab] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "email" as any, subject: "", body: "", status: "draft" as CommStatus, requires_approval: false, customer_name: "" });

  const resetForm = useCallback(() => { setForm({ type: "email", subject: "", body: "", status: "draft", requires_approval: false, customer_name: "" }); setShowForm(false); }, []);

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

  // Timeline events from communications
  const timelineEvents = communications.slice(0, 6).map(c => ({
    id: c.id,
    title: `${c.customer_name}: ${c.subject}`,
    timestamp: new Date(c.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    detail: c.status,
    accentColor: c.status === "sent" || c.status === "delivered" ? "hsl(152 55% 48%)" : c.status === "draft" ? "hsl(0 0% 50%)" : "hsl(265 55% 58%)",
  }));

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <PageTruthBanner truthState={isDemoMode ? "demo" : "live"} />
      <ConfirmationDialog state={confirmation} />

      <HeroCard
        title="Communications"
        metric={`${communications.length} messages`}
        subtitle="Drafts, outreach, and message tracking"
        icon={<Mail className="h-5 w-5 text-[hsl(265_55%_68%)]" />}
      >
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(265_55%_58%/0.15)] hover:bg-[hsl(265_55%_58%/0.25)] text-[hsl(265_55%_68%)] text-[11px] font-medium transition-colors">
          <Plus className="h-3.5 w-3.5" /> New Message
        </button>
      </HeroCard>

      <SummaryCard
        title="Message Stats"
        kpis={[
          { label: "Pending Review", value: String(communications.filter(c => c.status === "review").length) },
          { label: "Sent", value: String(communications.filter(c => ["sent", "delivered"].includes(c.status)).length), trend: "up" },
          { label: "Opens", value: String(communications.filter(c => c.status === "opened").length) },
          { label: "Drafts", value: String(communications.filter(c => c.status === "draft").length) },
        ]}
      />

      <SitaTabs
        tabs={[
          { key: "all", label: "All", count: communications.length },
          { key: "drafts", label: "Drafts & Review", count: communications.filter(c => ["draft", "review"].includes(c.status)).length },
          { key: "sent", label: "Sent", count: communications.filter(c => ["sent", "delivered", "opened", "replied"].includes(c.status)).length },
          { key: "approval", label: "Needs Approval", count: communications.filter(c => c.requires_approval && ["draft", "review"].includes(c.status)).length },
        ]}
        active={tab}
        onChange={setTab}
      />

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <div className="rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_9%)] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className={cn(SITA_TYPE.cardTitle, "text-[hsl(0_0%_85%)]")}>New Communication</span>
                <button onClick={resetForm} className="text-[hsl(0_0%_50%)] hover:text-[hsl(0_0%_80%)]"><X className="h-4 w-4" /></button>
              </div>
              <input className="w-full rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_12%)] px-3 py-2 text-sm text-[hsl(0_0%_85%)] placeholder:text-[hsl(0_0%_40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(265_55%_58%/0.3)]" placeholder="Customer name" value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} />
              <input className="w-full rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_12%)] px-3 py-2 text-sm text-[hsl(0_0%_85%)] placeholder:text-[hsl(0_0%_40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(265_55%_58%/0.3)]" placeholder="Subject" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
              <textarea className="w-full rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_12%)] px-3 py-2 text-sm text-[hsl(0_0%_85%)] placeholder:text-[hsl(0_0%_40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(265_55%_58%/0.3)]" placeholder="Message body..." rows={4} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
              <div className="flex gap-2">
                <button onClick={handleSubmit} className="px-4 py-2 rounded-lg bg-[hsl(265_55%_58%)] text-white text-xs font-medium hover:bg-[hsl(265_55%_50%)] transition-colors">Create</button>
                <button onClick={resetForm} className="px-4 py-2 rounded-lg border border-[hsl(0_0%_100%/0.06)] text-[hsl(0_0%_60%)] text-xs hover:bg-[hsl(0_0%_100%/0.04)] transition-colors">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Message list as ActionCards */}
        <div className="lg:col-span-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-8 text-center">
              <Mail className="h-6 w-6 text-[hsl(0_0%_40%)] mx-auto mb-2" />
              <p className={cn(SITA_TYPE.cardTitle, "text-[hsl(0_0%_70%)]")}>No communications</p>
            </div>
          ) : filtered.map(comm => (
            <div key={comm.id} onClick={() => setSelectedId(comm.id)} className="cursor-pointer">
              <ActionCard
                title={comm.subject || "(No subject)"}
                description={`${comm.customer_name} · ${comm.type.toUpperCase()} · ${comm.status}`}
                accentColor={comm.requires_approval ? "hsl(38 85% 58%)" : "hsl(265 55% 58%)"}
                onApprove={["draft", "review"].includes(comm.status) ? () => handleSend(comm.id) : undefined}
                onDismiss={() => handleDelete(comm.id)}
              />
            </div>
          ))}
        </div>

        {/* Timeline sidebar */}
        <div className="lg:col-span-2">
          <TimelineCard title="Recent Activity" events={timelineEvents} maxVisible={5} />
        </div>
      </div>
    </motion.div>
  );
};

export default CommunicationsCenter;
