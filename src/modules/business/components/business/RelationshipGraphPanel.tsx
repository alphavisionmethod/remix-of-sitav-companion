import { SitaCard, SitaCardTitle, SitaButton } from "@/platform/sita/components/sita/SitaCard";
import { TrustBadge } from "@/platform/sita/components/sita/TrustBadge";
import { motion } from "framer-motion";
import { Users, Building, Home, UserCheck, ArrowRight, Link2, Star, Phone, Mail, ShieldCheck } from "lucide-react";
import { useDataMode } from "@/contexts/DataModeContext";

interface RelationshipNode {
  id: string;
  name: string;
  type: "person" | "business" | "household" | "team-member";
  role: string;
  relationship: string;
  strength: "strong" | "moderate" | "weak";
  status: "active" | "inactive" | "new";
  email?: string;
  phone?: string;
}

interface RelationshipGraphPanelProps {
  customerName: string;
  customerId?: string;
}

const RELATIONSHIPS: RelationshipNode[] = [
  { id: "rel-1", name: "James Wilson", type: "person", role: "Spouse", relationship: "Household member", strength: "strong", status: "active", email: "james@example.com" },
  { id: "rel-2", name: "Wilson & Partners LLC", type: "business", role: "Business Owner", relationship: "Owns / operates", strength: "strong", status: "active" },
  { id: "rel-3", name: "The Wilson Household", type: "household", role: "Primary household", relationship: "Household account", strength: "strong", status: "active" },
  { id: "rel-4", name: "Sarah K.", type: "team-member", role: "Account Manager", relationship: "Assigned owner", strength: "moderate", status: "active", email: "sarah@team.com", phone: "+1 555-0102" },
  { id: "rel-5", name: "Dr. Patricia Chen", type: "person", role: "Referrer", relationship: "Referred by", strength: "moderate", status: "active" },
  { id: "rel-6", name: "Apex Industries", type: "business", role: "Employer", relationship: "Works at", strength: "weak", status: "inactive" },
];

const nodeTypeConfig = {
  person: { icon: Users, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  business: { icon: Building, color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/20" },
  household: { icon: Home, color: "text-chart-2", bg: "bg-chart-2/10", border: "border-chart-2/20" },
  "team-member": { icon: UserCheck, color: "text-chart-3", bg: "bg-chart-3/10", border: "border-chart-3/20" },
};

const strengthConfig = {
  strong: { label: "Strong", color: "text-chart-2", dots: 3 },
  moderate: { label: "Moderate", color: "text-amber-500", dots: 2 },
  weak: { label: "Weak", color: "text-muted-foreground", dots: 1 },
};

export function RelationshipGraphPanel({ customerName, customerId }: RelationshipGraphPanelProps) {
  const { isDemoMode } = useDataMode();
  return (
    <SitaCard hover={false} className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-primary" />
          <SitaCardTitle>Relationship Graph</SitaCardTitle>
        </div>
        <TrustBadge level="verified" size="sm" />
      </div>

      {/* Central Node */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-sita font-display text-base font-bold text-primary-foreground shadow-lg">
            {customerName.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-chart-2 border-2 border-card flex items-center justify-center">
            <Star className="h-2.5 w-2.5 text-primary-foreground" />
          </div>
        </div>
      </div>
      <p className="text-center text-xs font-medium text-foreground mb-1">{customerName}</p>
      <p className="text-center text-[10px] text-muted-foreground mb-4">Primary contact · {(isDemoMode ? RELATIONSHIPS : [] as typeof RELATIONSHIPS).length} connections</p>

      {/* Connection Lines Visual */}
      <div className="space-y-2">
        {(isDemoMode ? RELATIONSHIPS : [] as typeof RELATIONSHIPS).map((node, index) => {
          const config = nodeTypeConfig[node.type];
          const strength = strengthConfig[node.strength];
          const NodeIcon = config.icon;

          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              className={`flex items-center gap-3 rounded-xl border ${config.border} ${config.bg} p-3 transition-all hover:shadow-sm`}
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${config.bg} shrink-0`}>
                <NodeIcon className={`h-4 w-4 ${config.color}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">{node.name}</p>
                  <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${strength.color}`}>
                    {Array.from({ length: strength.dots }).map((_, i) => (
                      <span key={i} className={`inline-block h-1 w-1 rounded-full ${
                        node.strength === "strong" ? "bg-chart-2" :
                        node.strength === "moderate" ? "bg-amber-500" : "bg-muted-foreground"
                      }`} />
                    ))}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="font-medium">{node.role}</span>
                  <span>·</span>
                  <span>{node.relationship}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {node.email && (
                  <button className="rounded-lg p-1.5 hover:bg-background/60 transition-colors">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                  </button>
                )}
                {node.phone && (
                  <button className="rounded-lg p-1.5 hover:bg-background/60 transition-colors">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                  </button>
                )}
                <button className="rounded-lg p-1.5 hover:bg-background/60 transition-colors">
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 flex gap-2">
        <SitaButton variant="ghost" size="sm" className="flex-1 text-xs"><Users className="h-3 w-3" /> Add Connection</SitaButton>
        <SitaButton variant="ghost" size="sm" className="flex-1 text-xs"><ShieldCheck className="h-3 w-3" /> Verify Links</SitaButton>
      </div>
    </SitaCard>
  );
}
