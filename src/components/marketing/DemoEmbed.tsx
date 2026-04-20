// Inline animated demo loop — pure CSS/SVG, no kernel boot.
// Visualises: invoice gets paid → reserves rise → concierge reminder clears.
import { motion } from "framer-motion";
import { Check, Wallet, Receipt, Calendar } from "lucide-react";

export function DemoEmbed() {
  return (
    <div className="relative mx-auto w-full max-w-5xl rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl p-4 md:p-6 shadow-2xl">
      <div className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top, hsl(var(--primary) / 0.10), transparent 60%)" }} />

      {/* Faux desktop frame */}
      <div className="relative grid gap-4 md:grid-cols-3">
        {/* Invoices widget */}
        <DemoCard title="Invoices" icon={<Receipt className="h-4 w-4" />} delay={0}>
          <ul className="space-y-2 text-sm">
            <DemoRow label="Acme Inc · $4,200" status="paid" delay={0.4} />
            <DemoRow label="North Co · $1,150" status="due" />
            <DemoRow label="Lumen Ltd · $980" status="due" />
          </ul>
        </DemoCard>

        {/* Reserves widget */}
        <DemoCard title="Reserves" icon={<Wallet className="h-4 w-4" />} delay={0.2}>
          <div className="space-y-2">
            <div className="text-2xl font-bold tabular-nums">
              <Counter from={48800} to={53000} delay={0.7} />
            </div>
            <div className="text-xs text-muted-foreground">Operating runway · 8.4 months</div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: "62%" }}
                animate={{ width: "74%" }}
                transition={{ delay: 0.9, duration: 1.2 }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          </div>
        </DemoCard>

        {/* Concierge widget */}
        <DemoCard title="Concierge" icon={<Calendar className="h-4 w-4" />} delay={0.4}>
          <ul className="space-y-2 text-sm">
            <ConciergeRow label="Chase Acme invoice" cleared delay={1.4} />
            <ConciergeRow label="Review North Co contract" />
            <ConciergeRow label="Block Friday for ops review" />
          </ul>
        </DemoCard>
      </div>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        Live cross-domain story: invoice paid → reserves rise → concierge reminder clears — autoplaying.
      </p>
    </div>
  );
}

function DemoCard({ title, icon, children, delay = 0 }: { title: string; icon: React.ReactNode; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="rounded-xl border border-border/40 bg-background/60 backdrop-blur p-4"
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        <span className="h-6 w-6 rounded-md bg-primary/15 text-primary inline-flex items-center justify-center">{icon}</span>
        {title}
      </div>
      {children}
    </motion.div>
  );
}

function DemoRow({ label, status, delay = 0 }: { label: string; status: "paid" | "due"; delay?: number }) {
  return (
    <li className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-md hover:bg-muted/40">
      <span className="truncate">{label}</span>
      {status === "paid" ? (
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay, type: "spring", stiffness: 250 }}
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400"
        >
          PAID
        </motion.span>
      ) : (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">DUE</span>
      )}
    </li>
  );
}

function ConciergeRow({ label, cleared, delay = 0 }: { label: string; cleared?: boolean; delay?: number }) {
  return (
    <li className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/40">
      {cleared ? (
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay, type: "spring" }}
          className="h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-400 inline-flex items-center justify-center"
        >
          <Check className="h-3 w-3" />
        </motion.span>
      ) : (
        <span className="h-4 w-4 rounded-full border border-border" />
      )}
      <span className={cleared ? "line-through text-muted-foreground" : ""}>{label}</span>
    </li>
  );
}

function Counter({ from, to, delay = 0 }: { from: number; to: number; delay?: number }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.6 }}
    >
      ${to.toLocaleString()}
    </motion.span>
  );
}
