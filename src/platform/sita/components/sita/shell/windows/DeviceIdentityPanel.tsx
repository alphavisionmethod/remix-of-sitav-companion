// ═══════════════════════════════════════════════════════════════
// SITA OS — Device Identity Panel
// TPM status, Secure Boot, hardware-backed secrets, attestation
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import {
  Cpu, Shield, ShieldCheck, Lock, Key, Fingerprint,
  CheckCircle, AlertTriangle, XCircle, RefreshCw,
  HardDrive, Wifi, Activity, Clock, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// ── Simulated device identity data ──────────────────────────

interface TPMStatus {
  available: boolean;
  version: string;
  manufacturer: string;
  firmwareVersion: string;
  pcrBanks: string[];
  activePCRs: number;
  endorsementKeyPresent: boolean;
  storageRootKeyPresent: boolean;
  ownershipTaken: boolean;
  lastAttestationAt: number | null;
}

interface SecureBootState {
  enabled: boolean;
  verified: boolean;
  setupMode: boolean;
  dbxVersion: string;
  uefiVersion: string;
  signerCount: number;
  chainValid: boolean;
  lastVerifiedAt: number;
}

interface HardwareSecrets {
  keyStoreType: "tpm" | "secure-enclave" | "software";
  keysStored: number;
  maxKeys: number;
  encryptionAlgorithm: string;
  keyDerivationFunction: string;
  hardwareBound: boolean;
  antiHammerProtection: boolean;
  lastRotatedAt: number;
}

interface DeviceAttestation {
  deviceId: string;
  trustLevel: "verified" | "conditional" | "untrusted";
  enrolledAt: number;
  lastAttestationAt: number;
  attestationMethod: string;
  nonce: string;
  pcr0: string;
  pcr7: string;
  firmwareIntegrity: boolean;
  bootloaderIntegrity: boolean;
  osIntegrity: boolean;
  certificateChainValid: boolean;
}

function getDeviceIdentity() {
  const now = Date.now();
  const tpm: TPMStatus = {
    available: true,
    version: "2.0",
    manufacturer: "STMicroelectronics",
    firmwareVersion: "73.2.0",
    pcrBanks: ["SHA-256", "SHA-384", "SHA-512"],
    activePCRs: 24,
    endorsementKeyPresent: true,
    storageRootKeyPresent: true,
    ownershipTaken: true,
    lastAttestationAt: now - 180000,
  };

  const secureBoot: SecureBootState = {
    enabled: true,
    verified: true,
    setupMode: false,
    dbxVersion: "2024-Q4",
    uefiVersion: "2.10",
    signerCount: 3,
    chainValid: true,
    lastVerifiedAt: now - 60000,
  };

  const secrets: HardwareSecrets = {
    keyStoreType: "tpm",
    keysStored: 12,
    maxKeys: 64,
    encryptionAlgorithm: "AES-256-GCM",
    keyDerivationFunction: "PBKDF2-HMAC-SHA256",
    hardwareBound: true,
    antiHammerProtection: true,
    lastRotatedAt: now - 86400000 * 7,
  };

  const attestation: DeviceAttestation = {
    deviceId: "sita-dev-" + "a7e2f4b9".slice(0, 8),
    trustLevel: "verified",
    enrolledAt: now - 86400000 * 30,
    lastAttestationAt: now - 180000,
    attestationMethod: "TPM 2.0 Remote Attestation",
    nonce: "c3a8...7f2e",
    pcr0: "3d6f...a91b",
    pcr7: "8e2c...4d5f",
    firmwareIntegrity: true,
    bootloaderIntegrity: true,
    osIntegrity: true,
    certificateChainValid: true,
  };

  return { tpm, secureBoot, secrets, attestation };
}

// ── Status Badge ─────────────────────────────────────────────

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold",
      ok
        ? "bg-[hsl(152_55%_48%/0.12)] text-[hsl(152_55%_40%)]"
        : "bg-[hsl(0_70%_55%/0.12)] text-[hsl(0_70%_50%)]"
    )}>
      {ok ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {label}
    </div>
  );
}

// ── Detail Row ───────────────────────────────────────────────

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className={cn("text-[11px] text-foreground font-medium", mono && "font-mono")}>{value}</span>
    </div>
  );
}

// ── Main Panel ───────────────────────────────────────────────

export function DeviceIdentityPanel() {
  const [data, setData] = useState(() => getDeviceIdentity());
  const [attestingNow, setAttestingNow] = useState(false);

  const handleReAttest = () => {
    setAttestingNow(true);
    setTimeout(() => {
      setData(prev => ({
        ...prev,
        attestation: { ...prev.attestation, lastAttestationAt: Date.now() },
        tpm: { ...prev.tpm, lastAttestationAt: Date.now() },
      }));
      setAttestingNow(false);
    }, 2000);
  };

  const trustScore = [
    data.tpm.available,
    data.secureBoot.enabled && data.secureBoot.chainValid,
    data.secrets.hardwareBound,
    data.attestation.firmwareIntegrity,
    data.attestation.bootloaderIntegrity,
    data.attestation.osIntegrity,
    data.attestation.certificateChainValid,
  ].filter(Boolean).length;
  const trustPercent = Math.round((trustScore / 7) * 100);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold mb-1">Device Identity</h2>
        <p className="text-sm text-muted-foreground">Hardware security modules, attestation, and trust chain</p>
      </div>

      {/* Trust Score Banner */}
      <div className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              trustPercent === 100
                ? "bg-[hsl(152_55%_48%/0.15)]"
                : trustPercent >= 70
                  ? "bg-[hsl(38_85%_58%/0.15)]"
                  : "bg-[hsl(0_70%_55%/0.15)]"
            )}>
              <ShieldCheck className={cn(
                "w-6 h-6",
                trustPercent === 100 ? "text-[hsl(152_55%_48%)]" :
                trustPercent >= 70 ? "text-[hsl(38_85%_58%)]" : "text-[hsl(0_70%_55%)]"
              )} />
            </div>
            <div>
              <h3 className="text-sm font-medium">Hardware Trust Score</h3>
              <p className="text-[10px] text-muted-foreground">{trustScore}/7 checks passed</p>
            </div>
          </div>
          <div className={cn(
            "text-3xl font-bold tabular-nums",
            trustPercent === 100 ? "text-[hsl(152_55%_48%)]" :
            trustPercent >= 70 ? "text-[hsl(38_85%_58%)]" : "text-[hsl(0_70%_55%)]"
          )}>
            {trustPercent}%
          </div>
        </div>
        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              trustPercent === 100 ? "bg-[hsl(152_55%_48%)]" :
              trustPercent >= 70 ? "bg-[hsl(38_85%_58%)]" : "bg-[hsl(0_70%_55%)]"
            )}
            style={{ width: `${trustPercent}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          <StatusBadge ok={data.tpm.available} label="TPM 2.0" />
          <StatusBadge ok={data.secureBoot.enabled} label="Secure Boot" />
          <StatusBadge ok={data.secrets.hardwareBound} label="HW-Bound Keys" />
          <StatusBadge ok={data.attestation.certificateChainValid} label="Cert Chain" />
          <StatusBadge ok={data.attestation.osIntegrity} label="OS Integrity" />
        </div>
      </div>

      {/* TPM Section */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <Cpu className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">TPM Module</h3>
          <StatusBadge ok={data.tpm.available} label={`v${data.tpm.version}`} />
        </div>
        <div className="pl-6 space-y-0">
          <DetailRow label="Manufacturer" value={data.tpm.manufacturer} />
          <DetailRow label="Firmware" value={data.tpm.firmwareVersion} mono />
          <DetailRow label="PCR Banks" value={data.tpm.pcrBanks.join(", ")} />
          <DetailRow label="Active PCRs" value={`${data.tpm.activePCRs}/24`} />
          <DetailRow label="Endorsement Key" value={data.tpm.endorsementKeyPresent ? "Present" : "Missing"} />
          <DetailRow label="Storage Root Key" value={data.tpm.storageRootKeyPresent ? "Present" : "Missing"} />
          <DetailRow label="Ownership" value={data.tpm.ownershipTaken ? "Claimed" : "Unclaimed"} />
          {data.tpm.lastAttestationAt && (
            <DetailRow label="Last Attestation" value={new Date(data.tpm.lastAttestationAt).toLocaleTimeString()} />
          )}
        </div>
      </div>

      {/* Secure Boot */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <Shield className="h-4 w-4 text-[hsl(152_55%_48%)]" />
          <h3 className="text-sm font-semibold">Secure Boot</h3>
          <StatusBadge ok={data.secureBoot.enabled && data.secureBoot.chainValid} label={data.secureBoot.enabled ? "Enforced" : "Disabled"} />
        </div>
        <div className="pl-6 space-y-0">
          <DetailRow label="UEFI Version" value={data.secureBoot.uefiVersion} mono />
          <DetailRow label="DBX Revision" value={data.secureBoot.dbxVersion} />
          <DetailRow label="Setup Mode" value={data.secureBoot.setupMode ? "Active ⚠" : "Off"} />
          <DetailRow label="Trusted Signers" value={String(data.secureBoot.signerCount)} />
          <DetailRow label="Boot Chain" value={data.secureBoot.chainValid ? "Valid ✓" : "Broken ✗"} />
          <DetailRow label="Last Verified" value={new Date(data.secureBoot.lastVerifiedAt).toLocaleTimeString()} />
        </div>
      </div>

      {/* Hardware-Backed Secrets */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <Key className="h-4 w-4 text-[hsl(38_85%_58%)]" />
          <h3 className="text-sm font-semibold">Hardware-Backed Secrets</h3>
          <StatusBadge ok={data.secrets.hardwareBound} label={data.secrets.keyStoreType.toUpperCase()} />
        </div>
        <div className="pl-6 space-y-0">
          <DetailRow label="Key Store" value={data.secrets.keyStoreType === "tpm" ? "TPM-bound" : data.secrets.keyStoreType === "secure-enclave" ? "Secure Enclave" : "Software (⚠ not hardware-backed)"} />
          <DetailRow label="Keys Stored" value={`${data.secrets.keysStored} / ${data.secrets.maxKeys}`} />
          <DetailRow label="Encryption" value={data.secrets.encryptionAlgorithm} mono />
          <DetailRow label="KDF" value={data.secrets.keyDerivationFunction} mono />
          <DetailRow label="Anti-Hammer" value={data.secrets.antiHammerProtection ? "Enabled" : "Disabled"} />
          <DetailRow label="Last Rotation" value={new Date(data.secrets.lastRotatedAt).toLocaleDateString()} />
        </div>
        <div className="pl-6">
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-muted-foreground">Key capacity</span>
            <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-[hsl(38_85%_58%)]"
                style={{ width: `${(data.secrets.keysStored / data.secrets.maxKeys) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {Math.round((data.secrets.keysStored / data.secrets.maxKeys) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Device Attestation */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Fingerprint className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Device Attestation</h3>
            <span className={cn(
              "px-2 py-0.5 rounded text-[10px] font-semibold",
              data.attestation.trustLevel === "verified"
                ? "bg-[hsl(152_55%_48%/0.12)] text-[hsl(152_55%_40%)]"
                : data.attestation.trustLevel === "conditional"
                  ? "bg-[hsl(38_85%_58%/0.12)] text-[hsl(38_85%_50%)]"
                  : "bg-[hsl(0_70%_55%/0.12)] text-[hsl(0_70%_50%)]"
            )}>
              {data.attestation.trustLevel.toUpperCase()}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReAttest}
            disabled={attestingNow}
            className="gap-1.5 border-white/10 text-xs"
          >
            <RefreshCw className={cn("h-3 w-3", attestingNow && "animate-spin")} />
            {attestingNow ? "Attesting…" : "Re-attest"}
          </Button>
        </div>
        <div className="pl-6 space-y-0">
          <DetailRow label="Device ID" value={data.attestation.deviceId} mono />
          <DetailRow label="Method" value={data.attestation.attestationMethod} />
          <DetailRow label="Enrolled" value={new Date(data.attestation.enrolledAt).toLocaleDateString()} />
          <DetailRow label="Last Attestation" value={new Date(data.attestation.lastAttestationAt).toLocaleTimeString()} />
          <DetailRow label="Nonce" value={data.attestation.nonce} mono />
          <DetailRow label="PCR[0]" value={data.attestation.pcr0} mono />
          <DetailRow label="PCR[7]" value={data.attestation.pcr7} mono />
        </div>

        {/* Integrity checks */}
        <div className="pl-6 pt-2 grid grid-cols-2 gap-2">
          {[
            { label: "Firmware", ok: data.attestation.firmwareIntegrity },
            { label: "Bootloader", ok: data.attestation.bootloaderIntegrity },
            { label: "OS Kernel", ok: data.attestation.osIntegrity },
            { label: "Cert Chain", ok: data.attestation.certificateChainValid },
          ].map(check => (
            <div
              key={check.label}
              className={cn(
                "flex items-center gap-2 p-2.5 rounded-lg text-[11px] font-medium",
                check.ok
                  ? "bg-[hsl(152_55%_48%/0.08)] text-[hsl(152_55%_40%)]"
                  : "bg-[hsl(0_70%_55%/0.08)] text-[hsl(0_70%_50%)]"
              )}
            >
              {check.ok ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
              {check.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
