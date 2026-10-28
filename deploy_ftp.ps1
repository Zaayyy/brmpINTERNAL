$ftpHost = "brmpdiy.my.id"
$ftpUser = "belajar@brmpdiy.my.id"
$ftpPass = "belajaradms12"
$remoteBase = "ftp://$ftpHost/public_html/kita.brmpdiy.my.id"
$distDir = "d:\project\AdminWeb\internalBRMP\client\dist"

$wc = New-Object System.Net.WebClient
$wc.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)

Write-Host ">>> DEPLOYING SI-AP BRMP DIY TO CPANEL <<<" -ForegroundColor Cyan

# 1. Upload index.html
Write-Host "1. Uploading index.html..." -ForegroundColor Yellow
$wc.UploadFile("$remoteBase/index.html", "$distDir\index.html")
Write-Host "   [OK] index.html uploaded successfully." -ForegroundColor Green

# 2. Upload assets
Write-Host "2. Uploading assets..." -ForegroundColor Yellow
$assetFiles = Get-ChildItem "$distDir\assets"
foreach ($file in $assetFiles) {
    Write-Host "   -> Uploading $($file.Name)..."
    $wc.UploadFile("$remoteBase/assets/$($file.Name)", $file.FullName)
}

# 3. Upload Backend api.php
Write-Host "3. Uploading php_backend/api.php..." -ForegroundColor Yellow
$wc.UploadFile("$remoteBase/api.php", "d:\project\AdminWeb\internalBRMP\php_backend\api.php")
Write-Host "   [OK] api.php uploaded successfully." -ForegroundColor Green

Write-Host "`n>>> DEPLOYMENT SUKSES 100%! <<<" -ForegroundColor Green
Write-Host "Portal Pegawai : https://kita.brmpdiy.my.id" -ForegroundColor White
Write-Host "Portal Admin   : https://kita.brmpdiy.my.id/admin" -ForegroundColor White
