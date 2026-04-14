import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Settings, Trash2, GripVertical, Type, Hash, Calendar, List, ToggleLeft, Save, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface CustomField {
  id: string;
  label: string;
  key: string;
  type: "text" | "number" | "date" | "select" | "boolean";
  entity: "contact" | "company" | "deal";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

const FIELD_TYPE_INFO = [
  { type: "text" as const, label: "Text", icon: Type, description: "Short text input" },
  { type: "number" as const, label: "Number", icon: Hash, description: "Numeric value" },
  { type: "date" as const, label: "Date", icon: Calendar, description: "Date picker" },
  { type: "select" as const, label: "Dropdown", icon: List, description: "Select from options" },
  { type: "boolean" as const, label: "Toggle", icon: ToggleLeft, description: "Yes/No switch" },
];

const ENTITY_TABS = [
  { key: "contact" as const, label: "Contact Fields" },
  { key: "company" as const, label: "Company Fields" },
  { key: "deal" as const, label: "Deal Fields" },
];

const DEFAULT_FIELDS: CustomField[] = [
  { id: "cf1", label: "Lead Score", key: "lead_score", type: "number", entity: "contact", required: false, placeholder: "0-100" },
  { id: "cf2", label: "Preferred Language", key: "preferred_language", type: "select", entity: "contact", required: false, options: ["English", "Spanish", "French", "German", "Portuguese"] },
  { id: "cf3", label: "Contract End Date", key: "contract_end", type: "date", entity: "company", required: false },
  { id: "cf4", label: "NDA Signed", key: "nda_signed", type: "boolean", entity: "company", required: false },
  { id: "cf5", label: "Competitor Involved", key: "competitor", type: "text", entity: "deal", required: false, placeholder: "Competitor name" },
  { id: "cf6", label: "Decision Maker Count", key: "dm_count", type: "number", entity: "deal", required: false },
  { id: "cf7", label: "Industry Vertical", key: "industry_vertical", type: "select", entity: "contact", required: false, options: ["SaaS", "E-commerce", "Healthcare", "Finance", "Education", "Other"] },
  { id: "cf8", label: "Account Tier", key: "account_tier", type: "select", entity: "company", required: false, options: ["Enterprise", "Mid-Market", "SMB", "Startup"] },
];

const CRMCustomFields = () => {
  const [fields, setFields] = useState<CustomField[]>(DEFAULT_FIELDS);
  const [activeEntity, setActiveEntity] = useState<"contact" | "company" | "deal">("contact");
  const [showCreate, setShowCreate] = useState(false);
  const [newField, setNewField] = useState<Partial<CustomField>>({ label: "", type: "text", entity: "contact", required: false });
  const [newOptions, setNewOptions] = useState("");

  const filtered = fields.filter(f => f.entity === activeEntity);

  const createField = () => {
    if (!newField.label?.trim()) { toast.error("Enter a field label"); return; }
    const key = newField.label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    if (fields.some(f => f.key === key && f.entity === newField.entity)) { toast.error("Field key already exists"); return; }

    const field: CustomField = {
      id: `cf_${Date.now()}`,
      label: newField.label,
      key,
      type: newField.type || "text",
      entity: newField.entity || "contact",
      required: newField.required || false,
      options: newField.type === "select" ? newOptions.split(",").map(o => o.trim()).filter(Boolean) : undefined,
      placeholder: newField.placeholder,
    };

    setFields(prev => [...prev, field]);
    setShowCreate(false);
    setNewField({ label: "", type: "text", entity: activeEntity, required: false });
    setNewOptions("");
    toast.success(`Field "${field.label}" created`);
  };

  const deleteField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
    toast.success("Field deleted");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" /> Custom Fields
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Define additional fields for contacts, companies, and deals</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => { setNewField({ ...newField, entity: activeEntity }); setShowCreate(true); }}>
          <Plus className="h-3.5 w-3.5" /> New Field
        </Button>
      </div>

      {/* Entity tabs */}
      <div className="flex gap-1.5">
        {ENTITY_TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveEntity(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeEntity === tab.key ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
            }`}>{tab.label} ({fields.filter(f => f.entity === tab.key).length})</button>
        ))}
      </div>

      {/* Field list */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map(field => {
            const typeInfo = FIELD_TYPE_INFO.find(t => t.type === field.type);
            return (
              <motion.div key={field.id} layout initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-3 flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab shrink-0" />
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      {typeInfo && <typeInfo.icon className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{field.label}</p>
                        {field.required && <span className="text-[9px] px-1 py-0.5 rounded bg-destructive/10 text-destructive font-medium">Required</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground font-mono bg-muted/30 px-1 rounded">{field.key}</span>
                        <span className="text-[10px] text-muted-foreground capitalize">{field.type}</span>
                        {field.options && <span className="text-[10px] text-muted-foreground">{field.options.length} options</span>}
                      </div>
                    </div>
                    {field.options && (
                      <div className="flex gap-1 flex-wrap max-w-[200px]">
                        {field.options.slice(0, 3).map(o => (
                          <span key={o} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted/30 text-muted-foreground">{o}</span>
                        ))}
                        {(field.options.length > 3) && <span className="text-[9px] text-muted-foreground">+{field.options.length - 3}</span>}
                      </div>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => deleteField(field.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-8 gap-2">
            <Settings className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No custom fields for {activeEntity}s yet</p>
            <Button variant="outline" size="sm" className="gap-1.5 mt-2" onClick={() => { setNewField({ ...newField, entity: activeEntity }); setShowCreate(true); }}>
              <Plus className="h-3.5 w-3.5" /> Create First Field
            </Button>
          </div>
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Custom Field</DialogTitle>
            <DialogDescription>Add a new field for {activeEntity} records</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Field Label</label>
              <Input value={newField.label || ""} onChange={e => setNewField(p => ({ ...p, label: e.target.value }))} placeholder="e.g. Lead Score" className="text-sm" />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Field Type</label>
              <div className="grid grid-cols-5 gap-2">
                {FIELD_TYPE_INFO.map(t => (
                  <button key={t.type} onClick={() => setNewField(p => ({ ...p, type: t.type }))}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                      newField.type === t.type ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    }`}>
                    <t.icon className={`h-4 w-4 ${newField.type === t.type ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-[10px] font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {newField.type === "select" && (
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Options (comma-separated)</label>
                <Input value={newOptions} onChange={e => setNewOptions(e.target.value)} placeholder="Option 1, Option 2, Option 3" className="text-sm" />
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Placeholder</label>
              <Input value={newField.placeholder || ""} onChange={e => setNewField(p => ({ ...p, placeholder: e.target.value }))} placeholder="Optional hint text" className="text-sm" />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newField.required || false} onChange={e => setNewField(p => ({ ...p, required: e.target.checked }))}
                className="rounded border-border" />
              <span className="text-xs text-foreground">Required field</span>
            </label>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button size="sm" className="gap-1.5" onClick={createField} disabled={!newField.label?.trim()}>
                <Save className="h-3.5 w-3.5" /> Create Field
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CRMCustomFields;
