import { SitaPageHeader } from "@/platform/sita/components/sita/SitaCard";
import { CustomerHealthDashboard } from "@/modules/business/components/business/CustomerHealthDashboard";
import { PageShell } from "@/platform/sita/components/sita/PageShell";
import { useCustomers } from "@/modules/business/hooks/use-domain-data";

const CustomerHealthPage = () => {
  // Truth-anchored portfolio sizing — drives the subtitle and ensures
  // this page participates in the customer-data fetch graph.
  const { data: customers = [], isLoading } = useCustomers();
  const subtitle = isLoading
    ? "Loading lifecycle stages, health scores, and churn risk…"
    : `Lifecycle stages, health scores, and churn risk across ${customers.length} customer${customers.length === 1 ? "" : "s"}`;
  return (
    <PageShell width="wide">
      <SitaPageHeader title="Customer Health" subtitle={subtitle} />
      <CustomerHealthDashboard />
    </PageShell>
  );
};

export default CustomerHealthPage;
