import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, MapPin, DollarSign, Star, Clock, Shield, History } from "lucide-react";

export interface VendorDetail {
  id: string;
  name: string;
  category: string;
  phone: string;
  location: string;
  costRange: string;
  rating: number;
  trusted: boolean;
  totalSpent: string;
  responseTime: string;
  nextAction?: string;
  history: { date: string; description: string; cost: string; rating?: number }[];
}

export const VendorDetailPanel = ({ vendor, open, onClose, className }: {
  vendor: VendorDetail | null;
  open: boolean;
  onClose: () => void;
  className?: string;
}) => (
  <AnimatePresence>
    {open && vendor && (
      <motion.div
        className={cn("rounded-2xl border border-border/50 bg-card p-5 shadow-lg", className)}
        initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              {vendor.name}
              {vendor.trusted && <Shield className="h-3.5 w-3.5 text-chart-2" />}
            </h3>
            <p className="text-[10px] text-muted-foreground">{vendor.category}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-secondary transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { icon: Phone, label: vendor.phone },
            { icon: MapPin, label: vendor.location },
            { icon: DollarSign, label: vendor.costRange },
            { icon: Clock, label: `Response: ${vendor.responseTime}` },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <item.icon className="h-3 w-3 shrink-0" />{item.label}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2 mb-4">
          <span className="text-[10px] text-muted-foreground">Total Spent</span>
          <span className="text-xs font-bold text-foreground">{vendor.totalSpent}</span>
        </div>
        <div className="flex items-center gap-1 mb-1">
          <Star className="h-3 w-3 text-[hsl(var(--sita-gold))] fill-[hsl(var(--sita-gold))]" />
          <span className="text-xs font-medium text-foreground">{vendor.rating}</span>
        </div>
        {vendor.nextAction && (
          <div className="mt-3 rounded-lg bg-primary/5 border border-primary/10 px-3 py-2">
            <p className="text-[10px] text-primary font-medium">Next: {vendor.nextAction}</p>
          </div>
        )}
        {vendor.history.length > 0 && (
          <div className="mt-4">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
              <History className="h-3 w-3" />Service History
            </p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {vendor.history.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-[10px] rounded-lg bg-secondary/15 px-2.5 py-1.5">
                  <span className="text-foreground truncate">{h.description}</span>
                  <span className="text-muted-foreground shrink-0 ml-2">{h.cost}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    )}
  </AnimatePresence>
);
