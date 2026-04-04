$manifests = Get-ChildItem "generated/*.json" -ErrorAction SilentlyContinue
$total = $manifests.Count; $valid = 0
foreach ($m in $manifests) {
  try { Get-Content $m.FullName | ConvertFrom-Json | Out-Null; $valid++ } catch {}
}
Write-Host "Coverage: $valid/$total generated files valid"
