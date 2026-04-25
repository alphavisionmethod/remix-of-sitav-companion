import { motion } from "framer-motion";
import { BookOpen, Globe, Shield, Cpu, Landmark, Wallet, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CANONICAL_DOMAIN_PACKS } from "@/lib/delivery-methodology/domain-packs";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const iconMap: Record<string, any> = {
  "money-office": Wallet, "revenue-office": BarChart3, "digital-presence": Globe,
  "ai-engineering": Cpu, "admin-control": Shield, "trust-proof": Landmark, connector: BookOpen,
};

const DomainMethodologyPacks = () => {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Domain Methodology Packs</h1>
        </div>
        <p className="text-muted-foreground">Per-domain discipline definitions — routes, shells, contracts, events, proofs, verification flows</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CANONICAL_DOMAIN_PACKS.map((pack) => {
          const Icon = iconMap[pack.domainKey] ?? BookOpen;
          return (
            <motion.div key={pack.domainKey} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Icon className="h-6 w-6 text-primary" />
                    <div>
                      <div>{pack.displayName}</div>
                      <div className="text-sm font-normal text-muted-foreground">{pack.description}</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Expected Routes</h4>
                    <div className="flex flex-wrap gap-1">{pack.expectedRoutes.map(r => <Badge key={r} variant="outline" className="text-xs font-mono">{r}</Badge>)}</div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Required Contracts</h4>
                    <div className="flex flex-wrap gap-1">{pack.requiredContracts.map(c => <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>)}</div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Expected Events</h4>
                    <div className="flex flex-wrap gap-1">{pack.expectedEvents.map(e => <Badge key={e} variant="outline" className="text-xs">{e}</Badge>)}</div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Required Proofs</h4>
                    <div className="flex flex-wrap gap-1">{pack.requiredProofs.map(p => <Badge key={p} variant="outline" className="text-xs">{p}</Badge>)}</div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Verification Flows</h4>
                    <div className="flex flex-wrap gap-1">{pack.verificationFlows.map(v => <Badge key={v} variant="outline" className="text-xs">{v}</Badge>)}</div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <span className="text-xs text-muted-foreground">Maturity Target:</span>
                    <Badge className={pack.maturityTarget === "proven" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}>{pack.maturityTarget}</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default DomainMethodologyPacks;
