# Ensure local Node/npm tools are available in this session
$npmPath = "$env:APPDATA\npm"
$codexNodePath = "C:\Users\THE~SEAL CW LTD\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin"
foreach ($p in @($npmPath, $codexNodePath)) {
  if (Test-Path $p) {
    $env:PATH = "$p;$env:PATH"
  }
}

# Load environment variables from .env file
$envFile = ".env"
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
      $key = $matches[1].Trim()
      $val = $matches[2].Trim()
      Set-Item -Path "env:$key" -Value $val
    }
  }
}

Write-Host "Using Node: $(node -v)"
Write-Host "Using npm: $(npm -v)"
Write-Host "Starting Vite dev server on http://localhost:5173"

npm run dev -- --host 0.0.0.0
