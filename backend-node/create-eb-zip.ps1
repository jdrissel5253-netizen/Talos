Set-Location $PSScriptRoot

# Create a temp directory with proper structure
$tempDir = Join-Path $env:TEMP 'talos-eb-deploy'
Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

# Copy files to temp directory (this preserves the structure)
Copy-Item 'server.js' -Destination $tempDir
Copy-Item 'package.json' -Destination $tempDir
Copy-Item 'package-lock.json' -Destination $tempDir
Copy-Item 'Procfile' -Destination $tempDir
Copy-Item -Recurse 'routes' -Destination $tempDir
Copy-Item -Recurse 'services' -Destination $tempDir
Copy-Item -Recurse 'config' -Destination $tempDir
Copy-Item -Recurse 'database' -Destination $tempDir
Copy-Item -Recurse '.ebextensions' -Destination $tempDir
Copy-Item -Recurse '.platform' -Destination $tempDir

# Create zip from the temp directory using .NET
Remove-Item -Force 'talos-backend.zip' -ErrorAction SilentlyContinue
Add-Type -Assembly 'System.IO.Compression.FileSystem'
$zipPath = Join-Path (Get-Location) 'talos-backend.zip'
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $zipPath)

# Cleanup
Remove-Item -Recurse -Force $tempDir

Write-Output "Zip created:"
Get-Item 'talos-backend.zip' | Format-List Name, Length
