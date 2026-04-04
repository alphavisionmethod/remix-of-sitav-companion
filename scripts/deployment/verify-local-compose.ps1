Write-Host "Verifying local Docker Compose configuration..."
if (-not (Test-Path "docker-compose.yml") -and -not (Test-Path "docker-compose.yaml")) {
  Write-Host "No docker-compose file found — skipping"; exit 0
}
if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
  docker-compose config --quiet 2>&1
  if ($LASTEXITCODE -eq 0) { Write-Host "Docker Compose config valid" } else { Write-Host "Invalid config"; exit 1 }
} else { Write-Host "docker-compose not found" }
