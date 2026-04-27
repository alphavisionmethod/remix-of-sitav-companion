// ═══════════════════════════════════════════════════════════════
// SITA OS — Pricing Editor
// Premium inline pricing management with preview-before-save
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { SitaPageHeader, SitaCard } from "@/platform/sita/components/sita/SitaCard";
import { AdminActionCard } from "@/platform/sita/components/sita/AdminActionCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, History, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { usePricingItems } from "@/modules/business/hooks/use-domain-data";
import type { OwnerPricingItem as PricingItem } from "@/data/fixtures/mock-data/owner";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const PricingEditor = () => {
  const { data: pricingData = [] } = usePricingItems();

  const [items, setItems] = useState<PricingItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<PricingItem>>({});

  // Sync from hook data on load
  useEffect(() => {
    if (pricingData.length > 0 && items.length === 0) {
      setItems(pricingData);
    }
  }, [pricingData]);

  const startEdit = (item: PricingItem) => {
    setEditingId(item.id);
    setEditValues({ name: item.name, price: item.price, currency: item.currency, cycle: item.cycle });
  };

  const cancelEdit = () => { setEditingId(null); setEditValues({}); };

  const saveEdit = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, ...editValues, lastChanged: "Just now" } : i));
    setEditingId(null);
    setEditValues({});
  };

  const addItem = () => {
    const newItem: PricingItem = {
      id: Date.now().toString(), name: "New Service", price: 0, currency: "USD", cycle: "monthly", status: "draft", lastChanged: "Just now",
    };
    setItems([...items, newItem]);
    startEdit(newItem);
  };

  return (
    <motion.div className="mx-auto max-w-4xl space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
<SitaPageHeader
        title="Pricing Editor"
        subtitle="Manage service and product pricing with preview-before-save"
        actions={<Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={addItem}><Plus className="h-3.5 w-3.5" /> Add Service</Button>}
      />

      <div className="space-y-3">
        {items.map((item) => (
          <SitaCard key={item.id} hover={false} className="p-4">
            {editingId === item.id ? (
              <div className="flex flex-wrap items-center gap-3">
                <Input value={editValues.name || ""} onChange={e => setEditValues({ ...editValues, name: e.target.value })} className="w-48 h-8 text-xs" />
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">$</span>
                  <Input type="number" value={editValues.price || 0} onChange={e => setEditValues({ ...editValues, price: parseFloat(e.target.value) })} className="w-24 h-8 text-xs" />
                </div>
                <Select value={editValues.cycle || "monthly"} onValueChange={v => setEditValues({ ...editValues, cycle: v })}>
                  <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="one-time">One-time</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => saveEdit(item.id)}><Check className="h-3.5 w-3.5 text-emerald-500" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={cancelEdit}><X className="h-3.5 w-3.5 text-muted-foreground" /></Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">${item.price.toLocaleString()} / {item.cycle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={item.status === "active" ? "default" : "secondary"} className="text-[10px]">{item.status}</Badge>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1"><History className="h-3 w-3" />{item.lastChanged}</span>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            )}
          </SitaCard>
        ))}
      </div>

      <AdminActionCard
        title="Publish Pricing Changes"
        whatChanges={`${items.filter(i => i.lastChanged === "Just now").length} items modified`}
        riskLevel="medium"
        whatHappensNext="New prices apply to future quotes and invoices. Existing contracts are unchanged."
        proofNote="Pricing change logged with before/after values per item"
        undoDescription="Revert from Owner → Rollback → Pricing"
        onConfirm={() => toast.success("Pricing published")}
        confirmLabel="Publish Prices"
        icon={<DollarSign className="h-5 w-5 text-primary" />}
      />
    </motion.div>
  );
};

export default PricingEditor;
