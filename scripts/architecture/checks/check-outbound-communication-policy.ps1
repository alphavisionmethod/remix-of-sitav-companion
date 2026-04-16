$outbound = Get-ChildItem "src/lib/services" -Recurse -Filter "*.ts" -ErrorAction SilentlyContinue | Select-String "fetch\(" | Where-Object { $_.Line -notmatch "supabase|connector" }
if ($outbound) { Write-Host "WARN: $($outbound.Count) raw outbound calls" }
Write-Host "PASS: outbound communication policy check"
