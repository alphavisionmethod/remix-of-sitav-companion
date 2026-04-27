// ═══════════════════════════════════════════════════════════════
// IngestUrlDialog — admin tool to add an app from a URL
// Calls app-ingest-web → optionally app-ingest-pwa if manifest found
// ═══════════════════════════════════════════════════════════════
import { useState } from "react";
import { Loader2, Sparkles, ExternalLink, CheckCircle2, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useIngestWebApp, useIngestPwa, useCaptureScreenshot } from "@/platform/app-platform/hooks/use-app-ingestion";
import { ingestionService, type WebIngestResult, type PwaIngestResult } from "@/lib/services/app-ingestion/ingestion.service";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IngestUrlDialog({ open, onOpenChange }: Props) {
  const [url, setUrl] = useState("");
  const [webResult, setWebResult] = useState<WebIngestResult | null>(null);
  const [pwaResult, setPwaResult] = useState<PwaIngestResult | null>(null);
  const ingestWeb = useIngestWebApp();
  const ingestPwa = useIngestPwa();
  const captureShot = useCaptureScreenshot();

  const reset = () => { setUrl(""); setWebResult(null); setPwaResult(null); };

  const handleIngest = async () => {
    if (!url.trim()) return;
    try {
      const r = await ingestWeb.mutateAsync(url.trim());
      if (!r.ok || !r.result) {
        toast.error(r.error ?? "Ingest failed");
        return;
      }
      setWebResult(r.result);
      toast.success(`Discovered: ${r.result.title ?? r.result.publisher ?? "app"}`);

      if (r.result.manifest_url) {
        try {
          const p = await ingestPwa.mutateAsync(r.result.manifest_url);
          if (p.ok && p.result) {
            setPwaResult(p.result);
            toast.success("PWA manifest parsed");
          }
        } catch {
          // non-fatal
        }
      }
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleScreenshot = async () => {
    if (!webResult) return;
    const r = await captureShot.mutateAsync({ url: webResult.canonical_url });
    if (r.degraded) toast.warning(r.reason ?? "Screenshot provider unavailable");
    else if (r.ok) toast.success("Screenshot captured");
    else toast.error("Screenshot failed");
  };

  const iconUrl = webResult?.icons[0]?.storage_path
    ? ingestionService.publicAssetUrl(webResult.icons[0].storage_path)
    : null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Add App from URL
          </DialogTitle>
          <DialogDescription>
            Paste any web app URL. We'll auto-discover icons, name, description, theme color, and PWA manifest.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ingest-url">App URL</Label>
            <div className="flex gap-2">
              <Input
                id="ingest-url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={ingestWeb.isPending}
              />
              <Button onClick={handleIngest} disabled={!url.trim() || ingestWeb.isPending}>
                {ingestWeb.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Discover"}
              </Button>
            </div>
          </div>

          {webResult && (
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-start gap-3">
                {iconUrl ? (
                  <img src={iconUrl} alt="" className="h-12 w-12 rounded" />
                ) : (
                  <div className="h-12 w-12 rounded bg-muted" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{webResult.title ?? "Untitled"}</p>
                  <p className="text-xs text-muted-foreground truncate">{webResult.publisher ?? webResult.canonical_url}</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
              </div>

              {webResult.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{webResult.description}</p>
              )}

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-muted">app_id: <code>{webResult.app_id_suggestion}</code></span>
                {webResult.theme_color && (
                  <span
                    className="px-2 py-0.5 rounded flex items-center gap-1 text-primary-foreground"
                    style={{ backgroundColor: webResult.theme_color }}
                  >
                    {webResult.theme_color}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded bg-muted">{webResult.icons.length} icon(s)</span>
                {webResult.manifest_url && (
                  <span className="px-2 py-0.5 rounded bg-primary/15 text-primary">PWA manifest</span>
                )}
              </div>

              {pwaResult && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    PWA manifest: <strong>{pwaResult.name ?? pwaResult.short_name}</strong> · display={pwaResult.display ?? "browser"} · {pwaResult.icons.length} sized icons
                  </AlertDescription>
                </Alert>
              )}

              <Button size="sm" variant="outline" onClick={handleScreenshot} disabled={captureShot.isPending}>
                {captureShot.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <ExternalLink className="h-3 w-3 mr-1" />}
                Capture Screenshot
              </Button>
            </div>
          )}

          {!webResult && !ingestWeb.isPending && (
            <Alert variant="default" className="bg-muted/50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Discovery requires admin role. Icons land in <code>app-assets</code> storage; metadata is logged in <code>app_ingestion_jobs</code>.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
