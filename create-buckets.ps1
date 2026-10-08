$supabaseUrl = "https://eliwjdafimaugnwvadlr.supabase.co"
$anonKey = "sb_publishable_h4te__ofhyf2Ou5uALG-Sw_lsKjDQR7"

$buckets = @(
    @{ id = "profile-media"; name = "profile-media"; public = $true; fileSizeLimit = 5242880 },
    @{ id = "ad-images"; name = "ad-images"; public = $true; fileSizeLimit = 10485760 },
    @{ id = "ad-videos"; name = "ad-videos"; public = $true; fileSizeLimit = 52428800 },
    @{ id = "documents"; name = "documents"; public = $false; fileSizeLimit = 10485760 },
    @{ id = "messages"; name = "messages"; public = $false; fileSizeLimit = $null }
)

Write-Host "Creating Supabase storage buckets..." -ForegroundColor Cyan

foreach ($bucket in $buckets) {
    Write-Host "Processing bucket: $($bucket.id)" -ForegroundColor Yellow
    
    $body = @{
        id = $bucket.id
        name = $bucket.name
        public = $bucket.public
    } | ConvertTo-Json

    $headers = @{
        "apikey" = $anonKey
        "Authorization" = "Bearer $anonKey"
        "Content-Type" = "application/json"
    }
    
    try {
        $result = Invoke-RestMethod -Uri "$supabaseUrl/storage/v1/bucket" -Method POST -Headers $headers -Body $body
        Write-Host "  Created: $($bucket.id)" -ForegroundColor Green
    }
    catch {
        $msg = $_.ErrorDetails.Message
        if ($msg -match "already exists") {
            Write-Host "  Already exists: $($bucket.id)" -ForegroundColor Gray
        }
        else {
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "Verifying buckets..." -ForegroundColor Cyan
try {
    $listResult = Invoke-RestMethod -Uri "$supabaseUrl/storage/v1/bucket" -Method GET -Headers $headers
    Write-Host "Current buckets:" -ForegroundColor Green
    Write-Host ($listResult | ConvertTo-Json -Depth 5)
}
catch {
    Write-Host "Could not list buckets: $($_.Exception.Message)" -ForegroundColor Yellow
}