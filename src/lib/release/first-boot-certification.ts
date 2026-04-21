// ═══════════════════════════════════════════════════════════════
// SITA OS — First-Boot Certification
// Defines first-boot validation criteria per shipped artifact.
// ═══════════════════════════════════════════════════════════════

export interface FirstBootCheck {
  readonly checkId: string;
  readonly label: string;
  readonly description: string;
  readonly mandatory: boolean;
  readonly verificationScript: string;
  readonly expectedOutcome: string;
  readonly failureAction: string;
}

export interface FirstBootCertification {
  readonly targetId: string;
  readonly targetLabel: string;
  readonly applicable: boolean;
  readonly firstBootScript: string;
  readonly checks: readonly FirstBootCheck[];
}

export const FIRST_BOOT_CERTIFICATIONS: readonly FirstBootCertification[] = [
  {
    targetId: "os-iso",
    targetLabel: "OS ISO (user + operator profiles)",
    applicable: true,
    firstBootScript: "scripts/release/iso/sita-first-boot.sh",
    checks: [
      {
        checkId: "fb-docker-ready",
        label: "Docker daemon is running",
        description: "Wait for Docker daemon to become responsive within 60s",
        mandatory: true,
        verificationScript: "scripts/release/iso/sita-first-boot.sh (step 1/12)",
        expectedOutcome: "docker info exits 0",
        failureAction: "First-boot aborts; system enters recovery mode",
      },
      {
        checkId: "fb-images-loaded",
        label: "Docker images loaded from offline bundle",
        description: "Load pre-packaged container images into Docker",
        mandatory: true,
        verificationScript: "scripts/release/iso/sita-first-boot.sh (step 2/12)",
        expectedOutcome: "All .tar.gz images loaded successfully",
        failureAction: "First-boot retries; falls back to pull from registry if network available",
      },
      {
        checkId: "fb-jwt-generated",
        label: "JWT secrets generated",
        description: "Generate unique JWT signing secrets for this instance",
        mandatory: true,
        verificationScript: "scripts/release/iso/sita-first-boot.sh (step 3/12)",
        expectedOutcome: "JWT_SECRET and ANON_KEY set in env",
        failureAction: "First-boot aborts; support bundle generated",
      },
      {
        checkId: "fb-tls-provisioned",
        label: "TLS certificates provisioned",
        description: "Generate self-signed or provision ACME certificates",
        mandatory: true,
        verificationScript: "scripts/release/iso/sita-first-boot.sh (step 4/12)",
        expectedOutcome: "TLS cert and key files present at /opt/sita/tls/",
        failureAction: "Falls back to self-signed certificates",
      },
      {
        checkId: "fb-stack-started",
        label: "Full SITA stack started",
        description: "docker-compose up for all services",
        mandatory: true,
        verificationScript: "scripts/release/iso/sita-first-boot.sh (step 5/12)",
        expectedOutcome: "All containers running and healthy",
        failureAction: "First-boot retries up to 3 times; enters degraded mode",
      },
      {
        checkId: "fb-health-verified",
        label: "Health endpoint responds",
        description: "HTTP health check against /health.json within timeout",
        mandatory: true,
        verificationScript: "scripts/release/iso/sita-first-boot.sh (health check)",
        expectedOutcome: "HTTP 200 with valid JSON within 120s",
        failureAction: "First-boot marks system unhealthy; operator notified",
      },
      {
        checkId: "fb-firewall-configured",
        label: "Firewall rules applied",
        description: "UFW/iptables rules restrict access to required ports only",
        mandatory: true,
        verificationScript: "scripts/release/iso/sita-first-boot.sh (firewall step)",
        expectedOutcome: "Only ports 80, 443, 22 open",
        failureAction: "System runs with default-deny; warning logged",
      },
      {
        checkId: "fb-backup-configured",
        label: "Backup timer active",
        description: "systemd timer for sita-backup.service enabled and started",
        mandatory: false,
        verificationScript: "systemctl is-active sita-backup.timer",
        expectedOutcome: "Timer active",
        failureAction: "Warning logged; backup can be configured later",
      },
      {
        checkId: "fb-metrics-configured",
        label: "Metrics agent active",
        description: "systemd timer for sita-metrics.service enabled and started",
        mandatory: false,
        verificationScript: "systemctl is-active sita-metrics.timer",
        expectedOutcome: "Timer active",
        failureAction: "Warning logged; metrics can be configured later",
      },
      {
        checkId: "fb-ota-configured",
        label: "OTA update agent active",
        description: "systemd timer for sita-ota.service enabled and started",
        mandatory: true,
        verificationScript: "systemctl is-active sita-ota.timer",
        expectedOutcome: "Timer active",
        failureAction: "System cannot receive updates; operator must enable manually",
      },
      {
        checkId: "fb-logrotate",
        label: "Log rotation configured",
        description: "Logrotate configuration for SITA logs deployed",
        mandatory: false,
        verificationScript: "ls /etc/logrotate.d/sita-os",
        expectedOutcome: "Config file present",
        failureAction: "Warning; logs may grow unbounded",
      },
      {
        checkId: "fb-lock-file",
        label: "First-boot lock file created",
        description: "Lock file prevents re-running first-boot on subsequent boots",
        mandatory: true,
        verificationScript: "ls /var/run/sita-first-boot.lock",
        expectedOutcome: "Lock file exists",
        failureAction: "First-boot may re-run on next reboot",
      },
    ],
  },
  {
    targetId: "os-ova",
    targetLabel: "VMware OVA Appliance",
    applicable: true,
    firstBootScript: "scripts/release/iso/sita-first-boot.sh",
    checks: [
      {
        checkId: "fb-ova-vmtools",
        label: "VMware Tools / open-vm-tools running",
        description: "Guest tools provide host-guest integration",
        mandatory: false,
        verificationScript: "systemctl is-active vmtoolsd || systemctl is-active open-vm-tools",
        expectedOutcome: "Service active",
        failureAction: "Warning; host integration limited but system functional",
      },
    ],
  },
  {
    targetId: "desktop",
    targetLabel: "Electron Desktop (all platforms)",
    applicable: false,
    firstBootScript: "n/a",
    checks: [],
  },
];

export function getFirstBootCertification(targetId: string): FirstBootCertification | undefined {
  return FIRST_BOOT_CERTIFICATIONS.find((c) => c.targetId === targetId);
}

export function getMandatoryFirstBootChecks(targetId: string): FirstBootCheck[] {
  const cert = getFirstBootCertification(targetId);
  if (!cert || !cert.applicable) return [];
  return cert.checks.filter((c) => c.mandatory);
}