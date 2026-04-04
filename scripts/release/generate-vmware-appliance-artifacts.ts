#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — VMware Appliance Artifacts Generator
// Generates OVF, catalog, boot configs for VMware appliance
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { readJsonSafe, writeJsonOutput, envelope } from "../architecture/lib/utils";

const TIERS = ["pilot", "production"];
const ROLES = {
  pilot: ["appliance"],
  production: ["admin", "app", "data", "execution", "governance", "ingress", "observe", "workflow"],
};

for (const tier of TIERS) {
  const tierDir = `generated/vmware-appliance/${tier}`;
  if (!fs.existsSync(tierDir)) fs.mkdirSync(tierDir, { recursive: true });

  const roles = ROLES[tier as keyof typeof ROLES];

  // Generate boot configs for each role
  for (const role of roles) {
    const bootDir = `${tierDir}/boot/${role}`;
    if (!fs.existsSync(bootDir)) fs.mkdirSync(bootDir, { recursive: true });

    // meta-data.yaml
    if (!fs.existsSync(`${bootDir}/meta-data.yaml`)) {
      fs.writeFileSync(`${bootDir}/meta-data.yaml`, `instance-id: sita-os-${tier}-${role}\nlocal-hostname: sita-${role}\n`);
    }

    // network-config.yaml
    if (!fs.existsSync(`${bootDir}/network-config.yaml`)) {
      fs.writeFileSync(`${bootDir}/network-config.yaml`, `version: 2\nethernets:\n  ens192:\n    dhcp4: true\n    dhcp6: false\n`);
    }

    // user-data.yaml
    if (!fs.existsSync(`${bootDir}/user-data.yaml`)) {
      fs.writeFileSync(`${bootDir}/user-data.yaml`, `#cloud-config\npackage_update: true\npackages:\n  - docker.io\n  - docker-compose\nruncmd:\n  - systemctl enable docker\n  - systemctl start docker\n`);
    }
  }

  // bootstrap.sh
  const bootstrapPath = `${tierDir}/boot/bootstrap.sh`;
  if (!fs.existsSync(bootstrapPath)) {
    fs.writeFileSync(bootstrapPath, `#!/bin/sh\nset -e\necho "SITA OS ${tier} bootstrap"\ncd /opt/sita-os\ndocker-compose up -d\necho "Bootstrap complete"\n`);
  }

  // OVF
  const ovfDir = `${tierDir}/ovf`;
  if (!fs.existsSync(ovfDir)) fs.mkdirSync(ovfDir, { recursive: true });
  const ovfPath = `${ovfDir}/sita-os-${tier}.ovf`;
  if (!fs.existsSync(ovfPath)) {
    fs.writeFileSync(ovfPath, `<?xml version="1.0" encoding="UTF-8"?>\n<Envelope xmlns="http://schemas.dmtf.org/ovf/envelope/1">\n  <VirtualSystem ovf:id="sita-os-${tier}">\n    <Name>SITA OS ${tier}</Name>\n    <OperatingSystemSection ovf:id="101"><Description>Ubuntu 22.04</Description></OperatingSystemSection>\n    <VirtualHardwareSection>\n      <System><vssd:VirtualSystemType>vmx-19</vssd:VirtualSystemType></System>\n    </VirtualHardwareSection>\n  </VirtualSystem>\n</Envelope>\n`);
  }

  // Catalog
  const catalog = envelope("1.0.0", {
    tier,
    roles,
    artifacts: {
      ovf: `ovf/sita-os-${tier}.ovf`,
      boot: roles.map(r => `boot/${r}/`),
      bootstrap: "boot/bootstrap.sh",
    },
  });
  writeJsonOutput(`${tierDir}/catalog.json`, catalog);

  // Manifest
  const manifestContent = `Manifest-Version: 1.0\nTier: ${tier}\nRoles: ${roles.join(", ")}\nGenerated: ${new Date().toISOString()}\n`;
  fs.writeFileSync(`${tierDir}/manifest.mf`, manifestContent);

  console.log(`  ✅ ${tier}: ${roles.length} roles, OVF, catalog, manifest`);
}

console.log("✅ VMware appliance artifacts generated");
