import { SitaPageHeader, SitaCard, SitaCardTitle, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { StateBadge, ExecutionState } from "@/components/sita/StateBadge";
import { useState, useCallback } from "react";
import { Mail, MessageSquare, Send, Eye, Edit, CheckCircle, Clock, Sparkles, Trash2, Plus, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { toast } from "sonner";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useConfirmation } from "@/hooks/use-confirmation";
import { ConfirmationDialog } from "@/components/sita/ConfirmationDialog";

type CommStatus = "draft" | "review" | "approved" | "sent" | "delivered" | "opened" | "replied" | "failed";

interface Communication {
  id: string;
  type: "email" | "sms" | "message";
  subject: string;
  body: string;
  status: CommStatus;
  requires_approval: boolean;
  customer_name: string;
  created_at: string;
  sent_at: string | null;
}

const statusColors: Record<CommStatus, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  review: "bg-trust-review/10 text-trust-review border-trust-review/20",
  approved: "bg-state-approved/10 text-state-approved border-state-approved/20",
  sent: "bg-primary/10 text-primary border-primary/20",
  delivered: "bg-trust-verified/10 text-trust-verified border-trust-verified/20",
  opened: "bg-accent/10 text-accent border-accent/20",
  replied: "bg-trust-safe/10 text-trust-safe border-trust-safe/20",
  failed: "bg-urgency-critical/10 text-urgency-critical border-urgency-critical/20",
};

const statusToState: Record<CommStatus, ExecutionState> = {
  draft: "proposed", review: "drafted", approved: "approved", sent: "completed",
  delivered: "verified", opened: "completed", replied: "verified", failed: "failed",
};

const initialComms: Communication[] = [
  { id: "c1", type: "email", subject: "Quote #1042 — Website Redesign Proposal", body: "Hi Sarah,\n\nThank you for your interest in our web design services. I've prepared a detailed proposal for your website redesign project.\n\nThe total investment would be $2,500, which includes:\n- Complete redesign with modern UI/UX\n- Mobile-responsive layouts\n- SEO optimization\n- 3 rounds of revisions\n\nI'd love to schedule a call to walk through the details. What time works best for you this week?\n\nBest regards", status: "sent", requires_approval: false, customer_name: "Sarah Chen", created_at: new Date(Date.now() - 3600000 * 4).toISOString(), sent_at: new Date(Date.now() - 3600000 * 3).toISOString() },
  { id: "c2", type: "email", subject: "Invoice #1035 — Friendly Payment Reminder", body: "Hi David,\n\nI hope this message finds you well. I wanted to follow up on Invoice #1035 for $1,800, which was due on March 21st.\n\nCould you let me know if there are any questions about the invoice or if you need additional time? I'm happy to discuss payment arrangements if needed.\n\nThank you for your continued partnership.\n\nBest regards", status: "draft", requires_approval: true, customer_name: "David Kim", created_at: new Date(Date.now() - 3600000 * 2).toISOString(), sent_at: null },
  { id: "c3", type: "sms", subject: "Appointment Confirmation — Tomorrow 2 PM", body: "Hi James, just confirming our meeting tomorrow at 2:00 PM. Looking forward to discussing the Q2 project scope. See you then!", status: "delivered", requires_approval: false, customer_name: "James Rodriguez", created_at: new Date(Date.now() - 3600000 * 8).toISOString(), sent_at: new Date(Date.now() - 3600000 * 7).toISOString() },
  { id: "c4", type: "email", subject: "Follow-up: Web Design Consultation", body: "Hi Emily,\n\nIt was great speaking with you last week about your website project. I noticed we haven't connected since our call — I wanted to check if you had any additional questions about the proposal.\n\nI've also put together some additional portfolio examples that match your industry. Would you like me to send those over?\n\nLooking forward to hearing from you.", status: "review", requires_approval: true, customer_name: "Emily Watson", created_at: new Date(Date.now() - 3600000 * 24).toISOString(), sent_at: null },
  { id: "c5", type: "message", subject: "Retainer Discussion — Monthly Package", body: "Hey Marcus, great working with you on the recent projects. Given our track record, I think a monthly retainer could work well for both of us — predictable costs for you and consistent workflow for us. Want to grab coffee and discuss?", status: "opened", requires_approval: false, customer_name: "Marcus Johnson", created_at: new Date(Date.now() - 3600000 * 48).toISOString(), sent_at: new Date(Date.now() - 3600000 * 46).toISOString() },
  { id: "c6", type: "email", subject: "Thank You — Invoice #1038 Payment Received", body: "Hi Marcus,\n\nThis is to confirm we've received your payment of $4,200 for Invoice #1038. Thank you for the prompt payment!\n\nAll records have been updated on our end. Looking forward to continuing our work together.\n\nBest regards", status: "delivered", requires_approval: false, customer_name: "Marcus Johnson", created_at: new Date(Date.now() - 3600000 * 6).toISOString(), sent_at: new Date(Date.now() - 3600000 * 5).toISOString() },
];

let nextId = 7;

const CommunicationsCenter = () => {
  const [communications, setCommunications] = useState<Communication[]>(initialComms);
  const [tab, setTab] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: "email" as "email" | "sms" | "message",
    subject: "",
    body: "",
    status: "draft" as CommStatus,
    requires_approval: false,
    customer_name: "",
  });

  const resetForm = useCallback(() => {
    setForm({ type: "email", subject: "", body: "", status: "draft", requires_approval: false, customer_name: "" });
    setShowForm(false);
    setEditingId(null);
  }, []);

  const handleSubmit = () => {
    if (!form.subject.trim()) { toast.error("Subject is required"); return; }
    if (editingId) {
      setCommunications(prev => prev.map(c => c.id === editingId ? { ...c, ...form } : c));
      toast.success("Communication updated");
    } else {
      const newComm: Communication = {
        id: `c${nextId++}`,
        ...form,
        created_at: new Date().toISOString(),
        sent_at: null,
      };
      setCommunications(prev => [newComm, ...prev]);
      toast.success("Communication created");
    }
    resetForm();
  };

  const handleSend = (id: string) => {
    setCommunications(prev => prev.map(c => c.id === id ? { ...c, status: "sent" as CommStatus, sent_at: new Date().toISOString() } : c));
    toast.success("Communication sent!");
  };

  const handleDelete = (id: string) => {
    setCommunications(prev => prev.filter(c => c.id !== id));
    setSelectedId(null);
    toast.success("Communication deleted");
  };

  const startEdit = (comm: Communication) => {
    setForm({ type: comm.type, subject: comm.subject, body: comm.body, status: comm.status, requires_approval: comm.requires_approval, customer_name: comm.customer_name });
    setEditingId(comm.id);
    setShowForm(true);
  };

  const selected = communications.find(c => c.id === selectedId);

  const filtered = tab === "all" ? communications
    : tab === "drafts" ? communications.filter(c => ["draft", "review"].includes(c.status))
    : tab === "sent" ? communications.filter(c => ["sent", "delivered", "opened", "replied"].includes(c.status))
    : communications.filter(c => c.requires_approval && ["draft", "review"].includes(c.status));

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <DemoModeBadge />
      <SitaPageHeader
        title="Communications"
        subtitle="Drafts, outreach, and message tracking — full CRUD with mock data"
        actions={
          <SitaButton variant="primary" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="h-4 w-4" /> New Message
          </SitaButton>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Pending Review" value={communications.filter(c => c.status === "review").length} icon={Eye} />
        <KPITile label="Sent" value={communications.filter(c => ["sent", "delivered"].includes(c.status)).length} icon={Send} />
        <KPITile label="Opens" value={communications.filter(c => c.status === "opened").length} icon={Mail} sub="Tracked" />
        <KPITile label="Drafts" value={communications.filter(c => c.status === "draft").length} icon={Edit} />
      </div>

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
            <SitaCard hover={false} glow className="p-5">
              <div className="flex items-center justify-between mb-4">
                <SitaCardTitle>{editingId ? "Edit Communication" : "New Communication"}</SitaCardTitle>
                <button onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2">
                  {(["email", "sms", "message"] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setForm(f => ({ ...f, type: t }))}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${form.type === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
                <input
                  className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Customer name"
                  value={form.customer_name}
                  onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                />
                <input
                  className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Subject"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                />
                <textarea
                  className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Message body..."
                  rows={5}
                  value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                />
                <div className="flex items-center gap-3">
                  <select
                    className="rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground focus:outline-none"
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as CommStatus }))}
                  >
                    <option value="draft">Draft</option>
                    <option value="review">In Review</option>
                    <option value="approved">Approved</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    <input type="checkbox" checked={form.requires_approval} onChange={e => setForm(f => ({ ...f, requires_approval: e.target.checked }))} className="rounded border-border" />
                    Requires Approval
                  </label>
                </div>
                <div className="flex gap-2 pt-2">
                  <SitaButton variant="primary" onClick={handleSubmit}>{editingId ? "Update" : "Create"}</SitaButton>
                  <SitaButton variant="secondary" onClick={resetForm}>Cancel</SitaButton>
                </div>
              </div>
            </SitaCard>
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length === 0 ? (
        <EmptyState icon={Mail} title="No communications yet" description="Create your first message to get started" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-2">
            {filtered.map((comm) => (
              <SitaCard
                key={comm.id}
                onClick={() => setSelectedId(comm.id)}
                selected={selectedId === comm.id}
                lane={comm.requires_approval && ["draft", "review"].includes(comm.status) ? "action" : undefined}
                className="p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/8 font-display text-sm font-semibold text-primary shrink-0">
                      {comm.customer_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground truncate">{comm.subject || "(No subject)"}</p>
                        {comm.type !== "email" && <span className="text-[10px] bg-secondary rounded px-1.5 py-px text-muted-foreground">{comm.type.toUpperCase()}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">{comm.customer_name} · {new Date(comm.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-flex items-center rounded-md border px-1.5 py-px text-[10px] font-medium ${statusColors[comm.status]}`}>
                      {comm.status}
                    </span>
                    {comm.sent_at && <p className="mt-1 text-[11px] text-muted-foreground">{new Date(comm.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>}
                  </div>
                </div>
                {comm.body && <p className="mt-2 text-xs text-muted-foreground truncate">{comm.body.split("\n")[0]}</p>}
              </SitaCard>
            ))}
          </div>

          <div className="lg:col-span-2 space-y-4">
            {selected ? (
              <>
                <SitaCard hover={false} glow className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    {selected.type === "email" ? <Mail className="h-4 w-4 text-primary" /> : <MessageSquare className="h-4 w-4 text-primary" />}
                    <SitaCardTitle>{selected.subject || "(No subject)"}</SitaCardTitle>
                  </div>
                  <div className="space-y-2">
                    {[
                      ["Type", <span className="capitalize">{selected.type}</span>],
                      ["Customer", selected.customer_name || "—"],
                      ["Status", <span className={`inline-flex items-center rounded-md border px-1.5 py-px text-[10px] font-medium ${statusColors[selected.status]}`}>{selected.status}</span>],
                      ["State", <StateBadge state={statusToState[selected.status]} size="sm" />],
                    ].map(([label, val], i) => (
                      <div key={i} className="flex justify-between text-sm items-center">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="text-foreground">{val}</span>
                      </div>
                    ))}
                    {selected.requires_approval && (
                      <div className="flex justify-between text-sm items-center">
                        <span className="text-muted-foreground">Approval</span>
                        <TrustBadge level="approval" size="sm" />
                      </div>
                    )}
                    {selected.sent_at && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Sent At</span>
                        <span className="text-foreground">{new Date(selected.sent_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </SitaCard>

                {selected.body && (
                  <SitaCard hover={false}>
                    <SitaCardTitle>Preview</SitaCardTitle>
                    <div className="mt-3 rounded-xl bg-secondary/30 p-4">
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{selected.body}</p>
                    </div>
                  </SitaCard>
                )}

                <div className="flex gap-2 flex-wrap">
                  {["draft", "review", "approved"].includes(selected.status) && (
                    <SitaButton variant="primary" size="sm" className="flex-1" onClick={() => handleSend(selected.id)}>
                      <Send className="h-3.5 w-3.5" />
                      {selected.requires_approval && selected.status !== "approved" ? "Approve & Send" : "Send"}
                    </SitaButton>
                  )}
                  {["draft", "review"].includes(selected.status) && (
                    <SitaButton variant="secondary" size="sm" onClick={() => startEdit(selected)}>
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </SitaButton>
                  )}
                  <SitaButton variant="ghost" size="sm" onClick={() => { if (confirm("Delete this communication?")) handleDelete(selected.id); }}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </SitaButton>
                </div>

                {/* Proof card */}
                {selected.sent_at && (
                  <SitaCard hover={false} className="p-4 gradient-sita-subtle">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-trust-verified" />
                      <SitaCardTitle>Proof of Delivery</SitaCardTitle>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>✓ Message sent at {new Date(selected.sent_at).toLocaleString()}</p>
                      <p>✓ Delivery confirmed</p>
                      <p>✓ Receipt stored in Proof Center</p>
                    </div>
                    <TrustBadge level="verified" label="Verified Delivery" className="mt-2" />
                  </SitaCard>
                )}
              </>
            ) : (
              <EmptyState icon={Mail} title="Select a message" description="Click on a communication to preview, edit, or send" />
            )}
          </div>
        </div>
      )}
      <LiveAdvisorCard
        advisor="business"
        intent="comms_effectiveness"
        demoName="Comms Intelligence"
        demoRole="Engagement Advisor"
        demoConfidence="Medium"
        demoRecommendation="Emails sent before 10 AM have 2.3x higher open rates. 2 drafts pending review — send the follow-up to Emily Watson before the lead goes fully cold."
        demoReasoning="Based on delivery analytics, open rate patterns, and customer engagement history."
      />
    </motion.div>
  );
};

export default CommunicationsCenter;
