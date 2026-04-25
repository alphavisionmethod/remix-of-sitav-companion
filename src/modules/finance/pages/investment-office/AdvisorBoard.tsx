import { AdvisorCouncilShell, type AdvisorConfig } from "@/platform/advisors/components/advisors/AdvisorCouncilShell";
import { INVESTMENT_ADVISORS } from "@/hooks/useInvestmentOfficeData";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

// Map investment advisors to AdvisorConfig format for the shared shell
const mapToAdvisorConfig = (): AdvisorConfig[] =>
  INVESTMENT_ADVISORS.map((adv) => ({
    id: adv.id,
    name: adv.name,
    role: adv.title,
    domain: "money" as const,
    confidence: adv.confidence,
    status: "active" as const,
    mission: adv.mission,
    specialAbility: `${adv.domain} specialist · ${adv.riskSensitivity} risk · ${adv.timeHorizonFocus.replace("-", " ")}`,
    advisorId: adv.id,
  }));

export default function AdvisorBoard() {
  const advisors = mapToAdvisorConfig();

  return (
    <div className="mx-auto max-w-7xl space-y-5">
<div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          Investment Advisor Council
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Multi-angle intelligence from a structured council of specialized advisors
        </p>
      </div>
      <AdvisorCouncilShell
        advisors={advisors}
        domainLabel="Investment"
      />
    </div>
  );
}
