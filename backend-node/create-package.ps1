# Create deployment package excluding large files
$sourcePath = Get-Location
$zipPath = Join-Path $sourcePath "talos-backend.zip"

# Remove old zip if exists
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

# Get all files except excluded ones
Get-ChildItem -Path $sourcePath -Recurse -File |
    Where-Object {
        $_.FullName -notlike "*\node_modules\*" -and
        $_.Name -ne "talos.db" -and
        $_.FullName -notlike "*\uploads\*" -and
        $_.FullName -notlike "*\.git\*" -and
        $_.Name -ne "talos-backend.zip"
    } |
    ForEach-Object {
        $relativePath = $_.FullName.Substring($sourcePath.Path.Length + 1)
        $null = $relativePath
    }

# Create zip with only source files
$compress = @{
    Path = @(
        ".ebextensions",
        ".platform",
        ".env",
        ".env.example",
        ".gitignore",
        "Procfile",
        "config",
        "database",
        "package.json",
        "package-lock.json",
        "routes",
        "server.js",
        "services"
    )
    DestinationPath = $zipPath
    CompressionLevel = "Optimal"
}
Compress-Archive @compress -Force

Write-Host "Package created: $zipPath"
