# Script to update CloudFront Origin to the healthy backend

$ErrorActionPreference = "Stop"

# 1. Get Healthy Backend CNAME
Write-Host "Fetching healthy backend CNAME..."
$envName = "Talos-backend-v2-env-1"
$cname = (aws elasticbeanstalk describe-environments --environment-names $envName --query "Environments[0].CNAME" --output text).Trim()

if (-not $cname) {
    Write-Error "Could not find CNAME for environment $envName"
    exit 1
}

Write-Host "Healthy Backend CNAME: $cname"

# 2. Get CloudFront Distribution ID
# We assume there is only one relevant distribution or we pick the one for gotalos.io
Write-Host "Finding CloudFront Distribution for gotalos.io..."
$distId = (aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items!=null] | [?contains(Aliases.Items, 'gotalos.io')].Id" --output text).Trim()

if (-not $distId) {
    Write-Error "Could not find CloudFront distribution for gotalos.io"
    exit 1
}
Write-Host "Found Distribution ID: $distId"

# 3. Get Current Config
Write-Host "Fetching current CloudFront config..."
aws cloudfront get-distribution-config --id $distId > cf_current_config.json

# 4. Process Config with PowerShell
$json = Get-Content -Raw cf_current_config.json | ConvertFrom-Json
$etag = $json.ETag.Trim()
$config = $json.DistributionConfig

# Update Origin
# Assuming we want to update the first origin or the one that looks like an EB environment
# in this case, we likely only have one custom origin or we replace the one that was pointing to the old env
$targetOriginParams = $config.Origins.Items[0]
Write-Host "Current Origin Domain: $($targetOriginParams.DomainName)"


Write-Host "Updating Origin Domain to: $cname"
$targetOriginParams.DomainName = $cname

# Ensure correct port and protocol for Elastic Beanstalk (HTTP on port 80)
Write-Host "Enforcing Port 80 and HTTP Only..."
$targetOriginParams.CustomOriginConfig.HTTPPort = 80
$targetOriginParams.CustomOriginConfig.HTTPSPort = 443
$targetOriginParams.CustomOriginConfig.OriginProtocolPolicy = "http-only"
$targetOriginParams.CustomOriginConfig.OriginSslProtocols = @{
    Quantity = 3
    Items = @("TLSv1", "TLSv1.1", "TLSv1.2")
}


# IMPORTANT: AWS CLI expects the input to be just the DistributionConfig, not the wrapper with ETag
# We also need to be careful with JSON depth and structure
$config | ConvertTo-Json -Depth 10 | Out-File -Encoding ascii updated_cf_config.json

# 5. Update Distribution
Write-Host "Updating CloudFront Distribution..."
# We must provide the If-Match header with the ETag
aws cloudfront update-distribution --id $distId --distribution-config file://updated_cf_config.json --if-match $etag

Write-Host "Update initiated successfully."
