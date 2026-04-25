import { Navigate, useParams } from "react-router-dom";
import { AdvisorPageShell } from "@/modules/business/components/business-advisors/AdvisorPageShell";
import { getBusinessAdvisor } from "@/lib/ai-platform/runtime";
import { SalesAdvisorRecommendations } from "@/modules/business/components/business-advisors/sales/SalesAdvisorRecommendations";
import { SalesAdvisorSimulationForm } from "@/modules/business/components/business-advisors/sales/SalesAdvisorSimulationForm";
import { SalesAdvisorHeaderStats } from "@/modules/business/components/business-advisors/sales/SalesAdvisorHeaderStats";
import { CustomerServiceRecommendations } from "@/modules/business/components/business-advisors/customer-service/CustomerServiceRecommendations";
import { CustomerServiceSimulationForm } from "@/modules/business/components/business-advisors/customer-service/CustomerServiceSimulationForm";
import { CustomerServiceHeaderStats } from "@/modules/business/components/business-advisors/customer-service/CustomerServiceHeaderStats";
import { CFOAdvisorRecommendations } from "@/modules/business/components/business-advisors/cfo/CFOAdvisorRecommendations";
import { CFOAdvisorSimulationForm } from "@/modules/business/components/business-advisors/cfo/CFOAdvisorSimulationForm";
import { CFOAdvisorHeaderStats } from "@/modules/business/components/business-advisors/cfo/CFOAdvisorHeaderStats";
import { MarketingAdvisorRecommendations } from "@/modules/business/components/business-advisors/marketing/MarketingAdvisorRecommendations";
import { MarketingAdvisorSimulationForm } from "@/modules/business/components/business-advisors/marketing/MarketingAdvisorSimulationForm";
import { MarketingAdvisorHeaderStats } from "@/modules/business/components/business-advisors/marketing/MarketingAdvisorHeaderStats";
import { GrowthAdvisorRecommendations } from "@/modules/business/components/business-advisors/growth/GrowthAdvisorRecommendations";
import { GrowthAdvisorSimulationForm } from "@/modules/business/components/business-advisors/growth/GrowthAdvisorSimulationForm";
import { GrowthAdvisorHeaderStats } from "@/modules/business/components/business-advisors/growth/GrowthAdvisorHeaderStats";
import { TechAdvisorRecommendations } from "@/modules/business/components/business-advisors/tech/TechAdvisorRecommendations";
import { TechAdvisorSimulationForm } from "@/modules/business/components/business-advisors/tech/TechAdvisorSimulationForm";
import { TechAdvisorHeaderStats } from "@/modules/business/components/business-advisors/tech/TechAdvisorHeaderStats";
import { ImportsExportsRecommendations } from "@/modules/business/components/business-advisors/imports-exports/ImportsExportsRecommendations";
import { ImportsExportsSimulationForm } from "@/modules/business/components/business-advisors/imports-exports/ImportsExportsSimulationForm";
import { ImportsExportsHeaderStats } from "@/modules/business/components/business-advisors/imports-exports/ImportsExportsHeaderStats";
import { TaxesLawsRecommendations } from "@/modules/business/components/business-advisors/taxes-laws/TaxesLawsRecommendations";
import { TaxesLawsSimulationForm } from "@/modules/business/components/business-advisors/taxes-laws/TaxesLawsSimulationForm";
import { TaxesLawsHeaderStats } from "@/modules/business/components/business-advisors/taxes-laws/TaxesLawsHeaderStats";
import { CEOAdvisorRecommendations } from "@/modules/business/components/business-advisors/ceo/CEOAdvisorRecommendations";
import { CEOAdvisorSimulationForm } from "@/modules/business/components/business-advisors/ceo/CEOAdvisorSimulationForm";
import { CEOAdvisorHeaderStats } from "@/modules/business/components/business-advisors/ceo/CEOAdvisorHeaderStats";
import { CEOSimulationComparisonRunner } from "@/modules/business/components/business-advisors/ceo/CEOSimulationComparisonRunner";
import { CEOApprovalCenter } from "@/modules/business/components/business-advisors/ceo/CEOApprovalCenter";

export default function BusinessAdvisorPage() {
  const { advisorId } = useParams<{ advisorId: string }>();
  const advisor = advisorId ? getBusinessAdvisor(advisorId) : undefined;
  if (!advisor) {
    return <Navigate to="/business-advisors" replace />;
  }
  if (advisor.id === "sales-advisor") {
    return (
      <AdvisorPageShell
        advisor={advisor}
        headerStatsSlot={<SalesAdvisorHeaderStats />}
        recommendationsSlot={<SalesAdvisorRecommendations />}
        simulationFormSlot={<SalesAdvisorSimulationForm />}
      />
    );
  }
  if (advisor.id === "customer-service-advisor") {
    return (
      <AdvisorPageShell
        advisor={advisor}
        headerStatsSlot={<CustomerServiceHeaderStats />}
        recommendationsSlot={<CustomerServiceRecommendations />}
        simulationFormSlot={<CustomerServiceSimulationForm />}
      />
    );
  }
  if (advisor.id === "cfo-advisor") {
    return (
      <AdvisorPageShell
        advisor={advisor}
        headerStatsSlot={<CFOAdvisorHeaderStats />}
        recommendationsSlot={<CFOAdvisorRecommendations />}
        simulationFormSlot={<CFOAdvisorSimulationForm />}
      />
    );
  }
  if (advisor.id === "marketing-advertising-advisor") {
    return (
      <AdvisorPageShell
        advisor={advisor}
        headerStatsSlot={<MarketingAdvisorHeaderStats />}
        recommendationsSlot={<MarketingAdvisorRecommendations />}
        simulationFormSlot={<MarketingAdvisorSimulationForm />}
      />
    );
  }
  if (advisor.id === "growth-advisor") {
    return (
      <AdvisorPageShell
        advisor={advisor}
        headerStatsSlot={<GrowthAdvisorHeaderStats />}
        recommendationsSlot={<GrowthAdvisorRecommendations />}
        simulationFormSlot={<GrowthAdvisorSimulationForm />}
      />
    );
  }
  if (advisor.id === "tech-advisor") {
    return (
      <AdvisorPageShell
        advisor={advisor}
        headerStatsSlot={<TechAdvisorHeaderStats />}
        recommendationsSlot={<TechAdvisorRecommendations />}
        simulationFormSlot={<TechAdvisorSimulationForm />}
      />
    );
  }
  if (advisor.id === "imports-exports-advisor") {
    return (
      <AdvisorPageShell
        advisor={advisor}
        headerStatsSlot={<ImportsExportsHeaderStats />}
        recommendationsSlot={<ImportsExportsRecommendations />}
        simulationFormSlot={<ImportsExportsSimulationForm />}
      />
    );
  }
  if (advisor.id === "taxes-laws-advisor") {
    return (
      <AdvisorPageShell
        advisor={advisor}
        headerStatsSlot={<TaxesLawsHeaderStats />}
        recommendationsSlot={<TaxesLawsRecommendations />}
        simulationFormSlot={<TaxesLawsSimulationForm />}
      />
    );
  }
  if (advisor.id === "ceo-advisor") {
    return (
      <AdvisorPageShell
        advisor={advisor}
        headerStatsSlot={<CEOAdvisorHeaderStats />}
        recommendationsSlot={
          <div className="space-y-4">
            <CEOApprovalCenter />
            <CEOAdvisorRecommendations />
          </div>
        }
        simulationFormSlot={
          <div className="space-y-4">
            <CEOAdvisorSimulationForm />
            <CEOSimulationComparisonRunner />
          </div>
        }
      />
    );
  }
  return <AdvisorPageShell advisor={advisor} />;
}