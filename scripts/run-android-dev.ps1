# Run from Windows Terminal (PowerShell). Requires: Node.js on Windows, device connected via USB.
# Starts the dev server in a new tab, then runs adb reverse and deploys to the device (localhost:5173 over USB).

$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

# Dev server in new tab
Start-Process wt -ArgumentList "-w", "0", "nt", "-d", $projectRoot, "powershell", "-NoExit", "-Command", "npm run dev"
Start-Sleep -Seconds 4

adb reverse tcp:5173 tcp:5173
$env:CAPACITOR_SERVER_URL = "http://localhost:5173"
Push-Location $projectRoot
try {
    npx cap run android
} finally {
    Pop-Location
}
