import { Navigate, useParams } from "react-router-dom";
import { AdvisorPageShell } from "@/components/business-advisors/AdvisorPageShell";
import { getBusinessAdvisor } from "@/lib/ai-platform/runtime";
import { SalesAdvisorRecommendations } from "@/components/business-advisors/sales/SalesAdvisorRecommendations";
import { SalesAdvisorSimulationForm } from "@/components/business-advisors/sales/SalesAdvisorSimulationForm";
import { SalesAdvisorHeaderStats } from "@/components/business-advisors/sales/SalesAdvisorHeaderStats";
import { CustomerServiceRecommendations } from "@/components/business-advisors/customer-service/CustomerServiceRecommendations";
import { CustomerServiceSimulationForm } from "@/components/business-advisors/customer-service/CustomerServiceSimulationForm";
import { CustomerServiceHeaderStats } from "@/components/business-advisors/customer-service/CustomerServiceHeaderStats";

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
  return <AdvisorPageShell advisor={advisor} />;
}