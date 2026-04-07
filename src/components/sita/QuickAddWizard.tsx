import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Briefcase, DollarSign, Target, FileText, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type WizardType = "lead" | "invoice" | "budget" | null;

interface QuickAddWizardProps {
  type: WizardType;
  onClose: () => void;
}

const WIZARD_CONFIG = {
  lead: { title: "Add New Lead", icon: Target, color: "text-accent", fields: ["name", "email", "company", "source"] },
  invoice: { title: "Create Invoice", icon: FileText, color: "text-primary", fields: ["invoice_number", "customer_name", "amount", "due_date"] },
  budget: { title: "Set Budget", icon: DollarSign, color: "text-accent", fields: ["category", "allocated", "period"] },
} as const;

const FIELD_LABELS: Record<string, { label: string; type: string; placeholder: string }> = {
  name: { label: "Name", type: "text", placeholder: "e.g. Sarah Chen" },
  email: { label: "Email", type: "email", placeholder: "sarah@company.com" },
  company: { label: "Company", type: "text", placeholder: "Acme Corp" },
  source: { label: "Source", type: "text", placeholder: "Referral, Website, Cold..." },
  invoice_number: { label: "Invoice #", type: "text", placeholder: "INV-001" },
  customer_name: { label: "Customer", type: "text", placeholder: "Customer name" },
  amount: { label: "Amount ($)", type: "number", placeholder: "0.00" },
  due_date: { label: "Due Date", type: "date", placeholder: "" },
  category: { label: "Category", type: "text", placeholder: "Marketing, Operations..." },
  allocated: { label: "Budget Amount ($)", type: "number", placeholder: "0.00" },
  period: { label: "Period", type: "text", placeholder: "monthly" },
};

export const QuickAddWizard = ({ type, onClose }: QuickAddWizardProps) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  if (!type) return null;
  const config = WIZARD_CONFIG[type];

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);

    try {
      if (type === "lead") {
        const { error } = await fromTable("leads").insert({
          user_id: user.id,
          name: values.name || "New Lead",
          email: values.email || null,
          company: values.company || null,
          source: values.source || null,
        });
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["leads"] });
      } else if (type === "invoice") {
        const { error } = await fromTable("invoices").insert({
          user_id: user.id,
          invoice_number: values.invoice_number || `INV-${Date.now()}`,
          amount: parseFloat(values.amount) || 0,
          due_date: values.due_date || new Date().toISOString().split("T")[0],
        });
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["invoices"] });
      } else if (type === "budget") {
        const { error } = await fromTable("budgets").insert({
          user_id: user.id,
          category: values.category || "General",
          allocated: parseFloat(values.allocated) || 0,
          period: values.period || "monthly",
        });
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["budgets"] });
      }

      setDone(true);
      toast.success(`${config.title.replace("Add New ", "").replace("Create ", "").replace("Set ", "")} created!`);
      setTimeout(onClose, 1200);
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25 }}
          className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
        >
          {done ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center py-8 gap-4"
            >
              <div className="rounded-full bg-trust-safe/10 p-4">
                <CheckCircle className="h-10 w-10 text-trust-safe" />
              </div>
              <p className="text-lg font-semibold text-foreground">Created!</p>
            </motion.div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-2">
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <h2 className="font-display text-lg font-bold text-foreground">{config.title}</h2>
                </div>
                <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                {config.fields.map((field) => {
                  const f = FIELD_LABELS[field];
                  return (
                    <div key={field}>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{f.label}</label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        value={values[field] || ""}
                        onChange={(e) => setValues(v => ({ ...v, [field]: e.target.value }))}
                        className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm text-muted-foreground hover:bg-secondary transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <><Plus className="h-4 w-4" /> Save</>
                  )}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Floating Quick-Add Button
export const QuickAddFAB = ({ onAdd }: { onAdd: (type: "lead" | "invoice" | "budget") => void }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-16 left-0 flex flex-col gap-2"
          >
            {([
              { type: "lead" as const, label: "Lead", icon: Target },
              { type: "invoice" as const, label: "Invoice", icon: FileText },
              { type: "budget" as const, label: "Budget", icon: DollarSign },
            ]).map(({ type, label, icon: I }) => (
              <motion.button
                key={type}
                onClick={() => { onAdd(type); setOpen(false); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-xl bg-card border border-border px-4 py-2.5 text-sm font-medium text-foreground shadow-lg hover:bg-secondary transition-all whitespace-nowrap"
              >
                <I className="h-4 w-4 text-primary" /> {label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg transition-all ${open ? "bg-destructive text-destructive-foreground rotate-45" : "bg-accent text-accent-foreground"}`}
      >
        <Plus className="h-5 w-5" />
      </motion.button>
    </div>
  );
};
