import { toast } from "sonner";
import { motion } from "framer-motion";
import { Target, MousePointer, Shield, Smartphone, FormInput, TrendingUp, AlertTriangle, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DPOSubNav from "./DPOSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { PremiumEmptyState } from "@/components/sita/PremiumEmptyState";

export default function CROOffice() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
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
    </div>
  );
}
