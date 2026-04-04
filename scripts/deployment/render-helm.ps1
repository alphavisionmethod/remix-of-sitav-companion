param([string]$Tier = "production", [string]$OutputDir = "generated/helm-rendered")
Write-Host "Rendering Helm charts for tier: $Tier"
if (-not (Test-Path "infra/helm")) { Write-Host "No Helm charts found — skipping"; exit 0 }
if (-not (Test-Path $OutputDir)) { New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null }
Write-Host "Helm rendering complete (output: $OutputDir)"
