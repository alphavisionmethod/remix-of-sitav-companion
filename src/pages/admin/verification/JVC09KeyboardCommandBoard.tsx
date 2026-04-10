// ═══════════════════════════════════════════════════════
// SITA OS — JVC09: Keyboard & Command Verification Board
// Track shortcuts, command palette, focus order
// ═══════════════════════════════════════════════════════

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SURFACE_REGISTRY } from "@/lib/verification/surface-registry";
import { Keyboard, Command, CheckCircle2, AlertTriangle, ArrowRight, Zap } from "lucide-react";

export default function JVC09KeyboardCommandBoard() {
  const shortcuts = useMemo(() =>
    SURFACE_REGISTRY.filter(s => s.surfaceClass === "keyboard_shortcut"),
    []
  );

  const commands = useMemo(() =>
    SURFACE_REGISTRY.filter(s => s.surfaceClass === "command_palette"),
    []
  );

  // Detect conflicts: same shortcutKey in different contexts
  const conflicts = useMemo(() => {
    const keyMap = new Map<string, typeof shortcuts>();
    shortcuts.forEach(s => {
      if (!s.shortcutKey) return;
      const existing = keyMap.get(s.shortcutKey) || [];
      existing.push(s);
      keyMap.set(s.shortcutKey, existing);
    });
    return Array.from(keyMap.entries()).filter(([, entries]) => entries.length > 1);
  }, [shortcuts]);

  const totalShortcuts = shortcuts.length;
  const totalCommands = commands.length;
  const withRedirect = [...shortcuts, ...commands].filter(s => s.redirectTarget).length;

  return (
    <div className="space-y-6 p-6" data-testid="jvc09-keyboard-command">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Keyboard className="h-6 w-6 text-primary" />
          JVC09 — Keyboard & Command Verification
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Shortcut registration, command palette actions, focus order, conflicts</p>
      </div>

      {/* KPI Band */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold">{totalShortcuts}</div>
          <div className="text-xs text-muted-foreground">Keyboard Shortcuts</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{totalCommands}</div>
          <div className="text-xs text-muted-foreground">Command Palette</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{withRedirect}</div>
          <div className="text-xs text-muted-foreground">With Navigation</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{conflicts.length}</div>
          <div className="text-xs text-muted-foreground">Conflicts</div>
        </CardContent></Card>
      </div>

      {/* Shortcut Health Table */}
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4" /> Keyboard Shortcuts</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Shortcut</TableHead>
                <TableHead className="text-xs">Label</TableHead>
                <TableHead className="text-xs">Expected Result</TableHead>
                <TableHead className="text-xs">Target</TableHead>
                <TableHead className="text-xs">Shell</TableHead>
                <TableHead className="text-xs">Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shortcuts.map(s => (
                <TableRow key={s.routeKey}>
                  <TableCell>
                    <div className="flex gap-1">
                      {(s.shortcutKey || "").split(" ").map((k, i) => (
                        <kbd key={i} className="px-1.5 py-0.5 text-[10px] font-mono bg-muted border rounded text-foreground">{k}</kbd>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-medium">{s.actionLabel}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.expectedResult}</TableCell>
                  <TableCell>
                    {s.redirectTarget ? (
                      <Badge variant="outline" className="text-xs font-mono">{s.redirectTarget}</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">action</span>
                    )}
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{s.shell}</Badge></TableCell>
                  <TableCell><Badge variant={s.testPriority === "P0" ? "destructive" : "outline"} className="text-xs">{s.testPriority}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Command Palette Actions */}
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Command className="h-4 w-4" /> Command Palette Actions</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Command</TableHead>
                <TableHead className="text-xs">Expected Result</TableHead>
                <TableHead className="text-xs">Navigation</TableHead>
                <TableHead className="text-xs">Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commands.map(c => (
                <TableRow key={c.routeKey}>
                  <TableCell className="text-xs font-medium">{c.actionLabel}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.expectedResult}</TableCell>
                  <TableCell>
                    {c.redirectTarget ? (
                      <div className="flex items-center gap-1">
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <Badge variant="outline" className="text-xs font-mono">{c.redirectTarget}</Badge>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell><Badge variant={c.testPriority === "P0" ? "destructive" : "outline"} className="text-xs">{c.testPriority}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Conflict Detection */}
      <Card className={conflicts.length > 0 ? "border-amber-500/30" : ""}>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400" /> Shortcut Conflicts</CardTitle></CardHeader>
        <CardContent>
          {conflicts.length > 0 ? (
            <div className="space-y-3">
              {conflicts.map(([key, entries]) => (
                <div key={key} className="p-3 bg-amber-500/10 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <kbd className="px-2 py-0.5 text-xs font-mono bg-muted border rounded">{key}</kbd>
                    <span className="text-xs text-amber-400">used by {entries.length} shortcuts</span>
                  </div>
                  <div className="space-y-1 ml-4">
                    {entries.map(e => (
                      <div key={e.routeKey} className="text-xs text-muted-foreground">• {e.actionLabel} ({e.shell} shell)</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> No shortcut conflicts detected
            </p>
          )}
        </CardContent>
      </Card>

      {/* Focus Order Inspector */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Focus Order Coverage</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {["P0", "P1", "P2"].map(p => {
              const count = [...shortcuts, ...commands].filter(s => s.testPriority === p).length;
              return (
                <div key={p} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                  <Badge variant={p === "P0" ? "destructive" : "outline"} className="text-xs">{p}</Badge>
                  <span className="text-xs">{count} keyboard interactions</span>
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
