// Personal Brain — Phase 7 Tools page
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wrench } from "lucide-react";
import { GlobalErrorBoundary } from "@/platform/sita/components/sita/GlobalErrorBoundary";
import { PageShell } from "@/platform/sita/components/sita/PageShell";
import { Button } from "@/components/ui/button";
import { ToolsRegistryCard } from "@/platform/personal-brain/components/personal-brain/tools/ToolsRegistryCard";

function ToolsInner() {
  const navigate = useNavigate();
  return (
    <PageShell>
      <div className="mx-auto w-full max-w-3xl space-y-5 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/personal-brain")}>
            <ArrowLeft className="h-4 w-4" /> Brain
          </Button>
          <div className="rounded-lg bg-primary/10 p-2"><Wrench className="h-5 w-5 text-primary" /></div>
          <div>
            <h1 className="text-xl font-bold text-foreground">External tools</h1>
            <p className="text-xs text-muted-foreground">Tools your Brain can call during chat.</p>
          </div>
        </div>
        <ToolsRegistryCard />
      </div>
    </PageShell>
  );
}

export default function ToolsRegistry() {
  return <GlobalErrorBoundary><ToolsInner /></GlobalErrorBoundary>;
}
