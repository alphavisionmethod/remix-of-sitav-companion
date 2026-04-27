// SITA OS — CRM Contact Form (Quick Add + Full Create)
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Zap, FileText } from "lucide-react";
import { useCreateContact } from "@/modules/business/hooks/use-crm-data";
import type { CRMCompany } from "@/data/repositories/crm-data-service";

interface CRMContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companies?: CRMCompany[];
  defaultCompanyId?: string;
}

const EMPTY_QUICK = { first_name: "", last_name: "", email: "", phone: "", lifecycle_stage: "lead" };
const EMPTY_FULL = {
  first_name: "", last_name: "", email: "", phone: "", title: "",
  lifecycle_stage: "lead", status: "active", source: "", owner: "",
  address: "", city: "", state: "", country: "", website: "",
  tags: "",
};

export function CRMContactForm({ open, onOpenChange, companies = [], defaultCompanyId }: CRMContactFormProps) {
  const createContact = useCreateContact();
  const [mode, setMode] = useState<"quick" | "full">("quick");
  const [quick, setQuick] = useState(EMPTY_QUICK);
  const [full, setFull] = useState(EMPTY_FULL);

  const handleQuickSubmit = async () => {
    if (!quick.first_name.trim()) { toast.error("First name is required"); return; }
    try {
      await createContact.mutateAsync(quick as any);
      toast.success("Contact created");
      setQuick(EMPTY_QUICK);
      onOpenChange(false);
    } catch { toast.error("Failed to create contact"); }
  };

  const handleFullSubmit = async () => {
    if (!full.first_name.trim()) { toast.error("First name is required"); return; }
    try {
      const payload: Record<string, unknown> = { ...full };
      if (full.tags) payload.tags = full.tags.split(",").map(t => t.trim()).filter(Boolean);
      else payload.tags = [];
      await createContact.mutateAsync(payload as any);
      toast.success("Contact created");
      setFull(EMPTY_FULL);
      onOpenChange(false);
    } catch { toast.error("Failed to create contact"); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" /> New Contact
          </DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={v => setMode(v as any)}>
          <TabsList className="w-full bg-muted/30">
            <TabsTrigger value="quick" className="flex-1 text-xs gap-1.5">
              <Zap className="h-3 w-3" /> Quick Add
            </TabsTrigger>
            <TabsTrigger value="full" className="flex-1 text-xs gap-1.5">
              <FileText className="h-3 w-3" /> Full Create
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">First Name *</Label><Input className="mt-1" placeholder="John" value={quick.first_name} onChange={e => setQuick(p => ({ ...p, first_name: e.target.value }))} /></div>
              <div><Label className="text-xs">Last Name</Label><Input className="mt-1" placeholder="Smith" value={quick.last_name} onChange={e => setQuick(p => ({ ...p, last_name: e.target.value }))} /></div>
            </div>
            <div><Label className="text-xs">Email</Label><Input className="mt-1" type="email" placeholder="john@example.com" value={quick.email} onChange={e => setQuick(p => ({ ...p, email: e.target.value }))} /></div>
            <div><Label className="text-xs">Phone</Label><Input className="mt-1" placeholder="+1-555-0100" value={quick.phone} onChange={e => setQuick(p => ({ ...p, phone: e.target.value }))} /></div>
            <div>
              <Label className="text-xs">Stage</Label>
              <select className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm" value={quick.lifecycle_stage} onChange={e => setQuick(p => ({ ...p, lifecycle_stage: e.target.value }))}>
                <option value="lead">Lead</option>
                <option value="qualified">Qualified</option>
                <option value="opportunity">Opportunity</option>
                <option value="customer">Customer</option>
              </select>
            </div>
            <Button className="w-full" onClick={handleQuickSubmit} disabled={createContact.isPending}>
              {createContact.isPending ? "Creating..." : "Create Contact"}
            </Button>
          </TabsContent>

          <TabsContent value="full" className="mt-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Identity</p>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">First Name *</Label><Input className="mt-1" value={full.first_name} onChange={e => setFull(p => ({ ...p, first_name: e.target.value }))} /></div>
                <div><Label className="text-xs">Last Name</Label><Input className="mt-1" value={full.last_name} onChange={e => setFull(p => ({ ...p, last_name: e.target.value }))} /></div>
              </div>
              <div className="mt-3"><Label className="text-xs">Title / Role</Label><Input className="mt-1" placeholder="VP of Sales" value={full.title} onChange={e => setFull(p => ({ ...p, title: e.target.value }))} /></div>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Contact Methods</p>
              <div className="space-y-3">
                <div><Label className="text-xs">Email</Label><Input className="mt-1" type="email" value={full.email} onChange={e => setFull(p => ({ ...p, email: e.target.value }))} /></div>
                <div><Label className="text-xs">Phone</Label><Input className="mt-1" value={full.phone} onChange={e => setFull(p => ({ ...p, phone: e.target.value }))} /></div>
                <div><Label className="text-xs">Website</Label><Input className="mt-1" value={full.website} onChange={e => setFull(p => ({ ...p, website: e.target.value }))} /></div>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Location</p>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">City</Label><Input className="mt-1" value={full.city} onChange={e => setFull(p => ({ ...p, city: e.target.value }))} /></div>
                <div><Label className="text-xs">State</Label><Input className="mt-1" value={full.state} onChange={e => setFull(p => ({ ...p, state: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div><Label className="text-xs">Country</Label><Input className="mt-1" value={full.country} onChange={e => setFull(p => ({ ...p, country: e.target.value }))} /></div>
                <div><Label className="text-xs">Address</Label><Input className="mt-1" value={full.address} onChange={e => setFull(p => ({ ...p, address: e.target.value }))} /></div>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">CRM Classification</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Lifecycle Stage</Label>
                  <select className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm" value={full.lifecycle_stage} onChange={e => setFull(p => ({ ...p, lifecycle_stage: e.target.value }))}>
                    <option value="lead">Lead</option>
                    <option value="qualified">Qualified</option>
                    <option value="opportunity">Opportunity</option>
                    <option value="customer">Customer</option>
                    <option value="churned">Churned</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Source</Label>
                  <Input className="mt-1" placeholder="Referral, Website..." value={full.source} onChange={e => setFull(p => ({ ...p, source: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div><Label className="text-xs">Owner</Label><Input className="mt-1" placeholder="You" value={full.owner} onChange={e => setFull(p => ({ ...p, owner: e.target.value }))} /></div>
                <div><Label className="text-xs">Tags</Label><Input className="mt-1" placeholder="VIP, Enterprise" value={full.tags} onChange={e => setFull(p => ({ ...p, tags: e.target.value }))} /></div>
              </div>
            </div>

            <Button className="w-full" onClick={handleFullSubmit} disabled={createContact.isPending}>
              {createContact.isPending ? "Creating..." : "Create Contact"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
