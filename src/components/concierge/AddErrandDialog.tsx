import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useCreateErrand } from "@/hooks/use-concierge-data";
import { toast } from "sonner";

export function AddErrandDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState("medium");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [combinable, setCombinable] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [bundleId, setBundleId] = useState("");
  const [notes, setNotes] = useState("");

  const createErrand = useCreateErrand();

  const reset = () => {
    setTitle(""); setLocation(""); setPriority("medium");
    setEstimatedMinutes(""); setCombinable(false);
    setDueDate(""); setBundleId(""); setNotes("");
  };

  const handleSubmit = () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    createErrand.mutate({
      title: title.trim(),
      location: location.trim() || undefined,
      priority,
      estimated_minutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined,
      combinable,
      due_date: dueDate || undefined,
      bundle_id: bundleId.trim() || undefined,
      notes: notes.trim() || undefined,
    }, {
      onSuccess: () => { toast.success("Errand added"); reset(); setOpen(false); },
      onError: () => toast.error("Failed to add errand"),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Errand
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Errand</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs">Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Pick up dry cleaning" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Optional" />
            </div>
            <div>
              <Label className="text-xs">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Est. Minutes</Label>
              <Input type="number" value={estimatedMinutes} onChange={(e) => setEstimatedMinutes(e.target.value)} placeholder="e.g. 15" />
            </div>
            <div>
              <Label className="text-xs">Due Date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Bundle / Group</Label>
              <Input value={bundleId} onChange={(e) => setBundleId(e.target.value)} placeholder="e.g. Downtown Loop" />
            </div>
            <div className="flex items-end gap-2 pb-0.5">
              <Switch checked={combinable} onCheckedChange={setCombinable} id="combinable" />
              <Label htmlFor="combinable" className="text-xs">Combinable</Label>
            </div>
          </div>
          <div>
            <Label className="text-xs">Notes</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />
          </div>
          <Button onClick={handleSubmit} disabled={createErrand.isPending} className="w-full">
            {createErrand.isPending ? "Adding…" : "Add Errand"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
