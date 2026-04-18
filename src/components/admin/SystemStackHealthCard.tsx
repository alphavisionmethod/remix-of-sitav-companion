// ═══════════════════════════════════════════════════════════════
// SITA OS — System Stack Health Card
// Live read of SYSTEM_LAYER_REGISTRY + validateSystemStack().
// Pure registry read — no DB, no fetches, no stubs.
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { CheckCircle2, XCircle, FileText, FileCode2, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  SYSTEM_LAYER_REGISTRY,
  L3_PLATFORM_SERVICES,
  validateSystemStack,
  getL3Service,
  type SystemLayer,
} from "@/platform/architecture/system-layer-registry";

const LAYER_LABEL: Record<SystemLayer, string> = {
  "L1-experience": "L1 · Experience",
  "L2-domain": "L2 · Domain",
  "L3-platform": "L3 · Platform",
};

const LAYER_TONE: Record<SystemLayer, string> = {
  "L1-experience": "bg-primary/15 text-primary border-primary/30",
  "L2-domain": "bg-accent/40 text-accent-foreground border-border",
  "L3-platform": "bg-secondary text-secondary-foreground border-border",
};

export function SystemStackHealthCard() {
  const validation = useMemo(() => validateSystemStack(), []);
  const l3Rows = useMemo(
    () =>
      L3_PLATFORM_SERVICES.map((service) => {
        const entry = getL3Service(service);
        return { service, entry };
      }),
    [],
  );

  const totalEntries = SYSTEM_LAYER_REGISTRY.length;
  const okEntries = totalEntries - validation.missing.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              SITA System Stack Health
            </CardTitle>
            <CardDescription>
              Live registry read of the canonical 3-layer architecture (L1 Experience · L2 Domain · L3 Platform Services).
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={
              validation.ok
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-destructive/40 bg-destructive/10 text-destructive"
            }
          >
            {validation.ok ? (
              <>
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                OK · {okEntries}/{totalEntries}
              </>
            ) : (
              <>
                <XCircle className="mr-1 h-3.5 w-3.5" />
                MISSING · {validation.missing.length}
              </>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* All registry entries (L1, L2, L3) */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-2">Registry Entries</h3>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Layer</TableHead>
                  <TableHead>Entry</TableHead>
                  <TableHead className="w-[110px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SYSTEM_LAYER_REGISTRY.map((entry) => {
                  const isMissing = validation.missing.includes(entry.key);
                  return (
                    <TableRow key={entry.key}>
                      <TableCell>
                        <Badge variant="outline" className={LAYER_TONE[entry.layer]}>
                          {LAYER_LABEL[entry.layer]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm text-foreground">{entry.displayName}</div>
                        <div className="text-xs text-muted-foreground font-mono">{entry.key}</div>
                      </TableCell>
                      <TableCell>
                        {isMissing ? (
                          <Badge variant="outline" className="border-destructive/40 bg-destructive/10 text-destructive">
                            <XCircle className="mr-1 h-3 w-3" />
                            Missing
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            OK
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* L3 Platform Services detail */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Layer 3 — Platform Services ({L3_PLATFORM_SERVICES.length})
          </h3>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[160px]">Service</TableHead>
                  <TableHead>Registry File</TableHead>
                  <TableHead>Companion Doc</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {l3Rows.map(({ service, entry }) => (
                  <TableRow key={service}>
                    <TableCell>
                      <div className="font-medium text-sm text-foreground capitalize">{service}</div>
                      {entry && <div className="text-xs text-muted-foreground">{entry.displayName}</div>}
                    </TableCell>
                    <TableCell>
                      {entry?.registryFile ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                          <FileCode2 className="h-3.5 w-3.5 text-primary" />
                          {entry.registryFile}
                        </span>
                      ) : (
                        <span className="text-xs text-destructive">— not declared —</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {entry?.docFile ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                          <FileText className="h-3.5 w-3.5 text-primary" />
                          {entry.docFile}
                        </span>
                      ) : (
                        <span className="text-xs text-destructive">— no doc —</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        {!validation.ok && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            <strong>Stack validation failed.</strong> Missing entries:{" "}
            <span className="font-mono">{validation.missing.join(", ")}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SystemStackHealthCard;
