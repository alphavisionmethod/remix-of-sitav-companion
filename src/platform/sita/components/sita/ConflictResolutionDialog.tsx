import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, GitMerge, Clock, Monitor, Smartphone, X, HelpCircle } from "lucide-react";
import { conflictResolver, type SyncConflict } from "@/platform/sync-engine/conflict-resolver";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ConflictResolutionDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ConflictResolutionDialog({ open, onClose }: ConflictResolutionDialogProps) {
  const [selectedConflict, setSelectedConflict] = useState<SyncConflict | null>(null);

  const conflicts = conflictResolver.getPendingConflicts();
  const history = conflictResolver.getConflicts().filter(c => c.status === "resolved" || c.status === "auto-resolved");

  const handleResolve = (conflictId: string, choice: "keep-local" | "keep-remote" | "merge") => {
    const conflict = conflicts.find(c => c.id === conflictId);
    if (!conflict) return;
    // Mark as resolved by updating status
    conflict.status = "resolved";
    conflict.resolution = {
      winner: choice === "keep-local" ? "local" : choice === "keep-remote" ? "remote" : "merged",
      resolvedObject: choice === "keep-local" ? conflict.localVersion : conflict.remoteVersion,
      resolvedAt: new Date().toISOString(),
      resolvedBy: "user",
      strategyUsed: conflict.strategy,
      mergeDetails: `User chose: ${choice}`,
    };
    toast.success(`Conflict resolved: ${choice}`);
    setSelectedConflict(null);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl bg-background border border-border/50 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Resolve Conflicts</h2>
                <p className="text-sm text-muted-foreground">
                  {conflicts.length} conflict{conflicts.length !== 1 ? "s" : ""} need your attention
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
          </div>

          <div className="p-5 space-y-4">
            {conflicts.length === 0 ? (
              <div className="text-center py-12">
                <Check className="h-12 w-12 mx-auto text-primary mb-3" />
                <p className="text-lg font-medium text-foreground">All clear!</p>
                <p className="text-sm text-muted-foreground">No conflicts to resolve.</p>
              </div>
            ) : selectedConflict ? (
              /* Detail View */
              <div className="space-y-4">
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSelectedConflict(null)}>
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to list
                </Button>

                <Card className="border-destructive/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <GitMerge className="h-4 w-4 text-destructive" />
                      Conflict on {selectedConflict.namespace}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Why did this conflict? */}
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                      <div className="flex items-center gap-2 mb-2">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        <p className="text-xs font-medium">Why did this happen?</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {selectedConflict.explanation}
                      </p>
                    </div>

                    {/* Side by side */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Monitor className="h-4 w-4 text-primary" />
                          <p className="text-xs font-medium text-primary">Local Version</p>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>Device: {selectedConflict.localVersion.originDeviceId.slice(0, 12)}…</p>
                          <p>Version: v{selectedConflict.localVersion.version}</p>
                          <pre className="mt-2 p-2 rounded bg-muted/30 text-[10px] font-mono overflow-auto max-h-32">
                            {JSON.stringify(selectedConflict.localVersion.payload ?? selectedConflict.localVersion.metadata, null, 2).slice(0, 300)}
                          </pre>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/30 border border-secondary/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Smartphone className="h-4 w-4 text-secondary-foreground" />
                          <p className="text-xs font-medium text-secondary-foreground">Remote Version</p>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>Device: {selectedConflict.remoteVersion.originDeviceId.slice(0, 12)}…</p>
                          <p>Version: v{selectedConflict.remoteVersion.version}</p>
                          <pre className="mt-2 p-2 rounded bg-muted/30 text-[10px] font-mono overflow-auto max-h-32">
                            {JSON.stringify(selectedConflict.remoteVersion.payload ?? selectedConflict.remoteVersion.metadata, null, 2).slice(0, 300)}
                          </pre>
                        </div>
                      </div>
                    </div>

                    {/* Resolution actions */}
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => handleResolve(selectedConflict.id, "keep-local")}>
                        <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Keep Local
                      </Button>
                      <Button variant="default" size="sm" className="text-xs" onClick={() => handleResolve(selectedConflict.id, "merge")}>
                        <GitMerge className="h-3.5 w-3.5 mr-1" /> Merge
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => handleResolve(selectedConflict.id, "keep-remote")}>
                        Keep Remote <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Conflict List */
              <div className="space-y-2">
                {conflicts.map(conflict => (
                  <div
                    key={conflict.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30 hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => setSelectedConflict(conflict)}
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <div>
                        <p className="text-sm font-medium">{conflict.objectId.slice(0, 20)}…</p>
                        <p className="text-xs text-muted-foreground">{conflict.namespace} · v{conflict.localVersion.version} ↔ v{conflict.remoteVersion.version}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {conflict.localVersion.originDeviceId.slice(0, 8)} ↔ {conflict.remoteVersion.originDeviceId.slice(0, 8)}
                        </p>
                        <p className="text-[10px] text-muted-foreground flex items-center justify-end gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(conflict.detectedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* History */}
            {history.length > 0 && !selectedConflict && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" /> Recent Resolutions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5">
                    {history.slice(0, 5).map(h => (
                      <div key={h.id} className="flex items-center justify-between py-1.5 text-xs">
                        <span className="text-muted-foreground font-mono">{h.objectId.slice(0, 16)}…</span>
                        <Badge variant="outline" className="text-[10px]">{h.resolution?.winner ?? h.status}</Badge>
                        <span className="text-muted-foreground">{new Date(h.detectedAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
