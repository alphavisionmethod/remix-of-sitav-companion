import { SitaPageHeader } from "@/platform/sita/components/sita/SitaCard";
import { CustomerHealthDashboard } from "@/modules/business/components/business/CustomerHealthDashboard";
import { PageShell } from "@/platform/sita/components/sita/PageShell";
import { Typography } from "@/platform/sita/components/sita/Typography";

const CustomerHealthPage = () => (
  <PageShell width="wide">
    <SitaPageHeader title="Customer Health" subtitle="Lifecycle stages, health scores, and churn risk across your portfolio" />
    <CustomerHealthDashboard />
  </PageShell>
);

export default CustomerHealthPage;
