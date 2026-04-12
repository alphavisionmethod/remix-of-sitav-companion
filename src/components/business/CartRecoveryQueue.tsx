import { SitaCard, SitaCardTitle, SitaButton } from "@/components/sita/SitaCard";
import { ShoppingCart, Clock, DollarSign, ArrowRight, Mail, X } from "lucide-react";
import { motion } from "framer-motion";

interface CartItem {
  id: string;
  customer: string;
  email?: string;
  cartValue: number;
  products: string[];
  lastActivity: string;
  recoveryWindow: string;
  draftReady: boolean;
  priorOutreach: number;
}

interface CartRecoveryQueueProps {
  title?: string;
  items: CartItem[];
  onRecover?: (id: string) => void;
  onDismiss?: (id: string) => void;
  maxItems?: number;
}

export function CartRecoveryQueue({ title = "Cart Recovery", items, onRecover, onDismiss, maxItems = 5 }: CartRecoveryQueueProps) {
  const visible = items.slice(0, maxItems);
  const totalValue = items.reduce((sum, i) => sum + i.cartValue, 0);

  return (
    <SitaCard hover={false} lane="opportunity" className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-chart-2" />
          <SitaCardTitle>{title}</SitaCardTitle>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-chart-2 bg-chart-2/10 px-2 py-0.5 rounded-full">
            ${totalValue.toLocaleString()} recoverable
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {visible.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 rounded-xl border border-chart-2/15 bg-chart-2/5 p-2.5"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-xs font-medium text-foreground truncate">{item.customer}</p>
                <span className="font-display text-xs font-bold text-chart-2">${item.cartValue.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-muted-foreground truncate">{item.products.slice(0, 2).join(", ")}{item.products.length > 2 ? ` +${item.products.length - 2}` : ""}</p>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{item.lastActivity}</span>
                {item.draftReady && <span className="text-chart-2 font-medium">Draft ready</span>}
                {item.priorOutreach > 0 && <span>{item.priorOutreach} prior outreach</span>}
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => onRecover?.(item.id)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-chart-2/10 text-chart-2 hover:bg-chart-2/20 transition-colors">
                <Mail className="h-3 w-3" />
              </button>
              <button onClick={() => onDismiss?.(item.id)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted transition-colors">
                <X className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {items.length > maxItems && (
        <p className="mt-2 text-center text-[10px] text-muted-foreground">+{items.length - maxItems} more carts to recover</p>
      )}
    </SitaCard>
  );
}
