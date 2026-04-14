import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCRMCommunications, useCRMContacts, useCreateCommunication } from "@/hooks/use-crm-data";
import { Mail, Phone, MessageSquare, Calendar, Plus, Filter, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const TYPE_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  email: { icon: Mail, color: "text-blue-400 bg-blue-500/10" },
  call: { icon: Phone, color: "text-green-400 bg-green-500/10" },
  meeting: { icon: Calendar, color: "text-purple-400 bg-purple-500/10" },
  note: { icon: MessageSquare, color: "text-yellow-400 bg-yellow-500/10" },
};

const CRMTimeline = () => {
  const { data: comms = [] } = useCRMCommunications();
  const { data: contacts = [] } = useCRMContacts();
  const createComm = useCreateCommunication();
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ comm_type: "note", subject: "", content: "", direction: "outbound" });

  const filtered = useMemo(() => {
    if (!typeFilter) return comms;
    return comms.filter(c => c.comm_type === typeFilter);
  }, [comms, typeFilter]);

  const contactMap = useMemo(() => {
    const m: Record<string, string> = {};
    contacts.forEach(c => { m[c.id] = `${c.first_name} ${c.last_name}`; });
    return m;
  }, [contacts]);

  const handleAdd = async () => {
    if (!form.subject.trim() && !form.content.trim()) { toast.error("Subject or content required"); return; }
    try {
      await createComm.mutateAsync(form as any);
      toast.success("Entry added");
      setShowAdd(false);
      setForm({ comm_type: "note", subject: "", content: "", direction: "outbound" });
    } catch { toast.error("Failed to add entry"); }
  };

  return (
    <div className="space-y-4">
      <PageTruthBanner truthState="demo" />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Communication Timeline</h2>
          <p className="text-xs text-muted-foreground">The memory stream of every relationship</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Entry</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>New Timeline Entry</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.comm_type} onChange={e => setForm(p => ({ ...p, comm_type: e.target.value }))}>
                <option value="note">Note</option>
                <option value="email">Email</option>
                <option value="call">Call</option>
                <option value="meeting">Meeting</option>
              </select>
              <Input placeholder="Subject" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
              <textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Content..." value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} />
              <Button className="w-full" onClick={handleAdd} disabled={createComm.isPending}>
                {createComm.isPending ? "Adding..." : "Add Entry"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-1.5">
        <Button variant={!typeFilter ? "secondary" : "ghost"} size="sm" className="h-7 text-xs" onClick={() => setTypeFilter(null)}>All</Button>
        {Object.entries(TYPE_ICONS).map(([type, { icon: Icon }]) => (
          <Button key={type} variant={typeFilter === type ? "secondary" : "ghost"} size="sm" className="h-7 text-xs capitalize gap-1" onClick={() => setTypeFilter(type === typeFilter ? null : type)}>
            <Icon className="h-3 w-3" /> {type}
          </Button>
        ))}
      </div>

      <div className="relative">
        <div className="absolute left-[23px] top-0 bottom-0 w-px bg-border/50" />
        <div className="space-y-1">
          {filtered.map(cm => {
            const t = TYPE_ICONS[cm.comm_type] || TYPE_ICONS.note;
            const Icon = t.icon;
            return (
              <div key={cm.id} className="flex gap-3 relative pl-2">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 ${t.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <Card className="flex-1 border-border/40 bg-card/50 hover:bg-card/80 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{cm.subject || cm.comm_type}</p>
                        {cm.content && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{cm.content}</p>}
                        {cm.contact_id && contactMap[cm.contact_id] && (
                          <p className="text-xs text-primary mt-1">{contactMap[cm.contact_id]}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(cm.occurred_at), { addSuffix: true })}
                      </span>
                    </div>
                    {cm.outcome && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground mt-1 inline-block">{cm.outcome}</span>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No communications yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CRMTimeline;
