import { toast } from "sonner";
import { motion } from "framer-motion";
import DPOSubNav from "./DPOSubNav";
import { PremiumEmptyState } from "@/components/sita/PremiumEmptyState";
import { PageShell } from "@/components/sita/PageShell";

export default function CROOffice() {
  return (
    <PageShell width="wide">
      <DPOSubNav />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Conversion Optimization Office</h1>
        <p className="text-sm text-muted-foreground">CTA analysis, trust gaps, funnel leaks, form friction & mobile UX</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <PremiumEmptyState
          variant="first-use"
          domain="business"
          title="Conversion analytics not connected"
          description="Connect your website analytics to see CTA performance, trust gaps, funnel leaks, form friction, and mobile UX issues."
          actions={[{ label: "Connect Analytics", onClick: () => toast.info("Analytics connection planned — coming in a future update") }]}
        />
      </div>
    </PageShell>
  );
}
