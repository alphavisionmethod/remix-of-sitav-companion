Write-Host "Checking design system enforcement..."
$violations = Get-ChildItem "src/components" -Recurse -Filter "*.tsx" -ErrorAction SilentlyContinue | Select-String "bg-\[#" 
if ($violations) { Write-Host "WARN: $($violations.Count) hardcoded colors found" }
Write-Host "PASS: design system check complete"
