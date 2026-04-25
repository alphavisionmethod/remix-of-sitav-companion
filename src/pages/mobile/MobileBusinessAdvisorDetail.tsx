import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChevronLeft, Send, Loader2, ShieldAlert } from "lucide-react";
import {
  askBusinessAdvisor,
  getBusinessAdvisor,
  type AdvisorAskResult,
} from "@/lib/ai-platform/runtime";
import { MobileSalesAdvisorPanels } from "@/components/business-advisors/sales/MobileSalesAdvisorPanels";
import { MobileCustomerServiceAdvisorPanels } from "@/components/business-advisors/customer-service/MobileCustomerServiceAdvisorPanels";
import { MobileCFOAdvisorPanels } from "@/components/business-advisors/cfo/MobileCFOAdvisorPanels";
import { MobileMarketingAdvisorPanels } from "@/components/business-advisors/marketing/MobileMarketingAdvisorPanels";
import { MobileGrowthAdvisorPanels } from "@/components/business-advisors/growth/MobileGrowthAdvisorPanels";
import { MobileTechAdvisorPanels } from "@/components/business-advisors/tech/MobileTechAdvisorPanels";
import { MobileImportsExportsAdvisorPanels } from "@/components/business-advisors/imports-exports/MobileImportsExportsAdvisorPanels";

export default function MobileBusinessAdvisorDetail() {
  const { advisorId } = useParams<{ advisorId: string }>();
  const advisor = advisorId ? getBusinessAdvisor(advisorId) : undefined;

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AdvisorAskResult | null>(null);

  if (!advisor) {
    return <Navigate to="/mobile/business-advisors" replace />;
  }

  async function handleAsk() {
    if (!prompt.trim() || !advisor) return;
    setLoading(true);
    setError(null);
    try {
      const r = await askBusinessAdvisor({
        advisorId: advisor.id,
        prompt: prompt.trim(),
        intent: "ask",
      });
      setResult(r);
      setPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reach advisor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border px-3 py-2">
        <Link to="/mobile/business-advisors" className="inline-flex items-center text-sm text-muted-foreground">
          <ChevronLeft className="h-4 w-4 mr-1" />Advisors
        </Link>
        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-base font-semibold truncate">{advisor.displayName}</h1>
            <p className="text-xs text-muted-foreground truncate">{advisor.tagline}</p>
          </div>
          <Badge variant={advisor.sensitive ? "destructive" : "secondary"} className="text-[10px] h-5">
            {advisor.riskTier}
          </Badge>
        </div>
      </header>

      <div className="px-4 py-4 space-y-3">
        <Alert>
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle className="text-xs">{advisor.authority}</AlertTitle>
          <AlertDescription className="text-[11px]">
            {advisor.professionalDisclaimer
              ? "Preparation only. Not a substitute for a licensed professional."
              : `Blocked: ${advisor.blockedActions.join(", ") || "none"}`}
          </AlertDescription>
        </Alert>

        {advisor.id === "sales-advisor" && <MobileSalesAdvisorPanels />}
        {advisor.id === "customer-service-advisor" && <MobileCustomerServiceAdvisorPanels />}
        {advisor.id === "cfo-advisor" && <MobileCFOAdvisorPanels />}
        {advisor.id === "marketing-advertising-advisor" && <MobileMarketingAdvisorPanels />}
        {advisor.id === "growth-advisor" && <MobileGrowthAdvisorPanels />}
        {advisor.id === "tech-advisor" && <MobileTechAdvisorPanels />}
        {advisor.id === "imports-exports-advisor" && <MobileImportsExportsAdvisorPanels />}

        <Textarea
          rows={3}
          placeholder={`Ask ${advisor.displayName}…`}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />
        {error && (
          <Alert variant="destructive">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}
        <Button onClick={handleAsk} disabled={loading || !prompt.trim()} className="w-full">
          {loading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Thinking…</>
          ) : (
            <><Send className="h-4 w-4 mr-2" />Ask</>
          )}
        </Button>

        {result && (
          <div className="rounded-md border border-border p-3 space-y-2">
            <p className="text-[11px] text-muted-foreground">{result.authorityNotice}</p>
            <div className="text-sm whitespace-pre-wrap">{result.response.content || "(no content)"}</div>
            {result.citations.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {result.citations.slice(0, 4).map((c, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] h-4">{c.sourceLabel}</Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}