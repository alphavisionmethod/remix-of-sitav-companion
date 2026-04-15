import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Key, RotateCcw, Lock, Unlock, Eye, AlertTriangle, CheckCircle } from "lucide-react";
import { syncEncryption, type EncryptionKeyMeta } from "@/lib/sync-engine/security/sync-encryption";
import { namespaceRegistry } from "@/lib/sync-engine/sync-namespaces";
import { toast } from "sonner";

// Seed demo keys
function ensureDemoKeys() {
  if (syncEncryption.getAllKeys().length > 0) return;
  const master = syncEncryption.generateKey("master");
  const nsKeys = ["files.documents", "settings.ui.theme", "session.desktop.workspace"];
  for (const ns of nsKeys) {
    syncEncryption.deriveKey(master.keyId, "namespace", { namespace: ns });
  }
  syncEncryption.deriveKey(master.keyId, "device", { deviceId: "dev_macbook" });
  syncEncryption.deriveKey(master.keyId, "device", { deviceId: "dev_iphone" });
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400",
  rotated: "bg-amber-500/20 text-amber-400",
  revoked: "bg-red-500/20 text-red-400",
  expired: "bg-muted text-muted-foreground",
};

export function CloudEncryptionAdmin() {
  const [selectedKey, setSelectedKey] = useState<EncryptionKeyMeta | null>(null);

  ensureDemoKeys();
  const allKeys = syncEncryption.getAllKeys();
  const activeKeys = syncEncryption.getActiveKeys();
  const rotationHistory = syncEncryption.getRotationHistory();
  const namespaces = namespaceRegistry.getAllNamespaces();
  const recoveryInfo = syncEncryption.getRecoveryKeyInfo();
  const nsEncryption = syncEncryption.getNamespaceEncryptionStatus();

  const handleRotate = (keyId: string) => {
    syncEncryption.rotateKey(keyId, "manual");
    toast.success("Key rotated successfully");
    setSelectedKey(null);
  };

  const handleRevoke = (keyId: string) => {
    syncEncryption.revokeKey(keyId);
    toast.warning("Key revoked — affected objects will need re-encryption");
    setSelectedKey(null);
  };

  const handleGenerateRecovery = () => {
    const key = syncEncryption.generateRecoveryKey();
    toast.success(`Recovery key generated: ${key}`, { duration: 10000 });
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Keys", value: allKeys.length, color: "bg-primary/10" },
          { label: "Active", value: activeKeys.length, color: "bg-emerald-500/10" },
          { label: "Rotated", value: allKeys.filter(k => k.status === "rotated").length, color: "bg-amber-500/10" },
          { label: "Revoked", value: allKeys.filter(k => k.status === "revoked").length, color: "bg-red-500/10" },
          { label: "Rotations", value: rotationHistory.length, color: "bg-blue-500/10" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-lg p-3 ${color}`}>
            <p className="text-xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Keys Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" /> Encryption Keys
            </CardTitle>
            <Button variant="outline" size="sm" className="text-xs" onClick={handleGenerateRecovery}>
              <Shield className="h-3.5 w-3.5 mr-1.5" /> Generate Recovery Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key ID</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Algorithm</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allKeys.map(key => (
                <TableRow key={key.keyId} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelectedKey(key)}>
                  <TableCell><span className="font-mono text-xs">{key.keyId.slice(0, 20)}…</span></TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{key.level}</Badge></TableCell>
                  <TableCell><span className="text-xs font-mono">{key.algorithm}</span></TableCell>
                  <TableCell><span className="text-xs text-muted-foreground">{key.namespace ?? key.deviceId ?? "Global"}</span></TableCell>
                  <TableCell><Badge className={`text-xs ${statusColors[key.status]}`}>{key.status}</Badge></TableCell>
                  <TableCell><span className="text-xs text-muted-foreground">{new Date(key.createdAt).toLocaleDateString()}</span></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {key.status === "active" && (
                        <>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); handleRotate(key.keyId); }}>
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={(e) => { e.stopPropagation(); handleRevoke(key.keyId); }}>
                            <Lock className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Namespace Encryption Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Namespace Encryption Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {namespaces.map(ns => {
              const nsKey = nsEncryption.find(e => e.namespace === ns.id);
              const hasKey = !!nsKey;
              return (
                <div key={ns.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                  <div className="flex items-center gap-2">
                    {hasKey ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-amber-400" />}
                    <div>
                      <p className="text-sm font-medium">{ns.id}</p>
                      <p className="text-xs text-muted-foreground">{ns.defaultEncryptionClass}</p>
                    </div>
                  </div>
                  <Badge variant={hasKey ? "default" : "outline"} className="text-xs">
                    {hasKey ? "Key assigned" : "Default"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recovery Key Info */}
      {recoveryInfo && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" /> Recovery Key
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground">Hash</p><p className="font-mono text-xs">{recoveryInfo.recoveryKeyHash}</p></div>
              <div><p className="text-xs text-muted-foreground">Created</p><p>{new Date(recoveryInfo.createdAt).toLocaleDateString()}</p></div>
              <div><p className="text-xs text-muted-foreground">Usage Count</p><p>{recoveryInfo.usageCount}</p></div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
