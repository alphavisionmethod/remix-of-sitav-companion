// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 8 MultiModalIngestPanel
// Drag-and-drop image/audio/video uploads → knowledge_chunks rows
// flagged for the multi-modal embedding pipeline.
// ═══════════════════════════════════════════════════════════════
import { useState, type ChangeEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Loader2, Music, Video, FileText } from "lucide-react";
import { toast } from "sonner";
import { ingestMedia, modalityFromMime, type Modality } from "./multimodal-service";

interface MultiModalIngestPanelProps {
  workspaceId: string;
  /** Optional pillar tag passed through to chunk metadata. */
  pillar?: string;
  className?: string;
}

const MODALITY_ICON: Record<Modality, typeof FileText> = {
  text: FileText,
  image: ImagePlus,
  audio: Music,
  video: Video,
};

export function MultiModalIngestPanel({ workspaceId, pillar, className }: MultiModalIngestPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);

  const modality: Modality = file ? modalityFromMime(file.type || "") : "text";
  const Icon = MODALITY_ICON[modality];

  const handlePick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const res = await ingestMedia({ file, workspaceId, caption, pillar });
      toast.success(`${res.modality} queued for embedding`, { description: res.mediaUri });
      setFile(null);
      setCaption("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Upload failed", { description: msg });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ImagePlus className="h-4 w-4" /> Multi-modal ingest
        </CardTitle>
        <CardDescription>
          Upload image, audio or video. The embedder will caption and route it through the gateway.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="mm-file">Media file</Label>
          <Input
            id="mm-file"
            type="file"
            accept="image/*,audio/*,video/*"
            onChange={handlePick}
            disabled={busy}
          />
        </div>
        {file ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon className="h-3.5 w-3.5" />
            <span className="truncate">{file.name}</span>
            <Badge variant="outline" className="ml-auto">{modality}</Badge>
          </div>
        ) : null}
        <div className="space-y-1">
          <Label htmlFor="mm-caption">Optional caption</Label>
          <Textarea
            id="mm-caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Short description that helps semantic search find this asset."
            rows={2}
            disabled={busy}
          />
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!file || busy || !workspaceId}
          className="w-full"
        >
          {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ImagePlus className="h-4 w-4 mr-2" />}
          Queue for embedding
        </Button>
      </CardContent>
    </Card>
  );
}