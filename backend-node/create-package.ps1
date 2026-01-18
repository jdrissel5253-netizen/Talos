# Create deployment package using Python for reliable cross-platform zip format (forward slashes)
$sourcePath = Get-Location
$scriptPath = Join-Path $sourcePath "create_package.py"

Write-Host "Running Python packaging script..."
python $scriptPath

if ($LASTEXITCODE -eq 0) {
    Write-Host "Package created successfully."
} else {
    Write-Error "Failed to create package. Exit code: $LASTEXITCODE"
    exit 1
}
