param([string]$Tier = "pilot")
Write-Host "Creating new ISO image for tier: $Tier"
$isoDir = "generated/iso-probe"
if (-not (Test-Path $isoDir)) { New-Item -ItemType Directory -Path $isoDir -Force | Out-Null }
$srcDir = "$isoDir/src"
if (-not (Test-Path $srcDir)) { New-Item -ItemType Directory -Path $srcDir -Force | Out-Null }
Set-Content -Path "$srcDir/hello.txt" -Value "SITA OS"
Write-Host "ISO probe directory prepared at $isoDir"
