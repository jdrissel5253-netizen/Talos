
$ErrorActionPreference = "Stop"

# Find Distribution ID
Write-Host "Finding CloudFront Distribution for gotalos.io..."
$distId = (aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items!=null] | [?contains(Aliases.Items, 'gotalos.io')].Id" --output text).Trim()

if (-not $distId) {
    Write-Error "Could not find CloudFront distribution for gotalos.io"
    exit 1
}
Write-Host "Found Distribution ID: $distId"

# Get Config
aws cloudfront get-distribution-config --id $distId > temp_cf_check.json

$json = Get-Content -Raw temp_cf_check.json | ConvertFrom-Json
$origin = $json.DistributionConfig.Origins.Items[0]

Write-Host "Current Origin Domain: $($origin.DomainName)"
Write-Host "Current Origin Port: $($origin.CustomOriginConfig.HTTPPort)"
Write-Host "Current Origin Protocol: $($origin.CustomOriginConfig.OriginProtocolPolicy)"

# Get Healthy Backend CNAME
$envName = "Talos-backend-v2-env-1"
$cname = (aws elasticbeanstalk describe-environments --environment-names $envName --query "Environments[0].CNAME" --output text).Trim()
Write-Host "Target Backend CNAME: $cname"
