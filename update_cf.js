const { execSync } = require('child_process');
const fs = require('fs');

console.log("Fetching config...");
// Fetch config directly to memory to avoid encoding issues with file I/O
const json = execSync('aws cloudfront get-distribution-config --id E3IMJUISUQ2J81 --output json --no-cli-pager', { encoding: 'utf8' });
const config = JSON.parse(json);
const distConfig = config.DistributionConfig;
const backendOriginId = 'TalosBackend';

// 1. Add Custom Origin for Backend
const origin = {
    Id: backendOriginId,
    DomainName: 'talos-hvac-backend-env.us-east-1.elasticbeanstalk.com',
    CustomHeaders: { Quantity: 0 },
    CustomOriginConfig: {
        HTTPPort: 80,
        HTTPSPort: 443,
        OriginProtocolPolicy: 'http-only',
        OriginSslProtocols: {
            Quantity: 1,
            Items: ['TLSv1.2']
        },
        OriginReadTimeout: 30,
        OriginKeepaliveTimeout: 5
    },
    ConnectionAttempts: 3,
    ConnectionTimeout: 10,
    OriginShield: { Enabled: false },
    OriginPath: ''
};

// Check if origin already exists
const existingOriginIndex = distConfig.Origins.Items.findIndex(o => o.Id === backendOriginId);
if (existingOriginIndex >= 0) {
    distConfig.Origins.Items[existingOriginIndex] = origin;
} else {
    distConfig.Origins.Items.push(origin);
    distConfig.Origins.Quantity += 1;
}

// 2. Add Cache Behavior for /api/*
const apiBehavior = {
    PathPattern: '/api/*',
    TargetOriginId: backendOriginId,
    ViewerProtocolPolicy: 'redirect-to-https',
    AllowedMethods: {
        Quantity: 7,
        Items: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'PATCH', 'POST', 'DELETE'],
        CachedMethods: {
            Quantity: 2,
            Items: ['GET', 'HEAD']
        }
    },
    Compress: true,
    CachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad', // Managed-CachingDisabled
    OriginRequestPolicyId: '216adef6-5c7f-47e4-b989-5492eafa07d3', // Managed-AllViewer
    SmoothStreaming: false,
    FieldLevelEncryptionId: '',
    LambdaFunctionAssociations: { Quantity: 0 },
    FunctionAssociations: { Quantity: 0 },
    TrustedSigners: { Enabled: false, Quantity: 0 },
    TrustedKeyGroups: { Enabled: false, Quantity: 0 }
};

if (!distConfig.CacheBehaviors) {
    distConfig.CacheBehaviors = { Quantity: 0, Items: [] };
}

// Remove existing /api/* behavior if any
distConfig.CacheBehaviors.Items = (distConfig.CacheBehaviors.Items || []).filter(b => b.PathPattern !== '/api/*');
distConfig.CacheBehaviors.Items.unshift(apiBehavior); // Add to top
distConfig.CacheBehaviors.Quantity = distConfig.CacheBehaviors.Items.length;

// Save modified config
fs.writeFileSync('updated_config.json', JSON.stringify(distConfig, null, 2));
console.log('ETag:', config.ETag);
console.log('Updated configuration saved to updated_config.json');

// Execute update
console.log('Updating CloudFront distribution...');
execSync(`aws cloudfront update-distribution --id E3IMJUISUQ2J81 --if-match ${config.ETag} --distribution-config file://updated_config.json --no-cli-pager`, { stdio: 'inherit' });
console.log('✅ CloudFront update initiated.');
