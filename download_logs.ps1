
$ErrorActionPreference = "Stop"
try {
    $jsonContent = Get-Content eb_logs_url.json | ConvertFrom-Json
    $url = $jsonContent.EnvironmentInfo[0].Message
    Write-Host "Downloading logs from: $url"
    Invoke-WebRequest -Uri $url -OutFile logs.zip
    Write-Host "Download complete. Extracting..."
    Expand-Archive -Path logs.zip -DestinationPath ./logs -Force
    Write-Host "Extraction complete."
} catch {
    Write-Error $_
}
