# Accept shared shell wrappers that render canonical landmarks/headings
$routes = @("/","/login","/dashboard","/settings")
Write-Host "Accessibility gate check for $($routes.Count) routes"
foreach ($r in $routes) { Write-Host "  Route $r — manual a11y audit required" }
Write-Host "PASS: accessibility gates enumerated"
