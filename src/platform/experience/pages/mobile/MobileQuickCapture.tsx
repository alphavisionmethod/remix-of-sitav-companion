// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Trusted Device: Quick Capture
// Photo/file capture, quick note, handoff to desktop workflows
// ═══════════════════════════════════════════════════════════════
// truth-allow: ia-config — CAPTURE_MODES / WORKFLOW_TARGETS below are
// static action catalogs (mode labels, handoff targets), not telemetry.
// Real telemetry (recentCaptures) lives in the demo fixture and is
// gated via isDemo at the consume site.

import { MobileShell } from "@/platform/experience/components/mobile/MobileShell";
import { Camera, FileText, Upload, Send, Image, Mic, StickyNote, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { useRealityModeSafe } from "@/lib/dual-reality/reality-mode-context";
import { MOCK_MOBILE_RECENT_CAPTURES } from "@/data/fixtures/mock-data/mobile-shells";

type CaptureMode = "note" | "photo" | "file" | "voice";

interface CapturedItem {
  id: string;
  type: CaptureMode;
  content: string;
  timestamp: string;
  handedOff: boolean;
  workflowTarget?: string;
}

const CAPTURE_MODES: { mode: CaptureMode; icon: typeof Camera; label: string; description: string }[] = [
  { mode: "note", icon: StickyNote, label: "Quick Note", description: "Text capture → desktop workflow" },
  { mode: "photo", icon: Camera, label: "Photo Capture", description: "Camera → OCR → document flow" },
  { mode: "file", icon: Upload, label: "File Upload", description: "Pick file → handoff to desktop" },
  { mode: "voice", icon: Mic, label: "Voice Memo", description: "Audio → transcript → note" },
];

const WORKFLOW_TARGETS = [
  { id: "inbox", label: "Inbox Capture", icon: FileText },
  { id: "receipts", label: "Receipt Processing", icon: CheckCircle },
  { id: "docs", label: "Document Library", icon: FileText },
  { id: "tasks", label: "Create Task", icon: ArrowRight },
];

export default function MobileQuickCapture() {
  const { isDemo } = useRealityModeSafe();
  const [activeMode, setActiveMode] = useState<CaptureMode>("note");
  const [noteText, setNoteText] = useState("");
  const [recentCaptures, setRecentCaptures] = useState<CapturedItem[]>(
    isDemo ? (MOCK_MOBILE_RECENT_CAPTURES as CapturedItem[]) : []
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = () => {
    if (activeMode === "note" && noteText.trim()) {
      const newItem: CapturedItem = {
        id: `cap-${Date.now()}`, type: "note", content: noteText.trim(),
        timestamp: new Date().toISOString(), handedOff: false,
      };
      setRecentCaptures(prev => [newItem, ...prev]);
      setNoteText("");
      toast.success("Note captured", { description: "Ready for desktop handoff" });
    } else if (activeMode === "photo") {
      toast.info("Camera opening...", { description: "Capture will be processed with OCR" });
    } else if (activeMode === "file") {
      fileInputRef.current?.click();
    } else if (activeMode === "voice") {
      toast.info("Voice recording started", { description: "Tap again to stop" });
    }
  };

  const handleHandoff = (itemId: string, target: string) => {
    setRecentCaptures(prev => prev.map(c => c.id === itemId ? { ...c, handedOff: true, workflowTarget: target } : c));
    toast.success("Handed off to desktop", { description: `Sent to ${WORKFLOW_TARGETS.find(t => t.id === target)?.label}` });
  };

  return (
    <MobileShell title="Quick Capture">
      <div className="mb-2"><PageTruthBanner truthState="partial" /></div>
      
      <input ref={fileInputRef} type="file" className="hidden" onChange={() => toast.success("File queued for upload")} />

      {/* Capture Mode Selector */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {CAPTURE_MODES.map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            onClick={() => setActiveMode(mode)}
            className={cn(
              "flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all",
              activeMode === mode
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/40 bg-card text-muted-foreground hover:bg-muted/50"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Active Capture Area */}
      <div className="rounded-xl border border-border/40 bg-card p-4 mb-4">
        {activeMode === "note" && (
          <div className="space-y-3">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Type a quick note..."
              className="w-full h-24 bg-transparent text-sm resize-none focus:outline-none placeholder:text-muted-foreground/60"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                <span>AI will categorize on desktop</span>
              </div>
              <button
                onClick={handleCapture}
                disabled={!noteText.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[12px] font-semibold disabled:opacity-40 transition-opacity"
              >
                <Send className="h-3.5 w-3.5" />
                Capture
              </button>
            </div>
          </div>
        )}

        {activeMode === "photo" && (
          <button onClick={handleCapture} className="w-full flex flex-col items-center gap-3 py-8 text-muted-foreground hover:text-primary transition-colors">
            <div className="h-16 w-16 rounded-2xl border-2 border-dashed border-current flex items-center justify-center">
              <Camera className="h-8 w-8" />
            </div>
            <span className="text-sm font-medium">Tap to open camera</span>
            <span className="text-[10px]">OCR extraction • Receipt detection • Document scan</span>
          </button>
        )}

        {activeMode === "file" && (
          <button onClick={handleCapture} className="w-full flex flex-col items-center gap-3 py-8 text-muted-foreground hover:text-primary transition-colors">
            <div className="h-16 w-16 rounded-2xl border-2 border-dashed border-current flex items-center justify-center">
              <Upload className="h-8 w-8" />
            </div>
            <span className="text-sm font-medium">Tap to select file</span>
            <span className="text-[10px]">PDF • Image • Document • Spreadsheet</span>
          </button>
        )}

        {activeMode === "voice" && (
          <button onClick={handleCapture} className="w-full flex flex-col items-center gap-3 py-8 text-muted-foreground hover:text-primary transition-colors">
            <div className="h-16 w-16 rounded-2xl border-2 border-dashed border-current flex items-center justify-center">
              <Mic className="h-8 w-8" />
            </div>
            <span className="text-sm font-medium">Tap to record</span>
            <span className="text-[10px]">Auto-transcribed • Smart categorization</span>
          </button>
        )}
      </div>

      {/* Recent Captures */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Captures</h2>
        {recentCaptures.map(item => (
          <div key={item.id} className="rounded-xl border border-border/40 bg-card p-3 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {item.type === "note" && <StickyNote className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                {item.type === "photo" && <Image className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                {item.type === "file" && <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                {item.type === "voice" && <Mic className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                <p className="text-[12px] truncate">{item.content}</p>
              </div>
              {item.handedOff && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))] font-medium shrink-0">
                  Handed off
                </span>
              )}
            </div>

            {!item.handedOff && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground mr-1">Send to:</span>
                {WORKFLOW_TARGETS.map(target => (
                  <button
                    key={target.id}
                    onClick={() => handleHandoff(item.id, target.id)}
                    className="text-[10px] px-2 py-1 rounded-md bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {target.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </MobileShell>
  );
}
