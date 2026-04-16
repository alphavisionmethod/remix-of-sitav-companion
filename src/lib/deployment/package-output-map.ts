// ═══════════════════════════════════════════════════════════════
// SITA OS — Package Output Map
// Build artifacts: web assets, Electron packages, ISO/OVA, etc.
// ═══════════════════════════════════════════════════════════════

export type ArtifactFormat = "static-files" | "docker-image" | "electron-package" | "iso" | "ova" | "deno-deploy" | "config-file";

export interface PackageOutput {
  id: string;
  deploymentUnitId: string;
  format: ArtifactFormat;
  outputPath: string;
  description: string;
  platforms: string[];
  sizeEstimate: string;
  signingRequired: boolean;
}

export const PACKAGE_OUTPUTS: readonly PackageOutput[] = [
  { id: "pkg-web-dist", deploymentUnitId: "web-frontend", format: "static-files", outputPath: "dist/", description: "Vite production build output (HTML, JS, CSS, assets)", platforms: ["web"], sizeEstimate: "~5-15MB", signingRequired: false },
  { id: "pkg-edge-deploy", deploymentUnitId: "edge-functions", format: "deno-deploy", outputPath: "supabase/functions/", description: "Edge function bundles deployed to Supabase", platforms: ["edge"], sizeEstimate: "~1-5MB", signingRequired: false },
  { id: "pkg-electron-win", deploymentUnitId: "electron-desktop", format: "electron-package", outputPath: "electron-release/SitaOS-win32-x64/", description: "Windows x64 Electron package", platforms: ["win32-x64"], sizeEstimate: "~150-200MB", signingRequired: true },
  { id: "pkg-electron-mac", deploymentUnitId: "electron-desktop", format: "electron-package", outputPath: "electron-release/SitaOS-darwin-x64/", description: "macOS x64 Electron package", platforms: ["darwin-x64", "darwin-arm64"], sizeEstimate: "~150-200MB", signingRequired: true },
  { id: "pkg-electron-linux", deploymentUnitId: "electron-desktop", format: "electron-package", outputPath: "electron-release/SitaOS-linux-x64/", description: "Linux x64 Electron package", platforms: ["linux-x64"], sizeEstimate: "~150-200MB", signingRequired: false },
  { id: "pkg-nginx-image", deploymentUnitId: "nginx-proxy", format: "docker-image", outputPath: "Docker registry", description: "Nginx Docker image with SITA config", platforms: ["linux-amd64"], sizeEstimate: "~30MB", signingRequired: false },
  { id: "pkg-appliance-iso", deploymentUnitId: "appliance-iso", format: "iso", outputPath: "output/sita-appliance.iso", description: "Bootable ISO for bare-metal/VM deployment", platforms: ["x86_64"], sizeEstimate: "~500MB-1GB", signingRequired: true },
  { id: "pkg-appliance-ova", deploymentUnitId: "appliance-iso", format: "ova", outputPath: "output/sita-appliance.ova", description: "OVA image for VMware/VirtualBox import", platforms: ["x86_64"], sizeEstimate: "~500MB-1GB", signingRequired: true },
] as const;

export function getPackageOutputs(unitId: string): PackageOutput[] {
  return PACKAGE_OUTPUTS.filter((p) => p.deploymentUnitId === unitId);
}

export function getPackagesByFormat(format: ArtifactFormat): PackageOutput[] {
  return PACKAGE_OUTPUTS.filter((p) => p.format === format);
}
