import { Link } from "react-router-dom";
import { Shield, FileText, CheckSquare, Key, Bot, ScrollText, Smartphone, AlertTriangle, Database, Sparkles, GitBranch, ShieldCheck } from "lucide-react";

const tiles = [
  { to: "/trust/receipts", icon: FileText, label: "Receipts", desc: "Every action, signed and explainable" },
  { to: "/trust/approvals", icon: CheckSquare, label: "Approvals", desc: "What needs your authority" },
  { to: "/trust/permissions", icon: Key, label: "Permissions", desc: "What each module can touch" },
  { to: "/trust/automation-authority", icon: Bot, label: "Automation Authority", desc: "Autonomy levels per advisor" },
  { to: "/trust/audit", icon: ScrollText, label: "Audit Log", desc: "Full history, immutable" },
  { to: "/trust/decisions", icon: GitBranch, label: "Decisions", desc: "Architectural ownership map" },
  { to: "/trust/coverage", icon: ShieldCheck, label: "Coverage", desc: "Mutations registered with the Trust layer" },
  { to: "/trust/devices", icon: Smartphone, label: "Devices & Sessions", desc: "Where you are signed in" },
  { to: "/trust/threats", icon: AlertTriangle, label: "Threats", desc: "Suspicious activity & holds" },
  { to: "/trust/retention", icon: Database, label: "Data Retention", desc: "What is kept and for how long" },
  { to: "/trust/explain", icon: Sparkles, label: "Explainability", desc: "Why the system did that" },
];

export default function TrustHome() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-semibold">Trust Center</h1>
          <p className="text-muted-foreground">Receipts, security, and automation under your authority.</p>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiles.map(({ to, icon: Icon, label, desc }) => (
          <Link key={to} to={to} className="group rounded-lg border bg-card p-4 hover:bg-accent transition-colors">
            <div className="flex items-start gap-3">
              <Icon className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="font-medium group-hover:text-primary">{label}</div>
                <div className="text-sm text-muted-foreground">{desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}