# Fetch ARN Dynamically
$certArn = (aws acm list-certificates --region us-east-1 --query "CertificateSummaryList[?DomainName=='gotalos.io'].CertificateArn" --output text).Trim()

Write-Host "Found Certificate ARN: $certArn"

if (-not $certArn) {
    Write-Error "Could not find certificate for gotalos.io"
    exit 1
}

# Read the JSON
$json = Get-Content -Raw cf_config.json | ConvertFrom-Json

# Extract ETag
$etag = $json.ETag

# Modify DistributionConfig
$config = $json.DistributionConfig

# 1. Update Aliases
$config.Aliases = @{
    Quantity = 2
    Items = @("gotalos.io", "www.gotalos.io")
}

# 2. Update ViewerCertificate
$config.ViewerCertificate = @{
    ACMCertificateArn = $certArn
    SSLSupportMethod = "sni-only"
    MinimumProtocolVersion = "TLSv1.2_2021"
    CertificateSource = "acm"
}

# Save just the DistributionConfig to a new file
$config | ConvertTo-Json -Depth 10 | Out-File -Encoding ascii updated_config.json

# Output ETag
Write-Output "ETag: $etag"
