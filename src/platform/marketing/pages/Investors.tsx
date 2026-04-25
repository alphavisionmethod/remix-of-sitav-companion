import { MarketingShell } from "@/platform/marketing/components/marketing/MarketingShell";
import { MarketingSeo } from "@/platform/marketing/components/marketing/MarketingSeo";
import { InvestorForm } from "@/platform/marketing/components/marketing/InvestorForm";

const TRACTION = [
  { k: "Architecture", v: "5 planes · 30 BLOCK gates · 100% RLS" },
  { k: "Codebase", v: "200+ tables · 84+ edge functions · 459 audited artifacts" },
  { k: "Distribution", v: "Web · PWA · macOS · Windows · Linux · Ubuntu ISO" },
  { k: "Differentiator", v: "On-device sovereignty · proof receipts on every action" },
];

const COMPARE = [
  { feature: "On-device by default", sita: true, chatgpt: false, notion: false, erp: false },
  { feature: "Verifiable receipts", sita: true, chatgpt: false, notion: false, erp: false },
  { feature: "Cross-domain advisors", sita: true, chatgpt: false, notion: false, erp: true },
  { feature: "Owner-first design", sita: true, chatgpt: false, notion: false, erp: false },
  { feature: "Roll-back any action", sita: true, chatgpt: false, notion: false, erp: false },
];

export default function MarketingInvestors() {
  return (
    <MarketingShell>
      <MarketingSeo title="SITA OS — Investor brief" description="Thesis, traction, and deal-room access for qualified investors." />
      <section className="px-4 md:px-8 py-16 max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">A category-defining wedge.</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            On-device, receipt-first, advisor-driven OS for owners. The first software that proves what it did and lets you roll it back.
          </p>
        </header>

        <h2 className="text-2xl font-bold mb-4">Traction snapshot</h2>
        <div className="grid gap-3 md:grid-cols-2 mb-12">
          {TRACTION.map((t) => (
            <div key={t.k} className="rounded-xl border border-border/40 bg-card/40 p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{t.k}</div>
              <div className="text-sm font-medium mt-1">{t.v}</div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-4">vs the alternatives</h2>
        <div className="rounded-xl border border-border/40 overflow-x-auto mb-12">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="p-3">Capability</th>
                <th className="p-3 text-center">SITA</th>
                <th className="p-3 text-center">ChatGPT</th>
                <th className="p-3 text-center">Notion AI</th>
                <th className="p-3 text-center">Traditional ERP</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((r) => (
                <tr key={r.feature} className="border-t border-border/30">
                  <td className="p-3">{r.feature}</td>
                  <td className="p-3 text-center">{r.sita ? "✅" : "—"}</td>
                  <td className="p-3 text-center">{r.chatgpt ? "✅" : "—"}</td>
                  <td className="p-3 text-center">{r.notion ? "✅" : "—"}</td>
                  <td className="p-3 text-center">{r.erp ? "✅" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-2xl font-bold mb-4">Request deal-room access</h2>
        <InvestorForm />
      </section>
    </MarketingShell>
  );
}
