import FleetHealthWidget from "@/components/admin/FleetHealthWidget";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

export default function FleetHealthPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <DemoModeBadge />
      <FleetHealthWidget />
    </div>
  );
}
