$ErrorActionPreference = 'Stop'
$env:PHPRC = "C:\php-8.5"
$env:PATH = $env:PATH + ";C:\php-8.5"
Set-Location $PSScriptRoot
Write-Host "Starting Laravel development server..." -ForegroundColor Green
php artisan serve --host=0.0.0.0 --port=8000