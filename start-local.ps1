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

# Start the local server
node local-server.js
