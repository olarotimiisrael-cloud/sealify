param(
    [string]$Target = 'laravel-app'
)

$ErrorActionPreference = 'Stop'

if (-not (Get-Command php -ErrorAction SilentlyContinue)) {
    throw 'PHP was not found. Add php.exe to PATH or install PHP 8.2+ first.'
}

if (-not (Get-Command composer -ErrorAction SilentlyContinue)) {
    throw 'Composer was not found. Install Composer first.'
}

if (Test-Path $Target) {
    throw "$Target already exists. Remove it or pass a new name: .\setup.ps1 -Target laravel-app2"
}

Write-Host "Creating Laravel application in: $Target"
composer create-project laravel/laravel $Target --remove-vcs --no-interaction | Out-Null

Set-Location $Target
composer require laravel/sanctum --no-interaction | Out-Null
php artisan install:api --no-interaction
php artisan key:generate --force
Set-Location ..

$src = $PSScriptRoot
$dest = Join-Path $src $Target

New-Item -ItemType Directory -Force -Path (Join-Path $dest 'app\Http\Middleware') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $dest 'app\Services') | Out-Null

Copy-Item -Recurse -Force (Join-Path $src 'app\Http\Controllers\Api') (Join-Path $dest 'app\Http\Controllers')
Copy-Item -Force (Join-Path $src 'app\Http\Controllers\Controller.php') (Join-Path $dest 'app\Http\Controllers\Controller.php')
Copy-Item -Force (Join-Path $src 'app\Http\Middleware\ForceJsonResponses.php') (Join-Path $dest 'app\Http\Middleware\ForceJsonResponses.php')
Copy-Item -Force (Join-Path $src 'app\Models\*.php') (Join-Path $dest 'app\Models')
Copy-Item -Force (Join-Path $src 'app\Services\CopilotService.php') (Join-Path $dest 'app\Services\CopilotService.php')
Copy-Item -Force (Join-Path $src 'routes\api.php') (Join-Path $dest 'routes\api.php')
Copy-Item -Force (Join-Path $src 'routes\web.php') (Join-Path $dest 'routes\web.php')
Copy-Item -Force (Join-Path $src 'database\migrations\*.php') (Join-Path $dest 'database\migrations')
Copy-Item -Force (Join-Path $src 'bootstrap\app.php') (Join-Path $dest 'bootstrap\app.php')
Copy-Item -Force (Join-Path $src 'config\cors.php') (Join-Path $dest 'config\cors.php')
Copy-Item -Force (Join-Path $src '.env.example') (Join-Path $dest '.env.sealify.example')
Copy-Item -Force (Join-Path $src 'tests\SealifyApiTest.php') (Join-Path $dest 'tests\Feature\SealifyApiTest.php')

Write-Host "Sealify Laravel backend is ready in $Target"
Write-Host "Next: configure $Target/.env, then run: php artisan migrate"
