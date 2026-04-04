# Run this in PowerShell AS ADMINISTRATOR (once per session or after reboot).
# Forwards Windows port 5173 to localhost:5173 so when the phone hits http://YOUR_IP:5173
# it reaches the dev server running in WSL.
# Requires: dev server already running in WSL (npm run dev).

$port = 5173
# Remove existing rule if present
netsh interface portproxy delete v4tov4 listenport=$port listenaddress=0.0.0.0 2>$null
# Forward inbound 5173 to localhost:5173 (Windows then forwards localhost to WSL)
netsh interface portproxy add v4tov4 listenport=$port listenaddress=0.0.0.0 connectport=$port connectaddress=127.0.0.1
# Allow inbound TCP 5173 through Windows Firewall
New-NetFirewallRule -DisplayName "Vite dev 5173" -Direction Inbound -Protocol TCP -LocalPort $port -Action Allow -ErrorAction SilentlyContinue
Write-Host "Port $port forwarded. Phone can use http://YOUR_PC_IP:5173 (e.g. http://192.168.1.4:5173)"
Write-Host "Run 'npm run dev' in WSL and keep it running."
