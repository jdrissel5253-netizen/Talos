Set-Location $PSScriptRoot

# Create temp directory
$tempDir = Join-Path $env:TEMP 'talos-deploy-temp'
Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

# Copy directories
Copy-Item -Recurse 'config' -Destination $tempDir
Copy-Item -Recurse 'database' -Destination $tempDir
Copy-Item -Recurse 'routes' -Destination $tempDir
Copy-Item -Recurse 'services' -Destination $tempDir
Copy-Item -Recurse '.ebextensions' -Destination $tempDir
Copy-Item -Recurse '.platform' -Destination $tempDir

# Copy files
Copy-Item 'package.json' -Destination $tempDir
Copy-Item 'package-lock.json' -Destination $tempDir
Copy-Item 'server.js' -Destination $tempDir
Copy-Item 'Procfile' -Destination $tempDir

# Create zip from temp directory contents
Remove-Item -Force 'talos-backend-deploy.zip' -ErrorAction SilentlyContinue
Compress-Archive -Path "$tempDir\*" -DestinationPath 'talos-backend-deploy.zip' -Force

# Cleanup
Remove-Item -Recurse -Force $tempDir

Write-Output "Zip created:"
Get-Item 'talos-backend-deploy.zip' | Format-List Name, Length
