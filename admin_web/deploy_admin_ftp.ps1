# ==============================================================================
# SCRIPT DEPLOYMENT STANDALONE ADMIN PORTAL KE CPANEL FTP
# ==============================================================================

param(
    [string]$TargetFolder = "public_html/kita.brmpdiy.my.id/admin_dist"
)

$ftpHost = "brmpdiy.my.id"
$ftpUser = "belajar@brmpdiy.my.id"
$ftpPass = "belajaradms12"
$remoteBase = "ftp://$ftpHost/$TargetFolder"
$distDir = "$PSScriptRoot\dist"

Write-Host ">>> BUILD & DEPLOY STANDALONE ADMIN BRMP DIY <<<" -ForegroundColor Cyan

# 1. Build project
Write-Host "1. Building production bundle (npm run build)..." -ForegroundColor Yellow
cmd.exe /c "npm run build"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Build gagal!" -ForegroundColor Red
    exit 1
}

$wc = New-Object System.Net.WebClient
$wc.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)

# 2. Upload index.html
Write-Host "2. Uploading index.html ke $remoteBase..." -ForegroundColor Yellow
try {
    $wc.UploadFile("$remoteBase/index.html", "$distDir\index.html")
    Write-Host "   [OK] index.html uploaded." -ForegroundColor Green
} catch {
    Write-Host "   [WARN] Gagal upload index.html: $_" -ForegroundColor Red
}

# 3. Upload assets
Write-Host "3. Uploading assets..." -ForegroundColor Yellow
$assetFiles = Get-ChildItem "$distDir\assets"
foreach ($file in $assetFiles) {
    Write-Host "   -> Uploading $($file.Name)..."
    try {
        $wc.UploadFile("$remoteBase/assets/$($file.Name)", $file.FullName)
    } catch {
        Write-Host "   [WARN] Gagal upload $($file.Name): $_" -ForegroundColor Red
    }
}

Write-Host "`n>>> DEPLOYMENT ADMIN SELESAI! <<<" -ForegroundColor Green
