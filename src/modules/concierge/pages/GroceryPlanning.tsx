import { KPITile, SitaTabs, EmptyState } from "@/platform/sita/components/sita/SitaComponents";
import { TrustBadge } from "@/platform/sita/components/sita/TrustBadge";
import { GroceryContinuityCard } from "@/platform/sita/components/sita/HouseholdComponents";
import { ConciergeAdvisorInsightCard, ConciergePageWrapper, ConciergeEmptyState } from "@/components/concierge";
import { ShoppingCart, Plus, Check, Clock, DollarSign, Leaf, AlertCircle, RotateCcw, Sparkles, Store, CalendarCheck, Plane } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { useGroceryLists } from "@/hooks/use-concierge-data";
// Production fallback — seed data removed
const categories: any[] = [];
const stores: any[] = [];
const recurringSupplies: any[] = [];

interface GroceryItem {
  id: string; name: string; category: string; quantity: string; estimated: string;
  checked: boolean; recurring?: boolean; urgent?: boolean; note?: string; store?: string;
}

const initialItems: GroceryItem[] = [
  { id: "1", name: "Organic whole milk", category: "Dairy", quantity: "1 gallon", estimated: "$6.99", checked: false, recurring: true, store: "Whole Foods" },
  { id: "2", name: "Chicken breast", category: "Protein", quantity: "2 lbs", estimated: "$11.99", checked: false, store: "Whole Foods" },
  { id: "3", name: "Bananas", category: "Produce", quantity: "1 bunch", estimated: "$1.49", checked: false, recurring: true, store: "Trader Joe's" },
  { id: "4", name: "Spinach — organic", category: "Produce", quantity: "1 bag", estimated: "$4.99", checked: false, store: "Whole Foods" },
  { id: "5", name: "Bread — whole wheat", category: "Bakery", quantity: "1 loaf", estimated: "$4.49", checked: true, recurring: true, store: "Trader Joe's" },
  { id: "6", name: "Eggs — free range", category: "Dairy", quantity: "1 dozen", estimated: "$5.99", checked: false, recurring: true, store: "Whole Foods" },
  { id: "7", name: "Pasta — penne", category: "Pantry", quantity: "2 boxes", estimated: "$3.98", checked: true, store: "Trader Joe's" },
  { id: "8", name: "Olive oil", category: "Pantry", quantity: "1 bottle", estimated: "$8.99", checked: false, note: "Running low — restock cycle", store: "Whole Foods" },
  { id: "9", name: "Kids' yogurt tubes", category: "Dairy", quantity: "1 pack (12)", estimated: "$6.49", checked: false, recurring: true, store: "Trader Joe's" },
  { id: "10", name: "Laundry detergent", category: "Household", quantity: "1", estimated: "$12.99", checked: false, urgent: true, note: "Out of stock at home", store: "Target" },
  { id: "11", name: "Paper towels", category: "Household", quantity: "6 rolls", estimated: "$8.99", checked: false, store: "Target" },
  { id: "12", name: "Apples — Honeycrisp", category: "Produce", quantity: "6", estimated: "$5.99", checked: false, store: "Whole Foods" },
  { id: "13", name: "Cheddar cheese", category: "Dairy", quantity: "1 block", estimated: "$4.99", checked: false, store: "Trader Joe's" },
  { id: "14", name: "Cereal — kids mix", category: "Pantry", quantity: "2 boxes", estimated: "$7.98", checked: false, recurring: true, store: "Target" },
];

type GroceryView = "shopping" | "recurring" | "by-store" | "urgency" | "event-prep";

const GroceryPlanning = () => {
  const [items, setItems] = useState(initialItems);
  const [view, setView] = useState<GroceryView>("shopping");
  const [newItem, setNewItem] = useState("");

  const toggleItem = (id: string) => setItems(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));

  const checkedCount = items.filter(i => i.checked).length;
  const totalEstimate = items.reduce((sum, i) => sum + parseFloat(i.estimated.replace("$", "")), 0);
  const remainingEstimate = items.filter(i => !i.checked).reduce((sum, i) => sum + parseFloat(i.estimated.replace("$", "")), 0);
  const urgentCount = items.filter(i => i.urgent).length;

  const groupedByStore = ([] as typeof stores).reduce((acc, store) => {
    acc[store!] = items.filter(i => i.store === store && !i.checked);
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  return (
    <ConciergePageWrapper className="space-y-6">
      <PageTruthBanner />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KPITile label="Items" value={String(items.length)} icon={ShoppingCart} sub={`${checkedCount} checked`} />
        <KPITile label="Estimated" value={`$${totalEstimate.toFixed(0)}`} icon={DollarSign} />
        <KPITile label="Remaining" value={`$${remainingEstimate.toFixed(0)}`} icon={Clock} />
        <KPITile label="Recurring" value={String(items.filter(i => i.recurring).length)} icon={RotateCcw} sub="Auto-tracked" />
        <KPITile label="Urgent" value={String(urgentCount)} icon={AlertCircle} sub={urgentCount > 0 ? "Out of stock" : "All stocked"} />
      </div>

      <SitaTabs
        tabs={[
          { key: "shopping", label: "Shopping Now" },
          { key: "recurring", label: "Recurring Supplies" },
          { key: "by-store", label: "By Store" },
          { key: "urgency", label: "Urgent" },
          { key: "event-prep", label: "Event/Trip Prep" },
        ]}
        active={view}
        onChange={(k) => setView(k as GroceryView)}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {view === "recurring" && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[hsl(0_0%_50%)]">Recurring Supply Status</h3>
              {([] as typeof recurringSupplies).map((s, i) => (
                <GroceryContinuityCard key={i} item={s.item} lastPurchased={s.lastPurchased} cycle={s.cycle} status={s.status} />
              ))}
            </div>
          )}

          {view === "by-store" && (
            <div className="space-y-5">
              {([] as typeof stores).map((store) => {
                const storeItems = groupedByStore[store!] || [];
                if (storeItems.length === 0) return null;
                return (
                  <div key={store}>
                    <div className="flex items-center gap-2 mb-2">
                      <Store className="h-3.5 w-3.5 text-primary" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{store}</h3>
                      <span className="text-[10px] text-muted-foreground">({storeItems.length} items)</span>
                    </div>
                    <div className="space-y-1.5">
                      {storeItems.map((item) => (
                        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-3 micro-hover-lift" key={item.id} >
                          <div className="flex items-center gap-3">
                            <button onClick={() => toggleItem(item.id)} className="h-5 w-5 rounded-md border-2 border-muted-foreground/30 hover:border-primary shrink-0 flex items-center justify-center transition-all" />
                            <span className="text-sm font-medium text-foreground flex-1">{item.name}</span>
                            <span className="text-xs text-muted-foreground">{item.quantity}</span>
                            <span className="text-xs font-medium text-foreground w-14 text-right">{item.estimated}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {view === "event-prep" && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[hsl(0_0%_50%)]">Event & Trip Shopping</h3>
              <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift">
                <div className="flex items-center gap-2 mb-2">
                  <Plane className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Spring Break Trip — Apr 10</p>
                </div>
                <div className="space-y-1.5 ml-6">
                  {["Sunscreen SPF 50", "Travel-size toiletries", "Snacks for flight", "Kids' entertainment packs"].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-3.5 w-3.5 rounded border border-muted-foreground/30 shrink-0" />
                      <span className="text-xs text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarCheck className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Mom's Birthday — Apr 14</p>
                </div>
                <div className="space-y-1.5 ml-6">
                  {["Birthday card", "Cake ingredients (flour, sugar, vanilla)", "Candles"].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-3.5 w-3.5 rounded border border-muted-foreground/30 shrink-0" />
                      <span className="text-xs text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(view === "shopping" || view === "urgency") && items.filter(i => view === "urgency" ? (i.urgent || i.note?.toLowerCase().includes("low") || i.note?.toLowerCase().includes("out")) : true).length === 0 && (
            <ConciergeEmptyState domain="grocery" icon={ShoppingCart} />
          )}
          {(view === "shopping" || view === "urgency") && ([] as typeof categories).map((cat) => {
            let catItems = items.filter(i => i.category === cat);
            if (view === "urgency") catItems = catItems.filter(i => i.urgent || i.note?.toLowerCase().includes("low") || i.note?.toLowerCase().includes("out"));
            if (catItems.length === 0) return null;
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{cat}</h3>
                  <span className="text-[10px] text-muted-foreground">({catItems.length})</span>
                </div>
                <div className="space-y-1.5">
                  {catItems.map((item) => (
                    <div key={item.id} className={`rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-3 micro-hover-lift transition-opacity ${item.checked ? "opacity-50" : ""}`}>
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleItem(item.id)} className={`h-5 w-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all ${item.checked ? "bg-primary border-primary" : "border-muted-foreground/30 hover:border-primary"}`}>
                          {item.checked && <Check className="h-3 w-3 text-primary-foreground" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${item.checked ? "line-through text-muted-foreground" : "text-foreground"}`}>{item.name}</span>
                            {item.recurring && <Leaf className="h-3 w-3 text-chart-2" />}
                            {item.urgent && <AlertCircle className="h-3 w-3 text-destructive" />}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {item.note && <span className="text-[10px] text-muted-foreground">{item.note}</span>}
                            {item.store && <span className="text-[10px] text-muted-foreground/50">· {item.store}</span>}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{item.quantity}</span>
                        <span className="text-xs font-medium text-foreground shrink-0 w-14 text-right">{item.estimated}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-6">
          {/* Quick Add */}
          <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift">
            <h4 className="text-[13px] font-semibold text-[hsl(0_0%_85%)] mb-3">Quick Add</h4>
            <div className="flex gap-2">
              <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Add item..." className="flex-1 rounded-lg border border-border/50 bg-secondary/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
              <button className="rounded-lg bg-primary px-3 py-2 text-primary-foreground hover:bg-primary/90 transition-colors"><Plus className="h-4 w-4" /></button>
            </div>
          </div>

          {/* Budget Summary */}
          <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift">
            <h4 className="text-[13px] font-semibold text-[hsl(0_0%_85%)] mb-3">Budget Summary</h4>
            <div className="space-y-2.5">
              <div className="flex justify-between"><span className="text-xs text-muted-foreground">Estimated total</span><span className="text-sm font-semibold text-foreground">${totalEstimate.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-xs text-muted-foreground">Checked off</span><span className="text-sm text-muted-foreground">${(totalEstimate - remainingEstimate).toFixed(2)}</span></div>
              <div className="border-t border-border/30 pt-2 flex justify-between"><span className="text-xs font-medium text-foreground">Remaining</span><span className="text-sm font-semibold text-primary">${remainingEstimate.toFixed(2)}</span></div>
            </div>
            <div className="rounded-lg bg-secondary/30 p-2.5 mt-3">
              <p className="text-[10px] text-muted-foreground">Weekly average: $142 · This list is {Math.round(((totalEstimate - 142) / 142) * 100)}% {totalEstimate > 142 ? "over" : "under"} average</p>
              <p className="text-[10px] text-primary mt-1">↗ Cross-referenced with Money Center</p>
            </div>
          </div>

          {/* Store Route */}
          <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift">
            <h4 className="text-[13px] font-semibold text-[hsl(0_0%_85%)] mb-3">Optimized Store Route</h4>
            <div className="space-y-2">
              {([] as typeof stores).map((store, i) => {
                const count = items.filter(it => it.store === store && !it.checked).length;
                if (count === 0) return null;
                return (
                  <div key={store} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{i + 1}</div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">{store}</p>
                      <p className="text-[10px] text-muted-foreground">{count} items</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grocery Advisor */}
          <ConciergeAdvisorInsightCard insight={{
            role: "Shopping Advisor",
            message: "Laundry detergent is out of stock — add to your Target run. Based on this week's meal plan, you may also need ricotta cheese, fresh basil, and ground turkey. Olive oil is approaching restock cycle.",
            linkedItems: ["Meal plan — this week", "Spring break prep"],
            confidence: "high",
          }} />
        </div>
      </div>
    </ConciergePageWrapper>
  );
};

export default GroceryPlanning;
